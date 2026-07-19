import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";

// Article.date/read (display strings) were replaced by publishedAt/
// readTimeMinutes on the domain type — see docs/firestore-schema.md. Derive
// the display strings here instead of storing them, so they can't drift
// out of sync with the real timestamp.
export function formatDisplayDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

// Must match (or be a superset of) whatever the CMS editor (S2-01)
// registers — a node/mark Tiptap doesn't recognize renders as nothing, not
// an error. StarterKit already bundles Link and Blockquote; Image and
// tables are separate installs. Per ADR-002, the pull-quote and inline
// -image-with-caption extensions are still to be built (S2-01) — add them
// here once they exist so already-published bodies keep rendering.
const ARTICLE_BODY_EXTENSIONS = [StarterKit, Image, TableKit];

// Server-side render of Article.body (ProseMirror JSON) to HTML, per
// ADR-002's `renderTiptapJSON()` — resolves to @tiptap/html's Node-safe
// build automatically via its package.json `exports` map in a server
// context (no DOM/browser dependency).
export function renderArticleBodyHTML(body: JSONContent): string {
  return generateHTML(body, ARTICLE_BODY_EXTENSIONS);
}
