import type { StoragePort } from "@/src/entities/media/core/storage.port";
import { FirebaseStorageAdapter } from "@/src/entities/media/infrastructure/firebase-storage.adapter";

// Composition root for the media/storage slice — the only place that knows
// the concrete adapter, mirroring entities/article/services/article.service.factory.ts.
const storagePort: StoragePort = new FirebaseStorageAdapter();

export const mediaStorageService = {
  createSignedUploadUrl: (params: { storagePath: string; contentType: string }) =>
    storagePort.createSignedUploadUrl(params),
  delete: (params: { storagePath: string }) => storagePort.delete(params),
};
