#!/usr/bin/env python3
"""
PySpark Structured Streaming Job (Local Mode)
Single streaming query that reads from Kafka, parses events,
performs all windowed aggregations in foreachBatch, and writes to PostgreSQL.
"""

import os

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType
)

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:29092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "clickstream_events")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "clickstream")
POSTGRES_USER = os.getenv("POSTGRES_USER", "clickstream_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "clickstream_pass")

JDBC_URL = f"jdbc:postgresql://{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
JDBC_PROPERTIES = {
    "user": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "driver": "org.postgresql.Driver",
}

EVENT_SCHEMA = StructType([
    StructField("event_id", StringType(), True),
    StructField("user_id", StringType(), True),
    StructField("session_id", StringType(), True),
    StructField("event_type", StringType(), True),
    StructField("product_id", StringType(), True),
    StructField("category", StringType(), True),
    StructField("page_url", StringType(), True),
    StructField("referrer", StringType(), True),
    StructField("device", StringType(), True),
    StructField("browser", StringType(), True),
    StructField("price", DoubleType(), True),
    StructField("timestamp", StringType(), True),
])

WINDOW_SIZE = "1 minute"
SLIDE_SIZE = "1 minute"
WATERMARK_DELAY = "2 minutes"


def create_spark_session():
    return (
        SparkSession.builder
        .appName("ClickstreamStreamingJob")
        .master("local[*]")
        .config("spark.jars.packages",
                "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,"
                "org.postgresql:postgresql:42.7.3")
        .config("spark.sql.streaming.schemaInference", "true")
        .config("spark.driver.memory", "1g")
        .getOrCreate()
    )


def _upsert_batch(batch_df: DataFrame, batch_id: int):
    """Single foreachBatch: do all 6 writes to PostgreSQL."""
    if batch_df.isEmpty():
        return

    print(f"Processing batch {batch_id} with {batch_df.count()} rows", flush=True)

    events = (
        batch_df
        .select(F.from_json(F.col("value").cast("string"), EVENT_SCHEMA).alias("data"))
        .select("data.*")
        .withColumn("event_timestamp", F.to_timestamp("timestamp"))
    )

    if events.isEmpty():
        return

    jvm = events.sparkSession._jvm
    jvm.java.lang.Class.forName("org.postgresql.Driver")
    conn = jvm.java.sql.DriverManager.getConnection(
        JDBC_URL, POSTGRES_USER, POSTGRES_PASSWORD
    )
    conn.setAutoCommit(False)

    try:
        _write_events_per_minute(events, conn)
        _write_top_categories(events, conn)
        _write_conversion_funnel(events, conn)
        _write_revenue(events, conn)
        _write_device_breakdown(events, conn)
        _write_raw_events(events, conn)
        print(f"Batch {batch_id} written successfully", flush=True)
    except Exception as e:
        print(f"Error in batch {batch_id}: {e}", flush=True)
    finally:
        conn.close()


def _upsert_agg(df: DataFrame, table: str, pk_cols: list, conn):
    """Delete rows matching PK range in batch, then insert."""
    if df.isEmpty():
        return

    min_val = df.select(F.min(pk_cols[0])).collect()[0][0]
    max_val = df.select(F.max(pk_cols[0])).collect()[0][0]
    if min_val is None:
        return

    stmt = conn.createStatement()
    sql = f"DELETE FROM {table} WHERE {pk_cols[0]} >= '{min_val}' AND {pk_cols[0]} <= '{max_val}'"
    stmt.executeUpdate(sql)
    conn.commit()

    df.write.mode("append").jdbc(JDBC_URL, table, properties=JDBC_PROPERTIES)


def _write_events_per_minute(events, conn):
    df = (
        events
        .withWatermark("event_timestamp", WATERMARK_DELAY)
        .groupBy(F.window("event_timestamp", WINDOW_SIZE, SLIDE_SIZE), "event_type")
        .agg(F.count("*").alias("event_count"))
        .select(
            F.col("window.start").alias("window_start"),
            F.col("window.end").alias("window_end"),
            "event_type", "event_count",
        )
    )
    _upsert_agg(df, "agg_events_per_minute", ["window_start"], conn)


def _write_top_categories(events, conn):
    df = (
        events
        .withWatermark("event_timestamp", WATERMARK_DELAY)
        .groupBy(F.window("event_timestamp", WINDOW_SIZE, SLIDE_SIZE), "category")
        .agg(
            F.sum(F.when(F.col("event_type") == "page_view", 1).otherwise(0)).alias("view_count"),
            F.sum(F.when(F.col("event_type") == "purchase", 1).otherwise(0)).alias("purchase_count"),
            F.sum(F.when(F.col("event_type") == "purchase", F.col("price")).otherwise(0.0)).alias("total_revenue"),
        )
        .select(
            F.col("window.start").alias("window_start"),
            F.col("window.end").alias("window_end"),
            "category", "view_count", "purchase_count", "total_revenue",
        )
    )
    _upsert_agg(df, "agg_top_categories", ["window_start"], conn)


def _write_conversion_funnel(events, conn):
    df = (
        events
        .withWatermark("event_timestamp", WATERMARK_DELAY)
        .groupBy(
            F.window("event_timestamp", WINDOW_SIZE, SLIDE_SIZE),
            F.when(F.col("event_type") == "page_view", F.lit("page_view"))
             .when(F.col("event_type") == "add_to_cart", F.lit("add_to_cart"))
             .when(F.col("event_type") == "purchase", F.lit("purchase"))
             .otherwise(F.lit("other")).alias("stage"),
        )
        .agg(F.count("*").alias("user_count"))
        .filter(F.col("stage") != "other")
        .select(
            F.col("window.start").alias("window_start"),
            F.col("window.end").alias("window_end"),
            "stage", "user_count",
        )
    )
    _upsert_agg(df, "agg_conversion_funnel", ["window_start"], conn)


def _write_revenue(events, conn):
    purchases = events.filter(F.col("event_type") == "purchase")
    if purchases.isEmpty():
        return
    df = (
        purchases
        .withWatermark("event_timestamp", WATERMARK_DELAY)
        .groupBy(F.window("event_timestamp", WINDOW_SIZE, SLIDE_SIZE))
        .agg(
            F.sum("price").alias("total_revenue"),
            F.count("*").alias("purchase_count"),
            F.avg("price").alias("avg_order_value"),
        )
        .select(
            F.col("window.start").alias("window_start"),
            F.col("window.end").alias("window_end"),
            "total_revenue", "purchase_count", "avg_order_value",
        )
    )
    _upsert_agg(df, "agg_revenue", ["window_start"], conn)


def _write_device_breakdown(events, conn):
    df = (
        events
        .withWatermark("event_timestamp", WATERMARK_DELAY)
        .groupBy(F.window("event_timestamp", WINDOW_SIZE, SLIDE_SIZE), "device")
        .agg(F.count("*").alias("event_count"))
        .select(
            F.col("window.start").alias("window_start"),
            F.col("window.end").alias("window_end"),
            "device", "event_count",
        )
    )
    _upsert_agg(df, "agg_device_breakdown", ["window_start"], conn)


def _write_raw_events(events, conn):
    raw = events.select(
        "event_id", "user_id", "session_id", "event_type",
        "product_id", "category", "page_url", "referrer",
        "device", "price", F.col("event_timestamp").alias("timestamp"),
    )
    raw.write.mode("append").jdbc(JDBC_URL, "raw_events", properties=JDBC_PROPERTIES)


def main():
    print("Starting PySpark Structured Streaming job (local mode)...", flush=True)
    print(f"Kafka: {KAFKA_BROKER}, Topic: {KAFKA_TOPIC}", flush=True)
    print(f"PostgreSQL: {JDBC_URL}", flush=True)

    spark = create_spark_session()
    spark.sparkContext.setLogLevel("WARN")

    raw_stream = (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BROKER)
        .option("subscribe", KAFKA_TOPIC)
        .option("startingOffsets", "latest")
        .option("failOnDataLoss", "false")
        .load()
    )

    query = (
        raw_stream.writeStream
        .foreachBatch(_upsert_batch)
        .option("checkpointLocation", "/tmp/checkpoints/main")
        .trigger(processingTime="10 seconds")
        .start()
    )

    print("Started streaming query. Waiting for termination...", flush=True)
    spark.streams.awaitAnyTermination()


if __name__ == "__main__":
    main()
