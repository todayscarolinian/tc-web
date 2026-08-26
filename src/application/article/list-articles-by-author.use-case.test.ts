import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/infrastructure/article/in-memory-article.repository";
import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { listArticlesByAuthor } from "./list-articles-by-author.use-case";

describe("listArticlesByAuthor", () => {
  const repo = new InMemoryArticleRepository();

  it("resolves a known author to only their published articles", async () => {
    const results = await listArticlesByAuthor(repo, "Aisha Cruz");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => a.authorId === "Aisha Cruz")).toBe(true);
    expect(results.every((a) => a.status === "Published")).toBe(true);
  });

  it("resolves an unknown author to []", async () => {
    expect(await listArticlesByAuthor(repo, "does-not-exist")).toEqual([]);
  });

  it("resolves a blank authorId to [] without calling the repository", async () => {
    const unreachableRepo: ArticleRepository = {
      listPublished: () => { throw new Error("should not be called"); },
      findBySlug: () => { throw new Error("should not be called"); },
      findPublishedBySlug: () => { throw new Error("should not be called"); },
      listTrending: () => { throw new Error("should not be called"); },
      search: () => { throw new Error("should not be called"); },
      findPublishedByAuthorId: () => { throw new Error("should not be called"); },
      listAll: () => { throw new Error("should not be called"); },
      listSections: () => { throw new Error("should not be called"); },
      findSectionBySlug: () => { throw new Error("should not be called"); },
      findSectionByName: () => { throw new Error("should not be called"); },
      saveArticle: () => { throw new Error("should not be called"); },
    };
    expect(await listArticlesByAuthor(unreachableRepo, "   ")).toEqual([]);
  });
});
