import { reviveArticleDates } from "@/src/entities/article/hooks/revive-article-dates";
import type { Article } from "@/src/entities/article/core/article.domain";

export async function parseArticleResponse(response: Response): Promise<Article> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error ?? response.statusText);
  }
  const { article } = await response.json();
  return reviveArticleDates(article);
}
