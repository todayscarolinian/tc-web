import { SECTIONS } from "@/lib/content";
import { accentBgClass } from "@/lib/section-style";

export function SectionLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {SECTIONS.map((s) => (
        <span
          key={s.slug}
          className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold text-text-secondary"
        >
          <span className={`size-2.5 shrink-0 rounded-xs ${accentBgClass(s.accent)}`} />
          {s.name}
        </span>
      ))}
    </div>
  );
}
