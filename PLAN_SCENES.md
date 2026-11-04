# Plan: escenas y accesorios

Estado: el director de escenas está implementado (0.14.1); la capa de
accesorios es diseño propuesto, sin implementar.

## Objetivo

Que las animaciones de Clawd no se corten entre sí, y que agregar ropa o
accesorios (un gorro de Navidad, una bufanda) no obligue a crear moods nuevos
ni a editar los existentes.

## Director de escenas (hecho)

Antes, `view()` decidía la escena en cada tick sin recordar la anterior: el
baile y la cocina rotaban con el reloj global, y la lectura, la música, los
momentos y el festejo entraban y salían a mitad de un salteo o de una caída.

Ahora cada animación es una escena declarada en `SCENES` (`hooks/clawd.ts`):

| Campo | Uso |
| --- | --- |
| `place` | `walk` camina por la banda, `stand` se queda donde estaba, `home` en su lugar a la izquierda |
| `length` | Escenas finitas (momentos, festejo): se juegan enteras |
| `minTicks` | Lo mínimo que dura un bucle una vez que entra |
| `canLeave(s)` | Puntos limpios para ceder: fin del salteo, fin del paso de baile, sin sorbo a medias |
| `play(s)` | La pose a `s` ticks dentro de la escena |
| `exit` | Salida corta antes de la siguiente: cerrar el libro, quitarse los audífonos |

`want(ctx)` elige el bucle que pide el contexto (trabajar, leer, música, breaks,
dormir). Los momentos y el festejo llegan como eventos a una cola.

`hooks/director.ts` guarda la escena actual y decide cuándo cambiar:

1. Un bucle cede solo después de `minTicks` y en un punto `canLeave`.
2. Una escena finita se juega entera; los eventos que llegan esperan en cola
   (máx. 2, sin repetir). Un evento que espera más de `STALE_TICKS` se descarta.
3. Si la escena tiene `exit`, se juega antes de entrar la siguiente.
4. El trabajo retoma su línea donde la dejó, en el punto limpio en que cedió,
   para que la cocina siga apareciendo aunque lo interrumpan seguido.
5. La posición avanza solo en escenas que caminan y usa un ancho fijo, así que
   no salta al sacar o guardar la sartén.
6. Un prompt nuevo corta el festejo o el momento en curso y vacía la cola.

`view()` sigue existiendo sin memoria para las pruebas y `scripts/preview.ts`;
`node scripts/preview.ts cambios` reproduce el director en un turno inventado.

Este registro es la etapa 2 de `PLAN_MOODS.md`: si se implementan las
variantes, se declaran como escenas.

## Capa de accesorios (propuesta)

Un accesorio se dibuja como una capa sobre la pose, anclado a la cabeza o al
cuerpo, sin tocar las escenas.

- **Anclas en las poses.** Cada pose expone dónde está la cabeza: `up` por
  defecto (fila sobre las columnas de Clawd); solo las excepciones lo declaran:
  `sunk` (cabeza medio cuadro abajo: respiración del cariño, al tambalearse en
  el mareo) y `down` (de cabeza, `FALLEN`). Las poses nuevas heredan `up`.
- **El accesorio se declara una vez:** `{ id, slot, pixels, when }`. El dibujo
  usa `quarters()`; la versión `sunk` se obtiene bajando el dibujo un píxel
  (medio cuadro). En `down` se oculta o cae al suelo junto a Clawd.
- **Ranuras.** `head`, `eyes`, `neck`. Las escenas que ya ocupan una declaran
  `covers` (los audífonos `head`, las gafas `eyes`); mientras duran, manda el
  objeto de la escena y el accesorio se esconde.
- **Pintado.** En `hooks/desks.ts`, después del cuerpo, siguiendo `x + dx`;
  acompaña el caminar y el balanceo sin código extra.
- **Activación.** Por fecha (el gorro en diciembre) u opción de `userConfig`.

Primer accesorio: gorro de Navidad, rojo con borde y pompón blancos, siguiendo
el estilo de `AGENTS.md`: pocos colores, silueta clara, bloques y cuartos de
celda.

## Verificación pendiente

- Sesión real: trabajar con lecturas, comandos largos, tests y commits; ver que
  no hay cortes ni saltos, y la convivencia con image-preview.
- Se mantiene un salto ya existente: al terminar el turno Clawd festeja en su
  lugar a la izquierda (`home`), venga de donde venga.
