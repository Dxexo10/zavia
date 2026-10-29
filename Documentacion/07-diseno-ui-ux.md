# 07 · Diseño UI/UX — Zavia

> Estado: BORRADOR v0.3 (paleta y logo aprobados por el autor) · Este documento es la fuente de verdad visual. Alimenta el `PRODUCT.md` y el `DESIGN.md` de la skill *impeccable* (documento 08) y los tokens de Tailwind.
> Decisiones del autor: personalidad **editorial y refinada** (la tipografía es la protagonista, color muy contenido), **solo tema claro**, y **animación celebratoria breve y expresiva** para logros y metas cumplidas.
> Los valores de color fueron **calculados y sus contrastes verificados** (WCAG); no se deben "ajustar a ojo" sin repetir la verificación.

## 1. Idea de diseño

**Zavia se lee como una publicación financiera personal, no como un panel de control.** Una página de papel cálido, tinta oscura, líneas finas y números tratados como tipografía. El color es escaso: una sola tinta de acento y tres tonos semánticos apagados. La expresividad se reserva para los momentos que la merecen (cumplir una meta, desbloquear un sello), no para el resto de la interfaz.

| Principio | Qué significa en la práctica |
|-----------|------------------------------|
| **Tipografía primero** | La jerarquía se construye con tamaño, peso y espacio, no con cajas de colores ni sombras |
| **Líneas, no cajas** | Secciones separadas por filetes finos (como en un periódico); tarjetas solo cuando agrupan algo accionable |
| **Aire con propósito** | Pocas cosas por pantalla; lo secundario se revela al tocar |
| **Los números son protagonistas** | Cifras grandes, alineadas y legibles; el símbolo y los decimales se atenúan |
| **Color = información** | El color aparece solo para acento interactivo y estados; nunca decora |
| **Celebrar sin ruido** | Un momento breve y bien hecho (sellos), nunca confeti multicolor |

**No es:** un dashboard SaaS genérico de tarjetas con iconos, degradados morados, brillos ni vidrio esmerilado.

## 2. Tipografía

| Rol | Fuente | Uso |
|-----|--------|-----|
| **Display / títulos / cifras grandes** | **Newsreader** (serif editorial con tamaño óptico) | Títulos, saldo total, cifras destacadas, nombre de la meta, celebraciones |
| **Interfaz y texto** | **Hanken Grotesk** (sans-serif humanista) | Cuerpo, formularios, botones, tablas, navegación, cifras de listas |
| *Alternativa si falta soporte* | Source Serif 4 + Figtree | Solo si las fuentes principales no cumplen la verificación siguiente |

🔎 **Verificación obligatoria al implementar:** confirmar que ambas fuentes incluyen tildes, ñ, `¿ ¡` y guiones tipográficos, y que soportan **cifras tabulares y de caja alta** (`tnum`, `lnum`). Si alguna no las soporta, usar la alternativa. Las fuentes se cargan con `next/font` (alojadas en el propio sitio, sin peticiones a terceros: RNF-066) con `font-display: swap` y subconjunto latino.

**Escala** (relación ≈ 1.25, fluida con `clamp`):

| Token | Tamaño | Altura de línea | Fuente / peso | Uso |
|-------|--------|-----------------|---------------|-----|
| `display` | 40–56 px | 1.05 | Newsreader 500 | Saldo total, momentos de celebración |
| `h1` | 28–34 px | 1.15 | Newsreader 500 | Título de pantalla |
| `h2` | 22–24 px | 1.25 | Newsreader 500 | Título de sección |
| `h3` | 18 px | 1.3 | Hanken Grotesk 600 | Subsección, título de tarjeta |
| `body` | **16 px** | 1.5 | Hanken Grotesk 400 | Texto general (16 px evita el zoom automático de iOS en campos) |
| `small` | 14 px | 1.45 | Hanken Grotesk 400 | Texto secundario |
| `label` | 12 px | 1.3 | Hanken Grotesk 600, mayúsculas, espaciado +0.06em | Etiquetas de sección (estilo editorial: `METAS`, `PRESUPUESTOS`) |
| `figure` | 16–20 px | 1.2 | Hanken Grotesk 500, `tnum` | Importes en listas y tablas |

Reglas:
- Longitud de línea del texto corrido: 60–75 caracteres (`max-width: 68ch`).
- Cifras siempre con `font-variant-numeric: lining-nums tabular-nums` para que las columnas alineen.
- Los importes grandes separan visualmente el símbolo y los decimales: `S/` y `.50` en tono atenuado y menor tamaño, la parte entera en tamaño completo. El elemento lleva `aria-label` con el importe completo, para que el lector de pantalla no lo lea fragmentado.
- Comillas tipográficas del idioma («…» en español, “…” en inglés) y apóstrofo ’.
- Sin texto justificado, sin todo en mayúsculas salvo `label`, sin cursiva decorativa en el cuerpo.

## 2.1 Identidad de marca

**Logo = palabra + monograma en sello**, coherente con los «sellos» de logros (sección 8.1).

| Pieza | Especificación |
|-------|----------------|
| **Palabra** | «Zavia» en Newsreader 500, minúsculas y mayúscula inicial (no todo en mayúsculas), espaciado −0.01 em, color `ink` |
| **Monograma** | La «Z» de Newsreader 500 centrada dentro de un **sello**: círculo con **doble filete** (anillo exterior de 1.5 px y anillo interior de 0.75 px, separados por una distancia igual al 6 % del diámetro) |
| **Composición (lockup)** | Sello a la izquierda y palabra a la derecha, alineados por la línea base del texto; el diámetro del sello = 1.6 × la altura de las mayúsculas |
| **Variantes** | (1) Tinta sobre papel (principal); (2) fondo `accent` con sello y «Z» en `on-accent` (icono de aplicación); (3) solo palabra (espacios estrechos) |
| **Tamaños mínimos** | Lockup ≥ 96 px de ancho; sello solo ≥ 24 px. Por debajo de 24 px (favicon de 16 px) se usa la versión simplificada: **un solo anillo** y la «Z» más gruesa |
| **Espacio libre** | Alrededor del logo, al menos media altura de la «Z» |
| **Prohibido** | Rotarlo, aplicarle degradados, sombras o brillos, recolorearlo fuera de los tokens, estirarlo o ponerlo sobre fotos |

**Entregables de marca** (en `public/brand/`, vectoriales; el texto convertido a **trazados** para no depender de la fuente):
`zavia-lockup.svg`, `zavia-wordmark.svg`, `zavia-seal.svg`, `favicon.svg` (más `favicon.ico` y `apple-touch-icon.png`), e `og-image.png` (1200 × 630: lockup grande sobre `paper`, una frase editorial y el filete, **sin capturas de pantalla ni degradados**). La imagen Open Graph importa: es lo que se ve cuando se comparte el enlace desde el CV o LinkedIn.

## 3. Color (solo tema claro)

Definidos en **OKLCH** (fuente de verdad) con su equivalente hexadecimal. Los contrastes están calculados.

### 3.1 Neutros: papel y tinta (tintados hacia el cálido, nunca negro ni blanco puro)

| Token | OKLCH | Hex | Uso |
|-------|-------|-----|-----|
| `paper` | 0.975 0.008 85 | `#F9F6F1` | Fondo de la aplicación |
| `surface` | 0.992 0.005 85 | `#FEFCF9` | Tarjetas, hojas, diálogos |
| `sunken` | 0.950 0.010 85 | `#F1EEE7` | Campos deshabilitados, zonas hundidas, fondos de esqueleto |
| `line` | 0.890 0.010 85 | `#DEDAD3` | Filetes y separadores decorativos |
| `border-input` | 0.640 0.012 85 | `#8F8C84` | Borde de campos y controles (3.1:1 sobre papel, cumple 1.4.11) |
| `ink` | 0.220 0.015 60 | `#201914` | Texto principal |
| `ink-muted` | 0.450 0.015 60 | `#5C534D` | Texto secundario |
| `ink-subtle` | 0.500 0.014 60 | `#69625B` | Marcadores de posición, ayudas |

### 3.2 Acento: tinta azul petróleo (único color de marca)

| Token | OKLCH | Hex | Uso |
|-------|-------|-----|-----|
| `accent` | 0.420 0.075 215 | `#005766` | Enlaces, foco, elemento activo de navegación, series de gráficos |
| `accent-hover` | 0.360 0.070 215 | `#004654` | Estado hover/presionado |
| `accent-soft` | 0.950 0.025 215 | `#DDF3F9` | Fondo suave de selección y chips activos |
| `on-accent` | 0.985 0.004 85 | `#FBFAF7` | Texto sobre acento |

Los **botones primarios usan tinta (`ink`)**, no el acento, para que la interfaz no se vea "azul de banco": el acento queda para lo interactivo secundario, el foco y los datos.

### 3.3 Semánticos apagados (estado = color + icono + texto, siempre; RNF-036)

| Estado | Texto `fg` | Fondo `soft` | Marca gráfica `mark` | Se usa para |
|--------|-----------|--------------|----------------------|-------------|
| Positivo / en camino | `#206133` | `#E1F5E4` | `#4A925C` | Meta en verde, presupuesto normal, logros |
| Atención / en riesgo | `#785214` | `#FDEFD2` | `#AD7C1D` | Meta en ámbar, presupuesto cercano al límite |
| Negativo / retrasado | `#9E2E21` | `#FFE9E4` | `#C4493A` | Meta en rojo, presupuesto excedido, errores |

OKLCH: positivo `fg 0.44 0.10 150`, `soft 0.95 0.03 150`, `mark 0.60 0.11 150`; atención `fg 0.47 0.09 75`, `soft 0.955 0.04 85`, `mark 0.62 0.12 78`; negativo `fg 0.47 0.15 30`, `soft 0.955 0.03 30`, `mark 0.57 0.16 30`.

### 3.4 Verificación de contraste (resultados calculados)

| Combinación | Ratio | Exigencia | Resultado |
|-------------|-------|-----------|-----------|
| `ink` sobre `paper` / `surface` | 16.1 / 16.9 | 4.5 | ✔ |
| `ink-muted` sobre `paper` / `sunken` | 7.0 / 6.5 | 4.5 | ✔ |
| `ink-subtle` sobre `paper` / `surface` | 5.6 / 5.9 | 4.5 | ✔ |
| `accent` sobre `paper` / `accent-soft` | 7.6 / 7.2 | 4.5 | ✔ |
| `on-accent` sobre `accent` | 7.9 | 4.5 | ✔ |
| `fg` positivo / atención / negativo sobre su `soft` | 6.5 / 6.1 / 6.3 | 4.5 | ✔ |
| `fg` de los tres sobre `paper` | 6.9 / 6.5 / 6.8 | 4.5 | ✔ |
| `border-input` sobre `paper` | 3.1 | 3.0 | ✔ |
| `mark` positivo / atención / negativo sobre `paper` | 3.5 / 3.4 / 4.5 | 3.0 | ✔ |

Una prueba automática recalcula estos ratios a partir de los tokens y falla si alguno baja del umbral (RNF-034).

### 3.5 Paleta de gráficos

| Token | Hex | Uso |
|-------|-----|-----|
| `chart-1` | `#11697A` | Serie principal (ingresos, ahorro real) |
| `chart-2` | `#AA5C40` | Segunda serie (arcilla) |
| `chart-3` | `#9C762F` | Tercera (ocre) |
| `chart-4` | `#4B8358` | Cuarta (salvia) |
| `chart-5` | `#516A91` | Quinta (pizarra) |
| `chart-6` | `#865582` | Sexta (ciruela) |
| `chart-rest` | `#89867F` | "Otras" y agrupaciones |

Todos ≥ 3:1 sobre `surface`. **Reglas de gráficos:** máximo 5 categorías individuales + "Otras" (nunca un donut de 10 rebanadas); etiquetas **directas** en vez de leyendas lejanas; en gráficos de líneas, la segunda serie va con trazo distinto (discontinuo) para no depender del color; los gastos del mes se presentan como **lista ordenada con barras finas**, no como pastel.

### 3.5.1 Tokens en CSS (referencia; mapear a Tailwind según la versión vigente 🔎)

```css
:root {
  color-scheme: light;
  --paper: #F9F6F1;  --surface: #FEFCF9;  --sunken: #F1EEE7;
  --line: #DEDAD3;   --border-input: #8F8C84;
  --ink: #201914;    --ink-muted: #5C534D;  --ink-subtle: #69625B;
  --accent: #005766; --accent-hover: #004654; --accent-soft: #DDF3F9; --on-accent: #FBFAF7;
  --pos-fg: #206133; --pos-soft: #E1F5E4; --pos-mark: #4A925C;
  --warn-fg: #785214; --warn-soft: #FDEFD2; --warn-mark: #AD7C1D;
  --neg-fg: #9E2E21; --neg-soft: #FFE9E4; --neg-mark: #C4493A;
  --chart-1: #11697A; --chart-2: #AA5C40; --chart-3: #9C762F;
  --chart-4: #4B8358; --chart-5: #516A91; --chart-6: #865582; --chart-rest: #89867F;
  --focus-ring: 0 0 0 2px var(--paper), 0 0 0 4px var(--accent);
}
```

Prohibido en el código: `#000`, `#fff` y colores escritos a mano fuera de estos tokens (regla de lint).

## 4. Espaciado, forma y profundidad

| Elemento | Regla |
|----------|-------|
| Unidad base | 4 px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Radios | `sm` 6 px (campos, chips), `md` 10 px (tarjetas, botones), `lg` 16 px (hojas inferiores, diálogos). Sin píldoras gigantes en todo |
| Bordes | Filetes de 1 px (`line`). Los controles interactivos usan `border-input` |
| Sombras | **Ninguna** en tarjetas. Solo una sombra difusa y baja en superficies flotantes (hoja, menú, toast) |
| Fondos | Planos. **Sin degradados, sin vidrio esmerilado, sin brillos, sin textura de ruido** (peso visual y de rendimiento) |
| Iconos | Lucide, contorno 1.5 px, tamaño 20 px (16 px en línea con texto); siempre acompañan a texto en estados |
| Ilustraciones | Ninguna. Los estados vacíos son **tipográficos** (una frase editorial + una acción) |

## 5. Diseño responsivo (mobile-first)

| Punto de corte | Ancho | Dispositivo | Navegación | Márgenes laterales |
|----------------|-------|-------------|-----------|--------------------|
| base | 320–767 | Móvil | Barra inferior (5 destinos) | 16 px |
| `md` | 768–1023 | Tablet | Riel de iconos lateral (72 px) | 24 px |
| `lg` | 1024–1279 | Escritorio | Barra lateral completa (248 px), colapsable a riel (RF-025) | 32 px |
| `xl` | ≥ 1280 | Escritorio amplio | Igual; el contenido se centra con ancho máximo 1200 px | 32 px |

- **Barra inferior móvil:** Inicio · Movimientos · **+ Registrar** (central) · Metas · Más (presupuestos, suscripciones, insights, sellos, ajustes). Respeta el área segura (`env(safe-area-inset-bottom)`). Altura 64 px + área segura.
- **Formularios:** en móvil se abren como **hoja inferior** que ocupa hasta el 92 % de la altura, con el teclado nunca tapando el campo activo; en tablet y escritorio, como **diálogo centrado** (máx. 480 px) o panel lateral.
- **Tablas → tarjetas:** las listas de movimientos son filas compactas en móvil; en escritorio muestran columnas alineadas.
- **Tablet:** contenido en dos columnas; en horizontal se mantiene el riel lateral.
- **Zonas táctiles:** mínimo 44 × 44 px (RNF-038); separación ≥ 8 px entre objetivos.
- **Zoom y texto:** usable con texto ampliado al 200 % sin pérdida de contenido ni desplazamiento horizontal desde 320 px.
- Sin comportamientos que dependan de `hover`: todo lo que se revela al pasar el cursor tiene equivalente táctil y de teclado.

## 6. Componentes

Todos con estados: **normal, hover, foco visible, presionado, deshabilitado, cargando, error**. El foco usa `--focus-ring`, nunca se elimina el contorno sin reemplazo.

| Componente | Especificación |
|------------|----------------|
| **Botón primario** | Fondo `ink`, texto `paper`, alto mín. 44 px, radio `md`. Hover: aclara ligeramente |
| **Botón secundario** | Contorno `border-input`, texto `ink`, fondo transparente |
| **Botón fantasma** | Solo texto con `accent`; subrayado al foco |
| **Botón destructivo** | Contorno y texto `neg-fg`; la confirmación es un paso aparte |
| **Campo de texto** | Etiqueta **siempre visible** sobre el campo (nunca solo marcador de posición), borde `border-input`, error en `neg-fg` con icono y texto; `autocomplete` y `inputmode` correctos |
| **Campo de importe** | `inputmode="decimal"`, cifra grande en Newsreader, símbolo de moneda fijo a la izquierda; admite punto o coma al escribir y normaliza |
| **Control segmentado** | Ingreso / Gasto; el seleccionado con fondo `accent-soft` y texto `accent` |
| **Selector de categoría** | Fichas (chips) con las más usadas primero; "Ver todas" abre lista con búsqueda |
| **Selector de fecha** | Atajos `Hoy`, `Ayer`, `Otra fecha…`; el calendario respeta RN-004 |
| **Fila de movimiento** | Descripción y categoría a la izquierda, importe tabular a la derecha (`ink` para gastos, `pos-fg` para ingresos, precedido de `+` / `−`), fecha agrupada por día con encabezado `label` |
| **Píldora de estado** | Fondo `soft`, texto `fg`, **icono + texto** (ej. «En camino», «En riesgo», «Retrasada»). Nunca solo color |
| **Barra de progreso (presupuesto)** | Pista `line`, relleno con `mark` del nivel; texto «S/ 410 de S/ 500» y porcentaje |
| **Tarjeta de meta** | Nombre (h3), píldora de estado, ahorrado/objetivo, fecha proyectada vs. límite en lenguaje natural, aporte necesario por mes |
| **Cifra destacada (Stat)** | `label` arriba, cifra `display` o `figure`, variación opcional con flecha y texto |
| **Estado vacío** | Frase editorial de una o dos líneas, explicación breve y una acción primaria. Sin ilustración |
| **Esqueleto** | Bloques `sunken` con la forma del contenido; sin destello animado (reducen movimiento) |
| **Aviso (toast)** | Superficie flotante con mensaje y acción **Deshacer** durante 5 s (RF-040); `role="status"`; no bloquea |
| **Hoja inferior / diálogo** | Atrapa el foco, se cierra con `Esc` y con gesto de arrastrar; el foco vuelve al disparador |
| **Navegación** | Elemento activo con texto `accent` y filete inferior (móvil) o marca a la izquierda (escritorio); **no** una barra de color lateral gruesa |
| **Banner de demo** | Franja delgada superior en `sunken`: «Modo demo · No ingreses datos reales · Crear cuenta». Siempre visible (RNF-031) |
| **Botón «Continuar con Google»** | Sigue las **pautas de marca de Google** (variante neutral/clara): es el **único elemento con color de terceros** permitido (su logotipo). Alto mín. 44 px, texto en el idioma activo 🔎 |
| **Selector de idioma** | `ES · EN`, texto simple, en acceso y ajustes |
| **Recorrido guiado** | Máx. 4 pasos con globos anclados; omitible; repetible desde ayuda (RF-041) |

## 7. Pantallas

Orden de contenido en móvil; en pantallas mayores se redistribuye en columnas sin cambiar la jerarquía.

| Pantalla | Contenido (en orden) | Notas por tamaño | RF |
|----------|---------------------|------------------|----|
| **Acceso** | Titular editorial en serif; **bloque "Probar demo"** (nombre, apellido, un botón) como acción principal; debajo, el botón «Continuar con Google»; selector de idioma | Escritorio: panel editorial a la izquierda y formularios a la derecha. Móvil: demo primero | RF-001, 028 |
| **Dashboard** | Selector de mes (texto «Octubre 2026 ▾») → **saldo total** (`display`) → fila Ingresos · Gastos · Balance → Metas → Presupuestos → Gasto por categoría → Tendencia 6 meses → Insights → Últimos movimientos | Móvil: una columna, metas en carrusel horizontal con ajuste. Tablet: 2 columnas. Escritorio: cuadrícula de 12 columnas, lectura en "Z" | RF-020 a 022 |
| **Registrar movimiento** | Importe grande → Ingreso/Gasto → Cuenta → Categoría (fichas) → Fecha (atajos) → Descripción → Guardar | Hoja inferior en móvil; diálogo en escritorio. **≤ 3 interacciones** para un gasto típico (RF-007, OBJ-01): importe, categoría, Guardar, con cuenta y fecha precargadas | RF-007, 010 |
| **Movimientos** | Búsqueda → filtros activos como fichas → lista agrupada por día → paginación | Filtros en hoja inferior (móvil) o barra superior (escritorio). Acción de deslizar para eliminar con alternativa en menú; siempre con «Deshacer» | RF-008, 009, 011, 012 |
| **Cuentas** | Saldo total → lista de cuentas con saldo y moneda → archivadas (colapsado) | | RF-006, 023 |
| **Metas** | Lista de metas con estado → detalle: cifra grande, **gráfico de proyección** (ahorro real, trayectoria proyectada discontinua, marca de la fecha límite, línea del ritmo necesario) con tabla alternativa → historial de aportes → «Aportar» | El mensaje clave siempre en lenguaje natural: «Al ritmo actual llegarás en marzo de 2027, un mes después de tu fecha límite. Necesitas S/ 62.50 más por mes.» | RF-014 a 017 |
| **Presupuestos** | Mes → lista de categorías con barra y estado | | RF-018, 019 |
| **Suscripciones** | Total mensual comprometido (`display`) → próximos 30 días → lista con pausar/cancelar | | RF-030 a 032 |
| **Insights** | Lista priorizada por gravedad; cada uno con explicación, datos y acción; descartar | | RF-033, 034 |
| **Sellos (logros y racha)** | Racha actual (cifra grande) → colección de sellos: desbloqueados a color, bloqueados en `line` con qué falta | | RF-035 a 037 |
| **Ajustes** | Perfil, idioma, tipo de cambio, preferencias, importar/exportar, eliminar cuenta (deshabilitado en demo, con explicación) | | RF-005, 023, 024 |
| **Onboarding** | Recorrido de 4 pasos; en cuentas reales, asistente para crear primera cuenta y primera meta | | RF-041 |
| **404 / 500 / sin conexión** | Mensaje editorial breve en ambos idiomas y acción de volver | | RNF-063 |

### 7.1 Esbozos de referencia

Dashboard en móvil (una columna):

```
┌──────────────────────────────┐
│ Modo demo · No ingreses datos│  ← franja delgada
│ reales · Crear cuenta        │
├──────────────────────────────┤
│ Octubre 2026 ▾         ES·EN │
│                              │
│ SALDO TOTAL                  │
│ S/ 12,450 .50                │  ← display (Newsreader)
│ ──────────────────────────── │
│ INGRESOS   GASTOS   BALANCE  │
│ S/ 4,200   S/ 2,870 S/ 1,330 │
│ ──────────────────────────── │
│ METAS                    Ver │
│ ‹ Fondo de emergencia  ›     │
│   ● En camino · S/ 3,600     │
│ ──────────────────────────── │
│ PRESUPUESTOS                 │
│ Alimentación  ▓▓▓▓▓▓░░  70%  │
│ ...                          │
├──────────────────────────────┤
│ Inicio  Mov.   ＋  Metas  Más│  ← barra inferior
└──────────────────────────────┘
```

Registrar movimiento (hoja inferior):

```
┌──────────────────────────────┐
│ ───                          │
│ Nuevo movimiento             │
│ [ Gasto | Ingreso ]          │
│                              │
│ S/  45 .00                   │  ← cifra grande, teclado numérico
│                              │
│ Categoría                    │
│ (Alimentación)(Transporte)…  │
│ Cuenta: Efectivo ▾           │
│ Fecha:  (Hoy)(Ayer)(Otra…)   │
│ Descripción (opcional)       │
│                              │
│ [        Guardar          ]  │
└──────────────────────────────┘
```

## 8. Movimiento y animación

| Token | Valor | Uso |
|-------|-------|-----|
| `motion-micro` | 120 ms | Hover, foco, presionado |
| `motion-base` | 200 ms | Aparición de componentes, cambio de pestaña |
| `motion-emphasis` | 320 ms | Hojas, diálogos, transiciones de pantalla |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Todo. **Sin rebote ni elasticidad** |

- Solo se animan `opacity` y `transform` (rendimiento, RNF-001).
- **Cifras:** al cargar el dashboard, el saldo total y la fila de resumen cuentan hasta su valor en 600 ms, solo en la primera carga de la sesión.
- **UI optimista:** el movimiento aparece de inmediato en la lista con una entrada de 200 ms; si falla, se retira con aviso (RF-040).
- **Con `prefers-reduced-motion`:** se eliminan desplazamientos, conteos y celebraciones animadas; quedan cambios de opacidad instantáneos y el contenido final estático (RNF-037).

### 8.1 Celebración: los «sellos»

Los logros se conceptualizan como **sellos**, como los de un pasaporte o un sello postal: círculo de doble filete, un glifo o numeral al centro y el nombre del logro en la tipografía serif. Es el recurso expresivo propio de Zavia, en lugar del confeti genérico.

**Secuencia (≈ 1.1 s, una sola vez por desbloqueo):**
1. **0–120 ms:** el resto de la pantalla se atenúa ligeramente (velo `ink` al 8 %).
2. **120–420 ms:** el sello entra desde un 115 % de tamaño y una leve rotación (−6°) hasta posarse al 100 % y 0°, con `ease-standard` (sin rebote), como un sello que se estampa.
3. **300–800 ms:** 12 filetes finos radiales salen del sello y se desvanecen (color `accent` y `ink`; sin partículas de colores).
4. **420–900 ms:** el nombre del logro aparece debajo en Newsreader (`h2`), y el filete inferior se dibuja de izquierda a derecha.
5. **Meta cumplida:** además, la cifra del objetivo cuenta hasta su valor («S/ 6,000») y aparece la frase «Lo lograste».
6. **≈ 1.1 s:** el velo se retira; queda un aviso persistente en el perfil. Un toque en cualquier parte lo cierra antes.

Reglas: no bloquea la interacción más de lo que dura; **nunca más de una celebración a la vez** (se encolan, y si hay varias se muestran en un solo aviso resumen); sin sonido; el sello se anuncia a lectores de pantalla con `role="status"` y texto («Desbloqueaste el sello Siete días»). Con movimiento reducido: el sello aparece con un cambio de opacidad y sin radiales.

**Catálogo visual de sellos:**

| Clave | Español | Inglés | Glifo propuesto |
|-------|---------|--------|-----------------|
| `first_transaction` | Primer registro | First entry | Pluma |
| `first_goal_created` | Primera meta | First goal | Bandera |
| `first_goal_completed` | Meta cumplida | Goal reached | Marca de verificación en doble círculo |
| `streak_7` | Siete días | Seven days | Numeral «7» |
| `streak_30` | Treinta días | Thirty days | Numeral «30» |
| `month_within_budget` | Mes en equilibrio | Balanced month | Balanza |
| `first_subscription` | Suscripciones a la vista | Subscriptions in view | Calendario |
| `tx_100` | Cien registros | One hundred entries | Numeral «100» |

## 9. Voz y textos (microcopia)

- **Tono:** sereno, claro y directo; sin jerga financiera innecesaria ni exclamaciones en exceso. En español se usa **tuteo** («Registra tu primer movimiento»); en inglés, segunda persona sencilla. Moneda siempre como `S/` y `US$`.
- **Humano, no infantil:** los logros se celebran con sobriedad («Lo lograste»), no con diminutivos ni exceso de emojis (no se usan emojis como elementos de interfaz).
- **Longitud:** el inglés y el español difieren hasta ±30 %; ningún componente tiene ancho fijo para texto (RNF-044 a 047).

| Situación | Español | Inglés |
|-----------|---------|--------|
| Estado vacío de movimientos | «Aún no hay movimientos. Registra el primero y empieza a ver tu mes con claridad.» | “No entries yet. Add your first one and start seeing your month clearly.” |
| Error genérico | «No pudimos guardar el cambio. Revisa tu conexión e inténtalo de nuevo.» | “We couldn’t save that change. Check your connection and try again.” |
| Acceso con Google cancelado o fallido | «No pudimos completar el acceso con Google. Inténtalo de nuevo o prueba el demo.» | “We couldn’t complete sign-in with Google. Try again or try the demo.” |
| Meta en riesgo | «Al ritmo actual llegarás en {fecha}, {n} {unidad} después de tu fecha límite. Necesitas {monto} más por mes.» | “At your current pace you’ll arrive in {date}, {n} {unit} after your deadline. You need {amount} more per month.” |
| Presupuesto excedido | «Superaste tu presupuesto de {categoría} por {monto}.» | “You’ve gone over your {category} budget by {amount}.” |
| Meta cumplida | «Lo lograste: {monto} para «{meta}».» | “You did it: {amount} for “{goal}”.” |
| Eliminado | «Movimiento eliminado.» + acción «Deshacer» | “Entry deleted.” + “Undo” |
| Banner demo | «Modo demo · No ingreses datos reales · Crear cuenta» | “Demo mode · Don’t enter real data · Create account” |

## 10. Accesibilidad (cumplimiento de RNF-033 a RNF-038)

- **WCAG 2.2 AA** en las pantallas principales; revisión con `axe` automatizado y recorrido manual por teclado.
- Contrastes verificados (sección 3.4). El color nunca es el único portador de información.
- **Teclado:** orden de foco lógico, foco visible, enlace «Saltar al contenido», sin trampas de foco (los diálogos devuelven el foco al disparador).
- **Estructura:** un solo `h1` por pantalla, jerarquía sin saltos, regiones (`header`, `nav`, `main`) etiquetadas, `lang` según el idioma activo.
- **Formularios:** etiqueta asociada a cada campo, errores vinculados con `aria-describedby`, resumen de errores al enviar.
- **Gráficos:** cada uno con título, descripción corta y **tabla de datos alternativa** (RF-021).
- **Anuncios dinámicos:** avisos y sellos con `aria-live="polite"`.
- **Movimiento:** respeta `prefers-reduced-motion` (sección 8).
- **Atajos de teclado en escritorio (*Could*):** `N` nuevo movimiento, `/` buscar, `?` ayuda de atajos; nunca son la única vía.

## 11. Lo que Zavia **no** hace visualmente (anti-patrones)

El detector de la skill *impeccable* y la revisión de cada fase comprueban que no aparezcan:

1. Degradados (en especial morado-azul), vidrio esmerilado, brillos o halos oscuros.
2. Tarjetas con barra de color en un solo lado o sombras pesadas.
3. Cuadrícula de «tres tarjetas con icono» para explicar funciones.
4. Animaciones con rebote o elásticas; confeti multicolor.
5. `#000` y `#fff` puros; colores fuera de los tokens (**única excepción:** el logotipo de Google en su botón, según sus pautas de marca 🔎).
6. Emojis como iconos de interfaz; ilustraciones de stock.
7. Gráficos de pastel con más de 5 porciones; leyendas separadas del dato.
8. Estados comunicados solo por color.
9. Tema oscuro (fuera del alcance de esta versión; RF-027 queda descartado o diferido).
10. Texto en mayúsculas generalizado y exceso de pesos tipográficos.

## 12. Entregables de diseño y verificación

- **Tokens** en CSS y Tailwind (sección 3.5.1) con una prueba que recalcula los contrastes.
- **Componentes** documentados en una página interna `/design` (solo desarrollo) con todos sus estados en móvil, tablet y escritorio.
- **Capturas de referencia** por pantalla y tamaño con Playwright (documento 10) para detectar cambios visuales no deseados.
- **Revisión por fase** con los comandos de la skill (documento 08): `critique`, `audit` y `polish` antes de cerrar cada fase.

## 13. Cambios que este documento impone a otros

| Documento | Cambio |
|-----------|--------|
| `01` | **RF-027 (tema claro/oscuro) se descarta**: el autor eligió solo tema claro. RF-037 incorpora la celebración «sello» descrita en 8.1. Se actualizan los conteos de prioridades |
| `02` | RNF-034 se verifica con la prueba de contrastes de la sección 3.4 |
| `05` | `next/font` para Newsreader y Hanken Grotesk; Lucide para iconos |
