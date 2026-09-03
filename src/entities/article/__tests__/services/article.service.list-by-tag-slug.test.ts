import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import { createArticleService } from "@/src/entities/article/services/article.service";

function fixtureArticle(slug: string, tagSlugs: string[], status: Article["status"] = "Published"): Article {
  return {
    slug,
    sectionSlug: "news",
    title: slug,
    titleLower: slug,
    dek: "",
    authorId: "test-author",
    authorName: "Test Author",
    authorInitials: "TA",
    publishedAt: status === "Published" ? new Date(2026, 0, 1) : null,
    readTimeMinutes: 1,
    body: { type: "doc", content: [] },
    bodyText: "",
    tagSlugs,
    status,
    views: 0,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  };
}

describe("articleService.listByTag", () => {
  it("returns only Published articles matching the tag slug", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);

    await repo.saveArticle(fixtureArticle("published-with-tag", ["tuition"], "Published"));
    await repo.saveArticle(fixtureArticle("draft-with-tag", ["tuition"], "Draft"));
    await repo.saveArticle(fixtureArticle("published-no-tag", ["something-else"], "Published"));

    const results = await service.listByTagSlug("tuition");

    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("published-with-tag");
  });

  it("matches articles carrying the tag among multiple tagSlugs", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);

    await repo.saveArticle(
      fixtureArticle("multi-tag-article", ["tuition", "board-of-trustees", "campus-safety"])
    );

    expect(await service.listByTagSlug("tuition")).toHaveLength(1);
    expect(await service.listByTagSlug("board-of-trustees")).toHaveLength(1);
    expect(await service.listByTagSlug("campus-safety")).toHaveLength(1);
    expect(await service.listByTagSlug("unrelated-tag")).toHaveLength(0);
  });

  it("returns empty array for empty string (empty-string guard)", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);

    const results = await service.listByTagSlug("");
    expect(results).toHaveLength(0);
  });
});