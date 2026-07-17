import { describe, expect, it } from "vitest";
import { assertValidArticle, type Article } from "./article.entity";

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "tuition",
    section: "News",
    title: "USC board defers tuition adjustment",
    dek: "Trustees heard testimony on the proposed increase.",
    author: "Maria Santos",
    initials: "MS",
    date: "Jun 24, 2026",
    read: "4 min read",
    variant: "dark",
    body: ["paragraph one"],
    ...overrides,
  };
}

describe("assertValidArticle", () => {
  it("throws when slug is empty", () => {
    expect(() => assertValidArticle(makeArticle({ slug: "  " }))).toThrow(
      "Article.slug must not be empty"
    );
  });

  it("throws when title is empty", () => {
    expect(() => assertValidArticle(makeArticle({ title: "" }))).toThrow(
      "Article.title must not be empty"
    );
  });

  it("returns the same article unchanged when valid", () => {
    const article = makeArticle();
    expect(assertValidArticle(article)).toBe(article);
  });
});
