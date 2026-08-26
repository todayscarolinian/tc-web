import type { Article } from "./article.entity";
import type { Section, SectionName } from "./section.value-object";

// Port only — no implementation lives in domain/. All methods return
// Promises even though today's only adapter is synchronous in-memory data,
// so a future DB-backed adapter is a drop-in swap with no call-site changes.
export interface ArticleRepository {
  /** Published articles only, lead article first. Used by public reads. */
  listPublished(): Promise<Article[]>;
  /** Raw lookup by identity, any status — includes drafts/scheduled. Staff-facing. */
  findBySlug(slug: string): Promise<Article | null>;
  /** Public lookup — resolves to null for anything not Published. */
  findPublishedBySlug(slug: string): Promise<Article | null>;
  listTrending(limit?: number): Promise<Article[]>;
  /** Published articles only. */
  search(query: string): Promise<Article[]>;
  /** Published articles in one section, newest first, offset-paginated. */
  listPublishedBySection(
    sectionSlug: string,
    opts: { limit: number; offset: number },
  ): Promise<{ articles: Article[]; totalCount: number }>;
  /** All statuses. Staff-facing. */
  listAll(): Promise<Article[]>;
  listSections(): Promise<Section[]>;
  findSectionBySlug(slug: string): Promise<Section | null>;
  findSectionByName(name: SectionName): Promise<Section | null>;
  saveArticle(doc: Article): Promise<Article>;
}
