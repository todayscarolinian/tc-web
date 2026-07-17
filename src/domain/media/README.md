# domain/media

Not yet implemented — folder scaffolded as a placeholder.

**Future entity** — `MediaAsset`, mirroring `lib/staff-data.ts`'s
`StaffMediaItem`: `{ id, name, folder, tags, size, dims, uploaded, variant }`.

**Future value objects** — `MediaFolder`, `MediaTag`.

**Future repository port** — `MediaRepository`:
- `list(filter?: { folder?: string; tag?: string }): Promise<MediaAsset[]>`
- `findById(id: string): Promise<MediaAsset | null>`

**Known blocker (real, not fixed by this scaffold):** `StaffMediaItem.icon`
in `lib/staff-data.ts` is a `LucideIcon` component reference, which cannot
cross a server-component → client-component prop boundary. This is *why*
`components/staff/media-view.tsx` currently imports mock data directly
instead of receiving it as props. The future `MediaAsset` entity should
store `iconKey: string` instead, resolved to a component via a small
client-side lookup map in the presentation layer — this redesign is a
prerequisite before `media-view.tsx` can be refactored to accept props.

**Wraps** — `STAFF_MEDIA`, `MEDIA_FOLDERS`, `MEDIA_TAGS` in `lib/staff-data.ts`.
