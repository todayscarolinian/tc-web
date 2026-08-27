import "server-only";
import type { StoragePort } from "@/src/domain/media/storage.port";
import { bucket } from "@/src/lib/firebase/admin";

const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

export class FirebaseStorageAdapter implements StoragePort {
  async createSignedUploadUrl({
    storagePath,
    contentType,
  }: {
    storagePath: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const file = bucket.file(storagePath);

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + SIGNED_URL_TTL_MS,
      contentType,
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

    return { uploadUrl, publicUrl };
  }

  async delete({ storagePath }: { storagePath: string }): Promise<void> {
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
  }
}
