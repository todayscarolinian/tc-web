import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CURRENT_STAFF_USER } from "@/src/lib/staff-data";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
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
        <div className="text-right leading-tight">
          <p className="font-ui text-sm font-bold text-foreground">{CURRENT_STAFF_USER.name}</p>
          <p className="font-utility text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {CURRENT_STAFF_USER.role}
          </p>
        </div>
        <Avatar size="sm">
          <AvatarFallback className="bg-brand text-primary-foreground">
            {CURRENT_STAFF_USER.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
