export type MediaAsset = {
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
