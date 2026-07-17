import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/infrastructure/article/in-memory-article.repository";
import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { searchArticles } from "./search-articles.use-case";

describe("searchArticles", () => {
  const repo = new InMemoryArticleRepository();

  it("matches on title", async () => {
    const results = await searchArticles(repo, "tuition");
    expect(results.map((a) => a.slug)).toContain("tuition");
  });

  it("matches on author, case-insensitively", async () => {
    const results = await searchArticles(repo, "AISHA cruz");
    expect(results.map((a) => a.slug).sort()).toEqual(["eats", "zine"]);
  });

  it("matches on section", async () => {
    const results = await searchArticles(repo, "sports");
    expect(results.every((a) => a.section === "Sports")).toBe(true);
  });

  it("resolves to [] for no matches", async () => {
    expect(await searchArticles(repo, "no such article exists")).toEqual([]);
  });

  it("resolves a blank query to [] without calling the repository", async () => {
    const unreachableRepo: ArticleRepository = {
      listPublished: () => { throw new Error("should not be called"); },
      findBySlug: () => { throw new Error("should not be called"); },
      findPublishedBySlug: () => { throw new Error("should not be called"); },
      listTrending: () => { throw new Error("should not be called"); },
      search: () => { throw new Error("should not be called"); },
      listAll: () => { throw new Error("should not be called"); },
      listSections: () => { throw new Error("should not be called"); },
      findSectionBySlug: () => { throw new Error("should not be called"); },
      findSectionByName: () => { throw new Error("should not be called"); },
    };
    expect(await searchArticles(unreachableRepo, "   ")).toEqual([]);
  });
});
