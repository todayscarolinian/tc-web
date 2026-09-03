import type { StoragePort } from "@/src/entities/media/core/storage.port";
import type { MediaRepository } from "@/src/entities/media/core/media.repository";
import { FirebaseStorageAdapter } from "@/src/entities/media/infrastructure/firebase-storage.adapter";
import { FirestoreMediaRepository } from "@/src/entities/media/infrastructure/firestore-media.repository";
import { createMediaService } from "@/src/entities/media/services/media.service";

// Composition root for the media slice — the only place that knows the
// concrete Storage + Firestore adapters, mirroring article.service.factory.ts.
const storagePort: StoragePort = new FirebaseStorageAdapter();
const mediaRepository: MediaRepository = new FirestoreMediaRepository();

export const mediaStorageService = {
  upload: (params: { storagePath: string; contentType: string; data: Buffer }) =>
    storagePort.upload(params),
  delete: (params: { storagePath: string }) => storagePort.delete(params),
};

export const mediaService = createMediaService(mediaRepository, storagePort);
