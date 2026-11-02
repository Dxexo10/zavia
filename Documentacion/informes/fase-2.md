# Informe de la fase 2 — Dominio puro

## 1. Qué se construyó

| Tarea | Resultado | Commit |
| --- | --- | --- |
| F2-T01 a F2-T13 | Dominio puro: dinero, fechas, saldos, cuentas, metas, presupuestos, recurrentes, insights, rachas, CSV, demo y esquemas | `91beb91` a `35fc21c` |
| Correcciones de cobertura | Casos de negocio y cobertura de dominio reforzados | `59317dc` |
| Mutación compensatoria | Control manual reproducible; deuda de Stryker para F13-T04 | `7053ccf` |
| RN-007 | Tasa implícita racional de transferencias entre monedas | `1dea9a7` |
| RN-030 | Reanudación sin ocurrencias retroactivas | `35127a0` |
| RN-040 | Dedupe de insights, descartados y aumento de gravedad | `8e10860` |
| RN-050 a RN-052 | Logros completos y racha por fecha de registro | `eb41fe6` |
| RN-012 y RN-014 | Lote CSV: válida, inválida con motivo y posible duplicado | `7112510` |

## 2. Evidencia de la puerta

```text
pnpm test                    24 archivos; 167 pruebas en verde; 1 todo autorizado de F4-T04
pnpm test:coverage           23 archivos; 166 pruebas en verde; 1 todo autorizado
                              dinero, metas, presupuestos, recurrencias e insights: 100 %
pnpm test:integration        1 archivo; 1 prueba en verde
pnpm test:mutation-control   14 mutantes manuales eliminados
pnpm lint                    correcto
pnpm typecheck               correcto
pnpm check:layers            0 violaciones
pnpm detect:design           correcto (sin interfaz renderizada todavía)
pnpm format:check            correcto
pnpm build                   compilación de producción correcta
pnpm audit --prod            sin vulnerabilidades conocidas
gitleaks git                 38 commits escaneados; sin secretos
```

La matriz de trazabilidad se regenera en la puerta y F2 queda cubierta: RN 34/34, RNF 5/5 y SEG 1/1.

## 3. IDs cubiertos

F2 cubre RN-001, RN-002, RN-003, RN-004, RN-005, RN-007, RN-010 a RN-014, RN-020 a RN-027, RN-030, RN-031, RN-040 a RN-046, RN-050 a RN-052, RN-060, RN-061 y RN-070; RNF-013, RNF-014, RNF-032, RNF-050 y RNF-051; y SEG-INP-03. La matriz generada conserva la evidencia por título de prueba.

### Matriz completa del documento 10 §5

| Caso del §5 | Archivo de prueba | Línea |
| --- | --- | ---: |
| 5.1 half-up: 2.345, 2.344 y 0.005 | `tests/unit/domain/money.test.ts` | 18 |
| 5.1 conversión 3.75: US$20.00 y US$19.99 | `tests/unit/domain/money.test.ts` | 45 |
| 5.1 suma en céntimos | `tests/unit/domain/money.test.ts` | 31 |
| 5.1 monedas distintas | `tests/unit/domain/money.test.ts` | 37 |
| 5.1 cambio de tipo >20 % | `tests/unit/domain/money.test.ts` | 66 |
| 5.1 propiedad de conversión monótona | `tests/unit/domain/money.test.ts` | 78 |
| 5.2 saldo 500 − 50 + 200 − 30 futuro = 650/620 | `tests/unit/domain/balances.test.ts` | 22 |
| 5.2 movimiento eliminado | `tests/unit/domain/balances.test.ts` | 35 |
| 5.2 transferencia misma moneda, neto cero | `tests/unit/domain/balances.test.ts` | 85 |
| 5.2 transferencia distinta moneda y tasa implícita | `tests/unit/domain/balances.test.ts` | 73 |
| 5.2 propiedad de recálculo desde cero | `tests/unit/domain/balances.test.ts` | 51 |
| 5.3 +31/+32 días | `tests/unit/domain/dates.test.ts` | 12 |
| 5.3 −10 años/−10 años y un día | `tests/unit/domain/dates.test.ts` | 19 |
| 5.3 04:59/05:00 UTC en Lima | `tests/unit/domain/dates.test.ts` | 32 |
| 5.3 bisiesto, fin de mes y cambio de año | `tests/unit/domain/dates.test.ts` | 37 |
| 5.4 siete ritmos, razones, días y semáforos | `tests/unit/domain/goals.test.ts` | 28 |
| 5.4 ejemplo 4,500/500/240 | `tests/unit/domain/goals.test.ts` | 15 |
| 5.4 ventanas de 30 y 90 días | `tests/unit/domain/goals.test.ts` | 65 |
| 5.4 completada, sin aportes, no progreso, vencida y pausada | `tests/unit/domain/goals.test.ts` | 45 |
| 5.4 retiro mayor al ahorrado y retraso | `tests/unit/domain/goals.test.ts` | 80 |
| 5.4 semilla demo 1.25/0.92/0.667 | `tests/unit/domain/demo-data.test.ts` | 5 |
| 5.4 propiedad: mayor ritmo nunca proyecta después | `tests/unit/domain/goals.test.ts` | 90 |
| 5.4 propiedad: razón ≥1 si y solo si llega a tiempo | `tests/unit/domain/goals.test.ts` | 111 |
| 5.5 400.00, 400.01, 500.00 y 500.01 | `tests/unit/domain/budgets.test.ts` | 39 |
| 5.5 límite histórico | `tests/unit/domain/budgets.test.ts` | 6 |
| 5.5 transferencias y eliminados no cuentan | `tests/unit/domain/budgets.test.ts` | 17 |
| 5.6 día 31, mes corto y bisiesto | `tests/unit/domain/recurring.test.ts` | 6 |
| 5.6 idempotencia, recuperación y límite 24 | `tests/unit/domain/recurring.test.ts` | 16 |
| 5.6 pausa, reanudación, cancelación y fecha de fin | `tests/unit/domain/recurring.test.ts` | 26 |
| 5.6 equivalente mensual 45 + 20 + 43.33 | `tests/unit/domain/recurring.test.ts` | 88 |
| 5.7 RN-041: 249, 260 y 310 sobre promedio 200 | `tests/unit/domain/insights.test.ts` | 62 |
| 5.7 RN-042: días 6/10 y riesgo de presupuesto | `tests/unit/domain/insights.test.ts` | 99 |
| 5.7 RN-043: 15 % y valor superior | `tests/unit/domain/insights.test.ts` | 80 |
| 5.7 RN-044: 562.50 − 500.00 = 62.50 | `tests/unit/domain/insights.test.ts` | 129 |
| 5.7 RN-045: 14/15 gastos y 10 % | `tests/unit/domain/insights.test.ts` | 85 |
| 5.7 RN-046: 19.9 %/20 % | `tests/unit/domain/insights.test.ts` | 92 |
| 5.7 RN-040: historial, dedupe y descartado | `tests/unit/domain/insights.test.ts` | 14, 72 |
| 5.8 racha hoy/ayer, fecha de registro y marca única | `tests/unit/domain/streaks.test.ts` | 12, 26 |
| 5.8 racha rota a medianoche de Lima | `tests/unit/domain/streaks.test.ts` | 33 |
| 5.8 importación, recurrente, transferencia y semilla excluidas | `tests/unit/domain/streaks.test.ts` | 37 |
| 5.8 `tx_100`, 19/20 días, presupuestos y catálogo | `tests/unit/domain/streaks.test.ts` | 43 |
| 5.8 logro no se repite ni se pierde | `tests/unit/domain/streaks.test.ts` | 91 |
| 5.9 nombres válidos | `tests/unit/domain/demo-name.test.ts` | 5 |
| 5.9 nombres inválidos y caracteres de dirección/ancho cero | `tests/unit/domain/demo-name.test.ts` | 8 |
| 5.9 fechas CSV ISO y DD/MM | `tests/unit/domain/csv.test.ts` | 11 |
| 5.9 fechas y montos CSV inválidos; 1,234.50 y −45.9 | `tests/unit/domain/csv.test.ts` | 16 |
| 5.9 duplicado por mayúsculas y espacios | `tests/unit/domain/csv.test.ts` | 56 |
| 5.9 fila inválida no bloquea lote; válida, inválida y posible duplicado | `tests/unit/domain/csv.test.ts` | 27 |
| 5.9 generador demo completo y relativo al reloj | `tests/unit/domain/demo-data.test.ts` | 5 |

## 4. Desviaciones respecto a la documentación

Stryker no produjo una línea base fiable con las versiones autorizadas. La documentación vigente del runner de Vitest indica que fuerza `perTest` e ignora `coverageAnalysis`; no se intentó una tercera combinación ni se actualizó a una versión con menos de 14 días. La compensación aceptada es el control manual de 14 mutantes críticos. F13-T04 deberá volver a evaluar la herramienta.

## 5. Propuestas de cambio a los documentos

Ninguna. Los contratos internos nuevos son deliberadamente de dominio y quedan cubiertos por los requisitos existentes.

## 6. Impeccable

No hubo interfaz en F2. El detector estático pasó; la auditoría de página queda para F4.

## 7. Riesgos y deuda técnica

- Deuda con vencimiento F13-T04: obtener línea base real de Stryker y revisar supervivientes. El control manual queda como compensación temporal.
- El único `it.todo` es la paridad ES/EN y `errors.<CODE>`, vence en F4-T04 y no pertenece a F2.

## 8. Decisiones que necesita el autor

La puerta local de F2 está verde y la rama está subida, pero la fase aún no se cierra: el autor debe abrir el Pull Request y confirmar su CI en verde. No se fusionó nada. F3 permanece bloqueada hasta que el autor complete los prerrequisitos de F0 ya registrados en `estado.md`.
