/** RN-020: mes comercial determinista. */
export const COMMERCIAL_MONTH_DAYS = 30;
/** RN-004: máximo de días permitidos en el futuro. */
export const MAX_TRANSACTION_FUTURE_DAYS = 31;
/** RN-004: máximo de años permitidos en el pasado. */
export const MAX_TRANSACTION_PAST_YEARS = 10;
/** RN-005: monto máximo en unidad mayor antes de convertir a unidad menor. */
export const MAX_TRANSACTION_AMOUNT = 999_999_999.99;
/** RN-005: longitud máxima de una descripción. */
export const MAX_DESCRIPTION_LENGTH = 140;
/** RN-005: longitud mínima para cuenta, categoría y meta. */
export const MIN_ENTITY_NAME_LENGTH = 1;
/** RN-005: longitud máxima para cuenta, categoría y meta. */
export const MAX_ENTITY_NAME_LENGTH = 40;
/** RN-009: movimientos máximos de usuario real. */
export const MAX_REAL_MOVEMENTS = 5_000;
/** RN-009: movimientos máximos de demo. */
export const MAX_DEMO_MOVEMENTS = 1_000;
/** RN-009: cuentas máximas por usuario. */
export const MAX_ACCOUNTS = 100;
/** RN-009: metas máximas por usuario. */
export const MAX_GOALS = 200;
/** RN-009: recurrentes máximos por usuario. */
export const MAX_RECURRING = 50;
/** RN-009: freno de capacidad de la base. */
export const DATABASE_CAPACITY_THRESHOLD = 0.7;
/** RN-014: tamaño máximo de CSV en bytes. */
export const MAX_CSV_BYTES = 2 * 1024 * 1024;
/** RN-014: filas máximas de CSV. */
export const MAX_CSV_ROWS = 5_000;
/** RN-020: ventana mínima de aportes. */
export const MIN_GOAL_PACE_WINDOW_DAYS = 30;
/** RN-020: ventana máxima de aportes. */
export const MAX_GOAL_PACE_WINDOW_DAYS = 90;
/** RN-021: razón mínima de meta verde. */
export const GOAL_GREEN_RATIO = 1;
/** RN-021: razón mínima de meta ámbar. */
export const GOAL_AMBER_RATIO = 0.9;
/** RN-026: uso máximo para presupuesto normal. */
export const BUDGET_NORMAL_USAGE_MAX = 0.8;
/** RN-026: uso máximo para presupuesto ámbar. */
export const BUDGET_AMBER_USAGE_MAX = 1;
/** RN-027: cambio porcentual que exige confirmación. */
export const EXCHANGE_RATE_CONFIRMATION_THRESHOLD = 0.2;
/** RN-030: ocurrencias máximas por ejecución. */
export const MAX_RECURRENCES_PER_RUN = 24;
/** RN-031: meses de un año para equivalencias. */
export const MONTHS_PER_YEAR = 12;
/** RN-031: semanas de un año para equivalencias. */
export const WEEKS_PER_YEAR = 52;
/** RN-031: horizonte de próximas suscripciones. */
export const UPCOMING_SUBSCRIPTIONS_DAYS = 30;
/** RN-040: meses completos mínimos para insights comparativos. */
export const MIN_INSIGHT_HISTORY_MONTHS = 2;
/** RN-041: multiplicador de atención por categoría. */
export const CATEGORY_ATTENTION_MULTIPLIER = 1.25;
/** RN-041: diferencia mínima de atención por categoría. */
export const CATEGORY_ATTENTION_MIN_DIFFERENCE = 50;
/** RN-041: multiplicador de alerta por categoría. */
export const CATEGORY_ALERT_MULTIPLIER = 1.5;
/** RN-041: diferencia mínima de alerta por categoría. */
export const CATEGORY_ALERT_MIN_DIFFERENCE = 100;
/** RN-042: días transcurridos mínimos para proyectar presupuesto. */
export const MIN_BUDGET_PROJECTION_DAYS = 7;
/** RN-043: proporción de suscripciones pesadas. */
export const HEAVY_SUBSCRIPTIONS_RATIO = 0.15;
/** RN-045: cantidad mínima de gastos hormiga. */
export const MIN_MICRO_EXPENSE_COUNT = 15;
/** RN-045: importe máximo de un gasto hormiga. */
export const MAX_MICRO_EXPENSE_AMOUNT = 20;
/** RN-045: proporción mínima del gasto total. */
export const MICRO_EXPENSES_RATIO = 0.1;
/** RN-046: tasa mínima de buen ahorro. */
export const GOOD_SAVINGS_RATE = 0.2;
/** RN-060: longitud mínima de cada nombre demo. */
export const MIN_DEMO_NAME_LENGTH = 2;
/** RN-060: longitud máxima de cada nombre demo. */
export const MAX_DEMO_NAME_LENGTH = 40;
/** RN-062: duración de una sesión demo en horas. */
export const DEMO_SESSION_HOURS = 24;
