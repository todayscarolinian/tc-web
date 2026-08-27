import type { JSONContent } from "@tiptap/core";
import type { ArticleStatus } from "./article-status.value-object";
import slugify from "slugify";
import { generateText } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";

const extensions = [StarterKit, TextStyleKit, Image];

export type Article = {
  slug: string;
  sectionSlug: string;
  title: string;
  titleLower: string;
  dek: string;
  // Herald `user.id` — server-set only, never client-supplied (IDOR guard).
  // See src/lib/herald/README.md §7.
  authorId: string;
  // Display-name snapshot captured at publish time, not a live Herald
  // lookup — see src/lib/herald/README.md §7 for why.
  authorName: string;
  authorInitials: string;
  authorRole?: string;
  authorAvatarUrl?: string;
  // Null until first publish. Distinct from `publishAt` (a future
  // scheduled time, S3-02) — this is when the article actually went live.
  publishedAt: Date | null;
  publishAt?: Date | null;
  readTimeMinutes: number;
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
  // Tag.slug values, not embedded Tag objects — resolved against a cached
  // read of the whole `tags` collection at render time. See firestore-schema.md.
  tagSlugs: string[];
  status: ArticleStatus;
  views: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleInput = {
  sectionSlug: string;
  title: string;
  dek: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorRole?: string;
  authorAvatarUrl?: string;
  caption?: string;
  body: JSONContent;
  tagSlugs: string[];
  publishAt: Date | null;
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
};

export function createArticle(input: ArticleInput): Article {
  const article: Article = {
    ...input,
    slug: slugify(input.title, { lower: true, strict: true }),
    titleLower: input.title.toLowerCase(),
    readTimeMinutes: 1, // currently an arbitrary value
    publishedAt: null,
    views: 0,
    bodyText: extractPlainText(input.body),
    status: input.publishAt ? "Scheduled" : "Draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return assertValidArticle(article);
}

export function updateArticleContent(
  existing: Article,
  input: ArticleInput,
): Article {
  const status: ArticleStatus =
    existing.status === "Published"
      ? "Published"
      : input.publishAt
        ? "Scheduled"
        : "Draft";

  const updated: Article = {
    ...existing,
    ...input,
    titleLower: input.title.toLowerCase(),
    bodyText: extractPlainText(input.body),
    readTimeMinutes: 1, // currently arbitrary, but will need calculation
    status,
    updatedAt: new Date(),
  };
  return assertValidArticle(updated);
}

export function publishArticle(article: Article): Article {
  const published: Article = {
    ...article,
    status: "Published",
    publishedAt: article.publishedAt ?? new Date(),
    updatedAt: new Date(),
  };
  return assertValidArticle(published);
}

export function assertValidArticle(article: Article): Article {
  if (!article.slug.trim()) throw new Error("Article.slug must not be empty");
  if (!article.title.trim()) throw new Error("Article.title must not be empty");
  return article;
}

export function extractPlainText(content: JSONContent): string {
  return generateText(content, extensions);
}
