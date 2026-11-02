import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

import { createLogger } from "../../src/infrastructure/logging/logger";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(path)
        : entry.isFile() && /\.(?:ts|tsx|js|mjs|cjs)$/.test(entry.name)
          ? [path]
          : [];
    })
  );
  return nested.flat();
}

test("[RNF-024][SEG-SUP-02][PS-22] CI ejecuta audit y conserva instalaciones congeladas", async () => {
  const workflow = await readFile(
    new URL("../../.github/workflows/ci.yml", import.meta.url),
    "utf8"
  );

  assert.match(workflow, /pnpm audit --audit-level=high/);
  assert.match(workflow, /pnpm install --frozen-lockfile --ignore-scripts/);
});

test("[SEG-SUP-03] Dependabot agrupa actualizaciones de dependencias y acciones", async () => {
  const dependabot = await readFile(
    new URL("../../.github/dependabot.yml", import.meta.url),
    "utf8"
  );

  assert.match(dependabot, /package-ecosystem: npm/);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.match(dependabot, /groups:/);
});

test("[SEG-SUP-05] el gestor bloquea scripts de instalación por defecto", async () => {
  const npmrc = await readFile(new URL("../../.npmrc", import.meta.url), "utf8");

  assert.match(npmrc, /^ignore-scripts=true$/m);
});

test("[SEG-INP-02][PS-30] src no usa dangerouslySetInnerHTML", async () => {
  const files = await sourceFiles(fileURLToPath(new URL("../../src", import.meta.url)));
  const sources = await Promise.all(files.map((file) => readFile(file, "utf8")));

  assert.doesNotMatch(sources.join("\n"), /dangerouslySetInnerHTML/);
});

test("[SEG-LOG-04] SECURITY.md dirige al reporte privado de vulnerabilidades de GitHub", async () => {
  const security = await readFile(new URL("../../SECURITY.md", import.meta.url), "utf8");

  assert.match(security, /No abras incidencias públicas/i);
  assert.match(security, /reporte de vulnerabilidades de GitHub/i);
});

test("[RNF-058][SEG-LOG-01][PS-27] logger descarta campos fuera de la lista blanca", () => {
  const entries = [];
  const logger = createLogger((entry) => entries.push(entry));

  logger.log({
    requestId: "request-1",
    action: "create",
    result: "failure",
    errorCode: "UNEXPECTED",
    durationMs: 10,
    password: "must-not-leak"
  });

  assert.deepEqual(entries, [
    {
      requestId: "request-1",
      action: "create",
      result: "failure",
      errorCode: "UNEXPECTED",
      durationMs: 10
    }
  ]);
});
