import { describe, expect, it } from "vitest";

import {
  calculateStreak,
  eligibleTransactionCount,
  unlockAchievement
} from "../../../src/domain/streaks";

describe("[RN-051][RN-052] rachas", () => {
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
  it("[RN-050] desbloquea una vez y no pierde un logro existente", () => {
    expect(unlockAchievement([], "streak_7")).toEqual(["streak_7"]);
    expect(unlockAchievement(["streak_7"], "streak_7")).toEqual(["streak_7"]);
  });
});
