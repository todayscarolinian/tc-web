# ADR 007 — Firestore Over Supabase as the Application Database

**Status:** Accepted
**Date:** 2026-07-18
**Deciders:** CTO

---

## Context

The project needs a real backend to replace the hardcoded mock data currently powering every route (`src/lib/articles.ts`, `content.ts`, `staff-data.ts`). This covers structured content (articles, sections, tags, authors) and binary media (cover images, inline images).

Two managed backend candidates were evaluated: **Supabase** (managed Postgres, relational) and **Firebase/Firestore** (managed NoSQL document store). TC Web is a self-funded student publication — budget is a hard constraint, and expected traffic at MVP is modest (low thousands of monthly pageviews). Cost predictability at this scale matters more than long-term relational-modeling headroom.

Pricing compared at decision time:

| | Supabase | Firebase |
| --- | --- | --- |
| Free tier | 500MB DB, 1GB file storage; project auto-pauses after ~1 week idle | 1GiB Firestore storage free, then $0.1846/GiB; 5GB Storage free, then $0.02/GiB-month; **50k reads / 20k writes / 20k deletes per day free** |
| Paid tier | Pro: $25/mo flat — 8GB DB, 100GB storage, regardless of actual usage | Blaze: pay-as-you-go beyond free quotas, scales with actual usage |

Firestore's free tier is bounded by daily *operations* (reads/writes), not primarily by storage size; Supabase's free tier is bounded by DB *size* and requires a flat $25/mo jump to Pro once exceeded. At an estimated MVP traffic of ~5k monthly pageviews (worst case: each pageview ≈ 1 article read + a handful of related-article reads + one view-counter write), usage stays comfortably inside Firestore's free daily quotas — plausibly $0/month through MVP and into early growth. That worst-case figure assumes every pageview hits Firestore directly; in practice it doesn't, per ADR-004 (below).

---

## Decision

We will use **Firestore** as the primary application database and **Firebase Storage** for media assets (cover images, inline images), for both the reader-facing site and the staff CMS. This supersedes an earlier Supabase/Postgres schema sketched during initial sprint planning.

---

## Rationale

**Cost curve fits a tight, usage-based budget.** Firestore's pay-as-you-go pricing scales with actual traffic. Supabase's free tier caps out on DB size (500MB) well before this project's traffic would justify $25/mo, and free projects auto-pause after inactivity — a real annoyance for a low-traffic student site, not just a cost concern.

**The domain/application layers don't care which database is chosen.** `src/domain/article/article.repository.ts` defines a persistence-agnostic `ArticleRepository` port; `src/infrastructure/article/article.composition.ts` is the single place a concrete adapter is wired in. Confirmed by reading the current code: no use-case, page, or component imports a concrete adapter directly. This means the backend choice is a contained decision, not one that ripples through the codebase — which is also why it can be revisited later (see Future Considerations) without a rewrite.

**Media co-locates naturally with the database vendor.** Firebase Storage sits alongside Firestore under one vendor/billing relationship, mirroring how Supabase Storage sits alongside Supabase Postgres — no cross-vendor integration work either way.

**ISR and Vercel's CDN cache mean most reader traffic never reaches Firestore at all — the operation-based cost model in this ADR is a worst case, not the expected case.** Per [ADR-004](adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md), reader routes (homepage, section pages, article pages) are served as pre-rendered HTML from Vercel's edge network under ISR, with the following revalidation windows:

| Route | ISR window | On-demand trigger |
| --- | --- | --- |
| `/` (homepage) | 60s | `publishArticle`, `updateArticle` |
| `/[section]` | 300s | `publishArticle` for that section |
| `/[section]/[slug]` | 3600s | `updateArticle` for that article |
| `/authors/[slug]` | 3600s | `publishArticle` for that author |

A Firestore read only happens when a page is *regenerated* — on the fallback window expiring, or on `revalidatePath()` firing after a publish/update — not on every pageview. An article that gets 100 reads in an hour costs Firestore roughly one read (the regeneration that served all 100), not 100. This means:

- The real Firestore read volume for reader traffic is driven by **publish/update frequency and cache-window expiry**, not raw pageview count — a small student newsroom publishing a handful of articles a day generates a small, predictable number of regenerations regardless of how many readers show up
- The ~5k-pageview worst-case estimate above is intentionally pessimistic; actual usage is very likely a small fraction of it, widening the free-tier margin further
- The two routes that *do* stay dynamic — `/search` and `/staff/*` (both SSR, no cache, per ADR-004) — are exactly the ones with real per-request Firestore reads. `/search` already runs the cheap substring query from S3-04; `/staff/*` traffic is inherently low-volume (a handful of editors, not the public)
- View-count writes (`FieldValue.increment()`, ADR-003) still happen per-pageview regardless of ISR, since incrementing a counter is a write on the live request path, not something a cached HTML response can do — this is the one place raw pageview count directly drives Firestore usage

---

## Consequences

**Positive:**

- Plausibly $0/month through MVP and into early growth, given expected traffic
- Combined with ISR (ADR-004), Firestore read volume is driven by publish/regeneration frequency, not raw pageview count — the cost estimate above is a worst case, with real headroom likely much wider
- No relational schema migrations to write or run
- Firestore's real-time listeners and offline support are available if a future feature wants them (not currently planned)

**Negative:**

- No native full-text search (no `tsvector` equivalent) — see Alternatives and Future Considerations
- No relational integrity (foreign keys) — tag/section/author references are denormalized IDs (`tagIds: string[]`, etc.) enforced only at the application layer, not by the database
- Compound queries require pre-defined composite indexes; ad hoc analytical queries are harder than with SQL
- Proprietary, GCP-only — no self-hosting path if we ever wanted to leave the vendor, unlike Supabase's open-source Postgres core

**Mitigations:**

- The `ArticleRepository` port isolates the persistence choice; a future migration (e.g. to Postgres) is a contained adapter swap, not a rewrite of `domain/`, `application/`, or `app/`
- FK-equivalent integrity is enforced in the Firestore repository adapter and covered by tests, per the sprint plan (`mvp-sprint-plan.md`, S1-01)
- Composite indexes for every planned query shape are defined upfront during schema design (S1-01), not discovered ad hoc in production
- Full-text search is deliberately descoped for MVP rather than solved with an expensive workaround: MVP ships basic substring search over title/dek/author/section (mirrors the existing `InMemoryArticleRepository.search()` behavior), with a documented upgrade path (below) once budget/traffic justifies it

---

## Alternatives Considered

**Supabase (Postgres).** Rejected for MVP. Better relational fit — native joins, foreign keys, and full-text search (`tsvector`) map directly onto the checklist's tag/section/search requirements. Rejected primarily on cost shape: the free tier's 500MB DB cap and inactivity auto-pause are worse fits for a low-traffic budget-constrained project than Firestore's operation-based free quota, and Pro's $25/mo flat fee doesn't scale down with actual (low) usage the way Firestore's pay-as-you-go model does.

**Self-hosted Postgres** (e.g. on Railway/Fly.io). Not seriously evaluated. Would trade a managed backend for self-managed backups, scaling, and uptime — out of scope for a small team's operational bandwidth, not just its money budget.

**Full-text search service alongside Firestore (Algolia/Typesense) at MVP time.** Considered and rejected *for MVP specifically* — introducing a second paid/hosted service to compensate for Firestore's missing FTS undercuts the reason Firestore was chosen in the first place. Deferred; see below.

---

## Future Considerations

**Real full-text search, post-MVP.** Once traffic or budget headroom justifies it, swap the `search()` method in the Firestore `ArticleRepository` adapter for **Algolia** (free tier — 10k records / 100k searches per month — plausibly covers this project's catalog size indefinitely) or self-hosted **Typesense** if volume outgrows that. This is an adapter-only change; no `domain/` or `application/` changes required, per the same port that made the Supabase-vs-Firestore choice itself low-cost to make.

**Revisit if data shape outgrows documents.** If tag/article relationships or reporting needs grow complex enough that Firestore's denormalized modeling becomes a real maintenance burden, or Firestore's operation-based cost overtakes Supabase Pro's flat rate at higher traffic, revisit this decision in a new ADR. The repository port abstraction keeps that migration contained.
