# 🔧 Fixes Required

> Audit Date: 2026-05-17
> Project: phish-sim

---

## Critical

- [ ] **Duplicate campaign-send route is a stub** — `app/api/campaigns/[id]/send/route.ts`
  This route validates recipients and logs them but never actually sends anything — it returns `{ ok: true }` unconditionally. The real dispatch is entirely in the `/launch` route. The `/send` route will silently succeed while doing nothing, which will confuse callers. Either remove it, redirect to `/launch`, or implement it fully.

- [ ] **Database connection created at module load time** — `lib/db/index.ts`
  `postgres(getDatabaseUrl())` is called at import time. In Next.js this means the connection is established during the module graph initialisation (before `.env.local` is necessarily loaded in some edge cases) and is never closed on hot-reload. Use lazy initialisation (a singleton getter) instead so the connection is only opened on first use.

- [ ] **Middleware auth bypass for `/dashboard`** — `middleware.ts:9-16`
  The dashboard fast-path only checks for the presence of any cookie whose name starts with `sb-` and contains `auth-token`. It does **not** validate the token cryptographically. A user with an expired or revoked session cookie will pass through. This is noted as an intentional trade-off in a comment, but the server-side `requireDashboardOrg` guard must be called on every dashboard page/layout — verify this is consistently applied everywhere under `app/dashboard/`.

- [ ] **`getEmployeesByOrg` vs `listEmployeesByOrg` — two different functions for the same thing** — `app/api/campaigns/[id]/send/route.ts:6` vs `app/api/campaigns/[id]/launch/route.ts:13`
  The send route imports `getEmployeesByOrg` while the launch route imports `listEmployeesByOrg`. Both presumably do the same thing. One of them may be stale or missing fields. Consolidate to a single, canonical export.

- [ ] **IP address header trusted without validation** — `app/api/track/route.ts:~350`
  `x-forwarded-for` and `x-real-ip` are taken directly from request headers and stored as the `ip` field on every event. These headers can be spoofed by any client. Either validate that the request came through a trusted reverse proxy before trusting these headers, or document clearly that the stored IP is untrusted.

- [ ] **`test` script only runs one test file** — `package.json`
  The `"test"` script is `tsx --test lib/__tests__/ai.test.ts`. It skips `scoring.test.ts` entirely. Fix to `tsx --test lib/__tests__/*.test.ts` (or use `--test-pattern`).

---

## Non-Critical

- [ ] **`SUPABASE_SERVICE_ROLE_KEY` silently returns `null`** — `lib/supabase/server.ts:createServiceRoleClient`
  When the key is absent, `createServiceRoleClient()` returns `null` and the tracking route falls back to the anon client. The anon client is subject to RLS, so tracking writes will silently fail in production if the service role key is not set. Log a warning at startup or throw if the key is absent in non-test environments.

- [ ] **`_actionUrl` variable computed but never used** — `app/api/campaigns/[id]/launch/route.ts:~160`
  `const _actionUrl = channel === "vishing" ? callUrl : ...` is assigned and then prefixed with `void _actionUrl` to suppress the lint warning. The variable should be removed entirely; the individual channel branches already use `loginUrl`/`callUrl`/`smsUrl` directly.

- [ ] **`smishingToEmailHtml` embeds unsanitised user content** — `lib/ai-launch.ts`
  The `message` and `senderLabel` fields returned by the AI are interpolated directly into an HTML string with template literals. If the AI produces content containing `<script>` or other HTML, it will be rendered verbatim. Sanitise with DOMPurify (already a dependency) or escape the strings before inserting.

- [ ] **`eslint.config.mjs` runs lint without `--max-warnings`** — `package.json`
  `"lint": "eslint"` with no arguments will lint nothing unless a path is specified. Add a path: `"lint": "eslint ."` and consider `--max-warnings 0` to enforce zero warnings in CI.

- [ ] **Font loaded from Google Fonts with `eslint-disable` comment** — `app/layout.tsx:23`
  `@next/next/no-page-custom-font` is disabled instead of using `next/font/google` which handles self-hosting, eliminates the FOUT, and removes the dependency on an external CDN. Migrate to `next/font`.
