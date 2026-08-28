export type Tag = {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
};

export function assertValidTag(tag: Tag): Tag {
  if (!tag.slug.trim()) throw new Error("Tag.slug must not be empty");
  if (!tag.name.trim()) throw new Error("Tag.name must not be empty");
  return tag;
}
