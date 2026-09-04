import Link from "next/link";
import { ChevronDown, Newspaper } from "lucide-react";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import { kickerClassForSection } from "@/src/lib/section-style";
import { FeaturedStoryBanner } from "@/components/site/featured-story-banner";
import { StoryCard } from "@/components/site/story-card";
import { SubscribeStrip } from "@/components/site/subscribe-strip";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";
import { ENABLE_SUBSCRIPTION } from "@/src/lib/flags";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, published, trending] = await Promise.all([
    articleService.getFeatured(),
    articleService.listPublished(),
    articleService.listTrending(4),
  ]);
  const lead = featured ?? published[0] ?? null;
  const stories = published.filter((article) => article.slug !== lead?.slug);

  const campusMix = stories
    .filter((s) =>
      ["campus-life", "arts-culture", "sports", "opinion"].includes(
        s.sectionSlug,
      ),
    )
    .slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {lead ? (
            <FeaturedStoryBanner article={lead} featured={Boolean(featured)} />
          ) : (
            <EmptyState
              icon={Newspaper}
              title="No stories yet"
              description="Published stories will appear here once they go live."
            />
          )}

          <aside>
            <h2 className="font-utility border-b border-border pb-2 text-xs font-bold tracking-wide text-foreground uppercase">
              Most read
            </h2>
            {trending.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Nothing trending yet.
              </p>
            ) : (
              <div className="flex flex-col">
                {trending.map((t, i) => (
                  <Link
                    key={t.slug}
                    href={`/article/${t.slug}`}
                    className="group flex gap-3 border-b border-border py-4"
                  >
                    <span className="font-display text-2xl leading-none font-extrabold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <span
                        className={kickerClassForSection(
                          getSectionName(t.sectionSlug),
                        )}
                        style={{ fontSize: 11 }}
                      >
                        {getSectionName(t.sectionSlug)}
                      </span>
                      <h4 className="font-display mt-1 text-sm leading-5 font-bold text-foreground group-hover:underline">
                        {t.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="mt-12 flex items-center gap-4 border-b border-border pb-3">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Latest stories
          </h2>
        </div>
        {stories.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No stories yet"
            description="New stories will show up here as soon as they're published."
          />
        ) : (
          <div className="mt-6 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 6).map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        )}

        <div className="mt-12 flex items-center gap-4 border-b border-border pb-3">
          <h2 className="font-display text-2xl font-bold text-foreground">
            From Campus Life
          </h2>
          <span className="grow" />
          <Link href="/section/campus-life">
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </Link>
        </div>
        {campusMix.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Nothing from Campus Life yet"
            description="Check back soon, or browse another section from the nav above."
          />
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {campusMix.map((s) => (
              <StoryCard key={"cl-" + s.slug} story={s} small />
            ))}
          </div>
        )}

        <div className="flex justify-center py-10">
          <Button variant="outline" size="lg">
            Load more stories
            <ChevronDown />
          </Button>
        </div>
      </div>
      {ENABLE_SUBSCRIPTION && <SubscribeStrip />}
    </>
  );
}
