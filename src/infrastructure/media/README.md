# infrastructure/media

**Implemented (S1-05):** the Storage upload path. `firebase-storage.adapter.ts`
(`FirebaseStorageAdapter implements StoragePort`) wraps Firebase Storage via
the shared Admin SDK bootstrap (`infrastructure/firebase/admin.ts`), issuing
short-lived v4 signed upload URLs. `media.composition.ts` wires it into an
exported `mediaStorageService`, consumed by `actions/media.actions.ts`
(`requestMediaUploadUrl`) — the only place staff-only write is actually
enforced, since `storage.rules` has no client identity to check (see
`storage.rules` at the repo root and `docs/architecture.md`).

**Not yet implemented:** `MediaRepository`/`InMemoryMediaRepository` for
`mediaAssets` Firestore docs (metadata: name, folder, tagSlugs, storagePath,
url, altText, ...) — that's S1-01/S1-02-dependent. Once it lands, it would
wrap `STAFF_MEDIA`/`MEDIA_FOLDERS`/`MEDIA_TAGS` from `lib/staff-data.ts` the
same way `InMemoryArticleRepository` wraps the article mocks today.

Repeating the note from `domain/media/README.md` so it isn't missed: that
future mapper would need to translate each item's `LucideIcon` reference to a
serializable `iconKey: string` before this data can be passed as props to
`components/staff/media-view.tsx`.
