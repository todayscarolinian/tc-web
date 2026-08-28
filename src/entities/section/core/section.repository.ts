import type { Section } from "./section.domain";
import type { SectionName } from "./section.types";

// Port only — no implementation lives in core/. All methods return
// Promises even though today's only adapter is synchronous static data, so
// a future DB-backed adapter (if sections ever stop being a fixed 5-value
// list) is a drop-in swap with no call-site changes.
export interface SectionRepository {
  listAll(): Promise<Section[]>;
  findBySlug(slug: string): Promise<Section | null>;
  findByName(name: SectionName): Promise<Section | null>;
}
