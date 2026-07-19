# Firestore Schema

This is the authoritative field list, index list, and integrity-invariant
list for the Firestore backend decided in
[ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md).
Implementing the real `FirestoreArticleRepository` adapter against this
schema is S1-02.

## Overview

Five collections: `articles`, `sections`, `tags`, `authors`, `mediaAssets`.
No join tables — per [ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md),
references between them are denormalized IDs, integrity-checked at the
application layer (S1-02), not by the database.

| Collection | Doc ID | Why |
|---|---|---|
| `articles` | `slug` | O(1) `.doc(slug).get()` on the hottest read path (`findBySlug`/`findPublishedBySlug`, hit on every article-page ISR regen); free uniqueness enforcement |
| `sections` | slug (`"news"`, …) | 5 static docs, equality-only lookups |
| `tags` | kebab-case slug | O(1) existence check for FK validation and a CMS "resolve-or-create by name" flow |
| `authors` | Herald `user.id` | matches the external identity key; see the collection's own section below for why this is a cache, not a source of truth |
| `mediaAssets` | autoId | filenames collide too easily to use as a natural key; uploads are a low-frequency write path where a pre-write collision check isn't worth avoiding one autoId call |

Governing ADRs, referenced throughout: [ADR-002](adr/adr-002-tiptap-as-cms-rich-text-editor.md)
(body storage), [ADR-003](adr/adr-003-first-party-analytics) (view counters),
[ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)
(ISR + revalidation), [ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md)
(why Firestore, cost model, denormalization).

---

## Collection schemas

### `articles/{slug}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes | duplicates the doc ID; kept as a field for exports/portability |
| `section` | string (`SectionName`) | yes | denormalized display name |
| `sectionSlug` | string | yes | **FK → `sections/{sectionSlug}`**. Needed un-joined — [ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)'s publish flow reads it straight off the doc to call `revalidatePath()` without a second lookup |
| `kickerText` | string | no | |
| `title` | string | yes | |
| `titleLower` | string | yes | lowercased mirror of `title`, for a prefix-range type-ahead query (see "Queries Firestore can't do efficiently" below) |
| `dek` | string | yes | |
| `authorId` | string | yes | Herald `user.id`. Server-set only, from the verified session at publish time — never client-supplied, or it's an IDOR (`src/lib/herald/README.md` §7) |
| `authorName` | string | yes | display-name snapshot captured at publish time — deliberately not a live Herald lookup (see `authors` section below) |
| `authorInitials` | string | yes | snapshot |
| `authorRole` | string | no | snapshot |
| `publishedAt` | Timestamp \| null | yes | `FieldValue.serverTimestamp()`, set once on first publish; null for Draft |
| `publishAt` | Timestamp \| null | no | future scheduled publish time (S3-02) |
| `readTimeMinutes` | number | yes | replaces the mock's free-text `read` (`"4 min read"` / `"3 min"` — inconsistent even today); derive the display string at render time |
| `variant` | `"paper" \| "dark" \| "duotone"` | yes | unchanged from the domain type |
| `coverImageUrl` | string | no | denormalized Storage URL, see `mediaAssets` |
| `coverImageAssetId` | string | no | **FK → `mediaAssets/{assetId}`** |
| `coverImageAlt` | string | no → required before publish | S5-04 enforces this at publish time, not stored-required here |
| `caption` | string | no | cover image caption/credit |
| `body` | object (ProseMirror JSON, typed as Tiptap's `JSONContent` from `@tiptap/core`) | yes | per [ADR-002](adr/adr-002-tiptap-as-cms-rich-text-editor.md) — stored inline, not a separate collection/blob |
| `bodyText` | string | yes | plain-text mirror of `body`, extracted server-side at save time. Exists for a *future* full-body search extension — **S3-04's MVP search does not scan this field**, see below |
| `tagIds` | string[] | yes, default `[]` | **FK[] → `tags/{tagId}`**, denormalized array per the sprint plan, no join table |
| `status` | `"Draft" \| "Scheduled" \| "Published" \| "Archived"` | yes | adds `Archived` (missing from the pre-existing `ArticleStatus` type; needed for S3-01, fixed as part of this pass regardless of backend) |
| `views` | number | yes, default 0 | `FieldValue.increment()` only, per [ADR-003](adr/adr-003-first-party-analytics) — never a direct `set`/`update` with a literal number |
| `featured` | boolean | no, default false | S4-05 |
| `createdAt` | Timestamp | yes | set once |
| `updatedAt` | Timestamp | yes | set on every write |

**Not carried forward:** the mock's `date: string` display field is dropped.
Derive the human date from `publishedAt` at render time (`Intl.DateTimeFormat`)
so it can never drift out of sync with the real timestamp — the mock data's
`date` was already free text with no guaranteed format.

### `sections/{slug}`

5 static documents, 1:1 with the existing `Section` value object — no domain
change needed here.

| Field | Type | Required |
|---|---|---|
| `name` | string (`SectionName`) | yes |
| `slug` | string | yes (duplicates doc ID) |
| `blurb` | string | yes |
| `accent` | `"news" \| "campus" \| "sports" \| "culture" \| "opinion"` | yes |

No composite index needed — equality-only lookups, automatically covered by
Firestore's single-field indexes.

### `tags/{tagSlug}`

Net new — no `tags` concept exists anywhere in the current mock data or
domain model.

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `slug` | string | yes (duplicates doc ID) |
| `description` | string | no |
| `createdAt` | Timestamp | yes |

No composite index needed (small collection, equality/array-contains only —
see `articles` indexes for the `tagIds` array-contains queries that actually
need indexes, which live on `articles`, not here).

**Not the same thing as `mediaAssets.tags`** — media tags are freeform
labels; article tags are FK references to this collection. Don't conflate
them when implementing S1-02 or S3-03.

### `authors/{authorId}`

Doc ID = Herald's `user.id`. **This collection is an explicit Herald
identity cache, not the source of truth.** Herald owns real identity
(`src/lib/herald/README.md`); this collection exists because:

- The `/authors/[slug]` reader route needs a listable, queryable identity
  record independent of any single article — [ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)
  gives that route a 3600s ISR window, implying it's a real page, not a
  derived view over article snapshots.
- A CMS author-picker (S2-04) shouldn't round-trip to Herald on every editor
  page load.
- Richer bio/avatar data belongs here rather than duplicated onto every
  article snapshot.

Upsert strategy: **lazily upserted as a side effect of the publish
flow**, piggybacking the same write that sets `Article.authorId`/`authorName`
— not proactively synced from Herald. No new sync infrastructure needed for
MVP.

| Field | Type | Required |
|---|---|---|
| `authorId` | string | yes (duplicates doc ID) |
| `name` | string | yes |
| `slug` | string | yes — Herald's `user.id` likely isn't URL-friendly; single-field index serves `/authors/[slug]` |
| `initials` | string | yes |
| `role` | string | no |
| `bio` | string | no |
| `avatarUrl` | string | no |
| `active` | boolean | yes |
| `updatedAt` | Timestamp | yes |

### `mediaAssets/{autoId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | filename |
| `folder` | string | yes | keep `MEDIA_FOLDERS` as an app-level constant (same "singleton config" pattern `docs/architecture.md` already uses for `Publication`), not a 6th collection |
| `tags` | string[] | yes, default `[]` | freeform labels — **not** `tagIds` FK references, see the `tags` section above |
| `storagePath` | string | yes | Firebase Storage object path |
| `url` | string | yes | Storage download URL — per `docs/architecture.md`, "the underlying files live in Firebase Storage, referenced from the doc by URL" |
| `contentType` | string | yes | e.g. `image/jpeg` |
| `sizeBytes` | number | yes | replaces the mock's `"4.1 MB"` string; derive the display string at render time |
| `width` | number | yes | replaces the mock's `"4032×2688"` string; needed for `next/image` CLS-safe sizing |
| `height` | number | yes | |
| `variant` | `"paper" \| "dark" \| "duotone"` | yes | unchanged |
| `altText` | string | no → required before use on a published article | S5-04 |
| `uploadedBy` | string | yes | Herald `authorId` of the uploader |
| `uploadedAt` | Timestamp | yes | replaces the mock's display-string `uploaded` |
| `iconKey` | string | no | replaces `icon: LucideIcon` (component references can't cross the server→client prop boundary) — closes the blocker documented in `src/domain/media/README.md` |

---

## Composite indexes

Any query mixing an equality/`array-contains` filter with an `orderBy` on a
different field needs an explicit composite index. Predefined here rather
than discovered via a production 400 at S1-02 implementation time —
see [`firestore.indexes.json`](../firestore.indexes.json) for the deployable
form of this table.

| # | Collection | Fields | Serves |
|---|---|---|---|
| IDX1 | `articles` | `status ASC, publishedAt DESC` | `listPublished()`, homepage feed, S4-06 latest-stories sidebar |
| IDX2 | `articles` | `sectionSlug ASC, status ASC, publishedAt DESC` | S2-07 section-page pagination, S4-03 related-by-section |
| IDX3 | `articles` | `tagIds ARRAY_CONTAINS, status ASC, publishedAt DESC` | S3-05 topic pages, S4-03 related-by-tag |
| IDX4 | `articles` | `status ASC, updatedAt DESC` | staff article list filtered by status tab (S3-01) |
| IDX5 | `articles` | `authorId ASC, status ASC, publishedAt DESC` | `/authors/[slug]` ([ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md) gives this route an ISR window, but no repository method exists yet — see "Known gaps" below) |
| IDX6 | `articles` | `featured ASC, status ASC, publishedAt DESC` | S4-05 banner — fallback only; prefer the config-doc approach below |
| IDX7 | `articles` | `status ASC, publishAt ASC` | S3-02 scheduled-publish sweep |
| IDX8 | `mediaAssets` | `folder ASC, uploadedAt DESC` | S3-03 browse-by-folder |
| IDX9 | `mediaAssets` | `tags ARRAY_CONTAINS, uploadedAt DESC` | S3-03 filter-by-tag |

`sections`, `tags`, and `authors` need no composite indexes — small
collections, equality-only lookups, covered by Firestore's automatic
single-field indexes.

### Queries Firestore can't do efficiently — design around these, don't hit them at implementation time

- **`search()` (S3-04).** Substring-anywhere matching over
  title/dek/author/section is not indexable in Firestore at all — S3-04's
  own spec (mirror `InMemoryArticleRepository.search()`) means a full scan
  of every `Published` article doc on every search request. This is the
  single biggest cost risk in this design, and it's *why*
  [ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md)
  already deferred real full-text search to Algolia/Typesense post-MVP —
  don't try to solve it with more indexes now. `titleLower` above can serve
  a cheap indexed prefix-range query (`titleLower >= q && titleLower < q +
  ''`) (with the query's Unicode-max-codepoint suffix trick) as a type-ahead shortcut for the common "starts with" case, but
  true substring-anywhere search still needs the full-scan fallback.
  `bodyText` does **not** reduce this cost — it exists for a future
  full-body-search extension, not the MVP search scope (title/dek/author/section only).
- **Multiple `array-contains` in one query.** Firestore allows only one per
  query. Not needed by any current ticket ("tagged with BOTH tag A and B"
  isn't in scope), but flagged so nobody adds a second `array-contains`
  clause later and hits a runtime error — that would need
  `array-contains-any` (OR semantics) plus client-side AND-filtering instead.
- **Inequality/range filters on two different fields in one query** (e.g.
  `publishedAt >= X AND views >= Y`). Not needed now; flag for S4-02's
  analytics dashboard if it ever wants this shape — do one range
  server-side, filter the rest client-side.
- **"Exclude the current doc" (S4-03 related articles).** No native
  exclusion filter — over-fetch `limit(N+1)` on IDX2/IDX3 and drop the
  current slug client-side, rather than trying `!=` combined with
  `array-contains`/`orderBy` (not a legal combination).

---

## Efficiency recommendations

- **Doc-ID-as-natural-key wherever it's cheap** (`articles/{slug}`,
  `sections/{slug}`, `tags/{tagSlug}`, `authors/{authorId}`) turns the
  highest-traffic lookups into direct `.get()`s instead of queries — no
  index, lowest latency, free uniqueness enforcement. `mediaAssets` is the
  one exception (autoId), since no natural collision-free key exists cheaply
  for uploaded files.
- **Denormalization trades, ranked by payoff:** `coverImageUrl` on the
  article doc is the highest-value one — cover images render on the hero,
  section-feed cards, related-articles blocks, sitemap/OG tags, and the
  detail page (many read sites), for one write site (upload/save); storing
  only `coverImageAssetId` would force a second read at every one of those
  render sites. `sectionSlug` and the `authorName`/`authorInitials`/
  `authorRole` snapshot fields are the next tier — a few extra fields that
  save a join-read on every article render, and (for author) match the
  Herald README's explicit "no runtime Herald dependency for already-published
  content" rationale.
- **`views` increments are already the accepted, non-negotiable design.**
  [ADR-003](adr/adr-003-first-party-analytics) already decided fire-and-forget
  `FieldValue.increment()` per pageview and rejected the added infrastructure
  a queue/batched-flush approach would need — not relitigated here. At
  [ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md)'s
  own stated traffic (~5k monthly pageviews ≈ ~165/day), this is nowhere
  near the 20k-writes/day free-tier quota, so no additional mitigation is
  needed now.
- **Hot-document write contention is not a real risk at this project's
  scale.** Firestore's informal ~1-write/sec/document guideline applies
  per-document, not collection-wide — every article has its own counter, so
  only a genuinely viral single article (~15+ sustained views/sec) would
  approach it. The standard mitigation (sharded/distributed counters, summed
  on read) is documented here as an explicitly **deferred** future option,
  not built now — building it preemptively would be exactly the kind of
  premature infrastructure every ADR in this repo has avoided.
- **Avoid whole-collection-scan-style queries for small "pick one/few"
  selections.** Keep the trending rail and the featured-banner pick as small
  config docs (e.g. `config/trending` → `{ slugs: string[] }`,
  `config/homepage` → `{ featuredSlug: string | null }`) rather than relying
  on IDX6-backed queries — 1 read instead of an indexed query over the whole
  `articles` collection, and CMS-editable without a redeploy. IDX6 stays in
  the index list above as the fallback if a config-doc approach isn't adopted.
- **Staff `listAll()` runs on every SSR `/staff/*` load** (no ISR cache, per
  [ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)).
  Low volume today ("a handful of editors," per ADR-007), but the repository
  method signature should accept an optional `{ limit, cursor }` now so
  pagination is a non-breaking addition later rather than a signature change.
- **S1-02 FK-validation note** (for whoever implements the adapter, not this
  ticket's job): validate `tagIds` via a single
  `where(documentId(), "in", tagIds)` query (Firestore supports up to 30 IDs
  per `in` clause) instead of N sequential awaited `.get()` calls — same
  total read count, much lower latency.

---

## FK-equivalent invariants

Firestore has no foreign keys. These are documented here per
[ADR-007](adr/adr-007-firestore-over-supabase-as-application-database.md)'s
"FK-equivalent integrity enforced in the Firestore repository adapter and
covered by tests" mitigation — **enforcement is S1-02's job, not this
ticket's**.

1. `articles.sectionSlug` must reference an existing `sections/{sectionSlug}` doc.
2. Every entry in `articles.tagIds[]` must reference an existing `tags/{tagId}` doc.
3. `articles.authorId` — a different kind of check than 1–2: the true FK
   target is Herald (external), not the local `authors/{authorId}` cache
   doc. Validity comes from the value only ever being server-set from a
   verified Herald session, never from a Firestore-side reference check. A
   missing `authors/{authorId}` doc should **not** block a publish, since
   that collection is a derived cache, not the FK target.
4. `articles.coverImageAssetId`, if set, must reference an existing
   `mediaAssets/{assetId}` doc.
5. `articles.status == "Published"` implies `articles.publishedAt != null`.
6. `articles.status == "Published"` implies `coverImageAlt` is non-empty
   (cross-references S5-04 — enforce once, don't duplicate/contradict).
7. A `mediaAssets` doc referenced by any `Published` article's
   `coverImageAssetId` (or an inline body image) should not be
   hard-deletable while referenced — Firestore has no `ON DELETE RESTRICT`;
   flag for S3-03's delete action as a reverse-reference check or soft-delete.
8. `articles.slug` uniqueness — **enforced for free**, no adapter code
   needed, precisely because of the doc-ID-as-slug choice above (a
   non-merge `create()` naturally rejects duplicates).
9. `tags/{tagSlug}` uniqueness — same free-via-doc-ID reasoning as #8.

---

## Domain-type mapping

Applied in this pass (`src/domain/article/article.entity.ts`,
`article-status.value-object.ts`):

| Old field | New field(s) | Change |
|---|---|---|
| `author: string` | `authorId`, `authorName`, `authorInitials`, `authorRole?` | split; `initials`/`role` renamed to `authorInitials`/`authorRole` |
| `date: string` | `publishedAt: Date \| null` | replaced (display string → real timestamp); `publishAt?: Date \| null` added net-new for S3-02 |
| `read: string` | `readTimeMinutes: number` | replaced (free text → number; derive display string at render) |
| `body: string[]` | `body: JSONContent` (from `@tiptap/core`), `bodyText: string` | replaced per ADR-002; `bodyText` net new |
| — | `sectionSlug: string` | net new |
| — | `tagIds: string[]` | net new |
| — | `coverImageUrl?`, `coverImageAssetId?`, `coverImageAlt?` | net new |
| — | `featured?: boolean` | net new (S4-05) |
| — | `createdAt: Date`, `updatedAt: Date` | net new |
| `status: "Published" \| "Draft" \| "Scheduled"` | adds `"Archived"` | S3-01 gap, fixed regardless of backend |

`Section` (`section.value-object.ts`) is unchanged — already 1:1 with the
`sections` schema. `Tag` and `Author` don't exist as domain types yet;
placeholder READMEs added at `src/domain/tag/README.md` and
`src/domain/author/README.md` (mirroring the existing `domain/media`,
`domain/analytics` pattern) point back to this document.

**`body`'s type is Tiptap's own `JSONContent` (from `@tiptap/core`), not a
hand-rolled equivalent.** This is a deliberate exception to
`docs/architecture.md`'s "domain has zero dependency on infrastructure/
frameworks" rule — justified because
[ADR-002](adr/adr-002-tiptap-as-cms-rich-text-editor.md) already commits the
storage format to being literally "whatever Tiptap emits," not just an
editor implementation detail behind the domain boundary. A hand-rolled type
would either drift from Tiptap's real output once the pull-quote/
inline-image extensions land, or duplicate `JSONContent` exactly with extra
maintenance cost. `src/lib/article-format.ts`'s `getBodyParagraphs()` (a
compile-preserving shim for the current mock-shaped article page, not the
real ADR-002 render path) takes the same `JSONContent` type.

The existing `InMemoryArticleRepository` (`src/infrastructure/article/in-memory-article.repository.ts`)
was updated with a mapping shim so the app still compiles/tests pass against
the new `Article` shape — it synthesizes the new fields from the existing
mock `ArticleRecord` (e.g. `authorId`/`authorName` from the existing
`author` string). This is **not** the real Firestore mapping — S1-02 still
does that against real documents.

---

## Known gaps flagged, not fixed here

- **`ArticleRepository` has no `incrementViews()` method.**
  [ADR-003](adr/adr-003-first-party-analytics)'s example calls Firestore
  directly from a Server Action, bypassing the repository port entirely.
  Worth deciding at S1-02/S1-03 time whether that's an accepted exception
  (like the `Publication` singleton pattern in `docs/architecture.md`) or
  should go through the repository port — not decided in this pass.
- **No repository method for `/authors/[slug]`** (`listPublishedByAuthor`)
  despite [ADR-004](adr/adr-004-isr-as-primary-rendering-strategy-for-reader-routes.md)
  already giving that route a 3600s ISR window. Needs adding whenever
  `domain/author/` and that route are built out.
- **S3-02's scheduled-publish flip mechanism is underspecified.** The sprint
  plan says to revalidate reader routes "once `publishAt` passes," but ISR
  revalidation alone re-renders a page — it doesn't mutate Firestore.
  Something (most likely a Vercel Cron hitting a Route Handler that queries
  `status=="Scheduled" AND publishAt<=now` via IDX7) needs to perform that
  write. IDX7 is predefined above so S3-02 doesn't have to scramble for an
  index later, but building the cron/mechanism itself is S3-02's job, not
  this ticket's.
