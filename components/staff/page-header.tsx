"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentStaffUser } from "@/src/lib/herald/use-current-staff-user";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { user, isPending } = useCurrentStaffUser();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background px-5 py-4 sm:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="min-w-0">
        <h1 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="font-utility mt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {subtitle}
          </p>
        )}
      </div>
      <span className="grow" />
      {actions}
      <div className="hidden items-center gap-2.5 sm:flex">
        {isPending ? (
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ) : (
          <div className="text-right leading-tight">
            <p className="font-ui text-sm font-bold text-foreground">{user?.name}</p>
            <p className="font-utility text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {user?.role}
            </p>
          </div>
        )}
        <Avatar size="sm">
          <AvatarFallback className="bg-brand text-primary-foreground">
            {isPending ? "" : user?.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
