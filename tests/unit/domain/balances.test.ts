import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  calculateAccountBalance,
  createTransfer,
  implicitExchangeRate,
  type AccountBalanceInput,
  type Transaction
} from "../../../src/domain/balances";
import { createMoney } from "../../../src/domain/money";

import { createFixedClock } from "../../helpers/clock";

const account: AccountBalanceInput = {
  id: "account-a",
  currency: "PEN",
  openingBalance: createMoney(50_000, "PEN")
};

describe("[RN-002] saldos", () => {
  it("[RN-002] calcula saldo actual y proyectado del ejemplo documentado", () => {
    const transactions: Transaction[] = [
      { kind: "expense", amount: createMoney(5_000, "PEN"), occurredOn: "2026-10-29" },
      { kind: "income", amount: createMoney(20_000, "PEN"), occurredOn: "2026-10-29" },
      { kind: "expense", amount: createMoney(3_000, "PEN"), occurredOn: "2026-11-08" }
    ];

    expect(calculateAccountBalance(account, transactions, [], createFixedClock())).toEqual({
      currentMinor: 65_000,
      projectedMinor: 62_000
    });
  });

  it("[RN-002] excluye movimientos eliminados", () => {
    const transactions: Transaction[] = [
      {
        kind: "expense",
        amount: createMoney(5_000, "PEN"),
        occurredOn: "2026-10-29",
        deletedAt: "2026-10-29T12:00:00.000Z"
      }
    ];

    expect(calculateAccountBalance(account, transactions, [], createFixedClock())).toEqual({
      currentMinor: 50_000,
      projectedMinor: 50_000
    });
  });

  it("[RN-002][RNF-011] recálcula el saldo desde todos los movimientos", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 1, max: 10_000 }), { maxLength: 30 }), (amounts) => {
        const transactions = amounts.map((minor, index) => ({
          kind: index % 2 === 0 ? ("income" as const) : ("expense" as const),
          amount: createMoney(minor, "PEN"),
          occurredOn: "2026-10-29"
        }));
        const expected = amounts.reduce(
          (balance, minor, index) => balance + (index % 2 === 0 ? minor : -minor),
          50_000
        );

        expect(
          calculateAccountBalance(account, transactions, [], createFixedClock()).currentMinor
        ).toBe(expected);
      })
    );
  });
});

describe("[RN-007] transferencias", () => {
  it("[RN-007] deriva la tasa implícita de los dos montos entre monedas distintas", () => {
    const transfer = createTransfer({
      fromAccountId: "pen",
      toAccountId: "usd",
      amountOut: createMoney(10_000, "PEN"),
      amountIn: createMoney(2_500, "USD"),
      occurredOn: "2026-10-29"
    });

    expect(implicitExchangeRate(transfer)).toEqual({ numerator: 1, denominator: 4 });
  });

  it("[RN-007] aplica una transferencia misma moneda a origen y destino sin ingreso o gasto", () => {
    const transfer = createTransfer({
      fromAccountId: "account-a",
      toAccountId: "account-b",
      amountOut: createMoney(10_000, "PEN"),
      amountIn: createMoney(10_000, "PEN"),
      occurredOn: "2026-10-29"
    });
    const destination: AccountBalanceInput = {
      id: "account-b",
      currency: "PEN",
      openingBalance: createMoney(0, "PEN")
    };

    expect(calculateAccountBalance(account, [], [transfer], createFixedClock()).currentMinor).toBe(
      40_000
    );
    expect(
      calculateAccountBalance(destination, [], [transfer], createFixedClock()).currentMinor
    ).toBe(10_000);
  });

  it("[RN-007] rechaza origen y destino iguales y montos distintos en la misma moneda", () => {
    expect(() =>
      createTransfer({
        fromAccountId: "account-a",
        toAccountId: "account-a",
        amountOut: createMoney(100, "PEN"),
        amountIn: createMoney(100, "PEN"),
        occurredOn: "2026-10-29"
      })
    ).toThrow("distintas");
    expect(() =>
      createTransfer({
        fromAccountId: "account-a",
        toAccountId: "account-b",
        amountOut: createMoney(100, "PEN"),
        amountIn: createMoney(101, "PEN"),
        occurredOn: "2026-10-29"
      })
    ).toThrow("iguales");
  });
});
