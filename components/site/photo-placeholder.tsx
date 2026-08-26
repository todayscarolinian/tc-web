import { Newspaper, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function PhotoPlaceholder({
  icon: Icon = Newspaper,
  ratio = "3 / 2",
  className,
  iconSize = 36,
  src,
  alt = "",
}: {
  icon?: LucideIcon;
  ratio?: string;
  className?: string;
  iconSize?: number;
  src?: string;
  alt?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("w-full object-cover", className)}
        style={{ aspectRatio: ratio }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-muted text-muted-foreground",
        className
      )}
      style={{ aspectRatio: ratio }}
    >
      <Icon size={iconSize} strokeWidth={1.5} />
    </div>
  );
}
