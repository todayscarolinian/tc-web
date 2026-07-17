import Link from "next/link";
import type { Article } from "@/src/domain/article/article.entity";
import { kickerClassForSection, sectionIcon } from "@/src/lib/section-style";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { cn } from "@/src/lib/utils";

export function StoryCard({ story, small = false }: { story: Article; small?: boolean }) {
  return (
    <Link href={`/article/${story.slug}`} className="group flex h-full flex-col">
      <PhotoPlaceholder
        variant={story.variant}
        icon={sectionIcon(story.section)}
        className="rounded-t-[4px]"
      />
      <div className="flex flex-1 flex-col gap-1.5 border-x border-b border-border p-4">
        <span className={kickerClassForSection(story.section)}>{story.section}</span>
        <h3
          className={cn(
            "font-display line-clamp-2 font-bold text-foreground group-hover:underline",
            small ? "text-base leading-[22px]" : "text-lg leading-[26px]"
          )}
        >
          {story.title}
        </h3>
        {!small && (
          <p className="line-clamp-2 text-sm leading-5 text-text-secondary">{story.dek}</p>
        )}
        <span className="font-utility mt-auto pt-1 text-xs font-medium text-muted-foreground">
          By {story.author} · {story.date} · {story.read}
        </span>
      </div>
    </Link>
  );
}
