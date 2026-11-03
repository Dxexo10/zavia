import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "vitest";

const executeFile = promisify(execFile);
const root = fileURLToPath(new URL("../..", import.meta.url));
const commitlintCli = fileURLToPath(
  new URL("../../node_modules/@commitlint/cli/cli.js", import.meta.url)
);

async function lintMessage(message) {
  const directory = await mkdtemp(join(tmpdir(), "zavia-commitlint-"));
  const messagePath = join(directory, "COMMIT_EDITMSG");
  await writeFile(messagePath, message);
  try {
    return await executeFile(process.execPath, [commitlintCli, "--edit", messagePath], {
      cwd: root
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("[RNF-053][SEG-SUP-03] commitlint ignora el mensaje firmado de Dependabot", async () => {
  await assert.doesNotReject(
    lintMessage(
      "Bump typescript from 5.9.3 to 7.0.2\n\n" +
        "Bumps [typescript](https://github.com/microsoft/TypeScript) from 5.9.3 to 7.0.2, including release links that superan el límite de longitud.\n\n" +
        "Signed-off-by: dependabot[bot] <support@github.com>\n"
    )
  );
});

test("[RNF-053] commitlint rechaza un mensaje humano no convencional", async () => {
  await assert.rejects(lintMessage("actualiza dependencias sin formato\n"), (error) => {
    assert.match(error.stdout, /subject may not be empty/i);
    return true;
  });
});
