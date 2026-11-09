import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, MOMENT_TICKS, READING_LINGER_TICKS, STOP_TICKS, WALK_STEPS, WALK_TICKS, mirrored } from './clawd'
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
// The first tick from `from` on whose view passes `ok`
const first = (shown: View[], from: number, ok: (v: View) => boolean) => shown.findIndex((v, t) => t >= from && !!v && ok(v))
// Working in place, front-on: the dance, or a turn into it
const isDancing = (v: View) => v.quarters === undefined && /^(pensando|trabajando|bailando)/.test(v.line)

test('cooking, a moment waits for the food to land in the pan', () => {
  // Work stops to cook some rounds in: find a tick with the food in the air
  const { shown: before } = play(start(0), 0, 600, () => WORKING)
  const tossing = first(before, 0, v => v.line.startsWith('cocinando') && food(v) !== undefined && food(v) !== 2)
  expect(tossing).toBeGreaterThan(0)
  let { d } = play(start(0), 0, tossing, () => WORKING)
  d = cue(d, 'cool', tossing)
  const { shown } = play(d, tossing + 1, tossing + 20, () => WORKING)
  // The moment begins right after a tick with the food back in the pan
  const begins = first(shown, tossing + 1, v => v.line === 'momento…')
  expect(begins).toBeGreaterThan(tossing + 1)
  expect(shown[begins - 1]!.line).toMatch(/^cocinando/)
  expect(food(shown[begins - 1]!)).toBe(2)
})

test('a turn that ends mid-dance lets the dance finish its turn before the cheer', () => {
  // Work stops to dance after its first walk and turn: two ticks into the dance
  const dancing = WALK_TICKS + 1 + 2
  let { d, shown } = play(start(0), 0, dancing, () => WORKING)
  expect(isDancing(shown[dancing]!)).toBe(true)
  d = cue(d, 'celebrate', dancing)
  ;({ d, shown } = play(d, dancing + 1, dancing + 10, () => IDLE))
  // The dance comes back to both feet every 6 ticks: four more, then the cheer
  expect(shown[dancing + 3]!.line).toMatch(/^pensando/)
  expect(shown[dancing + 4]!.line).toBe('¡listo!')
})

test('after a moment, work picks up where it left off', () => {
  // Some rounds in, dancing with the second line up
  const { shown: before } = play(start(0), 0, 600, () => WORKING)
  const at = first(before, 0, v => isDancing(v) && v.line.startsWith('trabajando'))
  let { d } = play(start(0), 0, at, () => WORKING)
  d = cue(d, 'idea', at)
  const { shown } = play(d, at + 1, at + 60, () => WORKING)
  const begins = first(shown, at + 1, v => v.line === 'mmm…')
  const ends = first(shown, begins, v => !['mmm…', '¡oh!', '¡idea!'].includes(v.line))
  expect(ends - begins).toBe(MOMENT_TICKS.idea)
  // Back on the same line, dancing on from the step it stopped at
  expect(shown[ends]!.line).toMatch(/^trabajando/)
  expect(shown[ends]!.frame).toEqual(shown[begins - 1]!.frame)
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

test('reading begins at the end of a step, and the book is put away after', () => {
  const lastRead = 30
  const ctx = (t: number): Context => ({ ...WORKING, readingFor: t >= 3 && t <= lastRead + READING_LINGER_TICKS ? t - 3 : undefined })
  const { shown } = play(start(0), 0, 60, ctx)
  // Reads from tick 3; walking, it first ends a step at 4
  expect(shown[3]!.line).toMatch(/^pensando/)
  expect(shown[4]!.line).toBe('leyendo…')
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

test('work walks three-quarters on, turns front, stops to dance, and walks on', () => {
  const { shown } = play(start(0), 0, 2 * (WALK_TICKS + STOP_TICKS + 2), () => WORKING)
  for (let t = 1; t < WALK_TICKS; t++) expect(shown[t]!.quarters).toBeDefined()
  // A turn front-on, the dance in place, a turn back
  expect(shown[WALK_TICKS]!.quarters).toBeUndefined()
  expect(shown[WALK_TICKS]!.frame[0]).toBe('.OLOORO.')
  const stop = WALK_TICKS + 1
  for (let t = stop; t < stop + STOP_TICKS; t++) {
    expect(isDancing(shown[t]!)).toBe(true)
    expect(shown[t]!.x).toBe(shown[stop]!.x)
  }
  expect(shown[stop + STOP_TICKS + 1]!.quarters).toBeDefined()
})

test('a step shows every half tick, mirrored going left, and front-on where it turns back', () => {
  const columns = 50
  const { shown } = play(start(0), 0, 600, () => WORKING, columns)
  // Steps differ between the two halves of a tick
  const walkingAt = first(shown, 1, v => v.quarters !== undefined)
  const halfway = play(start(0), 0, walkingAt, () => WORKING, columns).d
  expect(pose(halfway, WORKING, walkingAt, columns, 1).quarters).not.toEqual(shown[walkingAt]!.quarters)
  const facingRight = new Set(WALK_STEPS.map(f => f.join('|')))
  const facingLeft = new Set(WALK_STEPS.map(f => mirrored(f).join('|')))
  let left = 0
  let right = 0
  for (let t = 1; t < 600; t++) {
    const v = shown[t]!
    const prev = shown[t - 1]!
    if (!v.quarters || !prev.quarters) continue
    if (v.x < prev.x) {
      left += 1
      expect(facingLeft.has(v.quarters.join('|'))).toBe(true)
    }
    if (v.x > prev.x) {
      right += 1
      expect(facingRight.has(v.quarters.join('|'))).toBe(true)
    }
  }
  expect(left).toBeGreaterThan(0)
  expect(right).toBeGreaterThan(0)
  // At the far end of its span it stands front-on for the turn
  const far = Math.max(...shown.map(v => v!.x))
  const turn = first(shown, 1, v => v.x === far)
  expect(shown[turn]!.quarters).toBeUndefined()
})

test('a turn that ends while Clawd walks cheers where it stands, not back at its spot', () => {
  let { d, shown } = play(start(0), 0, 8, () => WORKING)
  d = cue(d, 'celebrate', 8)
  ;({ shown } = play(d, 9, 20, () => IDLE))
  // It ends its step, then cheers right there
  const cheer = first(shown, 9, v => v.line === '¡listo!')
  expect(shown[cheer - 1]!.x).toBeGreaterThan(0)
  for (let t = cheer; t < cheer + 6; t++) expect(shown[t]!.x).toBe(shown[cheer - 1]!.x)
})
