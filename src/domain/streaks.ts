export type TransactionSource = "manual" | "import" | "recurring" | "transfer" | "seed";

export interface RegisteredActivity {
  source: TransactionSource;
  registeredOn: string;
  occurredOn?: string;
}

export interface AchievementInput {
  activities: readonly RegisteredActivity[];
  goalsCreated: number;
  goalsCompleted: number;
  streakDays: number;
  budgetUsages: readonly number[];
  subscriptions: number;
}

export function activityDaysFromRegistrations(
  activities: readonly RegisteredActivity[],
  noSpendDays: readonly string[]
): string[] {
  return [
    ...new Set([
      ...activities
        .filter((activity) => activity.source === "manual")
        .map((activity) => activity.registeredOn),
      ...noSpendDays
    ])
  ].sort();
}

export function calculateStreak(
  activityDays: readonly string[],
  today: string
): { days: number; active: boolean } {
  const uniqueDays = new Set(activityDays);
  let cursor = uniqueDays.has(today) ? today : addDays(today, -1);
  if (!uniqueDays.has(cursor)) return { days: 0, active: false };

  let days = 0;
  while (uniqueDays.has(cursor)) {
    days += 1;
    cursor = addDays(cursor, -1);
  }

  return { days, active: true };
}

export function eligibleTransactionCount(sources: readonly TransactionSource[]): number {
  return sources.filter((source) => source === "manual").length;
}

export function achievementKeys(input: AchievementInput): string[] {
  const manualActivities = input.activities.filter((activity) => activity.source === "manual");
  const keys: string[] = [];
  if (manualActivities.length > 0) keys.push("first_transaction");
  if (input.goalsCreated > 0) keys.push("first_goal_created");
  if (input.goalsCompleted > 0) keys.push("first_goal_completed");
  if (input.streakDays >= 7) keys.push("streak_7");
  if (input.streakDays >= 30) keys.push("streak_30");
  if (isMonthWithinBudget(input.budgetUsages)) {
    keys.push("month_within_budget");
  }
  if (input.subscriptions > 0) keys.push("first_subscription");
  if (hasTransactionCentury(manualActivities)) {
    keys.push("tx_100");
  }
  return keys;
}

function isMonthWithinBudget(usages: readonly number[]): boolean {
  return usages.length >= 2 && usages.every((usage) => usage <= 1);
}

function hasTransactionCentury(activities: readonly RegisteredActivity[]): boolean {
  return (
    activities.length >= 100 &&
    new Set(activities.map((activity) => activity.registeredOn)).size >= 20
  );
}

export function unlockAchievement(
  existingKeys: readonly string[],
  achievementKey: string
): string[] {
  return existingKeys.includes(achievementKey)
    ? [...existingKeys]
    : [...existingKeys, achievementKey];
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
