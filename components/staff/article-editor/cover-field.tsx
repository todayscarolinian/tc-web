"use client";

import { useRef, useState } from "react";

import { Images, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PhotoPlaceholder } from "@/components/site/photo-placeholder";
import { CoverDropzone } from "@/components/staff/cover-dropzone";
import { MediaLibraryPicker } from "@/components/staff/media-library-picker";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

export type CoverImageFieldProps = {
  coverImageUrl: string;
  coverImageAlt: string;
  onAltChange: (alt: string) => void;
  previewBlobUrl: string | null;
  pendingCoverFile: File | null;
  isUploadingCover: boolean;
  onFileSelected: (file: File) => void;
  onRetryUpload: (file: File) => void;
  onRemove: () => void;
  onAttachLibraryAsset: (asset: MediaAssetDTO) => void;
};

export function CoverImageField({
  coverImageUrl,
  coverImageAlt,
  onAltChange,
  previewBlobUrl,
  pendingCoverFile,
  isUploadingCover,
  onFileSelected,
  onRetryUpload,
  onRemove,
  onAttachLibraryAsset,
}: CoverImageFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const displayCoverUrl = previewBlobUrl ?? coverImageUrl;
  const hasCover = Boolean(displayCoverUrl);

  return (
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
          if (file) onFileSelected(file);
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
              onClick={onRemove}
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
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
            {pendingCoverFile && (
              <Button
                type="button"
                size="sm"
                className="mt-1"
                disabled={isUploadingCover || !coverImageAlt.trim()}
                onClick={() => void onRetryUpload(pendingCoverFile)}
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
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
          <CoverDropzone
            compact
            isUploading={isUploadingCover}
            onClick={() => coverInputRef.current?.click()}
            onDrop={onFileSelected}
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
        onSelect={onAttachLibraryAsset}
      />
    </div>
  );
}
