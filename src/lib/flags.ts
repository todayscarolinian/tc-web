export const ENABLE_SUBSCRIPTION = false;

// Deferred post-MVP, see docs/adr/adr-003-first-party-analytics.md. Reads an
// env var (unlike the flag above) so it can flip in prod without a redeploy.
export const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS === "true";
