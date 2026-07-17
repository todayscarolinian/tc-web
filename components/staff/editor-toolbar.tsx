"use client";

import { useState } from "react";
import { Bold, Italic, Underline, Link2, Quote, List, Image as ImageIcon, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TOGGLES = [
  { key: "h", label: "H", icon: null, title: "Heading" },
  { key: "b", label: null, icon: Bold, title: "Bold" },
  { key: "i", label: null, icon: Italic, title: "Italic" },
  { key: "u", label: null, icon: Underline, title: "Underline" },
] as const;

const ACTIONS = [
  { key: "link", icon: Link2, title: "Link" },
  { key: "quote", icon: Quote, title: "Quote" },
  { key: "list", icon: List, title: "List" },
  { key: "image", icon: ImageIcon, title: "Image" },
];

// Cosmetic only — matches the design prototype, which doesn't wire the toolbar
// to a real rich-text engine either. No formatting library exists in this repo.
export function EditorToolbar() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="sticky top-0 z-[1] mb-6 flex items-center gap-0.5 rounded-sm bg-card p-1.5 ring-1 ring-border">
      {TOGGLES.map((t) => (
        <button
          key={t.key}
          type="button"
          title={t.title}
          aria-pressed={active === t.key}
          onClick={() => setActive((a) => (a === t.key ? null : t.key))}
          className={cn(
            "flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground",
            active === t.key && "bg-foreground text-background"
          )}
        >
          {t.icon ? <t.icon size={16} /> : <span className="font-display text-sm font-extrabold">{t.label}</span>}
        </button>
      ))}
      <span className="mx-1.5 h-5 w-px bg-border" />
      {ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          title={a.title}
          className="flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground"
        >
          <a.icon size={16} />
        </button>
      ))}
      <span className="mx-1.5 h-5 w-px bg-border" />
      <button
        type="button"
        title="Undo"
        className="flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground"
      >
        <Undo2 size={15} />
      </button>
    </div>
  );
}
