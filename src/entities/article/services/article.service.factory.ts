import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { FirestoreArticleRepository } from "@/src/entities/article/infrastructure/firestore-article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

// Composition root for the article slice — the only place that knows the
// concrete adapter. Swapping to a real DB later means changing the line
// below; nothing in entities/article/usecase or app/ needs to change.
const articleRepository: ArticleRepository = new FirestoreArticleRepository();

export const articleService = createArticleService(articleRepository);
