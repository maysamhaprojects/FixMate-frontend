# FixMate — Setup and Run Guide

There are two ways to use FixMate:

- **Option A — Use the live site (no installation).** FixMate is already deployed on the cloud at **https://fixmate.duckdns.org**. Just open it in a browser and sign in. This is the fastest way to try the application.
- **Option B — Run it locally.** Follow the step-by-step guide below to run the full project on your own machine. (You can also run everything in Docker with one command — see [DOCKER.md](DOCKER.md).)

To sign in on the live site, use the administrator account (`admin@fixmate.com` / `Admin@123`), or register your own client or professional account. What each role can do is described in [USER-GUIDE.md](USER-GUIDE.md).

---

## Running locally

The rest of this guide explains how to run the complete FixMate project on a new machine, from cloning the source code to logging in. It is written to be followed step by step.

FixMate has two parts that run at the same time:

| Component | Technology | Address |
|-----------|-----------|---------|
| FixMate-frontend — the web app | React + Vite | http://localhost:5173 |
| FixMate-backend — the server | Spring Boot + MySQL | http://localhost:8080 |

For a description of what the application does, see [USER-GUIDE.md](USER-GUIDE.md).

---

## Step 1 — Prerequisites

Install the following tools once (if not already installed):

| Tool | Version | Download |
|------|---------|----------|
| Git | any | https://git-scm.com |
| Node.js | 18 or higher | https://nodejs.org |
| Java JDK | 17 or higher (21 recommended) | https://adoptium.net |
| MySQL | 8 | https://dev.mysql.com/downloads/mysql |

Verify the installation:

```bash
git --version
node -v
java -version
mysql --version
```

Maven is not required — the project includes the Maven Wrapper (`mvnw`).

---

## Step 2 — Clone the repositories

Download both repositories into the same folder:

```bash
git clone https://github.com/maysamhaprojects/FixMate-backend.git
git clone https://github.com/maysamhaprojects/FixMate-frontend.git
```

---

## Step 3 — Create the database

1. Make sure MySQL is running.
2. Create an empty database (once):
   ```sql
   CREATE DATABASE fixmate_db;
   ```
3. Remember your MySQL root password — it is needed in the next step.

Tables are created automatically on the first run (Hibernate). No manual SQL is required.

---

## Step 4 — Run the server (backend)

First, create the configuration file from the provided template:

```bash
cd FixMate-backend

# Git Bash / macOS / Linux
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Windows CMD
copy src\main\resources\application.properties.example src\main\resources\application.properties

# Windows PowerShell
Copy-Item src\main\resources\application.properties.example src\main\resources\application.properties
```

Open `application.properties` and fill in the values:

| Setting | Required | Value |
|---------|----------|-------|
| `spring.datasource.password` | Yes | Your MySQL password |
| `app.jwt.secret` | Yes | Any random string, 32 characters or more |
| `openai.api.key` | No | OpenAI key — used by the AI feature only (see Step 6) |
| `spring.mail.*` | No | Email notifications only (see Step 6) |

Start the server:

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The server is ready when it prints `Started FixmateBackendApplication` and listens on http://localhost:8080.

---

## Step 5 — Run the web app (frontend)

Open a second terminal (leave the server running):

```bash
cd FixMate-frontend
npm install
npm run dev
```

The web app opens at http://localhost:5173.

---

## Step 6 — Log in

Open http://localhost:5173 in a browser.

On the first run against an empty database, the system automatically creates a single administrator account, because an administrator cannot register through the site. Client and professional accounts are created through the site.

What each role can do in the application is described in [USER-GUIDE.md](USER-GUIDE.md). This section covers only how to log in.

**Administrator (ready to use):**

| Email | Password |
|-------|----------|
| admin@fixmate.com | Admin@123 |

**Client — register through the site:**
Click "Get Started" and register a new account. Access is immediate.

**Professional — register through the site:**
Register an account and choose "Professional". The account waits for approval: log in as the administrator, approve the professional, then log in with the professional account.

The administrator credentials above are development and demo defaults, and should be changed in a production environment.

---

## Step 7 — Optional configuration

Two features rely on secret keys that are not included in the public repository, for security reasons. The application works without them.

**AI assistant** — requires an OpenAI key. Set `openai.api.key` in `application.properties`. Without a key the rest of the site works, and only the AI feature is limited.

**Email notifications** — sent through a dedicated Gmail account using a secret App Password. Disabled in the public repository (`app.mail.enabled=false`); the site works normally without sending email.

A description of these features is in [USER-GUIDE.md](USER-GUIDE.md).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| The server does not start | Make sure MySQL is running and the database password in `application.properties` is correct |
| The site does not respond to actions | Make sure the server is running on port 8080 |
| The AI does not respond | Make sure `openai.api.key` is set (optional) |
| Port already in use | Close any program using port 8080 or 5173 |

---

## Quick reference

```bash
# Once:
git clone https://github.com/maysamhaprojects/FixMate-backend.git
git clone https://github.com/maysamhaprojects/FixMate-frontend.git
# in MySQL:  CREATE DATABASE fixmate_db;

# Terminal 1 — server:
cd FixMate-backend
# create application.properties, then set MySQL password + jwt secret
./mvnw spring-boot:run          # -> http://localhost:8080

# Terminal 2 — web app:
cd FixMate-frontend
npm install && npm run dev      # -> http://localhost:5173
```

Open http://localhost:5173 and log in as the administrator (`admin@fixmate.com` / `Admin@123`).
