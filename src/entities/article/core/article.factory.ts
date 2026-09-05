import type { JSONContent } from "@tiptap/core";
import { generateText } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { Figure, Figcaption, ImageResize } from "tiptap-extension-resize-image";
import slugify from "slugify";
import type { Article, ArticleInput } from "./article.domain";
import { assertValidArticle } from "./article.domain";
import type { ArticleStatus } from "./article.types";

const extensions = [StarterKit, TextStyleKit, Image, ImageResize, Figure, Figcaption];

const WORDS_PER_MINUTE = 200;

export function calculateReadTimeMinutes(bodyText: string): number {
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function createArticle(input: ArticleInput): Article {
  const bodyText = extractPlainText(input.body);
  const article: Article = {
    ...input,
    slug: slugify(input.title, { lower: true, strict: true }),
    titleLower: input.title.toLowerCase(),
    readTimeMinutes: calculateReadTimeMinutes(bodyText),
    publishedAt: null,
    views: 0,
    bodyText,
    status: input.publishAt ? "Scheduled" : "Draft",
    featured: Boolean(input.featured),
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
    existing.status === "Published" || existing.status === "Archived"
      ? existing.status
      : input.publishAt
        ? "Scheduled"
        : "Draft";

  const bodyText = extractPlainText(input.body);
  const updated: Article = {
    ...existing,
    ...input,
    titleLower: input.title.toLowerCase(),
    bodyText,
    readTimeMinutes: calculateReadTimeMinutes(bodyText),
    status,
    featured: Boolean(input.featured),
    updatedAt: new Date(),
  };
  return assertValidArticle(updated);
}

// Legal from every status, including idempotently from Published and as a
// republish from Archived — there's no illegal source state for publish.
export function publishArticle(article: Article): Article {
  const published: Article = {
    ...article,
    status: "Published",
    publishedAt: article.publishedAt ?? new Date(),
    updatedAt: new Date(),
  };
  return assertValidArticle(published);
}

// Only legal from Published — this is the "take it down" action, distinct
// from the Scheduled->Draft auto-flip that updateArticleContent handles when
// a publishAt date is cleared.
export function unpublishArticle(article: Article): Article {
  if (article.status !== "Published") {
    throw new Error(`Cannot unpublish an article with status ${article.status}`);
  }
  const unpublished: Article = {
    ...article,
    status: "Draft",
    publishAt: null,
    // A taken-down article can't stay the banner pick — clear rather than
    // leave a stale featured:true only findPublishedFeatured's status filter
    // happens to hide.
    featured: false,
    updatedAt: new Date(),
  };
  return assertValidArticle(unpublished);
}

// Legal from any status except Archived itself.
export function archiveArticle(article: Article): Article {
  if (article.status === "Archived") {
    throw new Error("Article is already archived");
  }
  const archived: Article = {
    ...article,
    status: "Archived",
    featured: false,
    updatedAt: new Date(),
  };
  return assertValidArticle(archived);
}

export function extractPlainText(content: JSONContent): string {
  return generateText(content, extensions);
}

export function articleBodyReferencesUrl(content: JSONContent, url: string): boolean {
  if (!url) return false;
  if (content.attrs?.src === url) return true;
  return (content.content ?? []).some((child) => articleBodyReferencesUrl(child, url));
}
