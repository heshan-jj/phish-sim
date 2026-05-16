# 📋 Audit Summary

> Audit Date: 2026-05-17
> Project: phish-sim

---

## Health Score: 7.5 / 10

This is a well-structured, thoughtfully designed product. The codebase is clean, TypeScript strict mode is on, the AI abstraction layer is solid, and the tracking pipeline shows genuine security thinking (deduplication guards, no 404 leakage, credential sanitisation). The main risks are a silent stub route, concurrency bugs in the launch hot path, a weak token resolution query that will not scale, and thin test coverage for the most critical flows.

---

## Tech Stack

- **Runtime:** Node.js (Next.js 15 App Router, server + edge)
- **Framework:** Next.js 15 with Turbopack
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4, shadcn/ui, Framer Motion
- **Database:** PostgreSQL via Supabase (Drizzle ORM)
- **Auth:** Supabase Auth (SSR cookie-based)
- **Email delivery:** Resend
- **AI:** MiniMax M2.7 (configurable; vishing, smishing, email generation)
- **Testing:** Node.js built-in test runner (`node:test`)

---

## Project Stats

| Metric | Value |
|---|---|
| Source files scanned | ~40 |
| Critical fixes needed | 6 |
| Non-critical fixes | 5 |
| Improvement suggestions | 17 |
| Test files | 2 |
| Test cases | ~8 |

---

## Key Findings

**Strengths:** The AI content pipeline is exceptionally well-engineered — retry harness with exponential backoff, strict JSON extraction with fallback scanning, concurrency limiting, and graceful static fallback when AI is unavailable. The tracking endpoint is a standout: it never returns 404, sanitises credential metadata before storage, broadcasts real-time events, and applies three layers of deduplication. Drizzle schema is clean and the Supabase SSR integration follows best practices.

**Weaknesses:** The `/send` API route is a no-op stub that returns 200 and does nothing — any caller relying on it will be silently misled. The stagger scheduling logic mutates shared state inside a `Promise.all`, creating a race condition that will produce incorrect send times under load. Token resolution queries a JSONB `contains` index on a table that will grow to millions of rows — this will become the performance bottleneck first.

---

## Risk Areas

1. **Silent stub + race condition in campaign launch** — The `/send` route does nothing, and the stagger mutation in the launch route's `Promise.all` is a latent concurrency bug. Both affect the core product loop (sending campaigns) and should be fixed before scaling up recipient lists.

2. **Token resolution will not scale** — `resolveTrackingContext` performs a JSONB containment query on `campaign_events` with no dedicated index. Add a `token` column with a B-tree index (or a separate lookup table) before the events table exceeds ~100k rows, or tracking pixel and click responses will degrade significantly.

3. **Near-zero test coverage on critical paths** — The tracking deduplication guards, campaign launch batching, and all API route handlers are completely untested. A regression in the compromised-status guard or the flood-protection check would go undetected until production. Adding integration tests for the tracking pipeline is the highest-leverage testing investment.
