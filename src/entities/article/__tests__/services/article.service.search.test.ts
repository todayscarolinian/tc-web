import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

describe("articleService.search", () => {
  const service = createArticleService(new InMemoryArticleRepository());

  it("matches on title", async () => {
    const results = await service.search("tuition");
    expect(results.map((a) => a.slug)).toContain("tuition");
  });

  it("matches on author, case-insensitively", async () => {
    const results = await service.search("AISHA cruz");
    expect(results.map((a) => a.slug).sort()).toEqual(["eats", "zine"]);
  });

  it("matches on section", async () => {
    const results = await service.search("sports");
    expect(results.every((a) => a.sectionSlug === "sports")).toBe(true);
  });

  it("resolves to [] for no matches", async () => {
    expect(await service.search("no such article exists")).toEqual([]);
  });

  it("resolves a blank query to [] without calling the repository", async () => {
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
      setExclusiveFeatured: () => { throw new Error("should not be called"); },
    };
    const unreachableService = createArticleService(unreachableRepo);
    expect(await unreachableService.search("   ")).toEqual([]);
  });
});
