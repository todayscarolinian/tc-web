// Mirrors SectionName/SectionInfo in lib/content.ts. Declared independently
// so the domain layer has zero dependency on lib/, which infrastructure wraps.
export type SectionName =
  | "News"
  | "Campus Life"
  | "Sports"
  | "Arts & Culture"
  | "Opinion";

export type SectionAccent = "news" | "campus" | "sports" | "culture" | "opinion";

export type Section = {
  name: SectionName;
  slug: string;
  blurb: string;
  accent: SectionAccent;
};
