# Shining Steps Diagnostic Arena

The official Digital Diagnostic Assessment Platform for the **Shining Steps** academic system (L0-L8), created by **Ahmed Mahmoud Saeed Ahmed Ali**.

A gamified, adaptive diagnostic that measures the four language pillars - Reading, Listening, Writing, Speaking - and places every student on the exact Level, Unit and Lesson of their Shining Steps book, with professional framework tagging on every question and full per-question feedback after every attempt.

---

## What it does

- **Adaptive ladder walk** - the engine starts near the student's known level and branches up or down by performance, so placement takes about 30 questions instead of 150.
- **Four pillars, analyzed separately** - Reading, Listening, Writing, Speaking each get their own placement, continuous level (e.g. L5.4) and accuracy.
- **Exact start point** - the report names the Level, the Unit, and the Lesson to start from (for example: "Level 4 - Pre-Intermediate II - Unit 2: Travel and Services - start from Lesson 5: The ticket").
- **Fluency percentage** - the student sees exactly where they stand on the road to fluent English (Level 10 = 100 percent), in positive, encouraging language.
- **Advice bands** - 90-100% Excellent, 80-89% Very Good, 70-79% Good, 60-69% Needs Revision, below 60% Repeat the Level - each with its own encouraging message and next step.
- **Progress over time** - every attempt is compared with the previous one, in fluency percentage points, per pillar.
- **Per-question feedback** - right or wrong, why the right answer is right, why the student's answer did not work, and the lesson reference behind each item.
- **Framework tagging on every question** - Bloom's Revised Taxonomy, Webb's Depth of Knowledge (DOK), SOLO Taxonomy, Marzano, Understanding by Design (UbD), Universal Design for Learning (UDL).
- **Gamification** - XP and ranks (Seed to Fluency Legend), 10 badges, day streaks, confetti, a climbing star mascot and the L0-L10 fluency ladder.
- **Listening that really listens** - listening questions are spoken in the browser via text-to-speech, two plays per question, with a graceful transcript fallback.
- **Three desks** - Students, Teachers (classes with join codes, live reports, Big Task grading) and the Center admin (center-wide averages, level map, verdict bands, CSV export).

## The question bank

153 questions anchored to the real books:

| Level | Book | Units | Lessons | CEFR |
| --- | --- | --- | --- | --- |
| L0 | My First English Book | 2 | 24 | Pre-A1 |
| L1 | My Days, My Home, My Food | 3 | 36 | A1 |
| L2 | My Town, My Shopping, My Week | 3 | 36 | A1+ |
| L3 | My Life, My Town, My Work | 3 | 48 | A2 |
| L4 | My Past, My Trips, My Plans | 3 | 48 | A2+ |
| L5 | My Stories, My Voice, My World | 6 | 92 | B1 |
| L6 | My Case, My News, My Community | 6 | 92 | B1+ |
| L7 | My View, My Evidence, My World | 6 | 92 | B2 |
| L8 | My Voice, My Craft, My Future | 6 | 92 | B2+ |

Every question carries its unit number, unit title, lesson number, lesson title and topic, so a wrong answer always points to the exact pages to revise.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM - SQLite in local development, **PostgreSQL on Neon** in production
- Auth: scrypt password hashing + HMAC-signed httpOnly session cookies (zero extra dependencies)
- Server-side adaptive engine in `src/lib/diagnostic.ts` (pure, testable)

## Run locally

```bash
bun install
bun run db:push       # creates the SQLite database from prisma/schema.prisma
bun prisma/seed.ts    # demo accounts + realistic sample attempts
bun run dev           # http://localhost:3000
```

Demo accounts (created by the seed):

| Role | Email | Password |
| --- | --- | --- |
| Center admin | admin@shiningsteps.app | Center2026! |
| Teacher | teacher@shiningsteps.app | Teacher2026! |
| Student | student@shiningsteps.app | Student2026! |

Students can join the demo class with code `SHINE1`.

## Deploy to Vercel + Neon

### 1. Create the Neon database

1. Sign up / log in at [neon.tech](https://neon.tech) and create a project.
2. Copy the **pooled** connection string and the **direct** connection string (both look like `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require` - the pooled one has `-pooler` in the host).

### 2. Switch the Prisma schema to Postgres

```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

### 3. Push the schema to Neon

```bash
export DATABASE_URL="<pooled connection string>"
export DIRECT_URL="<direct connection string>"
bunx prisma db push
bun prisma/seed.ts   # optional demo data
```

### 4. Deploy on Vercel

1. Push this repository to GitHub (see below) and import it at [vercel.com/new](https://vercel.com/new).
2. Set the environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `SESSION_SECRET` | any long random string (required in production) |

3. Deploy. That is it - everything runs on Vercel's Node runtime.

Alternatively use the one-click button once the repo is on your GitHub account:

```md
[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/shining-steps-diagnostic-arena&env=DATABASE_URL,DIRECT_URL,SESSION_SECRET)
```

## Pushing this repo to GitHub

```bash
git init -b main
git add .
git commit -m "Shining Steps Diagnostic Arena - first release"
git remote add origin https://github.com/YOUR-USERNAME/shining-steps-diagnostic-arena.git
git push -u origin main
```

## Project structure

```
src/
  app/
    page.tsx                    # the whole SPA: landing, routing, role guards
    api/
      auth/                     # signup, login, logout, me
      assessment/               # start, answer, finish, open (Big Task)
      attempts/                 # history, attempt detail, open-task prompt
      teacher/                  # classes, review (grading + pending list)
      admin/stats/              # center-wide statistics
      dashboard/                # public landing stats
  components/platform/          # kit (design system), runner, results, student,
                                # teacher, admin, auth
  lib/
    questions/                  # the question bank: types + level_0..level_8
    diagnostic.ts               # adaptive engine, scoring, bands, start-point logic
    gamification.ts             # XP ranks, badges, streaks
    session.ts / hash.ts        # auth (scrypt + HMAC cookie)
prisma/
  schema.prisma                 # local SQLite schema
  schema.postgres.prisma        # production Neon Postgres schema
  seed.ts                       # demo accounts + sample attempts
```

## Ownership

(c) Ahmed Mahmoud Saeed Ahmed Ali. All rights reserved. This platform is part of the Shining Steps academic system.
