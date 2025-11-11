.PHONY: dev seed test up down

dev:
	docker compose up -d postgres redis
	docker compose up --build scholarapi scholarplanner

seed:
	docker compose run --rm scholarharvester poetry run scholarharvester-seed

test:
	docker compose run --rm scholarharvester poetry run pytest
	docker compose run --rm scholarapi poetry run pytest
	cd apps/scholarplanner && npm run test

up:
	docker compose up -d

down:
	docker compose down
