import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Explicit scope: the event/restore core. Options DOM and translations
      // require browser tests and are not represented by this percentage.
      include: ["src/{background,group,discard,config,advanced-config}.ts"],
      reporter: ["text", "html", "lcov", "json-summary"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 }
    }
  }
});
