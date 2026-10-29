# 01 · Requerimientos Funcionales — Zavia

> Estado: BORRADOR v0.6

## Convenciones

- **ID:** `RF-###`, único y nunca reutilizado. Cada prueba automatizada referencia el ID que cubre (ver `10-pruebas-automatizadas.md`).
- **Prioridad (MoSCoW):** **M** = Must (MVP no existe sin esto) · **S** = Should · **C** = Could.
- **Criterios de aceptación:** formato *Dado / Cuando / Entonces*. Un RF está terminado solo si todos sus criterios pasan en pruebas automatizadas.
- Las fórmulas y umbrales exactos viven en `03-reglas-de-negocio.md` (referencias como `RN-xxx`).
- Los montos se muestran como `S/ 1,234.50` y `US$ 1,234.50`; las fechas y los textos siguen el idioma elegido (RF-038).

---

## Módulo AUTH — Autenticación

### RF-001 · Acceso con Google (alta y entrada de cuentas reales) · M
Las cuentas reales entran **solo con Google**; no hay contraseñas ni correos propios (decisión de costo cero y de seguridad, ver `09-seguridad.md` §4.1).
- Dado un visitante sin cuenta, cuando elige «Continuar con Google» y acepta, entonces se crea su cuenta (perfil con nombre y correo tomados de Google) y entra al dashboard, con el recorrido de RF-041.
- Dado un usuario con cuenta, cuando elige «Continuar con Google», entonces entra a su dashboard.
- Dado que cancela o falla el acceso con Google, entonces vuelve a la pantalla de acceso con un mensaje claro y la opción de reintentar o de probar el demo (`OAUTH_FAILED`).
- Solo se solicitan los permisos básicos de identidad (perfil y correo); nunca acceso a correo, archivos ni contactos.
- El nombre recibido de Google se sanea como cualquier texto del usuario (SEG-INP-03).

### RF-002 · Sesión y cierre de sesión · M
- Cuando cierra sesión, entonces la sesión se invalida y no puede volver con el botón "atrás".
- Dada una sesión expirada, entonces es redirigido al acceso conservando su destino (solo destinos permitidos, SEG-AUT-09).
- La sesión se mantiene entre visitas hasta que expire o el usuario cierre sesión.

### RF-003 · ~~Recuperación de contraseña~~ · **DESCARTADO**
- No hay contraseñas propias: el acceso real es con Google. El ID no se reutiliza.

### RF-004 · ~~Inicio de sesión con Google~~ · **FUSIONADO EN RF-001**
- Google pasó a ser el método de acceso principal (RF-001). El ID no se reutiliza.

### RF-005 · Eliminar cuenta y datos · S
- Cuando confirma escribiendo su correo, entonces se eliminan su cuenta y todos sus datos asociados, y se cierra la sesión.
- Se le indica cómo retirar el permiso de Zavia desde su cuenta de Google (Zavia no puede hacerlo por él).

### RF-028 · Modo demo (acceso rápido sin registro) · M
Desde la pantalla de acceso, un botón "Probar demo" pide únicamente **nombre y apellido**.
- Dado un nombre y apellido válidos (2 a 40 caracteres cada uno; letras, tildes, espacios, guion y apóstrofe), cuando continúa, entonces entra al dashboard **con datos de ejemplo ya cargados** y su nombre se muestra en la interfaz (saludo y menú de perfil).
- Dado un nombre con caracteres no permitidos o con código (por ejemplo `<script>`), entonces es rechazado o neutralizado y nunca se ejecuta ni se muestra sin escapar.
- Los datos de ejemplo cubren todas las funciones: varias cuentas en PEN y USD, al menos 90 días de transacciones, metas en verde, ámbar y rojo, presupuestos en distintos estados, recurrentes y suscripciones, insights activos, una racha y logros ya desbloqueados.
- Una barra o etiqueta permanente indica "Modo demo" e invita a crear una cuenta real.
- Los datos de un visitante demo no son visibles para ningún otro visitante ni usuario.
- La sesión demo caduca y sus datos se eliminan (plazo en `02-requerimientos-no-funcionales.md`).
- En modo demo están deshabilitadas las acciones sensibles: eliminación de la cuenta real. El resto de funciones es plenamente interactivo.
- Del enlace al dashboard con datos: ≤ 10 segundos y ≤ 2 acciones (OBJ-06).

### RF-029 · Convertir demo en cuenta real · C
- Cuando un visitante demo elige «Continuar con Google», entonces su cuenta de Google se vincula a la misma sesión demo y puede **conservar** los datos que creó (dejan de caducar) o empezar con una cuenta limpia.

---

## Módulo ACC — Cuentas

### RF-006 · Gestión de cuentas · M
CRUD de cuentas con nombre, tipo (efectivo, banco, tarjeta, billetera digital), moneda (PEN/USD) y saldo inicial.
- Cuando crea una cuenta con saldo inicial S/ 500, entonces su saldo actual es S/ 500.
- La moneda no se puede cambiar si la cuenta ya tiene transacciones.
- Una cuenta con transacciones no se elimina; se archiva (RN-010).
- Se muestra el saldo actual por cuenta y el saldo total (convertido, ver RF-023).

---

## Módulo TRX — Transacciones

### RF-007 · Registrar transacción · M
Campos: tipo (ingreso/gasto), monto > 0, cuenta, categoría, fecha, descripción opcional.
- Cuando registra un gasto de S/ 50 en una cuenta con S/ 500, entonces el saldo pasa a S/ 450.
- Dado un monto ≤ 0 o una fecha vacía, entonces el formulario no se envía y muestra el error.
- Una fecha futura es permitida solo hasta 31 días adelante (RN-004).
- El registro de una transacción es completable en ≤ 3 interacciones desde el dashboard (OBJ-01).

### RF-008 · Editar y eliminar transacción · M
- Al editar el monto de un gasto de 50 a 80 en una cuenta, entonces el saldo se recalcula correctamente.
- Al eliminar, entonces la transacción se marca como eliminada (eliminación lógica) y el saldo se revierte.
- Un usuario no puede editar ni eliminar transacciones de otro usuario (probado en `09-seguridad.md`).

### RF-009 · Listar, filtrar y buscar transacciones · M
- La lista se pagina (20 por página) y se ordena por fecha descendente.
- Se filtra por rango de fechas, cuenta, categoría y tipo; se busca por texto en la descripción.
- Los filtros activos son visibles y se pueden limpiar con un solo clic.
- Sin resultados, se muestra un estado vacío con una acción sugerida.

### RF-010 · Transferencia entre cuentas · S
- Cuando transfiere S/ 100 de la cuenta A a la B (ambas en PEN), entonces A baja 100, B sube 100 y ninguna cuenta cuenta como ingreso o gasto en los reportes.
- Si las cuentas tienen distinta moneda, debe indicar el monto recibido o el tipo de cambio.
- No se permite transferir desde y hacia la misma cuenta.

### RF-011 · Importar CSV · S
- Dado un CSV con columnas fecha, descripción, monto, cuando lo sube, entonces ve una vista previa con filas válidas e inválidas **antes** de confirmar.
- Las filas inválidas se reportan con número de fila y motivo; las válidas se importan.
- Una fila idéntica a una existente (misma fecha, monto, descripción, cuenta) se marca como posible duplicado y por defecto no se importa (RN-012).
- Límite de tamaño del archivo definido en `02-requerimientos-no-funcionales.md`.
- Si el lote supera la cuota de movimientos que le queda al usuario (RN-009), se rechaza con `QUOTA_EXCEEDED` e indica cuántas filas caben.

### RF-012 · Exportar CSV · S
- Cuando exporta, entonces obtiene un CSV con las transacciones filtradas actualmente, abrible en Excel con tildes y ñ correctas.

---

## Módulo CAT — Categorías

### RF-013 · Categorías predeterminadas y personalizadas · M
- Cada usuario nuevo recibe un conjunto base (Alimentación, Transporte, Vivienda, Salud, Educación, Ocio, Servicios, Sueldo, Otros ingresos, Otros).
- Puede crear, renombrar y archivar categorías propias.
- Una categoría con transacciones no se elimina; se archiva y sigue visible en el historial.

---

## Módulo GOAL — Metas de ahorro

### RF-014 · Gestión de metas · M
Campos: nombre, monto objetivo, fecha límite, monto ya ahorrado (opcional).
- La fecha límite debe ser futura; el monto objetivo, mayor a 0.
- Puede editar, pausar, completar o eliminar una meta.

### RF-015 · Aportes a una meta · M
- Cuando registra un aporte de S/ 300, entonces el ahorrado de la meta sube S/ 300.
- Puede registrar retiros de la meta; el ahorrado nunca queda negativo.
- Al llegar al monto objetivo, la meta pasa a "Completada" y se muestra la celebración breve definida en `07-diseno-ui-ux.md` (sección 8.1).

### RF-016 · Motor de proyección · M
Calcula la fecha estimada de cumplimiento según el ritmo de aportes (fórmula en RN-020).
- Ejemplo de referencia: meta S/ 6,000, ahorrado S/ 1,500, aporte promedio S/ 500/mes, fecha límite en 8 meses → faltan S/ 4,500; a ese ritmo se cumple en 9 meses; se necesitan S/ 562.50/mes para llegar a tiempo.
- Sin historial de aportes, la proyección indica "Aún no hay datos suficientes" en lugar de un número inventado.

### RF-017 · Alertas por color de meta · M
- Cada meta muestra un semáforo verde / ámbar / rojo según el resultado de la proyección (umbrales en RN-021).
- El color nunca es el único indicador: también hay icono y texto (accesibilidad).
- En el ejemplo de RF-016, la meta se muestra en estado de atraso.

---

## Módulo BUD — Presupuestos

### RF-018 · Presupuesto mensual por categoría · M
- Puede definir un límite mensual por categoría y ver gastado vs. límite con una barra de progreso.
- El gasto se calcula con las transacciones del mes calendario de esa categoría.

### RF-019 · Alertas de presupuesto · S
- Al superar el 80 % del límite, la barra pasa a ámbar; al superar el 100 %, a rojo y aparece el monto excedido.

---

## Módulo DASH — Dashboard

### RF-020 · Resumen del mes · M
- Muestra ingresos, gastos y balance del mes seleccionado, y el saldo total.
- Las transferencias entre cuentas no se cuentan como ingreso ni gasto.

### RF-021 · Gráficos · M
- Gráfico de gasto por categoría del mes y de tendencia de ingresos vs. gastos de los últimos 6 meses.
- Cada gráfico tiene estado de carga, de error y vacío, y una alternativa en tabla para accesibilidad.

### RF-022 · Comparación con el mes anterior · S
- Muestra la variación porcentual de gastos e ingresos contra el mes anterior; si el mes anterior es 0, muestra "—" y no un porcentaje infinito.

---

## Módulo CUR — Moneda

### RF-023 · Dos monedas con tipo de cambio manual · S
- El usuario define su tipo de cambio PEN/USD; los totales se convierten con ese valor.
- Cada transacción conserva su moneda original; el cambio de tipo de cambio no altera los registros históricos.

---

## Módulo REC — Recurrentes y suscripciones

### RF-030 · Gestión de transacciones recurrentes · S
Un ingreso o gasto que se repite: monto, cuenta, categoría, frecuencia (semanal, mensual, anual), día de cobro y fecha de fin opcional.
- Puede crear, editar, pausar y cancelar una recurrente.
- Un recurrente marcado como "suscripción" permite indicar el nombre del servicio.
- Al cancelar, el historial ya generado se conserva.

### RF-031 · Generación automática de las ocurrencias · S
- Cuando llega la fecha de cobro, entonces se crea la transacción correspondiente exactamente una vez (sin duplicados aunque el proceso se ejecute dos veces).
- Si el usuario no abrió la app durante varios ciclos, al volver se generan las ocurrencias pendientes con su fecha original (reglas en RN-030).
- Las transacciones generadas se distinguen visualmente de las manuales y se pueden editar o eliminar sin afectar la recurrente.

### RF-032 · Vista de suscripciones · S
- Muestra el total mensual comprometido, el equivalente mensual de las suscripciones anuales y los cobros de los próximos 30 días.
- Permite pausar o cancelar desde la misma vista.

---

## Módulo INS — Insights automáticos

### RF-033 · Panel de insights basados en reglas · S
- Muestra observaciones generadas por reglas deterministas (catálogo en RN-040 y siguientes), por ejemplo: gasto de una categoría muy por encima de su promedio, presupuesto con riesgo de agotarse antes de fin de mes, suscripciones que suman más que un umbral, meta que necesita un ajuste de aporte.
- Cada insight indica su gravedad, explica los datos que lo originaron y ofrece una acción directa (por ejemplo, "Ajustar presupuesto").
- No se muestra un insight si no hay datos suficientes para la regla (mínimo de historial en RN-040).
- Un mismo insight no se repite mientras siga vigente.

### RF-034 · Descartar o silenciar insights · S
- El usuario puede descartar un insight; no reaparece salvo que cambie su condición.

---

## Módulo GAM — Rachas y logros

### RF-035 · Racha de constancia · S
- Se cuenta cada día (zona America/Lima) en que el usuario registró al menos una transacción o marcó "Hoy no gasté".
- Si pasa un día sin ninguna de las dos cosas, la racha se reinicia; se conserva la mejor racha histórica.

### RF-036 · Logros · S
- Catálogo inicial (condiciones exactas en RN-050): primera transacción, primera meta creada, primera meta completada, racha de 7 y de 30 días, mes completo dentro del presupuesto, primera suscripción registrada, 100 transacciones.
- Cada logro se desbloquea una sola vez y guarda la fecha.
- Los logros premian constancia y cumplimiento, no el volumen artificial de movimientos.

### RF-037 · Visibilidad de progreso · S
- Perfil o sección con logros desbloqueados y bloqueados, y qué falta para el siguiente.
- Al desbloquear uno, se muestra la celebración «sello» definida en `07-diseno-ui-ux.md` (≈ 1.1 s, una a la vez, se cierra con un toque, sin sonido) y queda un aviso persistente en el perfil.
- Con `prefers-reduced-motion`, el sello aparece sin movimiento (RNF-037).
- Los logros se pueden ocultar desde preferencias para quien no los desee.

---

## Módulo I18N — Idioma

### RF-038 · Interfaz en español e inglés · M
- Selector de idioma visible en acceso y en preferencias; por defecto se usa el idioma del navegador (español si no es español ni inglés).
- La elección se recuerda entre sesiones y dispositivos (para cuentas reales).
- Ningún texto de interfaz está escrito directamente en el código: todos salen de archivos de traducción, y ambos idiomas tienen exactamente las mismas claves (verificado por prueba automática).
- Fechas, números y mensajes de validación respetan el idioma elegido; las categorías predeterminadas y los datos del demo también se muestran en ese idioma.

---

## Módulo RESP — Adaptación a dispositivos y experiencia

### RF-039 · Diseño responsivo mobile-first · M
- Se diseña primero para móvil y escala a tablet y escritorio (puntos de corte en `07-diseno-ui-ux.md`).
- No hay desplazamiento horizontal desde 320 px de ancho.
- Los elementos táctiles miden al menos 44 × 44 px; las tablas se transforman en tarjetas en móvil.
- Los formularios son usables con el teclado en pantalla (el campo activo nunca queda tapado).
- Los flujos críticos (registrar transacción, crear meta, ver dashboard, entrar al demo) se prueban en móvil, tablet y escritorio.

### RF-040 · Interacción y retroalimentación inmediata · S
- Las acciones se reflejan al instante en la interfaz; si el servidor falla, se revierte y se avisa.
- Tras eliminar algo, aparece un aviso con "Deshacer" durante 5 segundos.
- Los elementos interactivos tienen estados visibles (foco, presionado, deshabilitado) y transiciones sutiles que respetan la preferencia de movimiento reducido del sistema.
- Los gráficos son interactivos (detalle al tocar o pasar el cursor).

### RF-041 · Onboarding guiado · S
- Tras el primer acceso, un recorrido breve (máximo 4 pasos) explica dónde registrar, ver metas y revisar insights; se puede omitir y repetir desde ayuda.
- En cuentas reales nuevas, un asistente inicial propone crear la primera cuenta y la primera meta.

---

## Módulo UX — Experiencia general

### RF-024 · Perfil y preferencias · S
- Puede cambiar nombre, moneda base y formato de fecha.

### RF-025 · Navegación · M
- Barra lateral colapsable en escritorio y menú inferior o desplegable en móvil.
- Estado colapsado recordado entre sesiones.

### RF-026 · Estados de interfaz · M
- Toda pantalla con datos remotos tiene estado de carga, vacío y error con opción de reintentar.
- Los errores del servidor nunca muestran trazas técnicas al usuario.

### RF-027 · ~~Tema claro/oscuro~~ · **DESCARTADO**
- Decisión del autor: Zavia tiene **solo tema claro** (más simple y consistente en el demo; ver `07-diseno-ui-ux.md`). El ID no se reutiliza.

---

## Resumen de prioridades

| Prioridad | Cantidad | RF |
|-----------|----------|----|
| **Must** | 19 | 001, 002, 006, 007, 008, 009, 013, 014, 015, 016, 017, 018, 020, 021, 025, 026, 028, 038, 039 |
| **Should** | 18 | 005, 010, 011, 012, 019, 022, 023, 024, 030, 031, 032, 033, 034, 035, 036, 037, 040, 041 |
| **Could** | 1 | 029 |

Total: 38 requerimientos vigentes (RF-003, RF-004 y RF-027 fueron descartados o fusionados; sus IDs no se reutilizan).

> Orden de construcción propuesto: AUTH + modo demo → ACC → CAT → TRX → DASH → GOAL → BUD → I18N y RESP (transversales desde el inicio) → REC → INS → GAM → resto de *Should* → *Could*.
