import { MAX_DEMO_NAME_LENGTH, MIN_DEMO_NAME_LENGTH } from "../config/business-constants";

const INVISIBLE_CHARACTERS = /[\u200B-\u200D\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const ALLOWED_NAME = /^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u;

export function normalizeDemoName(value: string): string {
  const normalized = value
    .normalize("NFC")
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim();
  if (
    normalized.length < MIN_DEMO_NAME_LENGTH ||
    normalized.length > MAX_DEMO_NAME_LENGTH ||
    !ALLOWED_NAME.test(normalized)
  ) {
    throw new RangeError("Nombre demo inválido.");
  }

  return normalized;
}
