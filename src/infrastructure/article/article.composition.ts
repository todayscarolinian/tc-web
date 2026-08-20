import type { ArticleRepository } from "@/src/domain/article/article.repository";
import type { SectionName } from "@/src/domain/article/section.value-object";
import type { ArticleInput } from "@/src/domain/article/article.entity";
import { listPublishedArticles } from "@/src/application/article/list-published-articles.use-case";
import { getArticleBySlug } from "@/src/application/article/get-article-by-slug.use-case";
import { listTrendingArticles } from "@/src/application/article/list-trending-articles.use-case";
import { searchArticles } from "@/src/application/article/search-articles.use-case";
import { listStaffArticles } from "@/src/application/article/staff/list-staff-articles.use-case";
import { getStaffArticleBySlug } from "@/src/application/article/staff/get-staff-article-by-slug.use-case";
import { saveStaffArticle } from "@/src/application/article/staff/save-staff-article.use-case";
import { publishStaffArticle } from "@/src/application/article/staff/publish-staff-article.use-case";
import { FirestoreArticleRepository } from "@/src/infrastructure/article/firestore-article.repository";
import { updateStaffArticle } from "@/src/application/article/staff/update-staff-article.use-case";
// Composition root for the article slice — the only place that knows the
// concrete adapter. Swapping to a real DB later means changing the line
// below (e.g. to `new FirestoreArticleRepository(prisma)`); nothing in
// application/ or app/ needs to change.
export const articleRepository: ArticleRepository =
  new FirestoreArticleRepository();

export const articleService = {
  listPublished: () => listPublishedArticles(articleRepository),
  getBySlug: (slug: string) => getArticleBySlug(articleRepository, slug),
  listTrending: (limit?: number) =>
    listTrendingArticles(articleRepository, limit),
  search: (query: string) => searchArticles(articleRepository, query),
  listSections: () => articleRepository.listSections(),
  findSectionBySlug: (slug: string) =>
    articleRepository.findSectionBySlug(slug),
  findSectionByName: (name: SectionName) =>
    articleRepository.findSectionByName(name),
  // Staff-facing: all statuses. See application/article/staff/.
  staff: {
    listAll: () => listStaffArticles(articleRepository),
    getBySlug: (slug: string) => getStaffArticleBySlug(articleRepository, slug),
    save: (doc: ArticleInput) => saveStaffArticle(articleRepository, doc),
    publish: (slug: string) => publishStaffArticle(articleRepository, slug),
    update: (slug: string, doc: ArticleInput) =>
      updateStaffArticle(articleRepository, slug, doc),
  },
};
