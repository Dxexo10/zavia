# 06 · Contrato de API — Zavia

> Estado: BORRADOR v0.4
> Zavia **no expone una API REST pública** en el MVP. Su "API" es el conjunto de **casos de uso** de la capa `application` (documento 05), invocados desde la interfaz mediante **Server Actions** (mutaciones) y **funciones de consulta** en Server Components (lecturas), más unos pocos **Route Handlers** para lo que no encaja en ese modelo (exportar CSV, tareas programadas, salud). Este documento fija nombre, entrada, salida, errores, reglas de acceso y trazabilidad de cada uno.

## 1. Convenciones generales

| Tema | Regla |
|------|-------|
| Nombres | `verboSustantivo` en inglés y `camelCase` (`createTransaction`) |
| Dinero en el contrato | Entero en unidad menor + moneda: `{ minor: number, currency: 'PEN' \| 'USD' }`. Los campos sueltos se llaman `…Minor` (RN-001) |
| Fechas | Día: `YYYY-MM-DD` (día en `America/Lima`). Instante: ISO 8601 UTC. Mes: `YYYY-MM` |
| Identificadores | `uuid` |
| Idioma | El contrato **no contiene texto para el usuario**: devuelve códigos y claves; la interfaz traduce (RNF-039, RNF-044) |
| Validación | Todo `input` pasa por su esquema Zod antes de llegar al caso de uso (RNF-015). Un campo desconocido se rechaza |
| Acceso | Salvo las marcadas **Pública**, toda acción llama `requireUser()` (sesión verificada en servidor). Las marcadas **No demo** devuelven `FORBIDDEN_DEMO` si `profile.is_demo` (RN-063) |
| Idempotencia | Las creaciones que mueven dinero (`createTransaction`, `createTransfer`, `addGoalEntry`) exigen `clientRequestId` (uuid generado en el cliente). Repetirlo devuelve el mismo registro, no uno nuevo |
| Concurrencia | Las ediciones son *last-write-wins* en el MVP (decisión consciente; el uso típico es de una sola persona) |
| Paginación | Por página: `page` (desde 1), tamaño fijo 20; devuelve `total` |
| Eliminación | Lógica (RN-006); `restore…` deshace dentro de la ventana de "Deshacer" (RF-040) |
| Trazabilidad | Cada acción cita sus RF y RN; cada una tiene al menos una prueba que referencia esos IDs (RNF-055) |

## 2. Sobre de respuesta

```ts
type Result<T> =
  | { ok: true;  data: T; meta?: { unlockedAchievements?: AchievementKey[] } }
  | { ok: false; error: AppError };

type AppError = {
  code: ErrorCode;                       // siempre un código, nunca texto libre
  fieldErrors?: Record<string, ErrorCode>; // errores por campo (VALIDATION_FAILED)
  retryAfterSeconds?: number;            // RATE_LIMITED
  requestId: string;                     // para soporte y registros (RNF-058)
};
```

- `meta.unlockedAchievements` lo devuelven las acciones que pueden desbloquear logros, para mostrar la notificación sin consultar de nuevo (RF-037).
- Nunca se incluyen trazas, mensajes de la base de datos ni nombres internos (RNF-039).

## 3. Catálogo de códigos de error

| Código | Cuándo | Equivalente HTTP |
|--------|--------|------------------|
| `VALIDATION_FAILED` | Entrada inválida (detalle en `fieldErrors`) | 422 |
| `UNAUTHENTICATED` | Sin sesión válida | 401 |
| `OAUTH_FAILED` | Falló o se canceló el acceso con Google (sin revelar el motivo interno) | 401 |
| `FORBIDDEN_DEMO` | Acción no permitida en modo demo (RN-063) | 403 |
| `NOT_FOUND` | El recurso no existe **o no es del usuario** (no se distingue, RN-008) | 404 |
| `RATE_LIMITED` | Demasiados intentos (RNF-023, RNF-028) | 429 |
| `CAPTCHA_FAILED` | Verificación anti-bot inválida (RNF-029) | 400 |
| `DEMO_CAPACITY_REACHED` | Tope global de demos activos (RNF-028) o base por encima del umbral de tamaño (RNF-071) | 503 |
| `QUOTA_EXCEEDED` | Se superó una cuota por usuario (RN-009, RNF-067) | 409 |
| `DATE_OUT_OF_RANGE` | Fecha fuera de RN-004 | 422 |
| `CATEGORY_KIND_MISMATCH` | Categoría de tipo distinto a la transacción (RN-013) | 422 |
| `CURRENCY_LOCKED` | Cambiar moneda con movimientos (RN-010, RN-023) | 409 |
| `ACCOUNT_HAS_BALANCE` | Archivar una cuenta con saldo ≠ 0 (RN-010) | 409 |
| `ACCOUNT_HAS_TRANSACTIONS` | Eliminar una cuenta con movimientos; se debe archivar | 409 |
| `DUPLICATE_NAME` | Nombre repetido (categorías, RN-013) | 409 |
| `GOAL_WITHDRAWAL_EXCEEDS_SAVED` | Retiro mayor al ahorrado (RN-022) | 422 |
| `EXCHANGE_RATE_CONFIRM_REQUIRED` | Cambio > 20 % sin confirmar (RN-027) | 409 |
| `FILE_TOO_LARGE` / `FILE_INVALID` | CSV fuera de límites o ilegible (RNF-026) | 413 / 422 |
| `UNEXPECTED` | Cualquier fallo no previsto | 500 |

Toda función que crea filas (`createTransaction`, `createTransfer`, `createAccount`, `createGoal`, `createRecurring`, `addGoalEntry`, `confirmImport`) puede devolver `QUOTA_EXCEEDED`.

Cada código tiene su clave de traducción `errors.<CODIGO>` en `es.json` y `en.json`; la paridad se verifica (RNF-045).

## 4. Tipos de datos principales

```ts
type Currency = 'PEN' | 'USD';
type Money = { minor: number; currency: Currency };

type AccountWithBalance = {
  id: string; name: string; type: 'cash' | 'bank' | 'card' | 'wallet';
  currency: Currency; openingBalanceMinor: number;
  currentBalanceMinor: number;       // RN-002 (movimientos con fecha ≤ hoy)
  projectedBalanceMinor: number;     // incluye fechas futuras
  archived: boolean;
};

type LedgerEntry =                    // lista unificada (RF-009)
  | { entryType: 'income' | 'expense'; id: string; accountId: string; categoryId: string;
      amount: Money; occurredOn: string; description: string | null;
      source: 'manual' | 'recurring' | 'import' | 'seed' }
  | { entryType: 'transfer'; id: string; fromAccountId: string; toAccountId: string;
      amountOut: Money; amountIn: Money; occurredOn: string; description: string | null };

type GoalOverview = {
  id: string; name: string; currency: Currency;
  targetMinor: number; savedMinor: number; remainingMinor: number;
  deadline: string; status: 'active' | 'paused' | 'completed';
  state: 'on_track' | 'at_risk' | 'behind' | 'overdue' | 'no_progress'
       | 'no_data' | 'paused' | 'completed';           // RN-021, RN-024
  light: 'green' | 'amber' | 'red' | 'neutral';        // semáforo + icono + texto (RNF-036)
  monthlyPaceMinor: number | null;                     // RN-020
  projectedDate: string | null;
  requiredMonthlyMinor: number | null;
  ratio: number | null;
  extraMonthlyNeededMinor: number | null;             // RN-044
};

type BudgetStatus = {
  categoryId: string; month: string; limitMinor: number;  // moneda base
  spentMinor: number; usage: number;                      // RN-026
  level: 'normal' | 'amber' | 'red'; exceededMinor: number;
};

type Insight = {
  ruleKey: string; severity: 'info' | 'attention' | 'alert';
  dedupeKey: string; period: string;
  params: Record<string, string | number>;               // para el texto traducido
  action?: { type: 'open_budget' | 'open_goal' | 'open_subscriptions' | 'open_category'; targetId?: string };
};

type DashboardSummary = {
  month: string; baseCurrency: Currency;
  incomeMinor: number; expenseMinor: number; balanceMinor: number;
  totalBalanceMinor: number;
  previousMonth: { incomeChangePct: number | null; expenseChangePct: number | null }; // null si el mes previo es 0
  spendingByCategory: { categoryId: string; spentMinor: number }[];
  trend: { month: string; incomeMinor: number; expenseMinor: number }[];              // 6 meses
};

type AchievementKey =
  | 'first_transaction' | 'first_goal_created' | 'first_goal_completed'
  | 'streak_7' | 'streak_30' | 'month_within_budget' | 'first_subscription' | 'tx_100';
```

La conversión a moneda base (RN-027) y el semáforo (RN-021) los calcula el **dominio**; la interfaz solo presenta (`light` y `state` se muestran con color + icono + texto).

## 5. Catálogo de acciones y consultas

Leyenda de acceso: **P** = pública · **U** = usuario autenticado · **U-nd** = autenticado y **no demo**.

### 5.1 Acceso, cuenta y demo

| Función | Entrada | Salida | Acceso | Errores específicos | RF / RN |
|---------|---------|--------|--------|---------------------|---------|
| `signOut` | — | `{}` | U | — | RF-002 |
| `signInWithGoogle` | — (redirección OAuth; el retorno lo procesa `/auth/callback`) | redirección | P | `OAUTH_FAILED` | RF-001 |
| `deleteMyAccount` | `confirmEmail` | `{}` y cierre de sesión | U-nd | `VALIDATION_FAILED` | RF-005 · RNF-065 |
| `finishDemoSetup` | `firstName, lastName` (el anónimo ya fue creado en el navegador con captcha) | `{ redirectTo }` | U (anónimo) | `VALIDATION_FAILED`, `RATE_LIMITED`, `DEMO_CAPACITY_REACHED` | RF-028 · RN-060 a 062 · RNF-027 a 029 |
| `linkGoogleToDemo` | `keepData: boolean` (inicia la redirección a Google) | redirección; al volver, el servidor completa la conversión | U (demo) | `OAUTH_FAILED` | RF-029 (*Could*) |

`finishDemoSetup` es **idempotente**: si el perfil ya existe, no vuelve a sembrar. El flujo completo está en la sección 5.3 del documento 05.

### 5.2 Perfil y preferencias

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `getProfile` | — | perfil (nombre, idioma, moneda base, tipo de cambio, preferencias, `isDemo`, `demoExpiresAt`) | U | — | RF-024 |
| `updateProfile` | `firstName?, lastName?, locale?, dateFormat?, showAchievements?` | perfil | U | `VALIDATION_FAILED` | RF-024, 037, 038 |
| `updateExchangeRate` | `usdPenRate, confirmLargeChange?: boolean` | perfil | U | `EXCHANGE_RATE_CONFIRM_REQUIRED` | RF-023 · RN-027 |
| `completeOnboarding` | — | `{}` | U | — | RF-041 |

### 5.3 Cuentas

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listAccounts` | `includeArchived?` | `AccountWithBalance[]` + total en moneda base | U | — | RF-006 · RN-002 |
| `createAccount` | `name, type, currency, openingBalanceMinor` | `AccountWithBalance` | U | `VALIDATION_FAILED` | RF-006 |
| `updateAccount` | `id, name?, type?, openingBalanceMinor?` (la moneda no se envía) | `AccountWithBalance` | U | `NOT_FOUND`, `CURRENCY_LOCKED` | RF-006 · RN-010 |
| `archiveAccount` | `id` | `{}` | U | `ACCOUNT_HAS_BALANCE`, `NOT_FOUND` | RN-010 |
| `deleteAccount` | `id` (solo sin movimientos) | `{}` | U | `ACCOUNT_HAS_TRANSACTIONS` | RN-010 |

### 5.4 Categorías

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listCategories` | `kind?, includeArchived?` | categorías (con `defaultKey` o `name`) | U | — | RF-013 |
| `createCategory` | `kind, name` | categoría | U | `DUPLICATE_NAME` | RN-013 |
| `renameCategory` | `id, name` | categoría | U | `DUPLICATE_NAME`, `NOT_FOUND` | RN-013 |
| `archiveCategory` | `id` | `{}` (archiva también su presupuesto) | U | `NOT_FOUND` | RN-013 |

### 5.5 Transacciones y transferencias

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listTransactions` | `page, dateFrom?, dateTo?, accountId?, categoryId?, type?: 'income'\|'expense'\|'transfer', q?` | `{ items: LedgerEntry[], page, pageSize: 20, total }` (orden por fecha descendente) | U | `VALIDATION_FAILED` | RF-009 |
| `createTransaction` | `clientRequestId, kind, amountMinor, accountId, categoryId, occurredOn, description?` | `LedgerEntry` + `meta.unlockedAchievements` | U | `DATE_OUT_OF_RANGE`, `CATEGORY_KIND_MISMATCH`, `NOT_FOUND` | RF-007 · RN-002, 004, 005, 013 |
| `updateTransaction` | `id` + campos editables | `LedgerEntry` | U | idem | RF-008 |
| `deleteTransaction` | `id` | `{ id }` | U | `NOT_FOUND` | RF-008 · RN-006 |
| `restoreTransaction` | `id` | `LedgerEntry` | U | `NOT_FOUND` | RF-040 |
| `createTransfer` | `clientRequestId, fromAccountId, toAccountId, amountOutMinor, amountInMinor?, occurredOn, description?` | `LedgerEntry` (transferencia) | U | `VALIDATION_FAILED` (misma cuenta, o falta `amountInMinor` si las monedas difieren), `NOT_FOUND` | RF-010 · RN-007 |
| `deleteTransfer` / `restoreTransfer` | `id` | `{ id }` / `LedgerEntry` | U | `NOT_FOUND` | RF-010, 040 |

Una transferencia no se edita: se elimina y se vuelve a crear. `amountInMinor` es opcional solo cuando ambas cuentas tienen la misma moneda.

### 5.6 Importar y exportar CSV

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `previewImport` | `accountId`, archivo CSV | `{ rows: { rowNumber, status: 'valid'\|'invalid'\|'duplicate', reason?: ErrorCode, normalized? }[], counts }` — **sin estado en el servidor**: no guarda nada | U | `FILE_TOO_LARGE`, `FILE_INVALID` | RF-011 · RN-012, 014 · RNF-026 |
| `confirmImport` | `accountId, filename, rows[]` (las normalizadas), `includeDuplicates?: number[]` | `{ imported, skipped, batchId }` | U | `FILE_INVALID`, `RATE_LIMITED` (máx. 5 importaciones por hora y usuario) | RF-011 |
| Exportar | `GET /api/export/transactions` (ver sección 6) | archivo CSV | U | — | RF-012 · RNF-026 |

`confirmImport` **vuelve a validar todo en el servidor**; nunca confía en las filas que envía el cliente (RNF-015).

### 5.7 Metas

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listGoals` | `status?` | `GoalOverview[]` | U | — | RF-014, 016, 017 · RN-020, 021 |
| `getGoal` | `id` | `GoalOverview` + historial de aportes | U | `NOT_FOUND` | RF-015 |
| `createGoal` | `name, currency, targetMinor, deadline, initialSavedMinor?` | `GoalOverview` + `meta.unlockedAchievements` | U | `VALIDATION_FAILED` (fecha no futura), `DATE_OUT_OF_RANGE` | RF-014 · RN-023 |
| `updateGoal` | `id, name?, targetMinor?, deadline?` (la moneda no se envía) | `GoalOverview` | U | `CURRENCY_LOCKED`, `NOT_FOUND` | RF-014 |
| `setGoalStatus` | `id, status: 'active' \| 'paused'` | `GoalOverview` | U | `NOT_FOUND` | RN-024 |
| `deleteGoal` | `id` | `{ id }` | U | `NOT_FOUND` | RF-014 |
| `addGoalEntry` | `clientRequestId, goalId, kind: 'contribution'\|'withdrawal', amountMinor, occurredOn` | `GoalOverview` + `meta.unlockedAchievements` | U | `GOAL_WITHDRAWAL_EXCEEDS_SAVED`, `DATE_OUT_OF_RANGE`, `NOT_FOUND` | RF-015 · RN-022, 024 |

Al llegar al objetivo, `addGoalEntry` marca la meta como `completed` en la **misma operación atómica** y puede devolver `first_goal_completed`.

### 5.8 Presupuestos

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listBudgets` | `month` (`YYYY-MM`) | `BudgetStatus[]` | U | — | RF-018, 019 · RN-025, 026 |
| `setBudget` | `categoryId, limitMinor` (rige desde el mes actual) | `BudgetStatus` | U | `CATEGORY_KIND_MISMATCH` (solo categorías de gasto), `NOT_FOUND` | RF-018 |
| `removeBudget` | `categoryId` (desde el mes actual; el historial se conserva) | `{}` | U | `NOT_FOUND` | RN-025 |

### 5.9 Recurrentes y suscripciones

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listRecurring` | `status?, onlySubscriptions?` | reglas con próxima fecha | U | — | RF-030 |
| `createRecurring` | `kind, amountMinor, accountId, categoryId, frequency, startOn, endOn?, isSubscription?, serviceName?, description?` | regla + `meta.unlockedAchievements` | U | `VALIDATION_FAILED`, `NOT_FOUND` | RF-030 · RN-030 |
| `updateRecurring` | `id` + campos editables | regla | U | `NOT_FOUND` | RF-030 |
| `setRecurringStatus` | `id, status: 'active'\|'paused'\|'cancelled'` | regla | U | `NOT_FOUND` | RF-030 · RN-030 |
| `getSubscriptionsSummary` | — | `{ monthlyCommittedMinor, upcoming30Days[], items[] }` | U | — | RF-032 · RN-031 |

Las ocurrencias **no** se crean con una acción pública: las genera el caso de uso interno `generateDueRecurrences` (cron diario y recuperación al iniciar sesión, documento 05, sección 6) con idempotencia por `(recurring_id, fecha)` (RN-030, RNF-010).

### 5.10 Insights, rachas y logros

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `listInsights` | — | `Insight[]` vigentes (calculados, no almacenados) | U | — | RF-033 · RN-040 a 046 |
| `dismissInsight` | `dedupeKey` | `{}` | U | `NOT_FOUND` | RF-034 |
| `getStreak` | — | `{ current, best, activeToday }` | U | — | RF-035 · RN-051 |
| `markNoSpendToday` | — | `{ current, best }` + `meta.unlockedAchievements` | U | — (si ya se marcó hoy, devuelve lo mismo) | RF-035 |
| `listAchievements` | — | `{ key, unlockedAt \| null }[]` (vacío si `showAchievements` es falso) | U | — | RF-036, 037 · RN-050 |

### 5.11 Dashboard

| Función | Entrada | Salida | Acceso | Errores | RF / RN |
|---------|---------|--------|--------|---------|---------|
| `getDashboardSummary` | `month` (`YYYY-MM`) | `DashboardSummary` | U | `VALIDATION_FAILED` | RF-020, 021, 022 · RN-002, 007, 027 |

## 6. Route Handlers

| Ruta | Método | Acceso | Respuesta | Notas |
|------|--------|--------|-----------|-------|
| `/auth/callback` | GET | Pública | Redirección | Intercambia el código de OAuth por una sesión en el servidor, reescribe las cookies con `HttpOnly` y redirige solo a destinos de la lista de permitidos (SEG-AUT-09) |
| `/api/health` | GET | Pública | `{ status: 'ok' \| 'degraded', db: 'ok' \| 'down', time }` | Sin datos sensibles; la usan el monitor externo y el keep-alive (RNF-008, 009) |
| `/api/export/transactions` | GET | Sesión | CSV UTF-8 (con BOM para Excel), filtros iguales a `listTransactions` | Neutraliza celdas que comienzan con `=`, `+`, `-`, `@` (RNF-026); descarga con `Content-Disposition` |
| `/api/cron/recurring` | GET | Secreto | `{ processedUsers, generated }` | Encabezado `Authorization: Bearer <CRON_SECRET>`; sin él, 401. Idempotente |
| `/api/cron/daily` | GET | Secreto | `{ ok: true }` | Keep-alive de la base y tareas diarias que no sean SQL 🔎 (Vercel Cron invoca con GET) |

Todos los Route Handlers aplican las cabeceras de seguridad de RNF-022 y devuelven el mismo formato de error (`requestId` incluido).

## 7. Reglas de seguridad transversales del contrato

1. **Ninguna acción confía en el cliente.** Se revalida con Zod en el servidor aunque el formulario ya validara.
2. **`user_id` nunca se recibe como entrada.** Se toma de la sesión; así no se puede escribir en nombre de otro (RN-008, RNF-019).
3. **Los `id` ajenos devuelven `NOT_FOUND`**, nunca `FORBIDDEN`, para no revelar existencia.
4. **Límites de frecuencia:** `finishDemoSetup` por `demo_signups` (RNF-028) y `confirmImport` por `import_batches` (5 por hora). El acceso con Google se apoya en los límites de Supabase Auth (SEG-INF-02).
5. **Errores de acceso sin detalles:** el fallo del acceso con Google devuelve solo `OAUTH_FAILED`, sin revelar el motivo interno.
6. **Registros sin datos sensibles:** el logger recibe `requestId`, código de acción y resultado; nunca montos, descripciones ni credenciales (RNF-058).
7. **Las funciones SQL** (`create_transfer`, `add_goal_entry`, `archive_account`, `confirm_import`) son `security invoker`; RLS aplica igual que en una consulta directa (documento 04, sección 6).

## 8. Cómo se prueba este contrato (resumen; detalle en documento 10)

- **Pruebas de contrato por función:** entrada válida → `ok: true` con la forma del tipo; cada entrada inválida → su código de error exacto.
- **Pruebas de aislamiento:** con dos usuarios, ninguna función permite leer o escribir datos del otro (incluido un visitante demo) → siempre `NOT_FOUND`.
- **Pruebas de idempotencia:** repetir `createTransaction`, `createTransfer` y `addGoalEntry` con el mismo `clientRequestId` no duplica.
- **Prueba de paridad de errores:** cada `ErrorCode` tiene traducción en ES y EN.
- **Pruebas de demo:** `FORBIDDEN_DEMO` en `deleteMyAccount` (RN-063).

## 9. Decisiones y supuestos de este documento

| Decisión | Motivo | Alternativa |
|----------|--------|-------------|
| Sin API REST pública en el MVP | Server Actions cubren la interfaz con menos código y más seguridad de tipos | Añadir `/api/v1` con OpenAPI en una versión posterior si se quiere mostrar una API consumible |
| Cuentas reales **solo con Google** (decidido por el autor) | Costo cero (sin correo saliente ni dominio) y menos superficie de ataque (sin contraseñas, recuperación ni enumeración de correos); el demo cubre a quien no use Google | Correo y contraseña con SMTP gratuito (más frágil y con más riesgos; ver `09-seguridad.md` §4.1) |
| Paginación por número de página | RF-009 pide páginas; con ≤ 5,000 filas por usuario es suficiente | Paginación por cursor si el volumen crece |
| Edición *last-write-wins* | Uso de una sola persona | Control optimista de concurrencia con `updated_at` |
| Importación sin estado (vista previa → confirmar reenviando filas) | No hay tablas ni archivos temporales que limpiar | Guardar el lote en servidor entre pasos |

🔎 El cliente OAuth de Google se crea gratis en Google Cloud (pantalla de consentimiento con ámbitos básicos); el agente verifica en su documentación vigente los pasos y los requisitos de publicación.
