import type {
  Article,
  ArticleInput,
} from "@/src/entities/article/core/article.domain";
import type { Section } from "@/src/entities/section/core/section.domain";
import type { SectionName } from "@/src/entities/section/core/section.types";

export const SECTION_PAGE_SIZE = 12;

export interface ArticleUseCase {
  /** Published articles only, most recent first. */
  listPublished(): Promise<Article[]>;
  /** The single published featured/breaking story, or null when none is marked. */
  getFeatured(): Promise<Article | null>;
  /** Public-facing: resolves to null for drafts/scheduled articles, not just unknown slugs. */
  getBySlug(slug: string): Promise<Article | null>;
  listTrending(limit?: number): Promise<Article[]>;
  /** Published articles only. */
  search(query: string): Promise<Article[]>;
  listPublishedBySection(
    sectionSlug: string,
    page: number,
  ): Promise<{ articles: Article[]; totalPages: number; page: number }>;
  listRelatedArticles(article: Article, limit?: number): Promise<Article[]>;
  /** Published articles by a given author, most recent first. */
  listByAuthor(authorId: string): Promise<Article[]>;
  listSections(): Promise<Section[]>;
  findSectionBySlug(slug: string): Promise<Section | null>;
  findSectionByName(name: SectionName): Promise<Section | null>;
  listByTagSlug(tagSlug: string): Promise<Article[]>;
  staff: {
    /** All statuses, unlike the public listPublished. */
    listAll(): Promise<Article[]>;
    /** Any status (drafts/scheduled included), unlike the public getBySlug. */
    getBySlug(slug: string): Promise<Article | null>;
    save(doc: ArticleInput): Promise<Article>;
    publish(slug: string): Promise<Article>;
    unpublish(slug: string): Promise<Article>;
    archive(slug: string): Promise<Article>;
    update(slug: string, doc: ArticleInput): Promise<Article>;
  };
}
