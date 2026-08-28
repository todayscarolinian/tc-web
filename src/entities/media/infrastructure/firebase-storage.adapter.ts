import "server-only";
import type { StoragePort } from "@/src/entities/media/core/storage.port";
import { bucket } from "@/src/lib/firebase/admin";

export class FirebaseStorageAdapter implements StoragePort {
  async upload({
    storagePath,
    contentType,
    data,
  }: {
    storagePath: string;
    contentType: string;
    data: Buffer;
  }): Promise<{ publicUrl: string }> {
    await bucket.file(storagePath).save(data, { metadata: { contentType } });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

    return { publicUrl };
  }

  async delete({ storagePath }: { storagePath: string }): Promise<void> {
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
  }
}
