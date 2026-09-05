# R&D Findings — Firebase Analytics (GA4) Spike

**Author:** [your name]
**Date:** [date]
**Status:** Spike complete through Step 4; Step 5 blocked pending billing access
**Related:** ADR-003 (First-Party Analytics), views-counter ticket (Firestore `views` field + dashboard wiring)

---

## 1. Purpose

Investigate whether Google Analytics for Firebase (GA4) — suggested by the scrum master as a
potential new analytics infrastructure — is a viable way to cover gaps the current Firestore
counter design (ADR-003) can't address: visitor sessions, device/browser breakdown, and a real
day-by-day/monthly traffic trend.

This was scoped as an **implementation spike**, not a documentation-only review — the goal was to
actually wire GA4 into the app and observe real behavior (script loading, ISR interaction, consent
behavior, data retrieval), rather than rely solely on secondhand docs.

**Important scope note:** "Firebase Analytics" and "Google Analytics for Firebase (GA4)" are the
same product — Firebase Analytics is simply the Firebase-branded entry point into a standard GA4
property. Everything below applies to both namings.

---

## 2. Relationship to ADR-003

ADR-003 evaluated Google Analytics by name during its original decision process and explicitly
rejected it, citing:
- Cookie-consent/privacy overhead
- Reader data leaving to a third party (Google)
- Ad-blocker gaps undercounting traffic

Adopting GA4 now would **reverse** that decision, not extend it — unlike the site-wide monthly
Firestore counter proposal (a separate, smaller idea discussed earlier), which stayed inside
ADR-003's "first-party only, Firestore-based" principle. If GA4 moves forward, it should go
through as a **formal ADR-003 supersession**, with the consent question explicitly answered, not
be folded into an existing ticket.

---

## 3. Setup

- Added GA4 to the existing Firebase project via **Project settings → General → Your apps** (no
  web app was previously registered — the project had only ever been used via the Admin SDK,
  confirmed by `.env.example` containing only service-account credentials, no client-side Firebase
  config).
- Registered a new Web App, obtained `measurementId` (`G-XXXXXXXXXX`).
- Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local` (public-safe, not a secret).
- Wired the standard `gtag.js` snippet into `app/layout.tsx` via Next.js's `<Script>` component,
  `strategy="afterInteractive"`, gated behind the env var so it no-ops when unset.

### ⚠️ Scoping issue found during setup

`app/layout.tsx` is the **shared root layout for both the `(public)` and `(staff)` route groups.**
Placing the GA4 script here means it currently tracks **staff/CMS pages too, not just
reader-facing ones** — which is almost certainly not desired long-term. There's no reason to track
"views" of the staff dashboard itself.

This was left as-is for the spike, since the immediate goal was only to confirm the script fires
correctly — but it's flagged here as a **required fix before any real rollout**: the script should
move into `app/(public)/layout.tsx` instead of the shared root layout, so staff/CMS routes are
never instrumented. `app/(staff)/layout.tsx` has its own separate auth/session logic (Herald SSO)
and shell, and is unaffected by where the GA4 script lives, since it doesn't touch shared root
layout internals.

---

## 4. Findings by step

### Step 1 — GA4 property setup
No code involved. Confirmed the project had no registered client-side "app" prior to this spike
(Admin SDK access ≠ a registered Web App with `measurementId`). Registering a web app and enabling
Analytics was straightforward once given the right access level (Editor) on the Firebase project.

### Step 2 — Script loads correctly
Confirmed via:
- A `gtag/js` request to `googletagmanager.com` in the Network tab, and
- Firebase Console's Realtime view showing "1 active user" after loading a page.

No issues. Standard `<Script strategy="afterInteractive">` integration works cleanly with the
existing root layout structure (aside from the scoping issue in §3).

### Step 3 — ISR interaction (the critical test) ✅ **GA4 passes**
This was the most important technical question: our Firestore `views` counter, when called
inside a Server Component's render, only fires on ISR cache regeneration (roughly once per
`revalidate` window) rather than on every real visit — since cached requests never re-execute the
component.

**Confirmed via direct observation (Network tab, filtered on `collect`):** reloading the same
ISR-cached article page (`revalidate = 3600`) multiple times in a row produced a **new `collect`
request on every single reload**, with a few seconds' delay each time (normal GA4 batching
behavior, not a bug).

**Why:** GA4's tracking script runs client-side, in the browser, after the page has loaded —
it is completely decoupled from whether the underlying HTML was server-rendered fresh or served
from cache. This means **GA4 does not need the route-handler + client-mount workaround** we
designed for the Firestore counter to fix the same problem — it sidesteps the ISR trap by
construction.

### Step 4 — Consent behavior ✅ **Confirmed: tracks by default, no gate**
No consent-related code (no banner, no Consent Mode API calls) was added at any point in this
spike. Despite that, the script fired unconditionally on every page load throughout Steps 2-3 —
this **is** the answer to the consent question, since the conditions were identical to what a
real zero-consent deployment would look like.

**Conclusion:** GA4 tracks immediately and unconditionally out of the box. A real implementation
would require **both**:
1. A user-facing consent banner (UI/UX work, not present today), and
2. Explicit **Consent Mode** wiring (`gtag('consent', ...)` calls) to actually gate tracking based
   on that banner's outcome.

Neither exists in the current spike or anywhere else in the codebase. This is nonzero
engineering + design + legal-review work, and it's the primary overhead ADR-003 cited when
rejecting Google Analytics originally.

### Step 5 — Pulling data back into our own dashboard ⛔ **Blocked**
Goal: use the Google Analytics Data API to pull GA4 metrics into `AnalyticsView` (the actual staff
dashboard component), rather than requiring staff to leave the app and check Google's own console.

**Important scope clarification:** Steps 1-4 already answer "does GA4 work" — Step 5 is a purely
mechanical question about round-tripping data into our own UI, not a further test of GA4's
tracking quality.

**Blocked on:** enabling the Data API requires an active Google Cloud billing account with a
verified payment method attached — a platform-wide Google Cloud policy (identity verification),
not something specific to Analytics or an indication of expected charges. Per Google's own
documentation:
- The card authorization is a temporary hold (typically ~$50), not an actual charge, released
  within roughly a week.
- Actual Data API usage should stay well within free-tier quotas at TC's traffic scale (~165
  views/day vs. 25,000 core-tokens/day free tier).
- However, **a Cloud Billing account must have a valid payment method on file to remain in good
  standing indefinitely** — not just at setup. Without one, billing/API access gets suspended.

Since this project isn't personally owned by the spike author, attaching a personal card raises an
ownership/liability question that shouldn't be resolved unilaterally. **Recommendation: the
project owner (CTO/DCTO, named as ADR-003's original deciders) should provide the billing account
and payment method**, rather than an individual contributor's personal card being tied to
org infrastructure indefinitely.

---

## 5. Summary table

| Question | Answer | Confidence |
|---|---|---|
| Does the GA4 script load and fire events? | Yes | Directly observed |
| Does it survive ISR caching (our known failure mode)? | Yes — client-side, unaffected by cache | Directly observed |
| Does it track by default with no consent gate? | Yes | Directly observed |
| Can we pull GA4 data into our own dashboard? | Not yet verified — blocked on billing account | Blocked, not failed |
| Does this fit inside ADR-003? | No — reverses the ADR's explicit rejection of Google Analytics | Confirmed via ADR text |

---

## 6. Open items / recommendations

1. **Root layout scoping (see §3):** if GA4 moves forward, the script must move from the shared
   `app/layout.tsx` into `app/(public)/layout.tsx` so staff/CMS routes are never tracked.
2. **Consent UX + Consent Mode:** not yet designed or built. Required before any real rollout,
   not optional polish.
3. **Billing account:** needs to be provided and owned by the project's actual owner (CTO/DCTO),
   not an individual contributor, before Step 5 can be completed.
4. **ADR path:** GA4 adoption should proceed via a formal ADR-003 supersession, explicitly
   addressing consent, data ownership (reader data leaving to Google), and the dual-permission
   model (Firebase project access ≠ GA4 property access — discovered firsthand during this spike
   when Firebase-project access alone wasn't sufficient to view full GA4 reporting).
5. **Next step, if greenlit:** get the billing account sorted (owner-provided), complete Step 5
   (Data API round-trip into `AnalyticsView`), and only then revisit whether GA4 fully or
   partially replaces the Firestore-counter-based plan already scoped in the views-counter ticket.