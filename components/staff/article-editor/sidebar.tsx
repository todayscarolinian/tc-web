"use client";

import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { StatusPill } from "@/components/staff/status-pill";
import { TagInput } from "@/components/staff/tag-input";
import { AuthorSelect } from "../author-select";
import { CoverImageField, type CoverImageFieldProps } from "./cover-field";

import type { UserProfile } from "@/src/lib/herald/types";
import type { ArticleStatus } from "@/src/entities/article/core/article.types";
import { SECTIONS } from "@/src/entities/section/infrastructure/static-section.repository";
import type { SectionName } from "@/src/entities/section/core/section.types";
import { toDatetimeLocalValue } from "@/src/lib/utils";

export function ArticleEditorSidebar({
  status,
  onStatusChange,
  section,
  onSectionChange,
  authors,
  authorId,
  onAuthorChange,
  authorError,
  tags,
  onTagsChange,
  coverImage,
  featured,
  onFeaturedChange,
  publishAt,
  onPublishAtChange,
}: {
  status: ArticleStatus;
  onStatusChange: (status: ArticleStatus) => void;
  section: SectionName;
  onSectionChange: (section: SectionName) => void;
  authors: UserProfile[];
  authorId: string | null;
  onAuthorChange: (id: string) => void;
  authorError?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  coverImage: CoverImageFieldProps;
  featured: boolean;
  onFeaturedChange: (featured: boolean) => void;
  publishAt: Date | null;
  onPublishAtChange: (date: Date | null) => void;
}) {
  return (
    <aside className="flex flex-col gap-6 border-t border-border bg-card p-5 lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Status
        </span>
        <StatusPill status={status} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Section
        </span>
        <Select
          value={section}
          onValueChange={(v) => onSectionChange(v as SectionName)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s.slug} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Author
        </span>
        <AuthorSelect
          authors={authors}
          value={authorId}
          onChange={onAuthorChange}
        />
        {authorError && !authorId && (
          <p className="text-xs text-destructive">{authorError}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Tags
        </span>
        <TagInput tags={tags} onChange={onTagsChange} />
      </div>

      <CoverImageField {...coverImage} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Featured
          </span>
          <p className="font-utility text-[11px] text-muted-foreground">
            Show as the homepage banner. Replaces any other featured story.
          </p>
        </div>
        <Switch
          checked={featured}
          onCheckedChange={onFeaturedChange}
          aria-label="Feature this story on the homepage"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Publish date
        </span>
        <div className="relative">
          <Input
            type="datetime-local"
            value={publishAt ? toDatetimeLocalValue(publishAt) : ""}
            disabled={status === "Published"}
            onChange={(e) => {
              if (status === "Published") return;

              const value = e.target.value;

              if (!value) {
                onPublishAtChange(null);
                if (status === "Scheduled") onStatusChange("Draft");
                return;
              }

              onPublishAtChange(new Date(value));
              if (status === "Draft") onStatusChange("Scheduled");
            }}
          />
          <Calendar
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
            size={15}
          />
        </div>
      </div>
    </aside>
  );
}
