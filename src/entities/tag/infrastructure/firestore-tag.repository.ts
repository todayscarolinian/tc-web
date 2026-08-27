import {
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { db } from "@/src/lib/firebase/admin";
import type { TagRepository } from "@/src/entities/tag/core/tag.repository";
import type { Tag } from "@/src/entities/tag/core/tag.domain";
import slugify from "slugify";
import { assertValidTag } from "@/src/entities/tag/core/tag.domain";

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

  async findOrCreate(name: string): Promise<Tag> {
    const ref = db.collection(TAGS_COLLECTION).doc(slugify(name, { lower: true, strict: true }));
    return db.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists) {
        return toDomainTag(existing as QueryDocumentSnapshot<DocumentData>);
      }
      const tag = assertValidTag({
        name,
        slug: ref.id,
        description: "",
        createdAt: new Date(),
      });
      tx.create(ref, { ...tag, createdAt: Timestamp.fromDate(tag.createdAt) });
      return tag;
    });
  }

}
