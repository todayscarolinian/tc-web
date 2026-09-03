import type { SectionName } from "@/src/entities/section/core/section.types";

export type ArticleRecord = {
  slug: string;
  section: SectionName;
  title: string;
  dek: string;
  // Herald `user.id` — distinct from the display name below. See
  // Article.authorId in article.domain.ts.
  authorId: string;
  author: string;
  initials: string;
  role?: string;
  avatarUrl?: string;
  date: string;
  read: string;
  caption?: string;
  coverImageUrl?: string;
  coverImageAssetId?: string;
  coverImageAlt?: string;
  tagSlugs: string[];
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  views: number;
  featured?: boolean;
  // ISO timestamps, mirroring Article.createdAt/updatedAt.
  createdAt: string;
  updatedAt: string;
  // ISO timestamp for a scheduled future publish, mirroring Article.publishAt.
  publishAt?: string | null;
};

// The single source of truth for articles — one row per article, covering
// both what the public site shows (status === "Published") and everything
// staff can see (all statuses).
export const ARTICLES: ArticleRecord[] = [
  {
    slug: "tuition",
    section: "News",
    title: "USC board defers tuition adjustment after three-hour student hearing",
    dek: "Students packed the Buttenbruch gym as trustees heard testimony on the proposed 9.5% increase. A final vote is now expected before the August term opens.",
    authorId: "maria-santos",
    author: "Maria Santos",
    initials: "MS",
    role: "News Editor",
    date: "Jun 24, 2026",
    read: "4 min read",
    caption:
      "Students fill the Buttenbruch Hall gymnasium during Tuesday's public hearing · Photo by Joshua Mendoza / TC",
    tagSlugs: [],
    status: "Published",
    views: 18420,
    createdAt: "2026-06-24T00:00:00.000Z",
    updatedAt: "2026-06-24T00:00:00.000Z",
  },
  {
    slug: "engr-complex",
    section: "News",
    title: "Talamban campus unveils new engineering complex ahead of August term",
    dek: "The six-story building adds 40 laboratories and a fabrication wing, the largest single expansion USC-TC has seen in a decade.",
    authorId: "noah-lim",
    author: "Noah Lim",
    initials: "NL",
    date: "Jun 23, 2026",
    read: "3 min",
    tagSlugs: [],
    status: "Published",
    views: 9120,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    slug: "activity-fee",
    section: "Opinion",
    title: "The activity fee is broken. Here is how the SSC can fix it.",
    dek: "Three reforms could make the student activity fund transparent and accountable within a single semester.",
    authorId: "editorial-board",
    author: "Editorial Board",
    initials: "EB",
    date: "Jun 23, 2026",
    read: "6 min",
    tagSlugs: [],
    status: "Published",
    views: 11260,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    slug: "warriors-ot",
    section: "Sports",
    title: "USC Warriors edge UV in overtime to clinch CESAFI semifinal berth",
    dek: "A buzzer-beating three from Andrei Booc sends the Warriors to the final four for the first time since 2019.",
    authorId: "liam-reyes",
    author: "Liam Reyes",
    initials: "LR",
    date: "Jun 23, 2026",
    read: "3 min",
    tagSlugs: [],
    status: "Published",
    views: 14380,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    slug: "zine",
    section: "Arts & Culture",
    title: "Cebuano zinemakers revive campus print at the Carbon weekend market",
    dek: "A small collective is photocopying its way to a movement, one stapled issue at a time.",
    authorId: "aisha-cruz",
    author: "Aisha Cruz",
    initials: "AC",
    date: "Jun 22, 2026",
    read: "5 min",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    slug: "shuttle",
    section: "Campus Life",
    title: "New shuttle loop to connect USC-Main and South dorms by August",
    dek: "Administration confirms two electric jeepneys will run a 12-minute loop during peak hours.",
    authorId: "patricia-gallardo",
    author: "Patricia Gallardo",
    initials: "PG",
    date: "Jun 22, 2026",
    read: "2 min",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    slug: "thesis",
    section: "Campus Life",
    title: "Inside the all-night thesis crunch at the Baumgartner learning center",
    dek: "When the LRC stays open past midnight during finals, a whole subculture wakes up with it.",
    authorId: "reina-villanueva",
    author: "Reina Villanueva",
    initials: "RV",
    date: "Jun 21, 2026",
    read: "5 min",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: "2026-06-21T00:00:00.000Z",
    updatedAt: "2026-06-21T00:00:00.000Z",
  },
  {
    slug: "jeepney",
    section: "News",
    title: "Jeepney modernization leaves Carolinian commuters scrambling for routes",
    dek: "The phase-out of traditional units along N. Bacalso has lengthened the morning commute for hundreds of students.",
    authorId: "joshua-mendoza",
    author: "Joshua Mendoza",
    initials: "JM",
    date: "Jun 21, 2026",
    read: "4 min",
    tagSlugs: [],
    status: "Published",
    views: 7640,
    createdAt: "2026-06-21T00:00:00.000Z",
    updatedAt: "2026-06-21T00:00:00.000Z",
  },
  {
    slug: "eats",
    section: "Arts & Culture",
    title: "A field guide to the best cheap eats around USC Main",
    dek: "Twelve stalls, one student budget, and a staff that ate through all of them so you do not have to.",
    authorId: "aisha-cruz",
    author: "Aisha Cruz",
    initials: "AC",
    date: "Jun 20, 2026",
    read: "7 min",
    tagSlugs: [],
    status: "Published",
    views: 21030,
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
  },
  {
    slug: "swim",
    section: "Sports",
    title: "Carolinian swimmers sweep relay golds at the CESAFI meet",
    dek: "USC closes the aquatics calendar with five new meet records and a fourth straight overall title.",
    authorId: "liam-reyes",
    author: "Liam Reyes",
    initials: "LR",
    date: "Jun 19, 2026",
    read: "3 min",
    tagSlugs: [],
    status: "Published",
    views: 0,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
  },
  {
    slug: "mentorship-program",
    section: "Campus Life",
    title: "SSC opens applications for the 2026 mentorship program",
    dek: "The council is accepting sign-ups for its peer mentorship track ahead of the August term.",
    authorId: "patricia-gallardo",
    author: "Patricia Gallardo",
    initials: "PG",
    date: "Jun 19, 2026",
    read: "2 min",
    tagSlugs: [],
    status: "Published",
    views: 5210,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
  },
  {
    slug: "library-hours-opinion",
    section: "Opinion",
    title: "Why the new library hours still are not enough",
    dek: "The library's new closing time still leaves thesis writers scrambling before finals.",
    authorId: "miguel-tan",
    author: "Miguel Tan",
    initials: "MT",
    date: "Jun 18, 2026",
    read: "4 min",
    tagSlugs: [],
    status: "Draft",
    views: 0,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
  },
];

// Curated "most read" rail on the home page — an editorial pick, not a
// live top-N-by-views query (see domain/analytics/README.md for where a
// real "most read" query would eventually live).
export const TRENDING_SLUGS = ["warriors-ot", "engr-complex", "activity-fee", "eats"];

// Every article currently shares this one canned body; a real CMS/DB
// adapter would store per-article content instead.
export const ARTICLE_BODY = [
  "The University of San Carlos board of trustees adjourned late Tuesday without a vote on the proposed tuition adjustment, after more than three hours of public testimony that filled the Buttenbruch Hall gymnasium to capacity. Students, parents, and faculty alternated at the microphone, most urging the board to reconsider the 9.5 percent increase set to take effect in August.",
  "Board chair Fr. Narciso Cellan said the deferral was meant to give the finance committee time to review alternative proposals submitted during the hearing. “We heard you,” Cellan told the crowd before the gavel came down. “We owe it to this community to get the number right, not just to get it done.”",
  "The proposed adjustment would raise annual undergraduate tuition by roughly twelve thousand pesos beginning next term. Administrators argue the increase is needed to cover rising operating costs and to fund an expanded financial-aid pool, which they say would offset the change for the lowest-income Carolinians.",
  "Supreme Student Council president Reina Villanueva, who helped organize much of the turnout, called the deferral a partial win but not a resolution. The council plans to return in force when the board reconvenes, and is circulating a petition asking for a published, line-item breakdown of where the new revenue would go.",
  "For now, enrollment for the first semester proceeds under the current rates. The board is expected to meet again before classes open, and has promised to publish the finance committee's findings at least a week ahead of any final vote.",
];
