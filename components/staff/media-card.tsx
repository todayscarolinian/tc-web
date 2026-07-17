"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import type { StaffMediaItem } from "@/src/lib/staff-data";
import { cn } from "@/src/lib/utils";

export function MediaCard({
  item,
  selected,
  onToggle,
}: {
  item: StaffMediaItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className={cn(
        "cursor-pointer overflow-hidden rounded-sm bg-card ring-1 ring-border transition-shadow hover:shadow-md",
        selected && "ring-2 ring-brand"
      )}
    >
      <div className="relative">
        <PhotoPlaceholder variant={item.variant} icon={item.icon} ratio="4 / 3" iconSize={28} />
        <span className="absolute top-2 left-2 rounded-xs bg-black/55 p-0.5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${item.name}`}
            className="border-white/70 data-checked:border-brand"
          />
        </span>
      </div>
      <div className="p-3">
        <p className="truncate font-ui text-xs font-bold text-foreground">{item.name}</p>
        <p className="font-utility mt-0.5 text-[11px] font-semibold text-muted-foreground">
          {item.dims} · {item.size}
        </p>
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
