# domain/media

**Implemented (S1-05)** — `storage.port.ts` defines `StoragePort`, a
non-persistence capability port (same convention as
`domain/auth/session.port.ts`) for issuing signed Storage upload URLs.
`createSignedUploadUrl({ storagePath, contentType })` → `{ uploadUrl,
publicUrl }`. Implemented by
`infrastructure/media/firebase-storage.adapter.ts`; consumed (behind a Herald
staff check) by `actions/media.actions.ts`. This port has no concept of
`MediaAsset`/Firestore persistence — it only knows how to talk to Storage.

**Implemented (S1-05)** — `MediaAsset` entity (`media.entity.ts`). Field shapes are decided in
[`docs/firestore-schema.md`](../../../docs/firestore-schema.md) (`mediaAssets`
collection, autoId doc ID): `{ id, name, folder, tags, storagePath, url,
contentType, sizeBytes, width, height, variant, altText?, uploadedBy,
uploadedAt, iconKey? }` — this supersedes the earlier sketch that mirrored
`StaffMediaItem` 1:1 (`size`/`dims`/`uploaded` as human-readable strings are
replaced with real numbers/timestamps; `storagePath`/`url`/`contentType` are
added per architecture.md's "referenced from the doc by URL").

**Not yet implemented** — `MediaFolder`, `MediaTag` value objects, and the
`MediaRepository` port for persisting/querying `mediaAssets` Firestore docs
(depends on S1-01/S1-02 landing first):
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
