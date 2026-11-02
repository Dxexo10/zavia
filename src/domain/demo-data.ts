import { calculateBudgetStatus } from "./budgets";
import { projectGoal, type GoalInput, type GoalProjection } from "./goals";

export interface DemoData {
  accounts: { name: string; currency: "PEN" | "USD" }[];
  goals: { name: string; input: GoalInput; projection: GoalProjection }[];
  budgets: {
    category: string;
    spentMinor: number;
    limitMinor: number;
    level: "normal" | "amber" | "red";
  }[];
  recurring: { frequency: "weekly" | "monthly" | "yearly"; subscription: boolean }[];
  insights: { ruleKey: string }[];
  streakDays: number;
  achievements: string[];
  transactions: { occurredOn: string; source: "seed" }[];
  generatedFor: string;
}

export function generateDemoData(today: string): DemoData {
  const goalSeeds: { name: string; input: GoalInput }[] = [
    goalSeed("Emergency fund", 600_000, 360_000, 150, 180_000, today),
    goalSeed("Trip", 400_000, 200_000, 120, 138_000, today),
    goalSeed("Laptop", 300_000, 120_000, 90, 120_000, today)
  ];
  const budgetSeeds = [
    { category: "food", spentMinor: 35_000, limitMinor: 50_000 },
    { category: "leisure", spentMinor: 46_000, limitMinor: 50_000 },
    { category: "transport", spentMinor: 59_000, limitMinor: 50_000 }
  ];
  return {
    generatedFor: today,
    accounts: [
      { name: "Cash", currency: "PEN" },
      { name: "Salary account", currency: "PEN" },
      { name: "Credit card", currency: "PEN" },
      { name: "Savings", currency: "USD" }
    ],
    goals: goalSeeds.map(({ name, input }) => ({
      name,
      input,
      projection: projectGoal(input, today)
    })),
    budgets: budgetSeeds.map((seed) => ({
      ...seed,
      level: calculateBudgetStatus(seed.limitMinor, seed.spentMinor).level
    })),
    recurring: [
      { frequency: "monthly", subscription: true },
      { frequency: "yearly", subscription: true },
      { frequency: "weekly", subscription: true },
      { frequency: "monthly", subscription: false }
    ],
    insights: [
      { ruleKey: "category_spend" },
      { ruleKey: "budget_risk" },
      { ruleKey: "goal_adjustment" }
    ],
    streakDays: 12,
    achievements: ["first_transaction", "first_goal_created", "first_subscription", "streak_7"],
    transactions: Array.from({ length: 150 }, (_, index) => ({
      occurredOn: addDays(today, -(index % 100)),
      source: "seed"
    }))
  };
}

function goalSeed(
  name: string,
  targetMinor: number,
  savedMinor: number,
  deadlineOffset: number,
  contributionMinor: number,
  today: string
): { name: string; input: GoalInput } {
  return {
    name,
    input: {
      targetMinor,
      savedMinor,
      deadline: addDays(today, deadlineOffset),
      status: "active",
      entries: [
        { kind: "contribution", amountMinor: contributionMinor, occurredOn: addDays(today, -90) }
      ]
    }
  };
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
