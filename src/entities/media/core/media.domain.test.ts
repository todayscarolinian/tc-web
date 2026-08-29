import { describe, expect, it } from "vitest";
import {
  assertValidMediaAsset,
  canAttachMedia,
  type MediaAsset,
} from "./media.domain";

function makeAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: "asset-1",
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
    uploadedAt: new Date("2026-06-24"),
    iconKey: "covers",
    ...overrides,
  };
}

describe("assertValidMediaAsset", () => {
  it("throws when name is empty", () => {
    expect(() => assertValidMediaAsset(makeAsset({ name: "  " }))).toThrow(
      "MediaAsset.name must not be empty",
    );
  });

  it("throws when url is empty", () => {
    expect(() => assertValidMediaAsset(makeAsset({ url: "" }))).toThrow(
      "MediaAsset.url must not be empty",
    );
  });

  it("throws when storagePath is empty", () => {
    expect(() => assertValidMediaAsset(makeAsset({ storagePath: "" }))).toThrow(
      "MediaAsset.storagePath must not be empty",
    );
  });

  it("allows empty alt text on the stored record", () => {
    const asset = makeAsset({ altText: "" });
    expect(assertValidMediaAsset(asset)).toBe(asset);
  });

  it("returns the same asset unchanged when valid", () => {
    const asset = makeAsset();
    expect(assertValidMediaAsset(asset)).toBe(asset);
  });
});

describe("canAttachMedia", () => {
  it("is false when alt text is missing or blank", () => {
    expect(canAttachMedia(makeAsset({ altText: "" }))).toBe(false);
    expect(canAttachMedia(makeAsset({ altText: "   " }))).toBe(false);
  });

  it("is true when alt text is set", () => {
    expect(canAttachMedia(makeAsset())).toBe(true);
  });
});
