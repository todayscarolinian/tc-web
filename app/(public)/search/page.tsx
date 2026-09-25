import type { Metadata } from "next";
import Form from "next/form";
import { Search, SearchX } from "lucide-react";
import { articleService } from "@/src/entities/article/services/article.service.factory";
import { StoryCard } from "@/components/site/story-card";
import { EmptyState } from "@/components/site/empty-state";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

async function readQuery(searchParams: Props["searchParams"]): Promise<string> {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await readQuery(searchParams);
  return {
    title: query ? `Search results for "${query}"` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await readQuery(searchParams);
  const articles = await articleService.search(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <span className="tc-kicker text-brand">Search</span>
        <h1 className="font-display mt-2 text-4xl font-extrabold text-foreground">
          {query ? `Results for "${query}"` : "Search Today's Carolinian"}
        </h1>
        <Form action="/search" className="relative mt-4 max-w-2xl">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            key={query}
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, authors, sections…"
            aria-label="Search articles"
            className="h-11 pl-9"
          />
        </Form>
        {query && (
          <p className="font-utility mt-3 text-sm text-muted-foreground">
            {articles.length} {articles.length === 1 ? "story" : "stories"}
          </p>
        )}
      </div>

      {!query ? (
        <div className="py-8">
          <EmptyState
            icon={Search}
            title="Search for a story"
            description="Search articles by title, author, or section."
          />
        </div>
      ) : articles.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={SearchX}
            title="No results"
            description={`Nothing matches "${query}". Try a different title, author, or section.`}
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
