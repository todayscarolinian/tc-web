import { describe, expect, it } from "vitest";
import { assertValidArticle, type Article } from "./article.domain";

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "tuition",
    sectionSlug: "news",
    title: "USC board defers tuition adjustment",
    titleLower: "usc board defers tuition adjustment",
    dek: "Trustees heard testimony on the proposed increase.",
    authorId: "maria-santos",
    authorName: "Maria Santos",
    authorInitials: "MS",
    publishedAt: new Date("2026-06-24"),
    readTimeMinutes: 4,
    body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "paragraph one" }] }] },
    bodyText: "paragraph one",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: new Date("2026-06-24"),
    updatedAt: new Date("2026-06-24"),
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
