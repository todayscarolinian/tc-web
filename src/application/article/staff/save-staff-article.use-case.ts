import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { Article, createArticle } from "@/src/domain/article/article.entity";
import type { ArticleInput } from "@/src/domain/article/article.entity";

export async function saveStaffArticle(
  articleRepo: ArticleRepository,
  input: ArticleInput,
) {
  const article = createArticle(input);
  return articleRepo.saveArticle(article);
}
