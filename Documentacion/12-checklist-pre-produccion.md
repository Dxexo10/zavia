# 12 · Checklist Previo a Producción — Zavia

> Estado: BORRADOR v0.3 · Es la lista final antes de publicar. Cada ítem tiene un **ID** (`PP-xx`), **quién** lo hace (🤖 agente · 👤 tú) y **cómo se verifica**. Un ítem solo se marca cuando hay evidencia (salida de un comando, captura o enlace).
> **Regla de salida:** todo en verde, **o** un riesgo aceptado por escrito en la sección 12 (con motivo y fecha).
> 🔎 Los límites y condiciones de los planes gratuitos cambian: se verifican en la documentación vigente de cada servicio el día de publicar.

## A. Producto y alcance

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-01 | Todos los RF *Must* (01) implementados; los *Should* y *Could* omitidos están listados con motivo | 🤖 | Matriz de trazabilidad (`informes/trazabilidad.md`) |
| PP-02 | El recorrido del reclutador funciona de punta a punta: enlace → demo con nombre y apellido → dashboard con datos en ≤ 5 s y ≤ 2 acciones | 🤖 | E2E-01 en verde; probado desde un dispositivo y red distintos a los tuyos 👤 |
| PP-03 | Registrar un gasto en ≤ 3 interacciones | 🤖 | E2E-07 |
| PP-04 | Las 3 metas del demo se ven en verde, ámbar y rojo; los 3 presupuestos en sus tres niveles | 🤖 | E2E-13 y E2E-15 |
| PP-05 | Ninguna sección visible apunta a una función no construida (si se recortaron fases opcionales) | 🤖 | Revisión de la interfaz |
| PP-06 | Textos finales en español e inglés revisados por una persona | 👤 | Recorrido manual en ambos idiomas |

## B. Pruebas y calidad

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-10 | CI verde en `main` (lint, tipos, unitarias, integración, contrato, E2E, accesibilidad, visual, Lighthouse) | 🤖 | Ejecución del CI |
| PP-11 | Cobertura: ≥ 80 % en `domain/` y `application/`; 100 % en dinero, metas, presupuestos, recurrentes e insights | 🤖 | Informe de cobertura |
| PP-12 | Trazabilidad: cada RF *Must*, RN, RNF automatizable y `SEG-…` tiene prueba; las excepciones están justificadas | 🤖 | `check-traceability` |
| PP-13 | Mutación sobre `domain/` por encima del umbral | 🤖 | Informe de Stryker |
| PP-14 | Matriz completa de navegadores × anchos en verde (Chromium, Firefox, WebKit × 360/768/1280) | 🤖 | Ejecución nocturna |
| PP-15 | Cero pruebas inestables en cuarentena | 🤖 | Lista de incidencias |
| PP-16 | Prueba de que el *build* de producción no contiene artefactos de prueba (`pseudo`, rutas de prueba) | 🤖 | Etapa 5 del CI |

## C. Seguridad (complementa `09-seguridad.md` §7)

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-20 | Checklist completo de `09-seguridad.md` §7 | 🤖 / 👤 | Cada casilla con evidencia |
| PP-21 | PS-01 a PS-32 en verde, con el informe `informes/seguridad.md` | 🤖 | Informe |
| PP-22 | Revisión manual con **ASVS nivel 1** y recorrido del modelo de amenazas | 👤 | Notas en `informes/revision-seguridad.md` |
| PP-23 | Sin secretos en el repositorio **ni en su historial** | 🤖 | gitleaks sobre todo el historial |
| PP-24 | **2FA** en GitHub, Vercel, Supabase, Google (cuenta dueña del cliente OAuth) y Cloudflare | 👤 | Captura de cada panel |
| PP-25 | Rama `main` protegida y `CODEOWNERS` activo sobre archivos protegidos | 👤 | Configuración del repositorio |
| PP-26 | Sumas de control de la skill de diseño verificadas | 🤖 | PS-24 |

## D. Claves y configuración

El agente crea `scripts/verify-env.ts`, que **no imprime valores** y reporta solo «correcto / falta / inválido». Se ejecuta en *staging* y en producción.

| ID | Ítem | Quién | Verificación con `verify-env` |
|----|------|:-----:|-------------------------------|
| PP-30 | Existen todas las variables de `.env.example` en cada entorno | 🤖 | Presencia y formato (longitud, prefijo, URL válida) |
| PP-31 | `NEXT_PUBLIC_SUPABASE_URL` y la clave pública corresponden al **proyecto del entorno correcto** (producción ≠ *staging*) | 🤖 | Una consulta de salud con la clave pública responde; la URL coincide con el entorno |
| PP-32 | `SUPABASE_SECRET_KEY` funciona **solo en servidor** y **no aparece** en el *bundle* del cliente | 🤖 | Prueba de servicio + PS-21 |
| PP-33 | La clave de servicio de producción **nunca** estuvo en la máquina del agente ni en `.env.local` | 👤 | Revisión |
| PP-34 | `TURNSTILE_SECRET_KEY` valida un token de prueba; la clave del sitio coincide | 🤖 | Verificación con el servicio de pruebas |
| PP-35 | **Inicio de sesión real con Google** desde una cuenta que no es la tuya (primer acceso, regreso, cierre de sesión, eliminación); el cliente OAuth está **publicado** (no solo en modo de prueba con usuarios de prueba) y usa solo ámbitos básicos 🔎 | 👤 | Capturas |
| PP-36 | `CRON_SECRET` rechaza (401) sin encabezado y acepta con él | 🤖 | PS-26 |
| PP-37 | `IP_HASH_SECRET` es largo y aleatorio, distinto por entorno | 🤖 | Longitud y unicidad |
| PP-38 | Configuración de Supabase Auth: proveedor de correo y contraseña **desactivado**; Google activado; URL del sitio y retornos permitidos; CAPTCHA activado para sesiones anónimas; rotación de *refresh token* y límites revisados | 👤 | Captura del panel |
| PP-39 | Procedimiento de **rotación** de cada clave (incluido el secreto del cliente OAuth de Google) escrito y probado una vez | 👤 | `informes/rotacion-claves.md` |

## E. Infraestructura: ¿soporta el proyecto?

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-40 | Tabla de capacidad (abajo) revisada contra los límites **vigentes** de Supabase y Vercel | 👤 | Fecha y fuentes anotadas |
| PP-41 | El proyecto de producción no pausa por inactividad: *keep-alive* diario y monitor externo | 🤖 / 👤 | Un ciclo de varios días sin pausa 🔎 |
| PP-42 | Cron diario y tareas `pg_cron` ejecutándose (registro de ejecuciones) | 🤖 | Logs |
| PP-43 | Previsualizaciones apuntan a *staging*; producción solo recibe `main` | 👤 | Variables por entorno |
| PP-44 | Migraciones de producción aplicadas desde cero en un proyecto limpio de *staging* antes | 🤖 | CI |
| PP-45 | Interruptor para **desactivar el demo** rápidamente (variable de entorno) si hay un ataque | 🤖 | Prueba: con el interruptor activo, el demo responde con un mensaje amable |

**Tabla de capacidad (estimaciones propias; verifica los límites vigentes):**

| Recurso | Uso esperado | Peor caso (ataque dentro de las cuotas) | Límite del plan |
|---------|-------------|------------------------------------------|-----------------|
| Almacenamiento de base de datos | Un demo ≈ 150 filas sembradas (< 0.1 MB); 150 demos activos < 15 MB | Tope de demos (150) × cuota (1,000 movimientos ≈ 0.5 MB con índices) ≈ **75 MB** | **500 MB** (verificado en la página de precios de Supabase); sin respaldos automáticos; pausa por inactividad de 7 días |
| Creación de sesiones anónimas | Pocas por día | Límites por IP de Supabase + 5/h por *hash* de IP + tope global | 🔎 Límites de Auth |
| Ejecución en Vercel | Páginas dinámicas por el *nonce* de CSP | Ráfaga de tráfico | Uso **personal no comercial**; cron como máximo **una vez al día** y a hora aproximada (verificado); 🔎 ancho de banda y duración de funciones |

**Con los valores actuales** (150 demos × 1,000 movimientos) el peor caso queda cerca de 75 MB, muy por debajo de los 500 MB. Además, el **freno automático** (RNF-071) desactiva el demo y las cuentas nuevas si la base supera 350 MB. Los valores viven en `config/business-constants.ts`.

## F. Rendimiento

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-50 | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms en acceso y dashboard (móvil de referencia) | 🤖 | Lighthouse CI |
| PP-51 | Puntajes ≥ 90 en Rendimiento, Accesibilidad, Buenas prácticas y SEO | 🤖 | Lighthouse CI |
| PP-52 | p95 ≤ 500 ms con 5,000 movimientos; dashboard ≤ 2 s | 🤖 | k6 y E2E |
| PP-53 | JS inicial ≤ 200 KB comprimido en el acceso | 🤖 | Etapa de *build* |
| PP-54 | Prueba de carga **en *staging***, no en producción | 👤 | Informe de k6 |

## G. Accesibilidad, diseño e idiomas

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-60 | axe sin violaciones críticas ni serias en todas las pantallas × 3 anchos | 🤖 | E2E de accesibilidad |
| PP-61 | Recorrido con lector de pantalla (NVDA y VoiceOver) en acceso, dashboard y registrar | 👤 | Notas |
| PP-62 | Probado en iPhone con Safari y en Android con Chrome (teclado en pantalla, áreas seguras) | 👤 | Capturas |
| PP-63 | Auditoría final de diseño (prompt D5) y detector de impeccable sin hallazgos | 🤖 | `informes/diseno-final.md` |
| PP-64 | Contrastes verificados por prueba; sin colores fuera de tokens | 🤖 | Pruebas de F4 |
| PP-65 | Movimiento reducido verificado (incluida la celebración de sellos) | 🤖 | PS/E2E-14 |
| PP-66 | Paridad ES/EN, sin cadenas en el código y sin desbordes con `pseudo` | 🤖 | Pruebas de i18n |

## H. Documentación del repositorio y presentación (portafolio)

| ID | Ítem | Quién |
|----|------|:-----:|
| PP-70 | `README` con descripción, **capturas** (móvil y escritorio), **enlace al demo**, diagrama de arquitectura, decisiones clave y cómo ejecutarlo en local | 🤖 |
| PP-71 | Sección «Calidad y seguridad» en el `README`: cifras reales (cobertura, mutación, Lighthouse), número de pruebas y enlace a `informes/trazabilidad.md` | 🤖 |
| PP-72 | `SECURITY.md`, `LICENSE`, `CHANGELOG`, política de privacidad y términos (ES/EN) | 🤖 |
| PP-73 | Imagen Open Graph correcta al compartir el enlace (LinkedIn, mensajería) | 👤 |
| PP-74 | Repositorio fijado en tu perfil de GitHub; enlace y descripción en el CV | 👤 |
| PP-75 | Insignias de CI en el `README` | 🤖 |
| PP-76 | Sin información personal ni claves en las capturas, el historial ni los `README` | 👤 |

## I. Operación

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-80 | Monitor de disponibilidad externo sobre `/api/health` con aviso por correo | 👤 | Una alerta de prueba |
| PP-81 | Respaldo **manual y cifrado** realizado y **restauración probada** en un proyecto vacío; ningún volcado en artefactos de CI de un repositorio público (RNF-012) | 👤 | Nota con fecha |
| PP-82 | **Plan de reversión:** la aplicación se revierte a la versión anterior desde Vercel 🔎; las migraciones son **solo hacia adelante** (un error de esquema se corrige con una migración nueva); respaldo justo antes de cada migración en producción | 👤 | Ensayo en *staging* |
| PP-83 | Plan de respuesta a incidentes en el repositorio (09 SEG-LOG-05) | 🤖 | Archivo |
| PP-84 | Lista de personas con acceso a cada servicio revisada | 👤 | Captura |

## J. Privacidad y legal

| ID | Ítem | Quién |
|----|------|:-----:|
| PP-90 | Política de privacidad: datos que se guardan, finalidad, plazos (demo 24 h, eliminados 30 días) y cómo borrarlos | 🤖 → 👤 revisa |
| PP-91 | El `README` y la interfaz declaran que Zavia es una **demostración de portafolio, no un servicio financiero** | 🤖 |
| PP-92 | Si habrá usuarios reales en Perú, revisión de las obligaciones de la Ley N.º 29733 y su reglamento (consulta a un profesional) 🔎 | 👤 |
| PP-93 | Cumplimiento de las licencias de dependencias y de la skill de diseño (conservar avisos de licencia) | 🤖 |

## K. Recomendaciones antes de publicar

1. **Congela los cambios** (sin fusiones) desde que empieza la verificación final hasta publicar.
2. **Ensaya el despliegue completo en *staging*** con la misma configuración que producción, incluido el acceso real con Google y Turnstile en modo real.
3. Publica primero **solo el demo** si dudas del acceso con Google; habilita las cuentas reales cuando el cliente OAuth esté publicado y probado con una cuenta ajena.
4. **Ejecuta `verify-env` y los *smoke tests* justo después de desplegar**, antes de compartir el enlace.
5. Comparte el enlace con **dos o tres personas de confianza** y pídeles que lo abran desde su celular, sin ayuda tuya.
6. Etiqueta `v1.0.0` y conserva el despliegue anterior disponible para revertir.
7. Durante la primera semana, revisa a diario el monitor, los registros de seguridad (límites alcanzados, captcha fallido) y el uso de almacenamiento.

## L. Riesgos aceptados (se llena al cerrar)

| Riesgo | Motivo de aceptarlo | Fecha y firma |
|--------|---------------------|---------------|
| | | |

## N. Costo cero (verificación)

| ID | Ítem | Quién | Verificación |
|----|------|:-----:|--------------|
| PP-100 | Ningún servicio tiene tarjeta de crédito asociada ni plan de pago activo (Supabase, Vercel, Cloudflare, GitHub, monitor de disponibilidad) y el proyecto de Google Cloud **no tiene facturación habilitada** 🔎 | 👤 | Captura de la facturación de cada panel |
| PP-101 | Cada servicio está en un plan gratuito **permanente** (no una prueba gratuita que caduca) | 👤 | Condiciones del plan vigentes, con fecha |
| PP-102 | Sin dominio propio: la URL pública es `*.vercel.app` y el `README`, el CV y la imagen Open Graph usan esa URL | 🤖 / 👤 | Revisión |
| PP-103 | Límites vigentes de cada plan anotados con fecha en `informes/limites-gratuitos.md`; los frenos (RNF-071) quedan por debajo de ellos | 👤 | Archivo |
| PP-104 | Ninguna dependencia, herramienta ni API de pago o con cuota que exija tarjeta (revisión de `package.json` y del CI) | 🤖 | `pnpm` y revisión |
| PP-105 | Revisión semanal de almacenamiento y usuarios activos; si pasa del 70 %, se activa el interruptor del demo (PP-45) | 👤 | Recordatorio |
| PP-106 | El uso respeta los términos del plan gratuito (Vercel Hobby: personal y **no comercial**; el repositorio es de portafolio y no tiene publicidad ni cobros) | 👤 | Revisión de términos |
| PP-107 | Docker Desktop bajo su licencia de uso personal o educativo 🔎 | 👤 | Revisión de términos |

*Nota:* el costo de la herramienta de agente (Codex) es de desarrollo, no una dependencia del producto publicado, y queda fuera de este checklist.

## M. Criterio de salida

- [ ] Secciones A a J y N sin ítems pendientes **o** con su riesgo registrado en L.
- [ ] Recomendaciones de K aplicadas.
- [ ] Demo verificado desde otro dispositivo y otra red.
- [ ] `v1.0.0` etiquetada.
