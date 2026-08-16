FROM bitnami/spark:3.5

USER root

RUN pip install --no-cache-dir \
    psycopg2-binary==2.9.9 \
    psycopg2==2.9.9

USER 1001

COPY streaming_job.py /app/streaming_job.py

WORKDIR /app

CMD ["spark-submit", \
     "--master", "spark://spark-master:7077", \
     "--deploy-mode", "client", \
     "--jars", "/opt/bitnami/spark/jars/*", \
     "streaming_job.py"]
