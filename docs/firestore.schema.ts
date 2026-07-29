import { JSONContent } from "@tiptap/core";
import { ArticleStatus } from "@/src/domain/article/article-status.value-object";

type Article = {
  slug: string;
  sectionSlug: string;
  title: string;
  titleLower: string; // lowercased mirror of title, for case-insensitive prefix-range type-ahead — see firestore-schema.md
  dek: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorRole?: string;
  publishedAt: Date | null;
  publishAt?: Date | null;
  readTimeMinutes: number;
  caption?: string;
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
  body: JSONContent;
  bodyText: string;
  tagSlugs: string[]; // Tag.slug values — not embedded Tag objects, see firestore-schema.md
  status: ArticleStatus; // "Published" | "Draft" | "Scheduled" | "Archived"
  views: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Author = {
  authorId: string;
  name: string;
  slug: string;
  initials: string;
  role: string;
  avatarUrl: string;
  active: boolean;
  updatedAt: Date;
};

type Media = {
  name: string;
  folder: string;
  tagSlugs: string[]; // Tag.slug values, same convention as Article.tagSlugs
  storagePath: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  iconKey: string;
};

type Tag = {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
};

// No `sections` collection: SectionName is a fixed 5-value union already
// load-bearing in code (icons, accent colors, routing) — adding a section
// requires a deploy regardless of where the data lives. `SECTIONS` stays a
// static array in src/lib/content.ts. See firestore-schema.md.
