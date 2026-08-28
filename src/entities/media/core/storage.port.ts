export interface StoragePort {
  /**
   * Writes a file's bytes and returns its public URL. Callers are
   * responsible for gating who may call this — this port has no concept
   * of staff/auth, see app/api/media/upload/route.ts.
   */
  upload(params: {
    storagePath: string;
    contentType: string;
    data: Buffer;
  }): Promise<{ publicUrl: string }>;

  /**
   * Deletes an object. Silently no-ops if it's already gone — callers use
   * this for best-effort cleanup of superseded uploads, not as a source of
   * truth for whether the object existed.
   */
  delete(params: { storagePath: string }): Promise<void>;
}
