"use client";

import { useMemo, useState } from "react";
import { Download, Images, Trash2, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/staff/page-header";
import { MediaGrid } from "@/components/staff/media-grid";
import { CoverDropzone } from "@/components/staff/cover-dropzone";
import { EmptyState } from "@/components/site/empty-state";
import { MEDIA_FOLDERS, MEDIA_TAGS, STAFF_MEDIA } from "@/src/lib/staff-data";
import { cn } from "@/src/lib/utils";

// STAFF_MEDIA is imported directly (rather than passed as a prop from the server
// page) because its items carry lucide icon components, which can't cross the
// server/client boundary as props.
export function MediaView() {
  const items = STAFF_MEDIA;
  const [folder, setFolder] = useState<(typeof MEDIA_FOLDERS)[number]>("All");
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      items.filter((m) => {
        if (folder !== "All" && m.folder !== folder) return false;
        if (tag && !m.tags.includes(tag)) return false;
        return true;
      }),
    [items, folder, tag]
  );

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        title="Media"
        subtitle={`${filtered.length} of ${items.length} files`}
        actions={
          <Button type="button">
            <UploadIcon /> Upload
          </Button>
        }
      />

      <div className="flex flex-col gap-5 p-5 sm:p-8">
        <CoverDropzone title="Drag photos here to upload" description="or click to browse · JPG, PNG up to 20 MB" />

        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <aside className="flex flex-col gap-6">
            <div>
              <p className="font-utility mb-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Folders
              </p>
              <div className="flex flex-col gap-0.5">
                {MEDIA_FOLDERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFolder(f)}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-left font-ui text-sm font-semibold text-text-secondary hover:bg-muted hover:text-foreground",
                      folder === f && "bg-brand/10 text-brand-strong hover:text-brand-strong"
                    )}
                  >
                    <Images size={15} />
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-utility mb-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MEDIA_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag((cur) => (cur === t ? null : t))}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-utility text-xs font-semibold text-text-secondary ring-1 ring-border hover:text-foreground",
                      tag === t && "bg-brand text-primary-foreground ring-0"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            {selected.size > 0 && (
              <div className="flex items-center gap-3 rounded-sm bg-foreground px-4 py-2.5 text-background">
                <span className="font-ui text-sm font-bold">{selected.size} selected</span>
                <span className="grow" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                >
                  <Download /> Download
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                >
                  <Trash2 /> Delete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-background hover:bg-background/10 hover:text-background"
                  onClick={() => setSelected(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState
                icon={Images}
                title="No files match this filter"
                description="Try a different folder or tag, or clear the filter."
              />
            ) : (
              <MediaGrid items={filtered} selectedIds={selected} onToggle={toggle} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
