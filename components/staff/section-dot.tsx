import { sectionByName, type SectionName } from "@/src/lib/content";
import { accentBgClass } from "@/src/lib/section-style";
import { cn } from "@/src/lib/utils";

export function SectionDot({ section, className }: { section: SectionName; className?: string }) {
  const info = sectionByName(section);
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-ui text-sm font-medium text-text-secondary whitespace-nowrap", className)}>
      <span
        className={cn("size-2 shrink-0 rounded-xs", info ? accentBgClass(info.accent) : "bg-brand")}
      />
      {section}
    </span>
  );
}
