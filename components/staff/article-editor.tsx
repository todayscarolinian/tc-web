"use client";

import "@/src/lib/tiptap-styles.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Figure, Figcaption, ImageResize } from "tiptap-extension-resize-image";

import { toast } from "sonner";

import type { UserProfile } from "@/src/lib/herald/types";

import type { Article } from "@/src/entities/article/core/article.domain";
import type { ArticleStatus } from "@/src/entities/article/core/article.types";

import { SECTIONS, getSectionName } from "@/src/entities/section/infrastructure/static-section.repository";
import type { SectionName } from "@/src/entities/section/core/section.types";
import { cn } from "@/src/lib/utils";

import { EditorToolbar } from "./editor-toolbar";
import { ArticleEditorHeader } from "./article-editor/header";
import { ArticleEditorSidebar } from "./article-editor/sidebar";
import { useAutosave } from "./article-editor/use-autosave";
import { useCoverImage } from "./article-editor/use-cover-image";

const extensions = [
  StarterKit,
  TextStyleKit,
  ImageResize.configure({
    resize: false,
  }),
  Figure,
  Figcaption,
];

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

  const [publishAt, setPublishAt] = useState<Date | null>(
    article?.publishAt ?? null,
  );
  const [featured, setFeatured] = useState(Boolean(article?.featured));

  const [isSaving, setIsSaving] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const isBusy = isSaving || isAutosaving;

  // Slug of a new article created by a background autosave. Kept out of the
  // URL (see persistDraft) so an in-flight autosave can't remount this
  // component out from under the user the way router.push/refresh would.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const coverImage = useCoverImage({
    initialUrl: article?.coverImageUrl ?? "",
    initialAssetId: article?.coverImageAssetId ?? "",
    initialAlt: article?.coverImageAlt ?? "",
  });

  const autosave = useAutosave({
    dirtyWatch: [
      title,
      section,
      authorId,
      dek,
      tags,
      coverImage.coverImageUrl,
      coverImage.coverImageAssetId,
      coverImage.coverImageAlt,
      publishAt,
      featured,
    ],
    initialLastSavedAt: article?.updatedAt ?? null,
  });

  const selectedSection = SECTIONS.find((s) => s.name === section);
  const hasPendingSchedule =
    (status === "Draft" || status === "Scheduled") && publishAt !== null;

  const editor = useEditor({
    extensions,
    content: article?.body ?? "Write your news content here…",
    onUpdate: () => {
      autosave.markDirty();
    },
  });

  // editor.isEmpty read directly wouldn't re-render as the user types (onUpdate
  // above only touches a ref, deliberately, to avoid a re-render on every
  // keystroke) — the inline body error needs to react to content changing, so
  // it subscribes via useEditorState instead, same pattern as
  // editor-toolbar-state.tsx.
  const isBodyEmpty = useEditorState({
    editor,
    selector: ({ editor }) => !editor || editor.isEmpty,
  });

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
      coverImageUrl: coverImage.coverImageUrl,
      coverImageAssetId: coverImage.coverImageAssetId || "",
      coverImageAlt: coverImage.coverImageAlt,
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
      autosave.setAutosaveStatus("error");
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

    autosave.markClean();
    autosave.setAutosaveStatus("saved");
    autosave.setLastSavedAt(new Date());

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
    if (!editor || isBusy || !autosave.isDirty()) return;

    setIsAutosaving(true);
    autosave.setAutosaveStatus("saving");
    try {
      await persistDraft({ redirectOnCreate: false, silent: true });
    } finally {
      setIsAutosaving(false);
    }
  };

  // runAutosave must stay here (it closes over all sidebar state), so it's
  // handed to the autosave hook via setRunAutosave on every render — see
  // use-autosave.ts for why.
  useEffect(() => {
    autosave.setRunAutosave(runAutosave);
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

    // Read editor.isEmpty directly, not the isBodyEmpty snapshot — see saveDraft.
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

  return (
    <div className="flex flex-1 flex-col">
      <ArticleEditorHeader
        title={title}
        onTitleChange={setTitle}
        onBack={() => {
          if (autosave.isDirty() && !isBusy) void runAutosave();
        }}
        autosaveStatus={autosave.autosaveStatus}
        lastSavedAt={autosave.lastSavedAt}
        status={status}
        hasPendingSchedule={hasPendingSchedule}
        isBusy={isBusy}
        isSaving={isSaving}
        onArchive={archiveDraft}
        onSaveDraft={saveDraft}
        onPublish={publishDraft}
        onUnpublish={unpublishDraft}
      />

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

        <ArticleEditorSidebar
          status={status}
          onStatusChange={setStatus}
          section={section}
          onSectionChange={setSection}
          authors={authors}
          authorId={authorId}
          onAuthorChange={setAuthorId}
          authorError={fieldErrors.authorId}
          tags={tags}
          onTagsChange={setTags}
          coverImage={{
            coverImageUrl: coverImage.coverImageUrl,
            coverImageAlt: coverImage.coverImageAlt,
            onAltChange: coverImage.setCoverImageAlt,
            previewBlobUrl: coverImage.previewBlobUrl,
            pendingCoverFile: coverImage.pendingCoverFile,
            isUploadingCover: coverImage.isUploadingCover,
            onFileSelected: coverImage.handleCoverFile,
            onRetryUpload: coverImage.uploadCoverFile,
            onRemove: coverImage.removeCoverImage,
            onAttachLibraryAsset: coverImage.attachLibraryAsset,
          }}
          featured={featured}
          onFeaturedChange={setFeatured}
          publishAt={publishAt}
          onPublishAtChange={setPublishAt}
        />
      </div>
    </div>
  );
}
