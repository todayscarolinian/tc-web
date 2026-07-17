import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function StaffDashboardLoading() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
        <span className="grow" />
        <Skeleton className="h-9 w-32" />
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="gap-3 py-4">
              <div className="flex items-center justify-between px-(--card-spacing)">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-8 rounded-sm" />
              </div>
              <div className="px-(--card-spacing)">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="py-5">
          <div className="px-(--card-spacing)">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>
          <div className="px-(--card-spacing)">
            <Skeleton className="h-60 w-full" />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="gap-0 py-0">
            <div className="border-b border-border p-4">
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </Card>
          <Card className="gap-0 py-0">
            <div className="border-b border-border p-4">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex flex-col gap-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
