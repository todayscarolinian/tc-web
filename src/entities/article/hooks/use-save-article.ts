import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articleKeys } from "@/src/entities/article/query-keys";
import { parseArticleResponse } from "@/src/entities/article/hooks/parse-article-response";

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }).then(parseArticleResponse),
    onSuccess: (article) => {
      queryClient.setQueryData(articleKeys.staffDetail(article.slug), article);
      queryClient.invalidateQueries({ queryKey: articleKeys.staffLists() });
    },
  });
}

export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: string }) =>
      fetch(`/api/articles/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      }).then(parseArticleResponse),
    onSuccess: (article) => {
      queryClient.setQueryData(articleKeys.staffDetail(article.slug), article);
      queryClient.invalidateQueries({ queryKey: articleKeys.staffLists() });
    },
  });
}
