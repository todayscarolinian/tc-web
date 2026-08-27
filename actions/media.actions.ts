"use server";

import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError, type AccessError } from "@/src/lib/herald/require-access";
import { mediaStorageService } from "@/src/entities/media/services/media.service.factory";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";

type RequestMediaUploadUrlInput = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  folder: string;
};

export type RequestMediaUploadUrlResult =
  | { uploadUrl: string; storagePath: string; publicUrl: string }
  | AccessError
  | { error: "INVALID_FILE"; message: string };

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";
}

export async function requestMediaUploadUrl(
  input: RequestMediaUploadUrlInput
): Promise<RequestMediaUploadUrlResult> {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) return access;

  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(input.contentType)) {
    return { error: "INVALID_FILE", message: `Unsupported file type: ${input.contentType}` };
  }
  if (input.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return { error: "INVALID_FILE", message: "File exceeds the 10MB upload limit." };
  }

  const storagePath = `media/${sanitizeSegment(input.folder)}/${crypto.randomUUID()}-${sanitizeSegment(input.fileName)}`;

  const { uploadUrl, publicUrl } = await mediaStorageService.createSignedUploadUrl({
    storagePath,
    contentType: input.contentType,
  });

  return { uploadUrl, storagePath, publicUrl };
}

export type DeleteMediaAssetResult = { ok: true } | AccessError;

// Callers only ever have the public URL (it's what's stored on the article),
// not the storage path — parse it back out rather than widening the client
// contract to carry storagePath around just for cleanup.
function extractStoragePath(publicUrl: string): string | null {
  const match = publicUrl.match(/\/o\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function deleteMediaAsset(input: {
  publicUrl: string;
}): Promise<DeleteMediaAssetResult> {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) return access;

  const storagePath = extractStoragePath(input.publicUrl);
  if (!storagePath) return { ok: true };

  await mediaStorageService.delete({ storagePath });
  return { ok: true };
}
