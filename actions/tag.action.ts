"use server";

import { tagService } from "@/src/infrastructure/tag/tag.composition";
import { assertValidTag } from "@/src/domain/tag/tag.entity";
import { slugify } from "@/src/lib/slugify";
import type { Tag } from "@/src/domain/tag/tag.entity";

export async function createTagAction(name: string): Promise<Tag> {
  const tag: Tag = {
    name,
    slug: slugify(name),
    description: "",
    createdAt: new Date(),
  };

  assertValidTag(tag);
  await tagService.create(tag);
  return tag;
}

export async function getTagsAction(): Promise<Tag[]> {
  return tagService.listAll();
}