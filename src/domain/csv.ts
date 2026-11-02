export interface CsvRowIdentity {
  accountId: string;
  occurredOn: string;
  amountMinor: number;
  description: string;
}

export interface CsvRawRow {
  occurredOn: string;
  amount: string;
  description: string;
}

export type CsvBatchResult =
  | {
      status: "valid" | "possible_duplicate";
      row: Omit<CsvRowIdentity, "accountId">;
    }
  | { status: "invalid"; reason: "invalid_date" | "invalid_amount" };

export function parseCsvBatch(
  accountId: string,
  rows: readonly CsvRawRow[],
  existingRows: readonly CsvRowIdentity[]
): CsvBatchResult[] {
  const knownRows = [...existingRows];
  return rows.map((raw) => {
    let occurredOn: string;
    try {
      occurredOn = parseCsvDate(raw.occurredOn);
    } catch {
      return { status: "invalid", reason: "invalid_date" };
    }
    let amountMinor: number;
    try {
      amountMinor = parseCsvAmount(raw.amount);
    } catch {
      return { status: "invalid", reason: "invalid_amount" };
    }
    const identity = { accountId, occurredOn, amountMinor, description: raw.description };
    const row = { occurredOn, amountMinor, description: raw.description };
    if (knownRows.some((known) => isDuplicateCsvRow(known, identity))) {
      return { status: "possible_duplicate", row };
    }
    knownRows.push(identity);
    return { status: "valid", row };
  });
}

export function parseCsvDate(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const parts = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2], local[1]] : null;
  if (parts === null) throw new TypeError("Fecha CSV inválida.");
  const [year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new RangeError("Fecha CSV inválida.");
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

export function parseCsvAmount(value: string): number {
  if (!/^-?(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{1,2})?$/.test(value))
    throw new TypeError("Monto CSV inválido.");
  const sign = value.startsWith("-") ? -1 : 1;
  const [integerPart, decimalPart = ""] = value.replace("-", "").split(".");
  const minor = Number(integerPart.replaceAll(",", "")) * 100 + Number(decimalPart.padEnd(2, "0"));
  if (minor === 0) throw new RangeError("Monto CSV inválido.");
  return sign * minor;
}

export function isDuplicateCsvRow(first: CsvRowIdentity, second: CsvRowIdentity): boolean {
  return (
    first.accountId === second.accountId &&
    first.occurredOn === second.occurredOn &&
    first.amountMinor === second.amountMinor &&
    normalizeDescription(first.description) === normalizeDescription(second.description)
  );
}

function normalizeDescription(value: string): string {
  return value.trim().toLocaleLowerCase("es-PE").replace(/\s+/g, " ");
}
