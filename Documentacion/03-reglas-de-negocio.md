# 03 · Reglas de Negocio — Zavia

> Estado: BORRADOR v0.5 · Este documento es la **fuente de verdad** de todo cálculo. Si el código y este documento difieren, gana este documento y se corrige el código.
> Sin decisiones pendientes en esta versión.

## Convenciones

- **ID:** `RN-###`. Cada regla tiene ejemplos numéricos que se convierten en pruebas unitarias (ver `10-pruebas-automatizadas.md`).
- **Mes comercial = 30 días.** Se usa en todo cálculo de ritmo y proyección para que los resultados sean deterministas.
- **Hoy** se calcula en la zona horaria `America/Lima`. El reloj es siempre inyectable (RNF-057).
- **Redondeo:** *half-up* a 2 decimales, aplicado solo en el resultado final de cada cálculo (nunca en pasos intermedios), salvo indicación contraria.
- Todos los umbrales numéricos viven en **un único archivo de constantes** (`config/business-constants`), con una prueba por cada constante.

---

## 1. Dinero, saldos y transacciones

### RN-001 · Representación del dinero
Los montos se guardan como **enteros en la unidad menor** (céntimos) junto con su moneda (`PEN` o `USD`). Está prohibido usar `float` en cálculos monetarios (RNF-013).

### RN-002 · Saldo de una cuenta
```
saldo_actual = saldo_inicial
             + Σ ingresos
             − Σ gastos
             + Σ transferencias_entrantes
             − Σ transferencias_salientes
```
Solo cuentan movimientos con `fecha ≤ hoy` y que no estén eliminados. El **saldo proyectado** incluye además los movimientos con fecha futura (hasta RN-004).

*Ejemplo:* saldo inicial S/ 500; gasto S/ 50 hoy; ingreso S/ 200 hoy; gasto S/ 30 dentro de 10 días → saldo actual S/ 650; saldo proyectado S/ 620.

### RN-003 · Redondeo
*Half-up* a 2 decimales. *Ejemplos:* 2.345 → 2.35; 2.344 → 2.34; 0.005 → 0.01.

### RN-004 · Fechas permitidas
- Una transacción puede tener fecha de hasta **31 días en el futuro** y no más de **10 años en el pasado**.
- Fuera de ese rango se rechaza con mensaje claro.

### RN-005 · Límites de campos
- Monto: > 0 y ≤ 999,999,999.99.
- Descripción: máximo 140 caracteres, texto plano (se escapa siempre al mostrar).
- Nombre de cuenta, categoría y meta: 1 a 40 caracteres.

### RN-006 · Eliminación lógica
Eliminar marca `deleted_at`; el registro deja de contar en saldos, reportes, presupuestos e insights. Se purga definitivamente a los 30 días (RNF-016). "Deshacer" (RF-040) restaura el registro.

### RN-007 · Transferencias
- Una transferencia se guarda como **un único registro** con monto de salida, monto de entrada, cuenta de origen y cuenta de destino (así no pueden quedar a medias).
- Misma moneda: el monto de entrada es igual al de salida.
- Distinta moneda: el usuario indica el monto recibido; el tipo de cambio implícito se deriva de ambos montos.
- **Nunca** cuenta como ingreso ni gasto en dashboard, presupuestos, insights o logros.
- Origen y destino deben ser cuentas distintas y no archivadas.

### RN-008 · Pertenencia
Cada registro pertenece a **exactamente un usuario**. Ninguna operación puede referenciar entidades de otro usuario (cuenta, categoría, meta). Se refuerza con RLS (`09-seguridad.md`).

### RN-009 · Cuotas por usuario (costo cero)
Los planes gratuitos tienen almacenamiento limitado, por lo que cada usuario tiene un tope de filas (valores iniciales en `config/business-constants.ts`, ajustables):

| Recurso | Usuario real | Sesión demo |
|---------|--------------|-------------|
| Movimientos (transacciones + transferencias no eliminadas) | 5,000 | 1,000 |
| Cuentas | 100 | 100 |
| Metas | 200 | 200 |
| Recurrentes | 50 | 50 |

- Al superar una cuota, la creación se rechaza con `QUOTA_EXCEEDED` y un mensaje que invita a eliminar o archivar lo que ya no use.
- Una importación CSV que no cabe en la cuota restante se rechaza completa e indica cuántas filas caben (RN-014).
- La generación automática de recurrentes se detiene al llegar a la cuota y el usuario ve un aviso (no se pierde ninguna ocurrencia pendiente: se genera al liberar espacio).
- **Freno por tamaño de la base:** si la base supera el 70 % del límite gratuito (RNF-071), no se crean demos ni cuentas nuevas hasta que baje.

---

## 2. Cuentas y categorías

### RN-010 · Ciclo de vida de una cuenta
- Una cuenta **sin transacciones** se puede eliminar.
- Una cuenta **con transacciones** solo se **archiva**, y únicamente si su saldo actual es 0; si no, se pide transferir el saldo primero.
- La moneda no se puede cambiar si la cuenta tiene transacciones.
- Las cuentas archivadas no aparecen en selectores ni en el saldo total, pero su historial se conserva.

### RN-011 · Saldo negativo
Un gasto que deja una cuenta en negativo **se permite** con una advertencia (el usuario puede estar registrando con retraso). En cuentas tipo tarjeta, el saldo negativo es normal y representa deuda.

### RN-012 · Detección de duplicados en importación
Dos filas son duplicadas si coinciden en: **misma cuenta + misma fecha + mismo monto (con signo) + misma descripción normalizada** (sin espacios en los extremos, minúsculas, espacios múltiples colapsados). Por defecto no se importan; el usuario puede forzarlas desde la vista previa.

### RN-013 · Categorías
- Cada categoría tiene **tipo** (ingreso o gasto); una transacción solo admite categorías de su mismo tipo.
- Nombre único por usuario y tipo, sin distinguir mayúsculas.
- Las predeterminadas no se pueden eliminar; sí renombrar o archivar. Mientras no se renombren, se muestran en el idioma activo (RN-071).
- Archivar una categoría con presupuesto vigente archiva también ese presupuesto.

### RN-014 · Formato de importación CSV
- **Archivo:** UTF-8, separador coma o punto y coma, primera fila con encabezados; máximo 2 MB y 5,000 filas (RNF-026).
- **Columnas obligatorias** (encabezado en español o en inglés): `fecha`/`date`, `descripcion`/`description`, `monto`/`amount`.
- **Fecha:** `AAAA-MM-DD` o `DD/MM/AAAA` (nunca `MM/DD`). Debe cumplir RN-004; si no, la fila es inválida.
- **Monto:** punto como separador decimal, hasta 2 decimales, sin símbolo de moneda; se acepta coma como separador de miles solo si el decimal es punto (`1,234.50`). Formatos ambiguos (`1.234,50`) se rechazan con un motivo claro. `0` es inválido.
- **Signo:** positivo = ingreso; negativo = gasto.
- **Moneda:** la de la cuenta elegida para la importación (no hay columna de moneda).
- **Categoría:** `other_income` u `other_expense` según el signo; el usuario las cambia después.
- Las filas importadas llevan `source = 'import'` y no cuentan para rachas ni logros (RN-052).
- Cada fila se marca `válida`, `inválida` (con motivo) o `posible duplicado` (RN-012); una fila inválida nunca bloquea a las válidas.

---

## 3. Metas de ahorro

### RN-020 · Motor de proyección

Definiciones (todas en la moneda de la meta):

```
falta                = max(0, objetivo − ahorrado)
ventana_días         = max(30, min(90, días desde el primer aporte))
ritmo_mensual        = (aportes_netos en los últimos ventana_días) × 30 / ventana_días
                       donde aportes_netos = aportes − retiros
días_para_completar  = ceil( falta × 30 / ritmo_mensual )            (si ritmo_mensual > 0)
fecha_proyectada     = hoy + días_para_completar
días_restantes       = fecha_límite − hoy                            (en días)
aporte_necesario     = falta × 30 / días_restantes                   (por mes comercial)
razón                = ritmo_mensual / aporte_necesario
```

Casos especiales:
| Situación | Resultado |
|-----------|-----------|
| `falta = 0` | Meta **completada** (RN-024) |
| La meta nunca tuvo un aporte | **"Sin datos suficientes"** (estado neutro gris, sin proyección) |
| Tuvo aportes pero `ritmo_mensual ≤ 0` en la ventana | **"Sin avance"**, estado rojo, sin fecha proyectada |
| `días_restantes ≤ 0` y `falta > 0` | **Vencida**, estado rojo |
| Meta pausada | Sin proyección ni alertas (RN-024) |

**Ejemplo de referencia** (el mismo de RF-016): objetivo S/ 6,000; ahorrado S/ 1,500; aportes netos de los últimos 90 días S/ 1,500 (primer aporte hace ≥ 90 días); fecha límite en 240 días (8 meses comerciales).
- `falta = 4,500`
- `ritmo_mensual = 1,500 × 30 / 90 = 500.00`
- `días_para_completar = ceil(4,500 × 30 / 500) = 270` (9 meses)
- `aporte_necesario = 4,500 × 30 / 240 = 562.50`
- `razón = 500 / 562.50 = 0.8889` → **rojo** (RN-021)
- Retraso estimado: 270 − 240 = 30 días.

### RN-021 · Semáforo de una meta
```
razón ≥ 1.00          → VERDE   (en camino: fecha proyectada ≤ fecha límite)
0.90 ≤ razón < 1.00   → ÁMBAR   (en riesgo)
razón < 0.90          → ROJO    (retrasada)
```
Cada estado se muestra con **color + icono + texto** (RNF-036).

**Tabla de casos de prueba** (falta = 4,500; días_restantes = 240; aporte_necesario = 562.50):

| ritmo_mensual | razón | días_para_completar | Estado |
|---------------|-------|---------------------|--------|
| 600.00 | 1.0667 | 225 | VERDE |
| 562.50 | 1.0000 | 240 | VERDE |
| 562.00 | 0.9991 | 241 | ÁMBAR |
| 520.00 | 0.9244 | 260 | ÁMBAR |
| 506.25 | 0.9000 | 267 | ÁMBAR |
| 500.00 | 0.8889 | 270 | ROJO |
| 300.00 | 0.5333 | 450 | ROJO |

### RN-022 · Aportes y retiros
- Aporte: monto > 0, fecha no futura. Retiro: monto > 0 y no puede dejar `ahorrado` por debajo de 0.
- Se registran en la **moneda de la meta**.
- **Decidido:** en el MVP los aportes y retiros son **independientes de las cuentas** (una "reserva virtual" que no modifica ningún saldo de cuenta). Vincularlos a una cuenta queda para una versión posterior.

### RN-023 · Moneda de la meta
Cada meta es en `PEN` o `USD` y no cambia si ya tiene aportes.

### RN-024 · Estados de una meta
| Estado | Condición | Efecto |
|--------|-----------|--------|
| Activa | Por defecto | Proyección y semáforo |
| Pausada | El usuario la pausa | Sin proyección ni alertas; conserva fecha límite |
| Completada | `ahorrado ≥ objetivo` | Se muestra con estado propio (no semáforo); fecha de cumplimiento guardada |
| Vencida | Derivado: `días_restantes ≤ 0` y no completada | Rojo |

Al completarse, `ahorrado` puede exceder el objetivo; el excedente se muestra pero no cambia el estado.

---

## 4. Presupuestos

### RN-025 · Definición y periodo
- Un presupuesto es un **límite mensual** para una categoría de gasto, en la moneda base del usuario.
- Rige desde el mes en que se crea o modifica hacia adelante; los meses pasados conservan su límite histórico.
- Hay máximo **un presupuesto por categoría**.
- `gastado` = Σ gastos no eliminados de esa categoría con fecha dentro del mes calendario (`America/Lima`), convertidos a la moneda base (RN-027). No incluye transferencias.

### RN-026 · Umbrales
```
uso = gastado / límite
uso ≤ 0.80          → NORMAL  (verde)
0.80 < uso ≤ 1.00   → ÁMBAR   (cerca del límite)
uso > 1.00          → ROJO    (excedido; se muestra monto excedido = gastado − límite)
```
*Ejemplo:* límite S/ 500 → S/ 400.00 = normal; S/ 400.01 = ámbar; S/ 500.00 = ámbar; S/ 500.01 = rojo (excedido S/ 0.01).

---

## 5. Monedas

### RN-027 · Moneda base y tipo de cambio
- Cada usuario tiene una **moneda base** (por defecto `PEN`) y un **tipo de cambio manual** (soles por 1 dólar).
- El tipo de cambio debe ser > 0; si el nuevo valor difiere más de 20 % del anterior, se pide confirmación (evita errores de tipeo).
- Cada transacción conserva su monto y moneda originales. Los **totales** se expresan en moneda base aplicando el tipo de cambio **vigente** al calcularlos: `monto_base = round_half_up(monto_original × tipo_cambio)`.
- Cambiar el tipo de cambio no altera ningún registro, solo los totales mostrados.

*Ejemplo:* tipo de cambio 3.75; gasto US$ 20.00 → S/ 75.00; US$ 19.99 → S/ 74.9625 → S/ 74.96.

---

## 6. Recurrentes y suscripciones

### RN-030 · Generación de ocurrencias
- Cada recurrente tiene **frecuencia** (semanal, mensual, anual), **fecha de inicio**, **fecha de fin** opcional y **próxima fecha**.
- Se generan las ocurrencias con `fecha ≤ hoy`; **nunca** se generan fechas futuras.
- **Idempotencia:** clave única `(recurrente_id, fecha_de_ocurrencia)`; reejecutar no duplica (RNF-010).
- **Meses cortos:** si el día configurado no existe en el mes (por ejemplo, 31 en abril), se usa el **último día** del mes, sin cambiar el día original para los meses siguientes.
- **Recuperación:** si el usuario estuvo ausente, al volver se generan las ocurrencias pendientes con su **fecha original**, hasta un máximo de **24 por recurrente y por ejecución**.
- **Pausa:** no genera; al reanudar no se crean ocurrencias retroactivas y la próxima fecha se recalcula desde hoy.
- **Cancelar** o superar la fecha de fin: no se generan más; el historial se conserva.
- Las ocurrencias generadas se marcan como *automáticas*.

*Ejemplo:* recurrente mensual el día 31 desde enero → 31 ene, 28 feb (o 29), 31 mar, 30 abr.

### RN-031 · Equivalente mensual de suscripciones
```
mensual  → monto
anual    → monto / 12
semanal  → monto × 52 / 12
```
- **Total mensual comprometido** = Σ equivalentes mensuales de las recurrentes de gasto activas marcadas como suscripción, en moneda base.
- **Próximos 30 días** = ocurrencias esperadas en `(hoy, hoy + 30 días]`.

*Ejemplo:* S/ 45 mensual + S/ 240 anual + S/ 10 semanal → 45 + 20 + 43.33 = S/ 108.33.

---

## 7. Insights automáticos (reglas deterministas, sin IA)

### RN-040 · Reglas generales
- Cada insight tiene: identificador de regla, **gravedad** (`info`, `atención`, `alerta`), datos que lo originan, acción sugerida y **clave de deduplicación** (`regla + entidad + periodo`).
- Reglas comparativas requieren **≥ 2 meses calendario completos de historial**; si no, no se muestran.
- No se repite un insight vigente con la misma clave.
- Un insight **descartado** (RF-034) se suprime hasta el fin de su periodo y solo reaparece si su gravedad sube.
- Todos los umbrales están en el archivo de constantes y son ajustables.
- Los montos "absolutos" mínimos se expresan en moneda base.

### RN-041 · Categoría por encima de su promedio
- `promedio` = gasto mensual promedio de la categoría en los 3 meses completos previos.
- Si `gasto_mes_actual ≥ 1.25 × promedio` y la diferencia ≥ S/ 50 → **atención**.
- Si `gasto_mes_actual ≥ 1.50 × promedio` y la diferencia ≥ S/ 100 → **alerta**.
- *Ejemplo:* promedio S/ 200; gasto actual S/ 260 → atención (130 %, diferencia 60); S/ 310 → alerta (155 %, diferencia 110).

### RN-042 · Presupuesto en riesgo de agotarse
- Se evalúa con ≥ 7 días transcurridos del mes.
- `proyección_fin_de_mes = gastado / días_transcurridos × días_del_mes`.
- Si `proyección_fin_de_mes > límite` y `uso ≤ 1.00` → **atención** ("al ritmo actual superarás tu presupuesto alrededor del día X").
- *Ejemplo:* día 10 de un mes de 30 días, gastado S/ 200, límite S/ 500 → proyección S/ 600 > 500 → atención.

### RN-043 · Suscripciones pesadas
- Si el total mensual comprometido (RN-031) > **15 %** del ingreso mensual promedio de los 3 meses previos → **atención**.

### RN-044 · Meta que necesita ajuste
- Meta en ÁMBAR → **atención**; en ROJO → **alerta**.
- Muestra el **ajuste de aporte** = `aporte_necesario − ritmo_mensual`.
- *Ejemplo (RN-020):* 562.50 − 500.00 = **S/ 62.50 más por mes**.

### RN-045 · Gastos hormiga
- Si en el mes hay **≥ 15 gastos de ≤ S/ 20** cada uno y su suma es **≥ 10 %** del gasto total del mes → **info**, indicando la suma y la categoría más frecuente.

### RN-046 · Buen mes de ahorro
- Al cierre de un mes: `tasa_de_ahorro = (ingresos − gastos) / ingresos`, con ingresos > 0 y sin contar transferencias.
- Si `tasa_de_ahorro ≥ 20 %` → **info positiva** ("Ahorraste 23 % de tus ingresos el mes pasado").

---

## 8. Rachas y logros

### RN-051 · Racha de constancia
- Un día (zona `America/Lima`) **cuenta** si el usuario, ese día, **registró al menos una transacción manual** o marcó **"Hoy no gasté"** (máximo una marca por día).
- Se usa la **fecha de registro**, no la fecha de la transacción, para que no se pueda fabricar racha con movimientos retroactivos.
- Racha actual = días consecutivos que cuentan. Está **vigente** si el último día que cuenta es hoy o ayer; si ayer no contó y hoy aún no, la racha se rompe a las 00:00 del día siguiente.
- Se conserva la **mejor racha** histórica.

### RN-050 · Catálogo de logros
| Clave | Condición |
|-------|-----------|
| `first_transaction` | Primera transacción manual |
| `first_goal_created` | Primera meta creada |
| `first_goal_completed` | Primera meta completada |
| `streak_7` | Racha de 7 días |
| `streak_30` | Racha de 30 días |
| `month_within_budget` | Un mes calendario cerrado con **≥ 2 presupuestos** y todos con `uso ≤ 1.00` |
| `first_subscription` | Primera suscripción registrada |
| `tx_100` | 100 transacciones manuales en **≥ 20 días distintos** |

Cada logro se desbloquea **una sola vez**, guarda su fecha y **no se pierde**.

### RN-052 · Anti-manipulación
No cuentan para rachas ni para logros de volumen: transacciones **importadas por CSV**, **generadas por recurrentes**, **transferencias** ni los **datos sembrados del demo**. Los logros del demo se siembran como desbloqueados explícitamente (RN-061).

---

## 9. Modo demo

### RN-060 · Nombre y apellido
- Cada campo: 2 a 40 caracteres tras recortar espacios; se colapsan espacios múltiples y se normaliza a Unicode NFC.
- Permitidos: letras de cualquier alfabeto (con tildes y ñ), espacios, guion y apóstrofe.
- Rechazados: dígitos, `< > & " \` y cualquier otro símbolo.
- El nombre se guarda tal cual y **siempre se escapa** al mostrarlo; nunca se usa como HTML.

*Ejemplos válidos:* "María José", "O'Brien", "De la Cruz". *Inválidos:* "J", "Juan<script>", "1234".

### RN-061 · Datos semilla del demo
Se generan con **fechas relativas a hoy** (siempre "frescos") y mediante las mismas funciones del dominio, para que los estados sean reproducibles y verificables (RNF-032):

| Elemento | Contenido |
|----------|-----------|
| Cuentas | 4: Efectivo (PEN), Cuenta sueldo (PEN), Tarjeta de crédito (PEN), Ahorros (USD) |
| Transacciones | ≈ 150 en los últimos 100 días, con ingreso mensual de sueldo y gastos variados por categoría |
| Meta VERDE | Objetivo 6,000; ahorrado 3,600; límite en 150 días; aportes netos de 90 días = 1,800 (ritmo 600) → falta 2,400; necesario 480; razón 1.25 |
| Meta ÁMBAR | Objetivo 4,000; ahorrado 2,000; límite en 120 días; aportes netos de 90 días = 1,380 (ritmo 460) → necesario 500; razón 0.92 |
| Meta ROJA | Objetivo 3,000; ahorrado 1,200; límite en 90 días; aportes netos de 90 días = 1,200 (ritmo 400) → falta 1,800; necesario 600; razón 0.67 |
| Presupuestos | Uno NORMAL (≈ 70 %), uno ÁMBAR (≈ 92 %) y uno ROJO (≈ 118 %) |
| Recurrentes | 4, de las cuales 3 son suscripciones (mensual, anual y semanal) |
| Insights | Al menos 3 de reglas distintas activos |
| Racha y logros | Racha actual de 12 días; logros desbloqueados: `first_transaction`, `first_goal_created`, `first_subscription`, `streak_7` |

(En las metas, el primer aporte debe tener ≥ 90 días de antigüedad para que `ventana_días = 90`.)

### RN-062 · Ciclo de vida y límites
- La sesión demo caduca a las **24 h**; sus datos se eliminan automáticamente (RNF-027).
- Límites de creación: RNF-028. Verificación anti-bot: RNF-029.
- El demo muestra siempre el aviso de RNF-031.

### RN-063 · Acciones restringidas en demo
No permitidas: eliminar la cuenta real y cualquier acción que envíe correos (Zavia no envía correos). Permitido: convertir el demo en cuenta real con Google (RF-029). Todo lo demás es plenamente funcional.

---

## 10. Idioma y fechas

### RN-070 · Zona horaria
Los instantes se guardan en UTC; el **día** de una transacción, los meses calendario, las rachas y los cortes de presupuesto se calculan en `America/Lima`.

### RN-071 · Textos predeterminados por clave
Las categorías predeterminadas y los textos del demo se guardan con **clave** y se traducen al mostrarse; si el usuario renombra una categoría, su nombre se conserva tal cual en cualquier idioma.

---

## Mapa de trazabilidad (RF ↔ RN)

| RF | Reglas |
|----|--------|
| RF-006 | RN-001, 002, 010, 011 |
| RF-007, 008 | RN-002, 004, 005, 006, 009 |
| RF-010 | RN-007 |
| RF-011 | RN-012, RN-014 |
| RF-013 | RN-013 |
| RF-014 a 017 | RN-020 a 024 |
| RF-018, 019 | RN-025, 026 |
| RF-020 | RN-002, 007 |
| RF-023 | RN-027 |
| RF-030 a 032 | RN-030, 031 |
| RF-033, 034 | RN-040 a 046 |
| RF-035 a 037 | RN-050 a 052 |
| RF-028, 029 | RN-060 a 063 |
| RF-038 | RN-070, 071 |
