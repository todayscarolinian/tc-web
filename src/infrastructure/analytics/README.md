# infrastructure/analytics

Not yet implemented. Future `InMemoryAnalyticsRepository` wraps
`PAGEVIEWS_7D/30D/90D`, `DASHBOARD_STATS`, `TOP_STORIES` from
`lib/staff-data.ts`.

Rewiring targets: `app/(staff)/staff/page.tsx` and
`components/staff/analytics-view.tsx` (the latter needs the same
`iconKey` treatment as media — see `domain/analytics/README.md`).
