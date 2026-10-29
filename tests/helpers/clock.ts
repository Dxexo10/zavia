import type { Clock } from "@/domain/clock";

export const TODAY = new Date("2026-10-29T12:00:00-05:00");

export function createFixedClock(): Clock {
  return { now: () => new Date(TODAY) };
}
