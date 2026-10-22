# Reglas del proyecto

## Alcance y estructura

Este repositorio contiene clawd-buddy, un plugin de Claude Code. Mantenerlo
pequeño y respetar su arquitectura: integración en `hooks/register.tsx`, poses
y transiciones en `hooks/clawd.ts`, composición y sprites en `hooks/desks.ts`,
y estado tipado en `types/index.d.ts`.

Separar la lógica pura de animaciones y juegos de los eventos del motor. Usar
la API de Claude Code y comprobar sus capacidades en la versión instalada antes
de asumir que admite un componente, propiedad, evento o atajo.

## Estilo visual y animación

- Clawd es cartoon, expresivo y minimalista. Priorizar siluetas claras, pocos
  colores y pocos fotogramas que cuenten una acción reconocible.
- Antes de crear o modificar una animación, revisar las poses de `hooks/clawd.ts`
  y los sprites y el pintado de `hooks/desks.ts`. Si el estilo no está claro,
  encontrar sus patrones y seguirlos; no inventar una dirección visual distinta.
- Conservar el cuerpo cuadrado naranja, los ojos expresivos, los brazos cortos
  y las patas reconocibles. Mantener la continuidad del cuerpo y los accesorios
  durante las transiciones.
- Usar bloques de terminal, fondos de color y medios o cuartos de celda según
  los patrones existentes. Evitar realismo, texturas, detalles finos, efectos
  recargados y dependencias gráficas nuevas sin una necesidad concreta.
- Tomar como referencias las gafas que bajan sobre la cara, la respiración y el
  corazón, la capa que ondea, y la caída y recuperación del mareo. La expresión
  y la secuencia de poses transmiten la acción.
- Respetar las columnas reales del terminal, el recorte y los tamaños pequeños.
  Reducir redibujados cuando la imagen no cambia; detener relojes innecesarios.

## Convivencia con Claude Code y otros plugins

- Preservar la cadena de renders compartidos mediante `next(e)` y componer su
  resultado cuando se añada contenido. No borrar controles de otros plugins.
- Respetar encuestas, permisos, foco, espacio disponible y el borrador del
  prompt. No bloquear el trabajo de Claude para animar o jugar.
- No reasignar Ctrl+C ni asumir que un atajo cancela solo el juego. Comprobar
  el comportamiento del motor y usar Escape para devolver el foco si lo admite.
- Los juegos son optativos. Su estado, temporizadores y entradas deben quedar
  aislados de las animaciones normales y liberarse al cerrar o descargar.

## Verificación

Para cambios de comportamiento ejecutar:

```text
claude plugin test .
claude plugin validate .
git diff --check
```

Agregar pruebas de regresión que cubran el comportamiento cambiado. Para nuevas
animaciones revisar también su apariencia con `scripts/preview.ts` o una sesión
real. Para interfaz interactiva comprobar foco, redimensionado y convivencia con
image-preview. Distinguir lo probado en el motor de lo verificado visualmente.
Los cambios solo de documentación no requieren ejecutar las pruebas del plugin.

## Commits e identidad

- Seguir la convención reciente del historial: título en inglés con prefijo
  `feat:`, `fix:` o, para documentación, `docs:`, seguido de una descripción breve
  en imperativo. Ejemplo: `fix: let Clawd share the prompt band with other plugins`.
- Cuando haga falta cuerpo, escribir un párrafo breve en inglés que explique
  el comportamiento final y su motivo, siguiendo el tono de los commits existentes.
- Todo commit que cambie código del plugin sube `version` en
  `.claude-plugin/plugin.json` dentro del mismo commit: `feat:` sube el minor
  (0.11.1 → 0.12.0) y `fix:` el patch (0.11.1 → 0.11.2). `docs:` y los cambios
  solo de tests no la suben. `/plugin` compara esa versión para actualizar; si
  no cambia, la instalación se queda en el commit anterior aunque haya push.
- No añadir `Co-Authored-By`, `Authored-By`, firmas de asistentes ni atribuciones
  automáticas al mensaje del commit.
- Antes de crear un commit, comprobar autor y committer efectivos. En este
  proyecto usar `zGreenCat <vicente.araya9821@gmail.com>`, como el historial
  personal. La cuenta de autenticación del push no determina el autor.
- Si hace falta configurar la identidad, usar `git config --local`; nunca
  cambiar la configuración global ni la de otros repositorios.
- No incluir cambios ajenos. Crear commits y hacer push cuando el usuario lo
  solicite; no reescribir commits publicados sin autorización explícita.

## Planes de trabajo

Consultar `PLAN_GAME.md` antes de implementar Clawd Invaders, y `PLAN_MOODS.md`
antes de cambiar cómo Clawd elige sus moods o de agregar uno nuevo. Son planes
de trabajo, no una declaración de funcionalidades ya disponibles.
