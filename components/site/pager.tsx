"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pager({ pageCount = 9 }: { pageCount?: number }) {
  const [page, setPage] = useState(1);
  const pages = [1, 2, 3, 4];

  return (
    <div className="mt-8 flex items-center justify-center gap-1 font-utility text-sm font-medium">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="flex items-center gap-1 px-3 py-2 text-foreground disabled:opacity-40"
      >
        <ChevronLeft size={16} /> Prev
      </button>
      {pages.map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={cn(
            "size-9 border border-border text-foreground",
            n === page && "border-brand bg-brand text-white"
          )}
        >
          {n}
        </button>
      ))}
      <span className="px-2 text-muted-foreground">…</span>
      <button
        onClick={() => setPage(pageCount)}
        className={cn(
          "size-9 border border-border text-foreground",
          page === pageCount && "border-brand bg-brand text-white"
        )}
      >
        {pageCount}
      </button>
      <button
        disabled={page === pageCount}
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        className="flex items-center gap-1 px-3 py-2 text-foreground disabled:opacity-40"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
