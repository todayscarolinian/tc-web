import Link from "next/link";
import type { Article } from "@/src/entities/article/core/article.domain";
import { getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import { sectionIcon } from "@/src/lib/section-style";
import { formatDisplayDate, formatReadTime } from "@/src/lib/article-format";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";

export function FeaturedStoryBanner({
  article,
  featured,
}: {
  article: Article;
  featured: boolean;
}) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      {featured && (
        <p className="font-utility mb-3 text-xs font-bold tracking-[0.14em] text-brand uppercase">
          Featured
        </p>
      )}
      <PhotoPlaceholder
        icon={sectionIcon(getSectionName(article.sectionSlug))}
        ratio="16 / 9"
        iconSize={48}
        src={article.coverImageUrl}
        alt={article.coverImageAlt}
      />
      {article.caption && (
        <p className="font-utility mt-2 text-xs text-muted-foreground">
          {article.caption}
        </p>
      )}
      <div className="mt-4">
        <span className="tc-kicker text-brand">
          {getSectionName(article.sectionSlug)}
        </span>
        <h1 className="font-display mt-2 text-[2.6rem] leading-[3rem] font-extrabold text-balance text-foreground group-hover:underline">
          {article.title}
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-7 text-text-secondary">
          {article.dek}
        </p>
        <span className="font-utility mt-3 block text-xs font-medium text-muted-foreground">
          By {article.authorName} · {formatDisplayDate(article.publishedAt)} ·{" "}
          {formatReadTime(article.readTimeMinutes)}
        </span>
      </div>
    </Link>
  );
}
