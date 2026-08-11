"use server";

import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError, type AccessError } from "@/src/lib/herald/require-access";
import { mediaStorageService } from "@/src/infrastructure/media/media.composition";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB — generous for editorial photos, cheap on the 5GB free Storage tier (ADR-007)

type RequestMediaUploadUrlInput = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  folder: string;
};

type RequestMediaUploadUrlResult =
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

  if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
    return { error: "INVALID_FILE", message: `Unsupported file type: ${input.contentType}` };
  }
  if (input.sizeBytes > MAX_SIZE_BYTES) {
    return { error: "INVALID_FILE", message: "File exceeds the 10MB upload limit." };
  }

  const storagePath = `media/${sanitizeSegment(input.folder)}/${crypto.randomUUID()}-${sanitizeSegment(input.fileName)}`;

  const { uploadUrl, publicUrl } = await mediaStorageService.createSignedUploadUrl({
    storagePath,
    contentType: input.contentType,
  });

  return { uploadUrl, storagePath, publicUrl };
}
