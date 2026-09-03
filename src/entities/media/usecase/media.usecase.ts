import type { MediaAsset, MediaAssetInput } from "@/src/entities/media/core/media.domain";

export interface MediaUseCase {
  listAll(): Promise<MediaAsset[]>;
  findById(id: string): Promise<MediaAsset | null>;
  create(input: MediaAssetInput): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
}
