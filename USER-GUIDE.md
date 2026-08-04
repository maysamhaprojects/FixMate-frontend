# FixMate — Functionality Guide

This document describes everything a user can do in the FixMate web application, from the first screen to logging out. It is written from the user's point of view (the experience), not the technical implementation.

The application is live on the cloud at **https://fixmate.duckdns.org** — you can follow along on the real site. For installation and setup instructions, see [HOW-TO-RUN.md](HOW-TO-RUN.md).

FixMate is a platform that connects clients with verified home-service professionals (electrical, plumbing, air conditioning, carpentry, painting, and more). The application has three types of users: Client, Professional, and Administrator.

---

## Part 1 — Before signing in

### 1.1 Landing page
The first screen a visitor sees. It contains:

- An introduction to the service — headline, short explanation, and an illustration.
- "How It Works" — four steps: snap the problem, the assistant analyses it, choose a professional, rate and review.
- "Features" — verified professionals, real-time booking, location-based matching, AI diagnosis.
- "For Professionals" — an invitation to join as a professional.
- A footer with links to Privacy Policy and Terms of Service (each opens in a window), Sign In, and Sign Up.
- Buttons: "Sign In" and "Get Started".
- A language switch between English and Hebrew, available at any time.

### 1.2 Registration
The user first chooses an account type: Client or Professional.

Client registration (two steps):
1. Personal details — profile photo (optional), full name, email, password (with a live strength check), password confirmation, phone (with country code), city (auto-complete from a list of Israeli cities), and acceptance of the terms.
2. Done — the client is signed in immediately and taken to the home screen.

Professional registration (three steps):
1. Personal details (same as a client).
2. Professional details — areas of expertise (multiple selection), hourly price range, an "about you" description, years of experience, and upload of documents or certificates.
3. Done — the account waits for administrator approval. A message explains this, and the user is taken to the sign-in screen.

### 1.3 Sign in
- The user enters an email and password.
- "Remember me" saves the email for next time (the password is never saved).
- After signing in, the system identifies the role from the database and routes the user to the correct area (Client, Professional, or Administrator).
- Clear error messages are shown for wrong credentials, an account awaiting approval, a suspended account, or a rejected application (including the reason).

---

## Part 2 — Client

### 2.1 Home (dashboard)
- A personal greeting and a rotating banner with "Book a Pro" and "Snap an Issue" buttons.
- Quick figures: active orders, completed orders, total orders.
- Action cards: Snap an Issue, Book a Pro, Self-Help Center.
- A list of active orders — each shows the professional, order number, a colored status, a description, and the amount to pay (shown only once the job is completed). Per-status actions are described in section 2.5.
- A "My Complaints" section, if any complaints were filed, showing status and the team's response.
- The screen refreshes automatically every few seconds.

### 2.2 Book a Pro
A three-step process:
1. Choose a service — click one of eight categories (electrical, plumbing, air conditioning, painting, carpentry, locksmith, renovation, cleaning). A shortcut button, "Not sure what's wrong? Ask our AI assistant", is also available.
2. When and where — choose a city (auto-complete), date, and time. The search button becomes active only when all three are set.
3. Choose a professional — a list of verified professionals in the chosen field, each showing name, rating, experience, hourly price, and city. Click "Book Now".
4. Confirm — a summary of the details, an optional notes field, and the cancellation policy (free more than 48 hours in advance; a fee applies within 48 hours). Confirming creates the order.
5. Success — a confirmation message, then an automatic return to the dashboard.

### 2.3 Snap an Issue (AI assistant)
A smart chat that diagnoses home problems:
- The user describes the problem in text, uploads a photo of the fault, or both.
- The assistant understands the problem. When it is simple and safe, it offers step-by-step do-it-yourself guidance, including tools, and an estimated time and cost.
- When a professional is needed, it directs the user to booking, or books one through the conversation (after confirmation).
- It works in Hebrew, English, and Arabic, and replies in the same language.

### 2.4 Self-Help Center
Do-it-yourself guides for common problems — a set of guide cards, each with detailed steps. If self-help does not solve the problem, there is a link to book a professional.

### 2.5 Managing existing orders (from the dashboard)
Depending on the order status, the client can:
- Pending approval — edit (date, time, address, description) or cancel.
- Confirmed — contact the professional (phone call) or cancel.
- In progress — track progress on a timeline (received, assigned, on the way, started, completed).
- Completed — rate the professional.
- At any stage — report a problem (file a complaint).

### 2.6 Rate a professional
After a completed order:
- Choose a rating of one to five stars (each score shows an icon and a label).
- Add an optional written review.
- "Improve with AI" — an option that rewrites the review more clearly; the user can accept it or keep the original.
- Submit, or skip.

### 2.7 Client profile
View and edit the profile photo, full name, email, and phone. Saving updates the details.

### 2.8 Sign out
The "Log out" button in the side menu clears the session and returns to the sign-in screen.

---

## Part 3 — Professional

### 3.1 Home (business dashboard)
- A greeting and a daily overview.
- Four figures: new orders, today's orders, weekly income, average rating.
- An alert about new orders awaiting approval.
- Recent reviews from clients.
- Today's schedule — appointments with time, client, status, and location, plus a call button.

### 3.2 Manage orders
- Search and filter by status (all, pending, confirmed, in progress, completed, cancelled).
- Actions by status:
  - Pending — accept or decline.
  - Confirmed — start the job or cancel.
  - In progress — finish the job. At this point the professional sets the final price (within the promised range); the client will see the amount.
- A call button on every order.

### 3.3 Availability
Set weekly working hours — for each day: an available/unavailable toggle, and start and end times. Saving updates the availability, which affects the times clients can book.

### 3.4 Professional profile
- Photo, name, area of expertise, rating, and number of reviews.
- Edit personal details, description, and price range.
- Client reviews.
- Service areas — choose cities, shown on an interactive map.

---

## Part 4 — Administrator

The administrator has a full management panel with a side menu.

### 4.1 Overview
Key figures: total users (clients and professionals), orders, revenue, and pending approvals, together with recent orders and live activity.

### 4.2 Professional approvals
- A list of professionals awaiting approval.
- View the full details and the documents they uploaded.
- Approve (the professional becomes active and appears in search) or reject (with a mandatory reason the applicant will see).

### 4.3 Complaints
- Filter by open or resolved.
- View a complaint, write a response (sent by email), and mark it as resolved.

### 4.4 Ratings
A table of all reviews in the system (professional, score, comment, client).

### 4.5 Users
- Search for users.
- View details, and suspend or restore a user.

### 4.6 Orders
A table of all orders in the system (client, professional, price, status).

---

## Part 5 — Features across the whole application

- Bilingual — English and Hebrew, switchable at any time, including full right-to-left layout for Hebrew.
- Notifications — clients and professionals receive updates on order status changes.
- Email — automatic notifications for each event (new order, approval, cancellation, rating).
- Responsive design — works on desktop, tablet, and phone.
- Security — encrypted passwords, token-based sign-in, and role-based access.

---

## A typical client journey

```
Landing page  ->  Register  ->  Sign in  ->  Dashboard
    ->  Snap an Issue (AI diagnosis)   or   Book a Pro (manual selection)
    ->  Choose a professional  ->  Confirm the order
    ->  Track the order  ->  Completion  ->  Rate the professional
    ->  Sign out
```
