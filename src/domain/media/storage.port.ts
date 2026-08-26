export interface StoragePort {
  /**
   * Issues a short-lived signed URL a client can PUT a file to directly.
   * Callers are responsible for gating who may call this — this port has
   * no concept of staff/auth, see actions/media.actions.ts.
   */
  createSignedUploadUrl(params: {
    storagePath: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; publicUrl: string }>;

  /**
   * Deletes an object. Silently no-ops if it's already gone — callers use
   * this for best-effort cleanup of superseded uploads, not as a source of
   * truth for whether the object existed.
   */
  delete(params: { storagePath: string }): Promise<void>;
}
