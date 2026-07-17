import { Skeleton } from "@/components/ui/skeleton";

export default function StaffArticlesLoading() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
        <span className="grow" />
        <Skeleton className="h-9 w-32" />
      </header>

      <div className="flex flex-col gap-4 p-5 sm:p-8">
        <div className="flex flex-wrap gap-2.5">
          <Skeleton className="h-9 w-full max-w-xs" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="overflow-hidden rounded-sm ring-1 ring-border">
          <div className="flex gap-4 border-b border-border p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border p-3 last:border-0">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
