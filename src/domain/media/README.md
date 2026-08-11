# domain/media

Not yet implemented — folder scaffolded as a placeholder.

**Future entity** — `MediaAsset`. Field shapes are decided in
[`docs/firestore-schema.md`](../../../docs/firestore-schema.md) (`mediaAssets`
collection, autoId doc ID): `{ id, name, folder, tags, storagePath, url,
contentType, sizeBytes, width, height, variant, altText?, uploadedBy,
uploadedAt, iconKey? }` — this supersedes the earlier sketch that mirrored
`StaffMediaItem` 1:1 (`size`/`dims`/`uploaded` as human-readable strings are
replaced with real numbers/timestamps; `storagePath`/`url`/`contentType` are
added per architecture.md's "referenced from the doc by URL").

**Future value objects** — `MediaFolder`, `MediaTag`.

**Future repository port** — `MediaRepository`:
- `list(filter?: { folder?: string; tag?: string }): Promise<MediaAsset[]>`
- `findById(id: string): Promise<MediaAsset | null>`

**Known blocker (design decided in `docs/firestore-schema.md`, not yet
built):** `StaffMediaItem.icon` in `lib/staff-data.ts` is a `LucideIcon`
component reference, which cannot cross a server-component →
client-component prop boundary. This is *why* `components/staff/media-view.tsx`
currently imports mock data directly instead of receiving it as props. The
`MediaAsset` schema above stores `iconKey: string` instead, resolved to a
component via a small client-side lookup map in the presentation layer —
this redesign is a prerequisite before `media-view.tsx` can be refactored to
accept props.

**Wraps** — `STAFF_MEDIA`, `MEDIA_FOLDERS`, `MEDIA_TAGS` in `lib/staff-data.ts`.
