# Estado de implementación — Zavia
- Fase actual: F1
- Última tarea completada: corrección del mapa de trazabilidad de F1-T05 (pendiente de CI)
- Próxima tarea: puerta de control de F1 (pendiente de confirmar CI verde en el Pull Request)
- Fases cerradas: F0
- Bloqueos / decisiones pendientes del autor: ninguno. Mapa aprobado: RNF-050/051 → F2; RNF-059 → F5; RNF-054/056/060/061 → F13; RNF-053 permanece en F1 y tiene verificación de commitlint en CI.
- Nota F3-T08: comprobar si `supabase gen types` funciona con `pg_meta` excluido; si no, reactivarlo en `supabase/config.toml` antes de generar tipos.
- Deuda con vencimiento: `[RNF-045][RNF-044]` es `it.todo` hasta F4-T04, que debe activar la prueba de paridad ES/EN y de `errors.<CODE>` antes de cerrar su puerta.
- Propuestas de cambio a la documentación (sin aplicar): Ninguna pendiente; 11 v0.4 ya añadió 03/06/09 a F1.
- Versiones fijadas (Next.js, Supabase CLI, impeccable, …): Impeccable 4.8.0 con motor 0.1.18 (Apache-2.0); resto en README.
