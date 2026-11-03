import { describe, expect, it } from "vitest";
import { generateDemoData } from "../../../src/domain/demo-data";

describe("[RN-061][RNF-032][RNF-057] datos demo", () => {
  it("genera un conjunto determinista y completo respecto de hoy", () => {
    const first = generateDemoData("2026-10-29");
    expect(generateDemoData("2026-10-29")).toEqual(first);
    expect(first.accounts).toHaveLength(4);
    expect(first.transactions).toHaveLength(150);
    expect(first.goals.map((goal) => goal.projection.light).sort()).toEqual([
      "amber",
      "green",
      "red"
    ]);
    expect(first.goals.map((goal) => goal.projection.ratio)).toEqual([1.25, 0.92, 0.6667]);
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
    expect(first.transactions[0].occurredOn).toBe("2026-10-29");
    expect(first.transactions.every((transaction) => transaction.occurredOn >= "2026-07-21")).toBe(
      true
    );
  });
});
