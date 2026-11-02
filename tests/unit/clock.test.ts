import { describe, expect, it } from "vitest";

import { FixedClock } from "../../src/domain/clock";

import { createFixedClock, TODAY } from "../helpers/clock";

describe("[RNF-057] reloj fijo", () => {
  it("[RNF-057] devuelve una copia estable en America/Lima", () => {
    const clock = createFixedClock();
    expect(clock.now()).toEqual(TODAY);
    expect(clock.now()).not.toBe(TODAY);
  });

  it("[RNF-057] inyecta una copia de la hora sin usar Date.now", () => {
    const instant = new Date("2026-10-29T12:00:00-05:00");
    const clock = new FixedClock(instant);

    expect(clock.now()).toEqual(instant);
    expect(clock.now()).not.toBe(instant);
  });
});
