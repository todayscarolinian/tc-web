import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articleKeys } from "@/src/entities/article/query-keys";
import type { Article } from "@/src/entities/article/core/article.domain";
import type { ArticleStatus } from "@/src/entities/article/core/article.types";

export type BulkArticleActionType = "publish" | "archive" | "delete";

export type BulkArticleActionResult = {
  action: BulkArticleActionType;
  succeeded: string[];
  failedCount: number;
};

const BULK_ACTION_REQUEST: Record<BulkArticleActionType, (slug: string) => Promise<Response>> = {
  publish: (slug) => fetch(`/api/articles/${slug}/publish`, { method: "PUT" }),
  archive: (slug) => fetch(`/api/articles/${slug}/archive`, { method: "PUT" }),
  delete: (slug) => fetch(`/api/articles/${slug}`, { method: "DELETE" }),
};

const BULK_ACTION_NEXT_STATUS: Partial<Record<BulkArticleActionType, ArticleStatus>> = {
  publish: "Published",
  archive: "Archived",
};

export function useBulkArticleAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slugs,
      action,
    }: {
      slugs: string[];
      action: BulkArticleActionType;
    }): Promise<BulkArticleActionResult> => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => {
          const response = await BULK_ACTION_REQUEST[action](slug);
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error ?? response.statusText);
          }
          return slug;
        }),
      );

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value);

      return { action, succeeded, failedCount: results.length - succeeded.length };
    },
    onSuccess: ({ action, succeeded }) => {
      if (succeeded.length === 0) return;
      const succeededSet = new Set(succeeded);
      const nextStatus = BULK_ACTION_NEXT_STATUS[action];
      queryClient.setQueryData<Article[]>(articleKeys.staffList(), (rows) =>
        rows &&
        (nextStatus
          ? rows.map((r) => (succeededSet.has(r.slug) ? { ...r, status: nextStatus } : r))
          : rows.filter((r) => !succeededSet.has(r.slug))),
      );
    },
  });
}
