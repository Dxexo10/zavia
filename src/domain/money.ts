import { EXCHANGE_RATE_CONFIRMATION_THRESHOLD } from "../config/business-constants";

export type Currency = "PEN" | "USD";

export interface Money {
  minor: number;
  currency: Currency;
}

type DecimalInput = number | string;

interface DecimalFraction {
  numerator: bigint;
  denominator: bigint;
}

const DECIMAL_PATTERN = /^([+-]?)(\d+)(?:\.(\d+))?$/;

export function createMoney(minor: number, currency: Currency): Money {
  if (!Number.isSafeInteger(minor)) {
    throw new RangeError("El importe menor debe ser un entero seguro.");
  }

  return { minor, currency };
}

export function addMoney(first: Money, second: Money): Money {
  if (first.currency !== second.currency) {
    throw new RangeError("No se pueden sumar monedas distintas.");
  }

  return createMoney(first.minor + second.minor, first.currency);
}

export function roundHalfUp(value: DecimalInput, decimalPlaces: number): string {
  if (!Number.isSafeInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new RangeError("La cantidad de decimales debe ser un entero no negativo.");
  }

  const fraction = toDecimalFraction(value);
  const scale = 10n ** BigInt(decimalPlaces);
  const rounded = roundRatioHalfUp(fraction.numerator * scale, fraction.denominator);

  return formatScaledDecimal(rounded, decimalPlaces);
}

export function convertToBaseCurrency(
  money: Money,
  baseCurrency: Currency,
  usdPenRate: DecimalInput
): Money {
  if (money.currency === baseCurrency) {
    return createMoney(money.minor, baseCurrency);
  }

  const rate = toPositiveDecimalFraction(usdPenRate);
  const convertedMinor =
    money.currency === "USD" && baseCurrency === "PEN"
      ? roundRatioHalfUp(BigInt(money.minor) * rate.numerator, rate.denominator)
      : roundRatioHalfUp(BigInt(money.minor) * rate.denominator, rate.numerator);

  return createMoney(Number(convertedMinor), baseCurrency);
}

export function requiresExchangeRateConfirmation(
  previousRate: DecimalInput,
  nextRate: DecimalInput
): boolean {
  const previous = toPositiveDecimalFraction(previousRate);
  const next = toPositiveDecimalFraction(nextRate);
  const threshold = toPositiveDecimalFraction(EXCHANGE_RATE_CONFIRMATION_THRESHOLD);
  const difference = absoluteBigInt(
    next.numerator * previous.denominator - previous.numerator * next.denominator
  );
  const thresholdAmount = previous.numerator * threshold.numerator;

  return difference * threshold.denominator > thresholdAmount * previous.denominator;
}

function toPositiveDecimalFraction(value: DecimalInput): DecimalFraction {
  const fraction = toDecimalFraction(value);
  if (fraction.numerator <= 0n) {
    throw new RangeError("El tipo de cambio debe ser mayor que cero.");
  }

  return fraction;
}

function toDecimalFraction(value: DecimalInput): DecimalFraction {
  const source = typeof value === "number" ? value.toString() : value;
  const match = DECIMAL_PATTERN.exec(source);
  if (match === null) {
    throw new TypeError("El decimal debe tener una representación decimal finita.");
  }

  const [, sign, integerPart, fractionalPart = ""] = match;
  const denominator = 10n ** BigInt(fractionalPart.length);
  const unsignedNumerator = BigInt(`${integerPart}${fractionalPart}`);

  return {
    numerator: sign === "-" ? -unsignedNumerator : unsignedNumerator,
    denominator
  };
}

function roundRatioHalfUp(numerator: bigint, denominator: bigint): bigint {
  const isNegative = numerator < 0n;
  const absoluteNumerator = absoluteBigInt(numerator);
  const quotient = absoluteNumerator / denominator;
  const remainder = absoluteNumerator % denominator;
  const rounded = remainder * 2n >= denominator ? quotient + 1n : quotient;

  return isNegative ? -rounded : rounded;
}

function formatScaledDecimal(value: bigint, decimalPlaces: number): string {
  const isNegative = value < 0n;
  const digits = absoluteBigInt(value)
    .toString()
    .padStart(decimalPlaces + 1, "0");
  const integerPart = decimalPlaces === 0 ? digits : digits.slice(0, -decimalPlaces);
  const fractionalPart = decimalPlaces === 0 ? "" : `.${digits.slice(-decimalPlaces)}`;

  return `${isNegative ? "-" : ""}${integerPart}${fractionalPart}`;
}

function absoluteBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}
