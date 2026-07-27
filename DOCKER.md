# Running FixMate with Docker

This runs the whole stack — MySQL, backend, and frontend — in containers, with a single command.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## Folder layout

Clone both repositories side by side, using their standard names:

```
FixMate-backend/
FixMate-frontend/     <- run the command below from here
```

## Run

From the `FixMate-frontend` folder:

```bash
docker compose up --build
```

The first run builds the images and starts three services:

| Service | Description | Address |
|---------|-------------|---------|
| db | MySQL 8 | internal (host port 3307) |
| backend | Spring Boot API | http://localhost:8080 |
| frontend | React app (served by nginx) | http://localhost:3000 |

When it finishes starting, open **http://localhost:3000**.

Log in as the administrator that is created automatically:

| Email | Password |
|-------|----------|
| admin@fixmate.com | Admin@123 |

## Optional: enable the AI feature

The AI assistant needs an OpenAI key. Set it in your shell before running:

```bash
# macOS / Linux
export OPENAI_API_KEY=sk-...
# Windows PowerShell
$env:OPENAI_API_KEY = "sk-..."
```

Then `docker compose up --build`. Without a key, the rest of the app works and only the AI is limited.

## Stop

```bash
docker compose down          # stop and remove the containers
docker compose down -v       # also remove the database volume (fresh start)
```

## How it is wired

- The frontend is built with `VITE_API_BASE=""`, so the app calls a relative `/api/...`.
- nginx (in the frontend container) forwards `/api/` to the `backend` service, so there is no CORS and a single entry point on port 3000.
- The backend runs with the `docker` Spring profile and reads all secrets (database password, JWT secret, OpenAI key) from environment variables set in `docker-compose.yml`. No secrets are stored in the repository.
