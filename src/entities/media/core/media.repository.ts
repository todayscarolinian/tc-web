import type { MediaAsset } from "./media.domain";

// Port only — no implementation lives in core/.
export interface MediaRepository {
  listAll(): Promise<MediaAsset[]>;
  findById(id: string): Promise<MediaAsset | null>;
  create(asset: Omit<MediaAsset, "id">): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
}
