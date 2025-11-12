.PHONY: dev seed test up down

dev:
	cd apps/scholarpath && npm install && npm run dev

seed:
	psql $$SUPABASE_DB_DSN -f supabase/schema.sql

test:
	cd apps/scholarpath && npm run test
	cd apps/scholarharvester && poetry run pytest

up:
	docker compose up -d

down:
	docker compose down
