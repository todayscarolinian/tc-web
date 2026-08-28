import type { JSONContent } from "@tiptap/core";
import { generateText } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import slugify from "slugify";
import type { Article, ArticleInput } from "./article.domain";
import { assertValidArticle } from "./article.domain";
import type { ArticleStatus } from "./article.types";

const extensions = [StarterKit, TextStyleKit, Image];

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

export function extractPlainText(content: JSONContent): string {
  return generateText(content, extensions);
}
