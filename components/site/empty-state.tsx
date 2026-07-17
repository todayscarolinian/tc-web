import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <Icon className="text-muted-foreground" size={32} strokeWidth={1.5} />
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-5 text-text-secondary">{description}</p>
      )}
      {action}
    </div>
  );
}
