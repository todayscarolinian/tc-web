import Link from "next/link";
import { notFound } from "next/navigation";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { getSectionName } from "@/src/lib/content";
import { sectionIcon } from "@/src/lib/section-style";
import { formatDisplayDate, formatReadTime } from "@/src/lib/article-format";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { StoryCard } from "@/components/site/story-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const articles = await articleService.listPublished();
  const authorIds = new Set(articles.map((a) => a.authorId));
  return Array.from(authorIds).map((authorId) => ({ authorId }));
}

export const revalidate = 3600;

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await params;
  const byAuthor = await articleService.listByAuthor(authorId);
  const [lead, ...grid] = byAuthor;
  if (!lead) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 border-b border-border pb-8">
        <Avatar size="lg" className="size-16 text-lg">
          <AvatarFallback className="bg-brand text-lg text-white">
            {lead.authorInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="tc-kicker text-brand">Author</span>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-foreground">
            {lead.authorName}
          </h1>
          {lead.authorRole && (
            <p className="font-utility mt-1 text-sm text-muted-foreground">{lead.authorRole}</p>
          )}
        </div>
      </div>

      <Link
        href={`/article/${lead.slug}`}
        className="group grid gap-6 border-b border-border py-8 sm:grid-cols-2"
      >
        <PhotoPlaceholder
          icon={sectionIcon(getSectionName(lead.sectionSlug))}
          ratio="16 / 9"
          iconSize={40}
          src={lead.coverImageUrl}
          alt={lead.coverImageAlt}
        />
        <div>
          <span className="tc-kicker text-brand">{getSectionName(lead.sectionSlug)}</span>
          <h2 className="font-display mt-2 text-2xl leading-8 font-bold text-foreground group-hover:underline">
            {lead.title}
          </h2>
          <p className="mt-2 text-base leading-6 text-text-secondary">{lead.dek}</p>
          <span className="font-utility mt-3 block text-xs font-medium text-muted-foreground">
            {formatDisplayDate(lead.publishedAt)} · {formatReadTime(lead.readTimeMinutes)}
          </span>
        </div>
      </Link>

      {grid.length > 0 && (
        <>
          <div className="mt-8 flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              More by {lead.authorName}
            </h2>
            <span className="grow" />
            <Badge className="rounded-full">{grid.length} stories</Badge>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
