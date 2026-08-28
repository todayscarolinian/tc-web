# Architecture

## Purpose

Today's Carolinian is currently a UI-only prototype: every page reads
hardcoded mock arrays directly from `lib/*.ts`. This document describes a
light Domain-Driven-Design-inspired layering, introduced to create seams
for a real database (**Firestore**), real auth (**TC Herald**, TC's IdP/SSO
for all TC properties — integrated via `src/lib/herald/`), and real
backend logic (Route Handlers / Server Actions) — without heavy DDD
ceremony (no aggregate roots, no domain events, no CQRS).

## Related ADRs & Design Docs

- [ADR-002 — Tiptap as the CMS Rich Text Editor](adr/adr-002-tiptap-as-cms-rich-text-editor.md) — article `body` is stored as ProseMirror JSON on the article's Firestore document
- [ADR-003 — First-Party Analytics (Firestore Counters)](adr/adr-003-first-party-analytics) — view counts live on the article doc, incremented via `FieldValue.increment()`
- [ADR-004 — ISR as the Primary Rendering Strategy for Reader Routes](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md) — publish actions write to Firestore then call `revalidatePath()`
- [ADR-007 — Firestore Over Supabase as the Application Database](adr/adr-007.md) — cost-driven choice given budget constraints; full-text search deferred post-MVP as a result
- [Firestore Schema (S1-01)](firestore-schema.md) — the full collection/field schema, composite indexes, and FK-equivalent invariants for all five collections (`articles`, `sections`, `tags`, `authors`, `mediaAssets`)

Firebase Storage (cover images and other media) is the binary-asset
counterpart to Firestore, which holds the structured records.

## Layers & the dependency rule

Code is organized **per entity**, not per layer: each domain concept gets
one folder under `src/entities/<name>/`, and everything that concept
needs — its type, its use-cases, its concrete adapters — lives inside
that one folder, split into sub-layers:

```
src/entities/<name>/
  core/            entity type(s), factory functions (when >1 constructor exists),
                   repository/port interface(s)
                   → zero dependency on usecase/, services/, infrastructure/, Next, or React
  usecase/         interface(s) — the port(s) a service implements
                   → depends only on core/
  services/        implementation(s) of usecase/, plus *.service.factory.ts
                   composition roots
                   → may depend on core/, usecase/, infrastructure/, and lib/*
  infrastructure/  concrete adapters implementing core/'s repository/port interfaces
                   → may depend on core/ and lib/*
  __tests__/       co-located, mirrors the subfolders above
```

`app/` + `components/` (presentation) depend on a slice's
`services/*.service.factory.ts` (the poor-man's-DI composition root — the
one accepted "reach into infrastructure-adjacent code" from presentation,
used instead of a DI container, appropriate for a project this size) and on
`core/` types for props.

`lib/` is not being deleted. It stays as a home for mock data and
cross-cutting utilities that aren't entity-specific (e.g.
`lib/firebase/admin.ts`, the shared Firebase Admin SDK bootstrap every
Firestore/Storage adapter initializes off). Entity `infrastructure/`
adapters wrap `lib/*.ts` mock data until a real backend replaces it, and
`lib/articles.ts`/`lib/staff-data.ts` retire naturally as their wrapped
data moves into Firestore.

## Naming conventions

| Suffix | Sub-layer | Meaning |
|---|---|---|
| `*.domain.ts` | `core/` | typed object with identity (slug/id), plus any assertion/validation function |
| `*.factory.ts` | `core/` | constructor functions, when an entity has more than one legitimate way to be built |
| `*.types.ts` | `core/` | plain shape contracts / closed unions with no independent invariants (not a real Value Object — see below) |
| `*.repository.ts` | `core/` | repository port (interface only) |
| `*.port.ts` | `core/` | non-persistence capability interface (e.g. storage, auth/session) |
| `*.usecase.ts` | `usecase/` | the application-service interface (the port a service implements) |
| `*.service.ts` | `services/` | the application-service implementation |
| `*.service.factory.ts` | `services/` | composition root — instantiates the concrete adapter(s) and exports a ready-to-use service for pages/route handlers to import |
| `firestore-<name>.repository.ts` / `static-<name>.repository.ts` / `in-memory-<name>.repository.ts` | `infrastructure/` | concrete adapter implementing a `core/*.repository.ts` port |

No barrel `index.ts` files — import the specific file directly.

**On Value Objects**: a `*.types.ts` closed union (e.g. `ArticleStatus`,
`SectionName`) is a plain type, not a real Value Object — it carries no
independent invariant of its own beyond its shape. This codebase doesn't
currently use a `ValueObject<T>` base class with `validate()`; if a field
ever earns real invariant-encapsulation (e.g. length/format rules
independent of the rest of the entity), that's a deliberate future addition
to `core/`, not a blanket rename of every `*.types.ts` file.

## Worked example: the Article slice

One `Article` entity serves **both** the public site and the staff CMS —
they're the same underlying article (one table, one `status` field), not
two domains. See "One entity, two audiences" below for why this isn't
split into a separate `staff-article` context.

- `entities/article/core/article.domain.ts` (types + validation), `article.factory.ts` (the 3 constructors: `createArticle`, `updateArticleContent`, `publishArticle`), `article.types.ts` (`ArticleStatus`), `article.repository.ts` (port)
- `entities/article/infrastructure/firestore-article.repository.ts`
- `entities/article/usecase/article.usecase.ts` — one `ArticleUseCase` interface covering both audiences (see below), `entities/article/services/article.service.ts` (impl), `article.service.factory.ts` (composition root, exports `articleService`)
- `app/api/articles/route.ts`, `app/api/search/route.ts` — expose public use-cases over HTTP for future external/decoupled consumers
- `app/(public)/page.tsx`, `article/[slug]/page.tsx`, `section/[section]/page.tsx` — call `articleService.*` (public methods)
- `app/(staff)/staff/articles/page.tsx`, `articles/[id]/page.tsx`, `staff/page.tsx` — call `articleService.staff.*`
- `entities/article/core/article.domain.test.ts`, `entities/article/__tests__/services/*.test.ts` — example unit tests

Copy this shape for the next slice: `entities/<name>/{core,usecase,services,infrastructure,__tests__}`.

## One entity, two audiences

`staff-article` started as its own placeholder domain, mirroring the
original mock data split (`lib/content.ts`'s public `Story` vs.
`lib/staff-data.ts`'s `StaffArticle`). That split didn't reflect anything
real: a public article and a staff article are the same row — the public
site is just `WHERE status = 'Published'`. Keeping two entity types for one
underlying record would have been exactly the kind of ceremony this "light
DDD" approach is meant to avoid.

Instead there is one `Article` entity (`entities/article/core/article.domain.ts`,
including `status` and `views`) and one `ArticleRepository` port with
methods for both audiences:

- `listPublished()`, `findPublishedBySlug()`, `listTrending()`, `search()` — public, Published-only
- `listAll()`, `findBySlug()` — staff, any status (`findBySlug` is also the
  raw internal lookup `findPublishedBySlug` filters on top of)

`entities/article/usecase/article.usecase.ts` mirrors that split within one
`ArticleUseCase` interface — public methods flat on the interface, staff
ones nested under a `staff` property — rather than as two domain contexts
or two feature slices. `entities/article/services/article.service.ts`
implements it the same way, and the composition root
(`entities/article/services/article.service.factory.ts`) exports the
result as `articleService`, with staff methods under `articleService.staff`.

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

## Section: promoted to its own slice

`Section` used to be nested inside `domain/article/` even though it's a
distinct domain concept, and its `SectionName` type was declared twice —
once in `domain/article/section.value-object.ts`, once as a static array in
`lib/content.ts`. Both are now `entities/section/`:

- `entities/section/core/section.domain.ts` (`Section` type + validation), `section.types.ts` (`SectionName`, `SectionAccent`), `section.repository.ts` (port: `listAll`, `findBySlug`, `findByName`)
- `entities/section/infrastructure/static-section.repository.ts` — the single source of truth for the 5 fixed sections (still not a Firestore collection — sections are a deliberately static, non-user-editable list), plus the `SECTIONS` array and `getSectionName()` helper that most call sites use directly rather than going through the repository interface

`ArticleRepository` still exposes `listSections`/`findSectionBySlug`/
`findSectionByName` (delegating straight through to the section
infrastructure) for backward compatibility with existing call sites —
consolidating those onto `entities/section` directly is a reasonable
future cleanup, not required by the slice's existence.

## Exception: singleton config values skip the pattern

Not every domain needs an entity/repository pair, and not every value
needs a `lib/` mock file to wrap. `entities/publication/core/publication.types.ts`
defines a `Publication` type, and `entities/publication/infrastructure/publication.composition.ts`
exports the `PUBLICATION` constant directly (masthead bio, email, social
links) — no repository, no use-case, no separate `lib/` data file to adapt.
This is deliberate: the masthead is a singleton, static, non-user-editable
value with no "many instances to look up" and no real reason to abstract
over a swappable implementation, so the composition root *is* the data.
`components/site/footer.tsx` and `app/layout.tsx` import `PUBLICATION`
directly from it. Apply the same reasoning to any future domain that is
genuinely a single static config value rather than a collection of
entities.

## How to add a new vertical slice

1. Define the entity type(s) in `entities/<name>/core/<name>.domain.ts`.
2. Define the repository port in `entities/<name>/core/<name>.repository.ts`.
3. Write the concrete adapter in `entities/<name>/infrastructure/`, wrapping the existing `lib/*.ts` export (or a real backend, once one exists).
4. Define the use-case interface in `entities/<name>/usecase/<name>.usecase.ts`.
5. Implement it in `entities/<name>/services/<name>.service.ts`, and write the composition root in `<name>.service.factory.ts`.
6. Optionally add a Route Handler under `app/api/<name>/route.ts`.
7. Rewire the relevant page(s)/component(s) to import the composition root's service instead of `lib/*` directly.
8. Add Vitest tests under `entities/<name>/__tests__/`, mirroring the subfolders above, for the entity and at least one service method.

If the new context is really just another audience/view over an existing
entity (like staff vs. public articles), don't create a new entity slice —
add repository methods and fold the extra use-cases into the same
`usecase.ts`/`service.ts` (nested under a property, e.g. `.staff`) instead,
per "One entity, two audiences" above.

`media` and `analytics` still have `README.md` placeholders in
`entities/media/` and `entities/analytics/` describing their intended
shape — follow the checklist above to fill them in.

## Where Herald and Firestore plug in later

- **Database**: each `entities/<name>/core/*.repository.ts` port gets a new
  Firestore adapter (e.g. `firestore-article.repository.ts`) alongside any
  `in-memory-*`/`static-*` one. Swap which one is instantiated in the
  relevant `<name>.service.factory.ts` — nothing in `usecase/`/`services/`
  or `app/` changes. `mediaAssets` records (metadata) live in Firestore the
  same way; the underlying files live in Firebase Storage, referenced from
  the doc by URL. See [`firestore-schema.md`](firestore-schema.md) for the
  full schema.
- **Auth**: `entities/auth/core/session.port.ts` (`SessionPort`) is
  implemented by both `entities/auth/infrastructure/herald-session.adapter.ts`
  (real, currently wired) and `in-memory-session.adapter.ts` (a stub that
  always returns the mock `CURRENT_STAFF_USER`, kept as the seam a
  BetterAuth/Herald-less local-dev path could use). The real
  implementation is **TC Herald** — TC's IdP/SSO shared across all TC
  properties — via `src/lib/herald/`: `verify-session.ts`
  (`verifySessionFromCookie`) and `authorize.ts` (`isAuthorized`) do the
  server-side session/domain checks, combined in `require-access.ts`
  (`requireHeraldAccess`); `auth-client.ts` wraps the BetterAuth client
  pointed at Herald's auth server for client-side use, consumed via
  `use-has-domain-access.ts` (`useHasHeraldDomainAccess`).
  `entities/auth/services/auth.service.factory.ts` wires
  `HeraldSessionAdapter` today. Still missing:
  - a real `app/(staff)/layout.tsx` guard (gate rendering of the CMS), and
  - a real root **`proxy.ts`** (Next.js 16 renamed `middleware.ts` to
    `proxy.ts` — use the new convention) to redirect unauthenticated
    requests to `/staff/*` before render.
  Neither of those exists yet; `/staff/*` is currently reachable
  unauthenticated. This is a deliberately separate, tracked follow-up —
  permission/auth changes get their own explicit sign-off rather than
  landing as part of a structural refactor.

## Known limitations / risks

1. Real indirection cost: the home page touches several new files to do
   what was 2 imports before. This is the explicit price of the requested
   seam — worth reassessing before repeating the pattern for Media/Analytics,
   where the payoff is smaller until those slices get real backends.
2. Repository/use-case methods are `async` over synchronous data (static
   Section list, in-memory Article test fixture) — a deliberate cost so a
   future real adapter is a drop-in swap.
3. The in-memory Article test fixture's `ArticleRecord → Article` mapping
   must be kept in sync by hand if `lib/articles.ts`'s shape ever changes.
4. The media/analytics `icon: LucideIcon` serialization problem (component
   references can't cross a server→client prop boundary) is real,
   pre-existing, and **not fixed** by this restructuring — only documented
   as a prerequisite in `entities/media/README.md` and
   `entities/analytics/README.md`.
5. Nothing enforces the dependency rule automatically (e.g. a `core/*.ts`
   file accidentally importing `next/navigation`). `eslint-plugin-boundaries`
   is a reasonable low-cost follow-up, not included in this pass.
6. The auth stub (`InMemorySessionAdapter`) still exists as an
   always-logged-in fallback, and there is no unauthenticated path for
   `/staff/*` until `proxy.ts`/layout guarding is added later — see
   "Where Herald and Firestore plug in later" above.
7. `findBySlug` (staff, any status) and `findPublishedBySlug` (public) both
   query the same collection/data source, filtering client-side in the
   use-case layer (`getBySlug` calls the filtered repository method) rather
   than the data source itself. A future DB adapter should still filter at
   the query level for defense in depth, not rely solely on the service.
8. `Article.body` (`entities/article/core/article.domain.ts`) is typed as
   Tiptap's own `JSONContent` (from `@tiptap/core`), a deliberate exception
   to this doc's "domain has zero dependency on infrastructure/frameworks"
   rule — justified because [ADR-002](adr/adr-002-tiptap-as-cms-rich-text-editor.md)
   already commits the storage format to being literally "whatever Tiptap
   emits." See [`firestore-schema.md`](firestore-schema.md)'s "Domain-type
   mapping" section for the full rationale.
