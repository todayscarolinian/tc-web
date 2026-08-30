import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import type { Article, ArticleInput } from "@/src/entities/article/core/article.domain";
import { createArticle, publishArticle, updateArticleContent } from "@/src/entities/article/core/article.factory";
import type { SectionName } from "@/src/entities/section/core/section.types";
import type { ArticleUseCase } from "@/src/entities/article/usecase/article.usecase";
import { SECTION_PAGE_SIZE } from "@/src/entities/article/usecase/article.usecase";

export function createArticleService(repo: ArticleRepository): ArticleUseCase {
  return {
    listPublished(): Promise<Article[]> {
      return repo.listPublished();
    },

    // Public-facing: resolves to null for drafts/scheduled articles, not just
    // unknown slugs. Staff needing any-status lookup should use staff.getBySlug.
    getBySlug(slug: string): Promise<Article | null> {
      if (!slug.trim()) return Promise.resolve(null);
      return repo.findPublishedBySlug(slug);
    },

    listTrending(limit = 4): Promise<Article[]> {
      return repo.listTrending(limit);
    },

    // Guards the blank-query case here so every adapter doesn't have to reimplement the same short-circuit.
    search(query: string): Promise<Article[]> {
      if (!query.trim()) return Promise.resolve([]);
      return repo.search(query);
    },

    async listPublishedBySection(
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
    },

    listByAuthor(authorId: string): Promise<Article[]> {
      if (!authorId.trim()) return Promise.resolve([]);
      return repo.findPublishedByAuthorId(authorId);
    },

    listSections: () => repo.listSections(),
    findSectionBySlug: (slug: string) => repo.findSectionBySlug(slug),
    findSectionByName: (name: SectionName) => repo.findSectionByName(name),
    listByTagSlug(tagSlug: string): Promise<Article[]> {
      if (!tagSlug.trim()) return Promise.resolve([]);
      return repo.listByTagSlug(tagSlug);
    },

    staff: {
      // Staff-facing: all statuses, unlike the public listPublished.
      listAll(): Promise<Article[]> {
        return repo.listAll();
      },

      // Staff-facing: any status (drafts/scheduled included), unlike the
      // public getBySlug.
      getBySlug(slug: string): Promise<Article | null> {
        if (!slug.trim()) return Promise.resolve(null);
        return repo.findBySlug(slug);
      },

      async save(doc: ArticleInput): Promise<Article> {
        const article = createArticle(doc);
        return repo.saveArticle(article);
      },

      async publish(slug: string): Promise<Article> {
        const article = await repo.findBySlug(slug);
        if (!article) throw new Error(`Article not found: ${slug}`);

        const published = publishArticle(article);

        return repo.saveArticle(published);
      },

      async update(slug: string, doc: ArticleInput): Promise<Article> {
        const existing = await repo.findBySlug(slug);
        if (!existing) throw new Error(`Article not found: ${slug}`);

        const article = updateArticleContent(existing, doc);

        return repo.saveArticle(article);
      },
    },
  };
}
