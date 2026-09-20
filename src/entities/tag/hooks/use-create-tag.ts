import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagKeys } from "@/src/entities/tag/query-keys";
import { findOrCreateTagAction } from "@/src/entities/tag/actions/tag.action";
import type { Tag } from "@/src/entities/tag/core/tag.domain";

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: findOrCreateTagAction,
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(tagKeys.list(), (current) =>
        current
          ? current.some((t) => t.slug === tag.slug)
            ? current
            : [...current, tag]
          : [tag],
      );
    },
  });
}
