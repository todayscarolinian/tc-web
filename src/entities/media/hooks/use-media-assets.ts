import { useQuery } from "@tanstack/react-query";
import { mediaKeys } from "@/src/entities/media/query-keys";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

async function fetchMediaAssets(): Promise<MediaAssetDTO[]> {
  const response = await fetch("/api/media");
  if (!response.ok) throw new Error("Failed to load media library.");
  const { assets } = await response.json();
  return assets;
}

export function useMediaAssets(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mediaKeys.list(),
    queryFn: fetchMediaAssets,
    enabled: options?.enabled ?? true,
  });
}
