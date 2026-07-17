import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { accentTextClass, sectionIcon } from "@/src/lib/section-style";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { StoryCard } from "@/components/site/story-card";
import { Pager } from "@/components/site/pager";
import { EmptyState } from "@/components/site/empty-state";
import { Badge } from "@/components/ui/badge";

export async function generateStaticParams() {
  const sections = await articleService.listSections();
  return sections.map((s) => ({ section: s.slug }));
}
export const dynamicParams = false;

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = await articleService.findSectionBySlug(slug);
  if (!section) notFound();

  const articles = await articleService.listPublished();
  const inSection = articles.filter((a) => a.section === section.name);
  const [lead, ...grid] = inSection;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <span className={`tc-kicker ${accentTextClass(section.accent)}`}>Section</span>
        <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
          {section.name}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-6 text-text-secondary">
          {section.blurb}
        </p>
      </div>

      {!lead ? (
        <div className="py-8">
          <EmptyState
            icon={Newspaper}
            title={`No stories in ${section.name} yet`}
            description="Check back soon, or browse another section from the nav above."
          />
        </div>
      ) : (
        <>
          <Link href={`/article/${lead.slug}`} className="group grid gap-6 border-b border-border py-8 sm:grid-cols-2">
            <PhotoPlaceholder variant={lead.variant} icon={sectionIcon(lead.section)} ratio="16 / 9" iconSize={40} />
            <div>
              <span className={`tc-kicker ${accentTextClass(section.accent)}`}>{lead.section}</span>
              <h2 className="font-display mt-2 text-2xl leading-8 font-bold text-foreground group-hover:underline">
                {lead.title}
              </h2>
              <p className="mt-2 text-base leading-6 text-text-secondary">{lead.dek}</p>
              <span className="font-utility mt-3 block text-xs font-medium text-muted-foreground">
                By {lead.author} · {lead.date} · {lead.read}
              </span>
            </div>
          </Link>

          {grid.length > 0 && (
            <>
              <div className="mt-8 flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-foreground">More in {section.name}</h2>
                <span className="grow" />
                <Badge className="rounded-full">{grid.length} stories</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-full" variant="default">
                  Latest
                </Badge>
                <Badge className="rounded-full" variant="outline">
                  Most read
                </Badge>
                <Badge className="rounded-full" variant="outline">
                  Editors&apos; picks
                </Badge>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((s) => (
                  <StoryCard key={s.slug} story={s} />
                ))}
              </div>

              <Pager />
            </>
          )}
        </>
      )}
    </div>
  );
}
