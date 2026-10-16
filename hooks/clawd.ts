// Clawd's poses: dancing, cooking code in a pan, a smoke break, asleep.
// Pure functions of the tick, so the timer can tell whether the drawing
// changed and the tests can drive it.

import type { Mark } from './desks'

export const TICK_MS = 250
export const WIDTH = 8
// After this long idle Clawd falls asleep and stops animating
export const SLEEP_AFTER_TICKS = (3 * 60 * 1000) / TICK_MS
// Idle this long, Clawd takes a smoke break now and then: the last
// SMOKE_TICKS of every SMOKE_EVERY
const SMOKE_FROM_TICKS = 60
const SMOKE_EVERY = 240
const SMOKE_TICKS = 40

// Clawd as the Claude Code logo draws it: a square body, an eye in each upper
// corner, short arms at the chest and two pairs of legs at its sides. Three
// rows, each WIDTH cells; the body is painted with the cell's background
// rather than block glyphs, which leave a dark seam between rows in fonts
// whose glyphs don't fill the line height. Only the thin parts (arms, legs)
// are glyphs, half a cell or a quarter.
//   O  orange cell
//   L  orange cell, a dark eye in its lower left quarter; R the lower right
//   -  orange cell with a closed eye (▁)
//   > <  eyes squeezed with joy; ┓ ┏ half shut, at ease.
//        Each eye is ASCII or a box-drawing glyph: terminals draw those
//        themselves, so they read the same whatever the font
//   ^  an arm at rest, the cell's upper half; v an arm raised, its lower half
//   a  a leg in the cell's upper left quarter; b the upper right
//   .  empty
// What it holds runs on past WIDTH: h a pan's handle, P the pan, c a
// cigarette, C its ember, Y the ember drawn on.
const HEAD = '.OLOORO.'
const HEAD_BLINK = '.O-OO-O.'
const HEAD_ARMS_UP = 'vOLOOROv'
const BODY = '^OOOOOO^'
const BODY_ARMS_UP = '.OOOOOO.'
const LEGS = '.aa..bb.'
// The legs shuffled inward, still under the body
const LEGS_STEP = '.bb..aa.'
// An arm out to a pan
const BODY_PAN = '^OOOOOO^hhPPPP'
// A thin cigarette at the mouth, its ember dim, then drawn on with the eyes shut
const HEAD_SMOKE = '.O┓OO┏OcccC'
const HEAD_DRAW = '.O-OO-OcccY'
// Cheering: eyes squeezed with joy, the arms going up and down
const HEAD_CHEER = 'vO>OO<Ov'
const HEAD_JOY = '.O>OO<O.'

export type Frame = [string, string, string]

const DANCE: Frame[] = [
  [HEAD, BODY, LEGS],
  [HEAD_ARMS_UP, BODY_ARMS_UP, LEGS_STEP],
  [HEAD, BODY, LEGS_STEP],
  [HEAD_ARMS_UP, BODY_ARMS_UP, LEGS],
  [HEAD_ARMS_UP, BODY_ARMS_UP, LEGS_STEP],
  [HEAD, BODY, LEGS],
]

const IDLE: Frame = [HEAD, BODY, LEGS]
const BLINK: Frame = [HEAD_BLINK, BODY, LEGS]
const COOK: Frame = [HEAD, BODY_PAN, LEGS]

const FOOD = ['{}', '()', '<>', '[]']
const FOOD_COLOR = '#F2C14E'
const PAN_COLOR = '#6B7280'
const SMOKE_COLOR = '#B8BCC4'
// The food's row over a toss: in the pan, up in the air, back down
const TOSS = [2, 2, 1, 0, 0, 1, 2, 2]
// A puff's way up from the ember, a cell or two to the right each step
const PUFF: Mark[] = [
  { row: 1, x: 12, text: '·', fg: SMOKE_COLOR },
  { row: 0, x: 11, text: '∘', fg: SMOKE_COLOR },
  { row: 0, x: 12, text: 'o', fg: SMOKE_COLOR },
  { row: 0, x: 14, text: '°', fg: SMOKE_COLOR },
]

const WORKING_LINES = ['pensando', 'trabajando', 'bailando', 'cocinando código']
const IDLE_LINES = ['esperándote', 'listo', 'aquí estoy']

// Back and forth across `span` cells
function bounce(t: number, span: number): number {
  if (span <= 0) return 0
  const period = span * 2
  const p = t % period
  return p < span ? p : period - p
}

export type View = { frame: Frame; marks: Mark[]; x: number; line: string; isWorking: boolean }

// Tossing code in a pan: the food flies up and lands, sizzling in between
function cooking(t: number): { frame: Frame; marks: Mark[] } {
  const row = TOSS[t % TOSS.length]!
  const food = FOOD[Math.floor(t / TOSS.length) % FOOD.length]!
  const marks: Mark[] = [{ row, x: 11, text: food, fg: FOOD_COLOR, ...(row === 2 ? { bg: PAN_COLOR } : {}) }]
  if (row === 2) marks.push({ row: 1, x: t % 2 ? 10 : 13, text: '~', fg: SMOKE_COLOR })
  return { frame: COOK, marks }
}

// A turn is done: Clawd cheers this many ticks, then settles back
export const CELEBRATE_TICKS = 28
const SPARKLE = '#F2C14E'
const CONFETTI = [
  { x: 19, ch: '▄', fg: '#E58FD0' },
  { x: 22, ch: '▄', fg: '#F2C14E' },
  { x: 25, ch: '▄', fg: '#7FD1E8' },
  { x: 28, ch: '▄', fg: '#8DB360' },
  { x: 31, ch: '▄', fg: '#E07A5F' },
  { x: 34, ch: '▄', fg: '#6A9BCC' },
]

// Cheering at a finished turn: hopping with arms up, sparkles over its head and
// confetti falling beside it, then standing still with the check
function celebrating(since: number): { frame: Frame; marks: Mark[]; line: string } {
  const isUp = since % 4 < 2
  const isSettling = since >= CELEBRATE_TICKS - 8
  if (isSettling) return { frame: IDLE, marks: [], line: '✓ listo' }
  const marks: Mark[] = [
    { row: 0, x: 0, text: isUp ? '*' : '+', fg: SPARKLE },
    { row: 0, x: 7, text: isUp ? '+' : '*', fg: SPARKLE },
  ]
  // Each piece falls one row a tick and starts over from above the band
  CONFETTI.forEach((c, k) => {
    const row = (since + k * 3) % 5
    if (row < 4) marks.push({ row, x: c.x, text: c.ch, fg: c.fg })
  })
  const frame: Frame = isUp ? [HEAD_CHEER, BODY_ARMS_UP, LEGS_STEP] : [HEAD_JOY, BODY, LEGS]
  return { frame, marks, line: '¡listo!' }
}

// A smoke break: a draw every two seconds, two puffs on their way up
function smoking(t: number): { frame: Frame; marks: Mark[] } {
  const isDrawing = t % 8 < 2
  const marks = [0, 4].map(k => PUFF[Math.floor(((t + k) % 8) / 2)]!)
  return { frame: [isDrawing ? HEAD_DRAW : HEAD_SMOKE, BODY, LEGS], marks }
}

export function isSmoking(idleTicks: number): boolean {
  return (
    idleTicks >= SMOKE_FROM_TICKS &&
    idleTicks < SLEEP_AFTER_TICKS &&
    idleTicks % SMOKE_EVERY >= SMOKE_EVERY - SMOKE_TICKS
  )
}

// What Clawd shows at tick `t`, given how long the session has been idle and,
// when a turn just ended, how many ticks ago
export function view(
  t: number,
  idleTicks: number,
  isWorking: boolean,
  bodyColumns: number,
  since?: number,
): View {
  if (since !== undefined && since >= 0 && since < CELEBRATE_TICKS) {
    return { ...celebrating(since), x: 0, isWorking: true }
  }
  if (isWorking) {
    const line = WORKING_LINES[Math.floor(t / 24) % WORKING_LINES.length]!
    const pose = line.startsWith('cocinando') ? cooking(t) : { frame: DANCE[t % DANCE.length]!, marks: [] }
    // Walk one cell every other tick, within the band's width
    const span = Math.min(40, bodyColumns - Math.max(...pose.frame.map(r => r.length)) - 22)
    const dots = '.'.repeat((Math.floor(t / 2) % 3) + 1)
    return { ...pose, x: bounce(Math.floor(t / 2), span), line: line + dots, isWorking }
  }
  if (idleTicks >= SLEEP_AFTER_TICKS) {
    return { frame: BLINK, marks: [], x: 0, line: 'zzz', isWorking }
  }
  if (isSmoking(idleTicks)) {
    return { ...smoking(t), x: 0, line: 'en mi break', isWorking }
  }
  // Blink once every ~4s, sway every second
  return {
    frame: t % 16 === 15 ? BLINK : IDLE,
    marks: [],
    x: Math.floor(t / 4) % 2,
    line: IDLE_LINES[Math.floor(t / 40) % IDLE_LINES.length]!,
    isWorking,
  }
}

export function viewKey(v: View): string {
  return `${v.frame.join('|')}#${v.x}#${v.line}#${JSON.stringify(v.marks)}`
}
