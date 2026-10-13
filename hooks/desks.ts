// The desks scene: while subagents run, each one shows up beside Clawd as a
// small buddy typing at its own laptop, code marks floating over its head and
// a bubble saying what that agent is doing. Pure functions of the tick and the
// agent list, so the timer can tell whether the drawing changed and the tests
// can drive it.

export type Agent = {
  id: string
  type: string
  // What its last tool call was doing; the Agent call's description until then
  activity: string
  // Where it stands now, cells from the first desk's left end
  x: number
  bornAt: number
  // The tick its loop finished, and what it came back with
  doneAt?: number
  result?: string
}

export type Style = { bg?: string; fg?: string; dim?: boolean; italic?: boolean; bold?: boolean }
export type Segment = { text: string; style: Style }

export const ROWS = 4
// Clawd's 9 cells and a gap
const DESKS_X = 11
// A buddy at its laptop, in cells
const SPRITE = 10
// Where the buddy's body starts inside that, so a walking one lines up with it
const BODY_X = 5
// Where a new buddy starts: stepping out of Clawd
export const START_X = 4 - DESKS_X - BODY_X
// A desk: the sprite and a small gap to the next
const SLOT = 13
// Cells a buddy walks per tick
const STEP = 2
// Each working buddy holds the floor this long
const SPEAK_TICKS = 12
// A finished buddy shows its result this long, then walks off
const RESULT_TICKS = 16

const EYE_COLOR = '#1A1A1A'
const DONE_COLOR = '#8DB360'
const PALETTE = ['#6A9BCC', '#8DB360', '#C77DBB', '#D4A23C', '#5FB3A9', '#E07A5F']
const MARKS = ['=>', '++', '{}', '</>', '()', '&&', ';;', '#!']
const MARK_COLORS = ['#E58FD0', '#F2C14E', '#7FD1E8']

// Pixel colors: O Clawd, K eye, G laptop, L a lit key; . nothing
const PIXEL: Record<string, string> = { O: 'claude', K: EYE_COLOR, G: '#6B7280', L: '#F3EFE6' }

// Sprites are four pixel rows, drawn two to a cell with half blocks.
// At the laptop, two frames of typing: the arm down on a key, then up.
const TYPING = [
  ['G....OOOOO', 'G....OKOKO', '.G..OOOOOO', '.GLGGO.O.O'],
  ['G....OOOOO', 'G...OOKOKO', '.G...OOOOO', '.GGLGO.O.O'],
]
// Done: the laptop shut, the arm resting
const DONE = ['.....OOOOO', '.....OKOKO', '.....OOOOO', '.GGGGO.O.O']
// Walking, no laptop: two steps
const WALKING = [
  ['OOOOO', 'OKOKO', 'OOOOO', 'O.O.O'],
  ['OOOOO', 'OKOKO', 'OOOOO', '.O.O.'],
]

function blink(sprite: string[]): string[] {
  return sprite.map(row => row.replace(/K/g, 'O'))
}

// One color per agent type, the same every session
export function colorOf(type: string): string {
  let h = 0
  for (const c of type) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]!
}

export function oneLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function baseName(p: string): string {
  return p.split(/[\\/]/).filter(Boolean).pop() ?? p
}

// A few words for a tool call, from its name and arguments
export function describe(tool: string, input: Record<string, unknown>): string {
  const s = (k: string) => (typeof input[k] === 'string' ? oneLine(input[k] as string) : '')
  switch (tool) {
    case 'Read':
      return `leyendo ${baseName(s('file_path'))}`
    case 'Edit':
    case 'MultiEdit':
      return `editando ${baseName(s('file_path'))}`
    case 'NotebookEdit':
      return `editando ${baseName(s('notebook_path'))}`
    case 'Write':
      return `escribiendo ${baseName(s('file_path'))}`
    case 'Grep':
      return `buscando "${s('pattern')}"`
    case 'Glob':
      return `buscando ${s('pattern')}`
    case 'Bash':
    case 'PowerShell':
      return s('description') || `$ ${s('command')}`
    case 'WebSearch':
      return `googleando "${s('query')}"`
    case 'WebFetch': {
      const m = /^[a-z]+:\/\/([^/]+)/i.exec(s('url'))
      return `leyendo ${m ? m[1] : 'la web'}`
    }
    case 'Agent':
      return `delegando: ${s('description')}`
    case 'TodoWrite':
      return 'planeando'
    default:
      return tool.startsWith('mcp__') ? tool.split('__').pop()! : tool
  }
}

// The first line of a subagent's last message, without markdown marks
export function summary(message: string | undefined): string {
  const line = (message ?? '').split('\n').map(l => l.replace(/^[\s#>*`-]+/, '').trim()).find(Boolean)
  return line ? line.replace(/[*`]/g, '') : 'listo'
}

type Seats = { slot: number; shown: Agent[]; more: number }

function seats(agents: Agent[], bodyColumns: number): Seats {
  const room = Math.max(SLOT, bodyColumns - DESKS_X - 1)
  // Too many for the room: keep four cells at the end for the count
  const usable = agents.length > Math.floor(room / SLOT) ? room - 4 : room
  const shown = agents.slice(0, Math.max(1, Math.floor(usable / SLOT)))
  return { slot: SLOT, shown, more: agents.length - shown.length }
}

function isLeaving(a: Agent, t: number): boolean {
  return a.doneAt !== undefined && t - a.doneAt >= RESULT_TICKS
}

// One tick of walking: each buddy steps toward its desk, a leaving one back
// into Clawd, the way it came, where it is dropped
export function walk(agents: Agent[], t: number, bodyColumns: number): Agent[] {
  const { slot, shown } = seats(agents, bodyColumns)
  const out: Agent[] = []
  agents.forEach((a, i) => {
    if (i >= shown.length) return out.push(a)
    const target = isLeaving(a, t) ? START_X : i * slot
    const x = a.x < target ? Math.min(target, a.x + STEP) : Math.max(target, a.x - STEP)
    if (isLeaving(a, t) && x <= START_X) return
    out.push(x === a.x ? a : { ...a, x })
  })
  return out
}

type Cell = { ch: string; style: Style }

const NONE: Style = {}

function put(row: Cell[], x: number, text: string, style: Style) {
  for (const ch of text) {
    if (x >= 0 && x < row.length) row[x] = { ch, style }
    x += 1
  }
}

// Clawd's own sprite, a cell per pixel, and what it holds; . is empty
const CELL: Record<string, Cell> = {
  // Orange cell; one with a dark eye in its lower half; one with a closed eye
  O: { ch: ' ', style: { bg: 'claude', fg: EYE_COLOR } },
  E: { ch: '▄', style: { bg: 'claude', fg: EYE_COLOR } },
  '-': { ch: '▁', style: { bg: 'claude', fg: EYE_COLOR } },
  // A pan's handle, low and thin, and its pan
  h: { ch: '▄', style: { fg: '#8B5A2B' } },
  P: { ch: ' ', style: { bg: '#6B7280' } },
  // A cigarette, thin as a line, and its ember dim and drawn on
  c: { ch: '▂', style: { fg: '#EDEDED' } },
  C: { ch: '▂', style: { fg: '#C2410C' } },
  Y: { ch: '▂', style: { fg: '#FFB347' } },
}

function paintCells(row: Cell[], x: number, sprite: string) {
  ;[...sprite].forEach((kind, i) => {
    const cell = CELL[kind]
    if (cell && x + i >= 0 && x + i < row.length) row[x + i] = cell
  })
}

// A sprite of two pixel rows per cell row: a cell whose pixels match is its
// background, so whole cells leave no seam; a half is a ▀ or ▄
function paintPixels(rows: Cell[][], top: number, x: number, sprite: string[]) {
  for (let r = 0; r * 2 < sprite.length; r++) {
    const row = rows[top + r]!
    const upper = sprite[r * 2]!
    const lower = sprite[r * 2 + 1] ?? ''
    for (let i = 0; i < Math.max(upper.length, lower.length); i++) {
      if (x + i < 0 || x + i >= row.length) continue
      const a = PIXEL[upper[i] ?? '.']
      const b = PIXEL[lower[i] ?? '.']
      if (!a && !b) continue
      if (a === b) row[x + i] = { ch: ' ', style: { bg: a } }
      else if (!b) row[x + i] = { ch: '▀', style: { fg: a } }
      else if (!a) row[x + i] = { ch: '▄', style: { fg: b } }
      else row[x + i] = { ch: '▀', style: { fg: a, bg: b } }
    }
  }
}

function sameStyle(a: Style, b: Style): boolean {
  return a.bg === b.bg && a.fg === b.fg && a.dim === b.dim && a.italic === b.italic && a.bold === b.bold
}

// Consecutive cells of one style as one segment, trailing blanks dropped
function segments(row: Cell[]): Segment[] {
  let end = row.length
  while (end > 0 && row[end - 1]!.ch === ' ' && row[end - 1]!.style === NONE) end -= 1
  const out: Segment[] = []
  for (const cell of row.slice(0, end)) {
    const last = out[out.length - 1]
    if (last && sameStyle(last.style, cell.style)) last.text += cell.ch
    else out.push({ text: cell.ch, style: cell.style })
  }
  return out
}

function fit(text: string, width: number): string {
  const chars = [...text]
  return chars.length <= width ? text : chars.slice(0, Math.max(0, width - 1)).join('') + '…'
}

// The drawing at tick `t`: ROWS rows of styled segments
export function scene(
  t: number,
  agents: Agent[],
  clawd: [string, string, string],
  line: string,
  bodyColumns: number,
): Segment[][] {
  const width = Math.max(DESKS_X + SLOT, bodyColumns)
  const rows: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: width }, () => ({ ch: ' ', style: NONE })),
  )
  const { slot, shown, more } = seats(agents, bodyColumns)

  if (more > 0) put(rows[3]!, DESKS_X + shown.length * slot, `+${more}`, { dim: true })

  // Working buddies take turns holding the floor
  const working = shown.filter((a, i) => a.doneAt === undefined && a.x === i * slot)
  const speaker = working.length ? working[Math.floor(t / SPEAK_TICKS) % working.length] : undefined

  shown.forEach((a, i) => {
    const x = DESKS_X + a.x
    const isSeated = a.x === i * slot
    const isDone = a.doneAt !== undefined
    const blinks = (t + i * 5) % 16 === 15

    if (!isSeated) {
      const step = WALKING[(t + i) % 2]!
      paintPixels(rows, 2, x + BODY_X, blinks ? blink(step) : step)
      return
    }

    if (isDone) {
      paintPixels(rows, 2, x, DONE)
      put(rows[1]!, x + BODY_X + 2, '✓', { fg: DONE_COLOR, bold: true })
    } else {
      const typing = TYPING[(Math.floor(t / 2) + i) % 2]!
      paintPixels(rows, 2, x, blinks ? blink(typing) : typing)
      // Code marks pop up over its head, two beats in three
      const beat = Math.floor(t / 3) + i * 7
      if (beat % 3 !== 2) {
        const mark = MARKS[beat % MARKS.length]!
        put(rows[1]!, x + BODY_X + (beat % 3) * 2, mark, { fg: MARK_COLORS[beat % MARK_COLORS.length]! })
      }
    }
  })

  // Bubbles: each fits its desk, but the speaker's runs on as far as the band
  // goes, and the neighbors it runs over keep quiet meanwhile
  let spokenTo = 0
  if (speaker) {
    const x = DESKS_X + speaker.x
    const text = fit(speaker.activity, width - x)
    put(rows[0]!, x, text, { fg: colorOf(speaker.type), bold: true })
    spokenTo = x + [...text].length + 1
  }
  shown.forEach((a, i) => {
    const x = DESKS_X + a.x
    if (a === speaker || a.x !== i * slot || (x < spokenTo && x > DESKS_X + (speaker?.x ?? 0))) return
    const isDone = a.doneAt !== undefined
    const text = isDone ? `✓ ${a.result ?? 'listo'}` : a.activity
    put(rows[0]!, x, fit(text, slot - 1), { fg: colorOf(a.type), dim: !isDone })
  })

  // Clawd on the left, its own line above it, in front of a buddy walking in
  // or out of it
  put(rows[0]!, 0, fit(line, DESKS_X - 1), { fg: 'claude', dim: true, italic: true })
  clawd.forEach((sprite, i) => paintCells(rows[i + 1]!, 0, sprite))

  return rows.map(segments)
}

// Something drawn over Clawd's scene as text: food in the air, smoke
export type Mark = { row: number; x: number; text: string; fg: string; bg?: string }

// Clawd alone: a row of air for marks, its three sprite rows `x` cells in,
// and its line beside them
export function solo(
  frame: string[],
  marks: Mark[],
  x: number,
  line: string,
  isWorking: boolean,
  bodyColumns: number,
): Segment[][] {
  const width = Math.max(1, bodyColumns)
  const rows: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: width }, () => ({ ch: ' ', style: NONE })),
  )
  frame.forEach((sprite, i) => paintCells(rows[i + 1]!, x, sprite))
  for (const m of marks) put(rows[m.row]!, x + m.x, m.text, { fg: m.fg, ...(m.bg ? { bg: m.bg } : {}) })
  const spriteWidth = Math.max(...frame.map(r => r.length))
  put(rows[2]!, x + spriteWidth + 1, line, { fg: 'claude', dim: !isWorking, italic: true })
  return rows.map(segments)
}
