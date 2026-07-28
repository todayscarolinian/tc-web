import { SectionName } from "./section.value-object";
import { SectionAccent } from "./section.value-object";

export type Section = {
  name: SectionName;
  slug: string;
  blurb: string;
  accent: SectionAccent;
};

export function assertValidSection(section: Section): Section {
  if (!section.slug.trim()) throw new Error("Section.slug must not be empty");
  if (!section.name.trim()) throw new Error("Section.name must not be empty");
  return section;
}
