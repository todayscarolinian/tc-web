import type { ArticleRepository } from "@/src/entities/article/core/article.repository";
import { FirestoreArticleRepository } from "@/src/entities/article/infrastructure/firestore-article.repository";
import { createArticleService } from "@/src/entities/article/services/article.service";

const articleRepository: ArticleRepository = new FirestoreArticleRepository();

export const articleService = createArticleService(articleRepository);
