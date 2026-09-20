"use client";

import { useEffect } from "react";
import { Images } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/empty-state";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";
import { canAttachMedia } from "@/src/entities/media/core/media.domain";
import { useMediaAssets } from "@/src/entities/media/hooks/use-media-assets";
import { cn } from "@/src/lib/utils";

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAssetDTO) => void;
}) {
  const { data: assets, isLoading, isError } = useMediaAssets({ enabled: open });

  useEffect(() => {
    if (isError) toast.error("Failed to load the media library.");
  }, [isError]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Media library</SheetTitle>
          <SheetDescription>
            Reuse an existing upload. Assets without alt text cannot be attached.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <p className="font-ui text-sm text-muted-foreground">Loading library…</p>
          ) : !assets || assets.length === 0 ? (
            <EmptyState
              icon={Images}
              title="Library is empty"
              description="Upload a photo from Media or the cover dropzone first."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((asset) => {
                const attachable = canAttachMedia(asset);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      if (!attachable) {
                        toast.error("Add alt text to this file in Media before attaching it.");
                        return;
                      }
                      onSelect(asset);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "overflow-hidden rounded-sm bg-card text-left ring-1 ring-border hover:ring-brand",
                      !attachable && "opacity-70",
                    )}
                  >
                    <PhotoPlaceholder src={asset.url} alt={asset.altText} ratio="4 / 3" iconSize={22} />
                    <div className="p-2">
                      <p className="truncate font-ui text-xs font-bold">{asset.name}</p>
                      {!attachable && (
                        <Badge variant="secondary" className="mt-1 rounded-xs text-destructive">
                          Incomplete
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
