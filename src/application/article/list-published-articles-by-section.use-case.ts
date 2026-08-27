import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";

export const SECTION_PAGE_SIZE = 12;

export async function listPublishedArticlesBySection(
  repo: ArticleRepository,
  sectionSlug: string,
  page: number,
): Promise<{ articles: Article[]; totalPages: number; page: number }> {
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const { articles, totalCount } = await repo.listPublishedBySection(
    sectionSlug,
    { limit: SECTION_PAGE_SIZE, offset: (safePage - 1) * SECTION_PAGE_SIZE },
  );

  return {
    articles,
    totalPages: Math.max(1, Math.ceil(totalCount / SECTION_PAGE_SIZE)),
    page: safePage,
  };
}
