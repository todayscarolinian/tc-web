import type { TagRepository } from "@/src/entities/tag/core/tag.repository";
import { FirestoreTagRepository } from "@/src/entities/tag/infrastructure/firestore-tag.repository";
import { createTagService } from "@/src/entities/tag/services/tag.service";

const tagRepository: TagRepository = new FirestoreTagRepository();

export const tagService = createTagService(tagRepository);
