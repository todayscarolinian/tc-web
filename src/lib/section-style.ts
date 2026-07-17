import {
  Newspaper,
  MapPin,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { SECTIONS, type SectionInfo, type SectionName } from "@/src/lib/content";
import { cn } from "@/src/lib/utils";

const ACCENT_TEXT_CLASS: Record<SectionInfo["accent"], string> = {
  news: "text-section-news",
  campus: "text-section-campus",
  sports: "text-section-sports",
  culture: "text-section-culture",
  opinion: "text-section-opinion",
};

export function accentTextClass(accent: SectionInfo["accent"]) {
  return ACCENT_TEXT_CLASS[accent];
}

const ACCENT_BG_CLASS: Record<SectionInfo["accent"], string> = {
  news: "bg-section-news",
  campus: "bg-section-campus",
  sports: "bg-section-sports",
  culture: "bg-section-culture",
  opinion: "bg-section-opinion",
};

export function accentBgClass(accent: SectionInfo["accent"]) {
  return ACCENT_BG_CLASS[accent];
}

export function kickerClassForSection(section: SectionName) {
  const info = SECTIONS.find((s) => s.name === section);
  return cn("tc-kicker", info ? ACCENT_TEXT_CLASS[info.accent] : "text-brand");
}

const SECTION_ICON: Record<SectionName, LucideIcon> = {
  News: Newspaper,
  "Campus Life": MapPin,
  Sports: TrendingUp,
  "Arts & Culture": ImageIcon,
  Opinion: FileText,
};

export function sectionIcon(section: SectionName) {
  return SECTION_ICON[section];
}
