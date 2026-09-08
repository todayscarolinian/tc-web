import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";
import { uploadMediaFile } from "@/src/lib/upload-media";
import type { MediaAssetDTO } from "@/src/entities/media/core/media.domain";

export function useCoverImage(params: {
  initialUrl: string;
  initialAssetId: string;
  initialAlt: string;
}) {
  const [coverImageUrl, setCoverImageUrl] = useState(params.initialUrl);
  const [coverImageAssetId, setCoverImageAssetId] = useState(
    params.initialAssetId,
  );
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImageAlt, setCoverImageAlt] = useState(params.initialAlt);
  
  const coverUploadIdRef = useRef(0);

  useEffect(() => {
    if (!previewBlobUrl) return;
    return () => URL.revokeObjectURL(previewBlobUrl);
  }, [previewBlobUrl]);

  const uploadCoverFile = async (file: File) => {
    // Captures this call's id before any await — see coverUploadIdRef above.
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

  return {
    coverImageUrl,
    coverImageAssetId,
    coverImageAlt,
    setCoverImageAlt,
    previewBlobUrl,
    pendingCoverFile,
    isUploadingCover,
    handleCoverFile,
    uploadCoverFile,
    attachLibraryAsset,
    removeCoverImage,
  };
}
