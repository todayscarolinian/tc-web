"use server";

import { tagService } from "@/src/infrastructure/tag/tag.composition";
import type { Tag } from "@/src/domain/tag/tag.entity";

// Since we are just checking the name, its better to just check it only ; unless we do it for consistency check
export async function findOrCreateTagAction(name: string): Promise<Tag> {
  if (!name.trim()) throw new Error("Tag name must not be empty");
  return tagService.findOrCreate(name);
}

export async function getTagsAction(): Promise<Tag[]> {
  return tagService.listAll();
}