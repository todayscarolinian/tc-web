"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";
import { canAttachMedia } from "@/src/entities/media/core/media.domain";
import { formatBytes, formatDimensions } from "@/src/lib/media-format";
import { cn } from "@/src/lib/utils";

export function MediaCard({
  item,
  selected,
  onToggle,
}: {
  item: MediaAssetDTO;
  selected: boolean;
  onToggle: () => void;
}) {
  const incomplete = !canAttachMedia(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      className={cn(
        "cursor-pointer overflow-hidden rounded-sm bg-card ring-1 ring-border transition-shadow hover:shadow-md",
        selected && "ring-2 ring-brand",
      )}
    >
      <div className="relative">
        <PhotoPlaceholder src={item.url} alt={item.altText} ratio="4 / 3" iconSize={28} />
        <span className="absolute top-2 left-2 rounded-xs bg-black/55 p-0.5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${item.name}`}
            className="border-white/70 data-checked:border-brand"
          />
        </span>
        {incomplete && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 rounded-xs bg-background/90 text-destructive"
          >
            Incomplete
          </Badge>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-ui text-xs font-bold text-foreground">{item.name}</p>
        <p className="font-utility mt-0.5 text-[11px] font-semibold text-muted-foreground">
          {formatDimensions(item.width, item.height)} · {formatBytes(item.sizeBytes)}
        </p>
        {item.tagSlugs.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tagSlugs.slice(0, 2).map((tag) => (
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
