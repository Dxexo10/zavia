import { readFile } from "node:fs/promises";
import { test } from "vitest";
import assert from "node:assert/strict";

test("[RNF-048][RNF-062] el proyecto declara TypeScript estricto y scripts base", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../../package.json", import.meta.url)));
  const tsconfig = JSON.parse(await readFile(new URL("../../tsconfig.json", import.meta.url)));

  assert.equal(packageJson.packageManager, "pnpm@11.25.0");
  assert.equal(tsconfig.compilerOptions.strict, true);
  assert.ok(packageJson.scripts.lint);
  assert.ok(packageJson.scripts.typecheck);
  assert.ok(packageJson.scripts.test);
});
