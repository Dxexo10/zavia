# Estado de implementación — Zavia
- Fase actual: F1 (puerta bloqueada por trazabilidad)
- Última tarea completada: F1-T08
- Próxima tarea: corregir el mapa de fases de trazabilidad y volver a ejecutar la puerta de F1
- Fases cerradas: F0
- Bloqueos / decisiones pendientes del autor: `check-traceability` marca como F1 los RNF-048 a RNF-062. Permanecen sin prueba RNF-050, RNF-053, RNF-054, RNF-056, RNF-059, RNF-060 y RNF-061. Varios corresponden a fases posteriores (lógica de negocio, entornos y despliegue), por lo que se necesita aprobar el mapa ID→fase antes de cerrar F1; no se usarán excepciones para ocultarlos.
- Nota F3-T08: comprobar si `supabase gen types` funciona con `pg_meta` excluido; si no, reactivarlo en `supabase/config.toml` antes de generar tipos.
- Deuda con vencimiento: `[RNF-045][RNF-044]` es `it.todo` hasta F4-T04, que debe activar la prueba de paridad ES/EN y de `errors.<CODE>` antes de cerrar su puerta.
- Propuestas de cambio a la documentación (sin aplicar): Ninguna pendiente; 11 v0.4 ya añadió 03/06/09 a F1.
- Versiones fijadas (Next.js, Supabase CLI, impeccable, …): Impeccable 4.8.0 con motor 0.1.18 (Apache-2.0); resto en README.
