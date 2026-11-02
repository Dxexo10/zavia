import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  addMoney,
  convertToBaseCurrency,
  createMoney,
  roundHalfUp,
  requiresExchangeRateConfirmation
} from "../../../src/domain/money";

describe("[RN-001][RN-003] dinero y redondeo", () => {
  it("[RN-001][RNF-013] conserva los importes como enteros menores con moneda", () => {
    expect(createMoney(30, "PEN")).toEqual({ minor: 30, currency: "PEN" });
    expect(() => createMoney(30.5, "PEN")).toThrow("entero seguro");
  });

  it("[RN-003] redondea half-up los ejemplos documentados", () => {
    expect(roundHalfUp("2.345", 2)).toBe("2.35");
    expect(roundHalfUp("2.344", 2)).toBe("2.34");
    expect(roundHalfUp("0.005", 2)).toBe("0.01");
    expect(roundHalfUp("-2.345", 2)).toBe("-2.35");
    expect(roundHalfUp("2.5", 0)).toBe("3");
  });

  it("[RN-003] rechaza precisión o representación decimal inválida", () => {
    expect(() => roundHalfUp("1", -1)).toThrow("entero no negativo");
    expect(() => roundHalfUp("1e-3", 2)).toThrow("representación decimal");
  });

  it("[RN-001][RNF-013] suma céntimos sin error de coma flotante", () => {
    expect(addMoney(createMoney(10, "PEN"), createMoney(20, "PEN"))).toEqual(
      createMoney(30, "PEN")
    );
  });

  it("[RN-001] rechaza sumar monedas distintas sin conversión", () => {
    expect(() => addMoney(createMoney(100, "PEN"), createMoney(100, "USD"))).toThrow(
      "monedas distintas"
    );
  });
});

describe("[RN-027] conversión de moneda", () => {
  it("[RN-027] convierte USD a PEN con tipo 3.75 y redondeo half-up", () => {
    expect(convertToBaseCurrency(createMoney(2_000, "USD"), "PEN", "3.75")).toEqual(
      createMoney(7_500, "PEN")
    );
    expect(convertToBaseCurrency(createMoney(1_999, "USD"), "PEN", "3.75")).toEqual(
      createMoney(7_496, "PEN")
    );
  });

  it("[RN-027] no altera importes ya expresados en moneda base", () => {
    expect(convertToBaseCurrency(createMoney(2_000, "PEN"), "PEN", "3.75")).toEqual(
      createMoney(2_000, "PEN")
    );
  });

  it("[RN-027] convierte PEN a USD con el inverso del tipo de cambio", () => {
    expect(convertToBaseCurrency(createMoney(7_500, "PEN"), "USD", 3.75)).toEqual(
      createMoney(2_000, "USD")
    );
  });

  it("[RN-027] exige confirmación cuando el cambio supera 20 %", () => {
    expect(requiresExchangeRateConfirmation("3.75", "4.50")).toBe(false);
    expect(requiresExchangeRateConfirmation("3.75", "4.51")).toBe(true);
  });

  it("[RN-027] rechaza tipos de cambio no positivos", () => {
    expect(() => convertToBaseCurrency(createMoney(100, "USD"), "PEN", "0")).toThrow(
      "mayor que cero"
    );
    expect(() => requiresExchangeRateConfirmation("-1", "3.75")).toThrow("mayor que cero");
  });

  it("[RN-027] la conversión y el redondeo son monótonos", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99_999_999 }),
        fc.integer({ min: 0, max: 99_999_999 }),
        fc.integer({ min: 1, max: 1_000 }),
        (firstMinor, secondMinor, rateMinor) => {
          const lowerMinor = Math.min(firstMinor, secondMinor);
          const higherMinor = Math.max(firstMinor, secondMinor);
          const rate = `${Math.floor(rateMinor / 100)}.${String(rateMinor % 100).padStart(2, "0")}`;

          const lower = convertToBaseCurrency(createMoney(lowerMinor, "USD"), "PEN", rate);
          const higher = convertToBaseCurrency(createMoney(higherMinor, "USD"), "PEN", rate);

          expect(lower.minor).toBeLessThanOrEqual(higher.minor);
        }
      )
    );
  });
});
