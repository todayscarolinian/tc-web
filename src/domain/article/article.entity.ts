import type { SectionName } from "./section.value-object";
import type { ArticleStatus } from "./article-status.value-object";

export type PhotoVariant = "paper" | "dark" | "duotone";

export type Article = {
  slug: string;
  section: SectionName;
  kickerText?: string;
  title: string;
  dek: string;
  author: string;
  initials: string;
  role?: string;
  date: string;
  read: string;
  variant: PhotoVariant;
  caption?: string;
  // Every article currently shares one canned body (see the in-memory
  // adapter). A real CMS/DB adapter would store per-article content here.
  body: string[];
  status: ArticleStatus;
  views: number;
};

export function assertValidArticle(article: Article): Article {
  if (!article.slug.trim()) throw new Error("Article.slug must not be empty");
  if (!article.title.trim()) throw new Error("Article.title must not be empty");
  return article;
}
