import { describe, expect, it, vi } from "vitest";
import { InMemoryArticleRepository } from "@/src/entities/article/__tests__/fixtures/in-memory-article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

const PAST = new Date(Date.now() - 60_000);
const FUTURE = new Date(Date.now() + 60 * 60_000);

function fixtureArticle(overrides: Partial<Article> & { slug: string }): Article {
  return {
    sectionSlug: "sports",
    title: overrides.slug,
    titleLower: overrides.slug,
    dek: "",
    authorId: "test-author",
    authorName: "Test Author",
    authorInitials: "TA",
    publishedAt: null,
    publishAt: null,
    readTimeMinutes: 1,
    body: { type: "doc", content: [] },
    bodyText: "",
    tagSlugs: [],
    status: "Draft",
    views: 0,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
    ...overrides,
  };
}

describe("articleService sweepDuePublishes (S3-02 lazy write-on-read)", () => {
  it("listPublished() flips a past-due Scheduled article to Published and includes it", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "due-listpublished", status: "Scheduled", publishAt: PAST }),
    );

    const articles = await service.listPublished();

    expect(articles.some((a) => a.slug === "due-listpublished")).toBe(true);
  });

  it("the flip persists: publishedAt is set and the doc reads back as Published", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "due-persisted", status: "Scheduled", publishAt: PAST }),
    );

    await service.listPublished();
    const article = await service.staff.getBySlug("due-persisted");

    expect(article?.status).toBe("Published");
    expect(article?.publishedAt).not.toBeNull();
  });

  it("leaves a Scheduled article with a future publishAt untouched", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "not-due-yet", status: "Scheduled", publishAt: FUTURE }),
    );

    const articles = await service.listPublished();
    const staffView = await service.staff.getBySlug("not-due-yet");

    expect(articles.some((a) => a.slug === "not-due-yet")).toBe(false);
    expect(staffView?.status).toBe("Scheduled");
  });

  it("leaves plain Draft articles (no publishAt) untouched", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(fixtureArticle({ slug: "plain-draft", status: "Draft" }));

    await service.listPublished();
    const staffView = await service.staff.getBySlug("plain-draft");

    expect(staffView?.status).toBe("Draft");
  });

  it("getBySlug() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "due-getbyslug", status: "Scheduled", publishAt: PAST }),
    );

    const article = await service.getBySlug("due-getbyslug");

    expect(article?.status).toBe("Published");
  });

  it("listPublishedBySection() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({
        slug: "due-section",
        sectionSlug: "sports",
        status: "Scheduled",
        publishAt: PAST,
      }),
    );

    const { articles } = await service.listPublishedBySection("sports", 1);

    expect(articles.some((a) => a.slug === "due-section")).toBe(true);
  });

  it("listByAuthor() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    // InMemoryArticleRepository's mock-data mapping round-trips Article.authorId
    // as the record's display-name field (see toArticle()) — match that here,
    // same as the existing article.service.list-by-author.test.ts convention.
    await repo.saveArticle(
      fixtureArticle({
        slug: "due-author",
        authorName: "Sweep Author",
        status: "Scheduled",
        publishAt: PAST,
      }),
    );

    const articles = await service.listByAuthor("Sweep Author");

    expect(articles.some((a) => a.slug === "due-author")).toBe(true);
  });

  it("search() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({
        slug: "due-search",
        title: "Unmistakable Sweep Fixture Title",
        status: "Scheduled",
        publishAt: PAST,
      }),
    );

    const articles = await service.search("Unmistakable Sweep Fixture");

    expect(articles.some((a) => a.slug === "due-search")).toBe(true);
  });

  it("listTrending() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    // "warriors-ot" is one of the curated TRENDING_SLUGS in src/lib/articles.ts.
    await repo.saveArticle(
      fixtureArticle({ slug: "warriors-ot", status: "Scheduled", publishAt: PAST }),
    );

    await service.listTrending();
    const article = await repo.findBySlug("warriors-ot");

    expect(article?.status).toBe("Published");
  });

  it("staff.listAll() also triggers the sweep — keeps the CMS pill honest", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "due-staff-listall", status: "Scheduled", publishAt: PAST }),
    );

    const articles = await service.staff.listAll();

    expect(articles.find((a) => a.slug === "due-staff-listall")?.status).toBe("Published");
  });

  it("staff.getBySlug() also triggers the sweep", async () => {
    const repo = new InMemoryArticleRepository();
    const service = createArticleService(repo);
    await repo.saveArticle(
      fixtureArticle({ slug: "due-staff-getbyslug", status: "Scheduled", publishAt: PAST }),
    );

    const article = await service.staff.getBySlug("due-staff-getbyslug");

    expect(article?.status).toBe("Published");
  });

  it("a sweep failure on one due article doesn't block the read or other due articles", async () => {
    const inMemory = new InMemoryArticleRepository();
    await inMemory.saveArticle(
      fixtureArticle({ slug: "due-fails", status: "Scheduled", publishAt: PAST }),
    );
    await inMemory.saveArticle(
      fixtureArticle({ slug: "due-succeeds", status: "Scheduled", publishAt: PAST }),
    );

    const flakyRepo: ArticleRepository = {
      ...inMemory,
      listPublished: inMemory.listPublished.bind(inMemory),
      findBySlug: inMemory.findBySlug.bind(inMemory),
      findPublishedBySlug: inMemory.findPublishedBySlug.bind(inMemory),
      listTrending: inMemory.listTrending.bind(inMemory),
      search: inMemory.search.bind(inMemory),
      listPublishedBySection: inMemory.listPublishedBySection.bind(inMemory),
      findPublishedByAuthorId: inMemory.findPublishedByAuthorId.bind(inMemory),
      findDueForPublish: inMemory.findDueForPublish.bind(inMemory),
      findPublishedFeatured: inMemory.findPublishedFeatured.bind(inMemory),
      listFeatured: inMemory.listFeatured.bind(inMemory),
      listAll: inMemory.listAll.bind(inMemory),
      listSections: inMemory.listSections.bind(inMemory),
      findSectionBySlug: inMemory.findSectionBySlug.bind(inMemory),
      findSectionByName: inMemory.findSectionByName.bind(inMemory),
      listByTagSlug: inMemory.listByTagSlug.bind(inMemory), 
      saveArticle: (doc: Article) => {
        if (doc.slug === "due-fails") throw new Error("simulated write failure");
        return inMemory.saveArticle(doc);
      },
      setExclusiveFeatured: inMemory.setExclusiveFeatured.bind(inMemory),
    };

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const service = createArticleService(flakyRepo);

    const articles = await service.listPublished();

    expect(articles.some((a) => a.slug === "due-succeeds")).toBe(true);
    expect(articles.some((a) => a.slug === "due-fails")).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
