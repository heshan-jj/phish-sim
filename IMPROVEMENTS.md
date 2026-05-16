# 🚀 Suggested Improvements

> Audit Date: 2026-05-17
> Project: phish-sim

---

## Code Quality

- **Consolidate AI module boundary** — `lib/ai.ts`, `lib/ai-extended.ts`, `lib/ai-launch.ts` all contain related logic spread across three files with separate `SYSTEM_PROMPT` constants that are identical. Extract a shared `lib/ai/index.ts` barrel with a single system prompt constant, `callMinimax`, and `generateWithRetry`, then re-export specialised generators from sub-modules. This eliminates the duplicated constant and makes the AI surface area clearer.

- **`findFirstJsonObject` is a hand-rolled JSON scanner** — `lib/ai.ts:140`
  The brace-counting parser will silently truncate nested objects that contain unbalanced braces inside string values with escaped characters. Consider using a battle-tested streaming JSON parser (e.g. `partial-json` or `jsonrepair`) for the fallback path, or validate by round-tripping through `JSON.stringify` after parsing.

- **`runWithConcurrency` is defined but the launch route does not use it** — `lib/ai-launch.ts`
  The concurrency-limiting helper is exported but the main `POST` handler in the launch route uses `Promise.all` within each batch unconditionally. Wire up `runWithConcurrency` with `AI_CONCURRENCY` for the per-recipient AI generation calls inside the batch loop, otherwise concurrent AI calls will exceed the configured limit.

- **`campaign-send` route should be removed or replaced** — `app/api/campaigns/[id]/send/route.ts`
  The route is a stub that does nothing. Dead API surface in a security product creates confusion and risk. If it serves a future purpose, document it with a `// TODO` and return `501 Not Implemented`; otherwise delete it.

- **`getOrgForUser` uses `cache()` from React** — `lib/org.ts`
  React's `cache()` deduplicates calls within a single render pass, which is correct for Server Components. However, it is imported from `"react"` — make sure the function is never called from client components or API route handlers where the cache boundary doesn't apply. Consider adding a runtime guard or moving org lookup into a dedicated server-only module (`"server-only"` package).

---

## Performance

- **No pagination on employee queries** — `lib/db/queries/employees`
  `listEmployeesByOrg` and `getEmployeesByOrg` appear to return all employees without a limit. For organisations with thousands of employees, this will load the entire table into memory on every launch. Add pagination or streaming for the launch batch loop.

- **Tracking pixel resolution scans up to 100 rows** — `app/api/track/route.ts:resolveTrackingContext`
  The token resolution query uses `.contains("metadata", { token })` on the `campaign_events` table and limits to 100 rows. As the events table grows this JSONB containment query will become slow. Add a dedicated `token` column (indexed) to `campaign_events`, or store a separate `campaign_sends` table with `(token, campaign_id, employee_id)` as a fast lookup index.

- **`nextImmediateScheduledAt` mutation in concurrent `Promise.all`** — `app/api/campaigns/[id]/launch/route.ts`
  The stagger logic mutates `nextImmediateScheduledAt` inside `batch.map(async ...)`, which runs concurrently via `Promise.all`. Multiple async tasks may read and overwrite the same date simultaneously, producing incorrect schedules. Move the stagger computation outside the async lambda or use a sequential loop for that code path.

---

## Security

- **Content Security Policy uses `unsafe-inline` and `unsafe-eval`** — `next.config.ts`
  The CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. These directives negate most XSS protection CSP provides. Migrate to nonce-based CSP (Next.js supports this natively) and remove `'unsafe-eval'` unless required by a specific dependency. Also, the `connect-src 'self' https:` rule allows connections to any HTTPS origin — tighten to specific hosts (Supabase, MiniMax, Resend domains).

- **No rate limiting on `/api/generate` or `/api/campaigns/[id]/launch`** — these routes call the MiniMax API per recipient. A single authenticated user could trigger thousands of AI API calls (and cost) by launching a large campaign or hammering the generate endpoint. Add per-user rate limiting (e.g. Upstash Redis or a simple in-memory window for low traffic) and a max-recipient cap at the API layer.

- **`normalizeRedirect` allows any `https:` URL** — `app/api/track/route.ts:normalizeRedirect`
  The open-redirect validator only rejects non-http(s) protocols. A phishing link that points to `https://evil.com` will be tracked and then redirected. For a phishing *simulation* product this is intentional (the attacker URL is the point), but the internal tracking pixel redirect to the login page should use an allow-list of your own origins to prevent the tracking endpoint from being abused as a general-purpose open redirector.

- **`smishingToEmailHtml` builds HTML by string interpolation** — `lib/ai-launch.ts`
  Addressed in FIXES.md but worth also noting as a security concern — stored AI-generated HTML sent via Resend runs in the recipient's email client. DOMPurify should be applied before inserting `message` into the HTML template.

- **No CSRF protection on POST API routes** — API routes under `app/api/` rely on the Supabase session cookie for authentication but have no CSRF token check. Next.js App Router is not automatically CSRF-safe for cookie-authenticated routes. Add `SameSite=Strict` (or `Lax`) to the auth cookie (check Supabase SSR defaults) or add a custom header check (`x-requested-with`) for mutation endpoints.

---

## Testing

- **Test suite covers only two modules with four test cases total** — `lib/__tests__/`
  `scoring.test.ts` has good coverage of the scoring logic but `ai.test.ts` was not scanned (skipped by the test script). Critical paths with zero tests include: the tracking event pipeline, campaign launch batching, middleware auth logic, and all API route handlers. Prioritise adding tests for the tracking deduplication guards (compromised gate, flood protection) as these directly affect data integrity.

- **No integration or E2E tests** — no Playwright or Cypress configuration found. For a product that sends real emails and tracks user behaviour, an E2E smoke test (mock Resend → send → track open → track click → assert event rows) would catch regressions in the most important user flows.

- **`scoring.test.ts` missing edge cases** — the test for "opened + clicked + reported + credentials_submitted → 50" coincidentally passes for the right reason, but there is no test for the `call_answered` + no credential path (should be no penalty), or for the 0/100 score boundary clipping.

---

## Documentation

- **`README.md` references `DATABASE_URL` setup but not `DATABASE_URL_MIGRATE` / `DATABASE_URL_DIRECT`** — the `drizzle.config.ts` has sophisticated fallback logic for three different URL variables, but the README only documents `DATABASE_URL`. Add a section explaining when to use each variable (pooled vs. direct connection).

- **`DESIGN.md` is 35 KB** — this is the largest source file in the project. Its contents were not audited, but if it documents system architecture, consider splitting it into a `docs/` folder with per-topic files for easier navigation.

- **No `.env.local` validation at startup** — missing required environment variables (e.g. `RESEND_API_KEY`) are only discovered at runtime when the first campaign is launched. Add a startup validation step (e.g. a `scripts/check-env.ts` or using the `@t3-oss/env-nextjs` package) that checks all required variables and fails fast with a clear error.

- **`sample-employees.csv` lacks a header row comment** — the CSV is useful for onboarding, but there is no documentation of what the expected columns are or how seniority/department values are used by the system. Add a note in the README linking to the file and explaining the format.
