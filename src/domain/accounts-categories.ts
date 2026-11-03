export interface SelectableAccount {
  id: string;
  archived: boolean;
}

export type CategoryKind = "income" | "expense";
export type CategoryAction = "delete" | "archive" | "rename";

export function canDeleteAccount(transactionCount: number): boolean {
  return transactionCount === 0;
}

export function canArchiveAccount(transactionCount: number, currentBalanceMinor: number): boolean {
  return transactionCount > 0 && currentBalanceMinor === 0;
}

export function canChangeAccountCurrency(transactionCount: number): boolean {
  return transactionCount === 0;
}

export function selectableAccounts(accounts: readonly SelectableAccount[]): SelectableAccount[] {
  return accounts.filter((account) => !account.archived);
}

export function validateCategory(
  transactionKind: CategoryKind,
  categoryKind: CategoryKind,
  name: string,
  existingNames: readonly string[],
  isDefault = false,
  action: CategoryAction = "rename"
): void {
  if (transactionKind !== categoryKind) {
    throw new RangeError("El tipo de categoría debe coincidir con la transacción.");
  }
  if (isDefault && action === "delete") {
    throw new RangeError("Las categorías predeterminadas no se pueden eliminar.");
  }
  if (
    existingNames.some(
      (existingName) => normalizeCategoryName(existingName) === normalizeCategoryName(name)
    )
  ) {
    throw new RangeError("El nombre de categoría debe ser único por tipo.");
  }
}

function normalizeCategoryName(name: string): string {
  return name.trim().toLocaleLowerCase("en-US");
}
