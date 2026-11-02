# Zavia — Sistema de diseño (resumen operativo)

Fuente completa: Documentacion/07-diseno-ui-ux.md (manda sobre este resumen).

## Colors

Solo tema claro; OKLCH es la fuente y hex su equivalente. Neutros cálidos: paper #F9F6F1, surface #FEFCF9, sunken #F1EEE7, line #DEDAD3, border-input #8F8C84. Tinta: ink #201914, ink-muted #5C534D, ink-subtle #69625B. Acento único: accent #005766, accent-hover #004654, accent-soft #DDF3F9, on-accent #FBFAF7. Positivo: fg #206133, soft #E1F5E4, mark #4A925C. Atención: fg #785214, soft #FDEFD2, mark #AD7C1D. Negativo: fg #9E2E21, soft #FFE9E4, mark #C4493A. Gráficos: #11697A #AA5C40 #9C762F #4B8358 #516A91 #865582; resto #89867F.

Reglas: nunca #000 ni #fff; el botón primario es de tinta, no de acento; estado = color + icono + texto.

## Typography

Display, títulos y cifras grandes: Newsreader 500. Interfaz y texto: Hanken Grotesk. Escala: display 40–56, h1 28–34, h2 22–24, h3 18, body 16, small 14, label 12 en mayúsculas con +0.06em. Cifras lining + tabular siempre. Texto corrido máximo 68ch.

## Espacio y forma

Base 4 px: 4, 8, 12, 16, 24, 32, 48, 64 y 96. Radios 6/10/16. Filetes de 1 px. Sin sombras en tarjetas; una sombra suave solo en superficies flotantes. Sin degradados, vidrio, brillos ni texturas. Iconos Lucide de 1.5 px.

## Responsive

Mobile-first: 320–767 móvil con barra inferior, 768–1023 tablet con riel de 72 px, 1024+ escritorio con barra lateral colapsable de 248 px. Contenido máximo 1200 px. Objetivos táctiles ≥ 44 px. Formularios: hoja inferior en móvil y diálogo en escritorio.

## Components

Botón primario de tinta, campo con etiqueta siempre visible, control segmentado, fila de movimiento con importe tabular, píldora de estado con icono y texto, barra de progreso fina, estado vacío tipográfico, aviso con «Deshacer» por 5 s y banner de demo.

## Movimiento

120/200/320 ms, easing cubic-bezier(0.2, 0, 0, 1), sin rebote y solo opacity/transform. Con prefers-reduced-motion no hay desplazamientos, conteos ni celebraciones animadas. La celebración de sello dura aproximadamente 1.1 s, una a la vez, sin confeti ni sonido.

## Marca

Palabra «Zavia» en Newsreader y monograma «Z» en sello de doble filete.

## Prohibido

Degradados, vidrio, brillos, barras laterales de color en tarjetas, tres tarjetas con icono, rebotes, confeti, pasteles de más de cinco porciones, estados solo por color, tema oscuro y mayúsculas generalizadas.
