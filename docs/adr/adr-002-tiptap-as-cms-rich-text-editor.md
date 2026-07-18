# ADR 002 — Tiptap as the CMS Rich Text Editor

**Status:** Accepted
**Date:** 2026-07
**Deciders:** CTO

---

## Context

The CMS requires a rich text editor that allows TC staff to write article bodies with headings, bold/italic text, links, pull quotes, inline images, and block quotes. The editor's output must be renderable on the server for SEO and stored in a format that is portable, usable for basic keyword search, and re-loadable in the editor without data loss.

Two primary approaches were evaluated: building a custom CMS editor using Tiptap (headless, embedded in the Next.js app), or adopting a full headless CMS platform such as Payload CMS.

---

## Decision

We will use **Tiptap** as the rich text editor, embedded directly inside the Next.js CMS routes. Article body content will be stored as **Tiptap's native ProseMirror JSON format** in the `body` field of the article's Firestore document (`articles/{articleId}`).

---

## Rationale

**Tiptap is headless and stack-native.** Tiptap is built on ProseMirror and integrates naturally with React and TypeScript. It requires no additional service, no separate CMS infrastructure, and no opinionated data model imposed from outside. The editor lives in `components/cms/editor/TiptapEditor.tsx` as a standard React component.

**ProseMirror JSON is the right storage format.** Storing editor output as Tiptap JSON (rather than HTML or Markdown) provides:

- Lossless round-trip: the JSON can be loaded back into the editor without parsing or conversion artifacts
- Server-side rendering: `renderTiptapJSON()` converts JSON → HTML at request time for SSR and SEO
- Plain-text extraction: the JSON tree can be traversed to extract a `bodyText` field stored alongside the JSON — Firestore has no native full-text index, so this plain-text mirror is what basic substring search runs against for MVP
- Future portability: the schema is open and well-documented; migrating to a different renderer does not require touching stored data

**Custom extensions are straightforward.** TC requires two non-standard editor nodes: a pull quote block and an inline image with caption. Both are implementable as Tiptap extensions (`extensions/PullQuote.ts`, `extensions/InlineImage.ts`) with full control over schema, rendering, and serialization. A full headless CMS would require custom field plugins or workarounds to achieve the same.

**No additional infrastructure.** Embedding Tiptap in Next.js means zero additional services to deploy, monitor, or maintain during MVP. The CMS is a set of routes inside the same Vercel deployment.

**Team familiarity.** The TC Web Development Team works primarily in Next.js and React. Tiptap's React integration (`@tiptap/react`) follows standard hook patterns that the team already understands.

---

## Consequences

**Positive:**

- No additional service to deploy or maintain
- Full control over editor features, extensions, and output format
- Type-safe integration with the rest of the TypeScript codebase
- ProseMirror JSON enables clean SSR rendering and a plain-text mirror for basic keyword search

**Negative:**

- Custom editor features (pull quotes, inline images) require writing Tiptap extensions — more upfront work than a preconfigured CMS
- Collaborative real-time editing (multiple authors editing the same article simultaneously) requires Yjs integration, which is a post-MVP concern
- The team is responsible for editor UX — there is no preconfigured admin UI

**Mitigations:**

- Pull quote and inline image extensions are scoped to and will be built in MVP
- Collaborative editing is explicitly deferred to post-MVP
- Editor toolbar and UX patterns are defined in the TC Design System prototype

---

## Alternatives Considered

**Payload CMS (self-hosted).** Rejected. Payload is a full headless CMS that ships its own admin UI, data model, and authentication. It would require a separate Node.js service, its own database schema management, and integration work to connect to Herald SSO. The configuration overhead is not justified when the TC team has the capacity to build a focused custom CMS inside Next.js.

**Sanity (hosted).** Rejected. Sanity is a SaaS product with per-seat pricing. It would introduce an external dependency, a separate authentication system for CMS users, and a content lake that lives outside TC's infrastructure. Vendor lock-in and cost are concerns for a student publication.

**Markdown with a raw textarea.** Rejected. Markdown requires writers to learn syntax, provides no WYSIWYG feedback, and makes inline image placement awkward. TC writers are not developers.

**Lexical (Meta).** Considered. Lexical is a capable alternative to Tiptap, also headless and React-native. Rejected because Tiptap has more mature extension documentation, a larger community, and an existing Yjs integration for the future collaborative editing path.

---

## Future Considerations

Post-MVP, if TC grows to multiple simultaneous authors editing the same article, the upgrade path is:

1. Add `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-cursor`
2. Deploy a Hocuspocus WebSocket server (can run on Railway)
3. Store document state in Hocuspocus; sync to Firestore on save

This upgrade does not require changing the stored JSON format or the reader-side rendering pipeline.