import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

describe("articleService.listByAuthor", () => {
  const service = createArticleService(new InMemoryArticleRepository());

  it("resolves a known author to only their published articles", async () => {
    const results = await service.listByAuthor("Aisha Cruz");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => a.authorId === "Aisha Cruz")).toBe(true);
    expect(results.every((a) => a.status === "Published")).toBe(true);
  });

  it("resolves an unknown author to []", async () => {
    expect(await service.listByAuthor("does-not-exist")).toEqual([]);
  });

  it("resolves a blank authorId to [] without calling the repository", async () => {
    const unreachableRepo: ArticleRepository = {
      listPublished: () => { throw new Error("should not be called"); },
      findBySlug: () => { throw new Error("should not be called"); },
      findPublishedBySlug: () => { throw new Error("should not be called"); },
      listTrending: () => { throw new Error("should not be called"); },
      search: () => { throw new Error("should not be called"); },
      listPublishedBySection: () => { throw new Error("should not be called"); },
      findPublishedByAuthorId: () => { throw new Error("should not be called"); },
      findDueForPublish: () => { throw new Error("should not be called"); },
      findPublishedFeatured: () => { throw new Error("should not be called"); },
      listFeatured: () => { throw new Error("should not be called"); },
      listAll: () => { throw new Error("should not be called"); },
      listSections: () => { throw new Error("should not be called"); },
      findSectionBySlug: () => { throw new Error("should not be called"); },
      findSectionByName: () => { throw new Error("should not be called"); },
      listByTagSlug: () => { throw new Error("should not be called"); },
      saveArticle: () => { throw new Error("should not be called"); },
    };
    const unreachableService = createArticleService(unreachableRepo);
    expect(await unreachableService.listByAuthor("   ")).toEqual([]);
  });
});
