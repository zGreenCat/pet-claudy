// Clawd Invaders' look: the board as a grid of cells, painted like the
// mascot's scenes (a background color per cell for bodies, thin parts as
// half or quarter glyphs), then merged into runs of one style for the terminal.

import { SHIP_H } from './game'
import type { Game } from './game'

export type Cell = { ch: string; fg?: string; bg?: string; bold?: boolean }
export type Run = { text: string; fg?: string; bg?: string; bold?: boolean }
// A line of a message laid over the board
export type Line = { text: string; fg?: string; bold?: boolean }

export const ORANGE = '#D97757'
const ORANGE_HIT = '#8C4A33'
const EYE = '#1A1A1A'
export const FLAME = '#F2C14E'
const BOMB = '#E5484D'
const BORDER = '#5A5670'
const PANEL = '#24212E'
const BUGS = ['#C77DBB', '#6A9BCC', '#8DB360', '#D4A23C']

const BLANK: Cell = { ch: ' ' }

function put(grid: Cell[][], x: number, y: number, cells: Cell[]) {
  const row = grid[y]
  if (!row) return
  cells.forEach((c, i) => {
    if (x + i >= 0 && x + i < row.length) row[x + i] = c
  })
}

// A sprite's rows in letters, as the mascot's are; . is empty
//   B  body cell; e f  the eyes over it, left and right
//   a b  a leg in the cell's upper left or right quarter
//   w  a wing, the cell's lower half
//   L R  a body cell with an eye in its lower left or right quarter
//   F  the thruster's flame, the cell's upper half
function sprite(rows: string[], body: string, eyes: [string, string], flame = FLAME): Cell[][] {
  const glyph: Record<string, Cell> = {
    B: { ch: ' ', bg: body },
    e: { ch: eyes[0], fg: EYE, bg: body, bold: true },
    f: { ch: eyes[1], fg: EYE, bg: body, bold: true },
    L: { ch: '▖', fg: EYE, bg: body },
    R: { ch: '▗', fg: EYE, bg: body },
    a: { ch: '▘', fg: body },
    b: { ch: '▝', fg: body },
    w: { ch: '▄', fg: body },
    F: { ch: '▀', fg: flame },
  }
  return rows.map(r => [...r].map(k => glyph[k] ?? BLANK))
}

// Clawd at the helm: the logo's square orange body with an eye in each lower
// corner, short wings at its sides, its legs under it and a flame between
// them that flickers. Dizzy eyes after a hit, joyful ones between waves.
function ship(g: Game): Cell[][] {
  const body = g.invuln > 0 && g.t % 2 === 0 ? ORANGE_HIT : ORANGE
  const flame = g.t % 2 === 0 ? FLAME : BOMB
  if (g.celebrate > 0) return sprite(['weBfw', '.aFb.'], body, ['>', '<'], flame)
  if (g.invuln > 0) return sprite(['weBfw', '.aFb.'], body, ['@', '@'], flame)
  return sprite(['wLBRw', '.aFb.'], body, [' ', ' '], flame)
}

// A bug: a colored body with a face of its own per row, and legs that step
// out and in as it marches
const BUG_EYES: [string, string][] = [
  ['\\', '/'],
  ['°', '°'],
  ['●', '●'],
  ['o', 'o'],
]

function bug(row: number, phase: number): Cell[][] {
  const body = BUGS[row % BUGS.length]!
  const eyes = BUG_EYES[row % BUG_EYES.length]!
  return sprite(['BefB', phase % 2 === 0 ? 'a..b' : 'b..a'], body, eyes)
}

export function paint(g: Game): Cell[][] {
  const grid: Cell[][] = Array.from({ length: g.h }, () => Array.from({ length: g.w }, () => BLANK))
  // Bugs step with each march, every few ticks
  const phase = Math.floor(g.t / 4)
  for (const e of g.enemies) bug(e.row, phase).forEach((cells, dy) => put(grid, e.x, e.y + dy, cells))
  for (const b of g.bombs) put(grid, b.x, b.y, [{ ch: '●', fg: BOMB }])
  for (const s of g.shots) put(grid, s.x, s.y, [{ ch: '┃', fg: FLAME, bold: true }])
  for (const s of g.sparks) {
    const bright = s.life > 1
    put(grid, s.x, s.y, [
      { ch: bright ? '*' : '·', fg: FLAME, bold: true },
      { ch: bright ? '+' : '·', fg: BOMB, bold: true },
    ])
  }
  ship(g).forEach((cells, dy) => put(grid, g.ship, g.h - SHIP_H + dy, cells))
  return grid
}

// A box of text over the middle of the board, on a panel of its own color so
// it reads over whatever is under it
export function overlay(grid: Cell[][], lines: Line[]): Cell[][] {
  const out = grid.map(r => [...r])
  const width = out[0]?.length ?? 0
  const inner = Math.min(width, Math.max(...lines.map(l => l.text.length)) + 4)
  const rows = [{ text: '' }, ...lines, { text: '' }]
  const top = Math.max(0, Math.floor((out.length - rows.length) / 2))
  const left = Math.floor((width - inner) / 2)
  rows.forEach((line, i) => {
    const text = [...line.text].slice(0, inner)
    const pad = Math.floor((inner - text.length) / 2)
    const cells = Array.from({ length: inner }, (_, k): Cell => {
      const ch = text[k - pad]
      if (ch === undefined) return { ch: ' ', bg: PANEL }
      return { ch, bg: PANEL, fg: line.fg ?? FLAME, ...(line.bold ? { bold: true } : {}) }
    })
    put(out, left, top + i, cells)
  })
  return out
}

// The board inside a rounded border
export function frame(grid: Cell[][]): Cell[][] {
  const width = grid[0]?.length ?? 0
  const edge = (l: string, r: string): Cell[] => [
    { ch: l, fg: BORDER },
    ...Array.from({ length: width }, (): Cell => ({ ch: '─', fg: BORDER })),
    { ch: r, fg: BORDER },
  ]
  const side: Cell = { ch: '│', fg: BORDER }
  return [edge('╭', '╮'), ...grid.map(r => [side, ...r, side]), edge('╰', '╯')]
}

export function runs(row: Cell[]): Run[] {
  const out: Run[] = []
  for (const c of row) {
    const last = out[out.length - 1]
    if (last && last.fg === c.fg && last.bg === c.bg && last.bold === c.bold) last.text += c.ch
    else {
      out.push({
        text: c.ch,
        ...(c.fg ? { fg: c.fg } : {}),
        ...(c.bg ? { bg: c.bg } : {}),
        ...(c.bold ? { bold: true } : {}),
      })
    }
  }
  return out
}
