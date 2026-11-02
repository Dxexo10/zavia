import { describe, expect, it } from "vitest";

import {
  budgetRiskInsight,
  categorySpendInsight,
  goalAdjustmentInsight,
  microExpensesInsight,
  savingsRateInsight,
  subscriptionWeightInsight
} from "../../../src/domain/insights";

describe("[RN-040][RN-041] categoría sobre promedio", () => {
  it.each([
    [24900, null],
    [26000, "attention"],
    [31000, "alert"]
  ])("[RN-041] clasifica gasto %i", (currentMinor, severity) => {
    const insight = categorySpendInsight({ historyMonths: 3, averageMinor: 20_000, currentMinor });
    if (severity === null) expect(insight).toBeNull();
    else expect(insight).toMatchObject({ severity });
  });

  it("[RN-040] no emite insight comparativo con menos de dos meses completos", () => {
    expect(
      categorySpendInsight({ historyMonths: 1, averageMinor: 20_000, currentMinor: 31_000 })
    ).toBeNull();
  });
});

describe("[RN-043][RN-045][RN-046] insights de hábitos", () => {
  it("[RN-043] solo alerta cuando suscripciones superan 15 %", () => {
    expect(subscriptionWeightInsight(1_500, 10_000)).toBeNull();
    expect(subscriptionWeightInsight(1_501, 10_000)).toMatchObject({ severity: "attention" });
  });

  it("[RN-045] exige 15 gastos pequeños y el 10 % del total", () => {
    expect(microExpensesInsight(Array(14).fill(2_000), 20_000)).toBeNull();
    expect(microExpensesInsight(Array(15).fill(2_000), 300_000)).toMatchObject({
      severity: "info"
    });
  });

  it("[RN-046] informa desde una tasa de ahorro de 20 %", () => {
    expect(savingsRateInsight(100_000, 80_100)).toBeNull();
    expect(savingsRateInsight(100_000, 80_000)).toMatchObject({ severity: "info" });
  });
});

describe("[RN-042][RN-044] insights de presupuesto y metas", () => {
  it("[RN-042] proyecta riesgo desde el día siete sin alertar tras exceder", () => {
    expect(
      budgetRiskInsight({ elapsedDays: 6, daysInMonth: 30, spentMinor: 20_000, limitMinor: 50_000 })
    ).toBeNull();
    expect(
      budgetRiskInsight({
        elapsedDays: 10,
        daysInMonth: 30,
        spentMinor: 20_000,
        limitMinor: 50_000
      })
    ).toMatchObject({ severity: "attention" });
    expect(
      budgetRiskInsight({
        elapsedDays: 10,
        daysInMonth: 30,
        spentMinor: 51_000,
        limitMinor: 50_000
      })
    ).toBeNull();
  });

  it("[RN-044] muestra el ajuste para meta ámbar o roja", () => {
    expect(goalAdjustmentInsight("on_track", 56_250, 50_000)).toBeNull();
    expect(goalAdjustmentInsight("at_risk", 56_250, 50_000)).toMatchObject({
      severity: "attention",
      adjustmentMinor: 6_250
    });
    expect(goalAdjustmentInsight("behind", 56_250, 50_000)).toMatchObject({
      severity: "alert",
      adjustmentMinor: 6_250
    });
  });
});
