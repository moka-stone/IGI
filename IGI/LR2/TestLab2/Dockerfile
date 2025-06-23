FROM python:3.9-slim

WORKDIR /app

COPY main.py /app/main.py
RUN apt-get update && apt-get install -y git && \
    git clone https://github.com/smartiqaorg/geometric_lib.git /app/geometric_lib

CMD ["python", "/app/main.py"]