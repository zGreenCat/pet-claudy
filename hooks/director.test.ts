import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, MOMENT_TICKS, READING_LINGER_TICKS } from './clawd'
import type { Context, View } from './clawd'
import { STALE_TICKS, cue, pose, reset, start, step } from './director'
import type { Director } from './director'

const WORKING: Context = { idleTicks: 0, isWorking: true }
const IDLE: Context = { idleTicks: 0, isWorking: false }

// Steps the director from tick `from` to `to`, the context given by tick, and
// what it showed at each
function play(d: Director, from: number, to: number, ctx: (t: number) => Context, columns = 80) {
  const shown: View[] = []
  for (let t = from; t <= to; t++) {
    d = step(d, ctx(t), t)
    shown[t] = pose(d, ctx(t), t, columns)
  }
  return { d, shown }
}

// The row of the food in the pan, if Clawd is cooking
const food = (v: View) => v.marks.find(m => /^[{(<[]/.test(m.text))?.row

test('cooking, a moment waits for the food to land in the pan', () => {
  // Working from tick 0, cooking from tick 72; the food is in the air at 75
  let { d, shown } = play(start(0), 0, 75, () => WORKING)
  expect(shown[75]!.line).toMatch(/^cocinando/)
  expect(food(shown[75]!)).not.toBe(2)
  d = cue(d, 'cool', 75)
  ;({ d, shown } = play(d, 76, 90, () => WORKING))
  // The toss ends at 79 with the food back in the pan; the moment begins at 80
  expect(shown[79]!.line).toMatch(/^cocinando/)
  expect(food(shown[79]!)).toBe(2)
  expect(shown[80]!.line).toBe('momento…')
})

test('a turn that ends mid-dance lets the dance finish its turn before the cheer', () => {
  let { d, shown } = play(start(0), 0, 9, () => WORKING)
  d = cue(d, 'celebrate', 9)
  ;({ d, shown } = play(d, 10, 14, () => IDLE))
  // The dance comes back to both feet every 6 ticks: 12 is the first point it can stop
  expect(shown[11]!.line).toMatch(/^pensando/)
  expect(shown[12]!.line).toBe('¡listo!')
})

test('after a moment, work picks up its line where it left off, at the start of a step', () => {
  let { d } = play(start(0), 0, 30, () => WORKING)
  d = cue(d, 'idea', 30)
  const end = 36 + MOMENT_TICKS.idea
  const { shown } = play(d, 31, end + 1, () => WORKING)
  // The dance stops at 36, its feet together, and picks up there after
  expect(shown[35]!.line).toMatch(/^trabajando/)
  expect(shown[36]!.line).toBe('mmm…')
  expect(shown[end - 1]!.line).toBe('¡idea!')
  expect(shown[end]!.line).toMatch(/^trabajando/)
  expect(shown[end]!.frame).toEqual(play(start(0), 0, 0, () => WORKING).shown[0]!.frame)
})

test('work interrupted often still gets to cook', () => {
  // A moment every 60 ticks, less than the 72 work takes to reach the pan:
  // the lines keep turning between them
  const cues: Record<number, 'cool' | 'idea'> = {}
  for (let k = 30; k < 600; k += 60) cues[k] = k % 120 === 30 ? 'cool' : 'idea'
  let d = start(0)
  const lines: string[] = []
  for (let t = 0; t < 600; t++) {
    if (cues[t]) d = cue(d, cues[t]!, t)
    d = step(d, WORKING, t)
    lines.push(pose(d, WORKING, t, 80).line)
  }
  expect(lines.some(l => l.startsWith('cocinando'))).toBe(true)
})

test('a moment that comes during another plays after it, whole', () => {
  let { d } = play(start(0), 0, 0, () => IDLE)
  d = cue(d, 'cool', 0)
  ;({ d } = play(d, 1, 1, () => IDLE))
  d = cue(d, 'love', 2)
  // The same moment again is not repeated
  d = cue(d, 'cool', 3)
  d = cue(d, 'love', 3)
  expect(d.queue.map(q => q.id)).toEqual(['love'])
  const { shown } = play(d, 2, 1 + MOMENT_TICKS.cool + 1, () => IDLE)
  expect(shown[MOMENT_TICKS.cool]!.line).toBe('todo en verde')
  // The heart only shows once the glasses are done
  expect(shown[1 + MOMENT_TICKS.cool]!.line).toBe('…')
})

test('a moment that waits too long behind others is dropped', () => {
  let { d } = play(start(0), 0, 0, () => IDLE)
  d = cue(d, 'dizzy', 0)
  ;({ d } = play(d, 1, 1, () => IDLE))
  d = cue(d, 'cool', 1)
  d = cue(d, 'magic', 1)
  // Behind one scene alone a moment still plays; behind two it is old news
  expect(MOMENT_TICKS.dizzy).toBeLessThan(STALE_TICKS)
  expect(MOMENT_TICKS.dizzy + MOMENT_TICKS.cool).toBeGreaterThan(STALE_TICKS)
  const end = 1 + MOMENT_TICKS.dizzy + MOMENT_TICKS.cool + 4
  const { shown } = play(d, 2, end, () => IDLE)
  expect(shown.slice(2).some(v => v.line === 'todo en verde')).toBe(true)
  expect(shown.slice(2).some(v => /abra|magia|cadabra/.test(v.line))).toBe(false)
})

test('the cheer does not cut a fall short; a new prompt does', () => {
  let { d } = play(start(0), 0, 0, () => IDLE)
  d = cue(d, 'dizzy', 0)
  ;({ d } = play(d, 1, 15, () => WORKING))
  d = cue(d, 'celebrate', 15)
  const fall = play(d, 16, 1 + MOMENT_TICKS.dizzy + 1, () => IDLE)
  expect(fall.shown[20]!.line).toBe('ay…')
  expect(fall.shown[MOMENT_TICKS.dizzy]!.line).toBe('uf…')
  expect(fall.shown[1 + MOMENT_TICKS.dizzy]!.line).toBe('¡listo!')

  // A prompt mid-cheer ends it at once
  const t = 2 + MOMENT_TICKS.dizzy
  expect(t - (1 + MOMENT_TICKS.dizzy)).toBeLessThan(CELEBRATE_TICKS)
  d = reset(fall.d, WORKING, t)
  expect(pose(step(d, WORKING, t), WORKING, t, 80).line).toMatch(/^pensando/)
})

test('reading begins where the dance can stop, and the book is put away after', () => {
  const lastRead = 30
  const ctx = (t: number): Context => ({ ...WORKING, readingFor: t >= 3 && t <= lastRead + READING_LINGER_TICKS ? t - 3 : undefined })
  const { shown } = play(start(0), 0, 60, ctx)
  // Reads from tick 3; the dance first stops at 6
  expect(shown[5]!.line).toMatch(/^pensando/)
  expect(shown[6]!.line).toBe('leyendo…')
  const end = lastRead + READING_LINGER_TICKS + 1
  // A page turned, the book away, then back to work
  expect(shown[end]!.frame[1]).toContain('6')
  expect(shown[end + 1]!.frame[1]).not.toMatch(/[1-6]/)
  expect(shown[end + 2]!.line).toMatch(/^pensando/)
})

test('the headphones come off with both arms before Clawd walks on', () => {
  const ctx = (t: number): Context => ({ ...WORKING, runningFor: t <= 40 ? t : undefined })
  const { shown } = play(start(0), 0, 60, ctx)
  expect(shown[12]!.line).toBe('musiquita…')
  // The command ends at 41; the beat ends at 44, the arms go up, then back to work
  const off = shown.findIndex((v, t) => t > 40 && v?.marks.some(m => m.text.startsWith('╭')) && v.frame[0].startsWith('v'))
  expect(off).toBeGreaterThan(40)
  expect(shown[off + 2]!.line).toMatch(/^(pensando|trabajando)/)
})

test('walking, Clawd moves a cell at a time, pan or no pan, and stands still for a moment', () => {
  // A narrow band, where the pan used to shorten the walk and make it jump
  let { d, shown } = play(start(0), 0, 120, () => WORKING, 50)
  for (let t = 1; t <= 120; t++) expect(Math.abs(shown[t]!.x - shown[t - 1]!.x)).toBeLessThanOrEqual(1)
  d = cue(d, 'love', 120)
  ;({ shown } = play(d, 121, 140, () => WORKING, 50))
  // It stops where the dance left it, and stays there through the moment
  const begins = shown.findIndex((v, t) => t > 120 && v?.line === '…')
  expect(begins).toBeGreaterThan(120)
  const stood = shown[begins - 1]!.x
  for (let t = begins; t <= 140; t++) expect(shown[t]!.x).toBe(stood)
})
