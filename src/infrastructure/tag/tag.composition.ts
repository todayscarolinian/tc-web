import type { TagRepository } from "@/src/domain/tag/tag.repository";
import { FirestoreTagRepository } from "@/src/infrastructure/tag/firestore-tag.repository";
 
export const tagRepository: TagRepository = new FirestoreTagRepository();

export const tagService = {
  listAll: () => tagRepository.listAll(),
  findOrCreate: (name: string) => tagRepository.findOrCreate(name),
};