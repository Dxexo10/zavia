import { describe, expect, it } from "vitest";

import { budgetForMonth, calculateBudgetStatus, spentForBudget } from "../../../src/domain/budgets";

describe("[RN-025] presupuestos versionados", () => {
  it("[RN-025] conserva el límite histórico y usa la versión vigente del mes", () => {
    const versions = [
      { effectiveFrom: "2026-01", limitMinor: 50_000 },
      { effectiveFrom: "2026-03", limitMinor: 70_000 }
    ];

    expect(budgetForMonth(versions, "2026-02")).toBe(50_000);
    expect(budgetForMonth(versions, "2026-03")).toBe(70_000);
  });

  it("[RN-025] no cuenta transferencias ni movimientos eliminados", () => {
    expect(
      spentForBudget(
        [
          { kind: "expense", categoryId: "food", occurredOn: "2026-10-01", baseMinor: 10_000 },
          { kind: "transfer", categoryId: "food", occurredOn: "2026-10-02", baseMinor: 20_000 },
          {
            kind: "expense",
            categoryId: "food",
            occurredOn: "2026-10-03",
            baseMinor: 30_000,
            deleted: true
          }
        ],
        "food",
        "2026-10"
      )
    ).toBe(10_000);
  });
});

describe("[RN-026] umbrales de presupuesto", () => {
  it.each([
    [40_000, "normal", 0],
    [40_001, "amber", 0],
    [50_000, "amber", 0],
    [50_001, "red", 1]
  ])("[RN-026] clasifica gasto %i", (spentMinor, level, exceededMinor) => {
    expect(calculateBudgetStatus(50_000, spentMinor)).toMatchObject({ level, exceededMinor });
  });
});
