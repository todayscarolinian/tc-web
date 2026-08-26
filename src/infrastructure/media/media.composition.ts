import type { StoragePort } from "@/src/domain/media/storage.port";
import { FirebaseStorageAdapter } from "./firebase-storage.adapter";

// Composition root for the media/storage slice — the only place that knows
// the concrete adapter, mirroring infrastructure/article/article.composition.ts.
const storagePort: StoragePort = new FirebaseStorageAdapter();

export const mediaStorageService = {
  createSignedUploadUrl: (params: { storagePath: string; contentType: string }) =>
    storagePort.createSignedUploadUrl(params),
  delete: (params: { storagePath: string }) => storagePort.delete(params),
};
