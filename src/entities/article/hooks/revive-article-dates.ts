import type { Article } from "@/src/entities/article/core/article.domain";

type ArticleWireShape = Omit<
  Article,
  "publishedAt" | "publishAt" | "createdAt" | "updatedAt"
> & {
  publishedAt: string | Date | null;
  publishAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// API routes serialize Date fields to ISO strings via NextResponse.json, but
// server-side prefetch seeds the query cache with real Dates (straight from
// the service factory) — any client-triggered refetch must convert these
// back so consumers like articles-view.tsx's `.getTime()` date sort keep
// working after a refetch.
export function reviveArticleDates(article: ArticleWireShape): Article {
  return {
    ...article,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    publishAt: article.publishAt ? new Date(article.publishAt) : null,
    createdAt: new Date(article.createdAt),
    updatedAt: new Date(article.updatedAt),
  };
}
