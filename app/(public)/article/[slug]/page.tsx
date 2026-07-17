import { notFound } from "next/navigation";
import { ALL_STORIES, ARTICLE_BODY, sectionByName, storyBySlug } from "@/lib/content";
import { accentTextClass, sectionIcon } from "@/lib/section-style";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { StoryCard } from "@/components/site/story-card";
import { SubscribeStrip } from "@/components/site/subscribe-strip";
import { ArticleToolbar } from "@/components/site/article-toolbar";
import { ShareRow } from "@/components/site/share-row";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ENABLE_SUBSCRIPTION } from "@/lib/flags";

export function generateStaticParams() {
  return ALL_STORIES.map((s) => ({ slug: s.slug }));
}

// The story list is exhaustively known at build time — an unlisted slug
// is a genuine 404, not a candidate for on-demand rendering.
export const dynamicParams = false;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = storyBySlug(slug);
  if (!story) notFound();

  const sectionInfo = sectionByName(story.section);
  const related = ALL_STORIES.filter((s) => s.slug !== story.slug).slice(0, 3);

  return (
    <>
      <PhotoPlaceholder variant={story.variant === "paper" ? "dark" : story.variant} icon={sectionIcon(story.section)} ratio="21 / 9" iconSize={56} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {story.caption && (
          <p className="font-utility mb-6 text-center text-xs text-muted-foreground">{story.caption}</p>
        )}

        {sectionInfo && (
          <span className={`tc-kicker ${accentTextClass(sectionInfo.accent)}`}>{story.section}</span>
        )}
        <h1 className="font-display mt-2 text-4xl leading-[44px] font-extrabold text-balance text-foreground">
          {story.title}
        </h1>
        <p className="mt-3 text-lg leading-7 text-text-secondary">{story.dek}</p>

        <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
          <Avatar size="lg">
            <AvatarFallback className="bg-brand text-white">{story.initials}</AvatarFallback>
          </Avatar>
          <div className="grow">
            <p className="font-ui text-sm font-bold text-foreground">By {story.author}</p>
            <span className="font-utility text-xs text-muted-foreground">
              {story.role ? story.role + " · " : ""}
              {story.date} · {story.read}
            </span>
          </div>
          <ArticleToolbar />
        </div>

        <div className="prose-tc mt-8 flex flex-col gap-5 text-[17px] leading-[28px] text-foreground">
          <p
            className="font-display text-xl leading-8 font-medium first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:font-display first-letter:text-6xl first-letter:leading-13 first-letter:font-extrabold first-letter:text-brand-strong"
          >
            {ARTICLE_BODY[0]}
          </p>
          <p className="font-display">{ARTICLE_BODY[1]}</p>
          <blockquote className="font-display border-l-4 border-brand py-1 pl-5 text-2xl leading-8 font-semibold text-foreground italic">
            &quot;We heard you. We owe it to this community to get the number right, not just to get
            it done.&quot;
          </blockquote>
          <p className="font-display">{ARTICLE_BODY[2]}</p>
          <figure>
            <PhotoPlaceholder variant="duotone" icon={Users} ratio="16 / 9" iconSize={40} />
            <figcaption className="font-utility mt-2 text-xs text-muted-foreground">
              SSC president Reina Villanueva addresses students outside Buttenbruch Hall after the
              hearing · Photo by Aisha Cruz / TC
            </figcaption>
          </figure>
          <p className="font-display">{ARTICLE_BODY[3]}</p>
          <p className="font-display">{ARTICLE_BODY[4]}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Badge className="rounded-full bg-brand text-white">tuition</Badge>
          <Badge className="rounded-full" variant="outline">
            board of trustees
          </Badge>
          <Badge className="rounded-full" variant="outline">
            SSC
          </Badge>
          <Badge className="rounded-full" variant="outline">
            USC main
          </Badge>
        </div>

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
