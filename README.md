# FixMate — Frontend 🛠️

> **FixMate** — a bilingual (Hebrew / English) home-services marketplace that connects clients with verified professionals (electricians, plumbers, AC technicians, and more).
>
> פלטפורמת שירותי בית דו-לשונית שמחברת לקוחות עם בעלי מקצוע מאושרים.

This repository contains the **frontend** (the web app). The server lives in a separate repo: **[FixMate-backend](https://github.com/maysamhaprojects/FixMate-backend)**.

---

## ✨ Features

- **Three dashboards** — Client, Professional, and Admin, each fully connected to the backend
- **Authentication** — sign up / sign in with role selection, password-strength rules, and country phone picker
- **Book a professional** — search by category & city, real availability, live booking
- **Edit & cancel orders** — clients can edit a pending order or cancel with a reason
- **Ratings & reviews** — clients rate completed jobs; pros and admin see the reviews
- **Complaints module** — clients file complaints, admin reviews and resolves them
- **Profile pictures** — upload for client, professional, and admin
- **Self-Help Center** — 8 illustrated troubleshooting guides (electrical, plumbing, AC, boiler, lock, paint, carpentry, washing machine)
- **Snap-an-Issue** — describe a problem and get matched to the right professional
- **Bilingual UI** — full Hebrew ⇄ English with RTL/LTR support

## 🧰 Tech Stack

- **React 18** + **Vite** (fast HMR dev server)
- **React Router** for navigation
- Custom **Language Context** for he/en localization
- Plain CSS + inline styles (no UI framework)

## 🚀 Getting Started

**Prerequisites:** [Node.js](https://nodejs.org/) 18+ and the [FixMate-backend](https://github.com/maysamhaprojects/FixMate-backend) running on `http://localhost:8080`.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## 📁 Project Structure

```
src/
├── pages/          # All screens (dashboards, auth, booking, profiles, self-help...)
├── context/        # LanguageContext (he/en)
├── data/           # Israeli cities, countries
├── services/       # API helpers
└── styles/         # CSS
```

---

*Graduation project · FixMate 2026*
