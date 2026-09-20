import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articleKeys } from "@/src/entities/article/query-keys";
import { parseArticleResponse } from "@/src/entities/article/hooks/parse-article-response";

export type ArticleStatusTransitionAction = "publish" | "unpublish" | "archive";

export function useArticleStatusTransition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      action,
    }: {
      slug: string;
      action: ArticleStatusTransitionAction;
    }) =>
      fetch(`/api/articles/${slug}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }).then(parseArticleResponse),
    onSuccess: (article) => {
      queryClient.setQueryData(articleKeys.staffDetail(article.slug), article);
      queryClient.invalidateQueries({ queryKey: articleKeys.staffLists() });
    },
  });
}
