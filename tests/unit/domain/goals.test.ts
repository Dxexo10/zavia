import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { canChangeGoalCurrency, canWithdrawGoal, projectGoal } from "../../../src/domain/goals";

const activeGoal = {
  targetMinor: 600_000,
  savedMinor: 150_000,
  deadline: "2027-06-26",
  status: "active" as const,
  entries: [{ kind: "contribution" as const, amountMinor: 150_000, occurredOn: "2026-07-31" }]
};

describe("[RN-020][RN-021] proyección de metas", () => {
  it("[RN-020][RN-021] calcula el ejemplo de referencia", () => {
    expect(projectGoal(activeGoal, "2026-10-29")).toMatchObject({
      remainingMinor: 450_000,
      monthlyPaceMinor: 50_000,
      daysToComplete: 270,
      requiredMonthlyMinor: 56_250,
      projectedDate: "2027-07-26",
      ratio: 0.8889,
      state: "behind",
      light: "red"
    });
  });

  it.each([
    [60_000, 1.0667, 225, "on_track", "green"],
    [56_250, 1, 240, "on_track", "green"],
    [56_200, 0.9991, 241, "at_risk", "amber"],
    [52_000, 0.9244, 260, "at_risk", "amber"],
    [50_625, 0.9, 267, "at_risk", "amber"],
    [50_000, 0.8889, 270, "behind", "red"],
    [30_000, 0.5333, 450, "behind", "red"]
  ])("[RN-020][RN-021] ritmo %i céntimos/mes", (paceMinor, ratio, daysToComplete, state, light) => {
    const goal = {
      ...activeGoal,
      entries: [{ ...activeGoal.entries[0], amountMinor: paceMinor * 3 }]
    };

    expect(projectGoal(goal, "2026-10-29")).toMatchObject({ ratio, daysToComplete, state, light });
  });

  it("[RN-020][RN-024] trata los casos especiales", () => {
    expect(projectGoal({ ...activeGoal, savedMinor: 600_000 }, "2026-10-29").state).toBe(
      "completed"
    );
    expect(projectGoal({ ...activeGoal, entries: [] }, "2026-10-29").state).toBe("no_data");
    expect(
      projectGoal(
        {
          ...activeGoal,
          entries: [{ kind: "withdrawal", amountMinor: 1, occurredOn: "2026-10-29" }]
        },
        "2026-10-29"
      ).state
    ).toBe("no_progress");
    expect(projectGoal({ ...activeGoal, deadline: "2026-10-29" }, "2026-10-29").state).toBe(
      "overdue"
    );
    expect(projectGoal({ ...activeGoal, status: "paused" }, "2026-10-29").state).toBe("paused");
  });

  it("[RN-020] usa ventana de 30 o 90 días según el primer aporte", () => {
    expect(
      projectGoal(
        { ...activeGoal, entries: [{ ...activeGoal.entries[0], occurredOn: "2026-10-19" }] },
        "2026-10-29"
      ).windowDays
    ).toBe(30);
    expect(
      projectGoal(
        { ...activeGoal, entries: [{ ...activeGoal.entries[0], occurredOn: "2026-04-12" }] },
        "2026-10-29"
      ).windowDays
    ).toBe(90);
  });

  it("[RN-020][RN-022] informa retraso y rechaza retiro que baja de cero", () => {
    expect(projectGoal(activeGoal, "2026-10-29").delayDays).toBe(30);
    expect(canWithdrawGoal(10_000, 10_001)).toBe(false);
  });

  it("[RN-023] bloquea cambiar la moneda cuando ya hay aportes", () => {
    expect(canChangeGoalCurrency(0)).toBe(true);
    expect(canChangeGoalCurrency(1)).toBe(false);
  });

  it("[RN-020] un ritmo mayor nunca proyecta una fecha posterior", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60_000 }),
        fc.integer({ min: 1, max: 60_000 }),
        (a, b) => {
          const slow = Math.min(a, b);
          const fast = Math.max(a, b);
          const project = (pace: number) =>
            projectGoal(
              { ...activeGoal, entries: [{ ...activeGoal.entries[0], amountMinor: pace * 3 }] },
              "2026-10-29"
            );
          expect(project(fast).daysToComplete).toBeLessThanOrEqual(
            project(slow).daysToComplete ?? Infinity
          );
        }
      )
    );
  });

  it("[RN-020] razón mayor o igual a uno equivale a llegar a tiempo", () => {
    fc.assert(
      fc.property(fc.integer({ min: 30_000, max: 80_000 }), (paceMinor) => {
        const projection = projectGoal(
          { ...activeGoal, entries: [{ ...activeGoal.entries[0], amountMinor: paceMinor * 3 }] },
          "2026-10-29"
        );
        expect((projection.ratio ?? 0) >= 1).toBe((projection.daysToComplete ?? Infinity) <= 240);
      })
    );
  });
});
