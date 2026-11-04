// What Clawd wears: a picture in pixels, two to a cell each way, drawn as
// marks over whatever pose it is in and placed by where its head is
// (`View.head`). An accessory is drawn once, for a head up; the sunk and the
// fallen ones are worked out from it. So a new scene needs nothing to wear it,
// and a new accessory needs no scene changed. A scene with something on its
// head already (the headphones, the bulb) leaves no room: the accessory waits.

import type { Head, View } from './clawd.ts'
import type { Mark } from './desks'

// `pixels` rows from the top of the band, columns from Clawd's left edge; each
// letter a color of `colors`, `.` empty. Clawd's head is pixel columns 2 to 13
export type Accessory = { id: string; colors: Record<string, string>; pixels: string[] }

// A Santa hat: a white brim across the head, the red crown on it, its tip
// falling down the right side to a white bobble beside the head
export const HAT: Accessory = {
  id: 'gorro',
  colors: { r: '#D93A3A', w: '#F2F2F2' },
  pixels: [
    '....rrrrrrrrrrrrr',
    '..wwwwwwwwwwwwrrrrr',
    '.................rww',
  ],
}

// When Clawd wears the hat: through December by default, or always, or never
export const HAT_CHOICES = ['diciembre', 'siempre', 'nunca'] as const

export function wearsHat(choice: unknown, today: Date): boolean {
  if (choice === 'siempre') return true
  if (choice === 'nunca') return false
  return today.getMonth() === 11
}

const CLAUDE = 'claude'
// The band's height in pixels, and the pixel column a fallen accessory starts
// at: on the ground, a cell clear of Clawd's right side
const BAND_PIXELS = 8
const FALLEN_X = 18

// Clawd's cells that are its orange body, as pixels: upper left, upper right,
// lower left, lower right. An accessory mixes into these; any other cell (an
// eye, a cigarette, a mug) is the scene's, and the accessory leaves it be
const BODY: Record<string, string> = { O: 'oooo', v: '..oo', '^': 'oo..', a: 'o...', b: '.o..', y: '..o.', z: '...o', '.': '....' }
const QUARTERS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'

type Pixel = { x: number; y: number; color: string }

// The accessory's pixels for a head: as drawn; half a cell lower; or upside
// down on the ground beside Clawd
function placed(a: Accessory, head: Head): Pixel[] {
  const out: Pixel[] = []
  a.pixels.forEach((row, y) =>
    [...row].forEach((p, x) => {
      if (p !== '.' && a.colors[p]) out.push({ x, y, color: a.colors[p]! })
    }),
  )
  if (head === 'up') return out
  if (head === 'sunk') return out.map(p => ({ ...p, y: p.y + 1 }))
  const left = Math.min(...out.map(p => p.x))
  return out.map(p => ({ color: p.color, x: p.x - left + FALLEN_X, y: BAND_PIXELS - a.pixels.length + (a.pixels.length - 1 - p.y) }))
}

// A cell's four pixels as a mark, if a terminal cell can hold them: two
// colors when it is full, one when part of it is empty. Past that the
// rarest pixels go, so the shape keeps its main colors
function cell(px: (string | undefined)[], x: number, row: number): Mark | undefined {
  const count = (c: string | undefined) => px.filter(p => p === c).length
  let colors = [...new Set(px.filter((p): p is string => p !== undefined))]
  const room = () => (px.every(p => p !== undefined) ? 2 : 1)
  while (colors.length > room()) {
    // The rarest goes; between equals, the body stays
    const gone = colors.sort((a, b) => count(a) - count(b) || (a === CLAUDE ? 1 : b === CLAUDE ? -1 : 0))[0]!
    px = px.map(p => (p === gone ? undefined : p))
    colors = colors.slice(1)
  }
  if (colors.length === 0) return undefined
  const mask = (c: string) => px.reduce((m, p, k) => (p === c ? m | (1 << k) : m), 0)
  if (px.every(p => p !== undefined)) {
    if (colors.length === 1) return { row, x, text: ' ', fg: colors[0]!, bg: colors[0]! }
    // The commoner color is the background; the body, between equals
    const [fg, bg] = colors.sort((a, b) => count(a) - count(b) || (a === CLAUDE ? 1 : b === CLAUDE ? -1 : 0))
    return { row, x, text: QUARTERS[mask(fg!)]!, fg: fg!, bg: bg! }
  }
  return { row, x, text: QUARTERS[mask(colors[0]!)]!, fg: colors[0]! }
}

// What an accessory draws over a pose: a mark for each cell it touches,
// mixed with Clawd's body under it
function marksOf(a: Accessory, v: View & { head: Head }): Mark[] {
  const cells = new Map<string, (string | undefined)[]>()
  for (const p of placed(a, v.head)) {
    const cx = Math.floor(p.x / 2)
    const row = Math.floor(p.y / 2)
    if (row < 0 || row * 2 >= BAND_PIXELS) continue
    const key = `${row},${cx}`
    if (!cells.has(key)) {
      const under = row === 0 ? '.' : (v.frame[row - 1]?.[cx] ?? '.')
      const body = BODY[under]
      // A cell of the scene's own, not the body: it keeps it
      if (body === undefined) continue
      cells.set(key, [...body].map(q => (q === 'o' ? CLAUDE : undefined)))
    }
    cells.get(key)![(p.y % 2) * 2 + (p.x % 2)] = p.color
  }
  return [...cells].flatMap(([key, px]) => {
    const [row, x] = key.split(',').map(Number) as [number, number]
    const m = cell(px, x, row)
    return m ? [m] : []
  })
}

// The view with what Clawd wears put on it, under the scene's own marks
export function dress(v: View, worn: readonly Accessory[]): View {
  if (v.head === undefined || worn.length === 0) return v
  const head = v.head
  return { ...v, marks: [...worn.flatMap(a => marksOf(a, { ...v, head })), ...v.marks] }
}
