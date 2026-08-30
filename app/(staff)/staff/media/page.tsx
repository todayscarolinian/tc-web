import { MediaView } from "@/components/staff/media-view";
import { mediaService } from "@/src/entities/media/services/media.service.factory";
import { toMediaAssetDTO } from "@/src/entities/media/core/media.domain";

export default async function StaffMediaPage() {
  const assets = await mediaService.listAll();
  return <MediaView initialAssets={assets.map(toMediaAssetDTO)} />;
}
