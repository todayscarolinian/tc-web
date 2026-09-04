import type { JSONContent } from "@tiptap/core";
import type { ArticleStatus } from "./article.types";

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
  featured?: boolean;
};

export type ArticleDTO = Omit<Article, "publishedAt" | "publishAt" | "createdAt" | "updatedAt"> & {
  publishedAt: string | null;
  publishAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toArticleDTO(article: Article): ArticleDTO {
  return {
    ...article,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    publishAt: article.publishAt ? article.publishAt.toISOString() : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export function assertValidArticle(article: Article): Article {
  if (!article.slug.trim()) throw new Error("Article.slug must not be empty");
  if (!article.title.trim()) throw new Error("Article.title must not be empty");
  return article;
}
