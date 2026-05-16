# 🚀 Suggested Improvements

> Audit Date: 2026-05-16
> Project: phish-sim

---

## Code Quality

- **Centralise auth + org resolution into a single helper** — `getOrgForUser` is duplicated across `lib/org.ts` and `app/onboarding/_actions.ts`, and inlined ad-hoc in every API route (`db.select...from organizations.where(userId)`). Extract a single `requireOrgForRequest()` helper that resolves the user + org and throws/returns a standard 401/404 response. Every route and server action should call this instead of repeating the same 10 lines.

- **Replace the `unknown`-cast JSON metadata pattern with Zod schemas** — `campaign_events.metadata` is accessed everywhere via `isJsonRecord()` chains and string-key lookups (`pickString`, `firstString`). This is fragile and hard to maintain. Define a Zod schema for the metadata shape (e.g. `CampaignEventMetadata`) and parse at the boundary once — in the server component or API handler — so the rest of the code is fully typed.

- **`CampaignDifficulty` type uses title-case (`"Easy"`, `"Medium"`, `"Hard"`) inconsistently with DB values** — Standardise difficulty as a lower-case enum across templates, DB schema, and API. Update `campaign-templates.ts` and the `<Select>` option values to match.

- **`lib/supabase/server.ts` exports both `createServerClient` and `createServiceRoleClient` but usage is inconsistent** — Several places do `const svc = createServiceRoleClient(); const client = svc ?? supabase` which silently falls back to the anon client if the service role key is missing. This can cause silent permission errors in production. Make `createServiceRoleClient()` throw if `SUPABASE_SERVICE_ROLE_KEY` is not set, or document clearly when anon fallback is intentional.

- **`campaign-templates.ts` not audited** — The template definitions (categories, default difficulties, titles) were not read in this audit. Ensure template IDs match the `resolveLoginVariant()` string mappings in `login/page.tsx` — if a template ID is added without updating that function, users will always land on the `microsoft365` variant.

---

## Performance

- **N+1 DB queries in `inbox/[token]/page.tsx`** — `getInboxMessage` fetches the event first, then fires two parallel queries for employee + campaign. This is acceptable, but if inbox ever shows multiple messages, it will become a serious N+1. Structure is fine for now; add a comment noting the limitation.

- **`getDashboardStats` makes 3 separate DB round-trips** — `lib/db/queries/dashboard.ts` runs an employee count query, a campaign status query, and then calls `listCampaignsByOrg` (a fourth query). These can be collapsed into 2 queries using `count()` with `groupBy` for campaign statuses, reducing round-trips by 50%.

- **`resolveTrackingContext` is called twice per `GET /api/track` request** — Once directly in the `GET` handler and again inside `insertEvent`. This results in 2 identical DB lookups per tracking pixel load. Extract the context resolution before calling `insertEvent` and pass it in.

- **No pagination on employee lists** — `listEmployeesByOrg` and `getEmployeesByOrg` return all employees with no limit. For orgs with thousands of employees, this will load the entire table into memory. Add cursor-based pagination and a search filter for the `EmployeeMultiSelect` component.

---

## Security

- **`dangerouslySetInnerHTML` with DOMPurify is correct, but verify CSP is set** — `inbox-client.tsx` uses DOMPurify correctly with `USE_PROFILES: { html: true }`. However, without a strict `Content-Security-Policy` header (especially `script-src`), a stored XSS in the AI-generated email body that slips past DOMPurify would execute. Add a tight CSP in `next.config.ts` with `script-src 'self'`.

- **Tracking tokens are UUIDs in query strings — consider HMAC-signed tokens** — UUIDs are random enough to prevent guessing, but they are visible in email headers, server logs, and forwarded messages. An HMAC-signed token (e.g. `base64(campaignId + employeeId + hmac)`) would allow token verification without a DB lookup and would bind the token to a specific employee, preventing token reuse across campaigns.

- **No CSRF protection on POST `/api/track`** — The endpoint accepts unauthenticated POST requests. While this is necessary for the tracking pixel flow, it should at minimum check `Content-Type: application/json` and reject other content types to prevent form-based CSRF from third-party sites inflating stats.

- **Resend `from` address defaults to a literal placeholder** — `DEFAULT_FROM_EMAIL = "security@yourdomain.com"` in `launch/route.ts`. If `RESEND_FROM_EMAIL` is not set, Resend will reject every send with a domain verification error, but the error message is opaque. Add a startup check that throws clearly if neither `RESEND_FROM_EMAIL` nor a verified domain is configured.

- **`upload-logo` stores logos at a predictable path `{userId}/logo.{ext}`** — The public URL is deterministic. Any user who knows another user's UUID (e.g. from a leaked JWT) can directly access their logo. This is low severity since logos are not sensitive, but consider using a non-guessable path like `{userId}/{randomUUID}.{ext}`.

---

## Testing

- **Zero test files found** — The project has no unit tests, integration tests, or end-to-end tests. Priority areas to cover first:
  1. `lib/ai.ts` — `extractJson` and `findFirstJsonObject` are complex parsing logic with edge cases; unit test these with malformed AI responses.
  2. `app/api/track/route.ts` — The `sanitizeCredentialMetadata` function strips passwords; test that it behaves correctly with missing/malformed input.
  3. `app/api/campaigns/[id]/launch/route.ts` — The stagger/schedule logic is the source of the original bug; test all combinations of `sendImmediately` × `staggerSends` × `campaign.schedule`.
  4. `middleware.ts` — Route protection logic should be tested with mock requests for each protected path.

- **No CI/CD pipeline configuration found** — Add a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `next build`, `eslint`, and tests on every PR.

---

## Documentation

- **README.md is present but content not audited** — Verify it covers: local setup (env vars required), database migration steps (`db:push` vs `db:migrate`), Resend domain verification requirements, and how to run the seed script.

- **Missing ADR (Architecture Decision Record) for Supabase + Drizzle dual-client pattern** — The project uses both the Supabase JS client (for auth and storage) and Drizzle ORM (for data queries) against the same PostgreSQL database. This is a deliberate architectural choice but it is undocumented. New contributors will be confused about which client to use when. Add a short note in the README or a `docs/architecture.md`.

- **`DESIGN.md` exists but was not audited** — Ensure it is up to date, especially around the inbox simulation and login simulation flows which appear to have been added after initial design.

- **No JSDoc on exported functions in `lib/`** — Public functions like `generatePhishingEmail`, `getOrgForUser`, `listEmployeesByOrg` have no documentation comments. Add JSDoc to at minimum describe the parameters, return value, and any notable side effects (e.g. DB writes).

---

## Accessibility

- **`InboxClient` sidebar navigation buttons have no `aria-current`** — The "Inbox" button in `inbox-client.tsx` is visually active (blue background) but has no `aria-current="page"` attribute. Screen readers cannot identify the current section.

- **Login simulation form inputs lack `<label>` elements** — `login-simulation-client.tsx` uses bare `<input>` elements with `placeholder` only. Placeholder text is not a substitute for labels. Add `<label htmlFor="...">` elements (can be visually hidden) for each input.

- **`LoginSimulationClient` modal uses a custom `div` overlay instead of a `<dialog>` or a focus-trapped component** — The "This was a phishing simulation" modal (`showModal`) does not trap focus or restore focus on close. Users navigating by keyboard can tab behind the modal. Replace with a proper dialog component (the project already has `@/components/ui/dialog` used in `inbox-client.tsx`) for consistent, accessible behaviour.
