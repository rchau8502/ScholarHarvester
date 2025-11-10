FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/
RUN pip install --upgrade pip && pip install poetry
RUN poetry install --no-root --only main

COPY . /app

CMD ["poetry", "run", "uvicorn", "scholarapi.main:app", "--host", "0.0.0.0", "--port", "8080"]
