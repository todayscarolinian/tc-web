import type { Article } from "./article.domain";
import type { Section } from "@/src/entities/section/core/section.domain";
import type { SectionName } from "@/src/entities/section/core/section.types";

// Port only — no implementation lives in core/.
export interface ArticleRepository {
  /** Published articles only, lead article first. Used by public reads. */
  listPublished(): Promise<Article[]>;
  /** Raw lookup by identity, any status — includes drafts/scheduled. Staff-facing. */
  findBySlug(slug: string): Promise<Article | null>;
  /** Public lookup — resolves to null for anything not Published. */
  findPublishedBySlug(slug: string): Promise<Article | null>;
  listTrending(limit?: number): Promise<Article[]>;
  /** Related articles lookup */
  findRelatedArticles(article: Article, limit?: number): Promise<Article[]>;
  findRecentArticles(limit?: number): Promise<Article[]>;
  /** Published articles only. */
  search(query: string): Promise<Article[]>;
  /** Published articles in one section, newest first, offset-paginated. */
  listPublishedBySection(
    sectionSlug: string,
    opts: { limit: number; offset: number },
  ): Promise<{ articles: Article[]; totalCount: number }>;
  /** Published articles by a given author, most recent first. */
  findPublishedByAuthorId(authorId: string): Promise<Article[]>;
  /** Scheduled articles whose publishAt has already passed `now`. */
  findDueForPublish(now: Date): Promise<Article[]>;
  /** Newest published article marked featured, if any. */
  findPublishedFeatured(): Promise<Article | null>;
  /** Any status — used to keep at most one featured flag. */
  listFeatured(): Promise<Article[]>;
  /** All statuses. Staff-facing. */
  listAll(): Promise<Article[]>;
  listSections(): Promise<Section[]>;
  findSectionBySlug(slug: string): Promise<Section | null>;
  findSectionByName(name: SectionName): Promise<Section | null>;
  /** Published articles carrying a given tag slug, most recent first. */
  listByTagSlug(tagSlug: string): Promise<Article[]>;
  saveArticle(doc: Article): Promise<Article>;
  /**
   * Persists `article` (already `featured: true`) and clears `featured` on
   * every other article, atomically — callers must not read-then-write the
   * exclusivity invariant themselves (see FirestoreArticleRepository).
   */
  setExclusiveFeatured(article: Article): Promise<Article>;
}
