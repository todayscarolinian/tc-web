import { describe, expect, it } from "vitest";
import type { StoragePort } from "@/src/entities/media/core/storage.port";
import type { MediaAssetInput } from "@/src/entities/media/core/media.domain";
import { InMemoryMediaRepository } from "@/src/entities/media/__tests__/fixtures/in-memory-media.repository";
import { createMediaService } from "@/src/entities/media/services/media.service";

class FakeStoragePort implements StoragePort {
  deleted: string[] = [];

  async upload(): Promise<{ publicUrl: string }> {
    return { publicUrl: "https://example.com/uploaded" };
  }

  async delete(params: { storagePath: string }): Promise<void> {
    this.deleted.push(params.storagePath);
  }
}

function makeInput(overrides: Partial<MediaAssetInput> = {}): MediaAssetInput {
  return {
    name: "hearing-gym-wide.jpg",
    folder: "Covers",
    tagSlugs: ["tuition"],
    storagePath: "media/covers/hearing-gym-wide.jpg",
    url: "https://example.com/hearing-gym-wide.jpg",
    contentType: "image/jpeg",
    sizeBytes: 4100,
    width: 4032,
    height: 2688,
    altText: "Students packed into the gym during the tuition hearing",
    uploadedBy: "herald-user-1",
    uploadedByName: "Maria Santos",
    uploadedAt: new Date("2026-06-24T12:00:00.000Z"),
    iconKey: "covers",
    ...overrides,
  };
}

describe("mediaService", () => {
  it("lists created assets newest first", async () => {
    const repo = new InMemoryMediaRepository();
    const storage = new FakeStoragePort();
    const service = createMediaService(repo, storage);

    const older = await service.create(
      makeInput({
        name: "older.jpg",
        storagePath: "media/covers/older.jpg",
        url: "https://example.com/older.jpg",
        uploadedAt: new Date("2026-06-20T12:00:00.000Z"),
      }),
    );
    const newer = await service.create(
      makeInput({
        name: "newer.jpg",
        storagePath: "media/covers/newer.jpg",
        url: "https://example.com/newer.jpg",
        uploadedAt: new Date("2026-06-24T12:00:00.000Z"),
      }),
    );

    const listed = await service.listAll();
    expect(listed.map((asset) => asset.id)).toEqual([newer.id, older.id]);
  });

  it("rejects a create with an empty name", async () => {
    const service = createMediaService(new InMemoryMediaRepository(), new FakeStoragePort());
    await expect(service.create(makeInput({ name: "  " }))).rejects.toThrow(
      "MediaAsset.name must not be empty",
    );
  });

  it("deletes the Firestore record and the Storage object", async () => {
    const repo = new InMemoryMediaRepository();
    const storage = new FakeStoragePort();
    const service = createMediaService(repo, storage);
    const created = await service.create(makeInput());

    await service.delete(created.id);

    expect(await service.listAll()).toEqual([]);
    expect(storage.deleted).toEqual([created.storagePath]);
  });

  it("throws when deleting an unknown id", async () => {
    const service = createMediaService(new InMemoryMediaRepository(), new FakeStoragePort());
    await expect(service.delete("missing")).rejects.toThrow("Media asset not found");
  });

  it("finds a created asset by id", async () => {
    const service = createMediaService(new InMemoryMediaRepository(), new FakeStoragePort());
    const created = await service.create(makeInput());

    expect(await service.findById(created.id)).toEqual(created);
  });

  it("returns null when findById can't find the asset", async () => {
    const service = createMediaService(new InMemoryMediaRepository(), new FakeStoragePort());
    expect(await service.findById("missing")).toBeNull();
  });
});
