# infrastructure/media

Not yet implemented. Future `InMemoryMediaRepository` wraps
`STAFF_MEDIA`/`MEDIA_FOLDERS`/`MEDIA_TAGS` from `lib/staff-data.ts`.

Repeating the note from `domain/media/README.md` so it isn't missed: the
mapper here would need to translate each item's `LucideIcon` reference to a
serializable `iconKey: string` before this data can be passed as props to
`components/staff/media-view.tsx`.
