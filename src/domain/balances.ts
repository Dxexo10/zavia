import type { Clock } from "./clock";
import { limaCalendarDate, parseCalendarDate } from "./dates";
import type { Money } from "./money";

export interface AccountBalanceInput {
  id: string;
  currency: Money["currency"];
  openingBalance: Money;
}

export interface Transaction {
  kind: "income" | "expense";
  amount: Money;
  occurredOn: string;
  deletedAt?: string;
}

export interface Transfer {
  fromAccountId: string;
  toAccountId: string;
  amountOut: Money;
  amountIn: Money;
  occurredOn: string;
  deletedAt?: string;
}

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amountOut: Money;
  amountIn: Money;
  occurredOn: string;
}

export interface AccountBalance {
  currentMinor: number;
  projectedMinor: number;
}

export function createTransfer(input: TransferInput): Transfer {
  if (input.fromAccountId === input.toAccountId) {
    throw new RangeError("Las cuentas de una transferencia deben ser distintas.");
  }
  if (input.amountOut.minor <= 0 || input.amountIn.minor <= 0) {
    throw new RangeError("Los montos de una transferencia deben ser positivos.");
  }
  if (
    input.amountOut.currency === input.amountIn.currency &&
    input.amountOut.minor !== input.amountIn.minor
  ) {
    throw new RangeError("Los montos de la misma moneda deben ser iguales.");
  }

  parseCalendarDate(input.occurredOn);

  return { ...input };
}

export function calculateAccountBalance(
  account: AccountBalanceInput,
  transactions: readonly Transaction[],
  transfers: readonly Transfer[],
  clock: Clock
): AccountBalance {
  const today = limaCalendarDate(clock.now());
  const transactionBalance = transactions.reduce(
    (balance, transaction) => applyTransaction(balance, transaction, account.currency, today),
    { currentMinor: account.openingBalance.minor, projectedMinor: account.openingBalance.minor }
  );

  return transfers.reduce(
    (balance, transfer) => applyTransfer(balance, transfer, account.id, account.currency, today),
    transactionBalance
  );
}

function applyTransaction(
  balance: AccountBalance,
  transaction: Transaction,
  currency: Money["currency"],
  today: string
): AccountBalance {
  if (transaction.deletedAt !== undefined || transaction.amount.currency !== currency) {
    return balance;
  }

  parseCalendarDate(transaction.occurredOn);
  const signedAmount =
    transaction.kind === "income" ? transaction.amount.minor : -transaction.amount.minor;

  return {
    currentMinor:
      transaction.occurredOn <= today ? balance.currentMinor + signedAmount : balance.currentMinor,
    projectedMinor: balance.projectedMinor + signedAmount
  };
}

function applyTransfer(
  balance: AccountBalance,
  transfer: Transfer,
  accountId: string,
  currency: Money["currency"],
  today: string
): AccountBalance {
  if (transfer.deletedAt !== undefined) {
    return balance;
  }

  parseCalendarDate(transfer.occurredOn);
  const amount = transferAmountForAccount(transfer, accountId, currency);
  if (amount === 0) {
    return balance;
  }

  return {
    currentMinor:
      transfer.occurredOn <= today ? balance.currentMinor + amount : balance.currentMinor,
    projectedMinor: balance.projectedMinor + amount
  };
}

function transferAmountForAccount(
  transfer: Transfer,
  accountId: string,
  currency: Money["currency"]
): number {
  if (transfer.fromAccountId === accountId && transfer.amountOut.currency === currency) {
    return -transfer.amountOut.minor;
  }
  if (transfer.toAccountId === accountId && transfer.amountIn.currency === currency) {
    return transfer.amountIn.minor;
  }

  return 0;
}
