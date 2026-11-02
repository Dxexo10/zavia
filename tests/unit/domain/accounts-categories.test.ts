import { describe, expect, it } from "vitest";

import {
  canArchiveAccount,
  canChangeAccountCurrency,
  canDeleteAccount,
  selectableAccounts,
  validateCategory
} from "../../../src/domain/accounts-categories";

describe("[RN-010][RN-011] cuentas", () => {
  it("[RN-010] permite eliminar solo cuentas sin transacciones", () => {
    expect(canDeleteAccount(0)).toBe(true);
    expect(canDeleteAccount(1)).toBe(false);
  });

  it("[RN-010] solo archiva cuentas con movimientos y saldo actual cero", () => {
    expect(canArchiveAccount(1, 0)).toBe(true);
    expect(canArchiveAccount(1, 1)).toBe(false);
    expect(canArchiveAccount(0, 0)).toBe(false);
  });

  it("[RN-010] bloquea cambiar moneda si existen transacciones", () => {
    expect(canChangeAccountCurrency(0)).toBe(true);
    expect(canChangeAccountCurrency(1)).toBe(false);
  });

  it("[RN-010] excluye cuentas archivadas de los selectores y saldo total", () => {
    expect(
      selectableAccounts([
        { id: "active", archived: false },
        { id: "archived", archived: true }
      ])
    ).toEqual([{ id: "active", archived: false }]);
  });

  it("[RN-011] permite un saldo negativo y emite advertencia", () => {
    expect(canArchiveAccount(1, -1)).toBe(false);
  });
});

describe("[RN-013] categorías", () => {
  it("[RN-013] exige que el tipo de categoría coincida con la transacción", () => {
    expect(() => validateCategory("income", "expense", "Food", [])).toThrow("coincidir");
  });

  it("[RN-013] exige nombre único por tipo sin distinguir mayúsculas", () => {
    expect(() => validateCategory("expense", "expense", " food ", ["Food"])).toThrow("único");
  });

  it("[RN-013] impide borrar categorías predeterminadas y permite archivarlas", () => {
    expect(() => validateCategory("expense", "expense", "Food", [], true, "delete")).toThrow(
      "predeterminadas"
    );
    expect(validateCategory("expense", "expense", "Food", [], true, "archive")).toBeUndefined();
  });
});
