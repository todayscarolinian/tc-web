import { describe, expect, it } from "vitest";
import type { Article, ArticleInput } from "./article.domain";
import type { ArticleStatus } from "./article.types";
import {
  archiveArticle,
  articleBodyReferencesUrl,
  createArticle,
  publishArticle,
  unpublishArticle,
  updateArticleContent,
} from "./article.factory";

const FIGURE_BODY = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Intro paragraph with several words in it." }] },
    {
      type: "figure",
      content: [
        { type: "imageResize", attrs: { src: "https://example.com/a.jpg" } },
        { type: "figcaption", content: [{ type: "text", text: "A caption" }] },
      ],
    },
  ],
};

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
    publishedAt: null,
    readTimeMinutes: 4,
    body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "paragraph one" }] }] },
    bodyText: "paragraph one",
    tagSlugs: [],
    status: "Draft",
    views: 0,
    createdAt: new Date("2026-06-24"),
    updatedAt: new Date("2026-06-24"),
    ...overrides,
  };
}

function makeInput(overrides: Partial<ArticleInput> = {}): ArticleInput {
  return {
    sectionSlug: "news",
    title: "USC board defers tuition adjustment",
    dek: "Trustees heard testimony on the proposed increase.",
    authorId: "maria-santos",
    authorName: "Maria Santos",
    authorInitials: "MS",
    body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "paragraph one" }] }] },
    tagSlugs: [],
    publishAt: null,
    ...overrides,
  };
}

describe("publishArticle", () => {
  it.each<ArticleStatus>(["Draft", "Scheduled", "Published", "Archived"])(
    "moves a %s article to Published",
    (from) => {
      const article = makeArticle({ status: from });
      const published = publishArticle(article);
      expect(published.status).toBe("Published");
    },
  );

  it("sets publishedAt on first publish", () => {
    const article = makeArticle({ status: "Draft", publishedAt: null });
    const published = publishArticle(article);
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it("preserves the original publishedAt on republish", () => {
    const originalDate = new Date("2026-01-01");
    const article = makeArticle({ status: "Archived", publishedAt: originalDate });
    const published = publishArticle(article);
    expect(published.publishedAt).toEqual(originalDate);
  });
});

describe("unpublishArticle", () => {
  it("moves a Published article to Draft", () => {
    const article = makeArticle({ status: "Published" });
    const unpublished = unpublishArticle(article);
    expect(unpublished.status).toBe("Draft");
  });

  it("preserves publishedAt so a later republish keeps the original date", () => {
    const originalDate = new Date("2026-01-01");
    const article = makeArticle({ status: "Published", publishedAt: originalDate });
    const unpublished = unpublishArticle(article);
    expect(unpublished.publishedAt).toEqual(originalDate);
  });

  it("clears a leftover publishAt so a later save can't reschedule it", () => {
    const article = makeArticle({ status: "Published", publishAt: new Date("2026-01-01") });
    const unpublished = unpublishArticle(article);
    expect(unpublished.publishAt).toBeNull();
  });

  it.each<ArticleStatus>(["Draft", "Scheduled", "Archived"])(
    "throws when unpublishing a %s article",
    (from) => {
      const article = makeArticle({ status: from });
      expect(() => unpublishArticle(article)).toThrow();
    },
  );
});

describe("archiveArticle", () => {
  it.each<ArticleStatus>(["Draft", "Scheduled", "Published"])(
    "moves a %s article to Archived",
    (from) => {
      const article = makeArticle({ status: from });
      const archived = archiveArticle(article);
      expect(archived.status).toBe("Archived");
    },
  );

  it("throws when archiving an already-Archived article", () => {
    const article = makeArticle({ status: "Archived" });
    expect(() => archiveArticle(article)).toThrow();
  });
});

describe("createArticle", () => {
  it("computes readTimeMinutes from word count at 200 wpm", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    const body = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: words }] }] };
    const article = createArticle(makeInput({ body }));
    expect(article.readTimeMinutes).toBe(2);
  });

  it("floors readTimeMinutes at 1 for a very short body", () => {
    const body = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }] };
    const article = createArticle(makeInput({ body }));
    expect(article.readTimeMinutes).toBe(1);
  });

  it("does not throw and computes sane bodyText/readTimeMinutes for a body with figure/imageResize/figcaption nodes", () => {
    expect(() => createArticle(makeInput({ body: FIGURE_BODY }))).not.toThrow();
    const article = createArticle(makeInput({ body: FIGURE_BODY }));
    expect(article.bodyText).toContain("Intro paragraph");
    expect(article.readTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("defaults featured to false when the input omits it", () => {
    expect(createArticle(makeInput()).featured).toBe(false);
  });

  it("sets featured from the input", () => {
    expect(createArticle(makeInput({ featured: true })).featured).toBe(true);
  });
});

describe("updateArticleContent", () => {
  it("preserves Published status on a plain content edit", () => {
    const existing = makeArticle({ status: "Published" });
    const updated = updateArticleContent(existing, makeInput({ title: "Updated title" }));
    expect(updated.status).toBe("Published");
  });

  it("preserves Archived status on a plain content edit", () => {
    const existing = makeArticle({ status: "Archived" });
    const updated = updateArticleContent(existing, makeInput({ title: "Updated title" }));
    expect(updated.status).toBe("Archived");
  });

  it("flips Draft to Scheduled when publishAt is set", () => {
    const existing = makeArticle({ status: "Draft" });
    const updated = updateArticleContent(existing, makeInput({ publishAt: new Date("2026-09-01") }));
    expect(updated.status).toBe("Scheduled");
  });

  it("flips Scheduled back to Draft when publishAt is cleared", () => {
    const existing = makeArticle({ status: "Scheduled" });
    const updated = updateArticleContent(existing, makeInput({ publishAt: null }));
    expect(updated.status).toBe("Draft");
  });

  it("does not let an arbitrary status field on the input override the computed status", () => {
    const existing = makeArticle({ status: "Published" });
    const spoofedInput = { ...makeInput(), status: "Archived" } as ArticleInput;
    const updated = updateArticleContent(existing, spoofedInput);
    expect(updated.status).toBe("Published");
  });

  it("does not throw and computes sane bodyText/readTimeMinutes for a body with figure/imageResize/figcaption nodes", () => {
    const existing = makeArticle();
    expect(() => updateArticleContent(existing, makeInput({ body: FIGURE_BODY }))).not.toThrow();
    const updated = updateArticleContent(existing, makeInput({ body: FIGURE_BODY }));
    expect(updated.bodyText).toContain("Intro paragraph");
    expect(updated.readTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("sets featured from the input", () => {
    const existing = makeArticle({ featured: false });
    expect(updateArticleContent(existing, makeInput({ featured: true })).featured).toBe(true);
  });

  it("clears featured when the input omits it", () => {
    const existing = makeArticle({ featured: true });
    expect(updateArticleContent(existing, makeInput()).featured).toBe(false);
  });
});

describe("articleBodyReferencesUrl", () => {
  it("finds a src on the top-level node", () => {
    const body = { type: "image", attrs: { src: "https://example.com/a.jpg" } };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(true);
  });

  it("finds a src nested inside a figure node", () => {
    const body = {
      type: "doc",
      content: [
        {
          type: "figure",
          content: [
            { type: "imageResize", attrs: { src: "https://example.com/a.jpg" } },
            { type: "figcaption", content: [{ type: "text", text: "caption" }] },
          ],
        },
      ],
    };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(true);
  });

  it("is false when no node's src matches", () => {
    const body = {
      type: "doc",
      content: [{ type: "imageResize", attrs: { src: "https://example.com/other.jpg" } }],
    };
    expect(articleBodyReferencesUrl(body, "https://example.com/a.jpg")).toBe(false);
  });

  it("is false for an empty url", () => {
    const body = { type: "image", attrs: { src: "" } };
    expect(articleBodyReferencesUrl(body, "")).toBe(false);
  });
});
