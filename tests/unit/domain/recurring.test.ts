import { describe, expect, it } from "vitest";

import { monthlyEquivalentMinor, occurrencesDue } from "../../../src/domain/recurring";

describe("[RN-030] recurrencias", () => {
  it("[RN-030] conserva el día 31 usando el último día de meses cortos", () => {
    expect(
      occurrencesDue(
        { id: "rent", frequency: "monthly", startOn: "2026-01-31", status: "active" },
        "2026-04-30",
        []
      )
    ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]);
  });

  it("[RN-030] no duplica ocurrencias existentes y limita cada ejecución a 24", () => {
    expect(
      occurrencesDue(
        { id: "r", frequency: "weekly", startOn: "2026-01-01", status: "active" },
        "2026-12-31",
        ["2026-01-01"]
      )
    ).toHaveLength(24);
  });

  it("[RN-030] respeta pausas, cancelaciones, fecha de fin y años no bisiestos", () => {
    expect(
      occurrencesDue(
        { id: "paused", frequency: "monthly", startOn: "2026-01-01", status: "paused" },
        "2026-02-01",
        []
      )
    ).toEqual([]);
    expect(
      occurrencesDue(
        { id: "cancelled", frequency: "monthly", startOn: "2026-01-01", status: "cancelled" },
        "2026-02-01",
        []
      )
    ).toEqual([]);
    expect(
      occurrencesDue(
        {
          id: "ended",
          frequency: "monthly",
          startOn: "2026-01-01",
          endOn: "2026-01-31",
          status: "active"
        },
        "2026-03-01",
        []
      )
    ).toEqual(["2026-01-01"]);
    expect(
      occurrencesDue(
        { id: "leap", frequency: "yearly", startOn: "2024-02-29", status: "active" },
        "2025-12-31",
        []
      )
    ).toEqual(["2024-02-29", "2025-02-28"]);
    expect(
      occurrencesDue(
        { id: "year-end", frequency: "monthly", startOn: "2026-12-31", status: "active" },
        "2027-01-31",
        []
      )
    ).toEqual(["2026-12-31", "2027-01-31"]);
  });
});

describe("[RN-031] equivalente mensual", () => {
  it("[RN-031] convierte mensual, anual y semanal", () => {
    expect(monthlyEquivalentMinor("monthly", 4_500)).toBe(4_500);
    expect(monthlyEquivalentMinor("yearly", 24_000)).toBe(2_000);
    expect(monthlyEquivalentMinor("weekly", 1_000)).toBe(4_333);
  });
});
