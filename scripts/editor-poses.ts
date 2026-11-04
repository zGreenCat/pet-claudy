// Writes the poses the pixel editor (scripts/editor.html) opens with: Clawd
// in a few poses that move its head, wearing what hooks/accessories.ts
// draws, so the editor shows the accessories as the plugin draws them now.
//   node scripts/editor-poses.ts
// Not part of the mod: the engine loads only hooks/.

import { readFileSync, writeFileSync } from 'node:fs'

import { HAT, dress } from '../hooks/accessories.ts'
import { view } from '../hooks/clawd.ts'
import type { View } from '../hooks/clawd.ts'

const EDITOR = new URL('./editor.html', import.meta.url)
// The editor's band: 20 cells wide
const COLUMNS = 20

const poses: [string, View][] = [
  ['gorro · quieto', view(0, 0, false, 80)],
  ['gorro · brazos arriba', view(1, 0, true, 80)],
  ['gorro · cabeza hundida', view(3, 0, true, 80, undefined, { mood: 'love', since: 3 })],
  ['gorro · tambaleo', view(12, 0, false, 80, undefined, { mood: 'dizzy', since: 12 })],
  ['gorro · caído', view(16, 0, false, 80, undefined, { mood: 'dizzy', since: 16 })],
  ['gorro · fumando', view(0, 220, false, 80)],
  ['gorro · cool', view(8, 0, true, 80, undefined, { mood: 'cool', since: 8 })],
]

// Each pose's sprite rows, and only the marks the hat adds: the scene's own
// (smoke, sparkles) are not the accessory's to edit
const data = poses.map(([name, v]) => {
  const dressed = dress(v, [HAT])
  return {
    name,
    sprite: v.frame.map(row => row.slice(0, COLUMNS)),
    marks: dressed.marks.slice(0, dressed.marks.length - v.marks.length),
  }
})

const html = readFileSync(EDITOR, 'utf8')
const line = /^ {2}const POSES = .*;$/m
if (!line.test(html)) throw new Error('scripts/editor.html has no "const POSES = …;" line to replace')
writeFileSync(EDITOR, html.replace(line, `  const POSES = ${JSON.stringify(data)};`))
console.log(`editor.html: ${data.length} poses`)
