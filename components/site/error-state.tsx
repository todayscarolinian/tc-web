import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "The story failed to load. Try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-destructive/40 bg-destructive/5 px-6 py-16 text-center">
      <AlertTriangle className="text-destructive" size={32} strokeWidth={1.5} />
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm leading-5 text-text-secondary">{description}</p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
