import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { Figure, Figcaption, ImageResize } from "tiptap-extension-resize-image";
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

// Must match (or be a superset of) the extensions registered by the CMS
// editor (article-editor.tsx) and article.factory.ts's extractPlainText —
// an *unrecognized* mark just renders as nothing, but an unrecognized node
// type makes ProseMirror throw (Schema.nodeType), which crashes this page's
// render. Keep this list in sync whenever those two change.
const ARTICLE_BODY_EXTENSIONS = [
  StarterKit,
  TextStyleKit,
  Image,
  ImageResize,
  Figure,
  Figcaption,
  TableKit,
];

// Server-side render of Article.body (ProseMirror JSON) to HTML, per
// ADR-002's `renderTiptapJSON()` — resolves to @tiptap/html's Node-safe
// build automatically via its package.json `exports` map in a server
// context (no DOM/browser dependency).
export function renderArticleBodyHTML(body: JSONContent): string {
  return generateHTML(body, ARTICLE_BODY_EXTENSIONS);
}
