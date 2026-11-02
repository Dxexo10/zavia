import {
  CATEGORY_ALERT_MIN_DIFFERENCE,
  CATEGORY_ALERT_MULTIPLIER,
  CATEGORY_ATTENTION_MIN_DIFFERENCE,
  CATEGORY_ATTENTION_MULTIPLIER,
  GOOD_SAVINGS_RATE,
  HEAVY_SUBSCRIPTIONS_RATIO,
  MAX_MICRO_EXPENSE_AMOUNT,
  MICRO_EXPENSES_RATIO,
  MIN_BUDGET_PROJECTION_DAYS,
  MIN_INSIGHT_HISTORY_MONTHS,
  MIN_MICRO_EXPENSE_COUNT
} from "../config/business-constants";

export type InsightSeverity = "info" | "attention" | "alert";
export interface Insight {
  severity: InsightSeverity;
  ruleKey: string;
}

export function categorySpendInsight(input: {
  historyMonths: number;
  averageMinor: number;
  currentMinor: number;
}): Insight | null {
  if (input.historyMonths < MIN_INSIGHT_HISTORY_MONTHS) return null;
  const difference = input.currentMinor - input.averageMinor;
  if (
    input.currentMinor >= input.averageMinor * CATEGORY_ALERT_MULTIPLIER &&
    difference >= CATEGORY_ALERT_MIN_DIFFERENCE
  )
    return { ruleKey: "category_spend", severity: "alert" };
  if (
    input.currentMinor >= input.averageMinor * CATEGORY_ATTENTION_MULTIPLIER &&
    difference >= CATEGORY_ATTENTION_MIN_DIFFERENCE
  )
    return { ruleKey: "category_spend", severity: "attention" };
  return null;
}

export function subscriptionWeightInsight(
  monthlySubscriptionsMinor: number,
  averageIncomeMinor: number
): Insight | null {
  return monthlySubscriptionsMinor > averageIncomeMinor * HEAVY_SUBSCRIPTIONS_RATIO
    ? { ruleKey: "heavy_subscriptions", severity: "attention" }
    : null;
}

export function microExpensesInsight(
  expensesMinor: readonly number[],
  totalExpensesMinor: number
): Insight | null {
  const microExpenses = expensesMinor.filter((amount) => amount <= MAX_MICRO_EXPENSE_AMOUNT * 100);
  const totalMicroExpenses = microExpenses.reduce((sum, amount) => sum + amount, 0);
  return microExpenses.length >= MIN_MICRO_EXPENSE_COUNT &&
    totalMicroExpenses >= totalExpensesMinor * MICRO_EXPENSES_RATIO
    ? { ruleKey: "micro_expenses", severity: "info" }
    : null;
}

export function savingsRateInsight(incomeMinor: number, expenseMinor: number): Insight | null {
  return incomeMinor > 0 && (incomeMinor - expenseMinor) / incomeMinor >= GOOD_SAVINGS_RATE
    ? { ruleKey: "good_savings", severity: "info" }
    : null;
}

export function budgetRiskInsight(input: {
  elapsedDays: number;
  daysInMonth: number;
  spentMinor: number;
  limitMinor: number;
}): Insight | null {
  if (input.elapsedDays < MIN_BUDGET_PROJECTION_DAYS || input.spentMinor > input.limitMinor) {
    return null;
  }

  return input.spentMinor * input.daysInMonth > input.limitMinor * input.elapsedDays
    ? { ruleKey: "budget_risk", severity: "attention" }
    : null;
}

export function goalAdjustmentInsight(
  state: "on_track" | "at_risk" | "behind",
  requiredMonthlyMinor: number,
  monthlyPaceMinor: number
): (Insight & { adjustmentMinor: number }) | null {
  if (state === "on_track") return null;

  return {
    ruleKey: "goal_adjustment",
    severity: state === "at_risk" ? "attention" : "alert",
    adjustmentMinor: requiredMonthlyMinor - monthlyPaceMinor
  };
}
