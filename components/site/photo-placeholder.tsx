import { Newspaper, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { PhotoVariant } from "@/src/lib/content";

const VARIANT_CLASS: Record<PhotoVariant, string> = {
  paper: "bg-muted text-muted-foreground",
  dark: "bg-surface-inverse text-white/70",
  duotone: "bg-brand-ink text-white/70",
};

export function PhotoPlaceholder({
  variant = "paper",
  icon: Icon = Newspaper,
  ratio = "3 / 2",
  className,
  iconSize = 36,
}: {
  variant?: PhotoVariant;
  icon?: LucideIcon;
  ratio?: string;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        VARIANT_CLASS[variant],
        className
      )}
      style={{ aspectRatio: ratio }}
    >
      <Icon size={iconSize} strokeWidth={1.5} />
    </div>
  );
}
