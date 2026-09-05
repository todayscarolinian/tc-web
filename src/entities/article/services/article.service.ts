import { after } from "next/server";
import { revalidatePath } from "next/cache";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import type {
  Article,
  ArticleInput,
} from "@/src/entities/article/core/article.domain";
import {
  archiveArticle,
  createArticle,
  publishArticle,
  unpublishArticle,
  updateArticleContent,
} from "@/src/entities/article/core/article.factory";
import type { SectionName } from "@/src/entities/section/core/section.types";
import type { ArticleUseCase } from "@/src/entities/article/usecase/article.usecase";
import { SECTION_PAGE_SIZE } from "@/src/entities/article/usecase/article.usecase";
import { RELATED_ARTICLES_LIMIT } from "../core/article.types";

async function sweepDuePublishes(
  repo: ArticleRepository,
  now = new Date(),
): Promise<void> {
  const due = await repo.findDueForPublish(now);
  if (due.length === 0) return;

  await Promise.all(
    due.map(async (article) => {
      try {
        const published = publishArticle(article);
        await repo.saveArticle(published);

        try {
          after(() => {
            revalidatePath(`/article/${published.slug}`);
          });
        } catch {
          // no-op
        }
      } catch (err) {
        console.error(
          `sweepDuePublishes: failed to publish ${article.slug}`,
          err,
        );
      }
    }),
  );
}

export function createArticleService(repo: ArticleRepository): ArticleUseCase {
  return {
    async listPublished(): Promise<Article[]> {
      await sweepDuePublishes(repo);
      return repo.listPublished();
    },

    // Public-facing: resolves to null for drafts/scheduled articles, not just
    // unknown slugs. Staff needing any-status lookup should use staff.getBySlug.
    async getBySlug(slug: string): Promise<Article | null> {
      if (!slug.trim()) return null;
      await sweepDuePublishes(repo);
      return repo.findPublishedBySlug(slug);
    },

    async listTrending(limit = 4): Promise<Article[]> {
      await sweepDuePublishes(repo);
      return repo.listTrending(limit);
    },

    // Guards the blank-query case here so every adapter doesn't have to reimplement the same short-circuit.
    async search(query: string): Promise<Article[]> {
      if (!query.trim()) return [];
      await sweepDuePublishes(repo);
      return repo.search(query);
    },

    async listPublishedBySection(
      sectionSlug: string,
      page: number,
    ): Promise<{ articles: Article[]; totalPages: number; page: number }> {
      const safePage = Math.max(1, Math.trunc(page) || 1);
      await sweepDuePublishes(repo);
      const { articles, totalCount } = await repo.listPublishedBySection(
        sectionSlug,
        {
          limit: SECTION_PAGE_SIZE,
          offset: (safePage - 1) * SECTION_PAGE_SIZE,
        },
      );

      return {
        articles,
        totalPages: Math.max(1, Math.ceil(totalCount / SECTION_PAGE_SIZE)),
        page: safePage,
      };
    },

    async listRelatedArticles(
      article: Article,
      limit = RELATED_ARTICLES_LIMIT,
    ): Promise<Article[]> {
      if (!article) return [];
      await sweepDuePublishes(repo);

      const related = await repo.findRelatedArticles(article, limit);

      if (related.length >= limit) {
        return related.slice(0, limit);
      }

      // Over-fetch by `limit`, not the remaining count — recent articles can
      // overlap with `related`, and dedup below needs slack to still land on `limit`.
      const recent = await repo.findRecentArticles(limit);

      const combined = new Map<string, Article>();

      for (const candidate of related) {
        if (candidate.slug !== article.slug) {
          combined.set(candidate.slug, candidate);
        }
      }

      for (const candidate of recent) {
        if (candidate.slug !== article.slug) {
          combined.set(candidate.slug, candidate);
        }
      }

      return Array.from(combined.values()).slice(0, limit);
    },

    async listByAuthor(authorId: string): Promise<Article[]> {
      if (!authorId.trim()) return [];
      await sweepDuePublishes(repo);
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
      async listAll(): Promise<Article[]> {
        await sweepDuePublishes(repo);
        return repo.listAll();
      },

      // Staff-facing: any status (drafts/scheduled included), unlike the
      // public getBySlug.
      async getBySlug(slug: string): Promise<Article | null> {
        if (!slug.trim()) return null;
        await sweepDuePublishes(repo);
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

      async unpublish(slug: string): Promise<Article> {
        const article = await repo.findBySlug(slug);
        if (!article) throw new Error(`Article not found: ${slug}`);

        const unpublished = unpublishArticle(article);

        return repo.saveArticle(unpublished);
      },

      async archive(slug: string): Promise<Article> {
        const article = await repo.findBySlug(slug);
        if (!article) throw new Error(`Article not found: ${slug}`);

        const archived = archiveArticle(article);

        return repo.saveArticle(archived);
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
