import { LineChart } from "lucide-react";
import { EmptyState } from "@/components/site/empty-state";
import { cn } from "@/src/lib/utils";

export function AnalyticsComingSoon({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={LineChart}
      title="Analytics coming soon"
      description="Traffic data will be available once there's enough production history after launch to report on accurately."
      className={cn("border-none py-10", className)}
    />
  );
}
