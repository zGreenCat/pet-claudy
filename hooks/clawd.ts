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
//   s  sunglasses' band, the cell's lower half; S a lens, its upper half;
//      l and r a lens's inner edge, the upper left or right quarter
//   p  an eye looking up (°); w an eye wide open (●)
//   m  an eye shut tight (━), for a face sunk half a cell
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
// The right pair tapping: one leg in, one out
const LEGS_TAP = '.aa..ab.'
// An arm out to a pan
const BODY_PAN = '^OOOOOO^hhPPPP'
// A thin cigarette at the mouth, its ember dim, then drawn on with the eyes shut
const HEAD_SMOKE = '.O┓OO┏OcccC'
const HEAD_DRAW = '.O-OO-OcccY'
// Cheering: eyes squeezed with joy, the arms going up and down
const HEAD_CHEER = 'vO>OO<Ov'
const HEAD_JOY = '.O>OO<O.'
// Cool: one arm lifts a little, sweeps down over the face, and the glasses
// are on: a dark band across the face and two wide lenses below it
const HEAD_ARM_LIFTED = '.OLOOROv'
const BODY_ARM_LIFTED = '^OOOOOO.'
const HEAD_COOL_SWEEP = '.ssssssv'
const BODY_COOL_SWEEP = '^OSlrSO.'
const HEAD_COOL = '.ssssss.'
const BODY_COOL = '^OSlrSO^'
// Love: a deep breath, the head sinking half a cell over legs that stay put,
// eyes shut; then eyes squeezed with joy. The rows run on blank past Clawd to
// leave room for the heart beside it
const ROOM = '.....'
const HEAD_BREATH = '.vvvvvv.' + ROOM
const BODY_BREATH = 'vOmOOmOv' + ROOM
// An idea: eyes up at the bulb, then wide open at the thought
const HEAD_LOOK_UP = '.OpOOpO.'
const HEAD_WIDE = '.OwOOwO.'

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

// Where a working Clawd `width` cells wide stands at tick `t`: one cell every
// other tick, back and forth within the band
function walked(t: number, width: number, bodyColumns: number): number {
  return bounce(Math.floor(t / 2), Math.min(40, bodyColumns - width - 22))
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

// A moment: something went well, someone said thanks, a plan came together.
// It shows for a few seconds over whatever Clawd was doing, then lets go
export type Mood = 'cool' | 'love' | 'idea'
export type Moment = { mood: Mood; since: number }
export const MOMENT_TICKS: Record<Mood, number> = { cool: 24, love: 20, idea: 16 }
const HEART = '#E5484D'
const BULB = '#F2C14E'
const BULB_OFF = '#B8BCC4'

// A cell's quarters as a glyph, by the quarters lit: 1 upper left, 2 upper
// right, 4 lower left, 8 lower right
const QUARTERS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'

// A picture in quarter blocks: two pixel rows and two pixel columns to a
// cell, X lit; each row of cells is a mark's text
function quarters(pixels: string[]): string[] {
  const rows: string[] = []
  for (let r = 0; r < pixels.length; r += 2) {
    let row = ''
    const width = Math.max(...pixels.map(p => p.length))
    for (let c = 0; c < width; c += 2) {
      const lit = [pixels[r]?.[c], pixels[r]?.[c + 1], pixels[r + 1]?.[c], pixels[r + 1]?.[c + 1]]
      row += QUARTERS[lit.reduce((m, p, k) => (p === 'X' ? m | (1 << k) : m), 0)]
    }
    rows.push(row)
  }
  return rows
}

// A big heart, Clawd's height, and the same heart a beat smaller
const HEART_BIG = quarters(['.XX.XX..', 'XXXXXXX.', 'XXXXXXX.', '.XXXXX..', '..XXX...', '...X....'])
const HEART_SMALL = quarters(['........', '.XX.XX..', '.XXXXX..', '..XXX...', '...X....', '........'])
const HEART_X = 9

function heart(picture: string[]): Mark[] {
  return picture.map((text, i) => ({ row: 1 + i, x: HEART_X, text, fg: HEART }))
}

// Each moment is a short scene Clawd acts out
function moment(m: Moment): { frame: Frame; marks: Mark[]; line: string } {
  const s = m.since
  switch (m.mood) {
    case 'cool':
      // An arm lifts a little, sweeps down over the face, and the glasses are
      // on; then it taps a foot
      if (s < 3) return { frame: [HEAD_ARM_LIFTED, BODY_ARM_LIFTED, LEGS], marks: [], line: 'momento…' }
      if (s < 5) return { frame: [HEAD_COOL_SWEEP, BODY_COOL_SWEEP, LEGS], marks: [], line: 'momento…' }
      return { frame: [HEAD_COOL, BODY_COOL, s % 8 < 4 ? LEGS : LEGS_TAP], marks: [], line: 'todo en verde' }
    case 'love': {
      // It stays put: a deep breath with its eyes shut, then eyes squeezed
      // with joy while a heart pops up beside it and beats
      if (s < 2) return { frame: [HEAD + ROOM, BODY, LEGS], marks: [], line: '…' }
      if (s < 6) return { frame: [HEAD_BREATH, BODY_BREATH, LEGS], marks: [], line: '…' }
      const head: Frame = [HEAD_JOY + ROOM, BODY, LEGS]
      if (s < 8) return { frame: head, marks: [{ row: 2, x: HEART_X + 1, text: '♥', fg: HEART }], line: '¡de nada!' }
      return { frame: head, marks: heart(s % 4 < 2 ? HEART_BIG : HEART_SMALL), line: '¡de nada!' }
    }
    case 'idea': {
      // The bulb shows up dim; it looks up at it and the bulb lights; then it
      // looks ahead with its eyes wide at the thought, the rays coming and going
      const isLit = s >= 4
      const bulb: Mark = { row: 0, x: 4, text: '●', fg: isLit ? BULB : BULB_OFF }
      const rays: Mark[] = s >= 6 && (s - 6) % 4 < 2 ? [{ row: 0, x: 3, text: '\\', fg: BULB }, { row: 0, x: 5, text: '/', fg: BULB }] : []
      if (s < 2) return { frame: IDLE, marks: [bulb], line: 'mmm…' }
      if (s < 6) return { frame: [HEAD_LOOK_UP, BODY, LEGS], marks: [bulb], line: isLit ? '¡oh!' : 'mmm…' }
      return { frame: [s < 10 ? HEAD_WIDE : HEAD, BODY, LEGS], marks: [bulb, ...rays], line: '¡idea!' }
    }
  }
}

const THANKS = /\b(gracias|grax|thanks|thank you|thx)\b|<3|❤|♥/i
// A command that runs a test suite, not one that only names a tests folder
const TESTS = /\b(npm|pnpm|yarn|bun)\s+(run\s+)?test\b|\b(go|cargo|deno|bun|plugin|make)\s+test\b|\b(vitest|jest|pytest|mocha|rspec|phpunit)\b/
const COMMIT = /\bgit\s+(commit|push)\b/

// Whether a prompt thanks Claude
export function isThanks(text: string): boolean {
  return THANKS.test(text)
}

// The moment a finished tool call earns, if any: tests that pass or a commit
// that lands, cool; a plan just made (ExitPlanMode, or a todo list with
// nothing started yet), an idea
export function cueOf(tool: string, input: Record<string, unknown>, isOk: boolean): Mood | undefined {
  if (!isOk) return undefined
  if (tool === 'Bash' && typeof input.command === 'string') {
    return TESTS.test(input.command) || COMMIT.test(input.command) ? 'cool' : undefined
  }
  if (tool === 'ExitPlanMode') return 'idea'
  if (tool === 'TodoWrite' && Array.isArray(input.todos) && input.todos.length > 0) {
    const isFresh = input.todos.every(t => typeof t === 'object' && t !== null && (t as { status?: unknown }).status === 'pending')
    return isFresh ? 'idea' : undefined
  }
  return undefined
}

export function isSmoking(idleTicks: number): boolean {
  return (
    idleTicks >= SMOKE_FROM_TICKS &&
    idleTicks < SLEEP_AFTER_TICKS &&
    idleTicks % SMOKE_EVERY >= SMOKE_EVERY - SMOKE_TICKS
  )
}

// What Clawd shows at tick `t`, given how long the session has been idle,
// when a turn just ended how many ticks ago, and the moment it is having
export function view(
  t: number,
  idleTicks: number,
  isWorking: boolean,
  bodyColumns: number,
  since?: number,
  now?: Moment,
): View {
  if (since !== undefined && since >= 0 && since < CELEBRATE_TICKS) {
    return { ...celebrating(since), x: 0, isWorking: true }
  }
  if (now && now.since >= 0 && now.since < MOMENT_TICKS[now.mood]) {
    // It stops where it stood when the moment began, and walks on from there
    const x = isWorking ? walked(Math.max(0, t - now.since), WIDTH, bodyColumns) : 0
    return { ...moment(now), x, isWorking }
  }
  if (isWorking) {
    const line = WORKING_LINES[Math.floor(t / 24) % WORKING_LINES.length]!
    const pose = line.startsWith('cocinando') ? cooking(t) : { frame: DANCE[t % DANCE.length]!, marks: [] }
    const dots = '.'.repeat((Math.floor(t / 2) % 3) + 1)
    const width = Math.max(...pose.frame.map(r => r.length))
    return { ...pose, x: walked(t, width, bodyColumns), line: line + dots, isWorking }
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
