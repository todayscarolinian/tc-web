import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

export function listArticlesByAuthor(repo: ArticleRepository, authorId: string): Promise<Article[]> {
  if (!authorId.trim()) return Promise.resolve([]);
  return repo.findPublishedByAuthorId(authorId);
}
