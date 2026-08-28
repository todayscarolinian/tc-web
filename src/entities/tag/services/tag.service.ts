import type { TagRepository } from "@/src/entities/tag/core/tag.repository";
import type { TagUseCase } from "@/src/entities/tag/usecase/tag.usecase";

export function createTagService(tagRepository: TagRepository): TagUseCase {
  return {
    listAll: () => tagRepository.listAll(),
    findOrCreate: (name: string) => tagRepository.findOrCreate(name),
  };
}
