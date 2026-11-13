import { test, expect } from 'claude-code/testing'

import { HAT, dress, wearsHat } from './accessories'
import { MUSIC_AFTER_TICKS, headOf, view } from './clawd'
import type { Context, View } from './clawd'
import { cue, pose, start, step } from './director'

const RED = '#D93A3A'
const WHITE = '#F2F2F2'
const rows = (marks: { row: number }[]) => [...new Set(marks.map(m => m.row))].sort()
// The marks the hat adds to a view, ahead of the scene's own
const hat = (v: View) => {
  const dressed = dress(v, [HAT])
  return dressed.marks.slice(0, dressed.marks.length - v.marks.length)
}

test('the hat comes out in December, or always, or never, as chosen', () => {
  const nov = new Date(2026, 10, 30)
  const dec = new Date(2026, 11, 1)
  expect(wearsHat(undefined, nov)).toBe(false)
  expect(wearsHat('diciembre', dec)).toBe(true)
  expect(wearsHat('diciembre', new Date(2027, 0, 1))).toBe(false)
  expect(wearsHat('siempre', nov)).toBe(true)
  expect(wearsHat('nunca', dec)).toBe(false)
})

test('the head is read off the pose: up, sunk half a cell, or fallen', () => {
  expect(view(0, 0, false, 80).head).toBe('up')
  expect(view(0, 0, true, 80).head).toBe('up')
  // A deep breath sinks the head; dizzy, it falls upside down
  expect(view(3, 0, true, 80, undefined, { mood: 'love', since: 3 }).head).toBe('sunk')
  expect(view(16, 0, false, 80, undefined, { mood: 'dizzy', since: 16 }).head).toBe('down')
  expect(headOf(view(30, 0, false, 80, undefined, { mood: 'dizzy', since: 30 }).frame)).toBe('up')
})

test('the hat is drawn once and worked out for a sunk head and a fall', () => {
  // Up, as drawn: the brim and crown over the head, the tip and bobble down its side
  const up = hat(view(0, 0, false, 80))
  expect(up).toContainEqual({ row: 0, x: 3, text: '▀', fg: RED, bg: WHITE })
  expect(up).toContainEqual({ row: 1, x: 9, text: '▀', fg: WHITE })
  // Sunk half a cell, the brim lies on the head's upper half
  const sunk = hat(view(3, 0, true, 80, undefined, { mood: 'love', since: 3 }))
  expect(sunk).toContainEqual({ row: 1, x: 3, text: '▀', fg: WHITE, bg: 'claude' })
  expect(rows(sunk)).toEqual([0, 1])
  // Fallen, it lies upside down on the ground beside Clawd, not under it
  const fallen = hat(view(16, 0, false, 80, undefined, { mood: 'dizzy', since: 16 }))
  expect(rows(fallen)).toEqual([2, 3])
  expect(Math.min(...fallen.map(m => m.x))).toBeGreaterThanOrEqual(9)
})

test('a cell holds two colors at most: the rarest pixel goes', () => {
  // Sunk, the bobble's cell would hold red, white and nothing: the red goes
  const sunk = hat(view(3, 0, true, 80, undefined, { mood: 'love', since: 3 }))
  expect(sunk.find(m => m.row === 1 && m.x === 9)).toEqual({ row: 1, x: 9, text: '▄', fg: WHITE })
})

test('what Clawd holds keeps its cell: the hat goes around it', () => {
  // Smoking, the cigarette runs where the tip hangs: the tip waits, the crown stays
  const smoking = view(0, 220, false, 80)
  expect(smoking.line).toBe('en mi break')
  expect(hat(smoking).filter(m => m.row === 1 && m.x >= 7 && m.x <= 10)).toEqual([])
  expect(hat(smoking).some(m => m.row === 0)).toBe(true)
})

test("the hat goes under the scene's own marks", () => {
  const v = view(0, 0, false, 80, 0)
  expect(v.marks.length).toBeGreaterThan(0)
  expect(dress(v, [HAT]).marks.slice(-v.marks.length)).toEqual(v.marks)
})

test("the headphones and the bulb take the hat's place, way out included", () => {
  expect(view(40, 0, true, 80, undefined, undefined, undefined, MUSIC_AFTER_TICKS + 2).head).toBeUndefined()
  const idea = view(10, 0, true, 80, undefined, { mood: 'idea', since: 4 })
  expect(idea.head).toBeUndefined()
  expect(dress(idea, [HAT]).marks).toEqual(idea.marks)

  // Through the director: off while listening and while taking them off, back after
  const ctx = (t: number): Context => ({ idleTicks: 0, isWorking: true, runningFor: t <= 40 ? t : undefined })
  let d = start(0)
  const heads: string[] = []
  for (let t = 0; t <= 60; t++) {
    d = step(d, ctx(t), t)
    heads[t] = `${d.id}${d.exitFrom === undefined ? '' : ':exit'}=${pose(d, ctx(t), t, 80).head}`
  }
  expect(heads.filter(h => h.startsWith('music')).every(h => h.endsWith('=undefined'))).toBe(true)
  expect(heads.some(h => h.startsWith('music:exit'))).toBe(true)
  // Back at work it is drawn in pixels, and nothing drawn so wears a hat yet
  expect(heads[60]).toBe('work=undefined')

  // A moment is drawn in pixels too
  d = cue(start(0), 'cool', 0)
  d = step(d, { idleTicks: 0, isWorking: true }, 0)
  expect(pose(d, { idleTicks: 0, isWorking: true }, 0, 80).head).toBeUndefined()
})
