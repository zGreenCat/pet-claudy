# Plan: sistema de moods

Estado: diseño propuesto; sin implementar. Va antes de mejorar Clawd Invaders
y antes de cualquier sistema de recompensas.

## Objetivo

Pasar de moods sueltos, decididos por una cadena de condiciones en
`hooks/clawd.ts`, a un sistema donde cada momento de Clawd es un **espacio** con
**variantes** que la persona elige. Agregar un mood nuevo debe ser declarar
una variante y sus poses, no tocar la lógica de prioridades ni `register.tsx`.

El mismo sistema es la base de las recompensas futuras: una variante
desbloqueada aparecerá como una opción más en su espacio.

## Situación actual

`view()` en `hooks/clawd.ts` decide la pose con prioridades fijas:

1. Celebración al terminar un turno (`celebrating`).
2. Momento por evento (`moment`: cool, love, idea, magic, super, dizzy).
3. Lectura de varios archivos (`reading`).
4. Comando largo, con audífonos (`listening`).
5. Trabajando: baile o cocina, según la línea de texto del momento.
6. Dormido, tras 3 minutos sin uso.
7. Break: cigarro y café se turnan (`isCoffeeBreak`).
8. Quieto: parpadea y se balancea.

Problemas para crecer:

- Las alternancias están escondidas en cada rama (`isCoffeeBreak`, la línea
  `cocinando`). No hay un lugar donde ver ni elegir variantes.
- `view()` recibe ocho argumentos posicionales y cada mood nuevo agrega otro.
- `scripts/preview.ts` mantiene a mano su propia lista de moods.

## Concepto: espacios y variantes

Un **espacio** es un momento de Clawd con una condición de entrada y una
prioridad. Una **variante** es una forma de vivir ese momento: sus poses,
marcas y línea de texto.

Espacios con variantes que compiten (los que se eligen):

| Espacio | Cuándo | Variantes hoy | Ideas futuras |
| --- | --- | --- | --- |
| `break` | un rato sin uso | cigarro, café | mate, yoga, yoyo |
| `trabajo` | Claude trabaja | baile, cocina | tejer, martillar |
| `celebra` | termina un turno | salto con confeti | fuegos artificiales, bailecito |

Espacios de una sola variante, sin elección por ahora: momentos por evento,
lectura, música, dormido y quieto. Los momentos por evento no compiten entre sí:
cada uno responde a una señal distinta (tests en verde, un gracias, errores
seguidos). Pueden ganar variantes más adelante sin cambiar el diseño.

Ningún mood existente queda bloqueado ni desaparece. Elegir solo decide cuál
de las variantes disponibles se ve.

## Cómo se elige

Por espacio, uno de estos modos:

- **Una fija**: siempre la misma (por ejemplo, café y nunca cigarro).
- **Rotar**: se turnan en orden, como el cigarro y el café hoy. Es el valor por
  defecto, así nada cambia para quien no elija.
- **Azar**: una al azar en cada aparición. El azar sale de una semilla derivada
  del tick, para que las pruebas sean deterministas.

Dos lugares para elegir, que escriben el mismo valor:

- `/clawd-mood` sin argumentos muestra cada espacio, sus variantes y la
  elección actual. `/clawd-mood break café` elige; `/clawd-mood break rotar`
  vuelve a rotar. Un espacio o variante inexistente responde con un error
  explícito que lista las opciones válidas.
- `/config`: un campo `userConfig` por espacio, de tipo string con `options`.
  La API lo dibuja como selector sin escribir interfaz.

Los textos visibles (nombres de variantes, mensajes del comando) van en
español; los identificadores internos, en inglés.

## Persistencia: lo que hay que verificar primero

La declaración de la API (`.claude-plugin/types/claude-code.d.ts`, generada o
bajada de la rama principal) indica:

- Los campos `userConfig` del manifiesto llegan a `register(on, options)` con
  sus valores por defecto aplicados (`PluginOptions`: string, number, boolean
  o lista de strings).
- Se guardan en `settings.json` bajo `pluginConfigs[<plugin>].options`.
- Un string con `options` se dibuja como selector en `/config`; un valor fuera
  de la lista cuenta como no definido.
- `$.config.set({ key: 'clawd-buddy.<campo>', value })` cambia un campo como si
  lo hiciera la persona.

Sin verificar en la versión instalada, y por eso es la etapa 1:

- Que un plugin pueda escribir su propio campo con `$.config.set`, o si la
  respuesta es `{ deny }`.
- Si cambiar el campo recarga el módulo (y con eso reinicia el estado de
  Clawd) o si hay que leer el valor nuevo de otra forma, por ejemplo con
  `$.config.list()` o un hook de `config.set`.
- Que el valor sobreviva a cerrar y abrir una sesión.
- Cómo se ve el selector en `/config` y si admite etiquetas en español.
- Que `/clawd-mood` pueda correr durante un turno activo (`immediate` en
  `CommandSpec`).

Si la escritura desde el plugin no funciona, la alternativa es elegir solo
desde `/config` y que `/clawd-mood` muestre el estado y cómo cambiarlo.

### Resultados de la etapa 1

Confirmado en la declaración de la API (`Register`): las opciones quedan fijas
durante una activación, y cambiar una **recarga el plugin**: `register` corre
otra vez con las nuevas. Elegir una variante reinicia el estado del módulo
(el reloj de Clawd, los agentes vistos) y probablemente el juego abierto, cuyo
estado vive en su `Client`.

Prototipo (v0.14.0): campo `userConfig.breakMood` (`rotar`, `azar`, `cigarro`,
`cafe`; por defecto `rotar`), aún sin efecto en lo que dibuja Clawd, y
`/clawd-mood` en `hooks/mood-register.tsx`, con `immediate`. Probado en el
motor con un `config.set` simulado: escribe `clawd-buddy.breakMood`, muestra
un `deny` y rechaza espacios y variantes inválidos sin escribir.

Pendiente de comprobar a mano en una sesión real:

| Pregunta | Resultado |
| --- | --- |
| `$.config.set` del plugin sobre su propio campo escribe, o responde `deny` | pendiente |
| Tras escribir, el plugin se recarga y `/clawd-mood` muestra el valor nuevo | pendiente |
| El valor sobrevive a cerrar y abrir la sesión | pendiente |
| `/config` muestra el selector, con título y descripción en español | pendiente |
| `/clawd-mood` corre durante un turno activo | pendiente |
| Qué le pasa a una partida abierta de Clawd Invaders al recargar | pendiente |

## Arquitectura propuesta

| Archivo | Responsabilidad |
| --- | --- |
| `hooks/moods.ts` | Registro puro: espacios, variantes, prioridades y la función que elige la variante de un espacio según el modo y el tick. |
| `hooks/clawd.ts` | Poses y secuencias de cada variante, como hoy. `view()` recorre el registro en vez de la cadena de `if`. |
| `hooks/mood-register.tsx` | Comando `/clawd-mood`, lectura y escritura de la elección (`options`, `$.config`). |
| `types/index.d.ts` | Tipos de espacio, variante y elección si hace falta compartirlos. |
| `.claude-plugin/plugin.json` | Campos `userConfig`, uno por espacio con variantes. |
| `scripts/preview.ts` | Lista de moods derivada del registro, no a mano. |

Ideas del registro, a ajustar al implementar:

- Cada espacio declara su prioridad, su condición de entrada sobre un contexto
  (`t`, inactividad, si trabaja, momento, lectura, comando largo) y su lista de
  variantes.
- Cada variante declara su id, su nombre visible y una función pura del tiempo
  dentro del espacio que devuelve poses, marcas y línea.
- `view()` toma un objeto de contexto en lugar de ocho argumentos. Los callers
  de `register.tsx` y los tests se actualizan en el mismo cambio.
- La elección por espacio llega como dato (`{ break: 'rotar', ... }`); el
  registro no sabe de dónde vino.

Mantener lo que ya funciona: `viewKey` para no redibujar si nada cambia, la
cadena `next(e)` y la convivencia con image-preview, sin cambios.

## Etapas y criterios de aceptación

### 1. Prototipo de persistencia

Un campo `userConfig` de prueba y un comando mínimo que lo escribe. Verificar
en una sesión real cada punto de la sección de persistencia y anotar los
resultados en este plan. Sin esto no se diseña la elección.

### 2. Refactor sin cambio visible

Mover la cadena de `view()` al registro, con `view()` recibiendo un contexto.
Criterio: todas las pruebas actuales de `clawd.test.tsx` y `register.test.tsx`
pasan sin cambiar sus expectativas, salvo la forma de llamar a `view()`, y
`scripts/preview.ts` muestra exactamente lo mismo. Pruebas nuevas del registro:
orden de prioridades y que cada espacio entra solo con su condición.

### 3. Elegir variantes

Modos fija, rotar y azar por espacio; `/clawd-mood` y los campos de `/config`.
Pruebas: cada modo elige lo esperado en ticks dados, un valor inválido da error
explícito, la elección cambia lo que dibuja `view()`, y rotar por defecto
reproduce el comportamiento de hoy (cigarro y café turnándose).

### 4. Primeras variantes nuevas

Una variante nueva en `break` y otra en `celebra`, para probar que agregar es
solo declarar. Seguir `AGENTS.md`: revisar poses y pintado existentes, cuerpo
cuadrado naranja, pocos fotogramas, prueba de la secuencia y revisión visual
con `scripts/preview.ts`.

### 5. Verificación y entrega

`claude plugin test .`, `claude plugin validate .` y `git diff --check`.
Verificar en una sesión real: elegir desde el comando y desde `/config`,
reabrir la sesión y ver la elección, convivencia con image-preview y el juego.
Actualizar README con el comando, los espacios y sus variantes. Subir la
versión según `AGENTS.md`.

## Fuera de alcance

- Recompensas y desbloqueos: van después de este sistema y de mejorar el
  juego. El diseño solo deja el lugar listo (variantes disponibles por espacio).
- Accesorios o cambios de color de Clawd.
- Variantes para los momentos por evento, lectura, música, dormido y quieto.

## Resultado esperado

Clawd con espacios claros y variantes elegibles, una elección que se mantiene
entre sesiones, y un registro donde un mood nuevo se agrega declarándolo, con
su prueba y su vista previa, sin tocar las prioridades ni la integración.
