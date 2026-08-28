"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticlesTable } from "@/components/staff/articles-table";
import { EmptyState } from "@/components/site/empty-state";
import type { ArticleStatus } from "@/src/entities/article/core/article.types";
import type { Article } from "@/src/entities/article/core/article.domain";

const FILTERS = ["All", "Published", "Draft", "Scheduled"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = {
  All: "All",
  Published: "Published",
  Draft: "Drafts",
  Scheduled: "Scheduled",
};

export function DashboardArticlesPanel({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const rows =
    filter === "All" ? articles : articles.filter((a) => a.status === (filter as ArticleStatus));

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border py-4">
        <CardTitle>Articles</CardTitle>
      </CardHeader>
      <div className="px-4 pt-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList variant="line">
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {FILTER_LABEL[f]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="px-0 pt-2 pb-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No articles here"
            description="Try a different filter."
            className="border-0 py-12"
          />
        ) : (
          <ArticlesTable articles={rows.slice(0, 7)} />
        )}
      </CardContent>
    </Card>
  );
}
