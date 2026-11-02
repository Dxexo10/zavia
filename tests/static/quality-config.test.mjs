import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "vitest";

test("[RNF-049][RNF-052] la calidad usa LF, complejidad máxima y protege las capas", async () => {
  const [attributes, prettier, cruiser, eslint] = await Promise.all([
    readFile(new URL("../../.gitattributes", import.meta.url), "utf8"),
    readFile(new URL("../../prettier.config.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../.dependency-cruiser.cjs", import.meta.url), "utf8"),
    readFile(new URL("../../eslint.config.mjs", import.meta.url), "utf8")
  ]);

  assert.match(attributes, /\* text=auto eol=lf/);
  assert.match(prettier, /endOfLine:\s*"lf"/);
  assert.match(cruiser, /domain-must-stay-pure/);
  assert.match(eslint, /complexity:\s*\["error", 10\]/);
});

test("[RNF-053] hooks POSIX invocan los binarios locales sin depender de pnpm", async () => {
  const [preCommit, commitMsg] = await Promise.all([
    readFile(new URL("../../.husky/pre-commit", import.meta.url), "utf8"),
    readFile(new URL("../../.husky/commit-msg", import.meta.url), "utf8")
  ]);

  for (const hook of [preCommit, commitMsg]) {
    assert.match(hook, /^#!\/usr\/bin\/env sh/m);
    assert.match(hook, /git rev-parse --show-toplevel/);
    assert.doesNotMatch(hook, /pnpm(?:\.cmd)?/);
  }
  assert.match(preCommit, /node_modules\/.bin\/lint-staged/);
  assert.match(commitMsg, /node_modules\/.bin\/commitlint/);
});
