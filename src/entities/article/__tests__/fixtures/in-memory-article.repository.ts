import type { JSONContent } from "@tiptap/core";
import { SECTIONS, type SectionInfo } from "@/src/entities/section/infrastructure/static-section.repository";
import {
  ARTICLES,
  ARTICLE_BODY,
  TRENDING_SLUGS,
  type ArticleRecord,
} from "@/src/lib/articles";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import type { Section } from "@/src/entities/section/core/section.domain";
import type { SectionName } from "@/src/entities/section/core/section.types";

// Every article currently shares this one canned body; a real per-article
// body lives on the real doc once S1-02 lands. Wrapped as a single
// ProseMirror paragraph node per article so the shape matches `Article.body`.
const SHARED_BODY: JSONContent = {
  type: "doc",
  content: ARTICLE_BODY.map((paragraph) => ({
    type: "paragraph",
    content: [{ type: "text", text: paragraph }],
  })),
};
const SHARED_BODY_TEXT = ARTICLE_BODY.join("\n\n");

// Wraps the existing lib/articles.ts mock data — the mock data itself
// stays in lib/, this file only adapts it to the domain shape. Test-only
// fixture (no production adapter consumes this — the real adapter is
// FirestoreArticleRepository). Fields the mock doesn't have yet (authorId,
// timestamps, tags, cover image, etc.) are synthesized here as a mapping
// shim — the real per-field mapping is S1-02's job once Firestore docs exist.
function toArticle(record: ArticleRecord): Article {
  const { section, ...rest } = record;
  const sectionSlug = SECTIONS.find((s) => s.name === section)?.slug ?? "";
  const publishedAt =
    record.status === "Published" ? new Date(record.date) : null;
  return {
    ...rest,
    sectionSlug,
    titleLower: record.title.toLowerCase(),
    authorId: record.author,
    authorName: record.author,
    authorInitials: record.initials,
    authorRole: record.role,
    authorAvatarUrl: record.avatarUrl,
    publishedAt,
    publishAt: record.publishAt ?? null,
    readTimeMinutes: parseInt(record.read, 10) || 0,
    // Every article currently shares one canned body; a real CMS/DB
    // adapter would store per-article content instead. Pre-existing
    // prototype limitation, not new debt introduced by this adapter.
    body: SHARED_BODY,
    bodyText: SHARED_BODY_TEXT,
    tagSlugs: record.tagSlugs ?? [],
    featured: Boolean(record.featured),
    createdAt: publishedAt ?? new Date(record.date),
    updatedAt: publishedAt ?? new Date(record.date),
  };
}

function toRecord(doc: Article): ArticleRecord {
  return {
    ...doc,
    section: SECTIONS.find((s) => s.slug === doc.sectionSlug)?.name ?? "News",
    date: doc.publishedAt?.toISOString() ?? new Date().toISOString(),
    read: doc.readTimeMinutes.toString(),
    author: doc.authorName,
    initials: doc.authorInitials,
    avatarUrl: doc.authorAvatarUrl,
    status: doc.status,
    featured: Boolean(doc.featured),
    tagSlugs: doc.tagSlugs,
    publishAt: doc.publishAt ?? null,
  };
}

function toSection(info: SectionInfo): Section {
  return { ...info };
}

export class InMemoryArticleRepository implements ArticleRepository {
  private readonly articles: ArticleRecord[];

  constructor(seed: ArticleRecord[] = ARTICLES) {
    this.articles = seed.map((article) => ({ ...article }));
  }

  async listPublished(): Promise<Article[]> {
    return this.articles
      .filter((article) => article.status === "Published")
      .map(toArticle)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const record = this.articles.find((article) => article.slug === slug);
    return record ? toArticle(record) : null;
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const article = await this.findBySlug(slug);
    return article && article.status === "Published" ? article : null;
  }

  async listTrending(limit = 4): Promise<Article[]> {
    return TRENDING_SLUGS.slice(0, limit)
      .map((slug) => this.articles.find((article) => article.slug === slug))
      .filter((article): article is ArticleRecord => Boolean(article))
      .map(toArticle);
  }

  async search(query: string): Promise<Article[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.articles
      .filter(
        (article) =>
          article.status === "Published" &&
          (article.title.toLowerCase().includes(q) ||
            article.dek.toLowerCase().includes(q) ||
            article.author.toLowerCase().includes(q) ||
            article.section.toLowerCase().includes(q)),
      )
      .map(toArticle); // filters ArticleRecord.author (pre-mapping), same value as the mapped Article.authorName
  }

  async listPublishedBySection(
    sectionSlug: string,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<{ articles: Article[]; totalCount: number }> {
    const inSection = this.articles
      .filter(
        (article) =>
          article.status === "Published" &&
          (SECTIONS.find((s) => s.name === article.section)?.slug ?? "") ===
            sectionSlug,
      )
      .map(toArticle)
      .sort((a, b) => {
        const byDate = (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
        return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
      });

    return {
      articles: inSection.slice(offset, offset + limit),
      totalCount: inSection.length,
    };
  }

  async findPublishedByAuthorId(authorId: string): Promise<Article[]> {
    const published = await this.listPublished();
    return published.filter((article) => article.authorId === authorId);
  }

  async findDueForPublish(now: Date): Promise<Article[]> {
    return this.articles
      .filter((article) => article.status === "Scheduled")
      .map(toArticle)
      .filter(
        (article): article is Article & { publishAt: Date } =>
          article.publishAt != null && article.publishAt.getTime() <= now.getTime(),
      );
  }

  async findPublishedFeatured(): Promise<Article | null> {
    const featured = this.articles
      .filter((article) => article.status === "Published")
      .map(toArticle)
      .filter((article) => article.featured)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
    return featured[0] ?? null;
  }

  async listFeatured(): Promise<Article[]> {
    return this.articles.filter((article) => Boolean(article.featured)).map(toArticle);
  }

  async listAll(): Promise<Article[]> {
    return this.articles.map(toArticle);
  }

  async listSections(): Promise<Section[]> {
    return SECTIONS.map(toSection);
  }

  async findSectionBySlug(slug: string): Promise<Section | null> {
    const info = SECTIONS.find((section) => section.slug === slug);
    return info ? toSection(info) : null;
  }

  async findSectionByName(name: SectionName): Promise<Section | null> {
    const info = SECTIONS.find((section) => section.name === name);
    return info ? toSection(info) : null;
  }

  async listByTagSlug(tagSlug: string): Promise<Article[]> {
    return this.articles
      .filter(
        (article) =>
          article.status === "Published" &&
          toArticle(article).tagSlugs.includes(tagSlug),
      )
      .map(toArticle);
  }

  async saveArticle(doc: Article): Promise<Article> {
    const record = toRecord(doc);
    const index = this.articles.findIndex((article) => article.slug === doc.slug);
    if (index === -1) {
      this.articles.push(record);
    } else {
      this.articles[index] = record;
    }
    return doc;
  }

  async setExclusiveFeatured(article: Article): Promise<Article> {
    for (const other of this.articles) {
      if (other.slug !== article.slug && other.featured) {
        other.featured = false;
      }
    }
    return this.saveArticle(article);
  }
}
