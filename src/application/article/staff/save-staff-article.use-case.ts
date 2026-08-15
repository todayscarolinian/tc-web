import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { Article, createArticle } from "@/src/domain/article/article.entity";
import type { ArticleInput } from "@/src/domain/article/article.entity";
import { extractPlainText } from "@/src/lib/tiptap";

export async function saveStaffArticle(
  articleRepo: ArticleRepository,
  input: ArticleInput,
) {
  const bodyText = extractPlainText(input.body);
  const article = createArticle({ ...input, bodyText });
  return articleRepo.saveArticle(article);
}
