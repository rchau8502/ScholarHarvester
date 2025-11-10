SHELL := /bin/bash

.PHONY: dev up down test seed api-tests harvester-tests web-tests migrate

COMPOSE := docker-compose

up:
$(COMPOSE) up -d

down:
$(COMPOSE) down

logs:
$(COMPOSE) logs -f

dev: up
$(COMPOSE) logs -f scholarapi scholarpath

migrate:
cd apps/scholarharvester && poetry run alembic upgrade head

seed:
cd apps/scholarharvester && poetry run scholarharvester seed demo

harvester-tests:
cd apps/scholarharvester && poetry run pytest

api-tests:
cd apps/scholarapi && poetry run pytest

web-tests:
cd apps/scholarpath && pnpm test

playwright:
cd apps/scholarpath && pnpm exec playwright test

test: harvester-tests api-tests web-tests

format:
cd apps/scholarharvester && poetry run ruff format . && poetry run ruff check .
cd apps/scholarapi && poetry run ruff format . && poetry run ruff check .
cd apps/scholarpath && pnpm lint --fix
