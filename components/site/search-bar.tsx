"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, SearchX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/site/empty-state";
import { getSectionName } from "@/src/lib/content";
import { kickerClassForSection, sectionIcon } from "@/src/lib/section-style";
import { formatDisplayDate } from "@/src/lib/article-format";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Article } from "@/src/domain/article/article.entity";



export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  // The query the current `results` correspond to. While it lags behind
  // `trimmedQuery`, a fetch is pending or queued — derived instead of a
  // separate `loading` state set synchronously in the effect below.
  const [fetchedQuery, setFetchedQuery] = useState("");
  const requestId = useRef(0);
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery);
  const loading = trimmedQuery !== "" && trimmedQuery !== fetchedQuery;

  useEffect(() => {
    if (!debouncedQuery) return;

    const id = ++requestId.current;
    (async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data: { articles: Article[] } = await res.json();
        if (id === requestId.current) setResults(data.articles);
      } finally {
        if (id === requestId.current) setFetchedQuery(debouncedQuery);
      }
    })();
  }, [debouncedQuery]);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <SheetTrigger
        render={
          <Button type="button" variant="ghost" size="icon" aria-label="Search" />
        }
      >
        <Search />
      </SheetTrigger>
      <SheetContent side="top" className="w-full border-b border-border sm:max-w-none">
        <SheetHeader>
          <SheetTitle>Search Today&apos;s Carolinian</SheetTitle>
          <SheetDescription className="sr-only">
            Search articles by title, author, or section.
          </SheetDescription>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              placeholder="Search articles, authors, sections…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
        </SheetHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
          {loading && (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </div>
          )}

          {!loading && trimmedQuery && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No results"
              description={`Nothing matches "${trimmedQuery}". Try a different title, author, or section.`}
            />
          )}

          {!loading && trimmedQuery && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((article) => {
                const sectionName = getSectionName(article.sectionSlug);
                const Icon = sectionIcon(sectionName);
                return (
                  <li key={article.slug}>
                    <Link
                      href={`/article/${article.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 py-3"
                    >
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className={kickerClassForSection(sectionName)}>
                          {sectionName}
                        </span>
                        <span className="font-display line-clamp-1 font-bold text-foreground group-hover:underline">
                          {article.title}
                        </span>
                        <span className="font-utility text-xs font-medium text-muted-foreground">
                          By {article.authorName} · {formatDisplayDate(article.publishedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
