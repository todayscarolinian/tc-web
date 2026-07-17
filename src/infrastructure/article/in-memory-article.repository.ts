import { SECTIONS, type SectionInfo } from "@/src/lib/content";
import { ARTICLES, ARTICLE_BODY, TRENDING_SLUGS, type ArticleRecord } from "@/src/lib/articles";
import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { Article } from "@/src/domain/article/article.entity";
import type { Section, SectionName } from "@/src/domain/article/section.value-object";

// Wraps the existing lib/articles.ts mock data — the mock data itself
// stays in lib/, this file only adapts it to the domain shape. Swapping to
// a real DB later means writing a new ArticleRepository implementation,
// not touching this data.
function toArticle(record: ArticleRecord): Article {
  return {
    ...record,
    // Every article currently shares one canned body; a real CMS/DB
    // adapter would store per-article content instead. Pre-existing
    // prototype limitation, not new debt introduced by this adapter.
    body: ARTICLE_BODY,
  };
}

function toSection(info: SectionInfo): Section {
  return { ...info };
}

export class InMemoryArticleRepository implements ArticleRepository {
  async listPublished(): Promise<Article[]> {
    return ARTICLES.filter((article) => article.status === "Published").map(toArticle);
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const record = ARTICLES.find((article) => article.slug === slug);
    return record ? toArticle(record) : null;
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const article = await this.findBySlug(slug);
    return article && article.status === "Published" ? article : null;
  }

  async listTrending(limit = 4): Promise<Article[]> {
    return TRENDING_SLUGS.slice(0, limit)
      .map((slug) => ARTICLES.find((article) => article.slug === slug))
      .filter((article): article is ArticleRecord => Boolean(article))
      .map(toArticle);
  }

  async search(query: string): Promise<Article[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ARTICLES.filter(
      (article) =>
        article.status === "Published" &&
        (article.title.toLowerCase().includes(q) ||
          article.dek.toLowerCase().includes(q) ||
          article.author.toLowerCase().includes(q) ||
          article.section.toLowerCase().includes(q))
    ).map(toArticle);
  }

  async listAll(): Promise<Article[]> {
    return ARTICLES.map(toArticle);
  }

  async listSections(): Promise<Section[]> {
    return SECTIONS.map(toSection);
  }

  async findSectionBySlug(slug: string): Promise<Section | null> {
    const info = SECTIONS.find((section) => section.slug === slug)
    return info ? toSection(info) : null;
  }

  async findSectionByName(name: SectionName): Promise<Section | null> {
    const info = SECTIONS.find((section) => section.name === name);
    return info ? toSection(info) : null;
  }
}
