# 📋 Audit Summary

> Audit Date: 2026-05-16
> Project: phish-sim

---

## Health Score: 6 / 10

Solid foundations with good TypeScript discipline, a clean data model, and well-structured Next.js conventions. The core send pipeline was broken by three compounding bugs (now fixed). Several security issues need attention before this tool handles real employee data at scale.

---

## Tech Stack

- **Runtime:** Node.js (Next.js 15, App Router)
- **Framework:** React 19 (Server + Client Components)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL via Supabase + Drizzle ORM
- **Auth:** Supabase Auth + SSR cookie session
- **Email dispatch:** Resend SDK v6
- **AI generation:** MiniMax M2.7 (custom REST client)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Storage:** Supabase Storage (logos bucket)

---

## Project Stats

| Metric | Value |
|---|---|
| Source files scanned | ~45 |
| API routes | 5 (`generate`, `track`, `upload-logo`, `campaigns/[id]/launch`, `campaigns/[id]/send`) |
| DB tables | 5 (`organizations`, `employees`, `campaigns`, `campaign_events`, + enums) |
| Critical fixes needed | 7 |
| Non-critical fixes needed | 6 |
| Improvements suggested | 17 |
| Test files found | 0 |

---

## Key Findings

The project is a well-scoped phishing simulation SaaS with a clear domain model and a sensible three-step campaign wizard. The AI email generation pipeline (MiniMax → JSON extraction → Resend) is thoughtfully built with retry logic and exponential backoff. The inbox simulation (fake Gmail UI with DOMPurify-sanitized email rendering) and login simulation (branded fake login pages for M365/Workday/DocuSign/Slack) are genuinely clever UX for security training.

**The original send failure** had three root causes in `launch/route.ts`: (1) `scheduledAt` was always passed to Resend even for immediate sends, causing past-time rejections; (2) `staggerSends` was ignored — the stagger window was applied unconditionally; (3) `replyTo` was camelCase, which Resend SDK v3+ dropped in favour of snake_case `reply_to`. All three are now fixed.

**The most concerning issues going forward** are around data handling and auth: server actions (`saveStep1`, `saveContext`) accept a caller-supplied `orgId` without verifying ownership, raw employee email addresses are persisted in event metadata on credential capture, and the login simulation page blindly trusts query-string parameters to populate the debrief UI — all of which could be exploited.

---

## Risk Areas

**1. PII retention in `campaign_events.metadata`**
When an employee submits credentials on the fake login page, their typed email address is stored verbatim in the database. `sanitizeCredentialMetadata` strips the password but not the email. For a tool whose entire purpose is security awareness, storing real credentials — even partial — is both a legal risk (GDPR, CCPA) and an ethical one. Fix: store only `emailEntered: true` and `passwordLength`.

**2. Server action `orgId` trust**
`saveStep1(orgId, data)` and `saveContext(orgId, context)` in `onboarding/_actions.ts` are Next.js Server Actions callable from the client. They accept `orgId` as a parameter and update the organisation with that ID without verifying the session user owns it. A logged-in user can overwrite any organisation's name and context by replaying the action with a different `orgId`. Fix: derive `orgId` inside the action from `getOrgForUser()`.

**3. Zero test coverage**
There are no tests. The send pipeline bug that triggered this audit would have been caught by a test for the `sendImmediately=true` path. Given the complexity of the `launch/route.ts` logic (batching, staggering, retry, tracking URL injection, business hours calculation), this is the single highest-value area to add tests first.
