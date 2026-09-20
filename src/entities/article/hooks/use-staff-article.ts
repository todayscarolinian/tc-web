import { useQuery } from "@tanstack/react-query";
import { articleKeys } from "@/src/entities/article/query-keys";
import { reviveArticleDates } from "@/src/entities/article/hooks/revive-article-dates";

export function useStaffArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.staffDetail(slug),
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) throw new Error("Failed to load article.");
      const { article } = await response.json();
      return reviveArticleDates(article);
    },
  });
}
