import type { TagRepository } from "@/src/domain/tag/tag.repository";
import { FirestoreTagRepository } from "@/src/infrastructure/tag/firestore-tag.repository";
import type { Tag } from "@/src/domain/tag/tag.entity.ts";
 
export const tagRepository: TagRepository = new FirestoreTagRepository();

export const tagService = {
  listAll: () => tagRepository.listAll(),
  findBySlug: (slug: string) => tagRepository.findBySlug(slug),
  create: (tag: Tag) => tagRepository.create(tag),
};