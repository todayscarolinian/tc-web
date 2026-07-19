# domain/tag

Not yet implemented — folder scaffolded as a placeholder.

**Future entity** — `Tag`: `{ tagId, name, slug, description?, createdAt }`.
Doc ID = the tag's own kebab-case slug (see
[`docs/firestore-schema.md`](../../../docs/firestore-schema.md)) — no separate
`tagId` field distinct from `slug` in practice, but kept explicit in the type
for parity with `Article`/`Author`.

**Future repository port** — `TagRepository`:
- `list(): Promise<Tag[]>`
- `findBySlug(slug: string): Promise<Tag | null>`
- `findOrCreateByName(name: string): Promise<Tag>` — CMS tag picker needs a
  "type a new tag, get a doc" flow, not just lookup of pre-seeded tags.

**Relationship to `Article.tagIds`** — `Article.tagIds: string[]` (added in
this pass, see `domain/article/article.entity.ts`) holds `tags` doc IDs.
Firestore enforces no referential integrity here — every `tagIds` entry must
reference a real `tags` doc, enforced at the repository-adapter layer
(S1-02), not by the database. See `docs/firestore-schema.md`'s
FK-equivalent-invariants section.

**Not the same concept as `mediaAssets.tags`** — media tags are freeform
labels (`MEDIA_TAGS` in `lib/staff-data.ts`), unrelated to this collection.
Don't conflate the two when implementing either.

**Wraps** — nothing yet; no `tags` shape exists in mock data today (net new,
per the sprint plan's S1-01 ticket).
