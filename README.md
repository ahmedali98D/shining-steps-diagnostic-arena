# Shining Steps Fluency Ladder

The official Digital Diagnostic Assessment Platform for the **Shining Steps** academic system (L0-L8), created by [Ahmed Mahmoud Saeed Ahmed Ali](https://phronesis-studio.com/en/about).

An engaging, intelligent, adaptive placement examination that measures the four language pillars and identifies a student's real proficiency level - not just how many questions they answer correctly.

---

## Assessment methodology

The platform follows internationally recognized language assessment principles - CEFR, established adaptive testing practice, and evidence-centered design:

### 1. Progressive, bidirectional difficulty
- The exam begins at the student's initial proficiency level (their previous placement, or mid-ladder L3 for first-timers).
- Each pillar walks the ladder in small blocks: pass a block and the exam climbs; fail a block and it intelligently drops to reassess at a more appropriate level; land in between and one tiebreaker question decides.
- It is never a one-way staircase: the walk moves up AND down freely, revisiting levels when the evidence calls for it.

### 2. Confirmation and confidence
- A level is visited at most twice (initial block + confirmation block), mirroring the confirm-then-place procedure of professional adaptive placement tests.
- Every pillar result carries a confidence rating (high / medium / low) based on the amount and agreement of the evidence, so teachers know how solid each placement is.

### 3. All four pillars - each assessed the right way
| Pillar | How it is assessed | Where |
| --- | --- | --- |
| Reading | Adaptive questions on stories, notices, menus, timetables, essays | Digital platform |
| Listening | Adaptive spoken dialogues and announcements, played in the browser (two plays, transcript fallback) | Digital platform |
| Writing | Adaptive sentence construction, word order, emails and reviews, plus a Big Task graded by the teacher | Digital platform + teacher |
| Speaking | A live one-to-one interview with a teacher-examiner using the adaptive interview kit; six criteria scored on a 0-4 rubric: fluency, pronunciation, vocabulary, grammar accuracy, comprehension, conversation | Teacher examiner |

The speaking interview kit (9 kits, one per level) is generated from the actual Shining Steps books: warm-up, four prompts with their unit and lesson references, what to listen for, and explicit move-up / move-down cues - so the live interview follows the same adaptive ladder logic as the digital exam.

### 4. The final placement
- Overall level = the mean of the pillar placements, on the L0-L8 book ladder (L0 Pre-A1 ... L8 B2+, extending to L10 C1+ on the full series ladder).
- While the live speaking interview is missing, the overall placement is clearly marked **provisional (3 of 4 pillars)**; once the teacher saves the interview, the fourth pillar merges in and the overall level and fluency percentage finalize automatically.
- Every report shows: the fluency percentage toward a fluent voice, the CEFR band, the exact start point (Level, Unit, Lesson), the advice band (90-100% Excellent, 80-89% Very Good, 70-79% Good, 60-69% Needs Revision, below 60% Repeat the Level), and per-question feedback - why the right answer is right and why the student's answer did not work.

### 5. Time management
- The full diagnostic targets about 20-25 minutes (roughly 10 questions per pillar, capped), and quick single-pillar checks run 8-10 minutes.
- A gentle timer shows the target; past the fairness cap the exam wraps up by itself and scores the evidence collected - reliable but never exhausting.

### 6. Framework tagging on every question
Bloom's Revised Taxonomy, Webb's Depth of Knowledge (DOK), SOLO Taxonomy, Marzano, Understanding by Design (UbD), and Universal Design for Learning (UDL).

## CEFR mapping

| Level | CEFR | Book |
| --- | --- | --- |
| L0 | Pre-A1 | My First English Book |
| L1 | A1 | My Days, My Home, My Food |
| L2 | A1+ | My Town, My Shopping, My Week |
| L3 | A2 | My Life, My Town, My Work |
| L4 | A2+ | My Past, My Trips, My Plans |
| L5 | B1 | My Stories, My Voice, My World |
| L6 | B1+ | My Case, My News, My Community |
| L7 | B2 | My View, My Evidence, My World |
| L8 | B2+ | My Voice, My Craft, My Future |

153 questions, every one anchored to a real unit and lesson, tagged with the six frameworks and graded by difficulty - wrong answers always point to the exact pages to revise.

## Gamification

XP and ranks (Seed to Fluency Legend), ten badges, day streaks, confetti, the climbing star mascot and the L0-L10 fluency ladder - engaging without ever distracting from the measurement.

## Three desks

- **Student** - dashboard, adaptive exam, full report, history with progress in percentage points, badges.
- **Teacher** - classes with join codes, live student reports, Big Task grading, and the live Speaking interview desk with the adaptive kit and rubric.
- **Center** - center-wide averages per pillar, the level map, verdict bands and a live feed, with CSV export.

## Tech stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS 4 + shadcn/ui, Prisma ORM (SQLite in local development, PostgreSQL on Neon in production), scrypt password hashing + HMAC-signed session cookies, and a pure server-side adaptive engine (`src/lib/diagnostic.ts`).

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

1. Sign up / log in at [neon.tech](https://neon.tech) and create a project (or use the Vercel Marketplace: Storage - Neon - Connect to your Vercel project).
2. Copy the **pooled** connection string and the **direct** connection string.

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

1. Import the repository at [vercel.com/new](https://vercel.com/new) as project **shining-steps-fluency-ladder** (already created: [shining-steps-fluency-ladder.vercel.app](https://shining-steps-fluency-ladder.vercel.app)).
2. Set the environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string (used for migrations) |
| `SESSION_SECRET` | any long random string (required in production) |

3. Deploy - the build automatically switches Prisma to the Neon Postgres schema when `DATABASE_URL` is a Postgres connection string (`prisma/prepare-schema.js`). Everything runs on Vercel's Node runtime.
4. Check `GET /api/health` returns `"db": true`.

Note: if you deploy with the Vercel CLI instead, move your local `.env` file away first - the CLI injects local `.env` files into the deployment, which would override the project environment.

## Project structure

```
src/
  app/
    page.tsx                    # the whole SPA: landing, hash routing, role guards
    api/
      auth/                     # signup, login, logout, me
      assessment/               # start, answer (with time-cap wrap-up), finish, open (Big Task)
      attempts/                 # history, attempt detail, open-task prompt
      teacher/                  # classes, writing review, speaking interviews
      admin/stats/              # center-wide statistics
      dashboard/                # public landing stats
      health/                   # deployment health check
  components/platform/          # kit (design system), runner, results, student,
                                # teacher (incl. speaking desk), admin, auth
  lib/
    questions/                  # the question bank: types + level_0..level_8
    diagnostic.ts               # adaptive engine: bidirectional walk, confirmation
                                # blocks, confidence, scoring, bands, time budgets
    interviewKits.ts            # the 9 teacher-conducted speaking kits + rubric anchors
    speaking.ts                 # rubric scoring + fourth-pillar merge
    gamification.ts             # XP ranks, badges, streaks
    session.ts / hash.ts        # auth (scrypt + HMAC cookie)
prisma/
  schema.prisma                 # local SQLite schema
  schema.postgres.prisma        # production Neon Postgres schema
  seed.ts                       # demo accounts + sample attempts
```

## Ownership

(c) [Ahmed Mahmoud Saeed Ahmed Ali](https://phronesis-studio.com/en/about). All rights reserved. This platform is part of the Shining Steps academic system.
