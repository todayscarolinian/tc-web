import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartPanel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="py-5">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && (
            <p className="font-utility mt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
