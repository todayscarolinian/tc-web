export type MediaAsset = {
  id: string;
  name: string;
  folder: string;
  tagSlugs: string[];
  storagePath: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  iconKey: string;
};

export type MediaAssetInput = Omit<MediaAsset, "id" | "uploadedAt"> & {
  uploadedAt?: Date;
};

/** Wire format after JSON / RSC serialization. */
export type MediaAssetDTO = Omit<MediaAsset, "uploadedAt"> & {
  uploadedAt: string;
};

export function toMediaAssetDTO(asset: MediaAsset): MediaAssetDTO {
  return { ...asset, uploadedAt: asset.uploadedAt.toISOString() };
}

export function canAttachMedia(asset: Pick<MediaAsset, "altText">): boolean {
  return asset.altText.trim().length > 0;
}

export function assertValidMediaAsset<T extends Omit<MediaAsset, "id"> & { id?: string }>(
  asset: T,
): T {
  if (!asset.name.trim()) throw new Error("MediaAsset.name must not be empty");
  if (!asset.folder.trim()) throw new Error("MediaAsset.folder must not be empty");
  if (!asset.storagePath.trim()) throw new Error("MediaAsset.storagePath must not be empty");
  if (!asset.url.trim()) throw new Error("MediaAsset.url must not be empty");
  if (!asset.contentType.trim()) throw new Error("MediaAsset.contentType must not be empty");
  if (!asset.uploadedBy.trim()) throw new Error("MediaAsset.uploadedBy must not be empty");
  if (!Number.isFinite(asset.sizeBytes) || asset.sizeBytes < 0) {
    throw new Error("MediaAsset.sizeBytes must be a non-negative number");
  }
  if (!Number.isFinite(asset.width) || asset.width < 0) {
    throw new Error("MediaAsset.width must be a non-negative number");
  }
  if (!Number.isFinite(asset.height) || asset.height < 0) {
    throw new Error("MediaAsset.height must be a non-negative number");
  }
  return asset;
}
