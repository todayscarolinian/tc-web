"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

export function CoverDropzone({
  title = "Upload cover image",
  description = "Drag a photo here, or click to browse",
  compact = false,
  onClick,
  onDrop,
  isUploading = false,
  className,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  onClick?: () => void;
  onDrop?: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isUploading}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onDrop?.(file);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-70",
        isDragging && "border-brand bg-brand/5",
        compact ? "px-4 py-6" : "px-6 py-10",
        className
      )}
    >
      {isUploading ? (
        <Loader2
          className="animate-spin text-muted-foreground"
          size={compact ? 24 : 28}
          strokeWidth={1.5}
        />
      ) : (
        <UploadCloud className="text-muted-foreground" size={compact ? 24 : 28} strokeWidth={1.5} />
      )}
      <span className="font-ui text-sm font-bold text-foreground">
        {isUploading ? "Uploading…" : title}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
