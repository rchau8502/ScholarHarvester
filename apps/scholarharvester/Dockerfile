FROM python:3.11-slim

ENV POETRY_VIRTUALENVS_CREATE=false PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/
RUN pip install --upgrade pip && pip install poetry
RUN poetry install --no-root

COPY . /app
CMD ["tail", "-f", "/dev/null"]
