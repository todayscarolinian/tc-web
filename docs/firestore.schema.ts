import { SectionName } from "@/src/lib/content";
import { PhotoVariant } from "@/src/lib/content";
import { JSONContent } from "@tiptap/core";
import { ArticleStatus } from "@/src/domain/article/article-status.value-object";
import { MediaVariant } from "@/src/domain/media/media-variant.value-object";
import { SectionAccent } from "@/src/domain/article/section.value-object";

type Article = {
  slug: string;
  section: SectionName; // "News" | "Campus Life" | "Sports" | "Arts & Culture" | "Opinion"
  sectionSlug: string;
  kickerText?: string;
  title: string;
  dek: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorRole?: string;
  publishedAt: Date | null;
  publishAt?: Date | null;
  readTimeMinutes: number;
  variant: PhotoVariant; // "paper" | "dark" | "duotone"
  caption?: string;
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
  body: JSONContent;
  bodyText: string;
  tags: Tag[];
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
  bio: string;
  avatarUrl: string;
  active: boolean;
  updatedAt: Date;
};

type Media = {
  name: string;
  folder: string;
  tags: string[];
  storagePath: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  variant: MediaVariant; // "paper" | "dark" | "duotone"
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

type Section = {
  name: SectionName; // "News" | "Campus Life" | "Sports" | "Arts & Culture" | "Opinion"
  slug: string;
  blurb: string;
  accent: SectionAccent; // "news" | "campus" | "sports" | "culture" | "opinion"
};
