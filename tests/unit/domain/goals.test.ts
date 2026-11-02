import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { projectGoal } from "../../../src/domain/goals";

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
    [60_000, "on_track", "green"],
    [56_250, "on_track", "green"],
    [56_200, "at_risk", "amber"],
    [52_000, "at_risk", "amber"],
    [50_625, "at_risk", "amber"],
    [50_000, "behind", "red"],
    [30_000, "behind", "red"]
  ])("[RN-021] clasifica ritmo %i con el semáforo documentado", (paceMinor, state, light) => {
    const goal = {
      ...activeGoal,
      entries: [{ ...activeGoal.entries[0], amountMinor: paceMinor * 3 }]
    };

    expect(projectGoal(goal, "2026-10-29")).toMatchObject({ state, light });
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
});
