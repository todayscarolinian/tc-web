import { readImageDimensions } from "@/src/lib/media-format";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

export async function uploadMediaFile(params: {
  file: File;
  folder: string;
  altText: string;
  tagSlugs?: string[];
}): Promise<{ publicUrl: string; asset: MediaAssetDTO }> {
  const { width, height } = await readImageDimensions(params.file);
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("folder", params.folder);
  formData.append("altText", params.altText);
  formData.append("width", String(width));
  formData.append("height", String(height));
  if (params.tagSlugs?.length) {
    formData.append("tagSlugs", JSON.stringify(params.tagSlugs));
  }

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? "Failed to upload image.");
  }

  return payload as { publicUrl: string; asset: MediaAssetDTO };
}
