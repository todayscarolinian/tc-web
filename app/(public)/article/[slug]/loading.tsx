import { Skeleton } from "@/components/ui/skeleton";
import { StoryCardSkeleton } from "@/components/site/story-card-skeleton";

export default function ArticleLoading() {
  return (
    <>
      <Skeleton className="aspect-[21/9] w-full rounded-none" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto h-3 w-64" />

        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex grow flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48 border-b border-border pb-3" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
