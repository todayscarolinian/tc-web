import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-7 w-full max-w-md flex-1" />
        <span className="grow" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="px-4 py-8 sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <aside className="flex flex-col gap-6 border-t border-border bg-card p-5 lg:border-t-0 lg:border-l">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
