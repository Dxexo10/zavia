import { describe, expect, it } from "vitest";

import { isDuplicateCsvRow, parseCsvAmount, parseCsvDate } from "../../../src/domain/csv";

describe("[RN-014] CSV", () => {
  it("[RN-014] acepta YYYY-MM-DD y DD/MM/YYYY", () => {
    expect(parseCsvDate("2026-03-05")).toBe("2026-03-05");
    expect(parseCsvDate("05/03/2026")).toBe("2026-03-05");
  });

  it("[RN-014] rechaza fechas y montos ambiguos o inválidos", () => {
    expect(() => parseCsvDate("2026/03/05")).toThrow();
    expect(() => parseCsvDate("32/01/2026")).toThrow();
    expect(parseCsvAmount("1,234.50")).toBe(123_450);
    expect(parseCsvAmount("-45.9")).toBe(-4_590);
    for (const value of ["1.234,50", "0", "12.345", "S/ 45"])
      expect(() => parseCsvAmount(value)).toThrow();
  });
});

describe("[RN-012] duplicados CSV", () => {
  it("[RN-012] identifica mayúsculas y espacios distintos como la misma descripción", () => {
    expect(
      isDuplicateCsvRow(
        {
          accountId: "a",
          occurredOn: "2026-03-05",
          amountMinor: -4_590,
          description: "  Café   central "
        },
        {
          accountId: "a",
          occurredOn: "2026-03-05",
          amountMinor: -4_590,
          description: "café central"
        }
      )
    ).toBe(true);
  });
});
