import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/staff/page-header";
import { StatCard } from "@/components/staff/stat-card";
import { ChartPanel } from "@/components/staff/chart-panel";
import { TrendChart } from "@/components/staff/trend-chart";
import { SectionLegend } from "@/components/staff/section-legend";
import { DashboardArticlesPanel } from "@/components/staff/dashboard-articles-panel";
import { TopStoriesRail } from "@/components/staff/top-stories-rail";
import { DASHBOARD_STATS, PAGEVIEWS_30D, TOP_STORIES } from "@/src/lib/staff-data";
import { articleService } from "@/src/entities/article/services/article.service.factory";

export default async function StaffDashboardPage() {
  const articles = await articleService.staff.listAll();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Wednesday, June 24, 2026"
        actions={
          <Link href="/staff/articles/new">
            <Button type="button">
              <Plus /> New article
            </Button>
          </Link>
        }
      />
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DASHBOARD_STATS.map((s) => (
            <StatCard
              key={s.key}
              label={s.label}
              value={s.value}
              sub={s.sub}
              delta={s.delta}
              up={s.up}
              icon={s.icon}
            />
          ))}
        </div>

        <ChartPanel
          title="Daily pageviews"
          subtitle="Last 30 days · all sections"
          actions={
            <Badge variant="secondary" className="whitespace-nowrap bg-success/15 text-success-strong">
              +18.2% vs. prior month
            </Badge>
          }
        >
          <TrendChart data={PAGEVIEWS_30D} />
          <SectionLegend />
        </ChartPanel>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <DashboardArticlesPanel articles={articles} />
          <TopStoriesRail stories={TOP_STORIES} />
        </div>
      </div>
    </>
  );
}
