/** Línea base local de mutación para F2; no se ejecuta en CI hasta F13. */
export default {
  mutate: ["src/domain/**/*.ts"],
  plugins: ["@stryker-mutator/vitest-runner"],
  testRunner: "vitest",
  vitest: { configFile: "vitest.config.mts" },
  coverageAnalysis: "perTest",
  concurrency: 2,
  reporters: ["clear-text", "json"],
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  thresholds: { high: 80, low: 60, break: 0 }
};
