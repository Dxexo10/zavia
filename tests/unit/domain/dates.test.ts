import { describe, expect, it } from "vitest";

import {
  isTransactionDateAllowed,
  limaCalendarDate,
  parseCalendarDate
} from "../../../src/domain/dates";

import { createFixedClock } from "../../helpers/clock";

describe("[RN-004] fechas permitidas", () => {
  it("[RN-004] acepta hoy más 31 días y rechaza hoy más 32 días", () => {
    const clock = createFixedClock();

    expect(isTransactionDateAllowed("2026-11-29", clock)).toBe(true);
    expect(isTransactionDateAllowed("2026-11-30", clock)).toBe(false);
  });

  it("[RN-004] acepta exactamente 10 años atrás y rechaza un día anterior", () => {
    const clock = createFixedClock();

    expect(isTransactionDateAllowed("2016-10-29", clock)).toBe(true);
    expect(isTransactionDateAllowed("2016-10-28", clock)).toBe(false);
  });

  it("[RN-004] rechaza un día de calendario inválido", () => {
    expect(() => parseCalendarDate("2026-02-29")).toThrow("fecha de calendario válida");
  });
});

describe("[RN-070][RNF-014] día en America/Lima", () => {
  it("[RN-070][RNF-014] cambia de día exactamente entre 04:59 y 05:00 UTC", () => {
    expect(limaCalendarDate(new Date("2026-10-30T04:59:00.000Z"))).toBe("2026-10-29");
    expect(limaCalendarDate(new Date("2026-10-30T05:00:00.000Z"))).toBe("2026-10-30");
  });

  it("[RN-070][RNF-014] admite años bisiestos y fines de mes", () => {
    expect(parseCalendarDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseCalendarDate("2026-12-31")).toEqual({ year: 2026, month: 12, day: 31 });
  });
});
