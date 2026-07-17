import { MediaCard } from "@/components/staff/media-card";
import type { StaffMediaItem } from "@/lib/staff-data";

export function MediaGrid({
  items,
  selectedIds,
  onToggle,
}: {
  items: StaffMediaItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          selected={selectedIds.has(item.id)}
          onToggle={() => onToggle(item.id)}
        />
      ))}
    </div>
  );
}
