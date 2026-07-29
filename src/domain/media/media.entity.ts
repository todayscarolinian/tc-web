import { MediaVariant } from "@/src/domain/media/media-variant.value-object";

export type MediaAsset = {
  name: string;
  folder: string;
  tags: string[];
  storagePath: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  variant: MediaVariant;
  altText: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  iconKey: string;
};
