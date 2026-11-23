# Gaari Bhara Backend

Gaari Bhara is a vehicle rental marketplace for Bangladesh. Owners post vehicles they want to rent out, renters post what they need, both sides chat about a post, and then they move the rent step by step from request to return. After the rent ends, both sides can leave a review.

Gaari Bhara does not handle money. The owner and the renter agree on the price in chat and pay each other directly.

This repository is the REST API, built for **CSC4161 Advance Programming in Web Technology** at AIUB by **Team 07**.

## Team

| Member               | Module                                                     |
| -------------------- | ---------------------------------------------------------- |
| Sadat Hossain (lead) | Registration, login, users, admin users, shared foundation |
| Arikh Bin Eden       | Posts, feed, images, categories and districts              |
| Adila Mujtaba        | Rents, rent status history, reviews                        |
| Arijit Paul Dip      | Chat: conversations, messages, read marks                  |

## Tech stack

- **Node.js 22**, **TypeScript**, **NestJS 11**
- **PostgreSQL 16** with **TypeORM** (hand-written migrations)
- **JWT** login with **bcrypt** password hashing
- **class-validator** for request validation
- **Swagger** for API documentation
- **Jest** and **Supertest** for end-to-end tests

## Features

- Sign up as a **RENTER** or an **OWNER**, log in, log out, change password, edit profile
- Role-based access with guards (**RENTER**, **OWNER**, **ADMIN**)
- Owners post **OFFER**s, renters post **REQUEST**s, with search, filters, pages and up to 5 images per post
- Private chat between two users about a post
- Rent flow: **PENDING → CONFIRMED → ONGOING → ENDED**, with a status history for every change
- No double booking: the database blocks two confirmed rents of the same vehicle on overlapping dates
- Reviews after a rent ends, one per person, rating 1 to 5, with an average per user
- Admin tools: list, suspend and restore users; hide posts and reviews
- One error format for every response, and a request ID on every request

## Getting started

### 1. What you need

- Node.js 22 (see `.nvmrc`)
- pnpm (`npm install -g pnpm`)
- PostgreSQL 16, installed locally or run with Docker

### 2. Install

```bash
git clone https://github.com/sHADo-07/awt-project-gaari-bhara.git
cd awt-project-gaari-bhara
pnpm install
```

### 3. Set up the environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then open `.env` and change at least these:

| Variable                                | What to put                                      |
| --------------------------------------- | ------------------------------------------------ |
| `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Your PostgreSQL user, password and database name |
| `JWT_BEARER_SECRET`                     | A long random text (at least 16 characters)      |

To make a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Email is optional. If `MAILER_HOST` is empty, emails are only written to the log.

### 4. Create the database

**Option A: Docker** (matches `.env.example`)

```bash
docker compose -f docker-compose.dev.yml up -d
```

**Option B: Local PostgreSQL** (in psql or pgAdmin)

```sql
CREATE USER gaari WITH PASSWORD 'gaari_dev_password' CREATEDB;
CREATE DATABASE gaari_bhara OWNER gaari;
```

`CREATEDB` is needed because the tests create their own `gaari_bhara_test` database.

### 5. Build the tables and add demo data

```bash
pnpm migration:run      # creates all 11 tables
pnpm seeder:run:dev     # adds the demo users
pnpm seed:posts         # optional: adds demo posts with images
```

### 6. Run

```bash
pnpm start:dev
```

- API: `http://localhost:5000`
- Swagger: **`http://localhost:5000/api`**
- Health check: `http://localhost:5000/health`

## Demo accounts

All demo accounts use the password **`Demo@12345`**.

| Email                                         | Role   |
| --------------------------------------------- | ------ |
| admin@gaaribhara.test                         | ADMIN  |
| owner1@gaaribhara.test, owner2@…, owner3@…    | OWNER  |
| renter1@gaaribhara.test, renter2@…, renter3@… | RENTER |

## Using the API

1. Call `POST /auth/login` and copy the `accessToken` from the response.
2. In Swagger, click **Authorize** and paste the token. In Postman, use **Bearer Token**.
3. Every protected route now works as that user.

The token lasts 1 hour (`JWT_TTL`). After `POST /auth/logout`, the same token stops working at once.

## Main routes

The full list, with request and response examples, is in Swagger at `/api`.

**Auth and users**

| Method     | Path                                                   | Access    |
| ---------- | ------------------------------------------------------ | --------- |
| POST       | `/auth/register`                                       | Public    |
| POST       | `/auth/login`                                          | Public    |
| POST       | `/auth/logout`                                         | Logged in |
| PATCH      | `/auth/password`                                       | Logged in |
| GET, PATCH | `/users/me`                                            | Logged in |
| GET        | `/admin/users`, `/admin/users/:id`                     | Admin     |
| PATCH      | `/admin/users/:id/suspend`, `/admin/users/:id/restore` | Admin     |
| DELETE     | `/admin/users/:id`                                     | Admin     |

**Posts and catalog**

| Method     | Path                                                               | Access                          |
| ---------- | ------------------------------------------------------------------ | ------------------------------- |
| GET        | `/categories`, `/districts`                                        | Public                          |
| GET        | `/posts`, `/posts/:id`                                             | Public                          |
| GET        | `/posts/mine`                                                      | Logged in                       |
| POST       | `/posts`                                                           | Owner (OFFER), Renter (REQUEST) |
| PATCH      | `/posts/:id`, `/posts/:id/close`                                   | Post author                     |
| POST       | `/posts/:id/images`                                                | Post author                     |
| DELETE     | `/posts/:id/images/:imageId`                                       | Post author                     |
| GET, PATCH | `/admin/posts`, `/admin/posts/:id/hide`, `/admin/posts/:id/unhide` | Admin                           |

**Chat**

| Method             | Path                      | Access      |
| ------------------ | ------------------------- | ----------- |
| POST, GET          | `/conversations`          | Logged in   |
| GET, PATCH, DELETE | `/conversations/:id`      | Chat member |
| POST, GET          | `/messages`               | Logged in   |
| GET, PATCH, DELETE | `/messages/:id`           | Chat member |
| POST, GET          | `/conversation_reads`     | Chat member |
| GET, PATCH, DELETE | `/conversation_reads/:id` | Chat member |

**Rents and reviews**

| Method | Path                                                                  | Access                                    |
| ------ | --------------------------------------------------------------------- | ----------------------------------------- |
| POST   | `/rents`                                                              | Renter on an OFFER, owner on a REQUEST    |
| GET    | `/rents/my`                                                           | Logged in                                 |
| GET    | `/rents/:id`, `/rents/:id/history`                                    | The owner or renter of the rent, or admin |
| GET    | `/rents/:id/contact`                                                  | The owner or renter, after CONFIRMED      |
| POST   | `/rents/:id/confirm`, `/rents/:id/decline`                            | Post author                               |
| POST   | `/rents/:id/cancel`                                                   | Owner or renter, before handover          |
| POST   | `/rents/:id/handover`                                                 | Owner                                     |
| POST   | `/rents/:id/end`                                                      | Renter                                    |
| POST   | `/reviews`                                                            | Owner or renter of an ENDED rent          |
| GET    | `/reviews/subject/:id`, `/reviews/subject/:id/average`                | Logged in                                 |
| GET    | `/reviews/post/:id`, `/reviews/post/:id/average`, `/reviews/rent/:id` | Logged in                                 |
| PATCH  | `/reviews/:id/hide`                                                   | Admin                                     |

## Errors

Every error has the same shape. A stack trace is never sent to the client.

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "This email is already registered",
  "path": "/auth/register",
  "timestamp": "2026-11-23T10:00:00.000Z"
}
```

| Code | Meaning                                                                             |
| ---- | ----------------------------------------------------------------------------------- |
| 400  | Wrong input. The message says which field.                                          |
| 401  | Not logged in, or the token is wrong, expired or logged out                         |
| 403  | Logged in, but not allowed (wrong role, not yours, or suspended)                    |
| 404  | Not found                                                                           |
| 409  | Clash with existing data (duplicate value, dates already booked, wrong status step) |

## Tests

```bash
pnpm test
```

The tests run against a real PostgreSQL database named after `DB_DATABASE` with `_test` at the end (for example `gaari_bhara_test`). It is created automatically and wiped on every run, so your main data is never touched.

| File                        | What it checks                                                                |
| --------------------------- | ----------------------------------------------------------------------------- |
| `test/auth.e2e-spec.ts`     | Registration, login, guards, logout, profile, admin users                     |
| `test/posts.e2e-spec.ts`    | Posts, feed, images, admin hide                                               |
| `test/database.e2e-spec.ts` | Database rules: unique values, checks, no double booking, one review per side |

## Project structure

```text
src/
├── common/         guards, decorators, error filter, validation pipe, request logger
├── config/         environment settings (checked when the app starts)
├── database/
│   ├── migrations/ the SQL that builds every table
│   └── seeders/    demo users and demo posts
├── modules/
│   ├── auth/       register, login, logout, password
│   ├── users/      profile and admin users
│   ├── catalog/    categories and districts
│   ├── post/       posts, feed, images, admin posts
│   ├── chat/       conversations, messages, read marks
│   ├── rent/       rents and the status flow
│   ├── rent_status_history/
│   └── review/     reviews and averages
├── app.module.ts
└── main.ts         app start, Swagger, CORS, uploads
test/               end-to-end tests
```

## Useful scripts

| Command                   | What it does                  |
| ------------------------- | ----------------------------- |
| `pnpm start:dev`          | Run with auto-reload          |
| `pnpm build`              | Compile to `dist/`            |
| `pnpm start:prod`         | Run the compiled app          |
| `pnpm test`               | Run all end-to-end tests      |
| `pnpm lint`               | Check and fix code style      |
| `pnpm format`             | Format the code with Prettier |
| `pnpm migration:run`      | Apply new migrations          |
| `pnpm migration:rollback` | Undo the last migration       |
| `pnpm seeder:run:dev`     | Add the demo users            |
| `pnpm seeder:refresh:dev` | Reset the demo users          |
| `pnpm seed:posts`         | Add demo posts with images    |
