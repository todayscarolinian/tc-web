import type { Tag } from "./tag.domain";

// Port only — no implementation lives in core/.
export interface TagRepository {
  /** All tags, for populating pickers (e.g. the article editor's tag select). */
  listAll(): Promise<Tag[]>;
  /** Finds a tag by name, or creates it if it doesn't exist. */
  findOrCreate(name: string): Promise<Tag>;
}
