import type { MediaAsset } from "@/src/entities/media/core/media.domain";
import type { MediaRepository } from "@/src/entities/media/core/media.repository";

export class InMemoryMediaRepository implements MediaRepository {
  constructor(private assets: MediaAsset[] = []) {}

  async listAll(): Promise<MediaAsset[]> {
    return [...this.assets].sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    );
  }

  async findById(id: string): Promise<MediaAsset | null> {
    return this.assets.find((asset) => asset.id === id) ?? null;
  }

  async create(asset: Omit<MediaAsset, "id">): Promise<MediaAsset> {
    const created: MediaAsset = { ...asset, id: crypto.randomUUID() };
    this.assets.push(created);
    return created;
  }

  async delete(id: string): Promise<void> {
    this.assets = this.assets.filter((asset) => asset.id !== id);
  }
}
