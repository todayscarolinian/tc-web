import { Skeleton } from "@/components/ui/skeleton";

export default function StaffMediaLoading() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
        <span className="grow" />
        <Skeleton className="h-9 w-28" />
      </header>

      <div className="flex flex-col gap-5 p-5 sm:p-8">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
