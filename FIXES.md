# 🔧 Fixes Required

> Audit Date: 2026-05-16
> Project: phish-sim

---

## Critical

- [ ] **Email submitted to employee's real inbox instead of simulated one** — `app/inbox/[token]/inbox-client.tsx:52`
  `buildTrackedHtml` rewrites `href` values with `/api/track?...&redirect=<original>` but the inbox page is a simulation inside the app — it does not represent the employee's actual email client. However, the `email_opened` tracking pixel is fired via `useEffect` on every render/re-render of `InboxClient`, meaning the same token can register dozens of `email_opened` events if React re-renders. The effect has no guard to prevent double-firing. Add a `useRef` flag or deduplicate on the server side.

- [ ] **Credential capture sends the employee's real `email` field to the API** — `app/login/[campaignId]/[employeeToken]/login-simulation-client.tsx:138`
  The `handleSubmit` function sends `email: email.trim()` — the actual value the employee typed — to `/api/track`. The server's `sanitizeCredentialMetadata` does strip `password` but does **not** strip `email`. Real email addresses end up stored verbatim in `campaign_events.metadata`. This is unnecessary PII retention. Store only a boolean `emailEntered: true` or a hash, not the raw value.

- [ ] **`login-simulation-client.tsx` accepts query-string-controlled `senderName`, `senderEmail`, `subject`, `redFlags`** — `app/login/[campaignId]/[employeeToken]/page.tsx:155-168`
  These fields are taken straight from `searchParams` with only a `.trim()` check and injected into the training modal UI. A malicious actor can craft a URL like `/login/<id>/<token>?senderName=Your+CEO&senderEmail=ceo@realcompany.com` to spoof the debrief screen and undermine the training message. Strip or ignore all query-param overrides — the data should come exclusively from the database.

- [ ] **No rate-limiting on `/api/track`** — `app/api/track/route.ts`
  The tracking endpoint accepts `POST` requests unauthenticated (by design, since employees are not logged in). There is no rate-limiting, IP throttling, or token cooldown. An attacker who discovers a token (e.g. from a forwarded phishing email) can flood the endpoint to inflate stats or mark all employees as `credential_attempted`. Add per-token rate limiting (e.g. one `credential_attempted` write per token) at the database level or middleware.

- [ ] **`upload-logo` does not validate MIME type or file extension whitelist** — `app/api/upload-logo/route.ts:40-44`
  The route checks `file.size > 2 MB` but does not validate `file.type` against an allow-list (e.g. `image/png`, `image/jpeg`, `image/svg+xml`). A user can upload an HTML or SVG file with an image extension. SVG in particular can carry XSS payloads. Add: `const ALLOWED_TYPES = new Set(['image/png','image/jpeg','image/gif','image/webp']); if (!ALLOWED_TYPES.has(file.type)) return 400`.

- [ ] **`resolveTrackingContext` fetches up to 100 rows per token lookup** — `app/api/track/route.ts:57`
  `.limit(100)` is used to find the `sent` event for a token. Since tokens are UUIDs, there should be exactly one matching `sent` row. Scanning up to 100 rows on every tracking pixel load adds unnecessary DB load. Change to `.limit(1)` and add a DB index on `(metadata->>'token')` or switch to a dedicated `token` column.

- [ ] **`onboarding/_actions.ts` server actions lack auth checks on `orgId` parameter** — `app/onboarding/_actions.ts:18-26`
  `saveStep1(orgId, data)` and `saveContext(orgId, context)` accept an `orgId` argument from the caller without verifying the authenticated user actually owns that org. A crafted call can update any organisation's name/context. Fix: derive `orgId` from the server-side session inside each action (call `getOrgForUser()` internally) instead of trusting the client-supplied value.

- [ ] **`middleware.ts` does not protect `/onboarding` from authenticated-but-already-onboarded users** — `middleware.ts:44`
  Only unauthenticated users are redirected away from `/onboarding`. A fully onboarded user can revisit `/onboarding` and re-run server actions (`markOnboardingComplete`, `saveStep1`, etc.) to mutate org data at will. Add a redirect: if `user` is set and `org.onboardingCompletedAt` is non-null, redirect to `/dashboard`.

---

## Non-Critical

- [ ] **`effectiveDifficulty` uses title-case values (`"Medium"`) but launch route normalises to lower-case** — `app/dashboard/campaigns/new/page.tsx:40` vs `app/api/campaigns/[id]/launch/route.ts:30`
  `getTemplateById` returns `difficulty: "Medium"` (title-case). `normalizeDifficulty` lowercases before comparing, so `"Medium" → "medium"` works, but the stored `campaign.difficulty` value will be `"Medium"` (title-case) in the database, which is inconsistent with the enum expectation. Standardise on lower-case throughout and update the template definitions.

- [ ] **Dead `/api/campaigns/[id]/send` route** — `app/api/campaigns/[id]/send/route.ts`
  This route is a stub with a `console.info` and no actual email dispatch. It is never called by any UI or action — the real send path is `/launch`. The stub is misleading and could be accidentally wired up. Either remove it or add a clear `@deprecated` comment.

- [ ] **`getOrgForUser` is duplicated** — `lib/org.ts` and `app/onboarding/_actions.ts:61`
  Identical implementation exists in both files. The `_actions.ts` version is the one that should import from `lib/org.ts`. Delete the duplicate and update the import.

- [ ] **`toCompanyContext` maps `context.vendors` to both `vendors` and `tools`** — `app/api/campaigns/[id]/launch/route.ts:47`
  `tools: context.vendors ?? ""` — the `tools` field is set from the vendors value instead of a dedicated `tools` key. The `OrgContextRecord` type doesn't include `tools` at all. This means the AI prompt always receives an empty `tools` field for organisations that defined separate tool data. Map correctly or add `tools` to the `OrgContextRecord` type.

- [ ] **`scheduleAt` is a plain string in `CampaignSettingsFormValues` with no past-date validation** — `app/dashboard/campaigns/new/campaign-settings-form.tsx:14`
  The `scheduleAt` field is `string` and populated from a `datetime-local` input. No validation prevents a user from scheduling a campaign in the past. The UI allows submission; the server will then pass a past timestamp to Resend, which will reject it. Add client-side validation: `if (new Date(scheduleAt) < new Date()) setError(...)`.

- [ ] **`inbox-client.tsx` fires `email_opened` via `fetch` with no error handling** — `app/inbox/[token]/inbox-client.tsx:65-69`
  The `useEffect` tracking call has no `.catch()` or try/catch. A network error here goes completely silent. Add `.catch(console.error)` at minimum.

- [ ] **`next.config.ts` not read during audit — verify image domains and security headers** — `next.config.ts`
  The config file was not opened during this audit. Ensure `Content-Security-Policy`, `X-Frame-Options`, and `Strict-Transport-Security` headers are set. Without a CSP, the `dangerouslySetInnerHTML` in `inbox-client.tsx` (even behind DOMPurify) is at higher risk.
