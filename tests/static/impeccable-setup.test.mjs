import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "vitest";

test("[SEG-SUP-08][PS-24] Impeccable queda fijada, verificada y con contexto compartible", async () => {
  const [readme, product, design, gitignore, configuration, hooks, version, checksums] =
    await Promise.all([
      readFile(new URL("../../README.md", import.meta.url), "utf8"),
      readFile(new URL("../../PRODUCT.md", import.meta.url), "utf8"),
      readFile(new URL("../../DESIGN.md", import.meta.url), "utf8"),
      readFile(new URL("../../.gitignore", import.meta.url), "utf8"),
      readFile(new URL("../../.impeccable/config.json", import.meta.url), "utf8"),
      readFile(new URL("../../.codex/hooks.json", import.meta.url), "utf8"),
      readFile(new URL("../../.agents/skills/impeccable/scripts/VERSION", import.meta.url), "utf8"),
      readFile(
        new URL("../../.agents/skills/impeccable/scripts/engine-checksums.txt", import.meta.url),
        "utf8"
      )
    ]);

  assert.match(readme, /Impeccable `4\.8\.0`.*Apache-2\.0/);
  assert.match(product, /# Zavia — Producto/);
  assert.match(design, /Documentacion\/07-diseno-ui-ux\.md/);
  assert.match(gitignore, /^\.impeccable\/config\.local\.json$/m);
  assert.match(gitignore, /^\.impeccable\/hook\.cache\.json$/m);
  assert.match(configuration, /"enabled": true/);
  assert.match(hooks, /PostToolUse/);
  assert.equal(version.trim(), "0.1.18");
  assert.match(
    checksums,
    /^0\.1\.18 impeccable-windows-x64\.exe 8f61e96b0c97001546a824d79b44f46b423b560f3eb1a0cc44a8695a1b395d9f$/m
  );
});
