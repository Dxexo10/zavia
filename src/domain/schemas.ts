import { z } from "zod";

export const currencySchema = z.enum(["PEN", "USD"]);
export const moneySchema = z
  .object({ minor: z.number().int().safe(), currency: currencySchema })
  .strict();
export const transactionInputSchema = z
  .object({ amount: moneySchema, occurredOn: z.string().date() })
  .strict();
