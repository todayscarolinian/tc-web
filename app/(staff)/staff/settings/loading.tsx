import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function StaffSettingsLoading() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
        <span className="grow" />
        <Skeleton className="h-9 w-32" />
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="max-w-2xl">
            <div className="px-(--card-spacing)">
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex flex-col gap-4 px-(--card-spacing)">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
