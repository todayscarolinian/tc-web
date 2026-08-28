import { defineConfig } from "vitest/config";
import path from "node:path";

// Scoped to src/entities/ only — its core/usecase/services layers are
// framework-free by design. No React/Next test runner (Playwright/RTL) is
// added here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/entities/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
