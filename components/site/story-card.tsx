import Link from "next/link";
import type { Article } from "@/src/entities/article/core/article.domain";
import { getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import { kickerClassForSection, sectionIcon } from "@/src/lib/section-style";
import { formatDisplayDate, formatReadTime } from "@/src/lib/article-format";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { cn } from "@/src/lib/utils";

export function StoryCard({
  story,
  small = false,
}: {
  story: Article;
  small?: boolean;
}) {
  const sectionName = getSectionName(story.sectionSlug);
  return (
    <Link
      href={`/article/${story.slug}`}
      className="group flex h-full flex-col"
    >
      <PhotoPlaceholder
        icon={sectionIcon(sectionName)}
        className="rounded-t-[4px]"
        src={story.coverImageUrl}
        alt={story.coverImageAlt}
      />
      <div className="flex flex-1 flex-col gap-1.5 border-x border-b border-border p-4">
        <span className={kickerClassForSection(sectionName)}>
          {sectionName}
        </span>
        <h3
          className={cn(
            "font-display line-clamp-2 font-bold text-foreground group-hover:underline",
            small ? "text-base leading-[22px]" : "text-lg leading-[26px]",
          )}
        >
          {story.title}
        </h3>
        {!small && (
          <p className="line-clamp-2 text-sm leading-5 text-text-secondary">
            {story.dek}
          </p>
        )}
        <span className="font-utility mt-auto pt-1 text-xs font-medium text-muted-foreground">
          By {story.authorName} · {formatDisplayDate(story.publishedAt)} ·{" "}
          {formatReadTime(story.readTimeMinutes)}
        </span>
      </div>
    </Link>
  );
}
