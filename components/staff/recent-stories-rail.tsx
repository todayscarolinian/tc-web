import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionDot } from "@/components/staff/section-dot";
import { getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import { formatDisplayDate } from "@/src/lib/article-format";
import type { Article } from "@/src/entities/article/core/article.domain";

export function RecentStoriesRail({ articles }: { articles: Article[] }) {
  return (
    <Card size="sm" className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Recent stories</CardTitle>
        <p className="font-utility text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Latest published
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border px-0 py-0">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/staff/articles/${article.slug}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="font-display text-sm leading-snug font-bold text-foreground">
                {article.title}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <SectionDot
                  section={getSectionName(article.sectionSlug)}
                  className="text-muted-foreground"
                />
                <span aria-hidden>·</span>
                {formatDisplayDate(article.publishedAt)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
