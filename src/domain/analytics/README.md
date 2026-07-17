# domain/analytics

Not yet implemented — folder scaffolded as a placeholder.

**Future value objects** — `PageviewPoint` (`{ date, views }`, already close
to its ideal shape in `lib/staff-data.ts`), `DashboardStat`
(`{ key, label, sub, value, delta, up, icon }`).

**Future repository port** — `AnalyticsRepository`:
- `getPageviews(range: "7" | "30" | "90"): Promise<PageviewPoint[]>`
- `getDashboardStats(): Promise<DashboardStat[]>`
- `getTopStories(limit?: number): Promise<TopStory[]>`

This domain conceptually owns "trending/most-read" data — a future
iteration could have `application/article`'s `listTrendingArticles`
delegate to `AnalyticsRepository` instead of the hardcoded `RAIL` in
`lib/content.ts`. Flagged as a natural follow-up, not required now.

**Known blocker** — same as `domain/media`: `DashboardStat.icon` is a
`LucideIcon` reference and needs the same `iconKey: string` treatment
before `components/staff/analytics-view.tsx` can take this data as props.

**Wraps** — `PAGEVIEWS_7D/30D/90D`, `DASHBOARD_STATS`, `TOP_STORIES` in
`lib/staff-data.ts`.
