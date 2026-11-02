export interface DemoData {
  accounts: { name: string; currency: "PEN" | "USD" }[];
  goals: { name: string; light: "green" | "amber" | "red" }[];
  budgets: { category: string; level: "normal" | "amber" | "red" }[];
  recurring: { frequency: "weekly" | "monthly" | "yearly"; subscription: boolean }[];
  insights: { ruleKey: string }[];
  streakDays: number;
  achievements: string[];
  transactions: { occurredOn: string; source: "seed" }[];
  generatedFor: string;
}

export function generateDemoData(today: string): DemoData {
  return {
    generatedFor: today,
    accounts: [
      { name: "Cash", currency: "PEN" },
      { name: "Salary account", currency: "PEN" },
      { name: "Credit card", currency: "PEN" },
      { name: "Savings", currency: "USD" }
    ],
    goals: [
      { name: "Emergency fund", light: "green" },
      { name: "Trip", light: "amber" },
      { name: "Laptop", light: "red" }
    ],
    budgets: [
      { category: "food", level: "normal" },
      { category: "leisure", level: "amber" },
      { category: "transport", level: "red" }
    ],
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

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
