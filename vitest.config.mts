import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.{ts,mts,mjs}"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts", "src/application/**/*.ts"],
      thresholds: {
        "src/domain/**": { branches: 80, lines: 80 },
        "src/application/**": { branches: 80, lines: 80 }
      }
    }
  }
});
