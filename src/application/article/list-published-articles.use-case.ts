import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

// Trivial pass-through today; the seam for future filtering (status,
// embargo, pagination) once articles have real lifecycle state.
export function listPublishedArticles(repo: ArticleRepository): Promise<Article[]> {
  return repo.listPublished();
}
