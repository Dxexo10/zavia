import { glob } from "node:fs/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type TraceabilityResult = {
  failures: string[];
  pendingByPhase: string[];
};

type PhaseSummary = {
  covered: number;
  pending: number;
  total: number;
};

const DOCUMENTS = [
  "01-requerimientos-funcionales.md",
  "02-requerimientos-no-funcionales.md",
  "03-reglas-de-negocio.md",
  "09-seguridad.md"
];

function isExcluded(line: string): boolean {
  return /DESCARTAD[OA]|FUSIONAD[OA]|~~|\b[Nn]o aplica\b|\b[Rr]eformulado\b/.test(line);
}

function idsInLine(line: string): string[] {
  return [...line.matchAll(/\b(?:(?:RF|RN|RNF|PS)-\d{2,3}|SEG-[A-Z]+-\d{2,3})\b/g)].map(
    (match) => match[0]
  );
}

function definedIdsInLine(line: string): string[] {
  if (/^###\s+(?:RF|RN)-\d{2,3}\b/.test(line)) return idsInLine(line).slice(0, 1);
  if (!line.startsWith("|")) return [];
  return idsInLine(line.split("|")[1] ?? "").slice(0, 1);
}

export function extractRequirementIds(markdown: string): Set<string> {
  const ids = new Set<string>();
  const lines = markdown.split(/\r?\n/);
  const excluded = new Set(lines.filter(isExcluded).flatMap(definedIdsInLine));
  for (const line of lines) {
    if (isExcluded(line)) continue;
    const definedIds = definedIdsInLine(line);
    for (const id of definedIds) if (!excluded.has(id)) ids.add(id);
  }
  return ids;
}

export function extractTestIds(source: string): Set<string> {
  const ids = new Set<string>();
  const titlePattern = /(?:test|it|describe)\s*\(\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(titlePattern)) {
    for (const id of idsInLine(match[1])) ids.add(id);
  }
  return ids;
}

function parseClosedPhases(state: string): Set<string> {
  const match = state.match(/^\s*- Fases cerradas:\s*(.*)$/m);
  return new Set((match?.[1].match(/F\d+/g) ?? []).map((phase) => phase.trim()));
}

export function parsePhaseMap(plan: string): Map<string, string> {
  const block = plan.match(/```mapa-id-fase\r?\n([\s\S]*?)```/);
  if (!block)
    throw new Error(
      "No existe el bloque mapa-id-fase en Documentacion/11-plan-de-implementacion.md."
    );

  const mapping = new Map<string, string>();
  for (const line of block[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^(F\d+):\s*(.+)$/);
    if (!match) throw new Error(`Línea inválida en mapa-id-fase: ${line}`);
    const [, phase, ids] = match;
    for (const id of idsInLine(ids)) {
      const previous = mapping.get(id);
      if (previous) throw new Error(`ID duplicado en mapa-id-fase: ${id} (${previous}, ${phase})`);
      mapping.set(id, phase);
    }
  }
  return mapping;
}

async function testFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for await (const file of glob("tests/**/*.test.{ts,mts,mjs}", { cwd: root })) files.push(file);
  return files;
}

function markdownEscape(value: string): string {
  return value.replaceAll("|", "\\|");
}

function prefixOf(id: string): string {
  return id.split("-")[0];
}

function validationError(message: string, ids: Iterable<string>): Error | undefined {
  const values = [...ids].sort();
  return values.length > 0 ? new Error(`${message}: ${values.join(", ")}`) : undefined;
}

export async function runTraceability({
  root = process.cwd()
}: { root?: string } = {}): Promise<TraceabilityResult> {
  const documentationRoot = join(root, "Documentacion");
  const requirementIds = new Set<string>();
  const excludedIds = new Set<string>();

  for (const document of DOCUMENTS) {
    const source = await readFile(join(documentationRoot, document), "utf8");
    for (const line of source.split(/\r?\n/).filter(isExcluded)) {
      for (const id of definedIdsInLine(line)) excludedIds.add(id);
    }
    for (const id of extractRequirementIds(source)) requirementIds.add(id);
  }
  const plan = await readFile(join(documentationRoot, "11-plan-de-implementacion.md"), "utf8");
  const phaseById = parsePhaseMap(plan);
  const missingFromMap = new Set([...requirementIds].filter((id) => !phaseById.has(id)));
  const invalidInMap = new Set(
    [...phaseById].map(([id]) => id).filter((id) => !requirementIds.has(id) || excludedIds.has(id))
  );
  const missingError = validationError("IDs vigentes sin mapa", missingFromMap);
  const invalidError = validationError("IDs inexistentes o excluidos en mapa", invalidInMap);
  if (missingError || invalidError)
    throw new Error([missingError, invalidError].filter(Boolean).join("; "));

  const testsById = new Map<string, string[]>();
  for (const file of await testFiles(root)) {
    const source = await readFile(join(root, file), "utf8");
    for (const id of extractTestIds(source)) {
      const paths = testsById.get(id) ?? [];
      paths.push(file.replaceAll("\\", "/"));
      testsById.set(id, paths);
    }
  }

  const state = await readFile(join(documentationRoot, "informes", "estado.md"), "utf8");
  const closedPhases = parseClosedPhases(state);
  const failures: string[] = [];
  const pendingByPhase: string[] = [];
  const rows: string[] = [];
  const summary = new Map<string, PhaseSummary>();

  for (const id of [...requirementIds].sort()) {
    const paths = testsById.get(id) ?? [];
    const phase = phaseById.get(id);
    if (!phase) throw new Error(`ID sin fase tras validación: ${id}`);
    let status = "Cubierto";
    if (paths.length === 0 && closedPhases.has(phase)) {
      status = "Falta prueba: fase cerrada";
      failures.push(id);
    } else if (paths.length === 0) {
      status = "Pendiente por fase";
      pendingByPhase.push(id);
    }
    const key = `${phase}|${prefixOf(id)}`;
    const totals = summary.get(key) ?? { covered: 0, pending: 0, total: 0 };
    totals.total += 1;
    if (status === "Cubierto") totals.covered += 1;
    else totals.pending += 1;
    summary.set(key, totals);
    rows.push(
      `| ${id} | ${markdownEscape(phase)} | ${markdownEscape(status)} | ${paths.join("<br>") || "—"} |`
    );
  }

  const summaryRows = [...summary]
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([key, totals]) => {
      const [phase, prefix] = key.split("|");
      return `| ${phase} | ${prefix} | ${totals.total} | ${totals.covered} | ${totals.pending} |`;
    });

  await mkdir(join(documentationRoot, "informes"), { recursive: true });
  await writeFile(
    join(documentationRoot, "informes", "trazabilidad.md"),
    [
      "# Matriz de trazabilidad",
      "",
      "Generada por `pnpm check:traceability`. Los pendientes no usan excepciones: se evalúan al cerrar su fase.",
      "",
      "## Desglose por fase y prefijo",
      "",
      "| Fase | Prefijo | Total | Cubiertos | Pendientes |",
      "| --- | --- | ---: | ---: | ---: |",
      ...summaryRows,
      "",
      "## Detalle",
      "",
      "| ID | Fase | Estado | Pruebas |",
      "| --- | --- | --- | --- |",
      ...rows,
      ""
    ].join("\n")
  );

  if (failures.length > 0)
    throw new Error(`IDs sin prueba de fase cerrada: ${failures.join(", ")}`);
  return { failures, pendingByPhase };
}

if (import.meta.filename === process.argv[1]) {
  const result = await runTraceability();
  console.log(`Trazabilidad: ${result.pendingByPhase.length} pendientes por fase.`);
}
