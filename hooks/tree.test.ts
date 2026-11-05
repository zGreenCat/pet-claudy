import { test, expect } from 'claude-code/testing'

import { scene, solo, usableColumns } from './desks'
import type { Agent } from './desks'
import { SPOTS, TREE_ROWS, TREE_W, ornamentsOn, treeCells, treeDay } from './tree'
import type { TreeCell } from './tree'

const STAR = '#F2C14E'
const PRESENTS = ['#D93A3A', '#6A9BCC']
const ornaments = (cells: TreeCell[][]) => cells.flat().filter(c => c.ch === '●' || c.ch === '*')
const colors = (cells: TreeCell[][]) => new Set(cells.flat().flatMap(c => [c.style.fg, c.style.bg]))

test('the tree stands in December, or always, or never, as chosen', () => {
  const nov = new Date(2026, 10, 30)
  const dec = new Date(2026, 11, 12)
  expect(treeDay(undefined, nov)).toBeUndefined()
  expect(treeDay('diciembre', dec)).toBe(12)
  expect(treeDay('diciembre', new Date(2027, 0, 1))).toBeUndefined()
  // Chosen always, outside December it is the full tree of Christmas
  expect(treeDay('siempre', nov)).toBe(25)
  expect(treeDay('siempre', dec)).toBe(12)
  expect(treeDay('nunca', dec)).toBeUndefined()
})

test('ornaments come one by one through December, all of them by the 23rd', () => {
  expect(ornamentsOn(1)).toBe(1)
  expect(ornamentsOn(23)).toBe(SPOTS.length)
  expect(ornamentsOn(31)).toBe(SPOTS.length)
  for (let d = 1; d < 31; d++) expect(ornamentsOn(d + 1)).toBeGreaterThanOrEqual(ornamentsOn(d))
  expect(ornaments(treeCells(1, 0, false, 0))).toHaveLength(1)
  expect(ornaments(treeCells(23, 0, false, 0))).toHaveLength(SPOTS.length)
})

test('the point lights as the star on the 24th, and presents come on the 25th', () => {
  const top = (day: number) => treeCells(day, 0, false, 0).slice(0, 1)
  expect(colors(top(23)).has(STAR)).toBe(false)
  expect(colors(top(24)).has(STAR)).toBe(true)
  // On the ground row, below where ornaments hang
  const ground = (day: number) => treeCells(day, 0, false, 0).slice(TREE_ROWS - 1)
  for (const p of PRESENTS) {
    expect(colors(ground(24)).has(p)).toBe(false)
    expect(colors(ground(25)).has(p)).toBe(true)
  }
})

test('every day of the month draws in its cells, whatever the lights and the tick', () => {
  for (let day = 1; day <= 31; day++) {
    for (const lit of [0, 2, 99]) {
      for (const t of [0, 1, 2, 3, 4, 5]) {
        const cells = treeCells(day, lit, true, t)
        expect(cells).toHaveLength(TREE_ROWS)
        for (const row of cells) expect(row).toHaveLength(TREE_W)
      }
    }
  }
})

test('the session lights the ornaments there are, no more, and they twinkle only while Claude works', () => {
  const lit = (cells: TreeCell[][]) => ornaments(cells).filter(c => c.style.bold)
  expect(lit(treeCells(23, 0, false, 0))).toHaveLength(0)
  expect(lit(treeCells(23, 2, false, 0))).toHaveLength(2)
  // More turns than ornaments light them all, and only them
  expect(lit(treeCells(1, 5, false, 0))).toHaveLength(1)
  const twinkles = (isWorking: boolean) =>
    [0, 1, 2, 3, 4, 5].some(t => ornaments(treeCells(23, 4, isWorking, t)).some(c => c.ch === '*'))
  expect(twinkles(false)).toBe(false)
  expect(twinkles(true)).toBe(true)
})

test('the tree stands at the right edge and Clawd keeps to the room it leaves', () => {
  const tree = treeCells(25, 0, false, 0)
  const rows = solo(['.OLOORO.', '^OOOOOO^', '.aa..bb.'], [], 0, 'esperándote', false, 80, tree)
  const text = rows.map(r => r.map(s => s.text).join(''))
  // The tree's last cells end the band's rows
  expect(text[3]!.length).toBe(80)
  expect(usableColumns(80, tree)).toBe(80 - TREE_W - 1)
  expect(usableColumns(80)).toBe(80)
})

test('beside the tree the desks seat fewer buddies', () => {
  const agents: Agent[] = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, type: 'Explore', activity: 'leyendo', x: i * 13, bornAt: 0 }))
  // The count of those left out, at the end of the desks' row
  const hidden = (decor?: TreeCell[][]) => {
    const row = scene(0, agents, ['.OLOORO.', '^OOOOOO^', '.aa..bb.'], 'dirigiendo', 90, decor)[3]!
    return Number(/\+(\d+)/.exec(row.map(s => s.text).join(''))?.[1] ?? 0)
  }
  expect(hidden(treeCells(25, 0, false, 0))).toBeGreaterThan(hidden())
})
