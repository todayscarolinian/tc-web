"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArticlesTable, type ArticleSort, type ArticleSortKey } from "@/components/staff/articles-table";
import { EmptyState } from "@/components/site/empty-state";
import { PageHeader } from "@/components/staff/page-header";
import { SECTIONS } from "@/src/lib/content";
import type { ArticleStatus } from "@/src/domain/article/article-status.value-object";
import type { Article } from "@/src/domain/article/article.entity";

const STATUS_OPTIONS: ("All" | ArticleStatus)[] = ["All", "Published", "Draft", "Scheduled"];

export function ArticlesView({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All");
  const [status, setStatus] = useState<"All" | ArticleStatus>("All");
  const [author, setAuthor] = useState("All");
  const [sort, setSort] = useState<ArticleSort>({ key: "date", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const authors = useMemo(
    () => ["All", ...Array.from(new Set(initialArticles.map((a) => a.author)))],
    [initialArticles]
  );

  const filtered = useMemo(() => {
    let rows = articles.filter((a) => {
      if (section !== "All" && a.section !== section) return false;
      if (status !== "All" && a.status !== status) return false;
      if (author !== "All" && a.author !== author) return false;
      if (query.trim() && !a.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [articles, section, status, author, query, sort]);

  function handleSort(key: ArticleSortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function toggleOne(slug: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAll() {
    setSelected((s) => {
      const allSelected = filtered.length > 0 && filtered.every((a) => s.has(a.slug));
      if (allSelected) return new Set();
      return new Set(filtered.map((a) => a.slug));
    });
  }

  function bulkPublish() {
    setArticles((rows) => rows.map((r) => (selected.has(r.slug) ? { ...r, status: "Published" } : r)));
    setSelected(new Set());
  }

  function bulkDelete() {
    setArticles((rows) => rows.filter((r) => !selected.has(r.slug)));
    setSelected(new Set());
  }

  return (
    <>
      <PageHeader
        title="Articles"
        subtitle={`${filtered.length} of ${articles.length} articles`}
        actions={
          <Link href="/staff/articles/new">
            <Button type="button">
              <Plus /> New article
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="pl-8"
            />
          </div>
          <Select value={section} onValueChange={(v) => v && setSection(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All sections</SelectItem>
              {SECTIONS.map((s) => (
                <SelectItem key={s.slug} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as "All" | ArticleStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={author} onValueChange={(v) => v && setAuthor(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {authors.map((a) => (
                <SelectItem key={a} value={a}>
                  {a === "All" ? "All authors" : a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-sm bg-foreground px-4 py-2.5 text-background">
            <span className="font-ui text-sm font-bold">{selected.size} selected</span>
            <span className="grow" />
            <Button type="button" size="sm" variant="outline" className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background" onClick={bulkPublish}>
              <CheckCircle2 /> Publish
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                  />
                }
              >
                <Trash2 /> Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selected.size} article{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This can&apos;t be undone. These articles will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={bulkDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" size="sm" variant="ghost" className="text-background hover:bg-background/10 hover:text-background" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No articles match these filters"
            description="Try a different search term, or clear the section, status, and author filters."
          />
        ) : (
          <div className="overflow-hidden rounded-sm ring-1 ring-border">
            <ArticlesTable
              articles={filtered}
              selectable
              selectedIds={selected}
              onToggleSelect={toggleOne}
              onToggleSelectAll={toggleAll}
              sort={sort}
              onSortChange={handleSort}
            />
          </div>
        )}
      </div>
    </>
  );
}
