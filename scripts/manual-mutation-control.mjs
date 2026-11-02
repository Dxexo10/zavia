import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vitest = fileURLToPath(new URL("../node_modules/vitest/vitest.mjs", import.meta.url));

const controls = [
  {
    name: "umbral verde >= por >",
    file: "src/domain/goals.ts",
    replace: ["ratio >= GOAL_GREEN_RATIO", "ratio > GOAL_GREEN_RATIO"],
    test: "tests/unit/domain/goals.test.ts",
    expected: "[RN-020][RN-021] ritmo 56250 céntimos/mes"
  },
  {
    name: "redondeo half-up >= por >",
    file: "src/domain/money.ts",
    replace: ["remainder * 2n >= denominator", "remainder * 2n > denominator"],
    test: "tests/unit/domain/money.test.ts",
    expected: "[RN-003] redondea half-up los ejemplos documentados"
  },
  {
    name: "umbral ámbar 0.90 >= por >",
    file: "src/domain/goals.ts",
    replace: ["ratio >= GOAL_AMBER_RATIO", "ratio > GOAL_AMBER_RATIO"],
    test: "tests/unit/domain/goals.test.ts",
    expected: "[RN-020][RN-021] ritmo 50625 céntimos/mes"
  },
  {
    name: "umbral normal 80 % <= por <",
    file: "src/domain/budgets.ts",
    replace: ["usage <= BUDGET_NORMAL_USAGE_MAX", "usage < BUDGET_NORMAL_USAGE_MAX"],
    test: "tests/unit/domain/budgets.test.ts",
    expected: "[RN-026] clasifica gasto 40000"
  },
  {
    name: "umbral ámbar 100 % <= por <",
    file: "src/domain/budgets.ts",
    replace: ["usage <= BUDGET_AMBER_USAGE_MAX", "usage < BUDGET_AMBER_USAGE_MAX"],
    test: "tests/unit/domain/budgets.test.ts",
    expected: "[RN-026] clasifica gasto 50000"
  },
  {
    name: "ventana mínima 30 por 31 días",
    file: "src/domain/goals.ts",
    replace: ["Math.max(\n    MIN_GOAL_PACE_WINDOW_DAYS,", "Math.max(\n    31,"],
    test: "tests/unit/domain/goals.test.ts",
    expected: "[RN-020] usa ventana de 30 o 90 días según el primer aporte"
  },
  {
    name: "último día de mes corto por día ancla",
    file: "src/domain/recurring.ts",
    replace: ["Math.min(dayOf(anchor), daysInMonth(year, month))", "dayOf(anchor)"],
    test: "tests/unit/domain/recurring.test.ts",
    expected: "[RN-030] conserva el día 31 usando el último día de meses cortos"
  }
];

function runVitest(test) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [vitest, "run", test], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => resolve({ code, output }));
  });
}

for (const control of controls) {
  const path = new URL(`../${control.file}`, import.meta.url);
  const source = await readFile(path, "utf8");
  assert.ok(
    source.includes(control.replace[0]),
    `No se encontró el sitio de mutación: ${control.name}`
  );

  try {
    await writeFile(path, source.replace(control.replace[0], control.replace[1]));
    const result = await runVitest(control.test);
    assert.notEqual(result.code, 0, `El mutante sobrevivió: ${control.name}`);
    assert.match(
      result.output,
      new RegExp(control.expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
    console.log(`MUTANTE ELIMINADO | ${control.name} | ${control.expected}`);
  } finally {
    await writeFile(path, source);
  }
}
