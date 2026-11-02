import {
  MAX_RECURRENCES_PER_RUN,
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR
} from "../config/business-constants";

export type RecurrenceFrequency = "weekly" | "monthly" | "yearly";

export interface RecurrenceRule {
  id: string;
  frequency: RecurrenceFrequency;
  startOn: string;
  endOn?: string;
  status: "active" | "paused" | "cancelled";
}

export function occurrencesDue(
  rule: RecurrenceRule,
  today: string,
  existingOccurrenceDates: readonly string[]
): string[] {
  if (rule.status !== "active") return [];

  const occurrences: string[] = [];
  let occurrence = rule.startOn;
  while (occurrence <= today && (!rule.endOn || occurrence <= rule.endOn)) {
    if (!existingOccurrenceDates.includes(occurrence)) occurrences.push(occurrence);
    if (occurrences.length === MAX_RECURRENCES_PER_RUN) return occurrences;
    occurrence = nextOccurrence(rule, occurrence);
  }

  return occurrences;
}

export function monthlyEquivalentMinor(
  frequency: RecurrenceFrequency,
  amountMinor: number
): number {
  if (frequency === "monthly") return amountMinor;
  if (frequency === "yearly") return roundHalfUp(amountMinor, MONTHS_PER_YEAR);

  return roundHalfUp(amountMinor * WEEKS_PER_YEAR, MONTHS_PER_YEAR);
}

function nextOccurrence(rule: RecurrenceRule, occurrence: string): string {
  if (rule.frequency === "weekly") return addDays(occurrence, 7);
  if (rule.frequency === "yearly")
    return anchoredDate(rule.startOn, yearOf(occurrence) + 1, monthOf(rule.startOn));

  const nextMonth = monthOf(occurrence) === 12 ? 1 : monthOf(occurrence) + 1;
  const nextYear = monthOf(occurrence) === 12 ? yearOf(occurrence) + 1 : yearOf(occurrence);
  return anchoredDate(rule.startOn, nextYear, nextMonth);
}

function anchoredDate(anchor: string, year: number, month: number): string {
  const day = Math.min(dayOf(anchor), daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

function monthOf(date: string): number {
  return Number(date.slice(5, 7));
}

function dayOf(date: string): number {
  return Number(date.slice(8, 10));
}

function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((numerator * 2 + denominator) / (denominator * 2));
}
