FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

WORKDIR /app

RUN apt-get update \
    && apt-get install gcc -y \
    && apt-get clean

RUN pip install poetry==1.3.1
COPY poetry.lock pyproject.toml .
RUN poetry export -o requirements.txt
RUN pip install -r requirements.txt && rm -rf /root/.cache/pip

COPY . .