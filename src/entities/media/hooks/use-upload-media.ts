import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaKeys } from "@/src/entities/media/query-keys";
import { uploadMediaFile } from "@/src/lib/upload-media";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

export function useUploadMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMediaFile,
    onSuccess: ({ asset }) => {
      queryClient.setQueryData<MediaAssetDTO[]>(mediaKeys.list(), (current) =>
        current ? [asset, ...current.filter((item) => item.id !== asset.id)] : [asset],
      );
    },
  });
}
