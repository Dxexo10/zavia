import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { test } from "vitest";

const executeFile = promisify(execFile);

test("[PS-20][SEG-SEC-02] Gitleaks detecta un secreto falso temporal", async () => {
  const directory = await mkdtemp(join(tmpdir(), "zavia-gitleaks-"));
  const secret = `ZAVIA_TEST_SECRET_${"A1B2C3D4E5F6G7H8A1B2C3D4"}`;
  await writeFile(join(directory, "fake.env"), `TOKEN=${secret}\n`);
  await writeFile(
    join(directory, ".gitleaks.toml"),
    `[[rules]]
id = "zavia-temporal"
description = "secreto falso de prueba"
regex = '''ZAVIA_TEST_SECRET_[A-Z0-9]{24}'''
`
  );

  await assert.rejects(
    executeFile("docker", [
      "run",
      "--rm",
      "--mount",
      `type=bind,src=${directory},dst=/scan,readonly`,
      "ghcr.io/gitleaks/gitleaks:v8.30.1",
      "dir",
      "/scan",
      "--config",
      "/scan/.gitleaks.toml",
      "--redact=100"
    ]),
    /leaks found|exit code 1/i
  );
});

test("[PS-22][PS-23][SEG-SUP-01][SEG-SUP-06] CI usa permisos mínimos, SHA y lockfile congelado", async () => {
  const [workflow, packageJson] = await Promise.all([
    readFile(new URL("../../.github/workflows/ci.yml", import.meta.url), "utf8"),
    readFile(new URL("../../package.json", import.meta.url), "utf8")
  ]);
  assert.match(workflow, /^on:\s*\r?\n\s*pull_request:/m);
  assert.doesNotMatch(workflow, /pull_request_target/);
  assert.match(workflow, /^permissions:\s*\r?\n\s*contents: read/m);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /uses:\s+[^@\s]+@[a-f0-9]{40}/g);
  assert.match(workflow, /pendiente \(se activa en F4\/F13\)/);
  assert.match(workflow, /fetch-depth: 0/);
  assert.doesNotMatch(workflow, /gitleaks\/gitleaks-action/);
  assert.match(workflow, /gitleaks_8\.30\.1_linux_x64\.tar\.gz/);
  assert.match(workflow, /gitleaks_8\.30\.1_checksums\.txt/);
  assert.match(workflow, /mktemp -d/);
  assert.match(workflow, /grep -E "\^\[\[:xdigit:\]\]\{64\} {2}\$asset\$"/);
  assert.match(workflow, /sha256sum --check --strict/);
  assert.match(workflow, /gitleaks" git "\$GITHUB_WORKSPACE"/);
  assert.match(workflow, /timeout-minutes: 10/);
  assert.equal(
    JSON.parse(packageJson).scripts["test:coverage"],
    "vitest run --coverage --exclude tests/integration/**"
  );
});

test("[RNF-025][SEG-SEC-01] .env.example contiene solo los nombres documentados", async () => {
  const source = await readFile(new URL("../../.env.example", import.meta.url), "utf8");
  const expected = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "IP_HASH_SECRET",
    "CRON_SECRET"
  ];
  assert.deepEqual(
    source.trim().split(/\r?\n/).filter(Boolean),
    expected.map((name) => `${name}=`)
  );
});
