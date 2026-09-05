import { describe, expect, it } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { Article, ArticleInput } from "@/src/entities/article/core/article.domain";
import { createArticleService } from "@/src/entities/article/services/article.service";

function fixtureArticle(overrides: Partial<Article> & { slug: string }): Article {
  const publishedAt = overrides.publishedAt ?? new Date("2026-06-24");
  return {
    sectionSlug: "news",
    title: overrides.slug,
    titleLower: overrides.slug,
    dek: "",
    authorId: "test-author",
    authorName: "Test Author",
    authorInitials: "TA",
    publishedAt,
    publishAt: null,
    readTimeMinutes: 1,
    body: { type: "doc", content: [] },
    bodyText: "",
    tagSlugs: [],
    status: "Published",
    views: 0,
    featured: false,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    ...overrides,
  };
}

function inputFrom(article: Article, overrides: Partial<ArticleInput> = {}): ArticleInput {
  return {
    sectionSlug: article.sectionSlug,
    title: article.title,
    dek: article.dek,
    authorId: article.authorId,
    authorName: article.authorName,
    authorInitials: article.authorInitials,
    body: article.body,
    tagSlugs: article.tagSlugs,
    publishAt: article.publishAt ?? null,
    featured: article.featured ?? false,
    ...overrides,
  };
}

describe("articleService.getFeatured", () => {
  it("returns the published featured article", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(fixtureArticle({ slug: "newest", publishedAt: new Date("2026-06-25") }));
    await repo.saveArticle(
      fixtureArticle({ slug: "banner", featured: true, publishedAt: new Date("2026-06-20") }),
    );

    const featured = await service.getFeatured();

    expect(featured?.slug).toBe("banner");
  });

  it("ignores a featured draft and falls back to none", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(fixtureArticle({ slug: "draft-banner", status: "Draft", featured: true, publishedAt: null }));

    expect(await service.getFeatured()).toBeNull();
  });

  it("returns null when no article is marked featured", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(fixtureArticle({ slug: "plain" }));

    expect(await service.getFeatured()).toBeNull();
  });

  it("publishes a due scheduled featured article before returning it", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({
        slug: "due-featured",
        status: "Scheduled",
        featured: true,
        publishedAt: null,
        publishAt: new Date(Date.now() - 60_000),
      }),
    );

    expect((await service.getFeatured())?.slug).toBe("due-featured");
  });
});

describe("articleService exclusive featured flag", () => {
  it("clears featured on the previous banner when another article is marked", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    const first = fixtureArticle({ slug: "first-banner", featured: true });
    const second = fixtureArticle({ slug: "second-banner", featured: false });
    await repo.saveArticle(first);
    await repo.saveArticle(second);

    await service.staff.update("second-banner", inputFrom(second, { featured: true }));

    expect((await repo.findBySlug("first-banner"))?.featured).toBe(false);
    expect((await service.getFeatured())?.slug).toBe("second-banner");
  });

  it("does not clear the live banner when a new draft is saved as featured", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    const live = fixtureArticle({ slug: "live-banner", featured: true });
    await repo.saveArticle(live);

    const draft = await service.staff.save(
      inputFrom(fixtureArticle({ slug: "new-draft", featured: true }), {
        title: "new-draft",
        publishAt: null,
      }),
    );

    expect(draft.status).toBe("Draft");
    expect((await repo.findBySlug("live-banner"))?.featured).toBe(true);
    expect((await service.getFeatured())?.slug).toBe("live-banner");
  });

  it("clears the live banner once a newly featured draft is actually published", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    const live = fixtureArticle({ slug: "live-banner", featured: true });
    await repo.saveArticle(live);
    await repo.saveArticle(
      fixtureArticle({ slug: "queued-draft", status: "Draft", featured: true, publishedAt: null }),
    );

    await service.staff.publish("queued-draft");

    expect((await repo.findBySlug("live-banner"))?.featured).toBe(false);
    expect((await service.getFeatured())?.slug).toBe("queued-draft");
  });
});
