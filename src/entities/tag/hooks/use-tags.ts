import { useQuery } from "@tanstack/react-query";
import { tagKeys } from "@/src/entities/tag/query-keys";
import { getTagsAction } from "@/src/entities/tag/actions/tag.action";

export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: getTagsAction,
  });
}
