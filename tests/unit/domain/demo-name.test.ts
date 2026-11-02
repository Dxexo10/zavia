import { describe, expect, it } from "vitest";
import { normalizeDemoName } from "../../../src/domain/demo-name";

describe("[RN-060][SEG-INP-03] nombre demo", () => {
  it.each(["María José", "O'Brien", "De la Cruz"])("acepta %s", (value) => {
    expect(normalizeDemoName(value)).toBe(value);
  });
  it.each(["J", "Juan<script>", "1234", "a".repeat(41), "Juan\u200B Pérez"])(
    "rechaza o elimina entrada insegura: %s",
    (value) => {
      if (value.includes("\u200B")) expect(normalizeDemoName(value)).toBe("Juan Pérez");
      else expect(() => normalizeDemoName(value)).toThrow();
    }
  );
});
