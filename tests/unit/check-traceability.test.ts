import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runTraceability } from "../../scripts/check-traceability";

async function writeFixture(
  root: string,
  state: string,
  requirement: string,
  plan = ""
): Promise<void> {
  await mkdir(join(root, "Documentacion", "informes"), { recursive: true });
  await mkdir(join(root, "tests"), { recursive: true });
  await writeFile(join(root, "Documentacion", "01-requerimientos-funcionales.md"), requirement);
  await writeFile(join(root, "Documentacion", "02-requerimientos-no-funcionales.md"), "");
  await writeFile(join(root, "Documentacion", "03-reglas-de-negocio.md"), "");
  await writeFile(join(root, "Documentacion", "09-seguridad.md"), "");
  await writeFile(join(root, "Documentacion", "11-plan-de-implementacion.md"), plan);
  await writeFile(join(root, "Documentacion", "informes", "estado.md"), state);
}

describe("[RNF-055] check-traceability", () => {
  it("[RNF-055] genera la matriz y deja como pendiente un ID de fase abierta", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(root, "- Fases cerradas: F0\n", "### RF-998 · Acceso\n");
    await writeFile(join(root, "tests", "sample.test.ts"), 'test("[RF-998] cubre", () => {});');

    const result = await runTraceability({ root, phaseById: new Map([["RF-998", "F1"]]) });
    const matrix = await readFile(
      join(root, "Documentacion", "informes", "trazabilidad.md"),
      "utf8"
    );

    expect(result.failures).toEqual([]);
    expect(matrix).toContain("RF-998");
    expect(matrix).toContain("Cubierto");
  });

  it("[RNF-055] falla ante un ID de fase cerrada sin prueba", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(root, "- Fases cerradas: F0\n", "### RF-999 · Sin prueba\n");

    await expect(runTraceability({ root, phaseById: new Map([["RF-999", "F0"]]) })).rejects.toThrow(
      "RF-999"
    );
  });

  it("[RNF-055] no adelanta RNF-050 a F1 cuando F1 se cierra", async () => {
    const root = await mkdtemp(join(tmpdir(), "zavia-traceability-"));
    await writeFixture(
      root,
      "- Fases cerradas: F0, F1\n",
      "| RNF-050 | Cobertura | Reporte |\n",
      "| F1 | Fundamentos | Calidad | RNF-048 a 062 |\n"
    );

    await expect(runTraceability({ root })).resolves.toEqual(
      expect.objectContaining({ pendingByPhase: ["RNF-050"] })
    );
  });
});
