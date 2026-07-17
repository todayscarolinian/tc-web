import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

// Staff-facing: all statuses, unlike the public listPublishedArticles.
export function listStaffArticles(repo: ArticleRepository): Promise<Article[]> {
  return repo.listAll();
}
