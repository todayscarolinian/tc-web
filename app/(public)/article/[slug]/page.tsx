import Link from "next/link";
import { notFound } from "next/navigation";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { tagService } from "@/src/infrastructure/tag/tag.composition";
import { getSectionName } from "@/src/lib/content";
import { accentTextClass, sectionIcon } from "@/src/lib/section-style";
import { formatDisplayDate, formatReadTime, renderArticleBodyHTML } from "@/src/lib/article-format";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { StoryCard } from "@/components/site/story-card";
import { SubscribeStrip } from "@/components/site/subscribe-strip";
import { ShareRow } from "@/components/site/share-row";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ENABLE_SUBSCRIPTION } from "@/src/lib/flags";

export async function generateStaticParams() {
  const articles = await articleService.listPublished();
  return articles.map((a) => ({ slug: a.slug }));
}

export const revalidate = 3600;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await articleService.getBySlug(slug);
  if (!article) notFound();

  const sectionInfo = await articleService.findSectionBySlug(article.sectionSlug);
  const related = (await articleService.listPublished())
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  const bodyHtml = renderArticleBodyHTML(article.body);

  const allTags = article.tagSlugs.length > 0 ? await tagService.listAll() : [];
  const articleTags = article.tagSlugs
    .map((tagSlug) => allTags.find((t) => t.slug === tagSlug))
    .filter((tag) => tag !== undefined);

  return (
    <>
      <PhotoPlaceholder
        icon={sectionIcon(getSectionName(article.sectionSlug))}
        ratio="21 / 9"
        iconSize={56}
        src={article.coverImageUrl}
        alt={article.coverImageAlt}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {article.caption && (
          <p className="font-utility mb-6 text-center text-xs text-muted-foreground">{article.caption}</p>
        )}

        {sectionInfo && (
          <span className={`tc-kicker ${accentTextClass(sectionInfo.accent)}`}>{sectionInfo.name}</span>
        )}
        <h1 className="font-display mt-2 text-4xl leading-[44px] font-extrabold text-balance text-foreground">
          {article.title}
        </h1>
        <p className="mt-3 text-lg leading-7 text-text-secondary">{article.dek}</p>

        <Link
          href={`/author/${article.authorId}`}
          className="group mt-6 flex items-center gap-3 border-y border-border py-4"
        >
          <Avatar size="lg">
            <AvatarImage src={article.authorAvatarUrl} alt={article.authorName} />
            <AvatarFallback className="bg-brand text-white">{article.authorInitials}</AvatarFallback>
          </Avatar>
          <div className="grow">
            <p className="font-ui text-sm font-bold text-foreground group-hover:underline">
              By {article.authorName}
            </p>
            <span className="font-utility text-xs text-muted-foreground">
              {article.authorRole ? article.authorRole + " · " : ""}
              {formatDisplayDate(article.publishedAt)} · {formatReadTime(article.readTimeMinutes)}
            </span>
          </div>
        </Link>

        <div
          className="prose-tc mt-8 flex flex-col gap-5 text-[17px] leading-[28px] text-foreground [&>blockquote]:font-display [&>blockquote]:border-l-4 [&>blockquote]:border-brand [&>blockquote]:py-1 [&>blockquote]:pl-5 [&>blockquote]:text-2xl [&>blockquote]:leading-8 [&>blockquote]:font-semibold [&>blockquote]:italic [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:pr-3 [&>p:first-of-type]:first-letter:pt-1 [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:first-letter:leading-13 [&>p:first-of-type]:first-letter:font-extrabold [&>p:first-of-type]:first-letter:text-brand-strong"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {articleTags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {articleTags.map((tag) => (
              <Badge key={tag.slug} className="rounded-full" variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <ShareRow />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="font-display mb-6 border-b border-border pb-3 text-2xl font-bold text-foreground">
          Related stories
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((s) => (
            <StoryCard key={"rel-" + s.slug} story={s} />
          ))}
        </div>
      </div>
      {ENABLE_SUBSCRIPTION && <SubscribeStrip />}
    </>
  );
}
