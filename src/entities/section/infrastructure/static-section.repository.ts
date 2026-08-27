import type { Section } from "@/src/entities/section/core/section.domain";
import type { SectionName } from "@/src/entities/section/core/section.types";
import type { SectionRepository } from "@/src/entities/section/core/section.repository";

// Retained for callers that just want the plain array/lookup rather than
// going through the SectionRepository port — mirrors the pre-move
// lib/content.ts public surface (SECTIONS, getSectionName, SectionInfo) so
// this move is a pure relocation, not a rename of what call sites consume.
export type SectionInfo = Section;

// The `name`<->`slug` mapping is a static, in-memory lookup over 5 fixed
// entries — not a Firestore join — so Article stores only `sectionSlug` and
// derives the display name here wherever it's needed. See firestore-schema.md.
export const SECTIONS: SectionInfo[] = [
  {
    name: "News",
    slug: "news",
    blurb:
      "What the university is deciding, and what it means for the people who live and learn here.",
    accent: "news",
  },
  {
    name: "Campus Life",
    slug: "campus-life",
    blurb:
      "Stories from inside USC — the dorms, the orgs, the long nights, the people who make the campus run.",
    accent: "campus",
  },
  {
    name: "Sports",
    slug: "sports",
    blurb: "The Warriors, the CESAFI grind, and every Carolinian chasing a podium.",
    accent: "sports",
  },
  {
    name: "Arts & Culture",
    slug: "arts-culture",
    blurb:
      "Cebuano creativity on and off campus — music, print, film, food, and the scenes around them.",
    accent: "culture",
  },
  {
    name: "Opinion",
    slug: "opinion",
    blurb:
      "Where Carolinians argue, persuade, and hold the institution to account. Clearly flagged, never neutral.",
    accent: "opinion",
  },
];

export function getSectionName(slug: string): SectionName {
  const section = SECTIONS.find((s) => s.slug === slug);
  if (!section) throw new Error(`Unknown section slug: ${slug}`);
  return section.name;
}

export class StaticSectionRepository implements SectionRepository {
  async listAll(): Promise<Section[]> {
    return SECTIONS;
  }

  async findBySlug(slug: string): Promise<Section | null> {
    return SECTIONS.find((s) => s.slug === slug) ?? null;
  }

  async findByName(name: SectionName): Promise<Section | null> {
    return SECTIONS.find((s) => s.name === name) ?? null;
  }
}
