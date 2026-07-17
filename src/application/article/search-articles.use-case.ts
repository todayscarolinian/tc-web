import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

// Guards the blank-query case here so every adapter (in-memory, future DB
// full-text search) doesn't have to reimplement the same short-circuit.
export function searchArticles(repo: ArticleRepository, query: string): Promise<Article[]> {
  if (!query.trim()) return Promise.resolve([]);
  return repo.search(query);
}
