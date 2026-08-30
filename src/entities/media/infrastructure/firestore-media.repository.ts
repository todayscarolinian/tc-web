import { Timestamp, type DocumentData } from "firebase-admin/firestore";
import { db } from "@/src/lib/firebase/admin";
import type { MediaRepository } from "@/src/entities/media/core/media.repository";
import type { MediaAsset } from "@/src/entities/media/core/media.domain";

const MEDIA_COLLECTION = "mediaAssets";

function toDomainMedia(doc: { id: string; data: () => DocumentData }): MediaAsset {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    folder: data.folder,
    tagSlugs: Array.isArray(data.tagSlugs) ? data.tagSlugs : [],
    storagePath: data.storagePath,
    url: data.url,
    contentType: data.contentType,
    sizeBytes: data.sizeBytes,
    width: data.width,
    height: data.height,
    altText: data.altText ?? "",
    uploadedBy: data.uploadedBy,
    uploadedByName: data.uploadedByName ?? "",
    uploadedAt: (data.uploadedAt as Timestamp).toDate(),
    iconKey: data.iconKey ?? "image",
  };
}

function toFirestore(asset: MediaAsset): DocumentData {
  return {
    name: asset.name,
    folder: asset.folder,
    tagSlugs: asset.tagSlugs,
    storagePath: asset.storagePath,
    url: asset.url,
    contentType: asset.contentType,
    sizeBytes: asset.sizeBytes,
    width: asset.width,
    height: asset.height,
    altText: asset.altText,
    uploadedBy: asset.uploadedBy,
    uploadedByName: asset.uploadedByName,
    uploadedAt: Timestamp.fromDate(asset.uploadedAt),
    iconKey: asset.iconKey,
  };
}

export class FirestoreMediaRepository implements MediaRepository {
  async listAll(): Promise<MediaAsset[]> {
    const snap = await db
      .collection(MEDIA_COLLECTION)
      .orderBy("uploadedAt", "desc")
      .get();
    return snap.docs.map(toDomainMedia);
  }

  async findById(id: string): Promise<MediaAsset | null> {
    const snap = await db.collection(MEDIA_COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return toDomainMedia({ id: snap.id, data: () => snap.data() as DocumentData });
  }

  async create(asset: Omit<MediaAsset, "id">): Promise<MediaAsset> {
    const ref = db.collection(MEDIA_COLLECTION).doc();
    const created: MediaAsset = { ...asset, id: ref.id };
    await ref.set(toFirestore(created));
    return created;
  }

  async delete(id: string): Promise<void> {
    await db.collection(MEDIA_COLLECTION).doc(id).delete();
  }
}
