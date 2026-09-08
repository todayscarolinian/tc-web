"use client";

import "@/src/lib/tiptap-styles.css";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Figure, Figcaption, ImageResize } from "tiptap-extension-resize-image";

import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  Images,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

import type { Article } from "@/src/entities/article/core/article.domain";
import type { ArticleStatus } from "@/src/entities/article/core/article.types";

import { SECTIONS, getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import type { SectionName } from "@/src/entities/section/core/section.types";
import { cn, toDatetimeLocalValue } from "@/src/lib/utils";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";
import { uploadMediaFile } from "@/src/lib/upload-media";
import { MediaLibraryPicker } from "@/components/staff/media-library-picker";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

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

// Fixed interval, not a trailing debounce: continuous typing would keep
// resetting a debounce timer forever, which wouldn't actually bound loss.
const AUTOSAVE_INTERVAL_MS = 5000;

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type FieldErrors = Partial<Record<"title" | "body" | "authorId", string>>;

function getFieldErrors(input: {
  title: string;
  isBodyEmpty: boolean;
  authorId: string | null;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.title.trim()) errors.title = "Title is required.";
  if (input.isBodyEmpty) errors.body = "Body can't be empty.";
  if (!input.authorId) errors.authorId = "Choose an author.";
  return errors;
}

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
  const [coverImageAssetId, setCoverImageAssetId] = useState(
    article?.coverImageAssetId ?? "",
  );
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(
    null,
  );
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImageAlt, setCoverImageAlt] = useState(
    article?.coverImageAlt ?? "",
  );
  const [publishAt, setPublishAt] = useState<Date | null>(
    article?.publishAt ?? null,
  );
  const [featured, setFeatured] = useState(Boolean(article?.featured));

  const [isSaving, setIsSaving] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const isBusy = isSaving || isAutosaving;

  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    article?.updatedAt ?? null,
  );
  // Slug of a new article created by a background autosave. Kept out of the
  // URL (see runAutosave) so an in-flight autosave can't remount this
  // component out from under the user the way router.push/refresh would.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const selectedSection = SECTIONS.find((s) => s.name === section);
  const displayCoverUrl = previewBlobUrl ?? coverImageUrl;
  const hasCover = Boolean(displayCoverUrl);
  const hasPendingSchedule =
    (status === "Draft" || status === "Scheduled") && publishAt !== null;

  const coverInputRef = useRef<HTMLInputElement>(null);
  // Guards against two overlapping handleCoverFile calls racing (e.g. a
  // slow upload still in flight when a second one starts): each call
  // captures the id current at its start, and checks it's still current
  // after every await before touching state, so a stale call can't
  // clobber a newer one's result. The disabled Replace button stops the
  // obvious trigger, but doesn't guarantee no overlap — this is the
  // actual correctness guard.
  const coverUploadIdRef = useRef(0);

  // Set by the aggregating effect below (and by Tiptap's onUpdate) whenever
  // saved content changes; cleared after every successful save. A ref, not
  // state, since it's read from timers/event listeners, not rendered.
  const isDirtyRef = useRef(false);
  const isFirstDirtyEffectRun = useRef(true);

  useEffect(() => {
    if (!previewBlobUrl) return;
    return () => URL.revokeObjectURL(previewBlobUrl);
  }, [previewBlobUrl]);

  useEffect(() => {
    if (isFirstDirtyEffectRun.current) {
      isFirstDirtyEffectRun.current = false;
      return;
    }
    isDirtyRef.current = true;
  }, [
    title,
    section,
    authorId,
    dek,
    tags,
    coverImageUrl,
    coverImageAssetId,
    coverImageAlt,
    publishAt,
    featured,
  ]);

  // FUNCTIONS
  const editor = useEditor({
    extensions,
    content: article?.body ?? "Write your news content here…",
    onUpdate: () => {
      isDirtyRef.current = true;
    },
  });

  // editor.isEmpty read directly wouldn't re-render as the user types (the
  // onUpdate above only touches a ref, deliberately, to avoid a re-render on
  // every keystroke) — the inline body error needs to react to content
  // changing, so it subscribes via useEditorState instead, same pattern as
  // editor-toolbar-state.tsx.
  const isBodyEmpty = useEditorState({
    editor,
    selector: ({ editor }) => !editor || editor.isEmpty,
  });

  const handleCoverFile = async (file: File) => {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.type)) {
      toast.error(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("File exceeds the 2MB upload limit.");
      return;
    }

    setPendingCoverFile(file);
    setPreviewBlobUrl(URL.createObjectURL(file));

    if (coverImageUrl) {
      setCoverImageAlt("");
      toast.error("Add alt text for the new cover before it can be attached.");
      return;
    }

    if (!coverImageAlt.trim()) {
      toast.error("Add alt text before the cover can be attached.");
      return;
    }

    await uploadCoverFile(file);
  };

  const uploadCoverFile = async (file: File) => {
    // Pre-increment claims this call's own id and bumps the shared
    // counter in one step; capturing it in a local means later
    // `coverUploadIdRef.current !== uploadId` checks compare against
    // what this call started with, not whatever the ref holds by then.
    const uploadId = ++coverUploadIdRef.current;
    setIsUploadingCover(true);

    try {
      const { publicUrl, asset } = await uploadMediaFile({
        file,
        folder: "Covers",
        altText: coverImageAlt.trim(),
      });
      if (coverUploadIdRef.current !== uploadId) return;

      setCoverImageUrl(publicUrl);
      setCoverImageAssetId(asset.id);
      setPendingCoverFile(null);
      setPreviewBlobUrl(null);
    } catch (error) {
      if (coverUploadIdRef.current !== uploadId) return;
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload cover image. Check your connection and try again.",
      );
    } finally {
      if (coverUploadIdRef.current === uploadId) setIsUploadingCover(false);
    }
  };

  const attachLibraryAsset = (asset: MediaAssetDTO) => {
    setCoverImageUrl(asset.url);
    setCoverImageAssetId(asset.id);
    setCoverImageAlt(asset.altText);
    setPendingCoverFile(null);
    setPreviewBlobUrl(null);
  };

  const removeCoverImage = () => {
    coverUploadIdRef.current += 1;
    setCoverImageUrl("");
    setCoverImageAssetId("");
    setCoverImageAlt("");
    setPendingCoverFile(null);
    setPreviewBlobUrl(null);
  };

  const persistDraft = async (opts?: {
    // Autosave must never navigate: a router.push/refresh on a new
    // article's first save would unmount this component under
    // .../articles/new and remount a fresh one under .../articles/[id],
    // discarding whatever the user typed since the save started.
    redirectOnCreate?: boolean;
    // Autosave shouldn't toast on every tick (success or failure) — the
    // status indicator carries that feedback instead.
    silent?: boolean;
  }): Promise<string | null> => {
    if (!editor) return null;

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
      authorAvatarUrl: selectedAuthor?.profilePictureURL,
      publishAt,
      coverImageUrl,
      coverImageAssetId: coverImageAssetId || "",
      coverImageAlt,
      featured,
    });

    const currentSlug = article?.slug ?? createdSlug;
    const url = currentSlug ? `/api/articles/${currentSlug}` : "/api/articles";
    const method = currentSlug ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error ?? response.statusText;

      if (!opts?.silent) toast.error(`Failed to save draft: ${message}`);
      setAutosaveStatus("error");
      return null;
    }

    const { article: savedArticle } = await response.json();
    if (!opts?.silent) toast.success("Article saved successfully!");

    // Keyed on `article` (the server-fetched prop), not `currentSlug`: once
    // a background autosave has created the doc, `currentSlug` is already
    // truthy on every later call (including manual ones), but the browser
    // is still sitting on .../articles/new until a redirect actually runs.
    // A manual save/publish after that point must still redirect — it's
    // just no longer the call that creates the doc (autosave already did).
    if (!article) {
      if (opts?.redirectOnCreate ?? true) {
        router.push(`/staff/articles/${savedArticle.slug}`);
        router.refresh();
      } else if (!createdSlug) {
        setCreatedSlug(savedArticle.slug);
      }
    }

    isDirtyRef.current = false;
    setAutosaveStatus("saved");
    setLastSavedAt(new Date());

    return savedArticle.slug;
  };

  const saveDraft = async () => {
    if (!editor || isBusy) return;

    // Read editor.isEmpty directly here, not the isBodyEmpty snapshot below:
    // useEditorState's snapshot only recomputes on a transaction, so an
    // already-published article opened and acted on without ever being
    // edited (no transaction fires) would still read its stale initial
    // value. editor.isEmpty is a live getter — always correct at click time.
    const errors = getFieldErrors({ title, isBodyEmpty: editor.isEmpty, authorId });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await persistDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const runAutosave = async () => {
    if (!editor || isBusy || !isDirtyRef.current) return;

    setIsAutosaving(true);
    setAutosaveStatus("saving");
    try {
      await persistDraft({ redirectOnCreate: false, silent: true });
    } finally {
      setIsAutosaving(false);
    }
  };

  // persistDraft/runAutosave read state (title, dek, ...) via closure, so
  // the interval/visibilitychange effects below can't capture them once and
  // depend on `[]` — they'd keep calling a stale version between whatever
  // renders their own dep array happens to re-run on. Routing every tick
  // through this ref (kept current on every render) means the effects
  // themselves can mount once and still always invoke the latest closure.
  const runAutosaveRef = useRef(runAutosave);
  useEffect(() => {
    runAutosaveRef.current = runAutosave;
  });

  const STATUS_TRANSITION_LABEL: Record<"publish" | "unpublish" | "archive", string> = {
    publish: "published",
    unpublish: "unpublished",
    archive: "archived",
  };

  const applyStatusTransition = async (
    action: "publish" | "unpublish" | "archive",
  ) => {
    if (!editor || isBusy) return;

    // Read editor.isEmpty directly here, not the isBodyEmpty snapshot below:
    // useEditorState's snapshot only recomputes on a transaction, so an
    // already-published article opened and acted on without ever being
    // edited (no transaction fires) would still read its stale initial
    // value. editor.isEmpty is a live getter — always correct at click time.
    const errors = getFieldErrors({ title, isBodyEmpty: editor.isEmpty, authorId });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Fix the highlighted fields before saving.");
      return;
    }

    setIsSaving(true);

    try {
      const slug = await persistDraft();
      if (!slug) return;

      const response = await fetch(`/api/articles/${slug}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error ?? response.statusText;

        toast.error(`Failed to ${action} article: ${message}`);
        return;
      }

      const { article: updatedArticle } = await response.json();
      toast.success(`Article ${STATUS_TRANSITION_LABEL[action]} successfully!`);
      setStatus(updatedArticle.status);
      if (action === "unpublish") setPublishAt(null);
    } finally {
      setIsSaving(false);
    }
  };

  const publishDraft = () => applyStatusTransition("publish");
  const unpublishDraft = () => applyStatusTransition("unpublish");
  const archiveDraft = () => applyStatusTransition("archive");

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

  useEffect(() => {
    const timer = setInterval(() => {
      void runAutosaveRef.current();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const flush = () => {
      if (document.hidden) void runAutosaveRef.current();
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
        <Link
          href="/staff/articles"
          onClick={() => {
            if (isDirtyRef.current && !isBusy) void runAutosave();
          }}
        >
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
          <span
            className={cn("size-1.5 rounded-full", {
              "bg-success": autosaveStatus === "saved",
              "bg-muted-foreground": autosaveStatus === "idle",
              "bg-warning animate-pulse": autosaveStatus === "saving",
              "bg-destructive": autosaveStatus === "error",
            })}
          />
          {autosaveStatus === "saving" && "Saving…"}
          {autosaveStatus === "saved" &&
            (lastSavedAt
              ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
              : "Saved")}
          {autosaveStatus === "error" && "Autosave failed"}
          {autosaveStatus === "idle" && "Not saved yet"}
        </div>
        {status !== "Archived" && (
          <Button
            type="button"
            variant="destructive"
            onClick={archiveDraft}
            disabled={isBusy}
          >
            <Archive /> Archive
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={saveDraft}
          disabled={isBusy}
        >
          <FileText />{" "}
          {isSaving
            ? "Saving…"
            : status === "Published" || status === "Archived"
              ? "Save"
              : "Save draft"}
        </Button>
        {status === "Published" && (
          <Button
            type="button"
            variant="secondary"
            onClick={unpublishDraft}
            disabled={isBusy}
          >
            <Undo2 /> Unpublish
          </Button>
        )}
        {status !== "Published" && (
          <Button
            type="button"
            onClick={hasPendingSchedule ? saveDraft : publishDraft}
            disabled={isBusy}
          >
            {hasPendingSchedule
              ? "Schedule Publish"
              : status === "Archived"
                ? "Republish"
                : "Publish"}{" "}
            <ArrowRight />
          </Button>
        )}
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
              className={cn(
                "font-display mb-1 text-3xl leading-tight font-extrabold tracking-tight text-foreground outline-none sm:text-4xl",
                fieldErrors.title && !title.trim() && "ring-1 ring-destructive",
              )}
            >
              {title || "Sample Title"}
            </h1>
            <p className="mb-4 h-4 text-xs text-destructive">
              {fieldErrors.title && !title.trim() ? fieldErrors.title : ""}
            </p>

            <textarea
              value={dek}
              onChange={(e) => setDek(e.target.value)}
              placeholder="Write a one- or two-sentence excerpt…"
              rows={2}
              className="mb-5 w-full resize-none border-0 bg-transparent text-lg leading-7 text-text-secondary outline-none placeholder:text-muted-foreground"
            />

            <EditorContent editor={editor} />
            {fieldErrors.body && isBodyEmpty && (
              <p className="mt-2 text-xs text-destructive">{fieldErrors.body}</p>
            )}
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
            {fieldErrors.authorId && !authorId && (
              <p className="text-xs text-destructive">{fieldErrors.authorId}</p>
            )}
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
                    variant="outline"
                    disabled={isUploadingCover}
                    onClick={() => setLibraryOpen(true)}
                  >
                    <Images /> Library
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
                  {pendingCoverFile && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-1"
                      disabled={isUploadingCover || !coverImageAlt.trim()}
                      onClick={() => void uploadCoverFile(pendingCoverFile)}
                    >
                      {isUploadingCover ? "Uploading…" : "Attach cover"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-utility text-xs font-semibold text-muted-foreground">
                    Alt text <span className="text-destructive">*</span>
                  </span>
                  <Input
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                <CoverDropzone
                  compact
                  isUploading={isUploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  onDrop={handleCoverFile}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setLibraryOpen(true)}
                >
                  <Images /> Choose from library
                </Button>
              </div>
            )}
            <MediaLibraryPicker
              open={libraryOpen}
              onOpenChange={setLibraryOpen}
              onSelect={attachLibraryAsset}
            />
          </div>

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
              onCheckedChange={setFeatured}
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
