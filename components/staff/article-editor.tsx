"use client";

import "@/src/lib/tiptap-styles.css";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Figure, Figcaption, ImageResize } from "tiptap-extension-resize-image";

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
import { toast } from "sonner";

import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { StatusPill } from "@/components/staff/status-pill";
import { TagInput } from "@/components/staff/tag-input";
import { CoverDropzone } from "@/components/staff/cover-dropzone";

import type { UserProfile } from "@/src/lib/herald/types";

import type { Article } from "@/src/domain/article/article.entity";
import type { ArticleStatus } from "@/src/domain/article/article-status.value-object";

import { SECTIONS, getSectionName, type SectionName } from "@/src/lib/content";
import { toDatetimeLocalValue } from "@/src/lib/utils";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";
import { requestMediaUploadUrl, deleteMediaAsset } from "@/actions/media.actions";

import { EditorToolbar } from "./editor-toolbar";
import { AuthorSelect } from "./author-select";

const extensions = [
  StarterKit,
  TextStyleKit,
  ImageResize.configure({
    resize: false,
  }),
  Figure,
  Figcaption,
];

export function ArticleEditor({
  article,
  currentUserId,
}: {
  article?: Article;
  currentUserId: string | null;
}) {
  const router = useRouter();

  // SIDEBAR STATES
  const [title, setTitle] = useState<string>(article?.title ?? "");
  const [section, setSection] = useState<SectionName>(
    article ? getSectionName(article.sectionSlug) : "News",
  );

  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [authorId, setAuthorId] = useState<string | null>(
    article?.authorId ?? currentUserId,
  );

  const [status, setStatus] = useState<ArticleStatus>(
    article?.status ?? "Draft",
  );
  const [dek, setDek] = useState(article?.dek ?? "");

  const [tags, setTags] = useState<string[]>(article?.tagSlugs ?? []);

  const [coverImageUrl, setCoverImageUrl] = useState(
    article?.coverImageUrl ?? "",
  );
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(
    null,
  );
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImageAlt, setCoverImageAlt] = useState(
    article?.coverImageAlt ?? "",
  );
  const [publishAt, setPublishAt] = useState<Date | null>(
    article?.publishAt ?? null,
  );

  const [isSaving, setIsSaving] = useState(false);

  const selectedSection = SECTIONS.find((s) => s.name === section);
  const displayCoverUrl = previewBlobUrl ?? coverImageUrl;
  const hasCover = Boolean(displayCoverUrl);

  const coverInputRef = useRef<HTMLInputElement>(null);
  // Guards against two overlapping handleCoverFile calls racing (e.g. a
  // slow upload still in flight when a second one starts): each call
  // captures the id current at its start, and checks it's still current
  // after every await before touching state, so a stale call can't
  // clobber a newer one's result. The disabled Replace button stops the
  // obvious trigger, but doesn't guarantee no overlap — this is the
  // actual correctness guard.
  const coverUploadIdRef = useRef(0);

  useEffect(() => {
    if (!previewBlobUrl) return;
    return () => URL.revokeObjectURL(previewBlobUrl);
  }, [previewBlobUrl]);

  // FUNCTIONS
  const editor = useEditor({
    extensions,
    content: article?.body ?? "Write your news content here…",
  });

  const handleCoverFile = async (file: File) => {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.type)) {
      toast.error(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("File exceeds the 10MB upload limit.");
      return;
    }

    const previousCoverImageUrl = coverImageUrl;
    // Pre-increment claims this call's own id and bumps the shared
    // counter in one step; capturing it in a local means later
    // `coverUploadIdRef.current !== uploadId` checks compare against
    // what this call started with, not whatever the ref holds by then.
    const uploadId = ++coverUploadIdRef.current;
    setPreviewBlobUrl(URL.createObjectURL(file));
    setIsUploadingCover(true);

    try {
      const result = await requestMediaUploadUrl({
        fileName: file.name, 
        contentType: file.type,
        sizeBytes: file.size,
        folder: "Covers",
      });
      if (coverUploadIdRef.current !== uploadId) return;

      if ("error" in result) {
        toast.error(result.message);
        setPreviewBlobUrl(null);
        return;
      }

      const response = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (coverUploadIdRef.current !== uploadId) return;

      if (!response.ok) {
        toast.error("Failed to upload cover image.");
        setPreviewBlobUrl(null);
        return;
      }

      setCoverImageUrl(result.publicUrl);
      setPreviewBlobUrl(null);
      // Best-effort cleanup of the file this one replaced — a unique path
      // per upload, so it's never shared with another article.
      if (previousCoverImageUrl) {
        void deleteMediaAsset({ publicUrl: previousCoverImageUrl });
      }
    } catch {
      if (coverUploadIdRef.current !== uploadId) return;
      toast.error("Failed to upload cover image. Check your connection and try again.");
      setPreviewBlobUrl(null);
    } finally {
      if (coverUploadIdRef.current === uploadId) setIsUploadingCover(false);
    }
  };

  const removeCoverImage = () => {
    if (coverImageUrl) {
      void deleteMediaAsset({ publicUrl: coverImageUrl });
    }
    setCoverImageUrl("");
    setCoverImageAlt("");
    setPreviewBlobUrl(null);
  };

  const saveDraft = async () => {
    if (!editor || isSaving) return;

    setIsSaving(true);

    try {
      const selectedAuthor = authors.find((a) => a.id === authorId);

      const body = JSON.stringify({
        sectionSlug: selectedSection?.slug ?? "",
        title,
        dek,
        body: editor.getJSON(),
        tagSlugs: tags,
        authorId: authorId,
        authorName: selectedAuthor?.name ?? "",
        authorInitials: selectedAuthor
          ? `${selectedAuthor.firstName[0] ?? ""}${selectedAuthor.lastName[0] ?? ""}`.toUpperCase()
          : "",
        authorRole: selectedAuthor?.positions[0]?.name,
        publishAt,
        coverImageUrl,
        coverImageAlt,
      });

      const url = article?.slug
        ? `/api/articles/${article.slug}`
        : "/api/articles";
      const method = article?.slug ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error ?? response.statusText;

        toast.error(`Failed to save draft: ${message}`);
        return;
      }

      const { article: savedArticle } = await response.json();
      toast.success("Article saved successfully!");
      if (!article?.slug) {
        router.push(`/staff/articles/${savedArticle.slug}`);
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const publishDraft = async () => {
    if (!editor || isSaving) return;
    if (!article?.slug) return;
    setIsSaving(true);

    try {
      await saveDraft();
      const response = await fetch(`/api/articles/${article.slug}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error ?? response.statusText;

        toast.error(`Failed to publish article: ${message}`);
        return;
      }

      const publishedArticle = await response.json();
      toast.success("Article published successfully!");
      setStatus(publishedArticle.article.status);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setAuthors(data.users);
      })
      .catch(() => {
        toast.error("Failed to load authors");
      });
  }, [article]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <Link href="/staff/articles">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Back to articles"
          >
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
          Saved 2m ago {/*currently arbitrary */}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={saveDraft}
          disabled={isSaving}
        >
          <FileText />{" "}
          {isSaving
            ? "Saving…"
            : status === "Published"
              ? "Save"
              : "Save draft"}
        </Button>
        <Button
          type="button"
          onClick={publishDraft}
          disabled={status === "Published" || isSaving}
        >
          Publish <ArrowRight />
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <EditorToolbar editor={editor} />
            <p className="tc-kicker text-brand mb-2">{section}</p>
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setTitle(e.currentTarget.textContent ?? "")}
              className="font-display mb-5 text-3xl leading-tight font-extrabold tracking-tight text-foreground outline-none sm:text-4xl"
            >
              {title || "Sample Title"}
            </h1>

            <textarea
              value={dek}
              onChange={(e) => setDek(e.target.value)}
              placeholder="Write a one- or two-sentence excerpt…"
              rows={2}
              className="mb-5 w-full resize-none border-0 bg-transparent text-lg leading-7 text-text-secondary outline-none placeholder:text-muted-foreground"
            />

            <EditorContent editor={editor} />
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
            <Select
              value={section}
              onValueChange={(v) => setSection(v as SectionName)}
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
              onChange={setAuthorId}
            />
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
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) handleCoverFile(file);
              }}
            />
            {hasCover ? (
              <div className="overflow-hidden rounded-sm ring-1 ring-border">
                <PhotoPlaceholder
                  ratio="16 / 10"
                  iconSize={28}
                  src={displayCoverUrl}
                  alt={coverImageAlt}
                />
                <div className="flex gap-2 p-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <Upload /> {isUploadingCover ? "Uploading…" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove cover image"
                    disabled={isUploadingCover}
                    onClick={removeCoverImage}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="flex flex-col gap-1 p-2.5 pt-0">
                  <span className="font-utility text-xs font-semibold text-muted-foreground">
                    Alt text <span className="text-destructive">*</span>
                  </span>
                  <Input
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
              </div>
            ) : (
              <CoverDropzone
                compact
                onClick={() => coverInputRef.current?.click()}
                onDrop={handleCoverFile}
              />
            )}
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
                    setPublishAt(null);
                    if (status === "Scheduled") setStatus("Draft");
                    return;
                  }

                  setPublishAt(new Date(value));
                  if (status === "Draft") setStatus("Scheduled");
                }}
              />
              <Calendar
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                size={15}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
