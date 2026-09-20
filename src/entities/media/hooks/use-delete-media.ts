import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaKeys } from "@/src/entities/media/query-keys";
import { deleteMediaAsset } from "@/src/entities/media/actions/media.actions";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

export type BulkDeleteMediaResult = {
  deletedIds: string[];
  errors: { id: string; message: string }[];
};

export function useBulkDeleteMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    // Sequential, not parallel — matches the existing per-item throttling
    // rather than firing every delete request at once.
    mutationFn: async (ids: string[]): Promise<BulkDeleteMediaResult> => {
      const deletedIds: string[] = [];
      const errors: { id: string; message: string }[] = [];

      for (const id of ids) {
        const result = await deleteMediaAsset({ id });
        if ("ok" in result) {
          deletedIds.push(id);
        } else {
          errors.push({ id, message: result.message });
        }
      }

      return { deletedIds, errors };
    },
    onSuccess: ({ deletedIds }) => {
      if (deletedIds.length === 0) return;
      const deletedSet = new Set(deletedIds);
      queryClient.setQueryData<MediaAssetDTO[]>(mediaKeys.list(), (current) =>
        current?.filter((asset) => !deletedSet.has(asset.id)),
      );
    },
  });
}
