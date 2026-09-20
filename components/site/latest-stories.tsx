"use client";

import { useState } from "react";
import { ChevronDown, Newspaper } from "lucide-react";
import type { Article } from "@/src/entities/article/core/article.domain";
import { StoryCard } from "@/components/site/story-card";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

export function LatestStories({ stories }: { stories: Article[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (stories.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="No stories yet"
        description="New stories will show up here as soon as they're published."
      />
    );
  }

  const visibleStories = stories.slice(0, visibleCount);
  const hasMore = visibleCount < stories.length;

  return (
    <>
      <div className="mt-6 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleStories.map((s) => (
          <StoryCard key={s.slug} story={s} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-10">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + PAGE_SIZE, stories.length),
              )
            }
          >
            Load more stories
            <ChevronDown />
          </Button>
        </div>
      )}
    </>
  );
}
