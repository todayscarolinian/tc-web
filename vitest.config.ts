import { defineConfig } from "vitest/config";
import path from "node:path";

// Scoped to domain/ and application/ only — those layers are framework-free
// by design. No React/Next test runner (Playwright/RTL) is added here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["domain/**/*.test.ts", "application/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
