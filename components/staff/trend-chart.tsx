"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PageviewPoint } from "@/src/lib/staff-data";

const chartConfig = {
  views: {
    label: "Pageviews",
    color: "var(--color-brand)",
  },
} satisfies ChartConfig;

function toUTCDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUTCDate(iso));
}

function formatLongDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUTCDate(iso));
}

export function TrendChart({ data }: { data: PageviewPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="staff-pageviews-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-views)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-views)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={44}
          tickFormatter={formatShortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={52}
          tickFormatter={(value: number) => value.toLocaleString("en-US")}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border-strong, var(--border))", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_value, payload) => {
                const iso = payload?.[0]?.payload?.date as string | undefined;
                return iso ? formatLongDate(iso) : "";
              }}
            />
          }
        />
        <Area
          dataKey="views"
          type="monotone"
          stroke="var(--color-views)"
          strokeWidth={2}
          fill="url(#staff-pageviews-fill)"
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
