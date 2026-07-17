export type SectionName =
  | "News"
  | "Campus Life"
  | "Sports"
  | "Arts & Culture"
  | "Opinion";

export type SectionInfo = {
  name: SectionName;
  slug: string;
  blurb: string;
  accent: "news" | "campus" | "sports" | "culture" | "opinion";
};

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

export type PhotoVariant = "paper" | "dark" | "duotone";
