import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

// Staff-facing: any status (drafts/scheduled included), unlike the public
// getArticleBySlug.
export function getStaffArticleBySlug(
  repo: ArticleRepository,
  slug: string
): Promise<Article | null> {
  if (!slug.trim()) return Promise.resolve(null);
  return repo.findBySlug(slug);
}
