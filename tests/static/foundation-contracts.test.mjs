import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it, test } from "vitest";

const constantsSource = await readFile(
  new URL("../../src/config/business-constants.ts", import.meta.url),
  "utf8"
);
const resultSource = await readFile(
  new URL("../../src/application/result.ts", import.meta.url),
  "utf8"
);
const loggerSource = await readFile(
  new URL("../../src/infrastructure/logging/logger.ts", import.meta.url),
  "utf8"
);

for (const [name, value] of Object.entries({
  COMMERCIAL_MONTH_DAYS: 30,
  MAX_TRANSACTION_FUTURE_DAYS: 31,
  MAX_TRANSACTION_PAST_YEARS: 10,
  MAX_DESCRIPTION_LENGTH: 140,
  MAX_REAL_MOVEMENTS: 5000,
  MAX_CSV_ROWS: 5000,
  GOAL_AMBER_RATIO: 0.9,
  BUDGET_NORMAL_USAGE_MAX: 0.8,
  EXCHANGE_RATE_CONFIRMATION_THRESHOLD: 0.2,
  MAX_RECURRENCES_PER_RUN: 24,
  MIN_INSIGHT_HISTORY_MONTHS: 2,
  GOOD_SAVINGS_RATE: 0.2,
  DEMO_SESSION_HOURS: 24
})) {
  test(`[RNF-057] ${name} tiene el valor documentado`, () => {
    const numberPattern = String(value).split("").join("_?");
    assert.match(constantsSource, new RegExp(`export const ${name} = ${numberPattern}`));
  });
}

for (const declaration of constantsSource.matchAll(
  /\/\*\* (RN-\d+):[^\n]* \*\/\nexport const (\w+)/g
)) {
  const [, requirementId, name] = declaration;
  test(`[${requirementId}] ${name} tiene comentario de trazabilidad`, () => {
    assert.match(
      constantsSource,
      new RegExp(`/\\*\\* ${requirementId}:\\s[^\\n]+\\*/\\nexport const ${name}`)
    );
  });
}

test("[RNF-039][RNF-058] Result y AppError solo exponen códigos y requestId", () => {
  assert.match(resultSource, /code: ErrorCode/);
  assert.match(resultSource, /fieldErrors\?: Record<string, ErrorCode>/);
  assert.match(resultSource, /retryAfterSeconds\?: number/);
  assert.match(resultSource, /requestId: string/);
});

test("[RNF-039] ErrorCode contiene exactamente el catálogo actual", () => {
  const codes = [
    "VALIDATION_FAILED",
    "UNAUTHENTICATED",
    "OAUTH_FAILED",
    "FORBIDDEN_DEMO",
    "NOT_FOUND",
    "RATE_LIMITED",
    "CAPTCHA_FAILED",
    "DEMO_CAPACITY_REACHED",
    "QUOTA_EXCEEDED",
    "DATE_OUT_OF_RANGE",
    "CATEGORY_KIND_MISMATCH",
    "CURRENCY_LOCKED",
    "ACCOUNT_HAS_BALANCE",
    "ACCOUNT_HAS_TRANSACTIONS",
    "DUPLICATE_NAME",
    "GOAL_WITHDRAWAL_EXCEEDS_SAVED",
    "EXCHANGE_RATE_CONFIRM_REQUIRED",
    "FILE_TOO_LARGE",
    "FILE_INVALID",
    "UNEXPECTED"
  ];
  for (const code of codes) assert.match(resultSource, new RegExp(`\\| "${code}"`));
  assert.doesNotMatch(resultSource, /INVALID_CREDENTIALS|EMAIL_NOT_CONFIRMED/);
});

test("[RNF-058] logger acepta únicamente la lista blanca documentada", () => {
  assert.match(loggerSource, /requestId: string/);
  assert.match(loggerSource, /action: string/);
  assert.match(loggerSource, /errorCode\?: ErrorCode/);
  assert.match(loggerSource, /durationMs: number/);
  assert.doesNotMatch(loggerSource, /password|token|amount|description|email/i);
});

it.todo(
  "[RNF-045][RNF-044] paridad de claves ES/EN y traducción de cada ErrorCode (se activa en F4-T04)"
);
