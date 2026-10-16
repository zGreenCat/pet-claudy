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
// Clawd's 8 cells and a gap
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

// Pixel colors: O Clawd, K eye, G laptop; . nothing
const PIXEL: Record<string, string> = { O: 'claude', K: EYE_COLOR, G: '#6B7280' }

// Sprites are four pixel rows of two pixels a cell, drawn in quarter blocks
// as fine as the big Clawd: a small one with an eye in each upper corner,
// short arms and its legs in pairs. The laptop leans on its left.
// At the laptop, two frames of typing: the hand down on a key, then up.
const TYPING = [
  ['..G........OOOOOOOO.', '..G........OKOOOOKO.', '...G.....OOOOOOOOOOO', '...GGGGG...O.O..O.O.'],
  ['..G........OOOOOOOO.', '..G......O.OKOOOOKO.', '...G......OOOOOOOOOO', '...GGGGG...O.O..O.O.'],
]
// Done: the laptop shut, the arm resting
const DONE = ['...........OOOOOOOO.', '...........OKOOOOKO.', '..........OOOOOOOOOO', '...GGGGG...O.O..O.O.']
// Walking, no laptop: two steps
const WALKING = [
  ['.OOOOOOOO.', '.OKOOOOKO.', 'OOOOOOOOOO', '.O.O..O.O.'],
  ['.OOOOOOOO.', '.OKOOOOKO.', 'OOOOOOOOOO', '..O.O.O.O.'],
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

// A command's secrets masked before it shows on screen: a secret flag's value,
// an auth header, a query parameter or variable named like a key, and long
// runs of letters and digits that read as a token
export function redact(command: string): string {
  return command
    .replace(/(--?(?:token|password|passwd|secret|api[-_]?key|auth)[= ]+)[^\s'"]+/gi, '$1***')
    .replace(/(authorization:\s*(?:bearer|basic|token)?\s*)[^\s'"]+/gi, '$1***')
    .replace(/([?&](?:token|access_token|api_key|key|secret|password)=)[^&\s'"]+/gi, '$1***')
    .replace(/\b([A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*=)[^\s'"]+/g, '$1***')
    .replace(/[A-Za-z0-9_\-+=]{32,}/g, run => (/\d/.test(run) && /[A-Za-z]/.test(run) ? '***' : run))
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
      return s('description') || `$ ${redact(s('command'))}`
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
const BLANK: Cell = { ch: ' ', style: NONE }

// Cells a code point takes in a terminal: none for joiners, variation
// selectors, skin tones and combining marks; two for wide East Asian and emoji
function cellWidth(cp: number): number {
  if (
    cp === 0x200d ||
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0x1f3fb && cp <= 0x1f3ff)
  ) {
    return 0
  }
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f300 && cp <= 0x1faff) ||
    (cp >= 0x20000 && cp <= 0x3fffd)
  ) {
    return 2
  }
  return 1
}

// Each code point and the cells it takes; one after a joiner is drawn into
// the glyph before it
function glyphs(text: string): { ch: string; cells: number }[] {
  const out: { ch: string; cells: number }[] = []
  let isJoined = false
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    out.push({ ch, cells: isJoined ? 0 : cellWidth(cp) })
    isJoined = cp === 0x200d
  }
  return out
}

// How many terminal columns `text` takes
export function columns(text: string): number {
  return glyphs(text).reduce((n, g) => n + g.cells, 0)
}

// A wide glyph is its cell and an empty one after it. Clearing either half
// clears the other, so a glyph drawn over it never leaves half a wide one
function clear(row: Cell[], x: number) {
  if (row[x]!.ch === '' && x > 0) row[x - 1] = BLANK
  else if (row[x + 1]?.ch === '') row[x + 1] = BLANK
  row[x] = BLANK
}

function put(row: Cell[], x: number, text: string, style: Style) {
  let last = -1
  for (const { ch, cells } of glyphs(text)) {
    if (cells === 0) {
      if (last >= 0) row[last] = { ch: row[last]!.ch + ch, style }
      continue
    }
    if (x >= 0 && x + cells <= row.length) {
      for (let k = 0; k < cells; k++) clear(row, x + k)
      row[x] = { ch, style }
      for (let k = 1; k < cells; k++) row[x + k] = { ch: '', style }
      last = x
    } else {
      last = -1
    }
    x += cells
  }
}

// Clawd's own sprite, a cell per pixel, and what it holds; . is empty
const CELL: Record<string, Cell> = {
  // Orange cell; one with a dark eye in a lower quarter; one with a closed eye
  O: { ch: ' ', style: { bg: 'claude', fg: EYE_COLOR } },
  L: { ch: '▖', style: { bg: 'claude', fg: EYE_COLOR } },
  R: { ch: '▗', style: { bg: 'claude', fg: EYE_COLOR } },
  '-': { ch: '▁', style: { bg: 'claude', fg: EYE_COLOR } },
  // Eyes of a mood, each its own glyph on the orange
  ...Object.fromEntries([...'><┓┏'].map(ch => [ch, { ch, style: { bg: 'claude', fg: EYE_COLOR, bold: true } }])),
  // Sunglasses: the band, a lens, and each lens's inner edge
  s: { ch: '▄', style: { bg: 'claude', fg: EYE_COLOR } },
  S: { ch: '▀', style: { bg: 'claude', fg: EYE_COLOR } },
  l: { ch: '▘', style: { bg: 'claude', fg: EYE_COLOR } },
  r: { ch: '▝', style: { bg: 'claude', fg: EYE_COLOR } },
  // An arm at rest and raised, and a leg at either side of its cell
  '^': { ch: '▀', style: { fg: 'claude' } },
  v: { ch: '▄', style: { fg: 'claude' } },
  a: { ch: '▘', style: { fg: 'claude' } },
  b: { ch: '▝', style: { fg: 'claude' } },
  // A pan's handle, thin and level with the arm that holds it, and its pan
  h: { ch: '▀', style: { fg: '#8B5A2B' } },
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

// A cell's quarters as a glyph, by the quarters set: 1 upper left, 2 upper
// right, 4 lower left, 8 lower right
const QUARTERS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'
const PIXEL_ORDER = Object.values(PIXEL)

// A sprite of two pixel rows and two pixel columns per cell. A cell all one
// color is its background, so whole cells leave no seam; a full cell of two
// is the commoner one behind a glyph of the other; a cell with empty pixels
// is a glyph alone, in its rarest color
function paintQuarters(rows: Cell[][], top: number, x: number, sprite: string[]) {
  const width = Math.ceil(Math.max(...sprite.map(s => s.length)) / 2)
  for (let r = 0; r * 2 < sprite.length; r++) {
    const row = rows[top + r]!
    const upper = sprite[r * 2]!
    const lower = sprite[r * 2 + 1] ?? ''
    for (let i = 0; i < width; i++) {
      if (x + i < 0 || x + i >= row.length) continue
      const px = [upper[i * 2], upper[i * 2 + 1], lower[i * 2], lower[i * 2 + 1]].map(p => PIXEL[p ?? '.'])
      const mask = (c: string | undefined) => px.reduce((m, p, k) => (p === c ? m | (1 << k) : m), 0)
      const count = (c: string) => px.filter(p => p === c).length
      // Rarest first; a tie goes to the later color in PIXEL
      const colors = PIXEL_ORDER.filter(c => count(c) > 0).sort(
        (a, b) => count(a) - count(b) || PIXEL_ORDER.indexOf(b) - PIXEL_ORDER.indexOf(a),
      )
      if (colors.length === 0) continue
      const isFull = px.every(p => p !== undefined)
      if (colors.length === 1 && isFull) {
        row[x + i] = { ch: ' ', style: { bg: colors[0]! } }
      } else if (isFull) {
        const bg = colors[colors.length - 1]!
        row[x + i] = { ch: QUARTERS[15 - mask(bg)]!, style: { fg: colors[0]!, bg } }
      } else {
        row[x + i] = { ch: QUARTERS[15 - mask(undefined)]!, style: { fg: colors[0]! } }
      }
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
  if (columns(text) <= width) return text
  let out = ''
  let used = 0
  for (const { ch, cells } of glyphs(text)) {
    if (used + cells > width - 1) break
    out += ch
    used += cells
  }
  return out + '…'
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
      paintQuarters(rows, 2, x + BODY_X, blinks ? blink(step) : step)
      return
    }

    if (isDone) {
      paintQuarters(rows, 2, x, DONE)
      put(rows[1]!, x + BODY_X + 2, '✓', { fg: DONE_COLOR, bold: true })
    } else {
      const typing = TYPING[(Math.floor(t / 2) + i) % 2]!
      paintQuarters(rows, 2, x, blinks ? blink(typing) : typing)
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
    spokenTo = x + columns(text) + 1
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
