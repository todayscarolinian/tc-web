"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Images, Trash2, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/staff/page-header";
import { MediaGrid } from "@/components/staff/media-grid";
import { CoverDropzone } from "@/components/staff/cover-dropzone";
import { TagInput } from "@/components/staff/tag-input";
import { EmptyState } from "@/components/site/empty-state";
import { MEDIA_FOLDERS } from "@/src/lib/staff-data";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";
import { downloadMediaFile } from "@/src/lib/media-format";
import { uploadMediaFile } from "@/src/lib/upload-media";
import { deleteMediaAsset } from "@/src/entities/media/actions/media.actions";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";
import { getTagsAction } from "@/src/entities/tag/actions/tag.action";
import type { Tag } from "@/src/entities/tag/core/tag.domain";
import { cn } from "@/src/lib/utils";

const UPLOAD_FOLDERS = MEDIA_FOLDERS.filter((folder) => folder !== "All");

export function MediaView({ initialAssets }: { initialAssets: MediaAssetDTO[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialAssets);
  const [folder, setFolder] = useState<(typeof MEDIA_FOLDERS)[number]>("All");
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploadFolder, setUploadFolder] = useState<(typeof UPLOAD_FOLDERS)[number]>("Photos");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTagsAction()
      .then(setAllTags)
      .catch(() => setAllTags([]));
  }, []);

  const availableTags = useMemo(() => {
    const usedSlugs = new Set(items.flatMap((item) => item.tagSlugs));
    return allTags.filter((t) => usedSlugs.has(t.slug));
  }, [allTags, items]);

  const filtered = useMemo(
    () =>
      items.filter((media) => {
        if (folder !== "All" && media.folder !== folder) return false;
        if (tag && !media.tagSlugs.includes(tag)) return false;
        return true;
      }),
    [items, folder, tag],
  );

  const selectedItems = items.filter((media) => selected.has(media.id));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetUploadForm() {
    setPendingFile(null);
    setAltText("");
    setUploadTags([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function acceptFile(file: File) {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.type)) {
      toast.error(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("File exceeds the 2MB upload limit.");
      return;
    }
    setPendingFile(file);
  }

  async function handleUpload() {
    if (!pendingFile) return;
    if (!altText.trim()) {
      toast.error("Alt text is required before this file can be uploaded.");
      return;
    }

    setIsUploading(true);
    try {
      const { asset } = await uploadMediaFile({
        file: pendingFile,
        folder: uploadFolder,
        altText: altText.trim(),
        tagSlugs: uploadTags,
      });
      setItems((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      resetUploadForm();
      toast.success("Uploaded to the media library.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload() {
    for (const item of selectedItems) {
      await downloadMediaFile(item.url, item.name);
    }
  }

  async function handleDelete() {
    if (selectedItems.length === 0) return;
    setIsDeleting(true);
    try {
      const remaining = new Set(selected);
      for (const item of selectedItems) {
        const result = await deleteMediaAsset({ id: item.id });
        if ("ok" in result) {
          remaining.delete(item.id);
          setItems((current) => current.filter((asset) => asset.id !== item.id));
        } else {
          toast.error(result.message);
        }
      }
      setSelected(remaining);
      setConfirmDelete(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Media"
        subtitle={`${filtered.length} of ${items.length} files`}
        actions={
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon /> Upload
          </Button>
        }
      />

      <div className="flex flex-col gap-5 p-5 sm:p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) acceptFile(file);
          }}
        />

        <CoverDropzone
          title="Drag photos here to upload"
          description="or click to browse · JPG, PNG, WebP, GIF up to 2 MB"
          isUploading={isUploading}
          onClick={() => fileInputRef.current?.click()}
          onDrop={acceptFile}
        />

        {pendingFile && (
          <div className="flex flex-col gap-4 rounded-sm bg-card p-4 ring-1 ring-border">
            <div>
              <p className="font-ui text-sm font-bold text-foreground">{pendingFile.name}</p>
              <p className="font-utility text-xs text-muted-foreground">
                Add alt text before this file can be stored in the library.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-alt">
                  Alt text <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="media-alt"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-folder">Folder</Label>
                <Select
                  value={uploadFolder}
                  onValueChange={(value) =>
                    setUploadFolder(value as (typeof UPLOAD_FOLDERS)[number])
                  }
                >
                  <SelectTrigger id="media-folder" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UPLOAD_FOLDERS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Tagssasad
              </span>
              <TagInput tags={uploadTags} onChange={setUploadTags} />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => void handleUpload()} disabled={isUploading}>
                {isUploading ? "Uploading…" : "Upload to library"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetUploadForm} disabled={isUploading}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <aside className="flex flex-col gap-6">
            <div>
              <p className="font-utility mb-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Folders
              </p>
              <div className="flex flex-col gap-0.5">
                {MEDIA_FOLDERS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFolder(name)}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-left font-ui text-sm font-semibold text-text-secondary hover:bg-muted hover:text-foreground",
                      folder === name && "bg-brand/10 text-brand-strong hover:text-brand-strong",
                    )}
                  >
                    <Images size={15} />
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-utility mb-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setTag((current) => (current === t.slug ? null : t.slug))}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-utility text-xs font-semibold text-text-secondary ring-1 ring-border hover:text-foreground",
                      tag === t.slug && "bg-brand text-primary-foreground ring-0",
                    )}
                  >
                    {t.name}
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
                  onClick={() => void handleDownload()}
                >
                  <Download /> Download
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                  onClick={() => setConfirmDelete(true)}
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
                title={items.length === 0 ? "No files in the library yet" : "No files match this filter"}
                description={
                  items.length === 0
                    ? "Upload a photo to start building the shared media library."
                    : "Try a different folder or tag, or clear the filter."
                }
              />
            ) : (
              <MediaGrid items={filtered} selectedIds={selected} onToggle={toggle} />
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size === 1 ? "this file" : `${selected.size} files`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the file from the library and Firebase Storage. Files still used by an
              article — as a cover or inline in the body — cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
