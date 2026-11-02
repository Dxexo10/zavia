import { expect, it } from "vitest";
import { moneySchema, transactionInputSchema } from "../../../src/domain/schemas";

it("[RN-001][RN-005] valida dinero y rechaza campos desconocidos", () => {
  expect(moneySchema.safeParse({ minor: 100, currency: "PEN" }).success).toBe(true);
  expect(moneySchema.safeParse({ minor: 1.5, currency: "PEN" }).success).toBe(false);
  expect(
    transactionInputSchema.safeParse({
      amount: { minor: 100, currency: "PEN" },
      occurredOn: "2026-10-29",
      extra: true
    }).success
  ).toBe(false);
});
