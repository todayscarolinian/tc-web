import { notFound, redirect } from "next/navigation";
import { Newspaper } from "lucide-react";
import { articleService } from "@/src/infrastructure/article/article.composition";
import { accentTextClass } from "@/src/lib/section-style";
import { StoryCard } from "@/components/site/story-card";
import { Pager } from "@/components/site/pager";
import { EmptyState } from "@/components/site/empty-state";

export async function generateStaticParams() {
  const sections = await articleService.listSections();
  const params: { section: string; page: string }[] = [];

  for (const section of sections) {
    const { totalPages } = await articleService.listPublishedBySection(section.slug, 1);
    for (let page = 2; page <= totalPages; page++) {
      params.push({ section: section.slug, page: String(page) });
    }
  }

  return params;
}

export const revalidate = 300;

export default async function SectionPagePage({
  params,
}: {
  params: Promise<{ section: string; page: string }>;
}) {
  const { section: slug, page: pageParam } = await params;
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) redirect(`/section/${slug}`);

  const section = await articleService.findSectionBySlug(slug);
  if (!section) notFound();

  const { articles, totalPages } = await articleService.listPublishedBySection(
    section.slug,
    page,
  );
  if (page > totalPages) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <span className={`tc-kicker ${accentTextClass(section.accent)}`}>Section</span>
        <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
          {section.name}
        </h1>
        <p className="font-utility mt-2 text-sm font-medium text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Newspaper}
            title={`No stories in ${section.name} yet`}
            description="Check back soon, or browse another section from the nav above."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>

          <Pager sectionSlug={section.slug} currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
