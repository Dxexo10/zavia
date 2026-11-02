import { describe, expect, it } from "vitest";

import {
  achievementKeys,
  activityDaysFromRegistrations,
  calculateStreak,
  eligibleTransactionCount,
  unlockAchievement
} from "../../../src/domain/streaks";

describe("[RN-051][RN-052] rachas", () => {
  it("[RN-051][RN-052] usa la fecha de registro, cuenta un día una vez y mantiene vigente ayer", () => {
    const days = activityDaysFromRegistrations(
      [
        { source: "manual", registeredOn: "2026-10-29", occurredOn: "2026-09-01" },
        { source: "manual", registeredOn: "2026-10-29", occurredOn: "2026-10-29" },
        { source: "import", registeredOn: "2026-10-28", occurredOn: "2026-10-28" }
      ],
      ["2026-10-28", "2026-10-28"]
    );

    expect(days).toEqual(["2026-10-28", "2026-10-29"]);
    expect(calculateStreak(days, "2026-10-30")).toEqual({ days: 2, active: true });
  });

  it("[RN-051] cuenta actividad hoy y ayer como racha vigente", () => {
    expect(calculateStreak(["2026-10-28", "2026-10-29"], "2026-10-29")).toEqual({
      days: 2,
      active: true
    });
  });

  it("[RN-051] rompe la racha si no hubo actividad ayer ni hoy", () => {
    expect(calculateStreak(["2026-10-27"], "2026-10-29")).toEqual({ days: 0, active: false });
  });

  it("[RN-052] excluye importaciones, recurrentes, transferencias y semillas", () => {
    expect(eligibleTransactionCount(["manual", "import", "recurring", "transfer", "seed"])).toBe(1);
  });
});

describe("[RN-050] logros", () => {
  it("[RN-050][RN-052] evalúa todo el catálogo con umbrales exactos", () => {
    const nineteenDays = Array.from({ length: 100 }, (_, index) => ({
      source: "manual" as const,
      registeredOn: `2026-10-${String((index % 19) + 1).padStart(2, "0")}`
    }));
    const twentyDays = Array.from({ length: 100 }, (_, index) => ({
      source: "manual" as const,
      registeredOn: `2026-10-${String((index % 20) + 1).padStart(2, "0")}`
    }));

    expect(
      achievementKeys({
        activities: nineteenDays,
        goalsCreated: 1,
        goalsCompleted: 1,
        streakDays: 30,
        budgetUsages: [0.8],
        subscriptions: 1
      })
    ).toEqual([
      "first_transaction",
      "first_goal_created",
      "first_goal_completed",
      "streak_7",
      "streak_30",
      "first_subscription"
    ]);

    expect(
      achievementKeys({
        activities: twentyDays,
        goalsCreated: 1,
        goalsCompleted: 1,
        streakDays: 7,
        budgetUsages: [0.8, 1],
        subscriptions: 1
      })
    ).toEqual([
      "first_transaction",
      "first_goal_created",
      "first_goal_completed",
      "streak_7",
      "month_within_budget",
      "first_subscription",
      "tx_100"
    ]);
  });

  it("[RN-050] desbloquea una vez y no pierde un logro existente", () => {
    expect(unlockAchievement([], "streak_7")).toEqual(["streak_7"]);
    expect(unlockAchievement(["streak_7"], "streak_7")).toEqual(["streak_7"]);
  });
});
