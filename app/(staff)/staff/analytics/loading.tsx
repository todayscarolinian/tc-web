import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function StaffAnalyticsLoading() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="flex items-start justify-between px-(--card-spacing)">
            <div>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="px-(--card-spacing)">
            <Skeleton className="h-60 w-full" />
          </div>
        </Card>
      </div>
    </>
  );
}
