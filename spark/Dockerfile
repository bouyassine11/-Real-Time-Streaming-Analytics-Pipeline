FROM eclipse-temurin:17-jre-jammy

# Install Python and pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-dev procps && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

# Download and install Spark
ENV SPARK_VERSION=3.5.1
ENV SPARK_HOME=/opt/spark
RUN curl -sL "https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz" \
      | tar xz -C /opt && \
    mv /opt/spark-${SPARK_VERSION}-bin-hadoop3 /opt/spark && \
    chown -R root:root /opt/spark

ENV PATH="${SPARK_HOME}/bin:${SPARK_HOME}/sbin:${PATH}"

# Install Python dependencies
# Download PostgreSQL JDBC driver into Spark's jars dir so DriverManager can find it
RUN curl -sL -o "${SPARK_HOME}/jars/postgresql-42.7.3.jar" \
    "https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar"

# Install Python dependencies
RUN pip install --no-cache-dir \
    pyspark==3.5.1 \
    psycopg2-binary==2.9.9

WORKDIR /app

COPY streaming_job.py .

CMD ["spark-submit", \
     "--master", "local[*]", \
     "--packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.7.3", \
     "--driver-memory", "1g", \
     "streaming_job.py"]
