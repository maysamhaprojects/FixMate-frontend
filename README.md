# FixMate

A bilingual (English / Hebrew) home-services platform that connects clients with verified professionals — electricians, plumbers, air-conditioning technicians, carpenters, and more.

The project is split into two repositories:

- **Frontend (web app):** https://github.com/maysamhaprojects/FixMate-frontend
- **Backend (server):** https://github.com/maysamhaprojects/FixMate-backend

## Documentation

- [HOW-TO-RUN.md](HOW-TO-RUN.md) — how to install and run the full project.
- [USER-GUIDE.md](USER-GUIDE.md) — what the application does, feature by feature.

---

## Project Description

FixMate is a two-sided marketplace for home services. Clients describe a problem — by choosing a category or by sending a photo and description to an AI assistant — and are matched with verified professionals they can book, track, and rate. Professionals manage their orders, availability, and profile. Administrators approve professionals, handle complaints, and oversee the platform.

The application is fully bilingual (English and Hebrew, including right-to-left layout) and works on desktop, tablet, and phone.

---

## System Goals

- Make it simple for clients to find and book a trusted professional for any home issue.
- Reduce unnecessary call-outs by offering AI-based diagnosis and do-it-yourself guidance when a problem is safe to fix.
- Give professionals a clear way to receive, manage, and complete orders, and to build a reputation through reviews.
- Ensure trust and quality through professional verification, ratings, and an administrative review process.

---

## Main Features

### Client
- Registration and sign-in, with password-strength rules and a country phone picker.
- Book a professional by category, city, date, and time.
- AI assistant ("Snap an Issue") that diagnoses a problem from a photo or description and offers do-it-yourself guidance or booking.
- Self-Help Center with step-by-step troubleshooting guides.
- Manage orders: edit or cancel a pending order, track an in-progress order, and contact the professional.
- Rate and review completed jobs, with an optional AI-assisted review.
- File and follow complaints.
- Edit personal profile and photo.

### Professional
- Business dashboard with income, ratings, and today's schedule.
- Manage the order lifecycle: accept, start, and complete jobs, and set the final price on completion.
- Set weekly availability (working hours per day).
- Manage a public profile, price range, reviews, and service areas shown on an interactive map.

### Administrator
- Overview of platform statistics (users, orders, revenue, pending approvals).
- Approve or reject professional applications (with a reason).
- Review and resolve client complaints.
- View all ratings and orders, search users, and suspend or restore accounts.

---

## Technologies

### Frontend
- React 19 with Vite (development server and build tool).
- React Router for navigation.
- A custom Language Context for English/Hebrew localization and right-to-left support.
- Leaflet with OpenStreetMap for the service-area map.
- Plain CSS (no UI framework).

### Backend
- Java with Spring Boot 3.3.
- Spring Web (REST API), Spring Security, and Spring Data JPA (Hibernate).
- Spring Mail for email notifications.

### Database
- MySQL 8. The schema is generated automatically from the entity classes (Hibernate).

### Additional Tools
- JWT (JSON Web Tokens) for stateless authentication.
- BCrypt for password hashing.
- OpenAI API for the AI assistant.
- Gmail SMTP for email notifications.
- Maven (via the included wrapper) for the backend build.

---

## Project Structure

```
FixMate-frontend/
  src/
    pages/        Screens (dashboards, auth, booking, profiles, self-help)
    hooks/        Screen logic and state
    services/     API calls to the backend
    components/   Shared UI (navigation, icons, modals)
    context/      Language context (English / Hebrew)
    data/         Static data (cities, categories, legal text)
    styles/       CSS

FixMate-backend/
  src/main/java/com/fixmate/
    modules/      Feature modules (auth, booking, pro, rating, complaint, snap, ...)
      <module>/controller   REST endpoints
      <module>/service      Business logic
      <module>/repository   Database access
      <module>/model        Entities (tables)
    config/       Security and application configuration
    security/     JWT authentication
```

Each backend module follows the same layered structure: Controller, Service, Repository, and Model.

---

## Installation

### Prerequisites
- Git
- Node.js 18 or higher
- Java JDK 17 or higher (21 recommended)
- MySQL 8

Full, step-by-step instructions are in [HOW-TO-RUN.md](HOW-TO-RUN.md). A short version follows.

---

## Running the Server (Backend)

```bash
cd FixMate-backend
# Create application.properties from application.properties.example
# and set the MySQL password and a JWT secret.
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

The server runs at http://localhost:8080.

---

## Running the Web App (Frontend)

```bash
cd FixMate-frontend
npm install
npm run dev
```

The web application runs at http://localhost:5173.

---

## Database Setup

Create an empty database once; the tables are created automatically on the first run.

```sql
CREATE DATABASE fixmate_db;
```

On the first run against an empty database, a default administrator account is created automatically (`admin@fixmate.com` / `Admin@123`). Client and professional accounts are created through the site. These default credentials are for development and demonstration only.

---

## API Overview

The backend exposes a REST API under `/api`. The main groups are:

| Area | Purpose |
|------|---------|
| `/api/auth` | Registration and sign-in |
| `/api/user` | Current-user profile |
| `/api/client` | Client bookings |
| `/api/pros`, `/api/pro` | Public professional search and professional management |
| `/api/snap` | AI assistant (chat and analysis) |
| `/api/ratings`, `/api/complaints` | Ratings and complaints |
| `/api/admin` | Administration |

All protected endpoints require a JWT token in the `Authorization` header.

---

## Security

- Passwords are hashed with BCrypt and never stored in plain text.
- Authentication is stateless, using JWT tokens; access is enforced by role (Client, Professional, Administrator).
- Secrets (database password, JWT secret, OpenAI key, mail credentials) are kept out of the public repository and provided through a local, git-ignored configuration file.
- Input is validated on the server, and the API does not reveal whether an email or a password was the incorrect field on sign-in.

---

## Project Status

Functional graduation project (2026). Core flows for clients, professionals, and administrators are implemented and connected end to end.
