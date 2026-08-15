import { ArticleRepository } from "@/src/domain/article/article.repository";
import type {
  ArticleInput,
  Article,
} from "@/src/domain/article/article.entity";
import { extractPlainText } from "@/src/lib/tiptap";
import { updateArticleContent } from "@/src/domain/article/article.entity";
export async function updateStaffArticle(
  articleRepo: ArticleRepository,
  slug: string,
  doc: ArticleInput,
): Promise<Article> {
  const existing = await articleRepo.findBySlug(slug);
  if (!existing) throw new Error(`Article not found: ${slug}`);

  const bodyText = extractPlainText(doc.body);
  const article = updateArticleContent(existing, { ...doc, bodyText });

  return articleRepo.saveArticle(article);
}
