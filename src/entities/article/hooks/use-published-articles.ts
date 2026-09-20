import { useQuery } from "@tanstack/react-query";
import { articleKeys } from "@/src/entities/article/query-keys";
import { reviveArticleDates } from "@/src/entities/article/hooks/revive-article-dates";
import type { Article } from "@/src/entities/article/core/article.domain";

async function fetchPublishedArticles(): Promise<Article[]> {
  const response = await fetch("/api/articles");
  if (!response.ok) throw new Error("Failed to load articles.");
  const { articles } = await response.json();
  return articles.map(reviveArticleDates);
}

export function usePublishedArticles() {
  return useQuery({
    queryKey: articleKeys.publicList(),
    queryFn: fetchPublishedArticles,
  });
}
