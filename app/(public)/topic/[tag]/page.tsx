import { Newspaper } from "lucide-react";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { tagService } from "@/src/entities/tag/services/tag.service.factory";
import { StoryCard } from "@/components/site/story-card";
import { EmptyState } from "@/components/site/empty-state";

export const revalidate = 300; 

type Props = {
  params: Promise<{ tag: string }>;
};

export default async function TopicPage({ params }: Props) {
  const { tag: tagSlug } = await params;

  const [allTags, articles] = await Promise.all([
    tagService.listAll(),
    articleService.listByTagSlug(tagSlug),
  ]);

  const tag = allTags.find((t) => t.slug === tagSlug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <span className="tc-kicker text-brand">Topic</span>
        <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
          {tag?.name ?? tagSlug}
        </h1>
        {tag?.description && (
          <p className="mt-2 max-w-2xl text-base leading-6 text-text-secondary">
            {tag.description}
          </p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Newspaper}
            title={`No stories tagged "${tag?.name ?? tagSlug}" yet`}
            description="Check back soon, or browse another topic."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <StoryCard key={article.slug} story={article} />
          ))}
        </div>
      )}
    </div>
  );
}