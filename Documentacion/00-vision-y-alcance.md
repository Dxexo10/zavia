# 00 · Visión y Alcance — Zavia

> Estado: BORRADOR v0.5 · Los puntos marcados con **[DECISIÓN PENDIENTE]** deben resolverse antes de pasar al documento 05.

## 1. Propósito

Zavia (evolución de FinVantage) es una aplicación web de **finanzas personales** que permite a una persona registrar sus ingresos y gastos, organizarlos por cuentas y categorías, controlar presupuestos y **saber si va a llegar a sus metas de ahorro**, mediante un motor de proyección con alertas visuales. Además automatiza lo repetitivo (gastos recurrentes y suscripciones), explica sus datos con **insights automáticos basados en reglas** y fomenta el hábito con rachas y logros.

## 2. Problema que resuelve

Las personas que manejan su dinero en varias cuentas (efectivo, banco, billeteras digitales) y en dos monedas (PEN y USD) no tienen claridad de:

1. Cuánto gastan realmente por categoría.
2. Si su ritmo de ahorro actual les alcanza para llegar a una meta con fecha.
3. Cuándo se están pasando de un presupuesto, antes de que termine el mes.

## 3. Usuario objetivo

- **Principal:** joven profesional o estudiante en Perú que gestiona su dinero manualmente y quiere ordenarlo.
- **Secundario (audiencia del portafolio):** reclutadores y equipos técnicos de bancos y fintech que evaluarán calidad de código, seguridad, pruebas y criterio de producto. Llegan desde el repositorio de GitHub o el CV, tienen poco tiempo y muchos no se registrarían: por eso existe el **modo demo**.

## 4. Objetivos

| ID | Objetivo | Medida de éxito |
|----|----------|-----------------|
| OBJ-01 | Registrar una transacción rápidamente | ≤ 3 interacciones desde el dashboard |
| OBJ-02 | Mostrar el estado de una meta de ahorro con proyección fiable | Proyección coincide con los ejemplos de `03-reglas-de-negocio.md` (100 % de casos de prueba) |
| OBJ-03 | Producto demostrable y desplegado | URL pública funcionando + repositorio documentado |
| OBJ-04 | Calidad verificable | Cobertura ≥ 80 % en lógica de negocio, pruebas E2E de los flujos críticos en CI |
| OBJ-05 | Seguridad demostrable | Checklist de `09-seguridad.md` completo antes de producción |
| OBJ-06 | Un reclutador ve valor sin registrarse | Del enlace al dashboard con datos en ≤ 10 segundos y ≤ 2 acciones (nombre y apellido + un clic) |
| OBJ-07 | Uso cómodo en cualquier dispositivo | Sin desplazamiento horizontal desde 320 px; flujos críticos probados en móvil, tablet y escritorio |
| OBJ-08 | **Costo cero** | Ningún servicio con pago ni tarjeta; el proyecto sigue funcionando dentro de los límites gratuitos de cada plan (RNF-070 a 073) |

## 5. Alcance del MVP (incluido)

- Acceso: **Google** para cuentas reales (sin contraseñas ni correos propios) y **modo demo** sin registro.
- **Modo demo:** acceso sin registro ingresando solo nombre y apellido, con datos de ejemplo ya cargados.
- Cuentas (efectivo, banco, tarjeta, billetera digital).
- Transacciones: ingresos, gastos y transferencias entre cuentas.
- Categorías predeterminadas y personalizadas.
- Metas de ahorro con aportes, proyección y alertas por color.
- Presupuestos mensuales por categoría con alertas de consumo.
- Dashboard con resumen mensual y gráficos.
- Importación y exportación CSV.
- Soporte de dos monedas (PEN y USD) con tipo de cambio manual.
- Gastos recurrentes y suscripciones (generación automática y vista de suscripciones).
- Insights automáticos basados en reglas (sin IA).
- Rachas y logros (gamificación).
- Interfaz bilingüe español/inglés con selector de idioma.
- Diseño responsivo mobile-first (móvil, tablet y escritorio), con onboarding guiado e interacciones con retroalimentación inmediata.

## 6. Fuera de alcance (explícito)

| Excluido | Motivo |
|----------|--------|
| Conexión automática con bancos o billeteras | No existe un estándar de Open Banking disponible para un proyecto personal en Perú; requeriría acuerdos con entidades |
| Pagos, transferencias reales o manejo de dinero real | Implicaría regulación (SBS) y riesgo que no corresponde a un portafolio |
| Inversiones (acciones, fondos, cripto) | Dominio distinto, ampliaría demasiado el alcance |
| App móvil nativa | Se entrega web responsiva |
| Registro con correo y contraseña | Descartado: exige correo saliente (y dominio propio) y suma superficie de ataque; incompatible con el costo cero. El demo cubre a quien no use Google |
| Multiusuario compartido (finanzas de pareja/familia) | Complica el modelo de permisos; candidato a versión 2 |
| IA generativa / asistente conversacional | Candidato a versión 2. Los insights del MVP se basan en reglas deterministas y explicables |

## 7. Supuestos y restricciones

- Proyecto individual, desarrollado por un agente de código a partir de esta documentación; el autor revisa y aprueba por fases.
- **Costo cero (restricción del autor):** todo el proyecto debe costar US$ 0 y **no pedir tarjeta de crédito**: sin dominio propio (se usa el subdominio gratuito del hosting), solo planes gratuitos permanentes y herramientas gratuitas o de código abierto. Si un límite gratuito se acerca, el sistema **degrada con elegancia** (frenos automáticos, RNF-071) en lugar de generar cobros.
- Los datos son ingresados manualmente por el usuario; no hay fuentes externas salvo el CSV.
- Idiomas de la interfaz: español (Perú, por defecto) e inglés, con selector. Moneda por defecto: PEN (S/). Zona horaria de referencia para fechas y rachas: America/Lima.
- **Stack decidido:** Next.js full-stack + TypeScript + Tailwind, con Supabase (PostgreSQL, autenticación y Row Level Security). Se detalla en `05-arquitectura-y-stack.md`.
- **Modo demo decidido:** los datos de ejemplo viven en el servidor, en una sesión anónima con datos aislados por visitante; caducan y se limpian automáticamente (RNF-027 a RNF-032).

## 8. Glosario

| Término | Definición |
|---------|------------|
| Cuenta | Lugar donde está el dinero (efectivo, banco, tarjeta, billetera). Tiene una moneda fija |
| Transacción | Movimiento de dinero: ingreso, gasto o transferencia |
| Categoría | Clasificación de una transacción (Alimentación, Transporte, Sueldo…) |
| Meta de ahorro | Monto objetivo con fecha límite |
| Aporte | Dinero asignado a una meta |
| Proyección | Fecha estimada de cumplimiento de una meta según el ritmo de aportes |
| Presupuesto | Límite de gasto mensual para una categoría |
| Semáforo | Estado visual de una meta: verde (en camino), ámbar (en riesgo), rojo (retrasada) |
| Modo demo | Acceso sin registro con nombre y apellido; usa una sesión temporal con datos de ejemplo |
| Recurrente | Transacción que se repite con una frecuencia (semanal, mensual, anual) |
| Suscripción | Gasto recurrente de un servicio (streaming, gimnasio, software…) |
| Insight | Observación automática derivada de reglas sobre los datos del usuario |
| Racha | Días consecutivos en que el usuario mantuvo su registro al día |
| Logro | Insignia que se desbloquea al cumplir una condición |

## 9. Riesgos principales

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Alcance excesivo para un solo desarrollador | Proyecto que no se termina | Prioridades MoSCoW en el documento 01; construir primero los *Must* |
| Reglas de negocio ambiguas | El agente inventa comportamiento | Fórmulas y ejemplos numéricos en el documento 03 |
| Errores de redondeo con dinero | Saldos incorrectos | Montos en enteros (céntimos) o decimal exacto; regla en documentos 02 y 03 |
| Fuga de datos entre usuarios | Fallo de seguridad grave | Row Level Security y pruebas de aislamiento (documentos 09 y 10) |
| Abuso del modo demo (acceso público) | Costos, saturación, contenido ofensivo o inyección vía el nombre | Sanitización del nombre, aislamiento por sesión, límite de frecuencia, caducidad y limpieza de sesiones demo (documento 09) |
| Gamificación que incentiva datos falsos | Métricas sin sentido | Los logros premian constancia y cumplimiento, no volumen de registros (documento 03) |
| Superar límites de planes gratuitos (almacenamiento, funciones, usuarios activos) | La demo deja de funcionar o aparecen cobros | Costo cero verificable (RNF-070), freno automático por tamaño de la base (RNF-071), degradación elegante (RNF-072), cuotas por usuario (RN-009) |
