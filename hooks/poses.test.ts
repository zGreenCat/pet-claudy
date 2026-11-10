import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, SCENES, mirrored } from './clawd'
import type { Context, View } from './clawd'
import { solo } from './desks'
import { cue, pose, start, step } from './director'
import { CHEER, COFFEE, HALF_TURN, IDLE, MUSIC, READ, SLEEP, SMOKE, WALK, loopTicks, shotAt } from './poses'
import type { Shot } from './poses'

const COLORS = new Set([...'ODKNPWBUMEYSR.'])
const ALL: [string, readonly Shot[]][] = [
  ['walk', WALK],
  ['half turn', [{ ticks: 1, px: HALF_TURN }]],
  ['idle', IDLE],
  ['read', READ],
  ['music', MUSIC],
  ['coffee', COFFEE],
  ['smoke', SMOKE],
  ['cheer', CHEER],
  ['sleep', SLEEP],
]

test('every drawing is the workshop size, in known colors, and fits the terminal cells', () => {
  for (const [name, shots] of ALL) {
    for (const { px } of shots) {
      expect([name, px.length]).toEqual([name, 8])
      for (const row of px) {
        expect([name, row.length]).toEqual([name, 24])
        for (const c of row) expect([name, COLORS.has(c)]).toEqual([name, true])
      }
      // Two colors to a full cell, one to a cell part empty
      for (let cy = 0; cy < 4; cy++) {
        for (let cx = 0; cx < 12; cx++) {
          const cell = [px[cy * 2]![cx * 2]!, px[cy * 2]![cx * 2 + 1]!, px[cy * 2 + 1]![cx * 2]!, px[cy * 2 + 1]![cx * 2 + 1]!]
          const colors = new Set(cell.filter(c => c !== '.'))
          expect([name, cy, cx, colors.size <= (cell.includes('.') ? 1 : 2)]).toEqual([name, cy, cx, true])
        }
      }
    }
  }
})

test('a loop of shots plays each for its ticks, then starts over', () => {
  const loop = loopTicks(MUSIC)
  expect(loop).toBe(MUSIC.length * 2)
  expect(shotAt(MUSIC, 0)).toBe(MUSIC[0])
  expect(shotAt(MUSIC, 2)).toBe(MUSIC[1])
  expect(shotAt(MUSIC, loop + 2)).toBe(MUSIC[1])
})

test('a smoke or a coffee never gives way mid-puff or mid-sip', () => {
  for (const [id, shots] of [['smoke', SMOKE], ['coffee', COFFEE]] as const) {
    const busy = Array.from({ length: loopTicks(shots) }, (_, s) => s).filter(s => shotAt(shots, s).busy)
    expect(busy.length).toBeGreaterThan(0)
    for (const s of busy) expect(SCENES[id].canLeave!(s)).toBe(false)
  }
})

test('the scenes drawn in the workshop show their drawings, the cells kept for the desks', () => {
  const ids = ['idle', 'read', 'music', 'coffee', 'smoke'] as const
  for (const id of ids) {
    const p = SCENES[id].play(0)
    expect([id, p.quarters !== undefined]).toEqual([id, true])
    expect(p.frame[0]).toBe('.OLOORO.')
  }
})

test('stopped where it walked to, Clawd reads facing the way it came', () => {
  // Work in a narrow band until Clawd walks left, then it starts reading
  const columns = 50
  const working: Context = { idleTicks: 0, isWorking: true }
  let d = start(0)
  let t = 0
  let last: View | undefined
  for (; t < 600; t++) {
    d = step(d, working, t)
    const v = pose(d, working, t, columns)
    if (last && v.quarters && v.x < last.x) break
    last = v
  }
  const reading: Context = { ...working, readingFor: 0 }
  let shown: View | undefined
  for (let k = t + 1; k < t + 20; k++) {
    d = step(d, { ...reading, readingFor: k - t - 1 }, k)
    const v = pose(d, reading, k, columns)
    if (v.line === 'leyendo…' && v.quarters) {
      shown = v
      break
    }
  }
  expect(shown?.quarters).toEqual(mirrored(READ[0]!.px))
})

test('the cheer lasts as long as the cells cheer, its eyes smiling only through the jump', () => {
  expect(loopTicks(CHEER)).toBe(CELEBRATE_TICKS)
  expect(CHEER[0]!.eyes).toBeUndefined()
  expect(CHEER.at(-1)!.eyes).toBeUndefined()
  expect(CHEER.some(shot => shot.eyes === 'joy')).toBe(true)
  expect(SLEEP.every(shot => shot.eyes === 'shut')).toBe(true)
  // Every shot with eyes has an eye to draw them on
  for (const shot of [...CHEER, ...SLEEP]) if (shot.eyes) expect(shot.px.some(row => row.includes('K'))).toBe(true)
})

test('the eyes draw as glyphs on the body, and the line stays clear of the drawing', () => {
  const text = (rows: ReturnType<typeof solo>) => rows.map(row => row.map(seg => seg.text).join(''))
  const joy = CHEER.find(shot => shot.eyes === 'joy' && shot.px[2]!.endsWith('O'))!
  const rows = text(solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 4, '¡listo!', true, 80, undefined, joy.px, 'joy'))
  expect(rows.join('').split('^').length - 1).toBe(2)
  // The drawing reaches its last cell, 4 + POSE_DX + 11; the line starts past it
  expect(rows[2]!.indexOf('¡listo!')).toBeGreaterThan(4 - 2 + 11)
  const asleep = text(solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'zzz', false, 80, undefined, SLEEP[0]!.px, 'shut'))
  expect(asleep.join('').split('▁').length - 1).toBe(2)
})

test('the director shows the cheer drawn, smiling mid-jump, and sleep with its eyes shut', () => {
  const idle: Context = { idleTicks: 0, isWorking: false }
  let d = cue(start(0), 'celebrate', 0)
  const eyes = new Set<string | undefined>()
  for (let t = 0; t < CELEBRATE_TICKS; t++) {
    d = step(d, idle, t)
    const v = pose(d, idle, t, 80)
    expect(v.quarters).toBeDefined()
    eyes.add(v.eyes)
  }
  expect([...eyes].sort()).toEqual(['joy', undefined].sort())
  const asleep: Context = { idleTicks: 10_000, isWorking: false }
  let z = start(0)
  z = step(z, asleep, 1)
  const v = pose(z, asleep, 1, 80)
  expect([v.line, v.eyes, v.quarters !== undefined]).toEqual(['zzz', 'shut', true])
})
