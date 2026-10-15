import { test, expect } from 'claude-code/testing'

import { START_X, columns, describe, redact, scene, summary, walk } from './desks'
import type { Agent, Segment } from './desks'

const CLAWD: [string, string, string] = ['.OLOORO.', '^OOOOOO^', '.aa..bb.']

const agent = (id: string, over: Partial<Agent> = {}): Agent => ({
  id,
  type: 'Explore',
  activity: `tarea ${id}`,
  x: START_X,
  bornAt: 0,
  ...over,
})

const text = (rows: Segment[][]) => rows.map(r => r.map(s => s.text).join(''))

// Cells in a row painted with a color, as background or as a half block
const cellsOf = (row: Segment[], color: string) =>
  row.filter(s => s.style.bg === color || s.style.fg === color).reduce((n, s) => n + [...s.text].length, 0)

// Ticks of walking until nobody moves
function settle(agents: Agent[], t: number): Agent[] {
  for (let i = 0; i < 100; i++) agents = walk(agents, t, 80)
  return agents
}

test('tool calls read as a few words', () => {
  expect(describe('Read', { file_path: 'C:\\src\\auth\\login.ts' })).toBe('leyendo login.ts')
  expect(describe('Grep', { pattern: 'token' })).toBe('buscando "token"')
  expect(describe('Bash', { command: 'npm test', description: 'Run tests' })).toBe('Run tests')
  expect(describe('Bash', { command: 'npm\n test' })).toBe('$ npm test')
  expect(describe('WebFetch', { url: 'https://example.com/a' })).toBe('leyendo example.com')
  expect(describe('mcp__github__create_issue', {})).toBe('create_issue')
})

test('a result reads as its first line, without markdown', () => {
  expect(summary('\n## **Found 3 callers**\n- a\n- b')).toBe('Found 3 callers')
  expect(summary(undefined)).toBe('listo')
})

test('buddies walk to their desks, then open their laptops and talk', () => {
  let agents = [agent('a'), agent('b')]
  const walking = scene(0, agents, CLAWD, 'dirigiendo', 80)
  expect(text(walking)[0]).not.toContain('tarea b')
  expect(cellsOf(walking[3]!, '#6B7280')).toBe(0)

  agents = settle(agents, 0)
  const seated = scene(0, agents, CLAWD, 'dirigiendo', 80)
  expect(text(seated)[0]).toContain('tarea a')
  expect(text(seated)[0]).toContain('tarea b')
  // Each one's laptop, and each one's two eyes
  expect(cellsOf(seated[3]!, '#6B7280')).toBeGreaterThanOrEqual(4)
  const eyes = seated[2]!.filter(s => s.style.fg === '#1A1A1A').map(s => s.text).join('')
  // Each buddy's two; Clawd's own are a row up
  expect(eyes.match(/[▖▗]/g)).toHaveLength(4)
})

test('code marks float over a working buddy', () => {
  const agents = settle([agent('a')], 0)
  const marks = [0, 3, 6, 9, 12, 15].map(t => text(scene(t, agents, CLAWD, '', 80))[1]!.slice(11))
  expect(marks.some(m => /[=+{}<>()&;#!]/.test(m))).toBe(true)
})

test('the working take turns holding the floor', () => {
  const agents = settle([agent('a'), agent('b')], 0)
  const loud = (t: number) => scene(t, agents, CLAWD, '', 80)[0]!.find(s => s.style.bold)?.text.trim()
  expect(loud(0)).toBe('tarea a')
  expect(loud(12)).toBe('tarea b')
})

test('a finished buddy shuts its laptop, shows its result, then walks off', () => {
  let agents = settle([agent('a', { doneAt: 0, result: 'encontré 3' })], 0)
  const done = text(scene(1, agents, CLAWD, '', 80))
  expect(done[0]).toContain('✓ encontré 3')
  expect(done[1]).toContain('✓')

  agents = settle(agents, 40)
  expect(agents).toHaveLength(0)
})

test('more agents than desks show as a count', () => {
  const agents = Array.from({ length: 12 }, (_, i) => agent(`${i}`))
  expect(text(scene(0, agents, CLAWD, '', 80))[3]).toContain('+8')
})

test('a shown command keeps its secrets masked', () => {
  expect(describe('Bash', { command: 'curl -H "Authorization: Bearer abc.def" https://x.io' })).toBe(
    '$ curl -H "Authorization: Bearer ***" https://x.io',
  )
  expect(redact('gh auth login --token ghp_123 --with-token')).toBe('gh auth login --token *** --with-token')
  expect(redact('OPENAI_API_KEY=sk-1 npm run dev')).toBe('OPENAI_API_KEY=*** npm run dev')
  expect(redact('curl "https://x.io/a?token=s3cr3t&page=2"')).toBe('curl "https://x.io/a?token=***&page=2"')
  expect(redact('echo 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b')).toBe('echo ***')
  // What is no secret stays as it was
  expect(redact('mkdir -p /home/me/Desktop/Proyectos/pet-claudy-long-folder-name')).toBe(
    'mkdir -p /home/me/Desktop/Proyectos/pet-claudy-long-folder-name',
  )
  // A description is the model's own words: shown as they are
  expect(describe('Bash', { command: 'TOKEN=x make', description: 'Build' })).toBe('Build')
})

test('wide glyphs take two columns and keep the row aligned', () => {
  expect(columns('abc')).toBe(3)
  expect(columns('日本')).toBe(4)
  expect(columns('👨‍👩‍👧')).toBe(2)
  expect(columns('é')).toBe(1)

  for (const activity of ['leyendo 日本語のファイル名がとても長い.ts', 'listo 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀', 'equipo 👨‍👩‍👧 x'.repeat(10)]) {
    const agents = settle([agent('a', { activity }), agent('b', { activity })], 0)
    for (const t of [0, 12]) {
      for (const row of text(scene(t, agents, CLAWD, 'dirigiendo', 40))) {
        expect(columns(row)).toBeLessThanOrEqual(40)
      }
    }
    // Past a finished buddy's wide result, the next desk's bubble starts where
    // it would after plain text
    const pair = settle([agent('a', { doneAt: 0, result: activity }), agent('b')], 0)
    const top = text(scene(0, pair, CLAWD, '', 80))[0]!
    expect(columns(top.slice(0, top.indexOf('tarea b')))).toBe(24)
  }
})

test('the scene never draws wider than the band', () => {
  const agents = settle([agent('a', { activity: 'x'.repeat(200) })], 0)
  for (const row of text(scene(0, agents, CLAWD, 'dirigiendo', 40))) {
    expect([...row].length).toBeLessThanOrEqual(40)
  }
})
