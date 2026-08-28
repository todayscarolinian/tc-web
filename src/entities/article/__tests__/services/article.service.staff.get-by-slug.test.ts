import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

describe("articleService.staff.getBySlug", () => {
  const service = createArticleService(new InMemoryArticleRepository());

  it("resolves a draft article — unlike the public use-case, staff can see it", async () => {
    const article = await service.staff.getBySlug("library-hours-opinion");
    expect(article?.status).toBe("Draft");
  });

  it("resolves an unknown slug to null", async () => {
    expect(await service.staff.getBySlug("does-not-exist")).toBeNull();
  });

  it("resolves an empty slug to null", async () => {
    expect(await service.staff.getBySlug("")).toBeNull();
  });
});
