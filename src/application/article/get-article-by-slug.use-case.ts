import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

// Public-facing: resolves to null for drafts/scheduled articles, not just
// unknown slugs. Staff needing any-status lookup should use
// application/article/staff/get-staff-article-by-slug.use-case.ts instead.
export function getArticleBySlug(
  repo: ArticleRepository,
  slug: string
): Promise<Article | null> {
  if (!slug.trim()) return Promise.resolve(null);
  return repo.findPublishedBySlug(slug);
}
