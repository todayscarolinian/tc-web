import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton({ small }: { small?: boolean }) {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[3/2] w-full rounded-none" />
      <div className="flex flex-col gap-2 border-x border-b border-border p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className={small ? "h-4 w-full" : "h-5 w-full"} />
        {!small && <Skeleton className="h-4 w-4/5" />}
        <Skeleton className="mt-1 h-3 w-2/3" />
      </div>
    </div>
  );
}
