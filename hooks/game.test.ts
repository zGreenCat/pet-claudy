import { test, expect } from 'claude-code/testing'

import { ENEMY_H, ENEMY_W, INVULN_TICKS, LIVES, MIN_H, MIN_W, SHIP_H, SHIP_W, autopilot, move, newGame, resize, step } from './game'
import type { Game } from './game'

const play = (g: Game, ticks: number) => {
  for (let i = 0; i < ticks; i++) g = step(g)
  return g
}

test('a board under the minimum is refused', () => {
  expect(() => newGame(MIN_W - 1, MIN_H, 1)).toThrow()
  expect(() => newGame(MIN_W, MIN_H - 1, 1)).toThrow()
})

test('the ship stays inside the board', () => {
  let g = newGame(30, 14, 1)
  g = move(g, -100)
  expect(g.ship).toBe(0)
  g = move(g, 100)
  expect(g.ship).toBe(30 - SHIP_W)
})

test('the same seed plays the same game', () => {
  expect(play(newGame(30, 14, 7), 200)).toEqual(play(newGame(30, 14, 7), 200))
})

test('a shot kills one enemy once and scores once', () => {
  const g0 = newGame(30, 14, 1)
  const target = g0.enemies[0]!
  const g = { ...g0, enemies: [target, { ...g0.enemies[1]!, x: 20 }], shots: [{ x: target.x, y: target.y + 1 }, { x: target.x + 1, y: target.y + 1 }], cooldown: 99, ship: 0 }
  const n = step(g)
  expect(n.enemies).toHaveLength(1)
  expect(n.shots).toHaveLength(1)
  expect(n.score).toBeGreaterThan(g.score)
  const scored = n.score
  expect(step({ ...n, shots: [] }).score).toBe(scored)
})

test('a bomb on the ship costs one life and then the ship is invulnerable', () => {
  const g0 = newGame(30, 14, 1)
  const bombs = [{ x: g0.ship, y: g0.h - 2 }, { x: g0.ship + 1, y: g0.h - 2 }]
  let g: Game = { ...g0, bombs, enemies: [{ x: 0, y: 1, row: 0 }], t: 1, cooldown: 99 }
  g = step(g)
  expect(g.lives).toBe(LIVES - 1)
  expect(g.invuln).toBeGreaterThan(0)
  expect(g.invuln).toBeLessThanOrEqual(INVULN_TICKS)
  expect(g.bombs).toHaveLength(0)
})

test('a bomb during invulnerability is spent without damage', () => {
  const g0 = newGame(30, 14, 1)
  const g: Game = { ...g0, invuln: 5, bombs: [{ x: g0.ship, y: g0.h - 2 }], enemies: [{ x: 0, y: 1, row: 0 }], t: 1, cooldown: 99 }
  const n = step(g)
  expect(n.lives).toBe(LIVES)
  expect(n.bombs).toHaveLength(0)
})

test('losing the last life ends the game, and an ended game stops', () => {
  const g0 = newGame(30, 14, 1)
  const g: Game = { ...g0, lives: 1, bombs: [{ x: g0.ship, y: g0.h - 2 }], enemies: [{ x: 0, y: 1, row: 0 }], t: 1, cooldown: 99 }
  const over = step(g)
  expect(over.status).toBe('over')
  expect(over.cause).toBe('lives')
  expect(step(over)).toBe(over)
  expect(move(over, 3)).toBe(over)
})

test('enemies reaching the defense line end the game', () => {
  const g0 = newGame(30, 14, 1)
  const g: Game = { ...g0, enemies: [{ x: 5, y: g0.h - 2, row: 0 }], cooldown: 99 }
  const n = step(g)
  expect(n.status).toBe('over')
  expect(n.cause).toBe('invaded')
})

test('enemies bounce off the edge and descend', () => {
  const g0 = newGame(30, 14, 1)
  let g: Game = { ...g0, enemies: [{ x: 28, y: 1, row: 0 }], dir: 1, t: 0, wave: 6, cooldown: 99 }
  g = play(g, 3)
  expect(g.dir).toBe(-1)
  expect(g.enemies[0]!.y).toBe(2)
})

test('clearing a wave cheers, then a harder wave arrives', () => {
  const g0 = newGame(30, 14, 1)
  const last = g0.enemies[0]!
  let g: Game = { ...g0, enemies: [last], shots: [{ x: last.x, y: last.y + 1 }], cooldown: 99 }
  g = step(g)
  expect(g.wave).toBe(2)
  expect(g.celebrate).toBeGreaterThan(0)
  expect(g.enemies).toHaveLength(0)
  g = play(g, g.celebrate)
  expect(g.celebrate).toBe(0)
  expect(g.enemies.length).toBeGreaterThan(0)
})

test('resizing keeps score and lives and clears what flew', () => {
  const g0 = play(newGame(30, 14, 1), 20)
  const g = resize({ ...g0, score: 80, lives: 2 }, 40, 16)
  expect([g.w, g.h, g.score, g.lives]).toEqual([40, 16, 80, 2])
  expect(g.shots).toHaveLength(0)
  expect(g.bombs).toHaveLength(0)
  expect(g.ship).toBeLessThanOrEqual(40 - SHIP_W)
  expect(() => resize(g, 5, 5)).toThrow()
})

test('resizing keeps the living bugs, in their places and rows', () => {
  const g0 = newGame(30, 14, 1)
  const alive = [g0.enemies[0]!, g0.enemies[4]!, g0.enemies[9]!]
  const g = resize({ ...g0, enemies: alive }, 40, 16)
  expect(g.enemies).toEqual(alive)
  expect(g.rows).toBe(g0.rows)
})

const inside = (g: Game) => {
  for (const e of g.enemies) {
    expect(e.x).toBeGreaterThanOrEqual(0)
    expect(e.x + ENEMY_W).toBeLessThanOrEqual(g.w)
    expect(e.y).toBeGreaterThanOrEqual(1)
    expect(e.y + ENEMY_H - 1).toBeLessThan(g.h - SHIP_H - 1)
  }
}

test('a shorter board moves the bugs up as one block, above the defense line', () => {
  const g0 = newGame(30, 20, 1)
  const low = g0.enemies.map(e => ({ ...e, y: e.y + 9 }))
  const g = resize({ ...g0, enemies: low }, 30, MIN_H)
  expect(g.enemies).toHaveLength(low.length)
  inside(g)
  const [a, b] = [low[0]!, low[low.length - 1]!]
  const [ra, rb] = [g.enemies[0]!, g.enemies[g.enemies.length - 1]!]
  expect([rb.x - ra.x, rb.y - ra.y]).toEqual([b.x - a.x, b.y - a.y])
  expect(step({ ...g, cooldown: 99 }).status).toBe('playing')
})

test('a board too narrow for the block lays it out again, never with more bugs', () => {
  const g0 = newGame(44, 20, 1)
  const g = resize(g0, MIN_W, MIN_H)
  expect(g.enemies.length).toBeGreaterThan(0)
  expect(g.enemies.length).toBeLessThanOrEqual(g0.enemies.length)
  inside(g)
})

test('a bug is worth its row in the wave, however many rows are left', () => {
  const g0 = newGame(30, 14, 1)
  const top = g0.enemies.find(e => e.row === 0)!
  const bottom = g0.enemies.find(e => e.row === g0.rows - 1)!
  const shoot = (e: typeof top) =>
    step({ ...g0, enemies: [e, { ...e, x: 26, y: 1 }], shots: [{ x: e.x, y: e.y + 1 }], cooldown: 99, ship: 0 }).score
  expect(shoot(top)).toBe(10 * g0.rows)
  expect(shoot(bottom)).toBe(10)
})

test('entities never leave the board over a long game', () => {
  let g = newGame(24, 12, 3)
  for (let i = 0; i < 2000 && g.status === 'playing'; i++) {
    g = step(i % 40 < 20 ? move(g, 2) : move(g, -2))
    for (const v of [...g.shots, ...g.bombs]) {
      expect(v.x).toBeGreaterThanOrEqual(0)
      expect(v.x).toBeLessThan(g.w)
      expect(v.y).toBeGreaterThanOrEqual(0)
      expect(v.y).toBeLessThan(g.h + 1)
    }
  }
})

test('the autopilot steps away from a bomb coming down on the ship', () => {
  const g0 = newGame(30, 14, 1)
  const center = g0.ship + 2
  expect(autopilot({ ...g0, bombs: [{ x: center + 1, y: g0.h - 5 }] })).toBe(-1)
  expect(autopilot({ ...g0, bombs: [{ x: center - 1, y: g0.h - 5 }] })).toBe(1)
  expect(autopilot({ ...g0, ship: 0, bombs: [{ x: 3, y: g0.h - 5 }] })).toBe(1)
})

test('the autopilot heads for the nearest bug and holds under it', () => {
  const g0 = newGame(30, 14, 1)
  expect(autopilot({ ...g0, ship: 0, enemies: [{ x: 20, y: 1, row: 0 }] })).toBe(1)
  expect(autopilot({ ...g0, ship: 25, enemies: [{ x: 2, y: 1, row: 0 }] })).toBe(-1)
  expect(autopilot({ ...g0, ship: 19, enemies: [{ x: 20, y: 1, row: 0 }] })).toBe(0)
})

test('a demo on autopilot clears a wave and keeps everything on the board', () => {
  let g = newGame(30, 16, 5)
  for (let i = 0; i < 3000 && g.status === 'playing' && g.wave === 1; i++) {
    g = step(move(g, autopilot(g)))
    expect(g.ship).toBeGreaterThanOrEqual(0)
    expect(g.ship).toBeLessThanOrEqual(g.w - SHIP_W)
  }
  expect(g.wave).toBe(2)
})
