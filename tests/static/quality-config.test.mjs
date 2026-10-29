import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("[RNF-049][RNF-051][RNF-052] la calidad usa LF y protege las capas", async () => {
  const [attributes, prettier, cruiser] = await Promise.all([
    readFile(new URL("../../.gitattributes", import.meta.url), "utf8"),
    readFile(new URL("../../prettier.config.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../.dependency-cruiser.cjs", import.meta.url), "utf8")
  ]);

  assert.match(attributes, /\* text=auto eol=lf/);
  assert.match(prettier, /endOfLine:\s*"lf"/);
  assert.match(cruiser, /domain-must-stay-pure/);
});
