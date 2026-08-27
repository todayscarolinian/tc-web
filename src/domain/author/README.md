# domain/author

Not yet implemented — folder scaffolded as a placeholder.

**Future entity** — `Author`: `{ authorId, name, slug, initials, role?, bio?,
avatarUrl?, active, updatedAt }`. Doc ID = Herald's `user.id`. See
[`docs/firestore-schema.md`](../../../docs/firestore-schema.md) for the full
field list and rationale.

**This is a Herald identity cache, not the source of truth.** Herald (TC's
IdP/SSO, see `src/lib/herald/README.md`) owns real identity. This collection
exists for the `/author/[slug]` reader route, a CMS author-picker (S2-04),
and richer bio/avatar data than a per-article snapshot carries — not as
something `Article.authorId`'s validity is checked against. Lazily upserted
as a side effect of the publish flow (piggybacking the same write that sets
`Article.authorId`/`authorName`), not proactively synced.

**Future repository port** — `AuthorRepository`:
- `findBySlug(slug: string): Promise<Author | null>` — for `/author/[slug]`
- `findById(authorId: string): Promise<Author | null>`
- `upsertFromHeraldSession(user: HeraldUser): Promise<Author>` — the
  lazy-cache-write path, called from the same Server Action that publishes
  an article

**Relationship to `Article`** — `Article.authorId`/`authorName`/
`authorInitials`/`authorRole` (added in this pass, see
`domain/article/article.entity.ts`) are a byline **snapshot** captured at
publish time, deliberately not a live join against this collection — see
`src/lib/herald/README.md` §7 for why (ISR pages shouldn't have a runtime
dependency on Herald to render already-published content).

**Wraps** — nothing yet; `Article.author` is currently a flat string in both
the domain type and `lib/articles.ts`'s mock data (net new split, per S1-01
and the Herald README's already-decided design).
