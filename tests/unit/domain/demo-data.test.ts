import { describe, expect, it } from "vitest";
import { generateDemoData } from "../../../src/domain/demo-data";

describe("[RN-061][RNF-057] datos demo", () => {
  it("genera un conjunto determinista y completo respecto de hoy", () => {
    const first = generateDemoData("2026-10-29");
    expect(generateDemoData("2026-10-29")).toEqual(first);
    expect(first.accounts).toHaveLength(4);
    expect(first.transactions).toHaveLength(150);
    expect(first.goals.map((goal) => goal.light).sort()).toEqual(["amber", "green", "red"]);
    expect(first.budgets.map((budget) => budget.level).sort()).toEqual(["amber", "normal", "red"]);
    expect(first.recurring).toHaveLength(4);
    expect(first.insights.length).toBeGreaterThanOrEqual(3);
    expect(first.streakDays).toBe(12);
    expect(first.achievements).toEqual(
      expect.arrayContaining([
        "first_transaction",
        "first_goal_created",
        "first_subscription",
        "streak_7"
      ])
    );
  });
});
