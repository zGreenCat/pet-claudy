// Clawd Invaders' look: the board as a grid of cells, painted like the
// mascot's scenes (a background color per cell, thin parts as glyphs), then
// merged into runs of one style for the terminal.

import type { Game } from './game'

export type Cell = { ch: string; fg?: string; bg?: string }
export type Run = { text: string; fg?: string; bg?: string }

const ORANGE = '#D97757'
const ORANGE_HIT = '#8C4A33'
const EYE = '#1A1A1A'
const FLAME = '#F2C14E'
const BOMB = '#E5484D'
const BUGS = ['#C77DBB', '#6A9BCC', '#8DB360', '#D4A23C']

const BLANK: Cell = { ch: ' ' }

function put(grid: Cell[][], x: number, y: number, cells: Cell[]) {
  const row = grid[y]
  if (!row) return
  cells.forEach((c, i) => {
    if (x + i >= 0 && x + i < row.length) row[x + i] = c
  })
}

// Clawd in the pilot's seat: a square orange body, an eye in each upper corner
// and a thruster flickering between two poses. Dizzy eyes after a hit, joyful
// ones between waves.
function ship(g: Game): Cell[] {
  const bg = g.invuln > 0 && g.t % 2 === 0 ? ORANGE_HIT : ORANGE
  const thrust = g.t % 2 === 0 ? '▄' : '▂'
  let eyes: [string, string] = ['▘', '▝']
  if (g.celebrate > 0) eyes = ['>', '<']
  else if (g.invuln > 0) eyes = ['@', '@']
  return [
    { ch: eyes[0], fg: EYE, bg },
    { ch: thrust, fg: FLAME, bg },
    { ch: eyes[1], fg: EYE, bg },
  ]
}

// A bug: a colored body per row and eyes that look up, then down
function bug(row: number, t: number): Cell[] {
  const bg = BUGS[row % BUGS.length]!
  const eyes = t % 2 === 0 ? '°°' : 'oo'
  return [0, 1].map(i => ({ ch: eyes[i]!, fg: EYE, bg }))
}

export function paint(g: Game): Cell[][] {
  const grid: Cell[][] = Array.from({ length: g.h }, () => Array.from({ length: g.w }, () => BLANK))
  // Bugs flap every other step of their march
  const phase = Math.floor(g.t / 3)
  for (const e of g.enemies) put(grid, e.x, e.y, bug(e.row, phase))
  for (const b of g.bombs) put(grid, b.x, b.y, [{ ch: '*', fg: BOMB }])
  for (const s of g.shots) put(grid, s.x, s.y, [{ ch: '│', fg: FLAME }])
  for (const s of g.sparks) {
    put(grid, s.x, s.y, [
      { ch: s.life > 1 ? '*' : '·', fg: FLAME },
      { ch: s.life > 1 ? '+' : '·', fg: BOMB },
    ])
  }
  put(grid, g.ship, g.h - 1, ship(g))
  return grid
}

// Lays centered lines of text over the board, one to a row from the middle up
export function overlay(grid: Cell[][], lines: string[]): Cell[][] {
  const out = grid.map(r => [...r])
  const top = Math.max(0, Math.floor((out.length - lines.length) / 2))
  lines.forEach((line, i) => {
    const row = out[top + i]
    if (!row) return
    const text = line.slice(0, row.length)
    const x = Math.floor((row.length - text.length) / 2)
    put(out, x, top + i, [...text].map(ch => ({ ch, fg: FLAME, bg: undefined })))
  })
  return out
}

export function runs(row: Cell[]): Run[] {
  const out: Run[] = []
  for (const c of row) {
    const last = out[out.length - 1]
    if (last && last.fg === c.fg && last.bg === c.bg) last.text += c.ch
    else out.push({ text: c.ch, ...(c.fg ? { fg: c.fg } : {}), ...(c.bg ? { bg: c.bg } : {}) })
  }
  return out
}
