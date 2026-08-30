import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { db } from "@/src/lib/firebase/admin";
import { getSectionName, SECTIONS, type SectionInfo } from "@/src/entities/section/infrastructure/static-section.repository";
import { TRENDING_SLUGS } from "@/src/lib/articles";
import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import type { Article } from "@/src/entities/article/core/article.domain";
import type { Section } from "@/src/entities/section/core/section.domain";
import type { SectionName } from "@/src/entities/section/core/section.types";

const ARTICLES_COLLECTION = "articles";

// Converts a Firestore doc into the domain Article shape. Handles Firestore-
// specific quirks (Timestamp fields)
function toDomainArticle(doc: QueryDocumentSnapshot<DocumentData>): Article {
  const data = doc.data();
  return {
    ...data,
    // slug: doc.id, // or data.slug, depending on whether slug is the doc ID
    publishedAt: data.publishedAt
      ? (data.publishedAt as Timestamp).toDate()
      : null,
    publishAt: data.publishAt ? (data.publishAt as Timestamp).toDate() : null,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as Article;
}

function toSection(info: SectionInfo): Section {
  return { ...info };
}

export class FirestoreArticleRepository implements ArticleRepository {
  async listPublished(): Promise<Article[]> {
    const snap = await db
      .collection(ARTICLES_COLLECTION)
      .where("status", "==", "Published")
      .orderBy("publishedAt", "desc")
      .get();
    return snap.docs.map(toDomainArticle);
  }

  async findBySlug(slug: string): Promise<Article | null> {
    // If slug is just a field (not the doc ID):
    const snap = await db
      .collection(ARTICLES_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    return snap.empty ? null : toDomainArticle(snap.docs[0]);
  }

  async findPublishedBySlug(slug: string): Promise<Article | null> {
    const article = await this.findBySlug(slug);
    return article && article.status === "Published" ? article : null;
  }

  async listTrending(limit = 4): Promise<Article[]> {
    // Same approach as in-memory: TRENDING_SLUGS drives curation, not a
    // Firestore query. Fetch each by slug and preserve list order.
    const articles = await Promise.all(
      TRENDING_SLUGS.slice(0, limit).map((slug) => this.findBySlug(slug)),
    );
    return articles.filter((a): a is Article => a !== null);
  }

  async search(query: string): Promise<Article[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Substring approach per S3-04 / this ticket's success criteria — no
    // full-text search. Firestore can't do `LIKE`, so pull published docs
    // and filter in application code, same fields in-memory checks.
    const published = await this.listPublished();
    return published.filter((article) => {
      const sectionName = getSectionName(article.sectionSlug).toLowerCase();

      return (
        article.titleLower?.includes(q) ||
        article.dek?.toLowerCase().includes(q) ||
        article.authorName?.toLowerCase().includes(q) ||
        sectionName?.includes(q)
      );
    });
  }

  async listPublishedBySection(
    sectionSlug: string,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<{ articles: Article[]; totalCount: number }> {
    const base = db
      .collection(ARTICLES_COLLECTION)
      .where("sectionSlug", "==", sectionSlug)
      .where("status", "==", "Published");

    const totalCount = (await base.count().get()).data().count;
    const snap = await base
      .orderBy("publishedAt", "desc")
      .offset(offset)
      .limit(limit)
      .get();

    return { articles: snap.docs.map(toDomainArticle), totalCount };
  }

  async findPublishedByAuthorId(authorId: string): Promise<Article[]> {
    const snap = await db
      .collection(ARTICLES_COLLECTION)
      .where("authorId", "==", authorId)
      .where("status", "==", "Published")
      .orderBy("publishedAt", "desc")
      .get();
    return snap.docs.map(toDomainArticle);
  }

  async findDueForPublish(now: Date): Promise<Article[]> {
    const snap = await db
      .collection(ARTICLES_COLLECTION)
      .where("status", "==", "Scheduled")
      .where("publishAt", "<=", Timestamp.fromDate(now))
      .get();
    return snap.docs.map(toDomainArticle);
  }

  async listAll(): Promise<Article[]> {
    const snap = await db.collection(ARTICLES_COLLECTION).get();
    return snap.docs.map(toDomainArticle);
  }

  async listSections(): Promise<Section[]> {
    // Sections still come from static content config, not Firestore —
    // matches in-memory behavior exactly.
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

  async saveArticle(article: Article): Promise<Article> {
    await db.collection(ARTICLES_COLLECTION).doc(article.slug).set(article);
    return article;
  }
}
