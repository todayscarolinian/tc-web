import {
  LayoutDashboard,
  FileText,
  Images,
  LineChart,
  Settings,
  Eye,
  Flame,
  Users,
  Clock3,
  Newspaper,
  Image as ImageIcon,
  MapPin,
  TrendingUp,
  UserSquare,
  type LucideIcon,
} from "lucide-react";
import type { PhotoVariant, SectionName } from "@/src/lib/content";

export const CURRENT_STAFF_USER = {
  name: "Maria Santos",
  role: "News Editor",
  initials: "MS",
};

export type StaffNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const STAFF_NAV_ITEMS: StaffNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { id: "articles", label: "Articles", href: "/staff/articles", icon: FileText },
  { id: "media", label: "Media", href: "/staff/media", icon: Images },
  { id: "analytics", label: "Analytics", href: "/staff/analytics", icon: LineChart },
  { id: "settings", label: "Settings", href: "/staff/settings", icon: Settings },
];

// Article/status types and mock article rows used to live here as
// StaffArticle/STAFF_ARTICLES — superseded by the unified Article entity
// in domain/article/ and the merged dataset in lib/articles.ts. See
// docs/architecture.md ("staff-article merge") for why.

export type TopStory = {
  rank: number;
  id: string;
  title: string;
  section: SectionName;
  views: number;
};

export const TOP_STORIES: TopStory[] = [
  { rank: 1, id: "eats", title: "A field guide to the best cheap eats around USC Main", section: "Arts & Culture", views: 21030 },
  { rank: 2, id: "tuition", title: "USC board defers tuition adjustment after hearing", section: "News", views: 18420 },
  { rank: 3, id: "warriors-ot", title: "Warriors edge UV in overtime thriller", section: "Sports", views: 14380 },
  { rank: 4, id: "activity-fee", title: "The activity fee is broken. Here is how to fix it.", section: "Opinion", views: 11260 },
  { rank: 5, id: "engr-complex", title: "Talamban unveils new engineering complex", section: "News", views: 9120 },
];

export type DashboardStat = {
  key: string;
  label: string;
  sub: string;
  value: string;
  delta: string;
  up: boolean;
  icon: LucideIcon;
};

export const DASHBOARD_STATS: DashboardStat[] = [
  { key: "views", label: "Total views", sub: "This month", value: "312,480", delta: "+18.2%", up: true, icon: Eye },
  { key: "top", label: "Top article", sub: "Cheap eats around USC Main", value: "21,030", delta: "views", up: true, icon: Flame },
  { key: "readers", label: "New readers", sub: "This week", value: "4,860", delta: "+9.4%", up: true, icon: Users },
  { key: "time", label: "Avg. read time", sub: "Last 30 days", value: "3m 48s", delta: "+12s", up: true, icon: Clock3 },
];

export type PageviewPoint = { date: string; views: number };

// Deterministic pseudo-random walk so the mock series is stable across renders/builds.
function seededSeries(len: number, seed: number, base: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v += (rand() - 0.42) * 0.6;
    v = Math.max(2.5, Math.min(13.5, v));
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

const CHART_END = new Date(Date.UTC(2026, 5, 24)); // Jun 24, 2026 — "today" in the mock newsroom calendar

function buildSeries(thousands: number[]): PageviewPoint[] {
  const start = new Date(CHART_END);
  start.setUTCDate(start.getUTCDate() - (thousands.length - 1));
  return thousands.map((k, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), views: Math.round(k * 1000) };
  });
}

const DAILY_30 = [
  6.2, 5.8, 6.9, 7.4, 6.1, 5.2, 5.6, 7.1, 8.3, 7.8,
  6.4, 6.0, 7.7, 9.1, 10.4, 9.2, 7.3, 6.8, 8.0, 9.6,
  11.2, 10.1, 8.4, 7.9, 9.3, 11.8, 13.4, 12.1, 10.6, 12.9,
];
const DAILY_60_EARLIER = seededSeries(60, 7, 4.5);

export const PAGEVIEWS_30D: PageviewPoint[] = buildSeries(DAILY_30);
export const PAGEVIEWS_7D: PageviewPoint[] = buildSeries(DAILY_30.slice(-7));
export const PAGEVIEWS_90D: PageviewPoint[] = buildSeries([...DAILY_60_EARLIER, ...DAILY_30]);

export const MEDIA_FOLDERS = ["All", "Covers", "Photos", "Illustrations", "Sports", "Campus"] as const;
export const MEDIA_TAGS = [
  "tuition", "warriors", "engineering", "zine", "shuttle", "hearing", "portrait", "cesafi",
] as const;

export type StaffMediaItem = {
  id: string;
  name: string;
  folder: (typeof MEDIA_FOLDERS)[number];
  tags: string[];
  size: string;
  dims: string;
  uploaded: string;
  variant: PhotoVariant;
  icon: LucideIcon;
};

export const STAFF_MEDIA: StaffMediaItem[] = [
  { id: "hearing-gym-wide", name: "hearing-gym-wide.jpg", folder: "Covers", tags: ["tuition", "hearing"], size: "4.1 MB", dims: "4032×2688", uploaded: "Jun 24, 2026", variant: "dark", icon: Newspaper },
  { id: "villanueva-podium", name: "villanueva-podium.jpg", folder: "Photos", tags: ["tuition", "portrait"], size: "2.8 MB", dims: "3600×2400", uploaded: "Jun 24, 2026", variant: "paper", icon: UserSquare },
  { id: "engr-complex-facade", name: "engr-complex-facade.jpg", folder: "Photos", tags: ["engineering"], size: "3.6 MB", dims: "4000×2667", uploaded: "Jun 23, 2026", variant: "duotone", icon: Newspaper },
  { id: "warriors-buzzer", name: "warriors-buzzer.jpg", folder: "Sports", tags: ["warriors", "cesafi"], size: "3.1 MB", dims: "3840×2560", uploaded: "Jun 23, 2026", variant: "duotone", icon: TrendingUp },
  { id: "zine-table-carbon", name: "zine-table-carbon.jpg", folder: "Photos", tags: ["zine"], size: "2.2 MB", dims: "3200×2133", uploaded: "Jun 22, 2026", variant: "paper", icon: ImageIcon },
  { id: "shuttle-loop-map", name: "shuttle-loop-map.png", folder: "Illustrations", tags: ["shuttle"], size: "620 KB", dims: "2400×1600", uploaded: "Jun 22, 2026", variant: "paper", icon: MapPin },
  { id: "lrc-latenight", name: "lrc-latenight.jpg", folder: "Campus", tags: ["portrait"], size: "2.9 MB", dims: "3600×2400", uploaded: "Jun 21, 2026", variant: "dark", icon: Clock3 },
  { id: "jeepney-queue", name: "jeepney-queue.jpg", folder: "Campus", tags: ["shuttle"], size: "2.4 MB", dims: "3000×2000", uploaded: "Jun 21, 2026", variant: "paper", icon: MapPin },
  { id: "cheap-eats-stall-01", name: "cheap-eats-stall-01.jpg", folder: "Photos", tags: ["portrait"], size: "2.1 MB", dims: "3000×2000", uploaded: "Jun 20, 2026", variant: "paper", icon: Flame },
  { id: "swim-relay-podium", name: "swim-relay-podium.jpg", folder: "Sports", tags: ["cesafi"], size: "3.3 MB", dims: "3840×2560", uploaded: "Jun 19, 2026", variant: "duotone", icon: TrendingUp },
  { id: "mentorship-orientation", name: "mentorship-orientation.jpg", folder: "Campus", tags: ["portrait"], size: "2.6 MB", dims: "3600×2400", uploaded: "Jun 19, 2026", variant: "paper", icon: Users },
  { id: "tc-masthead-icon", name: "tc-masthead-icon.png", folder: "Illustrations", tags: [], size: "340 KB", dims: "1200×1200", uploaded: "Jun 12, 2026", variant: "dark", icon: FileText },
];
