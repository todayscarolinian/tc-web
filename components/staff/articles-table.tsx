"use client";

import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionDot } from "@/components/staff/section-dot";
import { StatusPill } from "@/components/staff/status-pill";
import type { StaffArticle } from "@/lib/staff-data";
import { cn } from "@/lib/utils";

export type ArticleSortKey = "title" | "section" | "author" | "status" | "date" | "views";
export type ArticleSort = { key: ArticleSortKey; dir: "asc" | "desc" };

const COLUMNS: { key: ArticleSortKey; label: string; align?: "right" }[] = [
  { key: "title", label: "Article" },
  { key: "section", label: "Section" },
  { key: "author", label: "Author" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "views", label: "Views", align: "right" },
];

export function ArticlesTable({
  articles,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSortChange,
}: {
  articles: StaffArticle[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  sort?: ArticleSort;
  onSortChange?: (key: ArticleSortKey) => void;
}) {
  const allChecked = selectable && articles.length > 0 && articles.every((a) => selectedIds?.has(a.id));

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {selectable && (
            <TableHead className="w-10">
              <Checkbox checked={allChecked} onCheckedChange={onToggleSelectAll} aria-label="Select all" />
            </TableHead>
          )}
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className={cn(col.align === "right" && "text-right", onSortChange && "cursor-pointer select-none")}
              onClick={() => onSortChange?.(col.key)}
            >
              <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                {col.label}
                {sort?.key === col.key &&
                  (sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((a) => (
          <TableRow key={a.id} data-state={selectedIds?.has(a.id) ? "selected" : undefined}>
            {selectable && (
              <TableCell>
                <Checkbox
                  checked={selectedIds?.has(a.id) ?? false}
                  onCheckedChange={() => onToggleSelect?.(a.id)}
                  aria-label={`Select ${a.title}`}
                />
              </TableCell>
            )}
            <TableCell className="max-w-xs whitespace-normal">
              <Link
                href={`/staff/articles/${a.id}`}
                className="font-display font-bold text-foreground hover:text-brand-strong"
              >
                {a.title}
              </Link>
            </TableCell>
            <TableCell>
              <SectionDot section={a.section} />
            </TableCell>
            <TableCell className="text-text-secondary">{a.author}</TableCell>
            <TableCell>
              <StatusPill status={a.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{a.date}</TableCell>
            <TableCell className="text-right font-ui font-bold tabular-nums text-foreground">
              {a.views ? a.views.toLocaleString("en-US") : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
