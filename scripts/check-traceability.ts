import { glob } from "node:fs/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type TraceabilityResult = {
  failures: string[];
  pendingByPhase: string[];
};

type RunOptions = {
  root?: string;
  phaseById?: Map<string, string>;
};

const DOCUMENTS = [
  "01-requerimientos-funcionales.md",
  "02-requerimientos-no-funcionales.md",
  "03-reglas-de-negocio.md",
  "09-seguridad.md"
];

const PHASE_OVERRIDES = new Map<string, string>([
  ["RNF-050", "F2"],
  ["RNF-051", "F2"],
  ["RNF-054", "F13"],
  ["RNF-056", "F13"],
  ["RNF-059", "F5"],
  ["RNF-060", "F13"],
  ["RNF-061", "F13"]
]);

function isExcluded(line: string): boolean {
  return /DESCARTAD[OA]|FUSIONAD[OA]|~~/.test(line);
}

function idsInLine(line: string): string[] {
  return [...line.matchAll(/\b(?:RF|RN|RNF|SEG|PS)-\d{3}\b/g)].map((match) => match[0]);
}

export function extractRequirementIds(markdown: string): Set<string> {
  const ids = new Set<string>();
  const lines = markdown.split(/\r?\n/);
  const excluded = new Set(lines.filter(isExcluded).flatMap(idsInLine));
  for (const line of lines) {
    if (isExcluded(line)) continue;
    if (/^###\s+(?:RF|RN)-\d{3}\b/.test(line) || /^\|/.test(line)) {
      for (const id of idsInLine(line)) if (!excluded.has(id)) ids.add(id);
    }
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

function derivePhaseById(plan: string, ids: Iterable<string>): Map<string, string> {
  const mapping = new Map<string, string>();
  const idsToMap = new Set(ids);
  const f1 = plan.match(/\|\s*F1\s*\|[^\n]*\|[^\n]*\|\s*RNF-(\d+)\s+a\s+(\d+)/);
  if (f1) {
    for (const id of idsToMap) {
      const number = Number(id.slice(4));
      if (id.startsWith("RNF-") && number >= Number(f1[1]) && number <= Number(f1[2]))
        mapping.set(id, "F1");
    }
  }
  const f2 = plan.match(/\|\s*F2\s*\|[^\n]*\|[^\n]*\|\s*RN-(\d+)\s+a\s+(\d+)/);
  if (f2) {
    for (const id of idsToMap) {
      const number = Number(id.slice(3));
      if (id.startsWith("RN-") && number >= Number(f2[1]) && number <= Number(f2[2]))
        mapping.set(id, "F2");
    }
  }
  for (const [id, phase] of PHASE_OVERRIDES) if (idsToMap.has(id)) mapping.set(id, phase);
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

export async function runTraceability(options: RunOptions = {}): Promise<TraceabilityResult> {
  const root = options.root ?? process.cwd();
  const documentationRoot = join(root, "Documentacion");
  const requirementIds = new Set<string>();
  const excludedIds = new Set<string>();
  const sources: string[] = [];

  for (const document of DOCUMENTS) {
    const source = await readFile(join(documentationRoot, document), "utf8");
    sources.push(source);
    for (const line of source.split(/\r?\n/).filter(isExcluded)) {
      for (const id of idsInLine(line)) excludedIds.add(id);
    }
  }
  for (const source of sources) {
    for (const id of extractRequirementIds(source))
      if (!excludedIds.has(id)) requirementIds.add(id);
  }

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
  const plan = await readFile(join(documentationRoot, "11-plan-de-implementacion.md"), "utf8");
  const phaseById = options.phaseById ?? derivePhaseById(plan, requirementIds);
  const closedPhases = parseClosedPhases(state);
  const failures: string[] = [];
  const pendingByPhase: string[] = [];
  const rows: string[] = [];

  for (const id of [...requirementIds].sort()) {
    const paths = testsById.get(id) ?? [];
    const phase = phaseById.get(id) ?? "Sin fase derivable";
    let status = "Cubierto";
    if (paths.length === 0 && closedPhases.has(phase)) {
      status = "Falta prueba: fase cerrada";
      failures.push(id);
    } else if (paths.length === 0) {
      status = "Pendiente por fase";
      pendingByPhase.push(id);
    }
    rows.push(
      `| ${id} | ${markdownEscape(phase)} | ${markdownEscape(status)} | ${paths.join("<br>") || "—"} |`
    );
  }

  await mkdir(join(documentationRoot, "informes"), { recursive: true });
  await writeFile(
    join(documentationRoot, "informes", "trazabilidad.md"),
    [
      "# Matriz de trazabilidad",
      "",
      "Generada por `pnpm check:traceability`. Los pendientes no usan excepciones: se evalúan al cerrar su fase.",
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
