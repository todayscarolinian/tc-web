import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

describe("articleService.staff.remove", () => {
  it("permanently removes the article", async () => {
    const service = createArticleService(new InMemoryArticleRepository());

    await service.staff.remove("library-hours-opinion");

    expect(await service.staff.getBySlug("library-hours-opinion")).toBeNull();
  });

  it("rejects an unknown slug", async () => {
    const service = createArticleService(new InMemoryArticleRepository());

    await expect(service.staff.remove("does-not-exist")).rejects.toThrow("Article not found: does-not-exist");
  });
});
