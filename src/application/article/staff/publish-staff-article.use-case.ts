import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { Article, createArticle } from "@/src/domain/article/article.entity";
import { extractPlainText } from "@/src/lib/tiptap";
import { publishArticle } from "@/src/domain/article/article.entity";
export async function publishStaffArticle(
  articleRepo: ArticleRepository,
  slug: string,
): Promise<Article> {
  const article = await articleRepo.findBySlug(slug);
  if (!article) throw new Error(`Article not found: ${slug}`);

  const published = publishArticle(article);

  return articleRepo.saveArticle(published);
}
