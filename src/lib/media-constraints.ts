export const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

// Generous for editorial photos, cheap on the 5GB free Storage tier (ADR-007).
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
