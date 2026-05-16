# PhishSim

A phishing simulation and security awareness training platform built with Next.js 15, Supabase, and Drizzle ORM.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM + drizzle-kit |
| Storage | Supabase Storage (logo uploads) |
| UI | shadcn/ui (base-nova style) + Tailwind CSS v4 |
| Font | Inter |

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)

---

## 1. Clone and install

```bash
git clone <repo-url>
cd phish-sim
npm install
```

---

## 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set the three variables:

```env
# Found in Supabase dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Found in Supabase dashboard → Project Settings → Database → Connection string
# Use the "Transaction" pooler (port 6543) with ?pgbouncer=true
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
```

> The `DATABASE_URL` is used by Drizzle ORM for server-side writes (server actions). It bypasses Row Level Security, so keep it server-side only — never prefix it with `NEXT_PUBLIC_`.

### MiniMax AI (optional)

For AI-generated campaign content (`contentMode: ai` or `hybrid`), set:

```env
MINIMAX_API_KEY=<your-key>
MINIMAX_MODEL=MiniMax-M2.7
AI_LAUNCH_CONCURRENCY=2
```

See `.env.local.example` for all AI-related variables. Campaigns with `contentMode: static` (default) do not require MiniMax.

---

## 3. Supabase setup

### 3a. Run database migrations

Apply the Drizzle migrations to your Supabase Postgres database:

```bash
npm run db:migrate
```

This creates the following tables: `organizations`, `employees`, `campaigns`, `campaign_events`.

If you change the schema in `lib/db/schema/`, regenerate the migration first:

```bash
npm run db:generate   # creates a new SQL file in drizzle/
npm run db:migrate    # applies it
```

To inspect the database interactively:

```bash
npm run db:studio     # opens Drizzle Studio at https://local.drizzle.studio
```

### 3b. Create the logo storage bucket

Go to your Supabase dashboard → **Storage** → **New bucket**:

- Name: `logos`
- Public bucket: **yes** (so uploaded logo URLs are publicly readable)

Without this bucket, logo uploads on the onboarding page will fail.

### 3c. Auth settings (optional)

By default the app assumes **no email confirmation** is required. If your Supabase project has email confirmation enabled (Authentication → Providers → Email → "Confirm email"), users will need to verify their email before they can sign in. The signup page does not currently show a "check your email" prompt — add one if needed.

---

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## App routes

| Route | Description |
|---|---|
| `/login` | Email + password sign in |
| `/signup` | Create account + organization |
| `/onboarding` | 3-step setup wizard (company details, context, review) |
| `/dashboard` | Protected — requires auth |

The middleware in `middleware.ts` redirects unauthenticated users away from `/dashboard/*` to `/login`, and redirects already-authenticated users away from `/login` and `/signup` to `/dashboard`.

---

## Project structure

```
app/
  (auth)/
    layout.tsx          # Centered auth shell
    login/page.tsx      # Sign-in form
    signup/page.tsx     # Sign-up form + org creation
    _actions.ts         # createOrganization server action
  onboarding/
    page.tsx            # 3-step onboarding wizard
    _actions.ts         # saveStep1, uploadLogo, saveContext, getOrgForUser
  layout.tsx            # Root layout (Inter font, globals)
  globals.css           # Tailwind v4 theme + DESIGN.md tokens

components/ui/          # UI primitives
  button.tsx
  input.tsx
  label.tsx
  card.tsx
  select.tsx
  textarea.tsx
  separator.tsx

lib/
  db/
    index.ts            # Drizzle db client (postgres driver)
    schema/             # Table definitions
      organizations.ts
      employees.ts
      campaigns.ts
      campaign-events.ts
      enums.ts
      relations.ts
  supabase.ts           # createBrowserClient / createServerClient helpers

middleware.ts           # Route protection + session refresh
drizzle/                # Generated SQL migrations
drizzle.config.ts       # Drizzle Kit config
```

---

## Design system

The UI follows a Notion-inspired design system documented in `DESIGN.md`. Key tokens are available as CSS custom properties (prefixed `--ds-*`) in `app/globals.css`, e.g.:

```css
var(--ds-primary)         /* #5645d4 — Notion purple */
var(--ds-surface)         /* #f6f5f4 — page background */
var(--ds-canvas)          /* #ffffff — card background */
var(--ds-hairline)        /* #e5e3df — card borders */
var(--ds-hairline-strong) /* #c8c4be — input borders */
var(--ds-error)           /* #e03131 — validation errors */
var(--ds-link)            /* #0075de — inline links */
```

Buttons use `rounded-[8px]` (not pills). Cards use `rounded-[12px]`. Inputs are 44px tall.
