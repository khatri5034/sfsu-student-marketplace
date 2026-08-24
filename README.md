# Gator Freighter 🐊📦

**Gator Freighter** is a full-stack, student-only marketplace built exclusively for the San Francisco State University (SFSU) community. Students can buy, sell, and trade textbooks, electronics, furniture, and more with fellow Gators, arrange safe on-campus pickup, and message each other directly through the platform.

This repository is the semester-long project for **CSC 648/848 – Software Engineering**, built by **Team 14** from the ground up, milestone by milestone, following a real software engineering lifecycle: requirements gathering → design → iterative implementation → deployment → polish.

> **Live site:** `https://team14.csc648sfsu.com` *(update with current URL/IP)*

---

## Table of Contents

- [The Product](#the-product)
- [Engineering Journey: Milestone by Milestone](#engineering-journey-milestone-by-milestone)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Data Model](#data-model)
- [API Surface](#api-surface)
- [Repository Structure](#repository-structure)
- [Running the Project Locally](#running-the-project-locally)
- [Deployment](#deployment)
- [Team](#team)

---

## The Product

Gator Freighter's mission is to create a **safe, trusted, and easy-to-use** platform for SFSU students to exchange goods within their own campus community — no strangers off-campus, no scams, just Gators helping Gators.

Key product decisions and why we made them:

- **SFSU-email-gated accounts** — every user registers and is verified with an `@sfsu.edu` / `@mail.sfsu.edu` address, so the marketplace stays a trusted, closed community.
- **Sell *or* trade** — listings support cash sales, item-for-item trades, or both, because students often want to swap textbooks/electronics rather than pay.
- **Campus pickup locations** — every transaction is tied to a defined, safe on-campus meetup spot instead of exchanging home addresses.
- **Listing moderation** — new listings enter a `pending` approval queue before they go live, giving admins a chance to catch spam or inappropriate content.
- **In-app messaging** — buyers and sellers negotiate inside the app instead of exchanging personal contact info up front.

## Engineering Journey: Milestone by Milestone

CSC648/848 structures the semester as a series of milestones that mirror a real product's lifecycle. Each milestone artifact lives in [`Milestones/`](Milestones), and the commit history tells the same story in code.

| Milestone | Focus | What we shipped |
|---|---|---|
| **M0** | Team & repo setup | Formed the team, set up the GitHub repo, established roles and communication norms. |
| **M1** | Requirements & planning | Defined the product vision, user stories, and scope for a student-to-student marketplace. Documented in [`Milestones/M1`](Milestones/M1). |
| **M2** | Design & scaffolding | Designed the MySQL schema (`users`, `items`, `categories`, `courses`, `pickup_locations`) and stood up the first Node/Express + server-rendered pages (home, search, category filters). Docker Compose environment introduced. |
| **M3** | Core features (V1) | Built listings CRUD, image upload, authentication (register/login), and dashboard pages. Migrated the frontend to a **Vue 3** single-page app with client-side routing. |
| **M4** | Feature completeness | Added in-app **messaging/conversations**, the **trade request** workflow, listing approval/moderation, price filtering, and Meilisearch-powered search. Hardened deployment with NGINX + Let's Encrypt + PM2. |
| **M5** | Final polish & launch | UI/UX pass (responsive navbar, disclaimers, branding), Google Analytics integration, bug fixes, and final documentation. Final report in [`Milestones/Final Project Documentation`](Milestones/Final%20Project%20Documentation). |

Every milestone was developed on feature branches, reviewed via pull requests, and merged into `dev` before being promoted to `main` for deployment — the same branching discipline used in professional engineering teams.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | **Vue 3** + Vue Router + Vite | Fast SPA development, component reuse, hot module reload |
| Backend | **Node.js 20** + **Express.js** | Lightweight, well-supported REST API layer |
| Database | **MySQL 8.0** | Relational integrity for users/items/trades/messages |
| Search | **Meilisearch** | Fast, typo-tolerant full-text search over listings |
| Auth/Security | **bcrypt-style hashing, Helmet, CORS** | Password safety and standard HTTP hardening |
| File Uploads | **Multer** | Listing image uploads |
| Styling | **SASS** | Legacy pages + shared design tokens |
| Process Management | **PM2** | Keeps the Node process alive in production |
| Reverse Proxy / TLS | **NGINX** + **Certbot (Let's Encrypt)** | HTTPS termination and static asset serving |
| Containerization | **Docker / Docker Compose** | Reproducible dev & prod environments (`mysql`, `meilisearch`, `app`, `nginx`, `certbot` services) |
| Analytics | **vue-gtag (Google Analytics)** | Usage insight in production |

## System Architecture

```
                     ┌──────────────────────┐
   Browser  ───────▶ │        NGINX         │  (TLS termination, reverse proxy)
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │   Node.js / Express   │  serves REST API (/api/*)
                     │   (managed by PM2)    │  + built Vue SPA (dist/)
                     └────┬─────────────┬────┘
                          │             │
                ┌─────────▼───┐   ┌─────▼─────────┐
                │   MySQL 8   │   │  Meilisearch   │
                │ (relational │   │ (listing full- │
                │   data)     │   │  text search)  │
                └─────────────┘   └────────────────┘
```

The whole stack is defined declaratively in [`application/docker-compose.yml`](application/docker-compose.yml), with each service isolated on an internal Docker network — only NGINX is exposed to the host on ports 80/443.

## Core Features

- **Authentication** — SFSU-email registration & login with hashed passwords and session handling.
- **Marketplace listings** — create, browse, search, and filter listings by category, course, price, and condition.
- **Sell or trade** — list an item for sale, for trade, or both; propose and respond to trade offers on other users' items.
- **Search** — Meilisearch-backed full-text search with live re-indexing after listings change.
- **Messaging** — real-time-feeling conversations tied to a specific listing between buyer and seller.
- **Listing approval workflow** — admin-reviewed pending/approved/rejected pipeline before listings go live.
- **Image uploads** — multi-image listings with validation on type/size.
- **Campus pickup locations** — every listing/trade is tied to a safe, predefined on-campus meeting spot.
- **User dashboard** — manage your own listings, trades, and conversations in one place.
- **Responsive UI** — mobile-friendly navigation and layout across all pages.

## Data Model

The MySQL schema ([`application/database/schema.sql`](application/database/schema.sql)) centers on these entities:

- **`users`** — accounts, verification status, admin flag, optional storefront branding.
- **`items`** — listings with price, category, condition, course tag, listing type (`sale` / `trade` / `sale_or_trade`), status, and approval workflow.
- **`listing_images`** — one-to-many images per item.
- **`categories` / `conditions` / `courses` / `pickup_locations`** — lookup/reference tables.
- **`conversations` / `messages`** — buyer↔seller messaging threads scoped to a listing.
- **`trade_requests`** — offer/accept/decline workflow between two items.
- **`reports`** — user- or item-level moderation reports.

Foreign keys enforce referential integrity (e.g. cascading deletes for a removed user's items/messages), and indexes are tuned for the app's most common queries (active listings by category, conversation lookups, trade status, etc.).

## API Surface

All backend routes live in [`application/src/routes/index.js`](application/src/routes/index.js) and are mounted under `/api`:

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Users | `GET /api/users/me` |
| Listings | `GET /api/items/home`, `GET /api/items/search`, `GET /api/items/:id`, `POST /api/items`, `DELETE /api/items/:id`, `POST /api/items/:id/images`, `GET /api/items/by-seller/:sellerId` |
| Messaging | `GET /api/messages/conversations`, `GET /api/messages/conversations/:conversationId`, `POST /api/messages/conversations/:conversationId/messages`, `POST /api/conversations` |
| Trades | `POST /api/trade-requests`, `GET /api/trade-requests`, `PATCH /api/trade-requests/:id` |
| Reference data | `GET /api/meta/categories`, `GET /api/meta/courses`, `GET /api/meta/conditions`, `GET /api/meta/pickup-locations` |
| Ops | `GET /health` |

## Repository Structure

```
.
├── Milestones/                # Milestone deliverables & final documentation (no code)
├── credentials/                # Local-only credentials (gitignored)
├── application/                # All source code lives here
│   ├── src/                    # Express backend
│   │   ├── app.js              # App entry point, middleware, SPA fallback
│   │   ├── config/             # DB, Meilisearch, upload config
│   │   ├── middleware/          # Error handling
│   │   ├── routes/index.js     # REST API routes
│   │   └── public/             # Legacy static pages & uploaded images
│   ├── frontend/                # Vue 3 SPA
│   │   └── src/
│   │       ├── views/           # Page-level components (Home, Search, Dashboard, ...)
│   │       ├── components/      # Reusable UI (NavBar, ListingCard, TradeRequestModal, ...)
│   │       └── router/          # Vue Router route table
│   ├── database/                # schema.sql, migrations, seed data
│   ├── docker/                  # Dockerfiles for node & nginx
│   ├── nginx/                   # NGINX reverse-proxy config
│   ├── docker-compose.yml       # Full local/prod stack definition
│   └── Deploy.md                # Step-by-step production deployment guide
└── README.md                    # You are here
```

## Running the Project Locally

```bash
cd application
cp .env.example .env      # fill in DB credentials, Meilisearch key, etc.
docker compose up --build
```

This spins up MySQL, Meilisearch, the Express app, and NGINX. The database schema auto-initializes from `database/schema.sql` on first run.

Optionally seed sample listings:

```bash
npm run db:seed
```

For active development without Docker, see [`application/README.md`](application/README.md) for running the backend (`npm run dev`) and frontend (`npm run dev` inside `frontend/`) directly.

## Deployment

Production deployment (Docker Compose + NGINX + Let's Encrypt on a cloud VM) is fully documented in [`application/Deploy.md`](application/Deploy.md), covering first-time server setup, SSL certificate issuance/renewal, and common operational commands.

## Team

| Name | GitHub |
|---|---|
| Kiran Khatri | [@khatri5034](https://github.com/khatri5034) |
| Gursimran Grewal | [@ggrewal3](https://github.com/ggrewal3) |
| Jordan Westover | [@jwestover-123](https://github.com/jwestover-123) |
| Christopher Huynh | [@Shupadup](https://github.com/Shupadup) |
| Stiofan Condon | [@TownsendBrown](https://github.com/TownsendBrown) |
| Leslie Garcia | [@leslieg4](https://github.com/leslieg4) |
| Gabriel Purizaca | [@gabep23](https://github.com/gabep23) |

*Built for CSC 648/848 — Software Engineering, San Francisco State University.*
