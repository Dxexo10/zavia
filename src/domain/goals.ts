import {
  COMMERCIAL_MONTH_DAYS,
  GOAL_AMBER_RATIO,
  GOAL_GREEN_RATIO,
  MAX_GOAL_PACE_WINDOW_DAYS,
  MIN_GOAL_PACE_WINDOW_DAYS
} from "../config/business-constants";

export interface GoalEntry {
  kind: "contribution" | "withdrawal";
  amountMinor: number;
  occurredOn: string;
}
export interface GoalInput {
  targetMinor: number;
  savedMinor: number;
  deadline: string;
  status: "active" | "paused" | "completed";
  entries: readonly GoalEntry[];
}
export interface GoalProjection {
  remainingMinor: number;
  windowDays: number | null;
  monthlyPaceMinor: number | null;
  daysToComplete: number | null;
  requiredMonthlyMinor: number | null;
  projectedDate: string | null;
  ratio: number | null;
  delayDays: number | null;
  state:
    | "on_track"
    | "at_risk"
    | "behind"
    | "overdue"
    | "no_progress"
    | "no_data"
    | "paused"
    | "completed";
  light: "green" | "amber" | "red" | "neutral";
}

export function projectGoal(goal: GoalInput, today: string): GoalProjection {
  const remainingMinor = Math.max(0, goal.targetMinor - goal.savedMinor);
  if (goal.status === "paused") return special(remainingMinor, "paused", "neutral");
  if (remainingMinor === 0) return special(remainingMinor, "completed", "neutral");
  if (goal.entries.length === 0) return special(remainingMinor, "no_data", "neutral");
  const first = goal.entries.map((entry) => entry.occurredOn).sort()[0];
  const windowDays = Math.max(
    MIN_GOAL_PACE_WINDOW_DAYS,
    Math.min(MAX_GOAL_PACE_WINDOW_DAYS, daysBetween(first, today))
  );
  const net = goal.entries
    .filter((entry) => entry.occurredOn >= addDays(today, -windowDays))
    .reduce(
      (sum, entry) =>
        sum + (entry.kind === "contribution" ? entry.amountMinor : -entry.amountMinor),
      0
    );
  const monthlyPaceMinor = Math.round((net * COMMERCIAL_MONTH_DAYS) / windowDays);
  const daysRemaining = daysBetween(today, goal.deadline);
  if (daysRemaining <= 0)
    return special(remainingMinor, "overdue", "red", monthlyPaceMinor, windowDays);
  if (monthlyPaceMinor <= 0)
    return special(remainingMinor, "no_progress", "red", monthlyPaceMinor, windowDays);
  const daysToComplete = Math.ceil((remainingMinor * COMMERCIAL_MONTH_DAYS) / monthlyPaceMinor);
  const requiredMonthlyMinor = Math.round((remainingMinor * COMMERCIAL_MONTH_DAYS) / daysRemaining);
  const ratio = Math.round((monthlyPaceMinor * 10_000) / requiredMonthlyMinor) / 10_000;
  const state =
    ratio >= GOAL_GREEN_RATIO ? "on_track" : ratio >= GOAL_AMBER_RATIO ? "at_risk" : "behind";
  const light = state === "on_track" ? "green" : state === "at_risk" ? "amber" : "red";
  return {
    remainingMinor,
    windowDays,
    monthlyPaceMinor,
    daysToComplete,
    requiredMonthlyMinor,
    projectedDate: addDays(today, daysToComplete),
    ratio,
    delayDays: daysToComplete - daysRemaining,
    state,
    light
  };
}

export function canWithdrawGoal(savedMinor: number, withdrawalMinor: number): boolean {
  return withdrawalMinor > 0 && withdrawalMinor <= savedMinor;
}

export function canChangeGoalCurrency(entryCount: number): boolean {
  return entryCount === 0;
}

function special(
  remainingMinor: number,
  state: GoalProjection["state"],
  light: GoalProjection["light"],
  monthlyPaceMinor: number | null = null,
  windowDays: number | null = null
): GoalProjection {
  return {
    remainingMinor,
    windowDays,
    monthlyPaceMinor,
    daysToComplete: null,
    requiredMonthlyMinor: null,
    projectedDate: null,
    ratio: null,
    delayDays: null,
    state,
    light
  };
}
function daysBetween(first: string, second: string): number {
  return Math.round(
    (Date.parse(`${second}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86_400_000
  );
}
function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
