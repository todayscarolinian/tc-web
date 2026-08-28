import type { StoragePort } from "@/src/entities/media/core/storage.port";
import { FirebaseStorageAdapter } from "@/src/entities/media/infrastructure/firebase-storage.adapter";

// Composition root for the media/storage slice — the only place that knows
// the concrete adapter, mirroring entities/article/services/article.service.factory.ts.
const storagePort: StoragePort = new FirebaseStorageAdapter();

export const mediaStorageService = {
  upload: (params: { storagePath: string; contentType: string; data: Buffer }) =>
    storagePort.upload(params),
  delete: (params: { storagePath: string }) => storagePort.delete(params),
};
