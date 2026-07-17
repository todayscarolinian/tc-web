import { Skeleton } from "@/components/ui/skeleton";
import { StoryCardSkeleton } from "@/components/site/story-card-skeleton";

export default function SectionLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-border pb-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-6 border-b border-border py-8 sm:grid-cols-2">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <Skeleton className="mt-8 h-8 w-48" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
