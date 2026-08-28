"use server";

import { tagService } from "@/src/entities/tag/services/tag.service.factory";
import type { Tag } from "@/src/entities/tag/core/tag.domain";

// Since we are just checking the name, its better to just check it only ; unless we do it for consistency check
export async function findOrCreateTagAction(name: string): Promise<Tag> {
  if (!name.trim()) throw new Error("Tag name must not be empty");
  return tagService.findOrCreate(name);
}

export async function getTagsAction(): Promise<Tag[]> {
  return tagService.listAll();
}