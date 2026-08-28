import type { Tag } from "@/src/entities/tag/core/tag.domain";

export interface TagUseCase {
  listAll(): Promise<Tag[]>;
  findOrCreate(name: string): Promise<Tag>;
}
