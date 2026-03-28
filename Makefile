.PHONY: dev seed test up down institutions-migrate institutions-sync

dev:
	cd apps/scholarpath && npm install && npm run dev

seed:
	psql $$SUPABASE_DB_DSN -f supabase/schema.sql

institutions-migrate:
	psql $$SUPABASE_DB_DSN -f supabase/institution_migration.sql

institutions-sync:
	cd apps/scholarharvester && poetry run scholarharvester institutions sync-scorecard --max-records 3500

test:
	cd apps/scholarpath && npm run test
	cd apps/scholarharvester && poetry run pytest

up:
	docker compose up -d

down:
	docker compose down
