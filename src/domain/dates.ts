import type { Clock } from "./clock";

import {
  MAX_TRANSACTION_FUTURE_DAYS,
  MAX_TRANSACTION_PAST_YEARS
} from "../config/business-constants";

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const LIMA_TIME_ZONE = "America/Lima";
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDate(value: string): CalendarDate {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) {
    throw new TypeError("La fecha debe usar YYYY-MM-DD.");
  }

  const [, yearSource, monthSource, daySource] = match;
  const date = {
    year: Number(yearSource),
    month: Number(monthSource),
    day: Number(daySource)
  };
  const instant = new Date(Date.UTC(date.year, date.month - 1, date.day));
  if (
    instant.getUTCFullYear() !== date.year ||
    instant.getUTCMonth() !== date.month - 1 ||
    instant.getUTCDate() !== date.day
  ) {
    throw new RangeError("La fecha debe ser una fecha de calendario válida.");
  }

  return date;
}

export function limaCalendarDate(instant: Date): string {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LIMA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(instant);
  const values = Object.fromEntries(
    dateParts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function isTransactionDateAllowed(occurredOn: string, clock: Clock): boolean {
  const candidate = parseCalendarDate(occurredOn);
  const today = parseCalendarDate(limaCalendarDate(clock.now()));
  const earliest = addCalendarYears(today, -MAX_TRANSACTION_PAST_YEARS);
  const latest = addCalendarDays(today, MAX_TRANSACTION_FUTURE_DAYS);

  return (
    compareCalendarDates(candidate, earliest) >= 0 && compareCalendarDates(candidate, latest) <= 0
  );
}

function addCalendarYears(date: CalendarDate, years: number): CalendarDate {
  const tentative = { ...date, year: date.year + years };
  const lastDay = daysInMonth(tentative.year, tentative.month);

  return { ...tentative, day: Math.min(tentative.day, lastDay) };
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const instant = new Date(Date.UTC(date.year, date.month - 1, date.day + days));

  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate()
  };
}

function compareCalendarDates(first: CalendarDate, second: CalendarDate): number {
  return calendarDateToOrdinal(first) - calendarDateToOrdinal(second);
}

function calendarDateToOrdinal(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
