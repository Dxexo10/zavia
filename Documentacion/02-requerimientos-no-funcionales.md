# 02 · Requerimientos No Funcionales — Zavia

> Estado: BORRADOR v0.4 · Los valores numéricos son propuestas medibles; se pueden ajustar, pero todo RNF debe seguir siendo **verificable**.

## Convenciones

- **ID:** `RNF-###`. Cada uno indica **métrica** y **cómo se verifica** (prueba automática, herramienta o revisión).
- Los detalles de seguridad viven en `09-seguridad.md`; aquí solo se fijan las metas medibles.
- "Móvil de referencia": viewport 360 × 800 con red 4G simulada y CPU 4× más lenta.

---

## Rendimiento

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-001 | Carga inicial rápida en móvil | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms en el dashboard (móvil de referencia) | Lighthouse CI |
| RNF-002 | Puntaje Lighthouse | ≥ 90 en Rendimiento, Accesibilidad, Buenas prácticas y SEO en acceso y dashboard | Lighthouse CI en el pipeline |
| RNF-003 | Respuesta de la API | p95 ≤ 500 ms para lecturas y escrituras con 5,000 transacciones del usuario | Prueba de carga ligera (k6 o similar) |
| RNF-004 | Dashboard con volumen | Se renderiza en ≤ 2 s con 5,000 transacciones | Prueba E2E con datos sembrados |
| RNF-005 | Entrada al demo | Del clic en "Probar demo" al dashboard con datos ≤ 5 s | Prueba E2E con cronómetro |
| RNF-006 | Peso del cliente | JS inicial ≤ 200 KB comprimido en la ruta de acceso | Análisis del build (límite en CI) |
| RNF-007 | Listados escalables | Toda lista usa paginación del lado del servidor y consultas indexadas | Revisión de consultas + `EXPLAIN` en pruebas de integración |

## Disponibilidad y confiabilidad

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-008 | La demo pública debe estar disponible para quien revise el CV | Enlace operativo ≥ 99 % del tiempo (best effort en planes gratuitos) | Monitor de disponibilidad externo gratuito |
| RNF-009 | Evitar que la base de datos gratuita quede en pausa por inactividad | Tarea programada que mantiene actividad, más una pantalla de error amable si la base no responde | Workflow programado en GitHub Actions; prueba de la pantalla de error |
| RNF-010 | Operaciones idempotentes en procesos automáticos | Ejecutar dos veces la generación de recurrentes no crea duplicados | Prueba de integración |
| RNF-011 | Integridad de saldos | Los saldos se derivan de las transacciones y se comprueba que coincidan con su recálculo desde cero | Prueba de propiedad / integración |
| RNF-012 | Copias y recuperación | **Respaldo manual y cifrado** de los datos de usuarios reales (el plan gratuito no incluye respaldos automáticos); el esquema se recrea desde las migraciones; los datos demo no se respaldan; **nunca** se guardan volcados como artefactos de CI en un repositorio público; script de restauración documentado | Revisión manual documentada en el checklist |

## Integridad y manejo de datos

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-013 | Dinero sin errores de coma flotante | Montos almacenados como enteros en la unidad menor (céntimos) con la moneda; ningún cálculo monetario usa `float` | Regla de lint + pruebas unitarias |
| RNF-014 | Fechas consistentes | Instantes en UTC; días y mensajes calculados en `America/Lima` | Pruebas unitarias con fechas límite (medianoche, fin de mes, año bisiesto) |
| RNF-015 | Validación en ambos lados | Toda entrada se valida con el mismo esquema en cliente y servidor; el servidor nunca confía en el cliente | Pruebas de API con entradas inválidas |
| RNF-016 | Eliminación lógica y purga | Transacciones eliminadas se purgan definitivamente a los 30 días | Prueba de integración del proceso de purga |
| RNF-017 | Migraciones versionadas | Todo cambio de esquema es una migración en el repositorio; la base se recrea desde cero con un comando | CI crea la base desde las migraciones |

## Seguridad (metas medibles; detalle en `09-seguridad.md`)

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-018 | ~~Política de contraseñas~~ | **DESCARTADO**: no hay contraseñas propias (el acceso real es con Google) | — |
| RNF-019 | Aislamiento entre usuarios | Cero acceso cruzado: un usuario nunca lee ni escribe datos de otro (incluidos visitantes demo) | Pruebas de aislamiento automatizadas en cada tabla |
| RNF-020 | Autorización a nivel de base de datos | Row Level Security activo en el 100 % de las tablas con datos de usuario | Prueba que falla si una tabla nueva no tiene RLS |
| RNF-021 | Sesiones seguras | Cookies `HttpOnly`, `Secure`, `SameSite`; expiración y cierre de sesión que invalida el token; las cookies que escribe el navegador al crear la sesión demo se **reescriben con `HttpOnly` desde el servidor** (SEG-AUT-06) | Pruebas E2E y de API (PS-12, PS-13) |
| RNF-022 | Cabeceras de seguridad | CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors` | Prueba automática de cabeceras |
| RNF-023 | Límite de intentos | **Reformulado:** sin contraseñas no hay fuerza bruta contra cuentas; se mantienen los límites del demo (RNF-028) y de la importación, y los límites de Supabase Auth revisados (SEG-INF-02) | Pruebas de API de RNF-028 |
| RNF-024 | Dependencias sanas | Cero vulnerabilidades críticas o altas conocidas en dependencias al hacer merge | `npm audit` / Dependabot en CI |
| RNF-025 | Secretos fuera del repositorio | Ninguna clave en el código ni en el historial; `.env.example` sin valores reales | Escaneo de secretos en CI (gitleaks o similar) |
| RNF-067 | Cuotas por usuario | Máx. **5,000** movimientos por usuario real y **1,000 por sesión demo**; 100 cuentas, 200 metas y 50 recurrentes (valores iniciales ajustables, ver RN-009); aplicadas por disparadores en la base; al superarlas, `QUOTA_EXCEEDED` | Prueba de integración que intenta superarlas (PS-07) |
| RNF-068 | Invariantes en la base | Las reglas de integridad críticas (fechas, montos, tipo de categoría, moneda, saldo de metas) se imponen con `CHECK`/disparadores aunque el cliente escriba directamente | Pruebas de integración con llamadas directas a la API (documento 09, sección 5) |
| RNF-069 | Permisos por tabla y columna | El cliente solo tiene los permisos de la tabla del documento 09 (sección 4.2); columnas como `is_demo` y tablas de gamificación son de solo servidor | PS-05, PS-06 |
| RNF-026 | Archivos importados | CSV de máximo 2 MB y 5,000 filas; se rechaza cualquier otro tipo; se neutralizan fórmulas (`=`, `+`, `-`, `@` al inicio) al exportar | Pruebas de importación/exportación |

## Modo demo (acceso público)

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-027 | Caducidad de sesiones demo | 24 h desde su creación; sus datos se eliminan automáticamente | Prueba de integración del proceso de limpieza |
| RNF-028 | Límite de creación de demos | Máx. 5 sesiones demo por IP por hora y un tope global de sesiones demo activas (valor inicial: **150**, ajustable) | Prueba de API |
| RNF-029 | Protección anti-bots | Verificación anti-bot (CAPTCHA invisible o equivalente) al crear la sesión demo | Prueba E2E con el verificador en modo de prueba |
| RNF-030 | Sin efectos externos | Zavia no envía correos; el demo no hace llamadas a terceros con datos del visitante (solo Supabase y Cloudflare Turnstile) | Revisión + prueba E2E que registra las solicitudes de red |
| RNF-031 | Aviso de privacidad | Banner permanente: "Modo demo: no ingreses datos reales" | Prueba E2E |
| RNF-032 | Datos semilla verificables | El generador de datos demo produce siempre los estados esperados (semáforos, presupuestos, insights) | Pruebas unitarias del generador (ver RN-061) |

## Usabilidad y accesibilidad

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-033 | Accesibilidad | Cumple WCAG 2.2 nivel AA en las pantallas principales | `axe` automatizado + revisión manual con teclado |
| RNF-034 | Contraste | ≥ 4.5:1 en texto normal y ≥ 3:1 en componentes y gráficos | Verificación de tokens de diseño (documento 07) |
| RNF-035 | Navegación por teclado | Todo flujo crítico es completable solo con teclado, con foco visible | Pruebas E2E con teclado |
| RNF-036 | Información no solo por color | Todo estado de color tiene icono y texto | Revisión + prueba de componentes |
| RNF-037 | Movimiento reducido | Con `prefers-reduced-motion` se desactivan o reducen las animaciones | Prueba de componentes |
| RNF-038 | Tamaño táctil | Objetivos táctiles ≥ 44 × 44 px en móvil | Prueba E2E en viewport móvil |
| RNF-039 | Mensajes de error útiles | Todo error dice qué pasó y qué hacer; nunca muestra trazas ni códigos internos | Revisión + pruebas de API |

## Compatibilidad y responsive

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-040 | Navegadores | Últimas 2 versiones mayores de Chrome, Edge, Firefox y Safari; Safari iOS y Chrome Android actuales | Playwright en Chromium, Firefox y WebKit |
| RNF-041 | Rango de pantallas | Funcional de 320 px a 2560 px de ancho, sin desplazamiento horizontal | Pruebas E2E en 3 viewports: móvil (360), tablet (768), escritorio (1280) |
| RNF-042 | Orientación | Usable en vertical y horizontal en móvil y tablet | Pruebas E2E |
| RNF-043 | Instalable (opcional) | Manifiesto web para poder agregar la app a la pantalla de inicio | Lighthouse (categoría PWA, si aplica) |

## Internacionalización

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-044 | Cero texto escrito en el código | 0 cadenas visibles fuera de los archivos de traducción | Regla de lint o prueba que escanea el código |
| RNF-045 | Paridad de idiomas | Español e inglés tienen exactamente las mismas claves | Prueba automática comparando ambos archivos |
| RNF-046 | Formatos por idioma | Fechas y números siguen el idioma; la moneda se muestra como `S/` y `US$` | Pruebas unitarias de formato |
| RNF-047 | Cambio de idioma sin recargar | El cambio se aplica al instante y se recuerda | Prueba E2E |

## Mantenibilidad y calidad de código

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-048 | TypeScript estricto | `strict: true`; prohibido `any` sin justificación escrita | `tsc --noEmit` y lint en CI |
| RNF-049 | Estilo consistente | ESLint + Prettier sin errores | CI |
| RNF-050 | Cobertura | ≥ 80 % en líneas y ramas de la lógica de negocio; 100 % en cálculo de dinero, proyección de metas, presupuestos y reglas de insights | Reporte de cobertura con umbral en CI |
| RNF-051 | Lógica de negocio aislada | Las reglas de `03-reglas-de-negocio.md` viven en funciones puras sin dependencias de UI ni de base de datos | Revisión + pruebas unitarias sin mocks de red |
| RNF-052 | Complejidad acotada | Complejidad ciclomática ≤ 10 por función | Regla de lint |
| RNF-053 | Convención de commits y ramas | Un commit por tarea con mensaje convencional; trabajo por ramas y Pull Request | Revisión del historial / commitlint |
| RNF-054 | Documentación viva | `README` con descripción, captura, enlace al demo, instrucciones de instalación y decisiones de arquitectura; cada cambio de comportamiento actualiza el documento correspondiente | Checklist del Pull Request |

## Calidad y pruebas (resumen; detalle en `10-pruebas-automatizadas.md`)

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-055 | Trazabilidad | Cada RF y cada RN tiene al menos una prueba que referencia su ID | Script que cruza IDs de documentos con IDs en pruebas |
| RNF-056 | Integración continua | Lint, tipos, pruebas unitarias, de integración, E2E, accesibilidad y build en cada Pull Request; no se fusiona si algo falla | GitHub Actions |
| RNF-057 | Pruebas deterministas | Sin dependencia de hora real ni aleatoriedad: reloj inyectable y datos semilla fijos | Revisión + ejecución repetida sin fallos intermitentes |

## Observabilidad

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-058 | Registros estructurados | Logs en JSON con ID de solicitud; sin contraseñas, tokens ni montos o descripciones de transacciones | Prueba que revisa que el logger no incluya campos prohibidos |
| RNF-059 | Errores rastreables | Los errores inesperados se capturan con contexto técnico y sin datos personales | Revisión |

## Despliegue y costo

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-060 | Costo | Operar en planes gratuitos permanentes (Vercel Hobby y Supabase Free), con **US$ 0 y sin tarjeta de crédito** | Checklist del documento 12, sección N (verificar condiciones vigentes de cada plan) |
| RNF-061 | Entornos | Desarrollo local, previsualización por Pull Request y producción, con variables de entorno separadas | Revisión |
| RNF-062 | Despliegue reproducible | `README` permite levantar el proyecto en local en ≤ 10 minutos con un conjunto corto de comandos | Prueba de arranque en CI |
| RNF-063 | Páginas de estado | Páginas 404 y 500 diseñadas, con texto en ambos idiomas | Prueba E2E |
| RNF-070 | Costo cero verificable | Ningún servicio ni herramienta requiere pago, tarjeta de crédito ni dominio propio; la URL pública es el subdominio gratuito del hosting; los límites gratuitos vigentes de cada servicio están anotados con fecha | Documento 12, sección N |
| RNF-071 | Freno automático por tamaño de la base | Si el tamaño de la base supera el **70 %** del límite gratuito vigente (valor inicial: 350 MB), se desactiva la creación de demos y de cuentas nuevas con el mensaje amable `DEMO_CAPACITY_REACHED` y se registra una alerta; la lectura de los usuarios existentes sigue funcionando | Prueba de integración con tamaño simulado |
| RNF-072 | Degradación elegante ante límites | Si se alcanza un límite gratuito (almacenamiento, ejecución, usuarios activos), la aplicación sigue sirviendo lo que pueda y muestra un mensaje claro; nunca un error técnico ni un cobro | Pruebas E2E con el límite simulado |
| RNF-073 | Herramientas gratuitas | Solo herramientas gratuitas o de código abierto: Vitest, Playwright, Lighthouse CI, k6, Stryker, gitleaks, Dependabot; el CI corre en GitHub Actions bajo el plan gratuito de repositorios públicos; Docker Desktop bajo su licencia de uso personal/educativo 🔎 | Revisión de `package.json` y del CI |
| RNF-074 | Acceso con Google seguro | Solo ámbitos básicos (`openid`, `email`, `profile`); URIs de redirección exactas; **proveedor de correo y contraseña de Supabase desactivado** en *staging* y producción; secreto del cliente solo en el panel de Supabase | Revisión de configuración (PP-38) y pruebas de PS-19 |

## Privacidad

| ID | Requerimiento | Métrica | Verificación |
|----|---------------|---------|--------------|
| RNF-064 | Minimización | De Google solo se guardan el correo (en Supabase Auth) y el nombre; no se guarda la foto. El demo solo pide nombre y apellido | Revisión |
| RNF-065 | Derecho a eliminar | La eliminación de cuenta (RF-005) borra todos los datos asociados | Prueba de integración que verifica ausencia de filas |
| RNF-066 | Sin rastreadores de terceros | Ninguna analítica ni cookie de terceros en el MVP | Prueba de red en E2E |
