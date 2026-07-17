import type { ArticleStatus } from "@/lib/staff-data";
import { cn } from "@/lib/utils";

const PILL_CLASS: Record<ArticleStatus, string> = {
  Published: "bg-success/15 text-success-strong",
  Draft: "bg-muted text-muted-foreground",
  Scheduled: "bg-warning/20 text-warning-strong",
};

const DOT_CLASS: Record<ArticleStatus, string> = {
  Published: "bg-success",
  Draft: "bg-muted-foreground",
  Scheduled: "bg-warning",
};

export function StatusPill({ status }: { status: ArticleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-ui text-xs font-bold whitespace-nowrap",
        PILL_CLASS[status]
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[status])} />
      {status}
    </span>
  );
}
