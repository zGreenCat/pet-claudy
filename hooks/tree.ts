// The Christmas tree at the band's right edge. December fills it in: a few
// ornaments over the month, the point lit as a star on the 24th, presents
// from the 25th. The session's work lights it up: each turn that answered
// lights one more of the ornaments there are, and the lit ones twinkle while
// Claude works. Pure: the date, the lights and the tick come in, cells come out.

import type { Style } from './desks'

export type TreeCell = { ch: string; style: Style }

export const TREE_W = 8
export const TREE_ROWS = 4
// The band it takes to show the tree and leave Clawd room to walk and talk
export const TREE_MIN_COLUMNS = 70

const GREEN = '#2F7D46'
const SHADE = '#13632F'
const TRUNK = '#8B5A2B'
const STAR = '#F2C14E'
const PRESENTS = ['#D93A3A', '#6A9BCC']
const ORNAMENTS = ['#D93A3A', '#F2C14E', '#6A9BCC', '#E58FD0']

// The day the star lights, the first day of presents, and the last day new
// ornaments come
const STAR_DAY = 24
const PRESENTS_DAY = 25
const LAST_ORNAMENT_DAY = 23

// The pine in pixels, two to a cell each way, as Clawd's are: tiers of
// branches lit at their edges and shaded at the core, over a trunk.
//   g  branches; a  their shade; h  the trunk
//   t  the point, green until it lights as the star; s  the star above it
//   P Q  the presents beside the trunk, left and right
// The star shares its cells with the point, so it takes the point's place
// rather than sitting over it: a cell part empty holds one color only
const PIXELS = [
  '.......ss.......',
  '.......tt.......',
  '......gaag......',
  '....ggaaaagg....',
  '.....gggggg.....',
  '...gggaaaaggg...',
  '.gggggggggggggg.',
  '....PPhhhhQQ....',
]

// Where ornaments hang, as cells, in the order they come. They are the cells
// all of branches: an ornament covers the shade under it
export const SPOTS: readonly [number, number][] = [
  [2, 3],
  [1, 4],
  [2, 4],
  [1, 3],
]

// Whether the tree shows, and as which day: December's own, or, chosen
// always, the full tree of Christmas outside December
export function treeDay(choice: unknown, today: Date): number | undefined {
  if (choice === 'nunca') return undefined
  if (today.getMonth() === 11) return today.getDate()
  return choice === 'siempre' ? PRESENTS_DAY : undefined
}

// The ornaments up on day `day`: the first on the 1st, all by the 23rd
export function ornamentsOn(day: number): number {
  return Math.min(SPOTS.length, Math.ceil((Math.min(day, LAST_ORNAMENT_DAY) * SPOTS.length) / LAST_ORNAMENT_DAY))
}

const QUARTERS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'

// A cell's four pixels (upper left, upper right, lower left, lower right) as
// a terminal cell: one color is its background, two are a glyph over one,
// and a part-empty cell is a glyph alone
function cellOf(px: (string | undefined)[]): TreeCell {
  const colors = [...new Set(px.filter((p): p is string => p !== undefined))]
  if (colors.length === 0) return { ch: ' ', style: {} }
  const mask = (c: string) => px.reduce((m, p, k) => (p === c ? m | (1 << k) : m), 0)
  const isFull = px.every(p => p !== undefined)
  if (colors.length > (isFull ? 2 : 1)) throw new Error(`tree cell of ${colors.length} colors: ${px.join(',')}`)
  if (isFull && colors.length === 1) return { ch: ' ', style: { bg: colors[0]! } }
  if (isFull) return { ch: QUARTERS[mask(colors[1]!)]!, style: { fg: colors[1]!, bg: colors[0]! } }
  return { ch: QUARTERS[mask(colors[0]!)]!, style: { fg: colors[0]! } }
}

// The tree on day `day` with `lit` ornaments lit, at tick `t`
export function treeCells(day: number, lit: number, isWorking: boolean, t: number): TreeCell[][] {
  const isStarLit = day >= STAR_DAY
  const color = (p: string | undefined): string | undefined => {
    switch (p) {
      case 'g':
        return GREEN
      case 'a':
        return SHADE
      case 'h':
        return TRUNK
      case 't':
        return isStarLit ? STAR : GREEN
      case 's':
        return isStarLit ? STAR : undefined
      case 'P':
      case 'Q':
        return day >= PRESENTS_DAY ? PRESENTS[p === 'P' ? 0 : 1] : undefined
      default:
        return undefined
    }
  }
  const rows: TreeCell[][] = Array.from({ length: TREE_ROWS }, (_, cy) =>
    Array.from({ length: TREE_W }, (_, cx) =>
      cellOf([0, 1, 2, 3].map(k => color(PIXELS[cy * 2 + (k >> 1)]![cx * 2 + (k & 1)]))),
    ),
  )
  const hung = ornamentsOn(day)
  const on = Math.min(lit, hung)
  SPOTS.slice(0, hung).forEach(([y, x], i) => {
    const fg = ORNAMENTS[i % ORNAMENTS.length]!
    const bg = rows[y]![x]!.style.bg ?? GREEN
    const isLit = i < on
    // A lit ornament twinkles while Claude works, each on its own beat
    const twinkle = isLit && isWorking && (t + i * 3) % 6 < 2
    rows[y]![x] = { ch: twinkle ? '*' : '●', style: isLit ? { fg, bg, bold: true } : { fg, bg, dim: true } }
  })
  return rows
}
