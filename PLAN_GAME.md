# Plan: Clawd Invaders

Estado: implementado en `hooks/game*.ts(x)` (v0.11.0). Verificado en el motor:
panel, `Client`, teclas, pausa por foco y tamaño, y reglas, con `claude plugin test`.
Pendiente de comprobar a mano en una sesión real: lado y ancho reales del panel,
`/clawd-play` durante un turno activo, Escape y retorno de foco, y convivencia con
image-preview. Sin indicador de atención/permisos: no hay señal verificada.

## Objetivo

Ofrecer un minijuego retro de nave y disparos mientras Claude ejecuta una tarea
larga. Clawd pilota una nave que elimina oleadas de bugs. El juego debe sentirse
como una extensión cartoon de la mascota y permitir volver al prompt al instante.

## Experiencia propuesta

1. El usuario inicia una tarea en Claude Code.
2. Ejecuta `/clawd-play` para abrir o retomar el panel del juego. Confirmar en el
   prototipo que un comando local puede ejecutarse durante un turno activo.
3. En fullscreen, solicitar un panel lateral de aproximadamente un tercio del
   ancho. Verificar su posición real; se desea a la derecha.
4. Con el foco en el juego, las flechas izquierda y derecha mueven la nave y el
   disparo es automático. Añadir `a` y `d` como alternativas si resultan cómodas.
5. Escape devuelve el teclado al prompt. Pausar la partida al perder el foco y
   conservarla mientras el panel siga abierto. Un clic permite retomarla si la
   API instalada lo admite; ofrecer también el comando para volver a abrirla.
6. Mostrar un indicador breve de Claude: trabajando, terminado o requiere
   atención, solo cuando exista una señal fiable del motor.

No ocultar ni reemplazar el prompt en la primera versión. No usar Ctrl+C como
salida del juego: evitar interferir con los controles de la tarea principal.

## Reglas del juego: primera versión

- Nave de Clawd en la parte inferior; movimiento horizontal dentro del tablero.
- Bugs en una formación que avanza lateralmente, cambia de dirección en los
  bordes y desciende. Disparos enemigos sencillos para dar sentido a esquivar.
- Disparo automático a una cadencia limitada, tres vidas y puntuación visible.
- Una colisión quita una vida y da una breve invulnerabilidad para impedir
  varios daños por el mismo impacto. Un proyectil no puntúa dos veces.
- Eliminar una formación inicia otra oleada con dificultad gradual y limitada.
- Fin de partida al perder las vidas o cuando los enemigos alcanzan la defensa.
  Mostrar puntuación y una acción explícita para reiniciar.
- Pausa manual con `p`; pérdida de foco, espacio insuficiente o atención de
  Claude también pausan. Reanudar explícitamente, sin avances acumulados.
- Fuera de alcance inicial: sonido, multijugador, tablas de récords persistentes,
  recursos raster, motores externos y disparos especiales. Espacio puede añadirse
  después para una habilidad especial si mejora el juego.

## Dirección visual

Seguir `AGENTS.md`. Usar sprites de bloques de colores y medios o cuartos de
celda, siluetas pequeñas, ojos expresivos y una paleta reducida. La nave debe
mostrar a Clawd reconocible; los bugs deben tener personalidad cartoon.

Animaciones cortas: balanceo o propulsión de dos poses, bugs de dos poses,
impacto con unas pocas chispas y celebración breve entre oleadas. El daño puede
usar ojos de mareo y un pequeño sacudido, conservando la posición lógica.

Revisar `hooks/clawd.ts` y `hooks/desks.ts` antes de diseñar. Reutilizar los
patrones de poses y pintado, sin introducir detalle realista ni copiar toda la
escena de la mascota dentro del tablero.

## Capacidades y dudas que debe resolver el prototipo

La declaración oficial consultada describe `Pane`, `$.ui.open`, `Client`,
`surface.onKey` y `surface.every`. Un panel puede acoplarse junto al transcript
en fullscreen desde 110 columnas, o aparecer encima del prompt en modo inline.
`columns` solicita el ancho del panel acoplado; el motor y los ajustes del
usuario tienen la última palabra. No hay que prometer un tercio exacto ni un
lado configurable.

Fuente de referencia:
[API de mods de Claude Code](https://github.com/anthropics/claude-code/blob/main/mods/types/claude-code.d.ts).

Antes de implementar la mecánica:

- Comprobar estos contratos en la versión instalada y generar los tipos locales
  si hace falta; la rama principal de la documentación puede diferir del binario.
- Abrir un panel desde un comando local sin iniciar otro turno del modelo.
- Verificar ancho, altura, lado, modo inline y redimensionado real.
- Confirmar cómo un `Client` obtiene y pierde el teclado dentro de `Pane`, y
  cómo observar esa pérdida para pausar. El foco solicitado no está garantizado.
- Confirmar Escape y que devolver el foco no interrumpe el turno activo.
- Probar cómo abrir el juego durante una tarea; si el comando queda en cola,
  usar un botón visible o una acción del motor compatible para activarlo.
- Identificar las señales disponibles para solicitudes de permisos y diálogos.
  Pausar al perder foco; no inferir estados de atención a partir de errores.
- Comprobar que los renders y las entradas no retrasan el trabajo de Claude.

## Arquitectura propuesta

Mantener los archivos del juego separados de las poses normales. Los nombres
son orientativos y pueden ajustarse a la API comprobada:

| Archivo | Responsabilidad |
| --- | --- |
| `hooks/game.ts` | Estado y reglas puras: mover, avanzar, colisionar, puntuar y cambiar oleada. |
| `hooks/game-sprites.ts` | Poses y composición de celdas del tablero. |
| `hooks/game-client.tsx` | Entrada y reloj local del `Client`; dibujar y pausar. |
| `hooks/game-register.tsx` | Comando, panel y señales de actividad de Claude. |
| `hooks/game.test.ts` | Simulación determinista y regresiones de reglas. |
| `hooks/game-register.test.tsx` | Integración de comando, panel, foco y ciclo de vida. |

Registrar el módulo de integración mediante el mecanismo admitido en
`hooks/hooks.json`, o llamarlo desde el registro existente si resulta más simple.
Declarar únicamente el estado compartido necesario en `types/index.d.ts`.

La simulación debe recibir tiempo y entradas explícitos; inyectar una semilla
si se necesita azar. Mantener estado de alta frecuencia en el `Client`, sin
escribir átomos compartidos ni emitir eventos por cada fotograma. Compartir con
los hooks solo cambios necesarios de estado y actividad. Evitar llamadas al
modelo y procesos externos para ejecutar la partida.

## Tamaño, rendimiento y ciclo de vida

- Calcular un ancho solicitado cercano al tercio del viewport al abrir, usando
  las dimensiones realmente disponibles y respetando los ajustes del usuario.
- Adaptar el tablero al tamaño concedido. Definir el mínimo después de probar
  los sprites; si no cabe, pausar y mostrar un mensaje breve, sin recortes jugables.
- Ante un cambio de tamaño, pausar y recolocar o reconstruir el tablero de forma
  explícita, conservando puntuación y vidas. No dejar entidades fuera de límites.
- Empezar con un intervalo local de 80–100 ms y ajustar tras medir. Separar la
  cadencia visual de la velocidad de enemigos y disparos.
- Un único reloj por instancia. Detenerlo o dejar de simular al pausar, cerrar
  o descargar; comprobar el mecanismo de limpieza que ofrece el `Client`.
- Preservar la partida al volver al prompt mientras el panel siga montado.
  Cerrar el panel puede terminar la partida en la primera versión; documentarlo.
- El juego no modifica la banda de la mascota ni los controles de image-preview.
  Verificar que la mascota responde al ancho reducido del transcript.

## Etapas y criterios de aceptación

### 1. Prototipo del panel y el teclado

Crear el comando y un panel con una nave que se mueve, sin enemigos. Verificar
en una sesión real fullscreen el panel lateral, el acceso durante una tarea,
el foco, Escape y el retorno al prompt. Resolver las dudas de la API antes de
dar por cerrado el diseño de interacción.

### 2. Simulación jugable

Implementar formación enemiga, disparos, colisiones, vidas, puntuación, oleadas
y fin de partida mediante funciones puras. Probar límites, impactos únicos,
invulnerabilidad, derrota, reinicio y transiciones entre oleadas.

### 3. Render cartoon y adaptación

Integrar los sprites y animaciones, ajustar contraste, dimensiones y cadencia.
Probar terminal ancho, estrecho y redimensionado; mostrar una alternativa inline
usable o pausar con explicación si no cabe. Revisar visualmente la coherencia
con la mascota existente.

### 4. Integración con tareas largas

Añadir indicador de Claude y pausas por foco o atención usando señales
verificadas. Confirmar que no se encolan prompts ni se cancelan tareas por jugar,
volver al input o cerrar el panel. Comprobar temporizadores y reapertura.

### 5. Verificación y entrega

Ejecutar `claude plugin test .`, `claude plugin validate .` y `git diff --check`.
Verificar manualmente con clawd-buddy e image-preview activos: pegar y previsualizar
una imagen, abrir el juego durante una tarea larga, mover la nave, volver al
prompt, retomar, redimensionar y cerrar. Las pruebas automatizadas no sustituyen
la comprobación del teclado y el layout reales.

Actualizar README con comando, controles, requisitos y límites comprobados.
Incrementar la versión cuando se prepare la entrega funcional. Hacer commit y
push siguiendo `AGENTS.md` cuando el usuario lo solicite.

## Resultado esperado

Un juego opcional y ligero que comparte la terminal con Claude, con controles
claros y animación cartoon minimalista. Se considera listo cuando la partida
es jugable y el usuario puede alternar entre ella y su tarea sin perder el
borrador, bloquear controles ajenos o interrumpir el trabajo en curso.
