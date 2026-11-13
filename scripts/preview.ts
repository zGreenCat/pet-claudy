// Plays Clawd in a terminal, so the drawing can be seen without a session:
//   node scripts/preview.ts ?        lists the moods
//   node scripts/preview.ts <mood>   plays one
//   node scripts/preview.ts todos    plays them in turn
// Ctrl+C stops it. Not part of the mod: the engine loads only hooks/.

import { CELEBRATE_TICKS, MOMENT_TICKS, SCENES, WIDTH, mirrored, view } from '../hooks/clawd.ts'
import type { Context, Frame, SceneId, View } from '../hooks/clawd.ts'
import { HAT, dress } from '../hooks/accessories.ts'
import { cue, pose, start, step } from '../hooks/director.ts'
import type { Cue } from '../hooks/director.ts'
import { ROWS, START_X, scene, solo, walk } from '../hooks/desks.ts'
import type { Agent, Decor, Segment } from '../hooks/desks.ts'
import { HALF_TURN, IDLE, TALL_HALF_TURN, TALL_IDLE, TALL_WALK, WALK, loopTicks, mirroredCells, shotAt } from '../hooks/poses.ts'
import type { Shot } from '../hooks/poses.ts'
import { TREE_W, treeCells } from '../hooks/tree.ts'

const TICK_MS = 250
const CLAUDE = '#D77757'
// A header line over the drawing
const HEIGHT = ROWS + 1
// How long `todos` holds each mood, in ticks
const HOLD = 40

// A scene as the plugin plays it, standing at its spot
function scened(id: SceneId) {
  return (t: number): View => {
    const { dx = 0, walking: _w, turning: _t, ...p } = SCENES[id].play(t)
    return { ...p, x: dx, isWorking: false }
  }
}

type Mood = {
  name: string
  about: string
  at?: (t: number, columns: number) => View
  // What stands at the band's right edge meanwhile
  decor?: (t: number) => Decor
}

// December in a few seconds: a day every two, the lights coming on a turn at
// a time, Clawd at work with its hat on beside the tree
const DAY_TICKS = 8
const XMAS_TICKS = 25 * DAY_TICKS
function christmasTree(t: number): Decor {
  const k = t % XMAS_TICKS
  return treeCells(1 + Math.floor(k / DAY_TICKS), Math.floor(k / (DAY_TICKS * 3)), true, t)
}

// The hat over the poses that move the head: working, a deep breath with the
// head sunk, a fall upside down, and the headphones, which take its place
const HATTED_TICKS = 120
function hatted(t: number, c: number): View {
  const v =
    t < 40 ? view(t, 0, true, c)
    : t < 60 ? view(t, 0, true, c, undefined, { mood: 'love', since: t - 40 })
    : t < 92 ? view(t, 0, false, c, undefined, { mood: 'dizzy', since: t - 60 })
    : view(t, 0, true, c, undefined, undefined, undefined, t - 84)
  return dress(v, [HAT])
}

// The director through a made-up turn: it works, reads a while, gets two
// moments at once, waits on a long command, and the turn ends. Each scene
// waits for the one before to stop cleanly
const DIRECTED_TICKS = 200
const DIRECTED_CUES: Record<number, Cue> = { 66: 'cool', 67: 'love', 170: 'celebrate' }
// Work as the plugin plays it, at half ticks: walking three-quarters on, a
// turn, a stop to dance or cook, and on again. `h` counts half ticks
let walker = start(0)
function walking(h: number, columns: number): View {
  const t = Math.floor(h / 2)
  const ctx: Context = { idleTicks: 0, isWorking: true }
  walker = step(walker, ctx, t)
  return pose(walker, ctx, t, columns, h % 2)
}

// The trial of sextants: Clawd drawn 12 pixels tall walks a stretch and back,
// then waits, and after it the same in today's quarters, to set side by side.
// `h` counts half ticks
const TRIAL_SPAN = 14
const TRIAL_WALK = TRIAL_SPAN * 2 + 2
function trial(h: number): View {
  const part = TRIAL_WALK + loopTicks(TALL_IDLE) * 2
  const isTall = Math.floor(h / part) % 2 === 0
  const k = h % part
  const frame: Frame = ['.OLOORO.', '^OOOOOO^', '.aa..bb.']
  const shown = (x: number, shot: Shot, isMirrored = false): View => ({
    frame,
    marks: [],
    isWorking: true,
    x,
    line: isTall ? 'muestra alta' : 'como hoy',
    quarters: isMirrored ? mirrored(shot.px) : shot.px,
    ...(shot.cells ? { cells: isMirrored ? mirroredCells(shot.cells) : shot.cells } : {}),
  })
  if (k >= TRIAL_WALK) return shown(0, shotAt(isTall ? TALL_IDLE : IDLE, Math.floor((k - TRIAL_WALK) / 2)))
  // Out, a half turn at the far end, back, and a half turn home
  const turn: Shot = isTall ? TALL_HALF_TURN : HALF_TURN
  if (k === TRIAL_SPAN) return shown(TRIAL_SPAN, turn)
  if (k === TRIAL_WALK - 1) return shown(0, turn, true)
  const steps = isTall ? TALL_WALK : WALK
  const shot = steps[k % steps.length]!
  return k > TRIAL_SPAN ? shown(TRIAL_WALK - 1 - k, shot, true) : shown(k, shot)
}

function directed(t: number, columns: number): View {
  const ctx = (k: number): Context => ({
    idleTicks: k < 170 ? 0 : k - 170,
    isWorking: k < 170,
    readingFor: k >= 20 && k < 50 ? k - 20 : undefined,
    runningFor: k >= 110 && k < 150 ? k - 110 : undefined,
  })
  let d = start(0)
  for (let k = 0; k <= t; k++) {
    const id = DIRECTED_CUES[k]
    if (id) d = cue(d, id, k)
    d = step(d, ctx(k), k)
  }
  return pose(d, ctx(t), t, columns)
}

// The poses `view` picks, each held by choosing what it is shown: how long the
// session has been idle, and whether a turn is running. `agentes` is not a
// pose: it is the desks scene, with its own script below.
const MOODS: Mood[] = [
  { name: 'quieto', about: 'esperando: parpadea y se balancea', at: scened('idle') },
  { name: 'baila', about: 'trabajando: baila y camina ("pensando", "trabajando", "bailando")', at: (t, c) => view(t % 72, 0, true, c) },
  { name: 'cocina', about: 'trabajando, "cocinando código": tira código al aire en una sartén', at: (t, c) => view(72 + (t % 24), 0, true, c) },
  { name: 'celebra', about: 'terminó un turno: salta en diagonal sonriendo (^ ^), gira en el aire, confeti y "¡listo!"', at: t => scened('celebrate')(t % CELEBRATE_TICKS) },
  { name: 'fuma', about: 'un rato sin usarlo: un break con cigarro, de vez en cuando', at: scened('smoke') },
  { name: 'duerme', about: '3 minutos sin usarlo: ojos cerrados (▁ ▁), respira y suben las Z', at: scened('sleep') },
  { name: 'cool', about: 'pasan los tests o sale un commit: lentes de sol', at: (t, c) => view(t, 0, true, c, undefined, { mood: 'cool', since: t % MOMENT_TICKS.cool }) },
  { name: 'cariño', about: 'le dices gracias: un corazón sobre su mano', at: (t, c) => view(t, 0, true, c, undefined, { mood: 'love', since: t % MOMENT_TICKS.love }) },
  { name: 'idea', about: 'termina un plan: se le prende el foco', at: (t, c) => view(t, 0, true, c, undefined, { mood: 'idea', since: t % MOMENT_TICKS.idea }) },
  { name: 'magia', about: 'usa una skill: agita la varita y saltan chispas', at: (t, c) => view(t, 0, true, c, undefined, { mood: 'magic', since: t % MOMENT_TICKS.magic }) },
  { name: 'lee', about: 'lee varios archivos seguidos: un libro en la mano', at: scened('read') },
  { name: 'súper', about: 'lanza varios subagentes a la vez: capa y puño arriba', at: (t, c) => view(t, 0, true, c, undefined, { mood: 'super', since: t % MOMENT_TICKS.super }) },
  { name: 'café', about: 'un rato sin usarlo, otro break: una taza de café', at: scened('coffee') },
  { name: 'música', about: 'espera un comando largo: audífonos y notas', at: scened('music') },
  { name: 'mareado', about: 'fallan varias cosas seguidas: ojos en espiral y estrellas', at: (t, c) => view(t, 0, false, c, undefined, { mood: 'dizzy', since: t % MOMENT_TICKS.dizzy }) },
  { name: 'cambios', about: 'un turno inventado: lee, dos momentos en cola, música y festejo, sin cortes', at: (t, c) => directed(t % DIRECTED_TICKS, c) },
  { name: 'sextantes', about: 'prueba: la muestra alta (patas largas, sombra degradada, respiración suave), y después el Clawd de hoy', at: trial },
  { name: 'caminata', about: 'trabajando: camina de tres cuartos, gira, se detiene a bailar o cocinar (8 cuadros por segundo)', at: walking },
  {
    name: 'navidad',
    about: 'diciembre: el árbol se arma día a día y se enciende con los turnos',
    at: (t, c) => dress(view(t, 0, true, c - TREE_W - 1), [HAT]),
    decor: christmasTree,
  },
  { name: 'gorro', about: 'el gorro de Navidad: trabajando, con la cabeza hundida, caído y bajo los audífonos', at: (t, c) => hatted(t % HATTED_TICKS, c) },
  { name: 'agentes', about: 'con subagentes: cada uno llega con su notebook, teclea, y se va' },
]
const POSES = MOODS.filter(m => m.at)

function list() {
  const width = Math.max(...MOODS.map(m => m.name.length))
  console.log('Moods de Clawd:\n')
  for (const m of MOODS) console.log(`  ${m.name.padEnd(width)}  ${m.about}`)
  console.log(`  ${'todos'.padEnd(width)}  los moods uno tras otro, 10 s cada uno (sin agentes)`)
  console.log('\nUso: node scripts/preview.ts <mood>')
}

const arg = process.argv[2] ?? 'agentes'
if (['?', '-?', '-h', '--help', 'help', 'ayuda'].includes(arg)) {
  list()
  process.exit(0)
}
if (arg !== 'todos' && !MOODS.some(m => m.name === arg)) {
  console.error(`No existe el mood "${arg}".\n`)
  list()
  process.exit(1)
}

// Who comes, when, and what each one does in turn
const SCRIPT = [
  { id: 'a', type: 'Explore', at: 0, doneAt: 70, result: 'login usa JWT en 3 sitios',
    steps: ['buscar flujo de auth', 'buscando "token"', 'leyendo login.ts', 'leyendo session.ts'] },
  { id: 'b', type: 'general-purpose', at: 6, doneAt: 110, result: '13 tests pasan',
    steps: ['revisar los tests', 'Run tests', 'leyendo clawd.test.tsx', 'editando desks.ts'] },
  { id: 'c', type: 'Plan', at: 12, doneAt: 90, result: 'plan en 4 pasos',
    steps: ['diseñar los escritorios', 'googleando "ansi colors"', 'planeando'] },
]
const END = 150

function rgb(hex: string): string {
  const h = hex === 'claude' ? CLAUDE : hex
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(';')
}

function ansi(seg: Segment): string {
  const s = seg.style
  const codes = [
    s.bold ? '1' : '',
    s.dim ? '2' : '',
    s.italic ? '3' : '',
    s.fg ? `38;2;${rgb(s.fg)}` : '',
    s.bg ? `48;2;${rgb(s.bg)}` : '',
  ].filter(Boolean)
  return codes.length ? `\x1b[${codes.join(';')}m${seg.text}\x1b[0m` : seg.text
}

let t = 0
let agents: Agent[] = []
const columns = () => Math.max(40, (process.stdout.columns ?? 80) - 5)

function draw(mood: Mood, rows: Segment[][]) {
  const header = `\x1b[2m mood: ${mood.name}  ·  ${mood.about}\x1b[0m`
  const lines = [header, ...rows.map(r => r.map(ansi).join(''))]
  process.stdout.write(`\x1b[${HEIGHT}A` + lines.map(l => '\x1b[2K' + l).join('\n') + '\n')
}

process.stdout.write('\n'.repeat(HEIGHT))
const timer = setInterval(() => {
  const mood = arg === 'todos' ? POSES[Math.floor(t / HOLD) % POSES.length]! : MOODS.find(m => m.name === arg)!

  if (mood.at) {
    const k = arg === 'todos' ? t % HOLD : t
    const v = mood.at(k, columns())
    draw(mood, solo(v.frame, v.marks, v.x, v.line, v.isWorking, columns(), mood.decor?.(k), v.quarters, v.eyes, v.cells))
    t += 1
    return
  }

  for (const s of SCRIPT) {
    const since = t - s.at
    if (since === 0) agents.push({ id: s.id, type: s.type, activity: s.steps[0]!, x: START_X, bornAt: t })
    if (since > 0 && since % 12 === 0 && t < s.doneAt) {
      const activity = s.steps[Math.min(since / 12, s.steps.length - 1)]!
      agents = agents.map(a => (a.id === s.id ? { ...a, activity } : a))
    }
    if (t === s.doneAt) agents = agents.map(a => (a.id === s.id ? { ...a, doneAt: t, result: s.result } : a))
  }
  agents = walk(agents, t, columns())

  const frame = view(t, 0, true, columns()).frame.map(r => r.slice(0, WIDTH)) as Frame
  draw(mood, scene(t, agents, frame, 'dirigiendo', columns()))

  t += 1
  if (t > END && agents.length === 0) {
    clearInterval(timer)
    process.stdout.write('\nfin: todos se fueron\n')
  }
  // The walk steps twice a tick; every other mood keeps the plugin's tick
}, arg === 'caminata' || arg === 'sextantes' ? TICK_MS / 2 : TICK_MS)
