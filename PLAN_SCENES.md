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

## Temporada navideña (propuesto)

Profundiza el gorro: un árbol que se arma durante diciembre y se enciende con
el trabajo de la sesión, y gorritos para los subagentes.

### El árbol

- **Dónde.** Pegado al borde derecho de la banda: 4 filas, unas 6 celdas de
  ancho (estrella, follaje en medias celdas, tronco, regalos). Es decorado de
  la banda, no de Clawd: no camina ni sigue sus poses. Solo aparece si la banda
  tiene ancho de sobra (orientativo: 70 columnas); si no, no se dibuja.
- **Convivencia.** Clawd camina y escribe su línea en el ancho que deja el
  árbol (`walked` y `solo` reciben el ancho útil), y los escritorios se sientan
  en ese mismo ancho (`seats`): con el árbol cabe un escritorio menos.
- **Se arma por fecha (adviento).** El 1 de diciembre está pelado; cada día
  suma un adorno en un orden fijo de posiciones; el 24 se prende la estrella;
  desde el 25, regalos al pie. Sale de la fecha: no guarda nada.
  Con `siempre` fuera de diciembre se ve completo, como el 25.
- **Se enciende con el trabajo de la sesión.** Cada turno que termina con
  respuesta prende una luz más, hasta llenarlas; mientras Claude trabaja, las
  luces encendidas parpadean. Al terminar el turno, una chispa viaja de Clawd
  al árbol durante el festejo, y la luz nueva se prende al llegar. Este
  progreso vive en memoria y empieza de cero en cada sesión o recarga: guardarlo
  en `userConfig` recargaría el plugin en cada turno.
- **Activación.** Campo `userConfig.tree` (`diciembre` por defecto, `siempre`,
  `nunca`) y `/clawd-mood arbol <opción>`, igual que el gorro.

### Gorritos de los subagentes

- Siguen la opción del gorro de Clawd (`userConfig.hat`).
- El gorrito ocupa la celda sobre la cabeza del subagente, la de los símbolos
  de código (`=>`, `{}`). Mientras lo lleva, los símbolos no se dibujan, y el
  `✓` de terminado pasa al costado del notebook.
- Dibujo pequeño en píxeles como el del gorro grande: borde blanco, copa roja,
  pompón; sigue al subagente al caminar.

### Arquitectura

| Archivo | Cambio |
| --- | --- |
| `hooks/tree.ts` (nuevo) | Puro: celdas del árbol según día del mes, luces encendidas y tick; posición de la chispa. |
| `hooks/desks.ts` | `solo` y `scene` reciben el decorado de la banda y el ancho útil; gorrito y `✓` desplazado en los escritorios. |
| `hooks/accessories.ts` | El gorrito de los subagentes, en el mismo formato de píxeles. |
| `hooks/register.tsx` | Cuenta las luces de la sesión, arma el decorado y pasa el ancho útil. |
| `hooks/clawd.ts` | `walked` sobre el ancho útil. |
| `hooks/mood-register.tsx`, `plugin.json` | Campo `tree` y su espacio `arbol`. |
| `scripts/preview.ts` | Modo `navidad`: el árbol día a día y una sesión prendiendo luces. |

### Etapas

1. **Árbol por fecha.** Sprite, adviento, campo `tree`, espacio para Clawd y
   escritorios. Vista previa del dibujo antes de integrarlo (render o JSON para
   el editor).
2. **Luces por trabajo.** Contador de la sesión, parpadeo mientras trabaja y la
   chispa en el festejo.
3. **Gorritos de los subagentes.** Dibujo, reemplazo de los símbolos y `✓`
   desplazado.
4. **Verificación.** Pruebas de cada regla (día 1, 12, 24 y 25; luces que no
   pasan del máximo; sin árbol en una banda angosta; `nunca`); `claude plugin
   test .`, `validate`, `git diff --check`; sesión real con subagentes e
   image-preview. Subir la versión según `AGENTS.md`.

## Verificación pendiente

- Sesión real: trabajar con lecturas, comandos largos, tests y commits; ver que
  no hay cortes ni saltos, y la convivencia con image-preview.
- Se mantiene un salto ya existente: al terminar el turno Clawd festeja en su
  lugar a la izquierda (`home`), venga de donde venga.
- Ver el gorro en una sesión real (`/clawd-mood gorro siempre`), incluida la
  recarga del plugin al cambiar la opción.
