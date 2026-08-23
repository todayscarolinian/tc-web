import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { db } from "@/src/infrastructure/firebase/admin";
import type { TagRepository } from "@/src/domain/tag/tag.repository";
import type { Tag } from "@/src/domain/tag/tag.entity";
import { assertValidTag } from "@/src/domain/tag/tag.entity";

const TAGS_COLLECTION = "tags";

function toDomainTag(doc: QueryDocumentSnapshot<DocumentData>): Tag {
  const data = doc.data();
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
  } as Tag;
}

export class FirestoreTagRepository implements TagRepository {
  async listAll(): Promise<Tag[]> {
    const snap = await db.collection(TAGS_COLLECTION).get();
    return snap.docs.map(toDomainTag);
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const doc = await db.collection(TAGS_COLLECTION).doc(slug).get();
    return doc.exists ? toDomainTag(doc as QueryDocumentSnapshot<DocumentData>) : null;
  }

  async create(tag: Tag): Promise<void> {
    assertValidTag(tag);
    await db
      .collection(TAGS_COLLECTION)
      .doc(tag.slug) // slug as doc ID — matches how articles use slug as identity
      .set({ ...tag, createdAt: Timestamp.fromDate(tag.createdAt) });
  }
}