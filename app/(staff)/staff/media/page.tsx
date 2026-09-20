import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MediaView } from "@/components/staff/media-view";
import { mediaService } from "@/src/entities/media/services/media.service.factory";
import { toMediaAssetDTO } from "@/src/entities/media/core/media.domain";
import { mediaKeys } from "@/src/entities/media/query-keys";

export default async function StaffMediaPage() {
  const queryClient = new QueryClient();

  await queryClient
    .query({
      queryKey: mediaKeys.list(),
      queryFn: async () => (await mediaService.listAll()).map(toMediaAssetDTO),
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaView />
    </HydrationBoundary>
  );
}
