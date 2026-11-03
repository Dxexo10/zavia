import { BUDGET_AMBER_USAGE_MAX, BUDGET_NORMAL_USAGE_MAX } from "../config/business-constants";

export interface BudgetVersion {
  effectiveFrom: string;
  limitMinor: number | null;
}

export interface BudgetMovement {
  kind: "expense" | "income" | "transfer";
  categoryId: string;
  occurredOn: string;
  baseMinor: number;
  deleted?: boolean;
}

export interface BudgetStatus {
  spentMinor: number;
  usage: number;
  level: "normal" | "amber" | "red";
  exceededMinor: number;
}

export function budgetForMonth(versions: readonly BudgetVersion[], month: string): number | null {
  const applicable = versions.filter((version) => version.effectiveFrom <= month);
  if (applicable.length === 0) return null;

  return [...applicable].sort((first, second) =>
    second.effectiveFrom.localeCompare(first.effectiveFrom)
  )[0].limitMinor;
}

export function spentForBudget(
  movements: readonly BudgetMovement[],
  categoryId: string,
  month: string
): number {
  return movements
    .filter(
      (movement) =>
        movement.kind === "expense" &&
        !movement.deleted &&
        movement.categoryId === categoryId &&
        movement.occurredOn.startsWith(month)
    )
    .reduce((sum, movement) => sum + movement.baseMinor, 0);
}

export function calculateBudgetStatus(limitMinor: number, spentMinor: number): BudgetStatus {
  if (limitMinor <= 0) throw new RangeError("El límite del presupuesto debe ser positivo.");

  const usage = spentMinor / limitMinor;
  const level =
    usage <= BUDGET_NORMAL_USAGE_MAX ? "normal" : usage <= BUDGET_AMBER_USAGE_MAX ? "amber" : "red";

  return { spentMinor, usage, level, exceededMinor: level === "red" ? spentMinor - limitMinor : 0 };
}
