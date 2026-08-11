"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { EditorToolbar } from "@/components/staff/editor-toolbar";
import { StatusPill } from "@/components/staff/status-pill";
import { TagInput } from "@/components/staff/tag-input";
import { CoverDropzone } from "@/components/staff/cover-dropzone";
import { SECTIONS, getSectionName, type SectionName } from "@/src/lib/content";
import { ARTICLE_BODY } from "@/src/lib/articles";
import type { ArticleStatus } from "@/src/domain/article/article-status.value-object";
import type { Article } from "@/src/domain/article/article.entity";
import { cn } from "@/src/lib/utils";

const AUTHORS = [
  "Maria Santos",
  "Noah Lim",
  "Liam Reyes",
  "Aisha Cruz",
  "Patricia Gallardo",
  "Joshua Mendoza",
  "Reina Villanueva",
  "Editorial Board",
];

export function ArticleEditor({ article }: { article?: Article }) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [section, setSection] = useState<SectionName>(
    article ? getSectionName(article.sectionSlug) : "News"
  );
  const [author, setAuthor] = useState(article?.authorName ?? "Maria Santos");
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "Draft");
  const [tags, setTags] = useState<string[]>(article ? ["tuition", "board of trustees"] : []);
  const [hasCover, setHasCover] = useState(Boolean(article));
  const [visibility, setVisibility] = useState<"public" | "members">("public");

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <Link href="/staff/articles">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Back to articles">
            <ArrowLeft />
          </Button>
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled article"
          className="font-display min-w-0 flex-1 border-0 bg-transparent text-xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground sm:text-2xl"
        />
        <div className="hidden items-center gap-1.5 font-utility text-xs font-semibold tracking-wide text-muted-foreground uppercase md:flex">
          <span className="size-1.5 rounded-full bg-success" />
          Saved 2m ago
        </div>
        <Button type="button" variant="outline" onClick={() => setStatus("Draft")}>
          <FileText /> Save draft
        </Button>
        <Button type="button" onClick={() => setStatus("Published")}>
          Publish <ArrowRight />
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <EditorToolbar />

            <p className="tc-kicker text-brand mb-2">{section} · Breaking</p>
            <h1
              contentEditable
              suppressContentEditableWarning
              className="font-display mb-5 text-3xl leading-tight font-extrabold tracking-tight text-foreground outline-none sm:text-4xl"
            >
              {title || "USC board defers tuition adjustment after three-hour hearing"}
            </h1>

            {ARTICLE_BODY.slice(0, 2).map((p, i) => (
              <p
                key={i}
                contentEditable
                suppressContentEditableWarning
                className="mb-5 text-lg leading-8 text-foreground outline-none"
              >
                {p}
              </p>
            ))}

            <blockquote
              contentEditable
              suppressContentEditableWarning
              className="font-display my-7 border-l-4 border-brand py-1 pl-6 text-2xl leading-tight font-bold text-foreground outline-none"
            >
              &ldquo;We heard you. We owe it to this community to get the number right, not just to
              get it done.&rdquo;
            </blockquote>

            <figure className="my-7">
              <PhotoPlaceholder ratio="16 / 9" iconSize={36} />
              <figcaption
                contentEditable
                suppressContentEditableWarning
                className="font-utility mt-2 text-xs text-muted-foreground outline-none"
              >
                SSC president Reina Villanueva addresses students after the hearing · Photo by
                Aisha Cruz / TC
              </figcaption>
            </figure>

            {ARTICLE_BODY.slice(2, 4).map((p, i) => (
              <p
                key={i}
                contentEditable
                suppressContentEditableWarning
                className="mb-5 text-lg leading-8 text-foreground outline-none"
              >
                {p}
              </p>
            ))}
            <p contentEditable suppressContentEditableWarning className="text-lg leading-8 text-muted-foreground outline-none">
              Continue writing the story…
            </p>
          </div>
        </div>

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
            <Select value={section} onValueChange={(v) => setSection(v as SectionName)}>
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
            <Select value={author} onValueChange={(v) => v && setAuthor(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTHORS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Tags
            </span>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Cover image
            </span>
            {hasCover ? (
              <div className="overflow-hidden rounded-sm ring-1 ring-border">
                <PhotoPlaceholder ratio="16 / 10" iconSize={28} />
                <div className="flex gap-2 p-2.5">
                  <Button type="button" size="sm" variant="outline" className="flex-1">
                    <Upload /> Replace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove cover image"
                    onClick={() => setHasCover(false)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ) : (
              <CoverDropzone compact onClick={() => setHasCover(true)} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Publish date
            </span>
            <div className="relative">
              <Input defaultValue="Jun 25, 2026 · 7:00 AM" className="pr-9" />
              <Calendar
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                size={15}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Visibility
            </span>
            <div className="flex gap-1.5">
              {(["public", "members"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "rounded-full px-3 py-1 font-ui text-xs font-bold",
                    visibility === v
                      ? "bg-brand text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v === "public" ? "Public" : "Members only"}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
