export type ErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "OAUTH_FAILED"
  | "FORBIDDEN_DEMO"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CAPTCHA_FAILED"
  | "DEMO_CAPACITY_REACHED"
  | "QUOTA_EXCEEDED"
  | "DATE_OUT_OF_RANGE"
  | "CATEGORY_KIND_MISMATCH"
  | "CURRENCY_LOCKED"
  | "ACCOUNT_HAS_BALANCE"
  | "ACCOUNT_HAS_TRANSACTIONS"
  | "DUPLICATE_NAME"
  | "GOAL_WITHDRAWAL_EXCEEDS_SAVED"
  | "EXCHANGE_RATE_CONFIRM_REQUIRED"
  | "FILE_TOO_LARGE"
  | "FILE_INVALID"
  | "UNEXPECTED";

export type AchievementKey = string;

export type AppError = {
  code: ErrorCode;
  fieldErrors?: Record<string, ErrorCode>;
  retryAfterSeconds?: number;
  requestId: string;
};

export type Result<T> =
  | { ok: true; data: T; meta?: { unlockedAchievements?: AchievementKey[] } }
  | { ok: false; error: AppError };
