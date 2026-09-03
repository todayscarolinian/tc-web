import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

function unreachableRepo(): ArticleRepository {
  return {
    listPublished: () => {
      throw new Error("should not be called");
    },
    findBySlug: () => {
      throw new Error("should not be called");
    },
    findPublishedBySlug: () => {
      throw new Error("should not be called");
    },
    listTrending: () => {
      throw new Error("should not be called");
    },
    search: () => {
      throw new Error("should not be called");
    },
    listPublishedBySection: () => {
      throw new Error("should not be called");
    },
    findPublishedByAuthorId: () => {
      throw new Error("should not be called");
    },
    findDueForPublish: () => {
      throw new Error("should not be called");
    },
    listAll: () => {
      throw new Error("should not be called");
    },
    listSections: () => {
      throw new Error("should not be called");
    },
    findSectionBySlug: () => {
      throw new Error("should not be called");
    },
    findSectionByName: () => {
      throw new Error("should not be called");
    },
    listByTagSlug: () => {
      throw new Error("should not be called");
    },
    saveArticle: () => {
      throw new Error("should not be called");
    },
    findRelatedArticles: () => {
      throw new Error("should not be called");
    },
    findRecentArticles: () => {
      throw new Error("should not be called");
    },
  };
}

describe("articleService.listRelatedArticles", () => {
  const repo = new InMemoryArticleRepository();
  const service = createArticleService(repo);

  it("ranks same-section+shared-tag above same-section-only above shared-tag-only", async () => {
    const tuition = (await repo.findBySlug("tuition")) as Article;
    const results = await service.listRelatedArticles(tuition, 3);

    expect(results.map((a) => a.slug)).toEqual([
      "engr-complex", // tier 0: same section (news) + shared tag (budget)
      "jeepney", // tier 1: same section (news), no shared tag
      "activity-fee", // tier 2: shared tag (budget/student-fees), different section
    ]);
  });

  it("excludes candidates with neither same section nor a shared tag", async () => {
    const tuition = (await repo.findBySlug("tuition")) as Article;
    const results = await service.listRelatedArticles(tuition, 3);
    const slugs = results.map((a) => a.slug);

    expect(slugs).not.toContain("warriors-ot");
    expect(slugs).not.toContain("swim");
    expect(slugs).not.toContain("zine");
    expect(slugs).not.toContain("shuttle");
  });

  it("never includes the source article itself", async () => {
    const tuition = (await repo.findBySlug("tuition")) as Article;
    const results = await service.listRelatedArticles(tuition, 12);

    expect(results.map((a) => a.slug)).not.toContain("tuition");
  });

  it("backfills with recent articles when related candidates are fewer than limit", async () => {
    const zine = (await repo.findBySlug("zine")) as Article;
    const results = await service.listRelatedArticles(zine, 3);

    expect(results.length).toBe(3);
    expect(results.map((a) => a.slug)).not.toContain("zine");
  });

  it("returns distinct articles even when recent backfill overlaps with related candidates", async () => {
    const zine = (await repo.findBySlug("zine")) as Article;
    const results = await service.listRelatedArticles(zine, 3);
    const slugs = results.map((a) => a.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves a null article to [] without calling the repository", async () => {
    const unreachableService = createArticleService(unreachableRepo());
    expect(
      await unreachableService.listRelatedArticles(
        null as unknown as Article,
        3,
      ),
    ).toEqual([]);
  });
});
