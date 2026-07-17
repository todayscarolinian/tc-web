import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionDot } from "@/components/staff/section-dot";
import type { TopStory } from "@/lib/staff-data";

export function TopStoriesRail({ stories }: { stories: TopStory[] }) {
  return (
    <Card size="sm" className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Top stories this week</CardTitle>
        <p className="font-utility text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          By total views
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border px-0 py-0">
        {stories.map((story) => (
          <Link
            key={story.rank}
            href={`/staff/articles/${story.id}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
          >
            <span className="font-display w-4 shrink-0 text-lg leading-none font-extrabold text-brand-strong">
              {story.rank}
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm leading-snug font-bold text-foreground">{story.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <SectionDot section={story.section} className="text-muted-foreground" />
                <span aria-hidden>·</span>
                {story.views.toLocaleString("en-US")} views
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
