"use server";

import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError, type AccessError } from "@/src/lib/herald/require-access";
import { mediaStorageService } from "@/src/entities/media/services/media.service.factory";

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
