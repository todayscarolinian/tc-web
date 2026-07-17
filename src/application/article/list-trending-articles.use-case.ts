import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

export function listTrendingArticles(
  repo: ArticleRepository,
  limit = 4
): Promise<Article[]> {
  return repo.listTrending(limit);
}
