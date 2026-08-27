# ADR 004 — ISR as the Primary Rendering Strategy for Reader Routes

**Status:** Accepted
**Date:** 2026-07
**Deciders:** CTO

---

## Context

The reader-facing site (homepage, section pages, article pages) must be fast, SEO-friendly, and capable of reflecting newly published content without requiring a full site rebuild. Next.js offers several rendering strategies: Static Site Generation (SSG), Incremental Static Regeneration (ISR), Server-Side Rendering (SSR), and Client-Side Rendering (CSR).

---

## Decision

Reader routes will use **Incremental Static Regeneration (ISR)** with **on-demand revalidation** triggered by CMS publish and update actions. A time-based fallback revalidation window is set per route type as a safety net.

Staff routes (`/staff/*`) will remain fully **dynamic (SSR)** — they are never cached.

---

## Rationale

**Performance.** ISR pre-renders pages as static HTML and serves them from Vercel's edge network. A reader loading an article gets a cached HTML response from the nearest edge node — no database query, no server render on the request path. This is the fastest possible response for read-heavy content.

**SEO.** Search engines index pre-rendered HTML. ISR guarantees that article pages have complete HTML content available on first request, including title, body text, Open Graph tags, and canonical URLs. SSR achieves the same but adds server latency on every request. CSR fails entirely for SEO.

**On-demand revalidation is the right invalidation model.** Rather than relying solely on time-based expiry, the CMS `publishArticle` Server Action calls `revalidatePath()` for the affected article page, section page, and homepage immediately on publish. This means new content is live within seconds of publishing, not after a fixed interval.

**Time-based fallback adds resilience.** If `revalidatePath()` fails silently (edge case), the time-based fallback ensures stale content does not persist indefinitely.

**ISR integrates with Vercel without configuration.** Next.js ISR on Vercel works out of the box. On-demand revalidation via `revalidatePath()` in Server Actions is a first-class Next.js 15 feature.

---

## Revalidation Per Route

| Route | ISR revalidation window | On-demand trigger |
| --- | --- | --- |
| `/` (homepage) | 60 seconds | `publishArticle`, `updateArticle` |
| `/[section]` | 300 seconds | `publishArticle` for that section |
| `/[section]/[slug]` | 3600 seconds | `updateArticle` for that article |
| `/author/[slug]` | 3600 seconds | `publishArticle` for that author |
| `/search` | No cache (SSR) | — |
| `/staff/*` | No cache (SSR) | — |

---

## Implementation

```tsx
// actions/article.actions.ts
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/src/infrastructure/firebase/admin";

export async function publishArticle(id: string) {
  const ref = db.collection("articles").doc(id);
  await ref.update({
    status: "Published",
    publishedAt: FieldValue.serverTimestamp(),
  });
  const { slug, sectionSlug } = (await ref.get()).data()!;

  // Clear all affected cached pages
  revalidatePath(`/${sectionSlug}/${slug}`);
  revalidatePath(`/${sectionSlug}`);
  revalidatePath("/");
}
```

```tsx
// app/(reader)/[section]/[slug]/page.tsx
export const revalidate = 3600; // fallback: revalidate once per hour
```

---

## Consequences

**Positive:**

- Near-instant page loads for readers (served from CDN edge)
- Full SEO compatibility
- New content live within seconds of publishing via on-demand revalidation
- No infrastructure beyond Vercel required

**Negative:**

- If a developer forgets to call `revalidatePath()` after a mutation, content may appear stale until the fallback window expires
- The ISR cache is per-Vercel-region in some configurations — consistency across regions depends on Vercel's cache propagation

**Mitigations:**

- The `revalidatePath()` calls are co-located in the Server Actions, not spread across components — there is one authoritative place to add them
- Code review checklist includes "revalidatePath called after mutation"
- CLAUDE.md explicitly documents this pattern and lists it under "What NOT To Do" if omitted

---

## Alternatives Considered

**Full SSG (static export).** Rejected. A full static export requires a rebuild on every publish, which would take tens of seconds to minutes as the article count grows. On-demand revalidation solves this without rebuilds.

**SSR on every request.** Rejected. SSR hits the database on every page load. For a news site with hundreds of concurrent readers, this creates unnecessary DB load and adds latency on the hot path. The content changes infrequently enough that ISR is strictly better.

**Client-side rendering with SWR/React Query.** Rejected for article pages. CSR pages return an empty HTML shell, which search engine crawlers cannot index. A news publication's primary distribution channel is search and social sharing — both depend on server-rendered HTML.