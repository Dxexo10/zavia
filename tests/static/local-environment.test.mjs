import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "vitest";

test("[SEG-SUP-02][SEG-AUT-02] Supabase local excluye servicios no usados y restringe correo a pruebas locales", async () => {
  const config = await readFile(new URL("../../supabase/config.toml", import.meta.url), "utf8");
  for (const section of [
    "realtime",
    "studio",
    "local_smtp",
    "storage",
    "edge_runtime",
    "analytics"
  ]) {
    assert.match(
      config,
      new RegExp(`\\[${section.replace(".", "\\.")}\\]\\s*\\r?\\n?enabled = false`)
    );
  }
  assert.match(config, /\[db\.pooler\]\s*\r?\nenabled = false/);
  assert.match(config, /\[storage\.s3_protocol\]\s*\r?\nenabled = false/);
  assert.match(config, /\[storage\.vector\]\s*\r?\nenabled = false/);
  assert.match(config, /\[auth\.email\][\s\S]*?enable_signup = true/);
  assert.match(config, /LOCAL ONLY:.*SEG-AUT-02/);
});

test("[SEG-SUP-08] configuración versionada no contiene claves literales y Git ignora secretos efímeros", async () => {
  const [config, gitignore] = await Promise.all([
    readFile(new URL("../../supabase/config.toml", import.meta.url), "utf8"),
    readFile(new URL("../../.gitignore", import.meta.url), "utf8")
  ]);
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^supabase\/\.temp\/$/m);
  assert.match(gitignore, /^supabase\/\.branches\/$/m);
  assert.doesNotMatch(config, /(?:secret|api|access)[_-]?key\s*=\s*"(?!env\()[^"]+"/i);
});
