# 11 · Plan de Implementación — Zavia

> Estado: BORRADOR v0.4 · Convierte los documentos 00 a 10 en **15 fases ejecutables** por el agente (Codex), cada una con los documentos que debe leer, sus tareas, sus criterios de aceptación y una **parada obligatoria** para tu confirmación.
> El agente **nunca** lee los 13 documentos de golpe: en cada fase lee solo los que esta tabla le indica (más `AGENTS.md`).

## 1. Cómo funciona el plan

- **Una fase = una sesión de trabajo.** Al terminarla, el agente escribe un informe, actualiza `Documentacion/informes/estado.md` y **se detiene** hasta que tú escribas `CONTINUAR`.
- **Cada tarea = un commit** (con TDD y evidencia, documento 10 §4). El agente actualiza `estado.md` después de cada tarea, de modo que cualquier sesión nueva puede **reanudar** sin perder el hilo.
- **Alcance cerrado:** el agente solo hace lo de la fase actual. Si descubre algo que falta o que contradice un documento, **no lo resuelve en silencio**: lo anota en el informe como «propuesta de cambio» y tú decides.
- **Los documentos `00` a `12` están protegidos:** el agente solo escribe en `Documentacion/informes/`.
- **Tamaños relativos** (S/M/L) en lugar de plazos: dependen de cuántas iteraciones requiera cada fase.

## 2. Resumen de fases

| Fase | Nombre | Tam. | Cubre | Depende de | Núcleo |
|------|--------|------|-------|-----------|--------|
| F0 | Prerrequisitos (tú) | S | Cuentas, claves, Docker | — | ✔ |
| F1 | Cimientos y herramientas | M | RNF-048 a 062 | F0 | ✔ |
| F2 | Dominio puro | L | RN-001 a 071 (lógica) | F1 | ✔ |
| F3 | Base de datos y seguridad de datos | L | Doc 04; PS de datos | F1 | ✔ |
| F4 | Sistema de diseño y *shell* | L | RF-025, 026, 038, 039 | F1 | ✔ |
| F5 | Autenticación, demo y seguridad de acceso | L | RF-001 a 005, 028, 029 | F2, F3, F4 | ✔ |
| F6 | Cuentas, categorías y movimientos | L | RF-006 a 010, 013, 040 | F5 | ✔ |
| F7 | Dashboard y moneda | M | RF-020 a 023 | F6 | ✔ |
| F8 | Metas y presupuestos | L | RF-014 a 019 | F7 | ✔ |
| F9 | Importar y exportar CSV | M | RF-011, 012 | F6 | Opcional |
| F10 | Recurrentes y suscripciones | M | RF-030 a 032 | F6 | Opcional |
| F11 | Insights, rachas y sellos | L | RF-033 a 037 | F8, F10 | Opcional |
| F12 | Experiencia y preferencias | M | RF-024, 029, 040, 041 | F11 | Opcional |
| F13 | Endurecimiento y calidad final | L | Doc 09 completo, 10 completo | todas | ✔ |
| F14 | Despliegue y publicación | M | Doc 12 | F13 | ✔ |

**Corte mínimo publicable** (si el tiempo aprieta): **F0 a F8, F13 y F14**. Se pierden los *Should* de importación/exportación, recurrentes, insights, rachas/sellos, onboarding y preferencias. En ese caso, el generador de datos demo sigue sembrando todas las tablas (existen desde F3), pero la interfaz oculta las secciones no construidas, y el agente lo anota como «propuesta de cambio» para actualizar el 01.

**Orden de recorte recomendado** (de lo que menos aporta al portafolio a lo que más): F12 → F9 → F10 → F11. F11 (insights, rachas y sellos) es lo más distintivo de Zavia, así que es lo último que conviene sacrificar.

## 3. Puerta de control de cada fase (igual para todas)

Una fase solo se cierra cuando se cumple **todo** esto, con evidencia (salida de comandos) en el informe:

1. Pruebas de la fase y de las anteriores en verde; sin `skip`/`only`.
2. Cobertura sobre umbrales (doc 10 §2) y `check-traceability` en verde para los IDs de la fase.
3. Lint, tipos, reglas de capas y detector de impeccable (si hay interfaz) en verde.
4. Si toca datos o seguridad: pruebas de RLS e invariantes contra Supabase local.
5. Si toca interfaz: axe, capturas, 3 anchos, teclado y movimiento reducido (doc 10 §10).
6. CI verde en el Pull Request de la fase.
7. Informe `Documentacion/informes/fase-N.md` (plantilla en §5) y `estado.md` actualizado.
8. El agente **se detiene** y espera `CONTINUAR`.

## 4. Fases

### F0 · Prerrequisitos (los haces tú; el agente solo verifica)
**Objetivo:** tener lo que el agente no puede crear por ti.

| # | Qué | Cómo verificarlo |
|---|-----|------------------|
| 1 | **Docker Desktop** instalado y en ejecución (Windows 🔎 requisitos de WSL2) | `docker version` responde |
| 2 | **Node.js LTS** y **pnpm** (con `corepack enable`) | `node -v`, `pnpm -v` |
| 3 | **Git** configurado; repositorio de GitHub **público** creado; rama `main` protegida; **2FA** en GitHub | Un Pull Request de prueba exige CI |
| 4 | La skill **impeccable** movida a `.agents\skills\impeccable\` (doc 08 §3) | `/skills` la lista en Codex |
| 5 | Carpeta `Documentacion/` con los documentos 00 a 12, `AGENTS.md` y `PROMPT_MAESTRO.md` en la raíz | `ls` |
| 6 | Dos proyectos **Supabase** (*staging* y producción); **2FA** activado; en *Authentication* dejar **desactivado el proveedor de correo y contraseña** y activado solo Google | Las URL responden |
| 7 | Cuenta de **Vercel** conectada al repositorio; **2FA** | Despliegue vacío funciona |
| 8 | **Cloudflare Turnstile**: un widget con sus dos claves (más las claves de prueba oficiales para desarrollo 🔎) | Claves en el gestor de contraseñas |
| 9 | **Cliente OAuth de Google** (gratis, en Google Cloud **sin habilitar facturación**): pantalla de consentimiento con ámbitos básicos y redirección al callback de Supabase de *staging* y de producción; cuenta de Google con **2FA** 🔎 | Un inicio de sesión de prueba con una cuenta de Google |
| 10 | Archivo `.env.local` con las claves de *staging* (**nunca** las de producción para el agente) | `.env.local` está en `.gitignore` |

**Costo cero:** ningún paso de F0 debe pedirte tarjeta de crédito ni dominio propio (RNF-070). El acceso de las cuentas reales es **solo con Google** (`09-seguridad.md` §4.1): el cliente OAuth se crea gratis, sin facturación. La URL pública será `<proyecto>.vercel.app`.

**Puerta:** el agente, al iniciar F1, recorre esta lista y te dice qué falta.

---

### F1 · Cimientos y herramientas · M
**Leer:** `AGENTS.md`, 05 (§2 a 4, 8 a 10), 02 (RNF-048 a 062), 10 (§1 a 4, 14, 16/T1), 08 (§3 y prompt D1), 03 (**solo los valores numéricos y umbrales** para `business-constants.ts`; sin fórmulas ni lógica, que son de F2), 06 (§2 y 3: sobre de respuesta y catálogo de códigos de error) y 09 (§4.7 secretos, §4.8 cadena de suministro y SEG-LOG-04, para `.env.example`, CI y `SECURITY.md`).

| Tarea | Detalle |
|-------|---------|
| F1-T01 | Proyecto Next.js (App Router) + TypeScript `strict` + Tailwind + pnpm; estructura de carpetas del 05 §4 |
| F1-T02 | Calidad: ESLint, Prettier, commitlint, Husky + lint-staged; reglas propias (complejidad ≤ 10, colores fuera de tokens, `dangerouslySetInnerHTML`, `parseFloat`/`toFixed` en dinero); `dependency-cruiser` para las capas |
| F1-T03 | `config/business-constants.ts` (valores del 03), `Clock` inyectable, `Result`/`AppError`/`ErrorCode` (06 §2 y 3), logger con lista blanca (RNF-058) |
| F1-T04 | Infraestructura de pruebas (prompt T1 del doc 10); verificar Docker y `supabase start` |
| F1-T05 | `check-traceability`, `traceability.exceptions.md`, `CODEOWNERS` con archivos protegidos (`AGENTS.md`, `Documentacion/`, pruebas de seguridad, migraciones aplicadas, `.github/`) |
| F1-T06 | CI de GitHub Actions (etapas 1 a 5 del doc 10 §14; acciones fijadas por SHA, permisos mínimos), Dependabot, gitleaks, `.env.example`, `.gitignore`, `SECURITY.md` borrador |
| F1-T07 | Configurar impeccable (prompt D1 del doc 08): `PRODUCT.md`, `DESIGN.md`, verificación de sumas de control (SEG-SUP-08) |
| F1-T08 | `README` inicial; `Documentacion/informes/estado.md` y plantilla de informe |

**Aceptación:** `pnpm lint`, `typecheck` y `test` corren (con una prueba de humo); CI verde en un PR de prueba; una **prueba negativa** demuestra que romper la regla de capas falla el CI; `supabase start` arranca; `/impeccable doctor` sin errores; `check-traceability` funciona.

---

### F2 · Dominio puro · L
**Leer:** 03 completo, 10 (§5 y 15), 02 (RNF-013, 014, 050, 051, 057), 06 (§1 y 4), 04 (§1 y 3).
**Alcance:** solo `domain/` (TypeScript puro, sin Next.js ni Supabase). TDD estricto.

| Tarea | Reglas | Pruebas clave (doc 10 §5) |
|-------|--------|---------------------------|
| F2-T01 Dinero y moneda | RN-001, 003, 027 | 5.1 + propiedades |
| F2-T02 Fechas y zona horaria | RN-004, 070 | 5.3 |
| F2-T03 Saldos y transferencias | RN-002, 007 | 5.2 + propiedades |
| F2-T04 Cuentas y categorías (reglas) | RN-010, 011, 013 | Casos de ciclo de vida |
| F2-T05 Metas: proyección y semáforo | RN-020 a 024 | 5.4 + propiedades |
| F2-T06 Presupuestos | RN-025, 026 | 5.5 |
| F2-T07 Recurrentes y suscripciones | RN-030, 031 | 5.6 |
| F2-T08 Insights | RN-040 a 046 | 5.7 |
| F2-T09 Rachas y logros | RN-050 a 052 | 5.8 |
| F2-T10 CSV: parseo y duplicados | RN-012, 014 | 5.9 |
| F2-T11 Nombre del demo y saneamiento | RN-060, SEG-INP-03 | 5.9 |
| F2-T12 Generador de datos demo | RN-061 | 5.9 (3 metas, 3 presupuestos, insights, racha) |
| F2-T13 Esquemas Zod compartidos | 06 §1 y 4 | Entradas válidas e inválidas |

**Aceptación:** cobertura 100 % en dinero, metas, presupuestos, recurrentes e insights; las propiedades del doc 10 en verde; mutación base (Stryker) con umbral inicial; **ningún** import de `next`, `react`, `supabase` ni `Date.now()` en `domain/` (regla de capas); trazabilidad de RN-001 a RN-071 en lo que corresponde a lógica pura.

---

### F3 · Base de datos y seguridad de datos · L
**Leer:** 04 completo, 09 (§4.2, 5, 6), 10 (§7), 02 (RNF-007, 010, 011, 016, 017, 019, 020, 027, 067 a 069).

| Tarea | Detalle |
|-------|---------|
| F3-T01 | Migraciones: extensiones (`pg_trgm`, `pg_cron` 🔎), enums y las 15 tablas con claves compuestas, `CHECK` e índices |
| F3-T02 | RLS con el patrón único en todas las tablas; **revocar `anon`**; permisos por tabla y por columna (09 §4.2) |
| F3-T03 | Disparadores de invariantes y de **cuotas** (09 §5, RNF-067, 068) |
| F3-T04 | Funciones SQL: `create_transfer`, `add_goal_entry`, `archive_account`, `confirm_import`, `monthly_totals`, búsqueda con parámetro, y `database_size_bytes` (solo rol de servicio); `search_path` fijo y `execute` solo a `authenticated` (salvo la última) |
| F3-T05 | Vistas `security_invoker` (`account_balances`, `ledger`) |
| F3-T06 | Alta automática de `profiles` y categorías predeterminadas (claves) |
| F3-T07 | Tareas `pg_cron`: limpieza de demos y anónimos huérfanos, purga de eliminados (30 d), purga de `demo_signups` (24 h) |
| F3-T08 | Tipos TypeScript generados desde el esquema |
| F3-T09 | Pruebas de integración del doc 10 §7: RLS generada, permisos, invariantes, cuotas, idempotencia, funciones, vistas, índices, cron, cascada |

**Aceptación:** **PS-01, 02, 05, 06, 07, 31, 32** en verde; la base se recrea desde cero; la prueba que falla si una tabla pública no tiene RLS está activa; revisión con las herramientas de diagnóstico de Supabase (*lint*/avisos de seguridad) 🔎 sin hallazgos críticos.

---

### F4 · Sistema de diseño y *shell* · L
**Leer:** 07 completo, 08 (§1 a 5, prompt D2), 05 (§7 y 11), 02 (RNF-033 a 038, 040 a 047, 063), 06 (§3).

| Tarea | Detalle |
|-------|---------|
| F4-T01 | Tokens (CSS y Tailwind), fuentes con `next/font` (verificar `tnum`/`lnum`, tildes y ñ) y **prueba de contrastes** (07 §3.4) |
| F4-T02 | Componentes base con todos sus estados (07 §6) y página interna `/design` en 3 anchos |
| F4-T03 | Marca: lockup, sello, favicon, `apple-touch-icon` e imagen Open Graph (07 §2.1) |
| F4-T04 | i18n con `next-intl` (español sin prefijo, `/en/`), paridad de claves, escaneo de cadenas en código, configuración regional `pseudo` **solo en desarrollo** |
| F4-T05 | *Shell* responsivo: barra inferior (móvil), riel (tablet), barra lateral colapsable (escritorio) (RF-025); banner de demo (componente) |
| F4-T06 | Estados vacío, carga y error; páginas 404 y 500 bilingües; avisos con «Deshacer» (componente) |
| F4-T07 | Cada pieza pasa por el flujo de impeccable (08 §4) y el detector |

**Aceptación:** axe sin críticos; contrastes verificados por prueba; capturas de referencia en 3 anchos; sin desplazamiento horizontal desde 320 px; objetivos táctiles ≥ 44 px; paridad ES/EN; el *build* de producción **no** incluye `pseudo`; detector de impeccable limpio.

---

### F5 · Autenticación, demo y seguridad de acceso · L
**Leer:** 01 (RF-001 a 005, 028, 029), 06 (§5.1 y 6), 09 (§4.1, 4.3 a 4.7), 05 (§5.3 y 5.4), 10 (§8), 02 (RNF-021, 027 a 032, 074), 07 (pantalla «Acceso»).

| Tarea | Detalle |
|-------|---------|
| F5-T01 | `proxy.ts`: CSP con *nonce*, cabeceras de seguridad, refresco de sesión (**sin** autorización) 🔎 |
| F5-T02 | Clientes de Supabase (navegador, servidor, servicio); `requireUser()`; envoltorio de acciones (autenticar → validar → caso de uso → `Result`) |
| F5-T03 | Límite del demo (`demo_signups`) y adaptador de Turnstile (con doble de prueba) |
| F5-T04 | Acceso con Google: `signInWithGoogle`, ruta `/auth/callback` (intercambio de código en servidor, destinos permitidos), `signOut`, `deleteMyAccount`; alta del perfil en el primer acceso con nombre saneado; `OAUTH_FAILED` (RF-001, 002, 005) |
| F5-T05 | Cookies de sesión reescritas con `HttpOnly` desde el servidor (SEG-AUT-06) 🔎 |
| F5-T06 | Configuración de Supabase Auth: Google con ámbitos básicos y redirecciones exactas; proveedor de correo y contraseña **desactivado**; verificación (SEG-AUT-11, SEG-INF-02) |
| F5-T07 | Pantalla de acceso con el **demo como acción principal**; `startDemo` (navegador, con captcha) y `finishDemoSetup` (idempotente, cuotas, tope global, **freno por tamaño** (RNF-071), *hash* de IP, siembra con el generador de F2) |
| F5-T08 | Restricciones del demo (RN-063); `linkGoogleToDemo` (RF-029, *Could*) |
| F5-T09 | Pantalla de inicio posterior al acceso (marcador provisional con el nombre y un resumen de lo sembrado; el dashboard real llega en F7) |

**Aceptación:** **PS-04, 08, 09, 10, 11, 12, 13, 18, 19, 29** en verde (PS-14 y PS-15 descartadas); E2E-02, 03, 04, 05, 26, 27, 28, 29; E2E-01 en lo posible (se completa en F7); CSP sin violaciones en consola; el flujo real con Google probado a mano con una cuenta que no es la tuya; entrada al demo ≤ 5 s.

---

### F6 · Cuentas, categorías y movimientos · L
**Leer:** 01 (RF-006 a 010, 013, 040), 03 (§1 y 2), 06 (§5.3 a 5.5), 07 (pantallas «Registrar movimiento», «Movimientos», «Cuentas»), 10 (§8 y 9).

| Tarea | Detalle |
|-------|---------|
| F6-T01 | Repositorios e implementaciones de casos de uso: cuentas, categorías, movimientos, transferencias |
| F6-T02 | Server Actions y pruebas de contrato generadas desde el catálogo (doc 10 §8) |
| F6-T03 | Pantalla de cuentas y saldos (RF-006) |
| F6-T04 | **Registrar movimiento en ≤ 3 interacciones** (hoja inferior/diálogo) con cuenta y fecha precargadas (RF-007, OBJ-01) |
| F6-T05 | Lista con filtros, búsqueda, paginación y estado vacío (RF-009); edición y eliminación con **Deshacer** (RF-008, RF-040) |
| F6-T06 | Transferencias (RF-010) y categorías (RF-013) |
| F6-T07 | Registro de actividad para la racha en movimientos manuales (datos para F11) |

**Aceptación:** E2E-07 (cuenta de interacciones), 08, 09, 10, 25; **PS-03, 16, 28**; contrato generado para todas las funciones de §5.3 a 5.5; idempotencia con `clientRequestId`.

---

### F7 · Dashboard y moneda · M
**Leer:** 01 (RF-020 a 023), 03 (RN-002, 007, 027), 06 (§4 y 5.11), 07 (pantalla «Dashboard» y §3.5 gráficos), 02 (RNF-001 a 006).

| Tarea | Detalle |
|-------|---------|
| F7-T01 | `getDashboardSummary` sobre `monthly_totals` con conversión a moneda base |
| F7-T02 | Dashboard: saldo total (cifra grande), resumen del mes, gasto por categoría como lista con barras, tendencia de 6 meses con **tabla alternativa**, variación contra el mes anterior |
| F7-T03 | Tipo de cambio manual (RF-023) con confirmación del cambio > 20 % |
| F7-T04 | Conteo animado de cifras (solo primera carga; respeta movimiento reducido) |
| F7-T05 | Lo visible sin hacer *scroll* en escritorio: saldo, resumen, metas y alertas (cuando existan) |

**Aceptación:** E2E-01 completo (demo con datos en ≤ 5 s), E2E-23; dashboard con 5,000 movimientos en ≤ 2 s (RNF-004); Lighthouse del dashboard sobre umbral; axe sin críticos.

---

### F8 · Metas y presupuestos · L
**Leer:** 01 (RF-014 a 019), 03 (§3 y 4), 06 (§5.7 y 5.8), 07 (pantallas «Metas» y «Presupuestos»; §6 píldora y barra), 10 (§5.4 y 5.5).

| Tarea | Detalle |
|-------|---------|
| F8-T01 | Casos de uso de metas (`addGoalEntry` atómico con completado) y de presupuestos versionados |
| F8-T02 | Pantallas de metas (lista, detalle con **gráfico de proyección**, aportes) y presupuestos (barras y alertas) |
| F8-T03 | Semáforo con icono + texto + color; mensaje de proyección en lenguaje natural (07 §7, §9) |
| F8-T04 | Verificar que las 3 metas y 3 presupuestos del demo se ven en verde, ámbar y rojo en la interfaz (RN-061) |

**Aceptación:** E2E-13 y E2E-15; las razones 1.25, 0.92 y 0.667 del demo coinciden en pantalla; retiros que pasan de 0 rechazados; **PS-07** para metas; `critique` y `audit` de impeccable aplicados.

---

### F9 · Importar y exportar CSV · M *(opcional)*
**Leer:** 01 (RF-011, 012), 03 (RN-012, 014), 06 (§5.6 y 6), 09 (SEG-INP-08, 09), 10 (§5.9).
**Tareas:** `previewImport` sin estado y `confirmImport` con revalidación total y límite de 5 por hora; interfaz de vista previa (válidas, inválidas con motivo, duplicadas); `/api/export/transactions` con BOM y neutralización de fórmulas.
**Aceptación:** E2E-11 y 12; **PS-17**; archivos fuera de límite rechazados con `FILE_TOO_LARGE`/`FILE_INVALID`; fila inválida no bloquea a las válidas.

---

### F10 · Recurrentes y suscripciones · M *(opcional)*
**Leer:** 01 (RF-030 a 032), 03 (RN-030, 031), 06 (§5.9 y 6), 05 (§6), 10 (§5.6).
**Tareas:** casos de uso y pantallas de recurrentes y suscripciones; `generateDueRecurrences` (idempotente, máximo 24 por ejecución); `/api/cron/recurring` y `/api/cron/daily` con `CRON_SECRET` y comparación en tiempo constante; recuperación al iniciar sesión; vista de suscripciones.
**Aceptación:** E2E-16 y 17; **PS-26**; ejecutar la generación dos veces no duplica (RNF-010); día 31 y 29 de febrero correctos.

---

### F11 · Insights, rachas y sellos · L *(opcional)*
**Leer:** 01 (RF-033 a 037, 015), 03 (§7 y 8), 06 (§5.10), 07 (§8.1 celebración y catálogo de sellos, pantalla «Sellos»), 08 (prompt D4), 10 (§5.7, 5.8, 6).
**Tareas:** panel de insights calculado (no almacenado) y descartes; racha y «Hoy no gasté»; desbloqueo de logros **solo desde el servidor** con la clave de servicio; pantalla de sellos; **celebración de sello** (≈ 1.1 s, una a la vez, versión de movimiento reducido) y su integración al completar una meta.
**Aceptación:** E2E-14, 18, 19; **PS-06** re-verificada; importaciones, recurrentes y datos semilla **no** cuentan para rachas ni logros; un logro no se repite ni se pierde; anuncio accesible con `role="status"`.

---

### F12 · Experiencia y preferencias · M *(opcional)*
**Leer:** 01 (RF-024, 029, 040, 041), 07 (§5, 6, 7 y 10), 08 (§4 y comandos `adapt`, `onboard`, `clarify`).
**Tareas:** pantalla de ajustes (perfil, idioma, tipo de cambio, preferencias, importar/exportar, eliminar cuenta); recorrido guiado de 4 pasos (RF-041); interacciones restantes de RF-040 (deslizar para eliminar **con alternativa por menú**, gráficos interactivos); atajos de teclado (*Could*); `convertDemoToAccount` si quedó pendiente; pasada de `adapt` y `clarify` por todas las pantallas.
**Aceptación:** E2E-22 y 30; axe sin críticos en todas las pantallas; textos ES/EN sin desbordes con `pseudo`.

---

### F13 · Endurecimiento y calidad final · L
**Leer:** 09 completo, 10 (§2, 10 a 15, 16/T3), 08 (§5 a 8, prompt D5), 12 (secciones A a H).

| Tarea | Detalle |
|-------|---------|
| F13-T01 | **Suite de seguridad completa** PS-01 a PS-32 (prompt T3) e informe `seguridad.md` |
| F13-T02 | Auditoría final de diseño (prompt D5) y detector sin hallazgos |
| F13-T03 | Rendimiento: Lighthouse CI en todas las pantallas, k6 con 5,000 movimientos, presupuesto de JS |
| F13-T04 | Mutación con Stryker sobre `domain/` y mejora de pruebas débiles |
| F13-T05 | Matriz completa de navegadores × anchos (Chromium, Firefox, WebKit × 360/768/1280) |
| F13-T06 | Trazabilidad al 100 % (excepciones justificadas) y matriz generada |
| F13-T07 | `scripts/verify-env.ts` (verificación de claves, doc 12 §D) y *smoke tests* |
| F13-T08 | Documentación del repositorio: `README` de portafolio (descripción, capturas, enlace al demo, arquitectura, decisiones, cómo ejecutar en local), `SECURITY.md` final, política de privacidad y términos ES/EN, `LICENSE`, `CHANGELOG` |

**Aceptación:** todo el doc 10 §15 en verde; checklist del doc 12 (secciones A a H) **sin pendientes del agente**; los pendientes humanos quedan listados.

---

### F14 · Despliegue y publicación · M
**Leer:** 12 completo, 05 (§6, 10), 09 (§7 y 8).

| Tarea | Detalle |
|-------|---------|
| F14-T01 | Despliegue a *staging* (migraciones, variables, cron, Google OAuth, Turnstile) y *smoke tests* |
| F14-T02 | Respaldo y **prueba de restauración** (RNF-012) *(tú)* |
| F14-T03 | Despliegue a producción con migraciones hacia adelante; verificación de claves con `verify-env` |
| F14-T04 | Monitor de disponibilidad sobre `/api/health`, *keep-alive* y alertas |
| F14-T05 | Revisión manual con ASVS nivel 1, lector de pantalla y dispositivos reales *(tú)* |
| F14-T06 | Etiqueta `v1.0.0`, `README` con el enlace al demo, imagen Open Graph verificada al compartir el enlace |

**Aceptación:** checklist del doc 12 completo (o riesgo aceptado por escrito); demo funcionando desde un dispositivo distinto al tuyo; plan de reversión probado.

## 5. Plantillas

**`Documentacion/informes/estado.md`** (el agente lo actualiza tras cada tarea):

```markdown
# Estado de implementación — Zavia
- Fase actual: F#
- Última tarea completada: F#-T## (commit <hash>)
- Próxima tarea: F#-T##
- Fases cerradas: F0, F1, …
- Bloqueos / decisiones pendientes del autor:
- Propuestas de cambio a la documentación (sin aplicar):
- Versiones fijadas (Next.js, Supabase CLI, impeccable, …):
```

**`Documentacion/informes/fase-N.md`**:

```markdown
# Informe de la fase N — <nombre>
1. Qué se construyó (tareas y commits)
2. Evidencia: salida de lint, tipos, pruebas, cobertura, trazabilidad (y axe/capturas si hubo interfaz)
3. IDs cubiertos (RF / RN / RNF / SEG / PS / E2E)
4. Desviaciones respecto a la documentación y motivo
5. Propuestas de cambio a los documentos (para que el autor decida)
6. Propuestas de impeccable aplicadas y descartadas (con motivo)
7. Riesgos y deuda técnica detectados
8. Decisiones que necesitan al autor
9. Siguiente fase y qué leerá
```

## 6. Cambios a la documentación durante la implementación

Si una fase revela un error o una laguna en los documentos, el agente **no modifica los documentos**: lo registra en el informe (§5, punto 5). Tú decides y, si procede, se actualiza el documento (con nueva versión) **antes** de continuar. Así los documentos siguen siendo la fuente de verdad y las pruebas no se desalinean.
