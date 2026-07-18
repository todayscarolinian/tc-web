# ADR 003 — First-Party Analytics (Firestore Counters)

**Status:** Accepted
**Date:** 2026-07
**Deciders:** CTO, DCTO

---

## Context

The CMS dashboard requires analytics: total article views, top stories, daily pageview trends, and per-section breakdowns. Several approaches were evaluated — third-party analytics services, self-hosted analytics (Umami), and a first-party solution using data already in Firestore.

---

## Decision

For MVP, analytics will be **first-party only**, implemented as a `views` integer field on each article's Firestore document, incremented atomically (`FieldValue.increment(1)`) via a fire-and-forget Server Action on each article page load. Dashboard stats are computed from this data via the `AnalyticsRepository` port (`src/domain/analytics/`).

No external analytics service will be integrated during MVP.

---

## Rationale

**Zero new infrastructure.** The project already depends on Firestore. Adding a `views` field and a Server Action requires no additional service, no Railway deployment, no third-party account, and no API keys beyond the Firebase project already provisioned. The analytics are live on day one of Sprint 1 with one schema addition.

**Powers the CMS dashboard natively.** The dashboard stat cards (Total Views, Top Article, New Readers, Top Stories This Week) are computed directly from Firestore queries. There is no external API call or data sync step — the data that powers the CMS is the same data that powers the public site's view counts.

**No privacy compliance overhead.** Third-party analytics services (even privacy-friendly ones like Plausible) require cookie banners or privacy policy disclosures depending on jurisdiction. First-party counters that do not persist user identity or IP address have no such requirement.

**Umami is a clean post-MVP upgrade.** If richer analytics are needed post-MVP (referrer tracking, country breakdown, bounce rate), Umami can be self-hosted on Railway in a single afternoon. Umami writes to its own database and does not conflict with the first-party counters. Both can run in parallel — Umami for granular session analytics, Firestore counters for the CMS dashboard summary.

**Cost.** TC is a student publication with no analytics budget. Plausible and similar services charge monthly fees. Self-hosting Umami on Railway is $5/month at minimum. First-party counters have no marginal cost.

---

## Implementation

```tsx
// actions/analytics.actions.ts
"use server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/src/infrastructure/firebase/admin";

export async function incrementViews(articleId: string) {
  await db.collection("articles").doc(articleId).update({
    views: FieldValue.increment(1),
  });
}
```

```tsx
// app/(reader)/[section]/[slug]/page.tsx
// Fire-and-forget — does not block render
incrementViews(article.id);
```

The `incrementViews` call is not awaited in the page component. View counting does not block article rendering.

---

## Consequences

**Positive:**

- No additional infrastructure or cost
- Dashboard analytics available from day one
- No privacy compliance overhead
- Clean upgrade path to Umami post-MVP

**Negative:**

- No referrer data, country breakdown, bounce rate, or session-level analytics
- Bot traffic will inflate view counts (no bot filtering in MVP)
- Views are not deduplicated per user session — a single user refreshing a page increments the counter each time

**Mitigations:**

- Bot inflation is acceptable for a university publication at MVP scale
- Deduplication can be added post-MVP by storing a session identifier in a cookie and checking it before incrementing
- The Umami upgrade path addresses referrer and session analytics without changing the first-party counter logic

---

## Alternatives Considered

**Plausible Analytics (hosted).** Rejected for MVP. Monthly cost, requires DNS configuration, and the dashboard data would live in an external service rather than being queryable from within Firestore.

**Umami (self-hosted on Railway).** Deferred to post-MVP. Adds a Railway service, a separate PostgreSQL database, and deployment overhead. The benefit (richer analytics) is not required for MVP. Revisit after the first production sprint.

**Google Analytics.** Rejected. GA4 requires cookie consent banners, sends data to Google, and is blocked by a significant portion of users running ad blockers. Not appropriate for a student publication.

**No analytics.** Rejected. The CMS dashboard is a core MVP feature and requires view counts to power the Top Stories and analytics overview panels.