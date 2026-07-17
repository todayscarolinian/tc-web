import { Skeleton } from "@/components/ui/skeleton";
import { StoryCardSkeleton } from "@/components/site/story-card-skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="mt-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <aside>
          <Skeleton className="h-4 w-24 border-b border-border pb-2" />
          <div className="mt-4 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-b border-border pb-4">
                <Skeleton className="h-6 w-6 shrink-0" />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <Skeleton className="mt-12 h-8 w-48" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>

      <Skeleton className="mt-12 h-8 w-48" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StoryCardSkeleton key={i} small />
        ))}
      </div>
    </div>
  );
}
