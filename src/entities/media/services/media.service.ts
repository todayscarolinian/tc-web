import type { MediaRepository } from "@/src/entities/media/core/media.repository";
import type { StoragePort } from "@/src/entities/media/core/storage.port";
import {
  assertValidMediaAsset,
  type MediaAsset,
  type MediaAssetInput,
} from "@/src/entities/media/core/media.domain";
import type { MediaUseCase } from "@/src/entities/media/usecase/media.usecase";

export function createMediaService(
  mediaRepository: MediaRepository,
  storagePort: StoragePort,
): MediaUseCase {
  return {
    listAll(): Promise<MediaAsset[]> {
      return mediaRepository.listAll();
    },

    findById(id: string): Promise<MediaAsset | null> {
      return mediaRepository.findById(id);
    },

    async create(input: MediaAssetInput): Promise<MediaAsset> {
      const asset = assertValidMediaAsset({
        ...input,
        tagSlugs: input.tagSlugs ?? [],
        altText: input.altText ?? "",
        uploadedByName: input.uploadedByName ?? "",
        iconKey: input.iconKey || "image",
        uploadedAt: input.uploadedAt ?? new Date(),
      });
      return mediaRepository.create(asset);
    },

    async delete(id: string): Promise<void> {
      if (!id.trim()) throw new Error("Media asset id must not be empty");
      const existing = await mediaRepository.findById(id);
      if (!existing) throw new Error("Media asset not found");
      await storagePort.delete({ storagePath: existing.storagePath });
      await mediaRepository.delete(id);
    },
  };
}
