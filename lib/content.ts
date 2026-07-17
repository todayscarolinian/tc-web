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

export function sectionBySlug(slug: string) {
  return SECTIONS.find((s) => s.slug === slug);
}

export function sectionByName(name: string) {
  return SECTIONS.find((s) => s.name === name);
}

export type PhotoVariant = "paper" | "dark" | "duotone";

export type Story = {
  slug: string;
  section: SectionName;
  kickerText?: string;
  title: string;
  dek: string;
  author: string;
  initials: string;
  role?: string;
  date: string;
  read: string;
  variant: PhotoVariant;
  caption?: string;
};

export const LEAD: Story = {
  slug: "tuition",
  section: "News",
  kickerText: "News · Breaking",
  title: "USC board defers tuition adjustment after three-hour student hearing",
  dek: "Students packed the Buttenbruch gym as trustees heard testimony on the proposed 9.5% increase. A final vote is now expected before the August term opens.",
  author: "Maria Santos",
  initials: "MS",
  role: "News Editor",
  date: "Jun 24, 2026",
  read: "4 min read",
  variant: "dark",
  caption:
    "Students fill the Buttenbruch Hall gymnasium during Tuesday's public hearing · Photo by Joshua Mendoza / TC",
};

export const STORIES: Story[] = [
  {
    slug: "engr-complex",
    section: "News",
    title: "Talamban campus unveils new engineering complex ahead of August term",
    dek: "The six-story building adds 40 laboratories and a fabrication wing, the largest single expansion USC-TC has seen in a decade.",
    author: "Noah Lim",
    initials: "NL",
    date: "Jun 23",
    read: "3 min",
    variant: "paper",
  },
  {
    slug: "activity-fee",
    section: "Opinion",
    title: "The activity fee is broken. Here is how the SSC can fix it.",
    dek: "Three reforms could make the student activity fund transparent and accountable within a single semester.",
    author: "Editorial Board",
    initials: "EB",
    date: "Jun 23",
    read: "6 min",
    variant: "paper",
  },
  {
    slug: "warriors-ot",
    section: "Sports",
    title: "USC Warriors edge UV in overtime to clinch CESAFI semifinal berth",
    dek: "A buzzer-beating three from Andrei Booc sends the Warriors to the final four for the first time since 2019.",
    author: "Liam Reyes",
    initials: "LR",
    date: "Jun 23",
    read: "3 min",
    variant: "duotone",
  },
  {
    slug: "zine",
    section: "Arts & Culture",
    title: "Cebuano zinemakers revive campus print at the Carbon weekend market",
    dek: "A small collective is photocopying its way to a movement, one stapled issue at a time.",
    author: "Aisha Cruz",
    initials: "AC",
    date: "Jun 22",
    read: "5 min",
    variant: "paper",
  },
  {
    slug: "shuttle",
    section: "Campus Life",
    title: "New shuttle loop to connect USC-Main and South dorms by August",
    dek: "Administration confirms two electric jeepneys will run a 12-minute loop during peak hours.",
    author: "Patricia Gallardo",
    initials: "PG",
    date: "Jun 22",
    read: "2 min",
    variant: "paper",
  },
  {
    slug: "thesis",
    section: "Campus Life",
    title: "Inside the all-night thesis crunch at the Baumgartner learning center",
    dek: "When the LRC stays open past midnight during finals, a whole subculture wakes up with it.",
    author: "Reina Villanueva",
    initials: "RV",
    date: "Jun 21",
    read: "5 min",
    variant: "dark",
  },
  {
    slug: "jeepney",
    section: "News",
    title: "Jeepney modernization leaves Carolinian commuters scrambling for routes",
    dek: "The phase-out of traditional units along N. Bacalso has lengthened the morning commute for hundreds of students.",
    author: "Joshua Mendoza",
    initials: "JM",
    date: "Jun 21",
    read: "4 min",
    variant: "paper",
  },
  {
    slug: "eats",
    section: "Arts & Culture",
    title: "A field guide to the best cheap eats around USC Main",
    dek: "Twelve stalls, one student budget, and a staff that ate through all of them so you do not have to.",
    author: "Aisha Cruz",
    initials: "AC",
    date: "Jun 20",
    read: "7 min",
    variant: "paper",
  },
  {
    slug: "swim",
    section: "Sports",
    title: "Carolinian swimmers sweep relay golds at the CESAFI meet",
    dek: "USC closes the aquatics calendar with five new meet records and a fourth straight overall title.",
    author: "Liam Reyes",
    initials: "LR",
    date: "Jun 19",
    read: "3 min",
    variant: "duotone",
  },
];

export const ALL_STORIES: Story[] = [LEAD, ...STORIES];

export function storyBySlug(slug: string) {
  return ALL_STORIES.find((s) => s.slug === slug);
}

export const RAIL = [
  { slug: "warriors-ot", section: "Sports" as SectionName, title: "Warriors edge UV in overtime to clinch semifinal berth" },
  { slug: "engr-complex", section: "News" as SectionName, title: "Talamban unveils new engineering complex ahead of August" },
  { slug: "activity-fee", section: "Opinion" as SectionName, title: "The activity fee is broken. Here is how to fix it." },
  { slug: "eats", section: "Arts & Culture" as SectionName, title: "A field guide to the best cheap eats around USC Main" },
];

export const ARTICLE_BODY = [
  "The University of San Carlos board of trustees adjourned late Tuesday without a vote on the proposed tuition adjustment, after more than three hours of public testimony that filled the Buttenbruch Hall gymnasium to capacity. Students, parents, and faculty alternated at the microphone, most urging the board to reconsider the 9.5 percent increase set to take effect in August.",
  "Board chair Fr. Narciso Cellan said the deferral was meant to give the finance committee time to review alternative proposals submitted during the hearing. “We heard you,” Cellan told the crowd before the gavel came down. “We owe it to this community to get the number right, not just to get it done.”",
  "The proposed adjustment would raise annual undergraduate tuition by roughly twelve thousand pesos beginning next term. Administrators argue the increase is needed to cover rising operating costs and to fund an expanded financial-aid pool, which they say would offset the change for the lowest-income Carolinians.",
  "Supreme Student Council president Reina Villanueva, who helped organize much of the turnout, called the deferral a partial win but not a resolution. The council plans to return in force when the board reconvenes, and is circulating a petition asking for a published, line-item breakdown of where the new revenue would go.",
  "For now, enrollment for the first semester proceeds under the current rates. The board is expected to meet again before classes open, and has promised to publish the finance committee’s findings at least a week ahead of any final vote.",
];
