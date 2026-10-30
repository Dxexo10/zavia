import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const launcher =
  process.platform === "win32"
    ? new URL("../.agents/skills/impeccable/scripts/impeccable.cmd", import.meta.url)
    : new URL("../.agents/skills/impeccable/scripts/impeccable", import.meta.url);
const command = fileURLToPath(launcher);
const isWindows = process.platform === "win32";
const result = spawnSync(
  isWindows ? command : "sh",
  isWindows ? ["detect", "src"] : [command, "detect", "src"],
  {
    cwd: root,
    shell: isWindows,
    stdio: "inherit"
  }
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
