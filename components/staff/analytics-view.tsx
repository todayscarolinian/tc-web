"use client";

import { useMemo, useState } from "react";
import { Eye, Flame, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/staff/page-header";
import { StatCard } from "@/components/staff/stat-card";
import { ChartPanel } from "@/components/staff/chart-panel";
import { TrendChart } from "@/components/staff/trend-chart";
import { SectionLegend } from "@/components/staff/section-legend";
import { PAGEVIEWS_7D, PAGEVIEWS_30D, PAGEVIEWS_90D } from "@/src/lib/staff-data";

const RANGES = [
  { value: "7", label: "7d", data: PAGEVIEWS_7D },
  { value: "30", label: "30d", data: PAGEVIEWS_30D },
  { value: "90", label: "90d", data: PAGEVIEWS_90D },
] as const;

export function AnalyticsView() {
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const active = RANGES.find((r) => r.value === range) ?? RANGES[1];

  const { total, average, peak } = useMemo(() => {
    const values = active.data.map((d) => d.views);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      total: sum,
      average: Math.round(sum / values.length),
      peak: Math.max(...values),
    };
  }, [active]);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Traffic overview" />

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total views"
            value={total.toLocaleString("en-US")}
            sub={`Last ${range} days`}
            delta="views"
            up={false}
            icon={Eye}
          />
          <StatCard
            label="Daily average"
            value={average.toLocaleString("en-US")}
            sub="Views per day"
            delta="views/day"
            up={false}
            icon={TrendingUp}
          />
          <StatCard
            label="Peak day"
            value={peak.toLocaleString("en-US")}
            sub="Single-day high"
            delta="views"
            up={false}
            icon={Flame}
          />
        </div>

        <ChartPanel
          title="Pageviews over time"
          subtitle="All sections"
          actions={
            <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30" | "90")}>
              <TabsList>
                {RANGES.map((r) => (
                  <TabsTrigger key={r.value} value={r.value}>
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
        >
          <TrendChart data={active.data} />
          <SectionLegend />
        </ChartPanel>
      </div>
    </>
  );
}
