"use client";

import Link from "next/link";

import { Archive, ArrowLeft, ArrowRight, FileText, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

import type { ArticleStatus } from "@/src/entities/article/core/article.types";
import type { AutosaveStatus } from "./use-autosave";

export function ArticleEditorHeader({
  title,
  onTitleChange,
  onBack,
  autosaveStatus,
  lastSavedAt,
  status,
  hasPendingSchedule,
  isBusy,
  isSaving,
  onArchive,
  onSaveDraft,
  onPublish,
  onUnpublish,
}: {
  title: string;
  onTitleChange: (title: string) => void;
  onBack: () => void;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  status: ArticleStatus;
  hasPendingSchedule: boolean;
  isBusy: boolean;
  isSaving: boolean;
  onArchive: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
      <Link href="/staff/articles" onClick={onBack}>
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
        onChange={(e) => onTitleChange(e.target.value)}
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
          onClick={onArchive}
          disabled={isBusy}
        >
          <Archive /> Archive
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={onSaveDraft}
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
          onClick={onUnpublish}
          disabled={isBusy}
        >
          <Undo2 /> Unpublish
        </Button>
      )}
      {status !== "Published" && (
        <Button
          type="button"
          onClick={hasPendingSchedule ? onSaveDraft : onPublish}
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
  );
}
