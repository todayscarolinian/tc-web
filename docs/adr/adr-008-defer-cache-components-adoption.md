# ADR 008 — Defer Cache Components Adoption

**Status:** Accepted
**Date:** 2026-07-29
**Deciders:** CTO

---

## Context

This project's installed Next.js version ships Cache Components (the
`cacheComponents` config flag), which replaces route-segment caching config
(`revalidate`, `dynamic`, `fetchCache`) with the `'use cache'` directive plus
`cacheLife`/`cacheTag`, makes Partial Prerendering the default rendering
behavior, and marks `unstable_cache` as superseded in favor of `use cache`.

This came up while deciding how to cache tag lookups for S1-01's Firestore
schema work — resolving `Article.tagSlugs`/`MediaAsset.tagSlugs` against the
`tags` collection needs a cache, and adopting the new model for just that one
lookup was considered and rejected as out of scope; it's a much bigger
decision than a single cache call.

[ADR-004](adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)
already commits every reader route (`/`, `/[section]`, `/[section]/[slug]`,
`/authors/[slug]`) to a specific ISR-window model built entirely on the
*previous* caching system (`export const revalidate`, `revalidatePath()`).

The project is not yet deployed — no production traffic depends on today's
caching behavior, which is the cheapest possible time to make a change like
this, but that doesn't mean it should be made incrementally or by accident.

---

## Decision

We will **not** enable `cacheComponents` yet. `unstable_cache` and the
existing route-segment ISR model (per ADR-004) remain in use, including the
new whole-`tags`-collection cache introduced by S1-01. Adoption of Cache
Components is deferred to a dedicated future pass that rewrites ADR-004 and
configures durable/shared caching together — not something to adopt
piecemeal, one feature at a time.

---

## Rationale

**It's not a drop-in swap for one cache call.** Enabling `cacheComponents`
changes the default rendering model for every route in the app — pages
become dynamic-by-default unless explicitly wrapped in `'use cache'`, and
short-lived caches become "dynamic holes" requiring `<Suspense>` boundaries.
Every route ADR-004 already specifies would need retrofitting in the same
pass, or the app is left half-migrated.

**ADR-004 would need a companion rewrite, not a footnote.** Its ISR-window
table is written entirely in terms of the previous model. Flipping the flag
without rewriting it produces exactly the kind of doc-vs-code drift this
project has already accumulated once — see the `firestore-schema.md`/entity/
ADR-007 drift found and fixed during the same S1-01 schema pass this decision
came out of.

**`use cache`'s default persistence is a real, easy-to-miss regression risk
given ADR-007's cost constraints.** Unlike the classic Data Cache/
`unstable_cache` (persisted across serverless instances and deployments, at
least on Vercel), `use cache` defaults to in-memory storage scoped to a
single instance and a single deployment. Without deliberately opting into
`use cache: remote` or a durable cache handler, each server instance and
every fresh deploy recomputes caches independently — meaning *more* Firestore
reads, not fewer, directly undercutting ADR-007's stated reason for choosing
Firestore (cost predictability on a tight, self-funded budget). Adopting
Cache Components without addressing this in the same pass would be a silent
regression, not a neutral upgrade.

**Pre-deploy is still the cheapest time to eventually do this — but "cheap"
isn't the same as "urgent."** No production traffic depends on today's
caching behavior, so there's no pressure to rush this in before it's been
planned properly across all three concerns above.

---

## Consequences

**Positive:**

- No half-migrated state — every route stays on one consistent, documented
  caching model until a deliberate switch.
- `unstable_cache`, while marked as superseded, remains fully supported and
  behaves predictably (shared across instances, durable across deploys) with
  no extra configuration required.

**Negative:**

- Continues building on an API Next.js documents as superseded — the
  eventual migration is deferred, not avoided.
- Newer capabilities that ship with Cache Components (Partial Prerendering as
  the default, mixing static and dynamic content within a single route)
  aren't available until the migration happens.

**Mitigations:**

- When revisited, scope the migration as a single pass covering: (1)
  rewriting ADR-004 for the `cacheLife`/`'use cache'` model, (2) retrofitting
  every existing route, and (3) configuring `use cache: remote` or a durable
  cache handler so cross-instance/cross-deployment cache sharing isn't
  silently lost — not three separate follow-ups done at different times.

---

## Future Considerations

Revisit once Sprint 1's real Firestore adapter work (S1-02 onward) has landed
and the reader-route set has stabilized — retrofitting `'use cache'`
boundaries and rewriting ADR-004 is cheaper against a settled set of routes
than against ones still actively changing.
