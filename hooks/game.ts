// Clawd Invaders: the rules, as pure functions of the game and an explicit
// tick. Time and input come in as arguments and chance from a seed in the
// state, so the client can drive it and the tests can replay it.

export type Vec = { x: number; y: number }
// An enemy's top left cell; it takes ENEMY_W by ENEMY_H cells
export type Enemy = { x: number; y: number; row: number }
export type Spark = { x: number; y: number; life: number }
export type Status = 'playing' | 'over'
export type Cause = 'lives' | 'invaded'

export type Game = {
  w: number
  h: number
  // The ship's left cell; it takes the last SHIP_H rows
  ship: number
  lives: number
  score: number
  wave: number
  enemies: Enemy[]
  // Rows the wave started with: a bug's worth comes from its row in them
  rows: number
  dir: 1 | -1
  shots: Vec[]
  bombs: Vec[]
  sparks: Spark[]
  t: number
  cooldown: number
  invuln: number
  // Ticks left of the cheer between waves; the next wave arrives at zero
  celebrate: number
  status: Status
  cause?: Cause
  seed: number
}

export const SHIP_W = 5
export const SHIP_H = 2
export const ENEMY_W = 4
export const ENEMY_H = 2
// An enemy and the gap to the next, across and down
const PITCH_X = ENEMY_W + 2
const PITCH_Y = ENEMY_H + 1
const MAX_COLS = 6
const MAX_ROWS = 6
export const MIN_W = 24
export const MIN_H = 12
export const LIVES = 3
export const INVULN_TICKS = 14
export const CELEBRATE_TICKS = 12
const SPARK_TICKS = 3
const FIRE_EVERY = 5
const KILL_SCORE = 10
const WAVE_SCORE = 50
// Ticks of warning the autopilot wants before a bomb reaches the ship
const DODGE_TICKS = 10
// Board rows per extra row a bumping wave descends, so a tall board keeps
// the pace of a short one
const ROWS_PER_DROP = 24

// Ticks between enemy steps, and between bombs: harder each wave, to a floor
export const enemyEvery = (wave: number) => Math.max(2, 7 - wave)
export const bombEvery = (wave: number) => Math.max(8, 24 - 2 * wave)

export const fits = (w: number, h: number) => w >= MIN_W && h >= MIN_H

// On a tall board bombs fall a row a tick, on a short one every other tick
export const bombFallEvery = (h: number) => (h >= 30 ? 1 : 2)
export const dropRows = (h: number) => 1 + Math.floor(h / ROWS_PER_DROP)

// The ship's top row, and the last row an enemy may reach before it invades
const shipTop = (h: number) => h - SHIP_H
const defense = (h: number) => shipTop(h) - 1
const bottomOf = (e: Enemy) => e.y + ENEMY_H - 1

// mulberry32: the next value in [0, 1) and the seed after it
function roll(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) >>> 0
  let r = Math.imul(s ^ (s >>> 15), 1 | s)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, s]
}

const formationCols = (w: number) => Math.min(MAX_COLS, Math.floor((w + 2) / PITCH_X))
// The rows of bugs a board holds: about its upper third, never so many that a
// wave has no room to descend
const maxRows = (h: number) =>
  Math.min(MAX_ROWS, Math.floor((h - 6) / PITCH_Y), Math.max(2, Math.floor((h / 3 + 1) / PITCH_Y)))
// Two rows short of the board's fill on the first wave, one more every other
export const formationRows = (h: number, wave: number) =>
  Math.min(maxRows(h), Math.max(2, maxRows(h) - 2 + Math.ceil(wave / 2)))

function formation(w: number, h: number, wave: number): Enemy[] {
  const cols = formationCols(w)
  const rows = formationRows(h, wave)
  const x0 = Math.floor((w - (cols * PITCH_X - 2)) / 2)
  const enemies: Enemy[] = []
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) enemies.push({ x: x0 + c * PITCH_X, y: 1 + row * PITCH_Y, row })
  }
  return enemies
}

export function newGame(w: number, h: number, seed: number): Game {
  if (!fits(w, h)) throw new Error(`board ${w}x${h} is under the minimum ${MIN_W}x${MIN_H}`)
  return {
    w,
    h,
    ship: Math.floor((w - SHIP_W) / 2),
    lives: LIVES,
    score: 0,
    wave: 1,
    enemies: formation(w, h, 1),
    rows: formationRows(h, 1),
    dir: 1,
    shots: [],
    bombs: [],
    sparks: [],
    t: 0,
    cooldown: 0,
    invuln: 0,
    celebrate: 0,
    status: 'playing',
    seed: seed >>> 0,
  }
}

// The living bugs moved as one block just enough to fit the board and stay
// above the defense line. A block too big for the board, from a wider one, is
// laid out again as a fresh formation of at most as many bugs, bottom rows
// first gone: shrinking the pane never adds a bug.
function refit(enemies: Enemy[], w: number, h: number, wave: number): Enemy[] {
  if (enemies.length === 0) return enemies
  const left = Math.min(...enemies.map(e => e.x))
  const right = Math.max(...enemies.map(e => e.x + ENEMY_W - 1))
  const top = Math.min(...enemies.map(e => e.y))
  const bottom = Math.max(...enemies.map(bottomOf))
  const dx = Math.min(0, w - 1 - right)
  const dy = Math.min(0, defense(h) - 1 - bottom)
  if (left + dx >= 0 && top + dy >= 1) return enemies.map(e => ({ ...e, x: e.x + dx, y: e.y + dy }))
  return formation(w, h, wave).slice(0, enemies.length)
}

// The same game on a new board: score, lives, wave and the living bugs kept;
// what flew is gone
export function resize(g: Game, w: number, h: number): Game {
  if (!fits(w, h)) throw new Error(`board ${w}x${h} is under the minimum ${MIN_W}x${MIN_H}`)
  return {
    ...g,
    w,
    h,
    ship: Math.min(g.ship, w - SHIP_W),
    enemies: refit(g.enemies, w, h, g.wave),
    shots: [],
    bombs: [],
    sparks: [],
  }
}

export function move(g: Game, dx: number): Game {
  if (g.status !== 'playing') return g
  return { ...g, ship: Math.max(0, Math.min(g.w - SHIP_W, g.ship + dx)) }
}

// The demo's pilot: a cell a tick away from a bomb coming down on the ship,
// otherwise toward the nearest bug, to fire under it
export function autopilot(g: Game): -1 | 0 | 1 {
  const center = g.ship + Math.floor(SHIP_W / 2)
  const watch = Math.ceil(DODGE_TICKS / bombFallEvery(g.h))
  const near = g.bombs.filter(b => b.y >= shipTop(g.h) - watch && b.x >= g.ship - 1 && b.x <= g.ship + SHIP_W)
  if (near.length > 0) {
    const away = near[0]!.x >= center ? -1 : 1
    const blocked = (away === -1 && g.ship === 0) || (away === 1 && g.ship === g.w - SHIP_W)
    return blocked ? (-away as -1 | 1) : away
  }
  if (g.enemies.length === 0) return 0
  const target = g.enemies.reduce((best, e) => {
    const d = Math.abs(e.x + 1 - center)
    const bestD = Math.abs(best.x + 1 - center)
    return d < bestD || (d === bestD && e.y > best.y) ? e : best
  })
  const to = target.x + 1
  return to === center ? 0 : to > center ? 1 : -1
}

const covers = (e: Enemy, s: Vec) => s.y >= e.y && s.y <= bottomOf(e) && s.x >= e.x && s.x < e.x + ENEMY_W

// Each shot kills the first enemy it meets and is spent: it scores once
function collide(g: Game): Game {
  if (g.shots.length === 0 || g.enemies.length === 0) return g
  let enemies = g.enemies
  let score = g.score
  const shots: Vec[] = []
  const sparks = [...g.sparks]
  for (const s of g.shots) {
    const hit = enemies.find(e => covers(e, s))
    if (!hit) {
      shots.push(s)
      continue
    }
    enemies = enemies.filter(e => e !== hit)
    score += KILL_SCORE * Math.max(1, g.rows - hit.row)
    sparks.push({ x: hit.x + 1, y: hit.y, life: SPARK_TICKS })
  }
  return { ...g, enemies, shots, sparks, score }
}

function marchEnemies(g: Game): Game {
  if (g.enemies.length === 0 || g.t % enemyEvery(g.wave) !== 0) return g
  const left = Math.min(...g.enemies.map(e => e.x))
  const right = Math.max(...g.enemies.map(e => e.x + ENEMY_W - 1))
  const bumps = (g.dir === 1 && right + 1 > g.w - 1) || (g.dir === -1 && left - 1 < 0)
  const drop = dropRows(g.h)
  const enemies = g.enemies.map(e => (bumps ? { ...e, y: e.y + drop } : { ...e, x: e.x + g.dir }))
  const dir = bumps ? (-g.dir as 1 | -1) : g.dir
  return { ...g, enemies, dir }
}

function dropBomb(g: Game): Game {
  if (g.enemies.length === 0 || g.t % bombEvery(g.wave) !== 0) return g
  const lowest = new Map<number, Enemy>()
  for (const e of g.enemies) {
    const low = lowest.get(e.x)
    if (!low || e.y > low.y) lowest.set(e.x, e)
  }
  const shooters = [...lowest.values()]
  const [r, seed] = roll(g.seed)
  const from = shooters[Math.floor(r * shooters.length)]!
  // From under one of its two middle cells, the seed's low bit choosing
  return { ...g, seed, bombs: [...g.bombs, { x: from.x + 1 + (seed & 1), y: bottomOf(from) + 1 }] }
}

// Bombs fall and the ship takes the ones that land on it; one hit leaves it
// invulnerable for a while, so one impact costs one life
function fall(g: Game): Game {
  const top = shipTop(g.h)
  const falling = g.t % bombFallEvery(g.h) === 0
  let lives = g.lives
  let invuln = g.invuln
  const sparks = [...g.sparks]
  const bombs: Vec[] = []
  for (const b of g.bombs) {
    const at = falling ? { ...b, y: b.y + 1 } : b
    if (at.y < top) {
      bombs.push(at)
      continue
    }
    if (at.y > g.h - 1) continue
    const onShip = at.x >= g.ship && at.x < g.ship + SHIP_W
    if (onShip && invuln === 0) {
      lives -= 1
      invuln = INVULN_TICKS
      sparks.push({ x: at.x, y: top, life: SPARK_TICKS })
    } else if (!onShip) {
      bombs.push(at)
    }
  }
  return { ...g, bombs, lives, invuln, sparks }
}

function judge(g: Game): Game {
  if (g.lives <= 0) return { ...g, lives: 0, status: 'over', cause: 'lives' }
  if (g.enemies.some(e => bottomOf(e) >= defense(g.h))) return { ...g, status: 'over', cause: 'invaded' }
  if (g.enemies.length === 0 && g.celebrate === 0) {
    return { ...g, wave: g.wave + 1, score: g.score + WAVE_SCORE, shots: [], bombs: [], celebrate: CELEBRATE_TICKS }
  }
  return g
}

export function step(g: Game): Game {
  if (g.status !== 'playing') return g
  let n: Game = {
    ...g,
    t: g.t + 1,
    cooldown: Math.max(0, g.cooldown - 1),
    invuln: Math.max(0, g.invuln - 1),
    sparks: g.sparks.map(s => ({ ...s, life: s.life - 1 })).filter(s => s.life > 0),
  }

  if (n.celebrate > 0) {
    const celebrate = n.celebrate - 1
    if (celebrate > 0) return { ...n, celebrate }
    return { ...n, celebrate, enemies: formation(n.w, n.h, n.wave), rows: formationRows(n.h, n.wave), dir: 1 }
  }

  const muzzle = { x: n.ship + Math.floor(SHIP_W / 2), y: shipTop(n.h) - 1 }
  if (n.cooldown === 0) n = { ...n, cooldown: FIRE_EVERY, shots: [...n.shots, muzzle] }
  n = collide({ ...n, shots: n.shots.map(s => ({ ...s, y: s.y - 1 })).filter(s => s.y >= 0) })
  n = collide(marchEnemies(n))
  n = fall(dropBomb(n))
  return judge(n)
}
