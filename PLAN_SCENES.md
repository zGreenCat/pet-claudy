# Plan: escenas y accesorios

Estado: el director de escenas (0.14.1) y la capa de accesorios con el gorro
de Navidad (0.15.0) están implementados.

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

## Capa de accesorios (hecho)

Un accesorio se dibuja como marcas sobre la pose, sin tocar las escenas
(`hooks/accessories.ts`).

- **La cabeza se lee del frame.** `headOf()` en `hooks/clawd.ts` devuelve `up`,
  `sunk` (fila de arriba en medias celdas: respiración del cariño, tambaleo del
  mareo) o `down` (patas en la fila de arriba: `FALLEN`). Ninguna pose lo
  declara; las nuevas funcionan solas mientras sigan esos patrones.
- **Escenas que tapan la cabeza.** `coversHead` en la escena (música, con su
  salida, e idea por el foco): `View.head` queda sin definir y no se dibuja nada.
- **El accesorio se dibuja una vez, en píxeles,** para la cabeza arriba:
  `{ id, colors, pixels }`, dos píxeles por celda en cada sentido, columnas
  desde el borde izquierdo de Clawd. `sunk` es el mismo dibujo un píxel más
  abajo; `down`, el dibujo dado vuelta en el suelo, una celda a la derecha
  de Clawd.
- **Mezcla con el cuerpo.** Donde el accesorio cae sobre una celda del cuerpo
  naranja, se mezclan sus píxeles; si cae sobre un glifo de la escena (un ojo,
  el cigarro, la taza), la celda es de la escena. Una celda con más colores de
  los que caben pierde sus píxeles más raros. `dress()` pone el resultado
  debajo de las marcas de la escena, así que chispas y estrellas pasan encima.
- **Activación.** `userConfig.hat`: `diciembre` (por defecto), `siempre` o
  `nunca`; también con `/clawd-mood gorro <opción>`.
- **Diseño.** El taller de píxeles (artifact) dibuja con las mismas reglas de
  celda y exporta JSON; de su capa de accesorio salen los `pixels`.

El gorro: borde blanco y copa roja sobre la cabeza, la punta cayendo por la
derecha hasta un pompón blanco junto a la cabeza.

Siguientes ideas: más ranuras (`eyes`, `neck`) cuando haya un accesorio que
las use, y el gorro en la escena de escritorios, donde hoy la fila de arriba
la ocupa la línea de Clawd.

## Verificación pendiente

- Sesión real: trabajar con lecturas, comandos largos, tests y commits; ver que
  no hay cortes ni saltos, y la convivencia con image-preview.
- Se mantiene un salto ya existente: al terminar el turno Clawd festeja en su
  lugar a la izquierda (`home`), venga de donde venga.
- Ver el gorro en una sesión real (`/clawd-mood gorro siempre`), incluida la
  recarga del plugin al cambiar la opción.
