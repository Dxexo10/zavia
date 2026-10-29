# 10 · Pruebas Automatizadas — Zavia

> Estado: BORRADOR v0.3 · Convierte los requerimientos (01, 02), las reglas (03), el contrato (06), el diseño (07) y la seguridad (09) en un plan de pruebas **ejecutable y trazable**.
> 🔎 Las herramientas y claves de prueba de terceros (Cloudflare Turnstile, Playwright, Lighthouse CI, Stryker) cambian: el agente verifica su documentación vigente antes de configurarlas.

## 1. Principios

1. **Las pruebas son la especificación ejecutable.** Cada RF, RN, RNF crítico y control `SEG-…` tiene al menos una prueba que lo cita por su ID (RNF-055).
2. **TDD obligatorio:** primero la prueba, que **falla** (RED); luego el código mínimo (GREEN); luego se refactoriza con las pruebas en verde.
3. **Determinismo:** sin hora real ni aleatoriedad. Reloj inyectable, datos semilla fijos, semillas aleatorias registradas (RNF-057).
4. **La pirámide manda:** muchas pruebas rápidas de dominio y de base de datos; pocas pero completas pruebas de extremo a extremo (E2E).
5. **Probar contra lo real donde importa:** la seguridad y la integridad se prueban contra una base de datos Supabase real (local), nunca contra mocks. Los mocks se usan en las fronteras externas (captcha, Google).
6. **Una prueba de seguridad no se debilita** para hacer pasar el CI: cambiarla requiere aprobación expresa del autor (SEG-AGT-02).
7. **Sin rutas ni *flags* de prueba en el código de producción.** Las fechas se controlan con reloj inyectable y datos relativos a "hoy"; una prueba verifica que el *build* de producción no contiene artefactos de prueba.

## 2. Capas, herramientas y objetivo

| Capa | Herramienta | Qué prueba | Base de datos | Peso aproximado |
|------|-------------|-----------|---------------|-----------------|
| **Estática** | `tsc`, ESLint, `dependency-cruiser`, gitleaks, `pnpm audit`, detector de impeccable, commitlint | Tipos, estilo, reglas de capas, secretos, dependencias, patrones de diseño prohibidos | — | Cada commit |
| **Unitaria (dominio)** | Vitest | Funciones puras de `domain/` (RN-001 a RN-071) | No | ~55 % de las pruebas |
| **Propiedades** | Vitest + `fast-check` | Invariantes (saldos, redondeo, proyección) | No | Complemento de la unitaria |
| **Componentes** | Vitest + Testing Library | Componentes de interfaz y accesibilidad básica | No | ~10 % |
| **Integración de datos** | Vitest + Supabase local (CLI + Docker) | RLS, permisos, disparadores, funciones SQL, tareas programadas, cuotas | **Sí (local)** | ~20 % |
| **Contrato (casos de uso y acciones)** | Vitest + Supabase local | Cada función de `06-api-contrato.md` | **Sí (local)** | ~10 % |
| **E2E** | Playwright (Chromium, Firefox, WebKit) | Recorridos completos, responsive, CSP, cookies | **Sí (local)** | ~5 % (pero las más lentas) |
| **Accesibilidad** | `@axe-core/playwright` + comprobaciones propias | WCAG 2.2 AA, teclado, objetivos táctiles | Sí | Dentro de E2E |
| **Visual** | Playwright `toHaveScreenshot` | Cambios visuales no deseados | Sí | Solo Chromium |
| **Rendimiento** | Lighthouse CI + k6 (carga ligera) | RNF-001 a 007 | Sí | Nocturna / previa a publicar |
| **Mutación** | Stryker (sobre `domain/`) | Calidad real de las pruebas | No | Nocturna |

**Reglas de cobertura (RNF-050):** `domain/` y `application/` ≥ 80 % en líneas y ramas; **100 %** en dinero, proyección de metas, presupuestos, recurrentes e insights; la infraestructura se mide por las pruebas de integración. El umbral rompe el CI. Mutación sobre `domain/`: umbral inicial de 70 % 🔎.

## 3. Estructura, nombres y trazabilidad

```
tests/
├── unit/domain/            ← por módulo: money, balances, goals, budgets, recurring, insights, streaks, csv, demo
├── property/               ← fast-check
├── component/
├── integration/
│   ├── db/                 ← rls, permissions, triggers, functions, cron, quotas, migrations
│   └── contract/           ← una carpeta por módulo de 06
├── e2e/                    ← specs por recorrido (E2E-01…)
├── a11y/ · visual/ · perf/
├── fixtures/               ← fábricas (buildAccount, buildTransaction…), CSV de ejemplo, cargas XSS
├── helpers/                ← reloj, usuarios de prueba, cliente de Supabase por rol
└── traceability.exceptions.md   ← IDs que se verifican a mano (con motivo y frecuencia)
scripts/check-traceability.ts
```

- **Nombre de cada prueba:** `[RF-007][RN-002] …descripción…` (los IDs entre corchetes al inicio). Los bloques `describe` llevan el ID principal.
- **`scripts/check-traceability.ts`** (RNF-055): extrae los IDs de los documentos 01, 02, 03 y 09 y de los títulos de pruebas; **falla** si un RF *Must*, un RN, un RNF automatizable o un `SEG-…` no aparece en ninguna prueba y no está en `traceability.exceptions.md`. Genera `Documentacion/informes/trazabilidad.md` (matriz ID → pruebas). Los IDs marcados **DESCARTADO** o **FUSIONADO** (RF-003, RF-004, RF-027, RNF-018, PS-14, PS-15, E2E-06…) se excluyen de la verificación.
- **Fábricas y reloj:** `Clock` inyectable con constante `TODAY` fija en `America/Lima`; toda fecha de prueba se calcula respecto a ella. Perú no usa horario de verano, lo que simplifica los casos límite (UTC−5).

## 4. Flujo TDD por tarea (para el agente)

1. **Leer** el RF/RN/SEG de la tarea y sus criterios de aceptación.
2. **RED:** escribir la(s) prueba(s) con el ID en el título y ejecutarlas; **deben fallar por la razón correcta**. Pegar la salida como evidencia.
3. **GREEN:** el código mínimo que las hace pasar; evidencia de la salida.
4. **REFACTOR:** limpiar sin romper; ejecutar el conjunto de la capa.
5. **Cerrar la tarea:** ejecutar lint, tipos, pruebas de la capa y las que cubran el mismo módulo; un commit (`feat(RF-007): …`; las pruebas pueden ir en un commit `test(RF-007): …` previo). Nunca un commit con pruebas rojas.
6. **Prohibido:** modificar o borrar una prueba existente para que pase; marcar `skip`/`only`; bajar umbrales de cobertura. Si una prueba parece incorrecta, se detiene y se pregunta (en seguridad, siempre).

## 5. Pruebas unitarias del dominio: casos obligatorios

Cada fila se convierte en una o más pruebas. Los números provienen de `03-reglas-de-negocio.md`.

### 5.1 Dinero, redondeo y moneda (RN-001, 003, 027 · RNF-013)
| Caso | Esperado |
|------|----------|
| Redondeo *half-up*: 2.345 / 2.344 / 0.005 | 2.35 / 2.34 / 0.01 |
| Conversión con tipo de cambio 3.75: US$ 20.00 / US$ 19.99 | S/ 75.00 / S/ 74.96 |
| Suma de importes enteros en céntimos | Sin error de coma flotante (p. ej. 0.1 + 0.2 expresado en céntimos = 30) |
| Moneda distinta en suma directa | Error (no se suman PEN y USD sin convertir) |
| Cambio de tipo de cambio > 20 % | Exige confirmación (RN-027) |
| **Propiedad:** convertir y redondear es monótono en el monto | Siempre |

### 5.2 Saldos y transferencias (RN-002, 007)
| Caso | Esperado |
|------|----------|
| Saldo inicial 500, gasto 50, ingreso 200 hoy, gasto 30 en 10 días | Actual 650; proyectado 620 |
| Movimiento eliminado | No cuenta |
| Transferencia 100 de A a B (misma moneda) | A −100, B +100, neto 0, no es ingreso ni gasto |
| Transferencia entre monedas con monto recibido explícito | Se deriva el tipo de cambio implícito |
| **Propiedad:** crear y luego eliminar un movimiento deja el saldo como estaba | Siempre |
| **Propiedad:** el saldo = recálculo desde cero con todos los movimientos | Siempre (RNF-011) |

### 5.3 Fechas y zona horaria (RN-004, 070 · RNF-014)
| Caso | Esperado |
|------|----------|
| Hoy + 31 días / hoy + 32 días | Válido / `DATE_OUT_OF_RANGE` |
| Hoy − 10 años / hoy − 10 años − 1 día | Válido / `DATE_OUT_OF_RANGE` |
| Instante 04:59 UTC y 05:00 UTC | 23:59 del día D y 00:00 del día D+1 en Lima |
| 29 de febrero (año bisiesto), fin de mes, cambio de año | Cálculos correctos |

### 5.4 Metas (RN-020 a 024)
| Caso | Esperado |
|------|----------|
| Tabla de 7 casos de RN-021 (ritmo 600, 562.50, 562, 520, 506.25, 500, 300) | Razón, días y estado de la tabla (verde, verde, ámbar, ámbar, ámbar, rojo, rojo) |
| Ejemplo de referencia (falta 4,500; ritmo 500; 240 días) | Proyección 270 días; necesario 562.50; razón 0.8889; retraso 30 días; rojo |
| Primer aporte hace 10 días / hace 200 días | `ventana_días` = 30 / 90 |
| `falta = 0` | Completada |
| Meta sin ningún aporte | `no_data` (neutro), sin proyección |
| Con aportes pero ritmo ≤ 0 en la ventana | `no_progress`, rojo |
| `días_restantes ≤ 0` y `falta > 0` | `overdue`, rojo |
| Meta pausada | Sin proyección ni alerta |
| Retiro mayor al ahorrado | `GOAL_WITHDRAWAL_EXCEEDS_SAVED` |
| Metas semilla del demo (RN-061) | Razones 1.25 (verde), 0.92 (ámbar), 0.667 (rojo) |
| **Propiedad:** a mayor ritmo, la fecha proyectada nunca es posterior | Siempre |
| **Propiedad:** `razón ≥ 1` si y solo si la fecha proyectada ≤ fecha límite | Siempre |

### 5.5 Presupuestos (RN-025, 026)
| Caso (límite S/ 500) | Esperado |
|----------------------|----------|
| Gastado 400.00 | Normal |
| Gastado 400.01 | Ámbar |
| Gastado 500.00 | Ámbar |
| Gastado 500.01 | Rojo, excedido S/ 0.01 |
| Cambio de límite en el mes actual | El mes anterior conserva su límite histórico |
| Transferencias y movimientos eliminados | No cuentan |

### 5.6 Recurrentes y suscripciones (RN-030, 031)
| Caso | Esperado |
|------|----------|
| Mensual el día 31 desde enero | 31 ene, 28 feb (29 si bisiesto), 31 mar, 30 abr |
| Anual el 29 de febrero en año no bisiesto | 28 de febrero |
| Ejecutar la generación dos veces | Sin duplicados (RNF-010) |
| Usuario ausente varios ciclos | Se generan con su fecha original, máximo 24 por ejecución |
| Pausa y reanudación | Sin ocurrencias retroactivas |
| Fecha de fin superada o cancelada | No genera más |
| Equivalente mensual: S/ 45 mensual + S/ 240 anual + S/ 10 semanal | 45 + 20 + 43.33 = S/ 108.33 |

### 5.7 Insights (RN-040 a 046)
| Regla | Casos |
|-------|-------|
| RN-041 | Promedio 200: gasto 249 → nada; 260 → atención; 310 → alerta; diferencia < S/ 50 → nada |
| RN-042 | Día 10 de 30, gastado 200, límite 500 → atención; día 6 → nada (menos de 7 días) |
| RN-043 | Suscripciones justo en 15 % y justo por encima de 15 % de los ingresos |
| RN-044 | Meta ámbar/roja → ajuste 562.50 − 500.00 = S/ 62.50 |
| RN-045 | 14 gastos pequeños → nada; 15 gastos ≤ S/ 20 que suman ≥ 10 % → info |
| RN-046 | Tasa de ahorro 19.9 % → nada; 20 % → info positiva |
| RN-040 | Menos de 2 meses de historial → ningún insight comparativo; descartado no reaparece salvo que suba su gravedad; sin duplicados vigentes |

### 5.8 Rachas y logros (RN-050 a 052)
| Caso | Esperado |
|------|----------|
| Actividad hoy y ayer | Racha 2, vigente |
| Sin actividad ayer ni hoy | Racha rota a las 00:00 (Lima) |
| Movimiento registrado hoy con fecha de hace un mes | Cuenta para la racha de **hoy** (fecha de registro) |
| «Hoy no gasté» dos veces el mismo día | Una sola cuenta |
| Importación CSV, recurrentes, transferencias y datos semilla | **No** cuentan para rachas ni logros de volumen |
| `tx_100` con 100 movimientos en 19 días distintos / 20 días | No se desbloquea / se desbloquea |
| `month_within_budget` con 1 presupuesto / 2 presupuestos todos ≤ 100 % | No / sí |
| Un logro ya desbloqueado | No se vuelve a desbloquear ni se pierde |

### 5.9 Demo, CSV y duplicados (RN-012, 014, 060, 061)
| Caso | Esperado |
|------|----------|
| Nombres válidos: «María José», «O'Brien», «De la Cruz» | Aceptados |
| Inválidos: «J», «Juan<script>», «1234», 41 caracteres | Rechazados |
| Con caracteres de dirección de texto o de ancho cero | Eliminados |
| CSV fecha: `2026-03-05`, `05/03/2026` | 5 de marzo en ambos |
| CSV fecha: `03/05/2026` leída como DD/MM, `2026/03/05`, `32/01/2026` | 3 de mayo / inválida / inválida |
| CSV monto: `1,234.50`, `-45.9` | 1,234.50 ingreso / 45.90 gasto |
| CSV monto: `1.234,50`, `0`, `12.345`, `S/ 45` | Inválidos con motivo |
| Duplicado: mayúsculas y espacios distintos en la descripción | Se marca «posible duplicado» (descripción normalizada) |
| Fila inválida entre filas válidas | No bloquea a las demás |
| Generador del demo | 4 cuentas, ≈150 movimientos, 3 metas con 3 colores, 3 presupuestos con 3 niveles, ≥3 insights, racha 12, 4 logros |

## 6. Pruebas de componentes (Testing Library)

| Componente | Casos |
|------------|-------|
| **Importe** | `aria-label` con el monto completo; símbolo y decimales atenuados; formato correcto en ES/EN |
| **Campo de importe** | Acepta punto o coma; normaliza; `inputmode="decimal"` |
| **Píldora de estado** | Siempre icono + texto + color (RNF-036) |
| **Barra de progreso** | Texto «S/ 410 de S/ 500»; niveles de color correctos |
| **Aviso con «Deshacer»** | Aparece 5 s; `role="status"`; la acción deshace |
| **Hoja/diálogo** | Atrapa el foco, `Esc` cierra, el foco vuelve al disparador |
| **Celebración de sello** | Con movimiento: secuencia presente; con `prefers-reduced-motion`: sin radiales ni rotación (RNF-037); anuncio con `role="status"`; una a la vez |
| **Formularios** | Etiqueta visible; error vinculado con `aria-describedby`; resumen de errores |
| **Códigos de error** | Cada `ErrorCode` tiene traducción ES y EN (RNF-045) |
| **i18n** | Paridad de claves ES/EN; **ninguna cadena escrita en el código** (RNF-044) |
| **Estados vacío, carga y error** | Presentes en cada pantalla con datos remotos (RF-026) |

## 7. Pruebas de integración de datos (Supabase local)

| Grupo | Casos | Cubre |
|-------|-------|-------|
| **Migraciones** | La base se crea desde cero solo con las migraciones; esquema final = esperado | RNF-017 |
| **RLS** (generada) | Para **cada tabla × cada operación** (leer, insertar, actualizar, eliminar) con dos usuarios reales, dos demos y el rol `anon`; el test se **genera recorriendo el catálogo** y falla si una tabla pública no tiene RLS | PS-01, PS-02, SEG-AUZ-01 |
| **Aislamiento por claves compuestas** | Intentar vincular una transacción con una cuenta o categoría de otro usuario → error | SEG-AUZ-02 |
| **Permisos por columna y tabla** | `is_demo`, `demo_expires_at`, `source`; escritura en `achievements`, `user_stats`, `activity_days`; acceso a `demo_signups` | PS-05, PS-06 |
| **Invariantes (disparadores y `CHECK`)** | Fecha fuera de rango, monto ≤ 0 o excesivo, tipo de categoría, moneda inmutable, retiro de meta bajo 0, transferencia con misma cuenta, longitudes | 09 §5, RNF-068 |
| **Cuotas** | Superar 5,000 movimientos (usuario) y 1,000 (demo), 100 cuentas, 200 metas, 50 recurrentes; una importación que no cabe se rechaza completa con `QUOTA_EXCEEDED` | PS-07, RNF-067, RN-009 |
| **Freno por tamaño** | Con un tamaño de base simulado sobre el 70 % del límite, el demo responde `DEMO_CAPACITY_REACHED` y no se crea el perfil; con el tamaño normal, funciona | RNF-071, SEG-DEM-10 |
| **Idempotencia** | Mismo `client_request_id` en `transactions`, `transfers`, `goal_entries`; ocurrencias recurrentes duplicadas | RNF-010 |
| **Funciones SQL** | `create_transfer`, `add_goal_entry` (atómico, completa la meta), `archive_account` (saldo ≠ 0), `confirm_import`; `search_path` fijo; no ejecutables por `anon` | PS-31, SEG-AUZ-06 |
| **Vistas y agregados** | `account_balances`, `ledger`, `monthly_totals` coinciden con el cálculo del dominio sobre un mismo conjunto de datos | RF-020 |
| **Índices** | Existen y se usan con 5,000 filas (`EXPLAIN`; se fuerza `enable_seqscan = off` solo en la prueba, porque el planificador prefiere recorridos secuenciales en tablas pequeñas) | RNF-007 |
| **Tareas programadas (SQL)** | Limpieza de demos vencidos y anónimos huérfanos; purga de eliminados a los 30 días; purga de `demo_signups` a las 24 h (se manipulan las marcas de tiempo) | PS-09, RNF-016, 027 |
| **Eliminación de cuenta** | Tras eliminar, **cero filas** en todas las tablas del usuario | PS-32, RNF-065 |
| **Búsqueda** | `q` con comodines y con intentos de inyección no altera el filtro | PS-16 |

## 8. Pruebas de contrato (casos de uso y acciones)

**Diseño para poder probar:** las Server Actions son envoltorios delgados (`autenticar → validar → caso de uso → mapear error`). Los **casos de uso** se prueban contra la base local con un cliente del usuario; el **envoltorio** se prueba **una sola vez de forma genérica** (autenticación, validación, mapeo a `Result`).

Un archivo de datos `tests/integration/contract/catalogo.json` refleja las tablas de `06-api-contrato.md` (función, acceso, entradas válidas e inválidas, errores esperados) y genera automáticamente, para **cada** función:

| Prueba generada | Esperado |
|-----------------|----------|
| Entrada válida | `ok: true` con la forma del tipo definido |
| Cada entrada inválida | El `ErrorCode` exacto (`VALIDATION_FAILED` con `fieldErrors`, `DATE_OUT_OF_RANGE`, etc.) |
| Sin sesión (acciones de usuario) | `UNAUTHENTICATED` (PS-04) |
| Identificador de otro usuario | `NOT_FOUND` (PS-03) |
| Sesión demo en acciones «No demo» | `FORBIDDEN_DEMO` (RN-063) |
| Repetir con el mismo `clientRequestId` | Mismo registro, sin duplicar |
| Acciones que desbloquean logros | `meta.unlockedAchievements` correcto |

**Flujos de acceso (sin pasar por el Google real):** las pruebas automáticas **no** usan cuentas reales de Google (automatizarlas incumple sus términos y es frágil). En el Supabase **local**, el acceso por correo está habilitado **solo para pruebas** (en *staging* y producción está desactivado, SEG-AUT-02): el *helper* `loginAs(usuario)` crea usuarios con la API de administración y obtiene una sesión real. El intercambio de código de `/auth/callback` se prueba con un **doble** del cliente de Supabase.

| Caso | Esperado |
|------|----------|
| Primer acceso (usuario nuevo) | Se crea el perfil con el nombre saneado (cargas XSS y caracteres de dirección neutralizados, SEG-AUT-12) |
| Acceso de un usuario existente | Entra a su dashboard sin duplicar el perfil |
| Callback con código inválido, error o cancelación de Google | `OAUTH_FAILED`; vuelta al acceso sin sesión |
| Callback con destino fuera de la lista | Rechazado; redirige a una ruta segura (PS-19) |
| Cookies tras el callback | `HttpOnly`, `Secure`, `SameSite` (PS-12) |
| Cierre de sesión | El token anterior deja de funcionar (PS-13) |
| `finishDemoSetup` | Idempotente; siembra una sola vez; respeta límites, tope global y freno por tamaño; sin captcha válido no hay sesión (PS-08) |
| `linkGoogleToDemo` | Conserva el usuario y sus datos; el demo deja de caducar (RF-029) |
| `/api/cron/*` | 401 sin secreto; idempotentes con secreto (PS-26) |
| `/api/export/transactions` | CSV con BOM; celdas peligrosas neutralizadas (PS-17); sin sesión → 401 |
| Configuración de producción | **Manual (PP-38):** el proveedor de correo y contraseña está desactivado |

**Captcha en pruebas:** un adaptador `CaptchaVerifier` se sustituye por un doble en pruebas unitarias; en E2E se usan las **claves de prueba oficiales de Cloudflare Turnstile** (una que siempre aprueba y otra que siempre rechaza) 🔎.

## 9. Recorridos E2E (Playwright)

**Matriz de ejecución:** en cada Pull Request, Chromium en 3 anchos (360, 768, 1280) más WebKit móvil (para Safari iOS); en la ejecución nocturna y antes de publicar, **Chromium + Firefox + WebKit × 3 anchos** (RNF-040, 041). Reintento máximo: 1 (solo E2E); una prueba inestable se pone en cuarentena con incidencia en 48 h.

| ID | Recorrido | Cubre | Tamaños |
|----|-----------|-------|---------|
| E2E-01 | Del enlace al dashboard demo con datos en ≤ 5 s y ≤ 2 acciones | RF-028, RNF-005, OBJ-06 | 3 |
| E2E-02 | Demo: el nombre aparece en la interfaz; el banner «Modo demo»; acciones restringidas deshabilitadas | RF-028, RN-063, RNF-031 | 3 |
| E2E-03 | Demo con nombre malicioso (`<script>`, caracteres de dirección) | PS-10, PS-11 | 1 |
| E2E-04 | Primer acceso con Google (sesión preparada con `loginAs` y callback con doble): se crea el perfil y empieza el recorrido guiado | RF-001, RF-041 | 1 |
| E2E-05 | Cierre de sesión, botón «atrás» y sesión expirada | RF-002 | 3 |
| E2E-06 | ~~Recuperación de contraseña~~ **DESCARTADO** (no hay contraseñas) | RF-003 descartado | — |
| E2E-07 | Registrar un gasto en **≤ 3 interacciones** desde el dashboard (el test cuenta clics y escrituras) | RF-007, OBJ-01 | 3 |
| E2E-08 | Editar, eliminar y «Deshacer» un movimiento; el saldo se actualiza | RF-008, RF-040 | 3 |
| E2E-09 | Lista: filtros, búsqueda, paginación, estado vacío | RF-009 | 3 |
| E2E-10 | Transferencia entre cuentas (misma y distinta moneda) | RF-010 | 1 |
| E2E-11 | Importar CSV: vista previa, filas inválidas y duplicadas, confirmación | RF-011 | 1 |
| E2E-12 | Exportar CSV (descarga; abre bien con tildes) | RF-012 | 1 |
| E2E-13 | Crear meta, aportar, ver proyección y semáforo con icono + texto | RF-014 a 017 | 3 |
| E2E-14 | Completar una meta: aparece el **sello**; con movimiento reducido, versión sin movimiento | RF-015, RF-037, RNF-037 | 1 |
| E2E-15 | Presupuesto: barra y alertas al cruzar 80 % y 100 % | RF-018, 019 | 3 |
| E2E-16 | Recurrente creada con inicio en el pasado: se generan las ocurrencias pendientes sin duplicar | RF-030, 031 | 1 |
| E2E-17 | Vista de suscripciones: total mensual y próximos cobros | RF-032 | 1 |
| E2E-18 | Insights: se muestran, se descartan y no reaparecen | RF-033, 034 | 1 |
| E2E-19 | Racha y «Hoy no gasté»; sellos desbloqueados y bloqueados | RF-035 a 037 | 1 |
| E2E-20 | Cambio de idioma sin recargar y persistencia | RF-038, RNF-047 | 3 |
| E2E-21 | Navegación adaptable: barra inferior (móvil), riel (tablet), barra lateral colapsable (escritorio) | RF-025, RF-039 | 3 |
| E2E-22 | Onboarding: recorrido omitible y repetible | RF-041 | 1 |
| E2E-23 | Tipo de cambio y totales convertidos | RF-023 | 1 |
| E2E-24 | Páginas 404 y 500 bilingües | RNF-063 | 3 |
| E2E-25 | **Dos usuarios alternando** (sin cruce por caché) | PS-28, T-21 | 1 |
| E2E-26 | Cabeceras de seguridad y **CSP con *nonce***; cero violaciones de CSP en la consola | PS-29 | 1 |
| E2E-27 | Cookies de sesión `HttpOnly`/`Secure`/`SameSite` tras acceder y tras el demo | PS-12 | 1 |
| E2E-28 | Demo caducado (se fuerza el vencimiento en la base) → redirige al acceso | RNF-027 | 1 |
| E2E-29 | Eliminar cuenta real: todo desaparece | RF-005, PS-32 | 1 |
| E2E-30 | Solo teclado en los flujos críticos (acceso demo, registrar, crear meta) | RNF-035 | 1 |

## 10. Accesibilidad, responsive y visual

| Prueba | Detalle | RNF |
|--------|---------|-----|
| **axe** en cada pantalla × 3 anchos | Cero violaciones críticas o serias | RNF-033 |
| Contrastes desde los tokens | Recalcula los ratios de `07` §3.4 y falla si alguno baja del umbral | RNF-034 |
| Objetivos táctiles | Todo elemento interactivo ≥ 44 × 44 px en móvil | RNF-038 |
| Sin desplazamiento horizontal | `scrollWidth ≤ clientWidth` a 320, 360, 768 y 1280 px; también con la fuente al 200 % | RNF-041 |
| Orden de foco y foco visible | Recorrido con `Tab` | RNF-035 |
| Estados sin color | Cada estado tiene icono + texto | RNF-036 |
| Movimiento reducido | Con la preferencia activada, sin animaciones de desplazamiento, conteo ni celebración | RNF-037 |
| **Pseudo-localización** | Una configuración regional `pseudo` (**solo en construcciones de desarrollo**) con textos un 30 % más largos y con tildes; sin desbordes ni cortes. Una prueba verifica que el *build* de producción **no** la incluye | RNF-044 a 047 |
| **Visual** | Capturas por pantalla × 3 anchos en Chromium, con animaciones desactivadas y fuentes propias; las zonas con fechas relativas se enmascaran (`data-volatile`); tolerancia 1 %; las líneas base viven en el repositorio y solo se actualizan con un comando explícito y revisión | 07 §12 |
| **Detector de impeccable** | `npx impeccable detect src/` sin hallazgos (política de `08` §6) | 07 §11 |

## 11. Rendimiento

| Prueba | Umbral | Dónde se ejecuta |
|--------|--------|------------------|
| Lighthouse CI (acceso y dashboard, móvil de referencia) | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms; puntajes ≥ 90 | PR (2 páginas) y nocturna |
| Peso del cliente | JS inicial ≤ 200 KB comprimido en el acceso | PR (límite en CI) |
| Carga ligera con k6 (usuario con 5,000 movimientos) | p95 ≤ 500 ms en lecturas y escrituras | Nocturna / antes de publicar |
| Dashboard con 5,000 movimientos | Renderiza en ≤ 2 s | Nocturna |
| Entrada al demo | ≤ 5 s | E2E-01 en cada PR |

## 12. Mapa de las pruebas de seguridad (PS-01 a PS-32)

El detalle de qué comprueba cada una está en `09-seguridad.md` §6. Aquí, dónde y cuándo se ejecutan:

| PS | Capa | Cuándo |
|----|------|--------|
| 01, 02 | Integración de datos (RLS generada) | Cada PR |
| 03, 04 | Contrato | Cada PR |
| 05, 06, 07 | Integración de datos | Cada PR |
| 08, 09 | Contrato + integración (limpieza) | Cada PR |
| 10, 11 | Unitaria (saneamiento) + E2E (E2E-03) | Cada PR |
| 12, 13 | E2E (E2E-27) + contrato | Cada PR |
| 14, 15 | Descartadas (sin contraseñas) | — |
| 16, 17 | Integración + contrato | Cada PR |
| 18, 19 | E2E / contrato | Cada PR |
| 20, 21, 22, 23, 24 | Estática (gitleaks, *bundle*, `pnpm audit`, análisis del flujo de CI, sumas de control de la skill) | Cada PR y nocturna |
| 25 | Estática (`CODEOWNERS` + regla de CI sobre archivos protegidos) | Cada PR |
| 26 | Contrato | Cada PR |
| 27 | Unitaria (logger) | Cada PR |
| 28 | E2E (E2E-25) | Cada PR |
| 29 | E2E (E2E-26) | Cada PR |
| 30 | Estática (búsqueda en el código) | Cada commit |
| 31 | Integración de datos | Cada PR |
| 32 | Integración de datos + E2E (E2E-29) | Cada PR |

## 13. Pruebas que se verifican a mano (registradas en `traceability.exceptions.md`)

| Qué | Por qué no se automatiza | Frecuencia |
|-----|--------------------------|-----------|
| Restauración de un respaldo manual cifrado (RNF-012) | El plan gratuito no incluye respaldos automáticos | Antes de publicar y cada trimestre |
| **Inicio de sesión real con Google** (primer acceso, regreso, cierre y eliminación) desde una cuenta que no es la tuya | Automatizarlo con cuentas reales incumple los términos de Google y es frágil | Antes de publicar y tras cualquier cambio del cliente OAuth |
| Proveedor de correo y contraseña **desactivado** en *staging* y producción | Es configuración remota de Supabase | Antes de publicar (PP-38) |
| Lector de pantalla (NVDA y VoiceOver) en acceso, dashboard y registrar | La automatización no valida la experiencia real | Cada fase de interfaz |
| Dispositivos reales (iPhone con Safari, Android con Chrome) | Teclado en pantalla y áreas seguras | Antes de publicar |
| Revisión ASVS nivel 1 y recorrido del modelo de amenazas | Juicio humano | Antes de publicar |
| Crítica de diseño con la skill (`critique`) | Juicio de diseño | Cada fase de interfaz |

## 14. Pipeline de CI (concreta el documento 05 §10)

**En cada Pull Request** (se detiene al primer fallo; las etapas independientes corren en paralelo):

| Etapa | Contenido |
|-------|-----------|
| 1. Preparación | Instalación con *lockfile* congelado; gitleaks; `pnpm audit`; comprobación de acciones fijadas por SHA |
| 2. Estática | `tsc`, ESLint (colores fuera de tokens, `dangerouslySetInnerHTML`, `parseFloat`/`toFixed` en dinero, complejidad ≤ 10), `dependency-cruiser`, detector de impeccable, commitlint, `check-traceability` |
| 3. Rápidas | Unitarias, propiedades, componentes, paridad de idiomas, cobertura con umbrales |
| 4. Datos | `supabase start`; migraciones desde cero; integración (RLS, permisos, disparadores, funciones) y contrato |
| 5. Build | Compilación de producción; peso del cliente; prueba de que no hay artefactos de prueba (`pseudo`) |
| 6. E2E y accesibilidad | Playwright (Chromium × 3 anchos + WebKit móvil), axe, visual, Lighthouse CI (2 páginas) |
| 7. Fusión a `main` | Aplicar migraciones a producción y desplegar |

**Nocturna:** matriz completa de navegadores × anchos, mutación con Stryker sobre `domain/`, k6, Lighthouse en todas las pantallas, `pnpm audit` y revisión de dependencias.

**Evidencia y reportes:** informe de cobertura (HTML), *trace* y video de Playwright solo en fallos, matriz de trazabilidad generada, resultados del detector de impeccable. Los reportes se guardan como artefactos del CI.

## 15. Definición de «hecho» de una tarea

- [ ] Existe al menos una prueba con el ID de la tarea y se vio fallar (RED) antes del código.
- [ ] Pruebas de la capa y del módulo en verde; sin `skip` ni `only`.
- [ ] Cobertura por encima de los umbrales; `check-traceability` en verde.
- [ ] Lint, tipos y reglas de capas en verde.
- [ ] Si toca interfaz: axe, capturas, 3 anchos, detector de impeccable, movimiento reducido.
- [ ] Si toca datos o seguridad: pruebas de RLS y de invariantes ejecutadas contra Supabase local.
- [ ] Un commit por tarea con evidencia (salida de los comandos) en el resumen.

## 16. Prompts listos para copiar (Codex)

### Prompt T1 · Infraestructura de pruebas

```text
Lee AGENTS.md y Documentacion/10-pruebas-automatizadas.md (secciones 1 a 4 y 14).
Tarea: dejar lista la infraestructura de pruebas, sin escribir pruebas de negocio todavía.
1. Vitest (unitarias, propiedades con fast-check, componentes con Testing Library), Playwright (Chromium, Firefox, WebKit; proyectos de 360, 768 y 1280 px) y axe.
2. Supabase local (CLI + Docker): script que lo levanta, aplica las migraciones desde cero y expone clientes por rol (anon, usuario A, usuario B, demo, servicio). Habilita en la configuración LOCAL el acceso por correo solo para crear sesiones de prueba (helper `loginAs`); en *staging* y producción debe estar desactivado. Verifica que Docker Desktop está disponible en esta máquina Windows y dímelo si no lo está.
3. Reloj inyectable con TODAY fija en America/Lima, fábricas de datos y helpers de usuarios.
4. scripts/check-traceability.ts y traceability.exceptions.md con las pruebas manuales de la sección 13.
5. Umbrales de cobertura del documento 10 (sección 2) que rompan el CI.
6. Workflow de GitHub Actions con las etapas de la sección 14 (acciones fijadas por SHA, permisos mínimos).
7. Reglas de lint y dependency-cruiser del documento 05 (capas) y del 07 (colores fuera de tokens).
Consulta la documentación vigente de cada herramienta; avísame de cualquier diferencia con el documento.
Un commit por tarea, con evidencia de que cada pieza arranca. Detente a esperar mi confirmación.
```

### Prompt T2 · TDD de un requerimiento (repetir por cada uno)

```text
Lee AGENTS.md, Documentacion/10-pruebas-automatizadas.md (secciones 3 a 5 y 15) y los textos de <RF/RN/SEG> en los documentos 01, 03 y 09.
Tarea: implementar <RF-xxx> con TDD estricto.
1. RED: escribe las pruebas con el ID entre corchetes en el título, ejecútalas y pega la salida mostrando que fallan por la razón correcta.
2. GREEN: código mínimo; pega la salida.
3. REFACTOR sin romper; ejecuta lint, tipos y las pruebas del módulo.
Reglas: no modifiques ni borres pruebas existentes para que pasen; sin skip/only; no bajes umbrales. Si una prueba parece incorrecta, detente y pregúntame.
Termina con el commit, el resumen y la evidencia (salida de los comandos). Detente a esperar mi confirmación.
```

### Prompt T3 · Suite de seguridad

```text
Lee Documentacion/09-seguridad.md (secciones 3 a 7) y Documentacion/10-pruebas-automatizadas.md (secciones 7, 8 y 12).
Tarea: implementar PS-01 a PS-32 con la capa indicada en el documento 10, de forma que fallen primero (RED) contra el esquema y la aplicación actuales, y luego corregir lo necesario (GREEN).
La prueba de RLS debe generarse recorriendo el catálogo de la base (tabla × operación × rol), no escribirse a mano tabla por tabla.
Las pruebas de seguridad quedan protegidas por CODEOWNERS: no las modifiques para que pasen; si alguna es incorrecta, detente y pregúntame.
Entrega un informe en Documentacion/informes/seguridad.md con el resultado de cada PS y la evidencia. Detente a esperar mi confirmación.
```
