import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runTraceability } from "../../scripts/check-traceability";

function planMap(lines: string[]): string {
  return `## 7. Mapa\n\n\`\`\`mapa-id-fase\n${lines.join("\n")}\n\`\`\`\n`;
}

async function writeFixture(
  root: string,
  state: string,
  requirement: string,
  plan: string,
  testSource?: string
): Promise<void> {
  await mkdir(join(root, "Documentacion", "informes"), { recursive: true });
  await mkdir(join(root, "tests"), { recursive: true });
  await writeFile(join(root, "Documentacion", "01-requerimientos-funcionales.md"), requirement);
  await writeFile(join(root, "Documentacion", "02-requerimientos-no-funcionales.md"), "");
  await writeFile(join(root, "Documentacion", "03-reglas-de-negocio.md"), "");
  await writeFile(join(root, "Documentacion", "09-seguridad.md"), "");
  await writeFile(join(root, "Documentacion", "11-plan-de-implementacion.md"), plan);
  await writeFile(join(root, "Documentacion", "informes", "estado.md"), state);
  if (testSource) await writeFile(join(root, "tests", "sample.test.ts"), testSource);
}

describe("[RNF-055] check-traceability", () => {
  it("[RNF-055] genera matriz y desglose para un ID cubierto de fase abierta", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(
      root,
      "- Fases cerradas: F0\n",
      "### RF-998 · Acceso\n",
      planMap(["F1: RF-998"]),
      'test("[RF-998] cubre", () => {});'
    );

    const result = await runTraceability({ root });
    const matrix = await readFile(
      join(root, "Documentacion", "informes", "trazabilidad.md"),
      "utf8"
    );

    expect(result.failures).toEqual([]);
    expect(matrix).toContain("RF-998");
    expect(matrix).toContain("## Desglose por fase y prefijo");
    expect(matrix).toContain("| F1 | RF | 1 | 1 | 0 |");
  });

  it("[RNF-055] falla si un ID vigente no aparece en mapa-id-fase", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(root, "- Fases cerradas: F0\n", "### RF-998 · Acceso\n", planMap([]));

    await expect(runTraceability({ root })).rejects.toThrow("IDs vigentes sin mapa: RF-998");
  });

  it("[RNF-055] falla si mapa-id-fase contiene un ID inexistente", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(
      root,
      "- Fases cerradas: F0\n",
      "### RF-998 · Acceso\n",
      planMap(["F1: RF-998, PS-999"])
    );

    await expect(runTraceability({ root })).rejects.toThrow(
      "IDs inexistentes o excluidos en mapa: PS-999"
    );
  });

  it("[RNF-055] falla ante un ID de fase cerrada sin prueba", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(
      root,
      "- Fases cerradas: F0, F1\n",
      "### RF-999 · Sin prueba\n",
      planMap(["F1: RF-999"])
    );

    await expect(runTraceability({ root })).rejects.toThrow(
      "IDs sin prueba de fase cerrada: RF-999"
    );
  });
});
