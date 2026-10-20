// Clawd Invaders: the rules, as pure functions of the game and an explicit
// tick. Time and input come in as arguments and chance from a seed in the
// state, so the client can drive it and the tests can replay it.

export type Vec = { x: number; y: number }
export type Enemy = { x: number; y: number; row: number }
export type Spark = { x: number; y: number; life: number }
export type Status = 'playing' | 'over'
export type Cause = 'lives' | 'invaded'

export type Game = {
  w: number
  h: number
  // The ship's left cell; it sits on the last row
  ship: number
  lives: number
  score: number
  wave: number
  enemies: Enemy[]
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

export const SHIP_W = 3
export const ENEMY_W = 2
// An enemy and the gap to the next
const PITCH = ENEMY_W + 1
const MAX_COLS = 6
const MAX_ROWS = 4
export const MIN_W = 20
export const MIN_H = 10
export const LIVES = 3
export const INVULN_TICKS = 14
export const CELEBRATE_TICKS = 10
const SPARK_TICKS = 3
const FIRE_EVERY = 5
const BOMB_FALL_EVERY = 2
const KILL_SCORE = 10
const WAVE_SCORE = 50

// Ticks between enemy steps, and between bombs: harder each wave, to a floor
export const enemyEvery = (wave: number) => Math.max(2, 7 - wave)
export const bombEvery = (wave: number) => Math.max(8, 24 - 2 * wave)

export const fits = (w: number, h: number) => w >= MIN_W && h >= MIN_H

// mulberry32: the next value in [0, 1) and the seed after it
function roll(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) >>> 0
  let r = Math.imul(s ^ (s >>> 15), 1 | s)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, s]
}

function formation(w: number, h: number, wave: number): Enemy[] {
  const cols = Math.min(MAX_COLS, Math.floor((w - 1) / PITCH))
  const rows = Math.min(MAX_ROWS, 2 + Math.ceil(wave / 2), h - 7)
  const x0 = Math.floor((w - (cols * PITCH - 1)) / 2)
  const enemies: Enemy[] = []
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) enemies.push({ x: x0 + c * PITCH, y: 1 + row, row })
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

// The same game on a new board: score, lives and wave kept; what flew is gone
export function resize(g: Game, w: number, h: number): Game {
  if (!fits(w, h)) throw new Error(`board ${w}x${h} is under the minimum ${MIN_W}x${MIN_H}`)
  return {
    ...g,
    w,
    h,
    ship: Math.min(g.ship, w - SHIP_W),
    enemies: g.celebrate > 0 ? [] : formation(w, h, g.wave),
    dir: 1,
    shots: [],
    bombs: [],
    sparks: [],
  }
}

export function move(g: Game, dx: number): Game {
  if (g.status !== 'playing') return g
  return { ...g, ship: Math.max(0, Math.min(g.w - SHIP_W, g.ship + dx)) }
}

const covers = (e: Enemy, s: Vec) => s.y === e.y && s.x >= e.x && s.x < e.x + ENEMY_W

// Each shot kills the first enemy it meets and is spent: it scores once
function collide(g: Game): Game {
  if (g.shots.length === 0 || g.enemies.length === 0) return g
  let enemies = g.enemies
  let score = g.score
  const shots: Vec[] = []
  const sparks = [...g.sparks]
  const top = Math.max(...g.enemies.map(e => e.row))
  for (const s of g.shots) {
    const hit = enemies.find(e => covers(e, s))
    if (!hit) {
      shots.push(s)
      continue
    }
    enemies = enemies.filter(e => e !== hit)
    score += KILL_SCORE * (1 + top - hit.row)
    sparks.push({ x: hit.x, y: hit.y, life: SPARK_TICKS })
  }
  return { ...g, enemies, shots, sparks, score }
}

function marchEnemies(g: Game): Game {
  if (g.enemies.length === 0 || g.t % enemyEvery(g.wave) !== 0) return g
  const left = Math.min(...g.enemies.map(e => e.x))
  const right = Math.max(...g.enemies.map(e => e.x + ENEMY_W - 1))
  const bumps = (g.dir === 1 && right + 1 > g.w - 1) || (g.dir === -1 && left - 1 < 0)
  const enemies = g.enemies.map(e => (bumps ? { ...e, y: e.y + 1 } : { ...e, x: e.x + g.dir }))
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
  return { ...g, seed, bombs: [...g.bombs, { x: from.x, y: from.y + 1 }] }
}

// Bombs fall and the ship takes the ones that land on it; one hit leaves it
// invulnerable for a while, so one impact costs one life
function fall(g: Game): Game {
  const last = g.h - 1
  const falling = g.t % BOMB_FALL_EVERY === 0
  let lives = g.lives
  let invuln = g.invuln
  const sparks = [...g.sparks]
  const bombs: Vec[] = []
  for (const b of g.bombs) {
    const at = falling ? { ...b, y: b.y + 1 } : b
    if (at.y < last) {
      bombs.push(at)
      continue
    }
    if (at.y > last) continue
    const onShip = at.x >= g.ship && at.x < g.ship + SHIP_W
    if (onShip && invuln === 0) {
      lives -= 1
      invuln = INVULN_TICKS
      sparks.push({ x: at.x, y: last, life: SPARK_TICKS })
    } else if (!onShip) {
      bombs.push(at)
    }
  }
  return { ...g, bombs, lives, invuln, sparks }
}

function judge(g: Game): Game {
  if (g.lives <= 0) return { ...g, lives: 0, status: 'over', cause: 'lives' }
  if (g.enemies.some(e => e.y >= g.h - 2)) return { ...g, status: 'over', cause: 'invaded' }
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
    return celebrate > 0 ? { ...n, celebrate } : { ...n, celebrate, enemies: formation(n.w, n.h, n.wave), dir: 1 }
  }

  if (n.cooldown === 0) n = { ...n, cooldown: FIRE_EVERY, shots: [...n.shots, { x: n.ship + 1, y: n.h - 2 }] }
  n = collide({ ...n, shots: n.shots.map(s => ({ ...s, y: s.y - 1 })).filter(s => s.y >= 0) })
  n = collide(marchEnemies(n))
  n = fall(dropBomb(n))
  return judge(n)
}
