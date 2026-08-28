import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import { createArticleService } from "@/src/entities/article/services/article.service";
import { SECTION_PAGE_SIZE } from "@/src/entities/article/usecase/article.usecase";

function fixtureArticle(slug: string, publishedAt: Date): Article {
  return {
    slug,
    sectionSlug: "sports",
    title: slug,
    titleLower: slug,
    dek: "",
    authorId: "test-author",
    authorName: "Test Author",
    authorInitials: "TA",
    publishedAt,
    readTimeMinutes: 1,
    body: { type: "doc", content: [] },
    bodyText: "",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: publishedAt,
    updatedAt: publishedAt,
  };
}

// Enough fixtures to guarantee at least two pages regardless of how many
// Sports articles src/lib/articles.ts already has.
const EXTRA_SPORTS_ARTICLES = SECTION_PAGE_SIZE + 2;

describe("articleService.listPublishedBySection", () => {
  const repo = new InMemoryArticleRepository();
  const service = createArticleService(repo);
  const seeded: Article[] = [];
  for (let i = 0; i < EXTRA_SPORTS_ARTICLES; i++) {
    seeded.push(fixtureArticle(`fixture-sports-${i}`, new Date(2026, 0, i + 1)));
  }

  it("resolves only articles from the requested section, across all pages", async () => {
    await Promise.all(seeded.map((article) => repo.saveArticle(article)));
    const { totalPages } = await service.listPublishedBySection("sports", 1);

    for (let page = 1; page <= totalPages; page++) {
      const { articles } = await service.listPublishedBySection("sports", page);
      expect(articles.every((a) => a.sectionSlug === "sports")).toBe(true);
    }
  });

  it("paginates without duplicates or gaps across all pages", async () => {
    await Promise.all(seeded.map((article) => repo.saveArticle(article)));
    const first = await service.listPublishedBySection("sports", 1);
    expect(first.totalPages).toBeGreaterThan(1);

    const { totalCount } = await repo.listPublishedBySection("sports", {
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
    });

    const seenSlugs = new Set<string>();
    for (let page = 1; page <= first.totalPages; page++) {
      const { articles } = await service.listPublishedBySection("sports", page);
      for (const article of articles) {
        expect(seenSlugs.has(article.slug)).toBe(false); // no duplicates across pages
        seenSlugs.add(article.slug);
      }
    }
    expect(seenSlugs.size).toBe(totalCount); // no gaps: every section article was returned exactly once
  });

  it("caps each page at SECTION_PAGE_SIZE", async () => {
    await Promise.all(seeded.map((article) => repo.saveArticle(article)));
    const { articles } = await service.listPublishedBySection("sports", 1);
    expect(articles.length).toBeLessThanOrEqual(SECTION_PAGE_SIZE);
  });

  it("resolves a page beyond the last page to an empty list, same totalPages", async () => {
    await Promise.all(seeded.map((article) => repo.saveArticle(article)));
    const { totalPages } = await service.listPublishedBySection("sports", 1);
    const beyond = await service.listPublishedBySection("sports", totalPages + 1);
    expect(beyond.articles).toEqual([]);
    expect(beyond.totalPages).toBe(totalPages);
  });

  it("resolves an empty/unknown section to a single empty page", async () => {
    const result = await service.listPublishedBySection("no-such-section", 1);
    expect(result.articles).toEqual([]);
    expect(result.totalPages).toBe(1);
  });
});
