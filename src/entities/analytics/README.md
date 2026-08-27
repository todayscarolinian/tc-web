# entities/analytics

Not yet implemented — folder scaffolded as a placeholder. Consolidates the
three former placeholder READMEs (`domain/analytics`, `application/analytics`,
`infrastructure/analytics`) into one, following the per-entity restructuring
in `docs/architecture.md`.

**Future value objects** — `PageviewPoint` (`{ date, views }`, already close
to its ideal shape in `lib/staff-data.ts`), `DashboardStat`
(`{ key, label, sub, value, delta, up, icon }`).

**Future repository port** (`core/`) — `AnalyticsRepository`:
- `getPageviews(range: "7" | "30" | "90"): Promise<PageviewPoint[]>`
- `getDashboardStats(): Promise<DashboardStat[]>`
- `getTopStories(limit?: number): Promise<TopStory[]>`

This domain conceptually owns "trending/most-read" data — a future
iteration could have `entities/article`'s `listTrendingArticles`
delegate to `AnalyticsRepository` instead of the hardcoded `RAIL` in
`lib/content.ts`. Flagged as a natural follow-up, not required now.

**Known blocker** — same as `entities/media`: `DashboardStat.icon` is a
`LucideIcon` reference and needs the same `iconKey: string` treatment
before `components/staff/analytics-view.tsx` can take this data as props.

**Wraps** — `PAGEVIEWS_7D/30D/90D`, `DASHBOARD_STATS`, `TOP_STORIES` in
`lib/staff-data.ts`.

**Future use-cases** (`usecase/`/`services/`):
- `getPageviewSeries(repo, range)`
- `getDashboardSummary(repo)`

**Future infrastructure** (`infrastructure/`) — `InMemoryAnalyticsRepository`
wraps `PAGEVIEWS_7D/30D/90D`, `DASHBOARD_STATS`, `TOP_STORIES` from
`lib/staff-data.ts`.

Rewiring targets: `app/(staff)/staff/page.tsx` and
`components/staff/analytics-view.tsx` (the latter needs the same
`iconKey` treatment as media — see above).
