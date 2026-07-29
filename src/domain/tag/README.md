# domain/tag

Not yet implemented — folder scaffolded as a placeholder.

**Future entity** — `Tag`: `{ name, slug, description, createdAt }`. Doc ID =
the tag's own kebab-case slug (see
[`docs/firestore-schema.md`](../../../docs/firestore-schema.md)) — there is
no separate `tagId` field; `slug` is the identity.

**Future repository port** — `TagRepository`:
- `list(): Promise<Tag[]>`
- `findBySlug(slug: string): Promise<Tag | null>`
- `findOrCreateByName(name: string): Promise<Tag>` — CMS tag picker needs a
  "type a new tag, get a doc" flow, not just lookup of pre-seeded tags.

**Relationship to `Article.tagSlugs` and `MediaAsset.tagSlugs`** — both
`Article.tagSlugs: string[]` and `MediaAsset.tagSlugs: string[]` hold `tags`
doc IDs (`Tag.slug` values), resolved against a cached read of the whole
`tags` collection at render time rather than embedded as full `Tag` objects —
see `domain/article/article.entity.ts` and `domain/media/media.entity.ts`.
Both collections share one `tags` collection and one cache. Firestore
enforces no referential integrity here — every `tagSlugs` entry must
reference a real `tags` doc, enforced at the repository-adapter layer
(S1-02), not by the database. See `docs/firestore-schema.md`'s
FK-equivalent-invariants section.

**Supersedes an earlier design note**: this README previously said media
tags were a separate freeform-label concept, unrelated to this collection.
That's no longer the design — media tagging now shares this collection and
`tagSlugs` convention with articles. `MEDIA_TAGS`/`tags` in
`lib/staff-data.ts` is unrelated mock UI data for the staff media-library
view, not a reflection of this decision either way.

**Wraps** — nothing yet; no `tags` shape exists in mock data today (net new,
per the sprint plan's S1-01 ticket).
