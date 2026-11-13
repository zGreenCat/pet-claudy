import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, SCENES, mirrored } from './clawd'
import type { Context, View } from './clawd'
import { solo } from './desks'
import { cue, pose, start, step } from './director'
import {
  CHEER,
  COFFEE,
  HALF_TURN,
  IDLE,
  MUSIC,
  READ,
  SLEEP,
  SMOKE,
  TALL_HALF_TURN,
  TALL_IDLE,
  TALL_WALK,
  WALK,
  loopTicks,
  mirroredCells,
  shotAt,
} from './poses'
import type { Shot } from './poses'

const COLORS = new Set([...'ODKNPWBUMEYSR.'])
const ALL: [string, readonly Shot[]][] = [
  ['walk', WALK],
  ['half turn', [HALF_TURN]],
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
    for (const { px, cells = [] } of shots) {
      expect([name, px.length]).toEqual([name, 12])
      for (const row of px) {
        expect([name, row.length]).toEqual([name, 24])
        for (const c of row) expect([name, COLORS.has(c)]).toEqual([name, true])
      }
      // Two colors to a full cell, one to a cell part empty: in sextants, and in the cells kept in quarters
      const fits = (cell: string[]) => new Set(cell.filter(c => c !== '.')).size <= (cell.includes('.') ? 1 : 2)
      for (let cy = 0; cy < 4; cy++) {
        for (let cx = 0; cx < 12; cx++) {
          const cell = [0, 1, 2].flatMap(k => [px[cy * 3 + k]![cx * 2]!, px[cy * 3 + k]![cx * 2 + 1]!])
          expect([name, cy, cx, fits(cell)]).toEqual([name, cy, cx, true])
        }
      }
      const places = new Set<string>()
      for (const cell of cells) {
        expect([name, cell.grid]).toEqual([name, 'quarters'])
        if (cell.grid !== 'quarters') continue
        expect([name, cell.px.map(row => row.length)]).toEqual([name, [2, 2]])
        expect([name, cell.x, cell.y, fits([...cell.px.join('')])]).toEqual([name, cell.x, cell.y, true])
        // One grid to a cell, and nothing drawn under it
        expect(places.has(`${cell.x},${cell.y}`)).toBe(false)
        places.add(`${cell.x},${cell.y}`)
        const under = [0, 1, 2].flatMap(k => [px[cell.y * 3 + k]![cell.x * 2]!, px[cell.y * 3 + k]![cell.x * 2 + 1]!])
        expect([name, cell.x, cell.y, under.join('')]).toEqual([name, cell.x, cell.y, '......'])
      }
    }
  }
})

test('Clawd keeps the shape it had in quarters: a cell is sextants only where its halves were alike', () => {
  // Front-on and still: the head and body whole cells, the eyes, arms and legs half a cell as ever
  const front = IDLE[0]!
  const kept = (front.cells ?? []).map(cell => (cell.grid === 'quarters' ? `${cell.x},${cell.y}:${cell.px.join('/')}` : ''))
  expect(kept).toEqual([
    '4,1:OO/KO', '7,1:OO/OK',
    '2,2:OO/..', '9,2:OO/..',
    '3,3:O./..', '4,3:O./..', '7,3:.O/..', '8,3:.O/..',
  ])
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'hola', false, 80, undefined, front.px, undefined, front.cells)
  const text = rows.map(row => row.map(seg => seg.text).join(''))
  // Not one sextant in it: quarter blocks and whole cells, as it was
  expect(text.join('')).not.toMatch(/[\u{1FB00}-\u{1FB3B}]/u)
  expect(text[3]).toContain('▘')
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
  const hasEye = (shot: Shot) => (shot.cells ?? []).some(cell => cell.grid === 'quarters' && cell.px.join('').includes('K'))
  for (const shot of [...CHEER, ...SLEEP]) if (shot.eyes) expect(hasEye(shot)).toBe(true)
})

test('the eyes draw as glyphs on the body, and the line stays clear of the drawing', () => {
  const text = (rows: ReturnType<typeof solo>) => rows.map(row => row.map(seg => seg.text).join(''))
  const joy = CHEER.find(shot => shot.eyes === 'joy' && shot.cells?.some(cell => cell.x === 11 && cell.y === 1))!
  const rows = text(solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 4, '¡listo!', true, 80, undefined, joy.px, 'joy', joy.cells))
  expect(rows.join('').split('^').length - 1).toBe(2)
  // The drawing reaches its last cell, 4 + POSE_DX + 11; the line starts past it
  expect(rows[2]!.indexOf('¡listo!')).toBeGreaterThan(4 - 2 + 11)
  const asleep = text(solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'zzz', false, 80, undefined, SLEEP[0]!.px, 'shut', SLEEP[0]!.cells))
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

test('the tall drawings are twelve rows, three to a cell, and fit the cells as sextants', () => {
  const tall: readonly Shot[] = [...TALL_WALK, ...TALL_IDLE, TALL_HALF_TURN]
  expect(loopTicks(TALL_IDLE)).toBe(loopTicks(IDLE))
  for (const { px } of tall) {
    expect(px.length).toBe(12)
    for (const row of px) expect(row.length).toBe(24)
    for (let cy = 0; cy < 4; cy++) {
      for (let cx = 0; cx < 12; cx++) {
        const cell = [0, 1, 2].flatMap(k => [px[cy * 3 + k]![cx * 2]!, px[cy * 3 + k]![cx * 2 + 1]!])
        const colors = new Set(cell.filter(c => c !== '.'))
        // A blend is the whole cell's; other cells take two colors full, one part empty
        const fits = cell.some(c => '123'.includes(c)) ? new Set(cell).size === 1 : colors.size <= (cell.includes('.') ? 1 : 2)
        expect([cy, cx, fits]).toEqual([cy, cx, true])
      }
    }
  }
})

test('a cell filled with a blend is a shade glyph of the body and its shade', () => {
  const side = TALL_IDLE.find(shot => shot.px.some(row => row.includes('2')))!
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 2, 'hola', false, 80, undefined, side.px)
  const shades = rows[1]!.filter(seg => /[░▒▓]/.test(seg.text))
  expect(shades.map(seg => seg.text).join('')).toBe('▒░')
  for (const seg of shades) expect([seg.style.fg, seg.style.bg]).toEqual(['#A0533A', 'claude'])
})

test('a drawing of twelve rows is painted in sextants over the same four rows', () => {
  const blink = TALL_IDLE.find(shot => !shot.cells && shot.px.some(row => row.includes('K')))!
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'hola', false, 80, undefined, blink.px)
  expect(rows.length).toBe(4)
  const text = rows.map(row => row.map(seg => seg.text).join(''))
  // A blink is the lowest third of a column of the eye's cell
  expect(rows[1]!.filter(seg => seg.style.fg === '#1A1A1A').map(seg => seg.text)).toEqual(['🬏', '🬞'])
  // The legs stand in the last row's upper two thirds; no quarter block is used for them
  expect(text[3]).toContain('🬉')
  expect(text.join('')).not.toMatch(/[▘▝▖▗]/)
})

test('a cell on its own grid is painted in quarters over the sextants: the eyes, half a cell tall', () => {
  const open = TALL_IDLE[0]!
  expect(open.cells?.length).toBe(2)
  // Every such cell sits on the drawing and fits the terminal's rule
  for (const shot of [...TALL_WALK, ...TALL_IDLE, TALL_HALF_TURN]) {
    for (const cell of shot.cells ?? []) {
      expect(cell.x >= 0 && cell.x < 12 && cell.y >= 0 && cell.y < 4).toBe(true)
      if (cell.grid === 'eighths') {
        expect(cell.level >= 1 && cell.level <= 7).toBe(true)
        continue
      }
      expect(cell.px.map(row => row.length)).toEqual([2, 2])
      const px = cell.px.join('')
      expect(new Set([...px].filter(c => c !== '.')).size <= (px.includes('.') ? 1 : 2)).toBe(true)
    }
  }
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'hola', false, 80, undefined, open.px, undefined, open.cells)
  const eyes = rows[1]!.filter(seg => seg.style.fg === '#1A1A1A')
  expect(eyes.map(seg => seg.text)).toEqual(['▖', '▗'])
  for (const eye of eyes) expect(eye.style.bg).toBe('claude')
  // Without them the cells are plain body
  const bare = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'hola', false, 80, undefined, open.px)
  expect(bare[1]!.some(seg => seg.style.fg === '#1A1A1A')).toBe(false)
})

test('cells on their own grids turn with the drawing', () => {
  expect(mirroredCells([{ x: 4, y: 1, grid: 'quarters', px: ['OO', 'KO'] }])).toEqual([{ x: 7, y: 1, grid: 'quarters', px: ['OO', 'OK'] }])
  // Reading where it walked to the left, a scene's cells are mirrored with its drawing
  const side = TALL_IDLE.find(shot => shot.px.some(row => row.includes('2')))!
  const turned = mirroredCells(side.cells!)
  expect(turned.map(cell => cell.x).sort((a, b) => a - b)).toEqual(side.cells!.map(cell => 11 - cell.x).sort((a, b) => a - b))
})

test('a breath is the top edge of the body rising by eighths, in the air over it', () => {
  const breaths = TALL_IDLE.filter(shot => shot.cells?.some(cell => cell.grid === 'eighths'))
  const levels = breaths.map(shot => shot.cells!.find(cell => cell.grid === 'eighths')!).map(cell => (cell.grid === 'eighths' ? cell.level : 0))
  expect(levels.slice(0, 6)).toEqual([1, 2, 3, 3, 2, 1])
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'hola', false, 80, undefined, breaths[2]!.px, undefined, breaths[2]!.cells)
  // Six cells wide over the body, three eighths up, in its color and over nothing
  const air = rows[0]!.filter(seg => seg.text.includes('▃'))
  expect(air.map(seg => seg.text).join('')).toBe('▃▃▃▃▃▃')
  for (const seg of air) expect([seg.style.fg, seg.style.bg]).toEqual(['claude', undefined])
})

test('an edge in eighths turns with the drawing, and its ends are a plain cell', () => {
  expect(mirroredCells([{ x: 0, y: 2, grid: 'eighths', from: 'left', level: 3, color: 'W' }])).toEqual([
    { x: 11, y: 2, grid: 'eighths', from: 'right', level: 3, color: 'W' },
  ])
  const px = Array.from({ length: 12 }, () => '.'.repeat(24))
  const cell = (level: number, back?: string) =>
    solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 2, '', false, 80, undefined, px, undefined, [
      { x: 2, y: 1, grid: 'eighths', from: 'right', level, color: 'W', ...(back ? { back } : {}) },
    ])[1]!.find(seg => seg.text.trim() !== '' || seg.style.bg !== undefined)
  expect(cell(2)?.text).toBe('🮇')
  expect(cell(2, 'O')?.style).toEqual({ fg: '#F2F2F2', bg: 'claude' })
  expect(cell(8)?.style.bg).toBe('#F2F2F2')
  expect(cell(0)).toBeUndefined()
})
