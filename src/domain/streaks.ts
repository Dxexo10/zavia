export type TransactionSource = "manual" | "import" | "recurring" | "transfer" | "seed";

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
