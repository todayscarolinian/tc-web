import { TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  delta,
  up,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  delta: string;
  up: boolean;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative gap-3 overflow-hidden py-4">
      <span className="absolute inset-x-0 top-0 h-1 bg-brand" aria-hidden />
      <div className="flex items-center justify-between px-(--card-spacing)">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand/10 text-brand-strong">
          <Icon size={17} />
        </span>
      </div>
      <div className="px-(--card-spacing)">
        <p className="font-display text-[1.9rem] leading-none font-extrabold tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 font-ui text-xs font-bold",
            up ? "text-success-strong" : "text-muted-foreground"
          )}
        >
          {up && <TrendingUp size={13} />}
          {delta}
        </p>
      </div>
    </Card>
  );
}
