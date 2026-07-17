"use client";

import { UploadCloud } from "lucide-react";
import { cn } from "@/src/lib/utils";

// No upload wiring — matches this repo's existing convention of stubbed forms
// (e.g. components/site/subscribe-strip.tsx), since there's no backend anywhere yet.
export function CoverDropzone({
  title = "Upload cover image",
  description = "Drag a photo here, or click to browse",
  compact = false,
  onClick,
  className,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-brand hover:bg-brand/5",
        compact ? "px-4 py-6" : "px-6 py-10",
        className
      )}
    >
      <UploadCloud className="text-muted-foreground" size={compact ? 24 : 28} strokeWidth={1.5} />
      <span className="font-ui text-sm font-bold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
