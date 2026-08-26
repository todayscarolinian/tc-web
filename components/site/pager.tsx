import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

function hrefForPage(sectionSlug: string, page: number) {
  return page === 1 ? `/section/${sectionSlug}` : `/section/${sectionSlug}/page/${page}`;
}

// Windows the page numbers shown around the current page (plus first/last)
// so a section with many pages doesn't render a link per page.
function pageWindow(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (const page of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === "number" && page - prev > 1) result.push("ellipsis");
    result.push(page);
  }
  return result;
}

export function Pager({
  sectionSlug,
  currentPage,
  totalPages,
}: {
  sectionSlug: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const numberButtonClass = (active: boolean) =>
    cn(
      "flex size-9 items-center justify-center border border-border text-foreground",
      active && "border-brand bg-brand text-white",
    );

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1 font-utility text-sm font-medium"
    >
      {currentPage > 1 ? (
        <Link
          href={hrefForPage(sectionSlug, currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-foreground"
        >
          <ChevronLeft size={16} /> Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-foreground opacity-40">
          <ChevronLeft size={16} /> Prev
        </span>
      )}

      {pageWindow(currentPage, totalPages).map((entry, i) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefForPage(sectionSlug, entry)}
            aria-current={entry === currentPage ? "page" : undefined}
            className={numberButtonClass(entry === currentPage)}
          >
            {entry}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={hrefForPage(sectionSlug, currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-foreground"
        >
          Next <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-foreground opacity-40">
          Next <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
