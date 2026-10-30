import assert from "node:assert/strict";
import { exec } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { test } from "vitest";

const execute = promisify(exec);
const fixtureDirectory = new URL("../../src/domain/__layer-rule-test__/", import.meta.url);
const fixtureFile = new URL("illegal-import.ts", fixtureDirectory);

test("[RNF-051] dependency-cruiser rechaza una importación ilegal desde domain", async () => {
  await mkdir(fixtureDirectory, { recursive: true });
  await writeFile(fixtureFile, 'import "next";\nexport const value = 1;\n');

  try {
    await assert.rejects(
      execute("pnpm exec depcruise --config .dependency-cruiser.cjs src"),
      (error) => {
        assert.match(`${error.message}${error.stdout}${error.stderr}`, /domain-must-stay-pure/);
        return true;
      }
    );
  } finally {
    await rm(fixtureDirectory, { recursive: true, force: true });
  }
}, 15_000);
