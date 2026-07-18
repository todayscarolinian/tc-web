# Architecture

## Purpose

Today's Carolinian is currently a UI-only prototype: every page reads
hardcoded mock arrays directly from `lib/*.ts`. This document describes a
light Domain-Driven-Design-inspired layering, introduced to create seams
for a real database (**Firestore**), real auth (**TC Herald**, TC's IdP/SSO
for all TC properties — integrated via `src/lib/herald/`), and real
backend logic (Route Handlers / Server Actions) — without heavy DDD
ceremony (no aggregate roots, no domain events, no CQRS).

## Related ADRs

- [ADR-002 — Tiptap as the CMS Rich Text Editor](adr/adr-002-tiptap-as-cms-rich-text-editor.md) — article `body` is stored as ProseMirror JSON on the article's Firestore document
- [ADR-003 — First-Party Analytics (Firestore Counters)](adr/adr-003-first-party-analytics) — view counts live on the article doc, incremented via `FieldValue.increment()`
- [ADR-004 — ISR as the Primary Rendering Strategy for Reader Routes](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md) — publish actions write to Firestore then call `revalidatePath()`
- [ADR-007 — Firestore Over Supabase as the Application Database](adr/adr-007.md) — cost-driven choice given budget constraints; full-text search deferred post-MVP as a result

Firebase Storage (cover images and other media) is the binary-asset
counterpart to Firestore, which holds the structured records.

## Layers & the dependency rule

```
domain/          entities, value objects, repository/port interfaces
                 → zero dependency on application/, infrastructure/, lib/, Next, or React
application/     use-cases (one operation per file)
                 → depends only on domain/
infrastructure/  adapters implementing domain/ ports, plus composition roots
                 → may depend on domain/, application/, and lib/*
app/ + components/  presentation
                 → depends on application/'s use-cases (via a composition root),
                   and on domain/ types for props
```

The one accepted "reach into infrastructure" from presentation is importing
a `*.composition.ts` file — the poor-man's-DI pattern used here instead of
a DI container, appropriate for a project this size.

`lib/` is not being deleted. It stays as the current source of mock data;
`infrastructure/` adapters wrap it. Now that Firestore is the chosen
backend, a new adapter (`firestore-article.repository.ts`) replaces the
in-memory one in the composition root, and `lib/articles.ts`/`lib/content.ts`
retire naturally as their wrapped data moves into Firestore.

## Naming conventions

| Suffix | Layer | Meaning |
|---|---|---|
| `*.entity.ts` | domain | typed object with identity (slug/id) |
| `*.value-object.ts` | domain | immutable, identity-less type |
| `*.repository.ts` | domain | repository port (interface only) |
| `*.port.ts` | domain | non-persistence capability interface (e.g. auth/session) |
| `in-memory-<name>.repository.ts` | infrastructure | concrete adapter; the prefix leaves room for a future `firestore-<name>.repository.ts` beside it |
| `*.use-case.ts` | application | one exported function per file, verb-first |
| `*.composition.ts` | infrastructure | composition root — instantiates the concrete adapter and pre-binds use-cases for pages/route handlers to import |

No barrel `index.ts` files — import the specific file directly.

## Worked example: the Article slice

One `Article` entity serves **both** the public site and the staff CMS —
they're the same underlying article (one table, one `status` field), not
two domains. See "One entity, two audiences" below for why this isn't
split into a separate `staff-article` context.

- `domain/article/section.value-object.ts`, `article-status.value-object.ts`, `article.entity.ts`, `article.repository.ts`
- `infrastructure/article/in-memory-article.repository.ts` (wraps `lib/articles.ts` and `lib/content.ts`), `article.composition.ts`
- `application/article/list-published-articles.use-case.ts`, `get-article-by-slug.use-case.ts`, `list-trending-articles.use-case.ts`, `search-articles.use-case.ts` — **public** reads (published articles only)
- `application/article/staff/list-staff-articles.use-case.ts`, `get-staff-article-by-slug.use-case.ts` — **staff** reads (any status)
- `app/api/articles/route.ts`, `app/api/search/route.ts` — expose public use-cases over HTTP for future external/decoupled consumers
- `app/(public)/page.tsx`, `article/[slug]/page.tsx`, `section/[section]/page.tsx` — call `articleService.*` (public methods)
- `app/(staff)/staff/articles/page.tsx`, `articles/[id]/page.tsx`, `staff/page.tsx` — call `articleService.staff.*`
- `domain/article/article.entity.test.ts`, `application/article/get-article-by-slug.use-case.test.ts`, `application/article/staff/get-staff-article-by-slug.use-case.test.ts`, `application/article/search-articles.use-case.test.ts` — example unit tests

Copy this shape for the next slice.

## One entity, two audiences

`staff-article` started as its own placeholder domain, mirroring the
original mock data split (`lib/content.ts`'s public `Story` vs.
`lib/staff-data.ts`'s `StaffArticle`). That split didn't reflect anything
real: a public article and a staff article are the same row — the public
site is just `WHERE status = 'Published'`. Keeping two entity types for one
underlying record would have been exactly the kind of ceremony this "light
DDD" approach is meant to avoid.

Instead there is one `Article` entity (`domain/article/article.entity.ts`,
now including `status` and `views`) and one `ArticleRepository` port with
methods for both audiences:

- `listPublished()`, `findPublishedBySlug()`, `listTrending()`, `search()` — public, Published-only
- `listAll()`, `findBySlug()` — staff, any status (`findBySlug` is also the
  raw internal lookup `findPublishedBySlug` filters on top of)

`application/article/` mirrors that split as two **use-case** groups
sharing the same repository — public use-cases stay flat in
`application/article/`, staff ones live in `application/article/staff/` —
rather than as two domain contexts. The composition root
(`infrastructure/article/article.composition.ts`) exposes both through one
`articleService`, with staff methods nested under `articleService.staff`.

**Reconciling the mock data was the real work.** `lib/content.ts`'s
`STORIES` and the old `lib/staff-data.ts`'s `STAFF_ARTICLES` were two
independently hand-written datasets that had drifted: several articles
staff had marked Draft/Scheduled were nonetheless showing on the public
site, and one Published article (`mentorship-program`) wasn't on the
public site at all. `lib/articles.ts` is now the single reconciled
dataset — see its file comment for specifics. One visible consequence:
`mentorship-program` now correctly appears in public listings, since its
status is genuinely Published.

Identity was also unified: the old public `slug` (e.g. `"tuition"`) and
staff `id` (e.g. `"tuition-hearing"`) were different strings for the same
article. `slug` is now the sole identifier, used for both the public
`/article/[slug]` route and the staff `/staff/articles/[id]` route (the
`[id]` folder name is unchanged, but its value is a slug).

## Exception: singleton config values skip the pattern

Not every domain needs an entity/repository pair, and not every value
needs a `lib/` mock file to wrap. `domain/publication/publication.value-object.ts`
defines a `Publication` type, and `infrastructure/publication/publication.composition.ts`
exports the `PUBLICATION` constant directly (masthead bio, email, social
links) — no repository, no application-layer use-case, no separate `lib/`
data file to adapt. This is deliberate: the masthead is a singleton,
static, non-user-editable value with no "many instances to look up" and no
real reason to abstract over a swappable implementation, so the
composition root *is* the data. `components/site/footer.tsx` and
`app/layout.tsx` import `PUBLICATION` directly from it. Apply the same
reasoning to any future domain that is genuinely a single static config
value rather than a collection of entities.

## How to add a new vertical slice

1. Define the entity/value objects in `domain/<context>/`.
2. Define the repository port in `domain/<context>/<name>.repository.ts`.
3. Write the in-memory adapter in `infrastructure/<context>/`, wrapping the existing `lib/*.ts` export.
4. Write the composition root (`<context>.composition.ts`).
5. Write use-case(s) in `application/<context>/`.
6. Optionally add a Route Handler under `app/api/<context>/route.ts`.
7. Rewire the relevant page(s)/component(s) to import the composition root's service instead of `lib/*` directly.
8. Add Vitest tests for the entity and at least one use-case.

If the new context is really just another audience/view over an existing
entity (like staff vs. public articles), don't create a new domain
context — add repository methods and a use-case subfolder instead, per
"One entity, two audiences" above.

`media` and `analytics` still have `README.md` placeholders in `domain/`,
`application/`, and `infrastructure/` describing their intended shape —
follow the checklist above to fill them in.

## Where Herald and Firestore plug in later

- **Database**: each `domain/<context>/*.repository.ts` port gets a new
  Firestore adapter (e.g. `firestore-article.repository.ts`) alongside the
  `in-memory-*` one. Swap which one is instantiated in the relevant
  `*.composition.ts` — nothing in `application/` or `app/` changes.
  `mediaAssets` records (metadata) live in Firestore the same way; the
  underlying files live in Firebase Storage, referenced from the doc by
  URL.
- **Auth**: `domain/auth/session.port.ts` (`SessionPort`) is implemented
  today only by `infrastructure/auth/in-memory-session.adapter.ts` (always
  returns the mock `CURRENT_STAFF_USER`). The real implementation is
  **TC Herald** — TC's IdP/SSO shared across all TC properties — via
  `src/lib/herald/`: `verify-session.ts` (`verifySessionFromCookie`) and
  `authorize.ts` (`isAuthorized`) do the server-side session/domain checks,
  combined in `require-access.ts` (`requireHeraldAccess`); `auth-client.ts`
  wraps the BetterAuth client pointed at Herald's auth server for
  client-side use, consumed via `use-has-domain-access.ts`
  (`useHasHeraldDomainAccess`). `SessionPort` should be implemented against
  `requireHeraldAccess`, swapping the instantiation in
  `infrastructure/auth/auth.composition.ts`. That session service would
  then be consumed from:
  - a future `app/(staff)/layout.tsx` guard (gate rendering of the CMS), and
  - a future root **`proxy.ts`** (Next.js 16 renamed `middleware.ts` to
    `proxy.ts` — use the new convention) to redirect unauthenticated
    requests to `/staff/*` before render.
  Neither of those exists yet; this is the pointer for whoever adds them.

## Known limitations / risks

1. `SectionName` is declared in both `domain/article/section.value-object.ts`
   and `lib/content.ts` — two sources of truth until `lib/content.ts` is
   eventually retired. A comment in the domain file cross-references it.
2. Real indirection cost: the home page touches several new files to do
   what was 2 imports before. This is the explicit price of the requested
   seam — worth reassessing before repeating the pattern for Media/Analytics,
   where the payoff is smaller until those slices get real backends.
3. Repository/use-case methods are `async` over synchronous in-memory data
   today — a deliberate cost so a future real adapter is a drop-in swap.
4. The in-memory adapter's `ArticleRecord → Article` mapping must be kept
   in sync by hand if `lib/articles.ts`'s shape ever changes.
5. The media/analytics `icon: LucideIcon` serialization problem (component
   references can't cross a server→client prop boundary) is real,
   pre-existing, and **not fixed** by this scaffold — only documented as a
   prerequisite in `domain/media/README.md` and `domain/analytics/README.md`.
6. Nothing enforces the dependency rule automatically (e.g. a `domain/*.ts`
   file accidentally importing `next/navigation`). `eslint-plugin-boundaries`
   is a reasonable low-cost follow-up, not included in this pass.
7. The auth stub always "logs in" `CURRENT_STAFF_USER` — there is no
   unauthenticated path until `proxy.ts`/layout guarding is added later.
8. `findBySlug` (staff, any status) and `findPublishedBySlug` (public) both
   do a full array scan of the same in-memory list — fine at this scale,
   but a reminder that "staff can see everything" is enforced only in the
   application layer (`getArticleBySlug` calls the filtered method), not by
   the data source itself. A future DB adapter should still filter at the
   query level for defense in depth, not rely solely on the use-case.
