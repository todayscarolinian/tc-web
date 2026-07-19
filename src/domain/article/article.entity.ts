import type { JSONContent } from "@tiptap/core";
import type { SectionName } from "./section.value-object";
import type { ArticleStatus } from "./article-status.value-object";

export type PhotoVariant = "paper" | "dark" | "duotone";

export type Article = {
  slug: string;
  section: SectionName;
  // Denormalized alongside `section` so revalidation/query code never needs
  // a second lookup just to get the URL-safe form. See docs/firestore-schema.md.
  sectionSlug: string;
  kickerText?: string;
  title: string;
  dek: string;
  // Herald `user.id` — server-set only, never client-supplied (IDOR guard).
  // See src/lib/herald/README.md §7.
  authorId: string;
  // Display-name snapshot captured at publish time, not a live Herald
  // lookup — see src/lib/herald/README.md §7 for why.
  authorName: string;
  authorInitials: string;
  authorRole?: string;
  // Null until first publish. Distinct from `publishAt` (a future
  // scheduled time, S3-02) — this is when the article actually went live.
  publishedAt: Date | null;
  publishAt?: Date | null;
  readTimeMinutes: number;
  variant: PhotoVariant;
  caption?: string;
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
  // Tiptap's native ProseMirror JSON, per ADR-002 — the domain type here is
  // Tiptap's own `JSONContent` rather than a hand-rolled equivalent, since
  // ADR-002 already commits the storage format to "whatever Tiptap emits,"
  // not just the editor's implementation detail. `bodyText` is a plain-text
  // mirror of the same content, extracted for substring search (Firestore
  // has no native full-text index) — see docs/firestore-schema.md.
  body: JSONContent;
  bodyText: string;
  tagIds: string[];
  status: ArticleStatus;
  views: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function assertValidArticle(article: Article): Article {
  if (!article.slug.trim()) throw new Error("Article.slug must not be empty");
  if (!article.title.trim()) throw new Error("Article.title must not be empty");
  return article;
}
