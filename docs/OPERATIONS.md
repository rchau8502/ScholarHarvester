# Scholarstack Operations Guide

This guide captures the canonical commands for running Scholarstack locally in development mode and in a production-like environment. It supplements the top-level README quickstart.

## Development workflow

Use the provided Make targets to orchestrate the developer stack. These commands assume you have Docker and Docker Compose installed.

```bash
# start Postgres, Redis, ScholarAPI, and ScholarPath with hot-reload mounts
make dev

# apply migrations and load demo reference data
make seed

# run all unit/integration tests across harvester, API, and web apps
make test
```

To inspect logs during development, run:

```bash
docker compose logs -f scholarapi scholarpath
```

## Production-like run

For a production-style run (detached containers, no hot reload), use:

```bash
# build images and start services in detached mode
make up

# follow logs as needed
docker compose logs -f

# stop and remove the stack when finished
make down
```

The Compose file exposes ScholarAPI on `http://localhost:8080` and ScholarPath on `http://localhost:3000`. Update the `.env` files inside each app if deploying to a different host.

## Git remotes

Scholarstack treats `main` as the canonical branch. After committing your work locally, configure a remote once per clone and push with:

```bash
git remote add origin <your-git-url>  # skip if already configured
git push origin main
```

Running `git push origin main` ensures the deployment automation tracks the correct branch.
