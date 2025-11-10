FROM python:3.11-slim

WORKDIR /app

ENV POETRY_VERSION=1.7.1
RUN pip install "poetry==$POETRY_VERSION"

COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-root --only main

COPY src ./src

CMD ["uvicorn", "scholarapi.main:app", "--host", "0.0.0.0", "--port", "8080"]
