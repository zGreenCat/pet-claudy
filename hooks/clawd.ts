// Clawd's poses: dancing, cooking code in a pan, a smoke break, asleep.
// Pure functions of the tick, so the timer can tell whether the drawing
// changed and the tests can drive it.

import type { Mark } from './desks'
import {
  CHEER,
  COFFEE,
  COOK as COOKING,
  COOL,
  DANCE as DANCING,
  DIZZY,
  HALF_TURN as TURN,
  IDEA,
  IDLE as WAITING,
  LOVE,
  MAGIC,
  MUSIC,
  READ,
  SLEEP,
  SMOKE,
  SUPER,
  WALK,
  shotAt,
} from './poses.ts'
import type { Eyes, GridCell, Shot } from './poses.ts'

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
//   p  an eye looking up (°); w an eye wide open (●); @ an eye spinning, dizzy
//   y z  a leg sticking up, upside down, left or right
//   m  an eye shut tight (━), for a face sunk half a cell
//   1 2 3  a book held low at its side, in front of its arm and body: a small light L of pages (1 their top,
//        2 their edge with the cover's spine beside it) inside the long blue
//        L of its cover (3); 4 a page turning. Over the body, the pages'
//        top (5) and a turning page (6) keep the orange behind them
//   n  a red collar along the top of the body; u a red cape showing below
//      the body, hanging half a cell past its legs; j J a leg in front of it,
//      left or right; k K the cape's edge stepping out a quarter, left or
//      right; e the cape blown up between the legs, its upper half
//   x X  a square mug, one cell high and two wide, coffee in the middle of
//        its top row; N its handle, toward Clawd
//   [ ]  a headphone's ear cup, left or right
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
// Reading: a book held low at its side, in front of its arm and body, and
// its eyes on it
const HEAD_READ = '.OROORO.'
const BODY_BOOK_OPEN = '^OOOOO52'
const BODY_BOOK_TURN = '^OOOOO62'
const LEGS_BOOK = '.aa..b33'
// Super Clawd: a collar, and a cape behind it showing below its body and
// hanging past its legs, its edges stepping out a little; then a fist up
// while the cape flaps in a wave. Each column of it either hangs down or is
// blown up: between the legs it shows its upper half, behind a leg it hides
const BODY_SUPER = '^nnnnnn^'
const BODY_SUPER_FIST = '^nnnnnn.'
const CAPE_DOWN = 'kjjuuJJK'
const CAPE_UP = 'kaaeebbK'
// A coffee break: a square mug in hand, the coffee showing in the middle of
// its top row, lifted to the mouth for a sip, eyes shut
const BODY_MUG = '^OOOOOO^NxX'
const HEAD_SIP = '.O-OO-OvNxX'
// Music: headphones on, the cups at its sides and the band arching clear of
// its head; eyes shut, a foot tapping
const HEAD_MUSIC = '[OmOOmO]'
// Magic: the rows run on blank past Clawd, room for the wand and its sparks
const SPELL_ROOM = '............'
// An idea: eyes up at the bulb, then wide open at the thought
const HEAD_LOOK_UP = '.OpOOpO.'
const HEAD_WIDE = '.OwOOwO.'
// Dizzy: eyes spinning; losing its balance, sunk half a cell; then fallen
// upside down, legs kicking in the air and its head on the ground
const HEAD_DIZZY = '.O@OO@O.'
const BODY_SINKING = 'vO@OO@Ov'
const FALLEN: Frame = ['.yy..zz.', 'vOOOOOOv', HEAD_DIZZY]
const FALLEN_KICK: Frame = ['.zz..yy.', 'vOOOOOOv', HEAD_DIZZY]

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

// Walking three-quarters on and half turned, as drawn in the workshop
export const WALK_STEPS: readonly (readonly string[])[] = WALK.map(shot => shot.px)
export const HALF_TURN = TURN.px
export const HALF_TURN_CELLS = TURN.cells ?? []

export const mirrored = (pixels: readonly string[]): string[] => pixels.map(row => [...row].reverse().join(''))
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

// The widest Clawd walks: with the pan out. Every pose walks the same span,
// so it does not jump when the pan comes out or goes away
const WALK_WIDTH = 14

// Where a working Clawd stands at tick `t`: one cell every other tick, back
// and forth within the band
export function walked(t: number, bodyColumns: number): number {
  return bounce(Math.floor(t / 2), Math.min(40, bodyColumns - WALK_WIDTH - 22))
}

// Where Clawd stands after `k` ticks of walking on its own feet: a cell a
// tick, back and forth over the same span
export function strolled(k: number, bodyColumns: number): number {
  return bounce(k, Math.min(40, bodyColumns - WALK_WIDTH - 22))
}

// Where Clawd's head is, for what it wears on it: up, sunk half a cell, or
// upside down on the ground. Undefined when the scene has something on it
// already (the headphones, the bulb)
export type Head = 'up' | 'sunk' | 'down'
// A pose drawn in pixels (`quarters`) is drawn so in place of its frame; the
// frame stays as the front-on Clawd for where only cells will do (the desks)
export type View = {
  frame: Frame
  marks: Mark[]
  x: number
  line: string
  isWorking: boolean
  head?: Head
  quarters?: readonly string[]
  eyes?: Eyes
  cells?: readonly GridCell[]
}

// The head of a pose, read off its frame, so no pose has to say: legs in the
// top row mean it has fallen, a top row of raised halves means it has sunk
export function headOf(frame: Frame): Head {
  if (/[yz]/.test(frame[0])) return 'down'
  if (frame[0].startsWith('.vvvvvv.')) return 'sunk'
  return 'up'
}

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
export type Mood = 'cool' | 'love' | 'idea' | 'magic' | 'super' | 'dizzy'
export type Moment = { mood: Mood; since: number }
export const MOMENT_TICKS: Record<Mood, number> = { cool: 24, love: 20, idea: 16, magic: 16, super: 24, dizzy: 32 }
const HEART = '#E5484D'
const BULB = '#F2C14E'
// A wooden wand with a white tip
const WAND = '#A07A5A'
const WAND_TIP = '#FFFFFF'
const STEAM = '#B8BCC4'

const PHONES = '#2E6FD0'
// Notes off the headphones, drawn in quarter blocks: a head and a stem
const NOTE = '▟'
const NOTE_COLORS = ['#7FD1E8', '#E58FD0']
// Sparks a flicked wand throws: where each starts past the wand's tip and its
// color; they drift away and twinkle
const SPARKS = [
  { row: 1, dx: 0, text: '*', fg: '#F2C14E' },
  { row: 0, dx: 2, text: '+', fg: '#F2C14E' },
  { row: 2, dx: 3, text: '*', fg: '#E58FD0' },
  { row: 3, dx: 1, text: '·', fg: '#F2C14E' },
  { row: 1, dx: 5, text: '·', fg: '#7FD1E8' },
]
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
function moment(m: Moment): { frame: Frame; marks: Mark[]; line: string; dx?: number } {
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
    case 'magic': {
      // An arm lifts the wand, its tip glints; a flick down, eyes squeezed,
      // and sparks fly off the tip and drift away twinkling
      const room = (frame: Frame): Frame => [frame[0] + SPELL_ROOM, frame[1] + SPELL_ROOM, frame[2] + SPELL_ROOM]
      // As thin as the cigarette, a quarter of a cell: two cells up from the
      // hand, then three along the arm, the last one its white tip
      const wandUp: Mark[] = [
        { row: 1, x: 8, text: '▎', fg: WAND },
        { row: 0, x: 8, text: '▎', fg: WAND_TIP },
      ]
      if (s < 2) return { frame: room([HEAD_ARM_LIFTED, BODY_ARM_LIFTED, LEGS]), marks: wandUp, line: 'abra…' }
      if (s < 4) {
        return { frame: room([HEAD_ARM_LIFTED, BODY_ARM_LIFTED, LEGS]), marks: [...wandUp, { row: 0, x: 9, text: '*', fg: BULB }], line: 'abra…' }
      }
      const wand: Mark[] = [
        { row: 1, x: 8, text: '▂▂', fg: WAND },
        { row: 1, x: 10, text: '▂', fg: WAND_TIP },
      ]
      const drift = Math.floor((s - 4) / 3)
      const sparks = SPARKS.filter((_, k) => (s + k) % 3 !== 0).map(p => ({ row: p.row, x: 12 + p.dx + drift, text: p.text, fg: p.fg }))
      if (s < 6) return { frame: room([HEAD_JOY, BODY, LEGS]), marks: [...wand, ...sparks], line: '¡cadabra!' }
      return { frame: room(IDLE), marks: [...wand, ...sparks], line: '¡magia!' }
    }
    case 'super':
      // The cape and collar come on; then a fist goes up and the cape flaps
      if (s < 4) return { frame: [HEAD, BODY_SUPER, CAPE_DOWN], marks: [], line: '¡súper!' }
      return { frame: [HEAD_ARM_LIFTED, BODY_SUPER_FIST, capeWave(Math.floor(s / 2))], marks: [], line: '¡súper Clawd!' }
    case 'dizzy': {
      // A start, eyes wide; then eyes spinning while it sways side to side
      // under circling stars; it loses its balance and falls upside down, legs
      // kicking; then it gets up, blinks, and shakes it off
      const stars: Mark[] = [
        { row: 0, x: 1 + (s % 6), text: '*', fg: BULB },
        { row: 0, x: 1 + ((s + 3) % 6), text: '·', fg: BULB },
      ]
      if (s < 2) return { frame: [HEAD_WIDE, BODY, LEGS], marks: [], line: '¿eh?' }
      if (s < 12) {
        const sway = Math.floor(s / 2) % 2
        return { frame: [HEAD_DIZZY, BODY, sway ? LEGS_STEP : LEGS], marks: stars, line: 'mareado…', dx: sway }
      }
      if (s < 14) return { frame: [HEAD_BREATH.slice(0, 8), BODY_SINKING, LEGS], marks: stars, line: '¡uy!', dx: 1 }
      if (s < 24) return { frame: (s - 14) % 4 < 2 ? FALLEN : FALLEN_KICK, marks: stars, line: 'ay…' }
      if (s < 28) return { frame: [s < 26 ? HEAD_BLINK : HEAD, BODY, LEGS], marks: [], line: 'uf…', dx: s % 2 }
      return { frame: IDLE, marks: [], line: 'uf…' }
    }
  }
}

// Reading, `since` ticks into it: its eyes on the book, a blink now and then,
// and every so often a page turns
function reading(since: number): { frame: Frame; marks: Mark[]; line: string } {
  const head = since % 16 === 11 ? HEAD_BLINK : HEAD_READ
  const body = since % 16 >= 14 ? BODY_BOOK_TURN : BODY_BOOK_OPEN
  return { frame: [head, body, LEGS_BOOK], marks: [], line: 'leyendo…' }
}

// The cape in a wave, `phase` steps along: each column hangs down or is blown
// up, in runs of two that travel across it
function capeWave(phase: number): string {
  return [...CAPE_DOWN].map((down, c) => ((c + phase) % 4 < 2 ? down : CAPE_UP[c]!)).join('')
}

// Headphones on while a long command runs: the band over its head, notes
// drifting up off it, and a foot tapping to the beat
function listening(since: number): { frame: Frame; marks: Mark[]; line: string } {
  const band: Mark = { row: 0, x: 0, text: '╭──────╮', fg: PHONES }
  const k = Math.floor(since / 4)
  const note: Mark = { row: since % 4 < 2 ? 1 : 0, x: 9 + (since % 4 < 2 ? 0 : 1) + (k % 2) * 2, text: NOTE, fg: NOTE_COLORS[k % NOTE_COLORS.length]! }
  return { frame: [HEAD_MUSIC, BODY, since % 4 < 2 ? LEGS : LEGS_TAP], marks: [band, note], line: 'musiquita…' }
}

// A coffee break: steam curling up off the mug, and every so often a sip
function coffee(t: number): { frame: Frame; marks: Mark[] } {
  if (t % 16 < 3) return { frame: [HEAD_SIP, BODY_ARM_LIFTED, LEGS], marks: [] }
  const marks: Mark[] = [{ row: 1, x: t % 4 < 2 ? 9 : 10, text: '~', fg: STEAM }]
  return { frame: [HEAD, BODY_MUG, LEGS], marks }
}

// Which break an idle Clawd is on: they take turns, a smoke then a coffee
function isCoffeeBreak(idleTicks: number): boolean {
  return Math.floor(idleTicks / SMOKE_EVERY) % 2 === 1
}

// Tools that read: enough of them in a row and Clawd sits down to read
const READS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch'])
// How many reads, within how many ticks, start it; how long without one ends it
export const READS_TO_START = 3
export const READS_WINDOW_TICKS = 20
export const READING_LINGER_TICKS = 12
// How long a command must run before the headphones go on
export const MUSIC_AFTER_TICKS = 8
// Subagents spawned within this many ticks of each other make Clawd super
export const SUPER_WINDOW_TICKS = 8
// Tool calls of the main loop that fail in a row before Clawd gets dizzy
export const ERRORS_TO_DIZZY = 3

export function isRead(tool: string): boolean {
  return READS.has(tool)
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
// nothing started yet), an idea; a skill, magic
export function cueOf(tool: string, input: Record<string, unknown>, isOk: boolean): Mood | undefined {
  if (!isOk) return undefined
  if (tool === 'Bash' && typeof input.command === 'string') {
    return TESTS.test(input.command) || COMMIT.test(input.command) ? 'cool' : undefined
  }
  if (tool === 'ExitPlanMode') return 'idea'
  if (tool === 'Skill') return 'magic'
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

// Working, `s` ticks into dancing: the line changing every six seconds, and
// one line in four cooking code in a pan. 24 ticks is three tosses and four
// turns of the dance, so each line ends with the food in the pan or the feet
// together
function dancing(s: number): Pose {
  const line = WORKING_LINES[Math.floor(s / 24) % WORKING_LINES.length]!
  const pose = isCookingAt(s) ? cooking(s) : { frame: DANCE[s % DANCE.length]!, marks: [] }
  const dots = '.'.repeat((Math.floor(s / 2) % 3) + 1)
  return { ...pose, line: line + dots }
}

// What Clawd does stopped at work, `s` ticks into its stops: the dance, or the pan
const stopped = (s: number) => (isCookingAt(s) ? COOKING : DANCING)

function isCookingAt(s: number): boolean {
  return WORKING_LINES[Math.floor(s / 24) % WORKING_LINES.length]!.startsWith('cocinando')
}

// Work goes in rounds: a stretch walking three-quarters on, a turn to face
// front, a stop to dance or cook as before, and a turn back. The dance and the
// pan keep their own count across rounds, so their lines go on turning
export const WALK_TICKS = 12
export const STOP_TICKS = 16
const TURN_TICKS = 1
const ROUND = WALK_TICKS + TURN_TICKS + STOP_TICKS + TURN_TICKS

// A turn is `in` from walking to the stop, `out` from the stop to walking
type Round = { phase: 'walk' | 'turn' | 'stop'; danced: number; turn?: 'in' | 'out' }
function round(s: number): Round {
  const k = s % ROUND
  const before = Math.floor(s / ROUND) * STOP_TICKS
  if (k < WALK_TICKS) return { phase: 'walk', danced: before }
  if (k < WALK_TICKS + TURN_TICKS) return { phase: 'turn', danced: before, turn: 'in' }
  if (k < WALK_TICKS + TURN_TICKS + STOP_TICKS) return { phase: 'stop', danced: before + k - WALK_TICKS - TURN_TICKS }
  return { phase: 'turn', danced: before + STOP_TICKS, turn: 'out' }
}

// Working, `s` ticks into it and `half` a tick on: walking takes a step every
// half tick, the rest goes by whole ticks
function working(s: number, half = 0): Pose {
  const r = round(s)
  // Stopped, the dance or the pan as drawn in the workshop; the cells' own stand in at the desks
  if (r.phase === 'stop') {
    const { frame, line } = dancing(r.danced)
    return drawn(stopped(r.danced), line, frame)(r.danced)
  }
  const { line } = dancing(r.danced)
  if (r.phase === 'turn') return { frame: IDLE, marks: [], line, turning: r.turn }
  const stride = WALK[(s * 2 + half) % WALK.length]!
  return { frame: IDLE, marks: [], line, quarters: stride.px, ...(stride.cells ? { cells: stride.cells } : {}), walking: true }
}

// Waiting, `s` ticks into it: a blink once every ~4s, a sway every second
function idling(s: number): Pose {
  return {
    frame: s % 16 === 15 ? BLINK : IDLE,
    marks: [],
    line: IDLE_LINES[Math.floor(s / 40) % IDLE_LINES.length]!,
    dx: Math.floor(s / 4) % 2,
  }
}

// What Clawd shows at tick `t`, given how long the session has been idle,
// when a turn just ended how many ticks ago, the moment it is having, how
// many ticks it has been reading, and how long a command has been running.
// It has no memory of what it showed before: the director (`director.ts`)
// is what lets a scene end before the next one begins
export function view(
  t: number,
  idleTicks: number,
  isWorking: boolean,
  bodyColumns: number,
  since?: number,
  now?: Moment,
  readingFor?: number,
  runningFor?: number,
): View {
  const v = bare(t, idleTicks, isWorking, bodyColumns, since, now, readingFor, runningFor)
  return 'head' in v ? v : { ...v, head: headOf(v.frame) }
}

function bare(
  t: number,
  idleTicks: number,
  isWorking: boolean,
  bodyColumns: number,
  since?: number,
  now?: Moment,
  readingFor?: number,
  runningFor?: number,
): View {
  if (since !== undefined && since >= 0 && since < CELEBRATE_TICKS) {
    return { ...celebrating(since), x: 0, isWorking: true }
  }
  if (now && now.since >= 0 && now.since < MOMENT_TICKS[now.mood]) {
    // It stops where it stood when the moment began, and walks on from there
    const x = isWorking ? walked(Math.max(0, t - now.since), bodyColumns) : 0
    const { dx = 0, ...scene } = moment(now)
    return { ...scene, x: x + dx, isWorking, ...(now.mood === 'idea' ? { head: undefined } : {}) }
  }
  if (isWorking && readingFor !== undefined && readingFor >= 0) {
    // It stops where it stood to read, and walks on from there after
    return { ...reading(readingFor), x: walked(Math.max(0, t - readingFor), bodyColumns), isWorking }
  }
  if (isWorking && runningFor !== undefined && runningFor >= MUSIC_AFTER_TICKS) {
    const listened = runningFor - MUSIC_AFTER_TICKS
    return { ...listening(listened), x: walked(Math.max(0, t - listened), bodyColumns), isWorking, head: undefined }
  }
  if (isWorking) {
    return { ...dancing(t), x: walked(t, bodyColumns), isWorking }
  }
  if (idleTicks >= SLEEP_AFTER_TICKS) {
    return { frame: BLINK, marks: [], x: 0, line: 'zzz', isWorking }
  }
  if (isSmoking(idleTicks)) {
    if (isCoffeeBreak(idleTicks)) return { ...coffee(t), x: 0, line: 'un cafecito', isWorking }
    return { ...smoking(t), x: 0, line: 'en mi break', isWorking }
  }
  const { dx = 0, ...pose } = idling(t)
  return { ...pose, x: dx, isWorking }
}

// The scenes Clawd plays, each from its own first frame. A loop (working,
// reading, a break) runs while it is wanted and gives way only where it can
// stop cleanly; a scene with a length (a moment, the cheer) plays to its end
export type SceneId = 'celebrate' | Mood | 'read' | 'music' | 'work' | 'sleep' | 'smoke' | 'coffee' | 'idle'
// `walking`: a step on its own feet, facing where it goes; `turning`: from
// the walk to front-on (`in`) or back (`out`). The director knows which way
// Clawd goes: it mirrors the drawing going left and half turns it
export type Pose = {
  frame: Frame
  marks: Mark[]
  line: string
  dx?: number
  quarters?: readonly string[]
  eyes?: Eyes
  cells?: readonly GridCell[]
  walking?: boolean
  turning?: 'in' | 'out'
}
// Where it stands: walking about the band, still where it stood, or at its
// spot at the left
export type Place = 'walk' | 'stand' | 'home'
export type Scene = {
  place: Place
  // Where it stands `s` ticks in, for a scene that walks only part of the time
  placeAt?: (s: number) => Place
  // Ticks a scene with an end lasts
  length?: number
  // Ticks a loop holds at least once it begins, so it does not flicker
  minTicks?: number
  // Whether a loop `s` ticks in may give way: not mid-toss nor mid-sip
  canLeave?: (s: number) => boolean
  play: (s: number, half?: number) => Pose
  // A short way out before the next scene: the book closes, the headphones
  // come off. Clawd stands where it stood meanwhile
  exit?: { ticks: number; play: (s: number) => Pose }
  // Something already on its head, way out included: nothing else goes there
  coversHead?: boolean
}

// A scene drawn in the workshop: its shots in a loop, over the front-on frame
// that stands in for it where only cells will do (the desks)
function drawn(shots: readonly Shot[], line: string, frame: Frame = IDLE) {
  return (s: number): Pose => {
    const { px, eyes, cells } = shotAt(shots, s)
    return { frame, marks: [], line, quarters: px, ...(eyes ? { eyes } : {}), ...(cells ? { cells } : {}) }
  }
}

// The cheer drawn in the workshop; its frame and line as the cells cheer
function cheering(s: number): Pose {
  const { frame, line } = celebrating(s)
  return drawn(CHEER, line, frame)(s)
}

// A way out half turned, then front-on: what it held is put away
function putAway(line: string): Scene['exit'] {
  return {
    ticks: 2,
    play: s => (s === 0 ? { frame: IDLE, marks: [], line, quarters: HALF_TURN, cells: HALF_TURN_CELLS } : { frame: IDLE, marks: [], line }),
  }
}

// A moment as drawn in the workshop, its line as the cells say it
const MOMENT_SHOTS: Record<Mood, readonly Shot[]> = { cool: COOL, love: LOVE, idea: IDEA, magic: MAGIC, super: SUPER, dizzy: DIZZY }
function momentScene(mood: Mood): Scene {
  return {
    place: 'stand',
    length: MOMENT_TICKS[mood],
    play: s => {
      const { frame, line } = moment({ mood, since: s })
      return drawn(MOMENT_SHOTS[mood], line, frame)(s)
    },
  }
}

export const SCENES: Record<SceneId, Scene> = {
  // Where it stood when the turn ended, not back at its spot: no jump to cheer
  celebrate: { place: 'stand', length: CELEBRATE_TICKS, play: cheering },
  cool: momentScene('cool'),
  love: momentScene('love'),
  // The bulb hangs where a hat would sit
  idea: { ...momentScene('idea'), coversHead: true },
  magic: momentScene('magic'),
  super: momentScene('super'),
  dizzy: momentScene('dizzy'),
  read: { place: 'stand', minTicks: 4, play: drawn(READ, 'leyendo…'), exit: putAway('leyendo…') },
  music: {
    place: 'stand',
    minTicks: 4,
    // On a beat: every shot of the groove is one
    canLeave: s => s % 2 === 0,
    coversHead: true,
    play: drawn(MUSIC, 'musiquita…'),
    exit: putAway('musiquita…'),
  },
  work: {
    place: 'walk',
    placeAt: s => (round(s).phase === 'walk' ? 'walk' : 'stand'),
    minTicks: 4,
    // Walking, at the end of a step; stopped, a tick after a hop, a spin or
    // a toss is over, so the landing shows
    canLeave: s => {
      const r = round(s)
      if (r.phase === 'walk') return s % 2 === 0
      if (r.phase === 'turn') return true
      return !shotAt(stopped(r.danced), r.danced).busy && !shotAt(stopped(r.danced), Math.max(0, r.danced - 1)).busy
    },
    play: working,
  },
  sleep: { place: 'home', play: drawn(SLEEP, 'zzz', BLINK) },
  // Not mid-puff nor mid-sip
  smoke: { place: 'home', minTicks: 4, canLeave: s => !shotAt(SMOKE, s).busy, play: drawn(SMOKE, 'en mi break') },
  coffee: { place: 'home', minTicks: 4, canLeave: s => !shotAt(COFFEE, s).busy, play: drawn(COFFEE, 'un cafecito') },
  idle: { place: 'home', play: s => ({ ...drawn(WAITING, idling(s).line)(s) }) },
}

// What Clawd is up to, as the director sees it
export type Context = { idleTicks: number; isWorking: boolean; readingFor?: number; runningFor?: number }

// The loop the context asks for; moments and the cheer come as events instead
export function want(c: Context): SceneId {
  if (c.isWorking && c.readingFor !== undefined && c.readingFor >= 0) return 'read'
  if (c.isWorking && c.runningFor !== undefined && c.runningFor >= MUSIC_AFTER_TICKS) return 'music'
  if (c.isWorking) return 'work'
  if (c.idleTicks >= SLEEP_AFTER_TICKS) return 'sleep'
  if (isSmoking(c.idleTicks)) return isCoffeeBreak(c.idleTicks) ? 'coffee' : 'smoke'
  return 'idle'
}

export function viewKey(v: View): string {
  return `${v.frame.join('|')}#${v.quarters?.join('|') ?? ''}#${v.eyes ?? ''}#${v.cells ? JSON.stringify(v.cells) : ''}#${v.x}#${v.line}#${JSON.stringify(v.marks)}`
}
