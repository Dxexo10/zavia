# 08 · Skills de Diseño (impeccable) — Zavia

> Estado: BORRADOR v0.3 (ajustado al paquete de la skill que ya tienes descargado y a **Codex** como herramienta de agente)
> Este documento explica **cómo se usa la skill *impeccable*** para que el agente construya la interfaz fiel a `07-diseno-ui-ux.md`, y trae los **prompts listos para copiar** y los contenidos de `PRODUCT.md` y `DESIGN.md`.
> **Sintaxis en Codex:** las skills se invocan con `$impeccable <comando>` (o se eligen en `/skills`); Codex no usa comandos tipo `/prompts:`. En las secciones explicativas se escribe `/impeccable <comando>` por brevedad, pero **los prompts de la sección 7 ya usan `$impeccable`**. 🔎 Verifícalo escribiendo `/skills` en Codex.
> 🔎 La skill cambia con frecuencia. Lo descrito aquí proviene de su documentación pública (repositorio oficial `pbakaus/impeccable` y su sitio impeccable.style) al 27/10/2026. **Antes de usarla, el agente verifica en la documentación vigente** el comando de instalación, la lista de comandos y la compatibilidad con tu herramienta (CommandCode, Claude Code o Codex).

## 1. Principio de precedencia (lo más importante)

1. **`07-diseno-ui-ux.md` manda.** La skill es una *ayuda* para ejecutar ese diseño con calidad; nunca decide la identidad visual.
2. Si la skill sugiere cambiar paleta, tipografía, personalidad o añadir degradados, brillos o modo oscuro, el agente **rechaza la sugerencia** y la registra como "propuesta descartada" en el reporte de la fase.
3. Si una sugerencia de la skill contradice un RNF de accesibilidad (RNF-033 a 038), **gana la accesibilidad**.
4. Todo cambio *aprobado* al sistema de diseño se escribe **primero en el documento 07** y luego en el código.
5. **Una sola skill de diseño activa.** Impeccable ya se apoya en la skill `frontend-design` de Anthropic; instalar varias skills de diseño a la vez produce instrucciones que se contradicen. No se instalan otras.

## 2. Qué aporta impeccable

| Elemento | Para qué se usa en Zavia |
|----------|--------------------------|
| **`/impeccable init`** | Genera `PRODUCT.md` (público, voz, referencias a evitar) y ofrece `DESIGN.md` (colores, tipografía, componentes). Los demás comandos se apoyan en ellos. Los contenidos están en los Apéndices A y B |
| **`shape`** | Planificar la UX de una pantalla **antes** de escribir código |
| **`craft`** | Flujo completo de planificar y construir con iteración visual |
| **`critique`** | Revisión de UX: jerarquía, claridad, resonancia emocional |
| **`audit`** | Revisión técnica: accesibilidad, rendimiento, responsive |
| **`normalize`** | Alinear una pantalla con los tokens y componentes del sistema |
| **`distill`** | Quitar complejidad (clave para que el dashboard no quede pesado) |
| **`quieter`** | Bajar el tono de lo que quedó demasiado llamativo (útil contra el exceso de peso visual) |
| **`animate`** | Diseñar movimiento; se usa para la celebración de sellos (sección 8.1 del 07) |
| **`harden`** | Estados de error y casos límite (formularios, importación CSV) |
| **`extract`** | Extraer componentes y tokens reutilizables al sistema de diseño |
| **`polish`** | Pasada final antes de cerrar una fase |
| **`live`** | Iterar variantes en el navegador (opcional, local) |
| **`pin <comando>`** | Crea atajos (por ejemplo `/audit`) |
| **Detector** (`npx impeccable detect <ruta>`) | Escanea el código buscando patrones de "diseño genérico de IA" y fallas de calidad (bordes laterales de color, degradados morados, rebotes, brillos oscuros, objetivos táctiles pequeños, jerarquía de títulos saltada…). Funciona **sin** agente, por lo que se puede poner en CI |

**Comandos adicionales que trae tu copia** (deducidos de los archivos de `impeccable\reference\`; 🔎 lee el `.md` de cada uno antes de usarlo, porque aquí solo se infiere su propósito por el nombre):

| Comando | Uso previsto en Zavia |
|---------|-----------------------|
| `typeset` | Afinar la jerarquía tipográfica según el 07 (sección 2): escala, cifras tabulares, longitud de línea |
| `layout` | Ritmo, espaciado y composición según el 07 (secciones 4 y 5) |
| `adapt` | Adaptación entre móvil, tablet y escritorio (RF-039) |
| `clarify` | Microcopia clara y sobria según el 07 (sección 9) |
| `onboard` | Recorrido guiado y primeros pasos (RF-041) |
| `optimize` | Rendimiento de la interfaz (RNF-001 a RNF-006) |
| `doctor` | Comprobar que la instalación de la skill está sana |
| `document`, `generate`, `visualize` | Verificar su descripción antes de usarlos; por defecto no se usan |
| `colorize`, `delight`, `overdrive` | **No se usan** salvo aprobación expresa del autor: empujan hacia más color, sorpresa y énfasis, y chocan con la personalidad del 07 |
| Archivos `ios`, `android` y variantes `native` | No aplican (Zavia es web) |

`bolder` existe, pero **no se usa** en Zavia: su propósito (amplificar diseños aburridos) choca con la personalidad sobria; si algo se ve plano se corrige con tipografía y espacio, no con más color.

Los archivos de trabajo que la skill genera viven en `.impeccable/` (capturas, caches, configuración por desarrollador). 🔎 Verificar qué subcarpetas conviene versionar; por defecto se versionan `PRODUCT.md` y `DESIGN.md` y se ignoran capturas y caches en `.gitignore`.

## 3. Instalación y arranque (lo haces tú, una sola vez)

**Estado verificado en tu carpeta el 27/10/2026:** ya descargaste el paquete de la skill y está en `Zavia\impeccable\` (contiene `SKILL.md`, `agents\`, `reference\` y `scripts\`). Esa carpeta **es la skill, no el proyecto**. Donde está ahora (la raíz) ninguna herramienta la carga sola y además ensucia la raíz del repositorio. Los pasos son:

**1. Ubicarla donde Codex la lea.** Se mueve la carpeta completa, sin tocar su contenido. Tu paquete trae la carpeta `agents\` con definiciones de subagentes y un `openai.yaml`, que es la estructura que Codex descubre por sí mismo dentro de la skill. Para Codex, la instalación **local al repositorio** va en `.agents\skills\impeccable\` (la alternativa de usuario, `~\.agents\skills\`, no queda versionada con el proyecto y no se recomienda):

```powershell
cd C:\Users\DIEGO\Desktop\Zavia
New-Item -ItemType Directory -Force .agents\skills | Out-Null
Move-Item .\impeccable .\.agents\skills\impeccable
```

Reinicia Codex si la skill no aparece al escribir `/skills`.

**2. Versionarla con el repositorio.** Mantener la skill dentro del repo fija su versión (los resultados no cambian entre sesiones) y la deja disponible para quien clone el proyecto. Pesa cerca de 2 MB (sobre todo un índice de fuentes y un script de navegador). Conserva sus archivos de licencia (su repositorio indica Apache 2.0 🔎) porque tu repositorio será público.

**3. Verificar la instalación.** Abre la herramienta, escribe `/impeccable` para ver la lista de comandos y ejecuta `/impeccable doctor` (🔎 confirma en `reference\doctor.md` qué comprueba). Anota en el `README` el contenido del archivo `scripts\VERSION`.

**4. Inicializar.** Ejecuta `/impeccable init` y responde con los Apéndices A y B. Debe quedar `PRODUCT.md` y `DESIGN.md` en la raíz. Si genera su propio formato, el agente conserva esa estructura y vuelca ahí el contenido.

**5. Hooks (opcional).** Tu paquete **no trae** un `.codex\hooks.json`; `reference\hooks.md` explica cómo conectarlo. Según la documentación pública, Codex descubre los hooks desde `.codex\hooks.json`, junto a la configuración del proyecto, y por eso es **local a cada proyecto** y requiere que marques el proyecto como de confianza. 🔎 Si decides no usarlo, el detector se corre **manualmente y en CI** (sección 6). En Windows se invoca con `npx impeccable detect src/` o con el lanzador incluido en `scripts\` (`impeccable.cmd`).

**6. Ignorar lo que genera.** Añade a `.gitignore` las capturas y caches de `.impeccable\` (🔎 versiona solo lo que la documentación indique como compartible).

Se hace **después** de crear el proyecto Next.js y antes de construir cualquier pantalla (fase de diseño del documento 11).

## 4. Flujo de diseño por pantalla

Para **cada pantalla** de la lista del documento 07 (sección 7), en este orden. Cada paso termina con su criterio de salida:

| # | Paso | Comando | Criterio de salida |
|---|------|---------|--------------------|
| 1 | Planificar | `shape <pantalla>` | Descripción de jerarquía y estados **alineada con el 07** (se compara contra la tabla de pantallas) |
| 2 | Construir | `craft <pantalla>` (o construir y luego `normalize`) | Pantalla funcional usando solo tokens y componentes del sistema |
| 3 | Simplificar | `distill <pantalla>` | Nada que no aporte; el contenido clave visible sin desplazarse en escritorio (dashboard) |
| 4 | Endurecer | `harden <pantalla>` | Estados vacío, carga, error y casos límite resueltos (RF-026) |
| 5 | Auditar | `audit <pantalla>` | Cero hallazgos críticos de accesibilidad; responsive correcto en 3 tamaños |
| 6 | Criticar | `critique <pantalla>` | Jerarquía clara; sin sobrecarga visual; recomendaciones aplicadas o descartadas con motivo |
| 7 | Alinear | `normalize <pantalla>` | Sin valores fuera de tokens |
| 8 | Pulir | `polish <pantalla>` | Listo para cerrar la fase |

Pasos extra:
- **Celebración de sellos:** `animate` con las reglas del 07 (sección 8.1) como restricción; verificar la versión con movimiento reducido.
- **Al terminar cada fase:** `extract` para promover a `components/ui` lo que se repitió, y actualizar la página interna `/design`.
- **Si algo queda pesado visualmente:** `quieter`, y como último recurso `distill`.

## 5. Qué se verifica además de la skill (la skill no basta)

La skill es un asistente, no un árbitro. Estas comprobaciones son **automáticas** y viven en el código:

| Verificación | Herramienta | Documento |
|--------------|-------------|-----------|
| Contrastes calculados desde los tokens | Prueba unitaria (RNF-034) | 07 §3.4, 10 |
| Cero colores o `#000`/`#fff` fuera de tokens | Regla de lint | 07 §3.5.1 |
| Accesibilidad de las pantallas | `axe` en Playwright (RNF-033) | 10 |
| Sin desplazamiento horizontal desde 320 px; objetivos táctiles ≥ 44 px | Playwright en 3 tamaños (RNF-038, 041) | 10 |
| Cambios visuales no deseados | Capturas de referencia por pantalla y tamaño (Playwright) | 10 |
| Texto ES/EN sin desbordes | Prueba con textos un 30 % más largos (pseudo-localización) | 10 |
| Movimiento reducido | Prueba que activa `prefers-reduced-motion` (RNF-037) | 10 |
| Patrones prohibidos del 07 §11 | **Detector de impeccable** (sección 6) | este documento |

## 6. Detector en el pipeline

- **Paso en CI:** `npx impeccable detect src/` dentro de la etapa de lint (documento 05, sección 10, paso 2). 🔎 Verificar el código de salida con hallazgos y si permite configurar la severidad.
- **Política:** al inicio se ejecuta en modo informativo para fijar una línea base; cuando la línea base está en cero, pasa a **bloquear** la fusión del Pull Request.
- Las excepciones se justifican por escrito en el propio Pull Request; nunca se desactiva una regla de forma global.
- Si la herramienta de agente tiene el hook, el agente corrige los hallazgos en cada edición; si no, corre el detector antes de cada commit.

## 7. Prompts listos para copiar

> Cópialos en tu herramienta de agente, uno por vez, y confirma el resultado antes de pasar al siguiente (así mantienes un commit por tarea).

### Prompt D1 · Configurar la skill (ya descargada)

```text
Lee AGENTS.md y Documentacion/08-skills-de-diseno.md (secciones 1 a 3).
Contexto: la skill impeccable ya está descargada y colocada en `.agents/skills/impeccable`.
Tarea: dejarla operativa en este proyecto.
1. Confirma que Codex la reconoce (aparece en /skills y `$impeccable` muestra la lista de comandos) y ejecuta `$impeccable doctor`. Lee reference/doctor.md y reference/hooks.md y dime qué comprueban. Si algo difiere de lo descrito en el documento 08, avísame antes de continuar.
2. Registra en el README la versión (contenido de scripts/VERSION) y la licencia de la skill.
3. Ejecuta $impeccable init y vuelca en PRODUCT.md y DESIGN.md el contenido de los Apéndices A y B del documento 08, conservando la estructura que la skill genere.
4. Añade a .gitignore las capturas y caches de .impeccable/ (versiona solo lo que la documentación indique como compartible).
5. Lee reference/hooks.md y configura el hook del detector en .codex/hooks.json si es viable; si no, déjalo documentado como paso manual y en CI.
Alcance: no escribas código de interfaz todavía. Termina con un commit "chore(design): configura impeccable y define PRODUCT.md/DESIGN.md" y detente a esperar mi confirmación.
```

### Prompt D2 · Tokens, fuentes y página de componentes

```text
Lee Documentacion/07-diseno-ui-ux.md (secciones 2 a 5 y 6) y 08 (sección 1).
Tarea: implementar el sistema de diseño base.
1. Tokens de color, espaciado, radios y movimiento exactamente como el documento 07 (CSS variables + mapeo a Tailwind según la versión instalada; consulta su documentación vigente).
2. Fuentes Newsreader y Hanken Grotesk con next/font. Verifica que soportan tildes, ñ, ¿ ¡ y cifras tabulares/de caja alta (tnum, lnum); si no, usa la alternativa del documento y avísame.
3. Regla de lint que prohíba #000, #fff y colores fuera de los tokens.
4. Prueba unitaria que recalcule los contrastes de la tabla 3.4 y falle si bajan del umbral.
5. Componentes base de la sección 6 con todos sus estados, y una página interna /design (solo desarrollo) que los muestre en 3 anchos (360, 768, 1280).
6. Ejecuta, en este orden: $impeccable audit, $impeccable normalize y $impeccable polish sobre lo creado.
Reglas: 07 manda sobre cualquier sugerencia de la skill; descarta y lista las propuestas que lo contradigan.
Termina con commits por tarea y un resumen de hallazgos. Detente a esperar mi confirmación.
```

### Prompt D3 · Una pantalla (repetir por cada una)

```text
Lee Documentacion/07-diseno-ui-ux.md (secciones 5, 6, 7 y 9) y los RF de la pantalla: <PANTALLA y RF>.
Tarea: construir la pantalla "<PANTALLA>" siguiendo el flujo del documento 08 (sección 4): shape → construir con los componentes existentes → distill → harden → audit → critique → normalize → polish.
Reglas:
- Solo tokens y componentes del sistema; texto únicamente vía archivos de traducción ES/EN.
- Mobile-first; verifica 360, 768 y 1280 px; sin desplazamiento horizontal desde 320 px.
- Antes de cerrar, ejecuta `npx impeccable detect src/` y corrige los hallazgos.
- Añade las pruebas del documento 10 para esta pantalla (referencia cada prueba con su RF/RN).
Entrega un resumen: qué construiste, hallazgos de audit/critique aplicados y descartados (con motivo). Un commit por tarea. Detente a esperar mi confirmación.
```

### Prompt D4 · Celebración de sellos

```text
Lee Documentacion/07-diseno-ui-ux.md sección 8.1 y RF-015, RF-036, RF-037.
Tarea: implementar la celebración «sello» (≈ 1.1 s, una sola a la vez, cola con aviso resumen si hay varias, sin sonido, se cierra con un toque).
Usa $impeccable animate con las restricciones del documento (solo opacity y transform, ease-standard sin rebote, 12 filetes radiales finos, sin confeti).
Versión con prefers-reduced-motion: aparición por opacidad, sin radiales ni rotación.
Anuncio accesible con role="status". Añade pruebas E2E de ambas versiones. Detente a esperar mi confirmación.
```

### Prompt D5 · Auditoría final de diseño

```text
Lee Documentacion/07-diseno-ui-ux.md (secciones 10, 11 y 12) y 08 (secciones 5 y 6).
Tarea: auditoría final de diseño de toda la aplicación.
1. $impeccable audit y $impeccable critique en: Acceso, Dashboard, Registrar movimiento, Metas (detalle), Sellos.
2. `npx impeccable detect src/` sin hallazgos (o con excepciones justificadas por escrito).
3. axe sin críticos; objetivos táctiles ≥ 44 px; textos ES/EN con 30 % más de largo sin desbordes; movimiento reducido verificado.
4. Capturas de referencia en 360, 768 y 1280 px.
Entrega un informe en Documentacion/informes/diseno-final.md con hallazgos, correcciones y propuestas descartadas. No cambies la identidad visual. Detente a esperar mi confirmación.
```

## 8. Definición de "hecho" para el diseño de una fase

- [ ] Se usó el flujo completo de la sección 4 en cada pantalla nueva.
- [ ] `07` y el código coinciden (si hubo cambio aprobado, está en el 07).
- [ ] Contrastes, lint de colores, `axe`, capturas y pseudo-localización en verde.
- [ ] Detector sin hallazgos nuevos.
- [ ] Probado con teclado y con movimiento reducido.
- [ ] Reporte de la fase con propuestas de la skill aplicadas y descartadas.

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| La skill empuja hacia un estilo más llamativo que el editorial elegido | Precedencia del 07 (sección 1); referencias a evitar escritas en `PRODUCT.md`; uso de `quieter`/`distill` |
| La herramienta del agente no soporta el *hook* o la skill | Detector manual y en CI; los prompts D1 a D5 funcionan igual |
| Cambios de versión de la skill | Fijar y anotar la versión; leer su registro de cambios antes de actualizar |
| Deriva de tokens (valores sueltos en el código) | Regla de lint y `normalize` en cada pantalla |
| Pantallas inconsistentes entre sí | `extract` al cierre de cada fase y página `/design` como referencia viva |

---

## Apéndice A · Contenido de `PRODUCT.md`

```markdown
# Zavia — Producto

## Qué es
Zavia es una aplicación web de finanzas personales para registrar ingresos y gastos, controlar presupuestos y saber si se llegará a una meta de ahorro mediante proyección con alertas. Automatiza lo repetitivo (recurrentes y suscripciones), explica los datos con observaciones basadas en reglas y fomenta el hábito con rachas y sellos.

## Para quién
- Principal: jóvenes profesionales y estudiantes en Perú que gestionan su dinero manualmente (soles y dólares).
- Secundario: reclutadores y equipos técnicos de bancos y fintech que evalúan el proyecto desde GitHub o un CV; entran por un modo demo sin registro en menos de 10 segundos.

## Personalidad de marca
Editorial, refinada, serena y precisa. Se lee como una publicación financiera personal, no como un panel de control. La tipografía es la protagonista; el color es muy contenido.

## Voz
Clara, directa y tranquila. Tuteo en español. Sin jerga innecesaria, sin exclamaciones en exceso, sin diminutivos, sin emojis como elementos de interfaz. Celebra con sobriedad.

## Principios de diseño
1. Tipografía primero: la jerarquía se construye con tamaño, peso y espacio.
2. Líneas, no cajas: filetes finos en vez de tarjetas y sombras.
3. Aire con propósito: pocas cosas por pantalla; lo secundario se revela al tocar.
4. Los números son protagonistas: cifras grandes, tabulares, con símbolo y decimales atenuados.
5. El color es información, no decoración.
6. Celebrar sin ruido: un momento breve y bien hecho (sellos), nunca confeti.

## Referencias a evitar (anti-referencias)
- Paneles SaaS genéricos de tarjetas con iconos y KPI de colores.
- Neobancos con degradados morado-azul, vidrio esmerilado y brillos.
- Estética cripto/oscura con halos de neón.
- Ilustraciones de stock y emojis como iconos.
- Gamificación infantil, con confeti multicolor y sonidos.

## Alcance visual
Solo tema claro. Móvil, tablet y escritorio, con enfoque mobile-first. Idiomas: español (por defecto) e inglés. Accesibilidad: WCAG 2.2 AA.
```

## Apéndice B · Contenido de `DESIGN.md`

```markdown
# Zavia — Sistema de diseño (resumen operativo)
Fuente completa: Documentacion/07-diseno-ui-ux.md (manda sobre este resumen).

## Color (solo claro; OKLCH es la fuente, hex equivalente)
Neutros cálidos: paper #F9F6F1 · surface #FEFCF9 · sunken #F1EEE7 · line #DEDAD3 · border-input #8F8C84
Tinta: ink #201914 · ink-muted #5C534D · ink-subtle #69625B
Acento (único): accent #005766 · accent-hover #004654 · accent-soft #DDF3F9 · on-accent #FBFAF7
Positivo: fg #206133 · soft #E1F5E4 · mark #4A925C
Atención: fg #785214 · soft #FDEFD2 · mark #AD7C1D
Negativo: fg #9E2E21 · soft #FFE9E4 · mark #C4493A
Gráficos: #11697A #AA5C40 #9C762F #4B8358 #516A91 #865582 · resto #89867F
Reglas: nunca #000 ni #fff; el botón primario es de tinta (ink), no de acento; estado = color + icono + texto.

## Tipografía
Display/títulos/cifras grandes: Newsreader 500. Interfaz y texto: Hanken Grotesk.
Escala: display 40–56 · h1 28–34 · h2 22–24 · h3 18 · body 16 · small 14 · label 12 (mayúsculas, +0.06em).
Cifras: lining + tabular siempre. Importes grandes con símbolo y decimales atenuados.
Texto corrido: máx. 68ch. Comillas tipográficas del idioma.

## Espacio y forma
Base 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96). Radios 6/10/16. Filetes de 1 px.
Sin sombras en tarjetas; una sombra suave solo en superficies flotantes.
Sin degradados, vidrio, brillos ni texturas. Iconos Lucide de 1.5 px.

## Responsive (mobile-first)
320–767 móvil (barra inferior) · 768–1023 tablet (riel 72 px) · 1024+ escritorio (barra lateral 248 px colapsable) · contenido máx. 1200 px.
Objetivos táctiles ≥ 44 px. Formularios: hoja inferior en móvil, diálogo en escritorio.

## Componentes clave
Botón primario de tinta · campo con etiqueta siempre visible · control segmentado · fila de movimiento con importe tabular · píldora de estado (icono + texto) · barra de progreso fina · estado vacío tipográfico · aviso con "Deshacer" 5 s · banner de demo.

## Movimiento
120/200/320 ms, easing cubic-bezier(0.2, 0, 0, 1), sin rebote. Solo opacity y transform.
Con prefers-reduced-motion: sin desplazamientos, conteos ni celebraciones animadas.
Celebración «sello»: ≈ 1.1 s, una a la vez, sin confeti ni sonido.

## Marca
Palabra «Zavia» en Newsreader + monograma «Z» en sello de doble filete.

## Prohibido
Degradados, vidrio, brillos, barras laterales de color en tarjetas, tres tarjetas con icono, rebotes, confeti, pasteles de más de 5 porciones, estados solo por color, tema oscuro, mayúsculas generalizadas.
```
