import type { Tag } from "./tag.entity";

// Port only — no implementation lives in domain/.
export interface TagRepository {
  /** All tags, for populating pickers (e.g. the article editor's tag select). */
  listAll(): Promise<Tag[]>;
  /** Raw lookup by identity. */
  findBySlug(slug: string): Promise<Tag | null>;
  /** Creates a new tag if one with this slug doesn't already exist. */
  create(tag: Tag): Promise<void>;
}