# Informe de la fase 1 — Cimientos y herramientas

## 1. Qué se construyó

| Tarea | Resultado | Commit principal |
| --- | --- | --- |
| F1-T01 | Proyecto Next.js estricto, estructura de capas y pnpm | `caeb9b2` |
| F1-T02 | ESLint, Prettier LF, Husky, commitlint y dependency-cruiser | `2480ae2` |
| F1-T03 | Constantes, reloj inyectable, `Result`/`AppError`/`ErrorCode` y logger | `3a7cac2` |
| F1-T04 | Vitest, helpers, Supabase local y prueba real de `loginAs` | `d4af186` |
| F1-T05 | Matriz de trazabilidad, CODEOWNERS y lectura del mapa oficial por fases | `6a84999`, `9b8426f`, `fix(F1-T05)` actual |
| F1-T06 | CI, Dependabot, Gitleaks CLI, secretos y seguridad de suministro | `f454738`, `d46e91d`, `63d6f8b`, `a31da7b` |
| F1-T07 | Impeccable, `PRODUCT.md`, `DESIGN.md` y suma del motor verificada | `f9e7425` |
| F1-T08 | README inicial, estado, plantilla y comandos base | `0990bad` |

## 2. Evidencia de la puerta

Ejecución local final:

```text
pnpm test                 10 archivos, 72 pruebas en verde, 1 todo autorizado
pnpm test:coverage        100 % sentencias, ramas, funciones y líneas de la lógica actual
pnpm lint                 correcto
pnpm typecheck            correcto
pnpm check:layers         0 violaciones
pnpm detect:design        correcto; 7 archivos fuente analizados
pnpm check:traceability   correcto; 135 pendientes de fases futuras
pnpm format:check         correcto
pnpm build                correcto
```

La prueba de integración confirmó que `loginAs` crea, consulta y elimina un usuario local. Supabase local arrancó con base de datos, Auth, REST y pasarela; los servicios no usados se excluyeron. El CI del Pull Request fue confirmado en verde por el autor.

## 3. IDs cubiertos y pendientes

Tras la corrección de trazabilidad, F1 cubre RNF-024, RNF-025, RNF-048, RNF-049, RNF-052, RNF-053, RNF-055, RNF-057, RNF-058 y RNF-062; SEG-INP-02, SEG-LOG-01, SEG-LOG-04, SEG-SEC-01, SEG-SEC-02, SEG-SUP-01, SEG-SUP-02, SEG-SUP-03, SEG-SUP-05, SEG-SUP-06 y SEG-SUP-08; y PS-20, PS-22, PS-23, PS-24, PS-27 y PS-30. La matriz ahora incluye RF, RN, RNF, SEG y PS, con desglose por fase y prefijo.

Se retiraron citas que no demostraban su requisito: RNF-019 de `loginAs` (no prueba aislamiento entre dos usuarios), RNF-039 de los contratos de error (no verifica mensajes útiles para usuarios), RNF-051 de la regla de capas (no demuestra que las reglas de negocio de 03 estén implementadas) y RNF-058 de los contratos de error (el control real queda en la prueba de lista blanca del logger). RNF-050 no tenía cita de prueba y permanece en F2; RNF-053 se conserva porque el CI valida los mensajes convencionales de los commits del Pull Request.

La única deuda deliberada es `[RNF-045][RNF-044]`: un `it.todo` para paridad ES/EN y `errors.<CODE>`. Está registrada en `tests/traceability.exceptions.md`, vence en F4-T04 y la puerta de F4 exige activarla y dejarla en verde.

Los pendientes restantes no usan excepciones. El mapa aprobado asigna RNF-050 y RNF-051 a F2; RNF-059 a F5; y RNF-054, RNF-056, RNF-060 y RNF-061 a F13.

## 4. Diferencias respecto a documentación vigente

La documentación de Supabase menciona `inbucket.enabled`; Supabase CLI 2.121.0 generó `[local_smtp]` con `enabled = false`. Se aplicó la clave generada por el CLI y se documentó la diferencia en el README. El acceso por correo queda limitado a la instancia local para pruebas; staging y producción deberán mantenerlo desactivado (`SEG-AUT-02`).

## 5. Propuestas de cambio a la documentación

El documento 11 v0.5 incorpora el bloque `mapa-id-fase` como fuente de verdad de la matriz. La herramienta dejó de inferir fases por rangos y falla ante IDs vigentes sin mapa o IDs inexistentes/excluidos dentro del mapa.

Para evitar reasignaciones ambiguas, conviene que el plan mantenga una tabla ID → fase para requisitos transversales. La fase debe ser aquella en que queda satisfecha su verificación completa, no la primera fase que lo menciona.

## 6. Diseño

Se creó el contrato inicial de producto y diseño con Impeccable. El motor 0.1.18 se verificó frente a su SHA-256 registrada antes de usarlo; la versión 4.8.0 y licencia Apache-2.0 constan en README.

## 7. Riesgos y deuda técnica

El detector de diseño solo ejecuta reglas estáticas mientras no exista una interfaz renderizada; las comprobaciones de página se activarán en F4. Node emite una advertencia no bloqueante al cargar `scripts/check-traceability.ts` sin `type: module`.

## 8. Decisiones del autor

Para PS-25, CODEOWNERS no puede obligar una aprobación de otra persona en un repositorio de una sola persona. Se recomienda combinar protección de `main`, PR obligatorio, CI obligatorio y bloqueo de push directo. Si se requiere una separación humana real, debe añadirse un colaborador como revisor obligatorio; una autoaprobación no la sustituye.

## 9. Siguiente fase

F2 queda pendiente de `CONTINUAR`. Antes de iniciarla se leerán 03 completo; 10 (§5 y §15); 02 (RNF-013, 014, 050, 051 y 057); 06 (§1 y §4); y 04 (§1 y §3).
