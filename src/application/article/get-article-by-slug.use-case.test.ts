import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/infrastructure/article/in-memory-article.repository";
import type { ArticleRepository } from "@/src/domain/article/article.repository";
import { getArticleBySlug } from "./get-article-by-slug.use-case";

// Uses the real InMemoryArticleRepository — legitimate here since it and
// lib/articles.ts have zero React/Next dependencies, so this is a genuine
// unit test, not an integration test requiring Next's runtime.
describe("getArticleBySlug", () => {
  const repo = new InMemoryArticleRepository();

  it("resolves a known slug to the matching article", async () => {
    const article = await getArticleBySlug(repo, "tuition");
    expect(article?.title).toBe(
      "USC board defers tuition adjustment after three-hour student hearing"
    );
  });

  it("resolves an unknown slug to null", async () => {
    expect(await getArticleBySlug(repo, "does-not-exist")).toBeNull();
  });

  it("resolves a draft article's slug to null — public reads must not see drafts", async () => {
    expect(await getArticleBySlug(repo, "library-hours-opinion")).toBeNull();
  });

  it("resolves an empty slug to null without calling the repository", async () => {
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
      saveArticle: () => { throw new Error("should not be called"); },
    };
    expect(await getArticleBySlug(unreachableRepo, "")).toBeNull();
  });
});
