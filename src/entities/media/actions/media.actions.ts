"use server";

import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError, type AccessError } from "@/src/lib/herald/require-access";
import { mediaService } from "@/src/entities/media/services/media.service.factory";
import { articleService } from "@/src/entities/article/services/article.service.factory";

export type DeleteMediaAssetResult =
  | { ok: true }
  | AccessError
  | { error: "NOT_FOUND" | "IN_USE"; message: string };

export async function deleteMediaAsset(input: {
  id: string;
}): Promise<DeleteMediaAssetResult> {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) return access;

  if (!input.id.trim()) {
    return { error: "NOT_FOUND", message: "Media asset not found." };
  }

  const articles = await articleService.staff.listAll();
  const inUse = articles.some((article) => article.coverImageAssetId === input.id);
  if (inUse) {
    return {
      error: "IN_USE",
      message: "This file is used as a cover image and cannot be deleted.",
    };
  }

  try {
    await mediaService.delete(input.id);
    return { ok: true };
  } catch (error) {
    const message = (error as Error).message;
    if (message === "Media asset not found") {
      return { error: "NOT_FOUND", message };
    }
    throw error;
  }
}
