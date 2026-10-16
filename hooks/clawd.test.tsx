import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, MOMENT_TICKS, cueOf, isSmoking, isThanks, view, viewKey } from './clawd'

// How many times the drawing changes over `ticks` ticks (each change is a redraw)
function changes(ticks: number, idleFrom: number, isWorking: boolean): number {
  let last = ''
  let n = 0
  for (let t = 0; t < ticks; t++) {
    const key = viewKey(view(t, isWorking ? 0 : idleFrom + t, isWorking, 80))
    if (key !== last) n += 1
    last = key
  }
  return n
}

test('idle Clawd redraws about once a second, not on every tick', () => {
  // 40 ticks = 10 s
  const n = changes(40, 0, false)
  expect(n).toBeLessThan(20)
  expect(n).toBeGreaterThan(5)
})

test('asleep Clawd stops redrawing', () => {
  expect(view(0, 10_000, false, 80).line).toBe('zzz')
  expect(changes(400, 10_000, false)).toBe(1)
})

test('working Clawd wakes up and dances', () => {
  const v = view(1, 0, true, 80)
  expect(v.line.startsWith('pensando')).toBe(true)
  expect(changes(12, 0, true)).toBeGreaterThan(6)
})

test('cooking code, Clawd tosses it in a pan', () => {
  // The fourth line, from tick 72
  const rows = [72, 74, 75, 76].map(t => view(t, 0, true, 80))
  expect(rows[0]!.line.startsWith('cocinando código')).toBe(true)
  expect(rows[0]!.frame[1]).toContain('PPPP')
  // In the pan, then up in the air
  expect(rows.map(v => v.marks[0]!.row)).toEqual([2, 1, 0, 0])
})

test('idle a while, Clawd takes a smoke break now and then', () => {
  expect(isSmoking(10)).toBe(false)
  expect(isSmoking(100)).toBe(false)
  expect(isSmoking(220)).toBe(true)
  expect(isSmoking(10_000)).toBe(false)

  const v = view(0, 220, false, 80)
  expect(v.line).toBe('en mi break')
  expect(v.frame[0]).toMatch(/ccc[CY]$/)
  // The puffs rise
  const rows = new Set([0, 2, 4, 6].flatMap(t => view(t, 220, false, 80).marks.map(m => m.row)))
  expect(rows.has(0) && rows.has(1)).toBe(true)
})

const band = (isWorking: boolean) => ({
  component: 'AbovePrompt' as const,
  props: {
    hasSurvey: false,
    isWorking,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
})

test('Clawd draws above the prompt, idle and working', async $ => {
  for (const surface of ['terminal', 'desktop'] as const) {
    for (const isWorking of [false, true]) {
      const ui = await $.ui.mount({ plugin: 'clawd-buddy', surface, ...band(isWorking) })
      // The eyes: dark cells on Clawd's orange
      expect(await ui.find({ type: 'Text', text: /[▖▗]/ })).toBeDefined()
      await ui.unmount()
    }
  }
})

test('Clawd steps aside for a survey', async ($, on) => {
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>survey</Text>
  })
  const ui = await $.ui.mount({
    plugin: 'clawd-buddy',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: { hasSurvey: true, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  })
  expect(await ui.find({ type: 'Text', text: /[▖▗]/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'survey' })).toBeDefined()
  await ui.unmount()
})

test('a subagent sits down at its desk beside Clawd', async ($, on) => {
  // Nothing beneath the plugin answers these events in a test
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'a1' }))
  on('classic.SubagentStop', () => ({}))
  await $.agent.spawn({
    tool_use_id: 'toolu_1',
    prompt: 'buscar auth',
    description: 'buscar auth',
    subagentType: 'Explore',
    provider: { plugin: 'engine', tier: 'core' },
    parentModel: 'opus',
    background: false,
    fork: false,
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'clawd-buddy', surface, ...band(true) })
    expect(await ui.find({ type: 'Text', text: 'dirigiendo' })).toBeDefined()
    await ui.unmount()
  }
  await $.classic.SubagentStop({ agent_id: 'a1', agent_type: 'Explore', agent_transcript_path: '', stop_hook_active: false })
})

test('a finished turn makes Clawd cheer, then settle, then go back to waiting', () => {
  const cheer = view(0, 0, false, 80, 0)
  expect(cheer.line).toBe('¡listo!')
  expect(cheer.marks.length).toBeGreaterThan(2)
  // Cheering beats a turn still marked as running
  expect(view(0, 0, true, 80, 0).line).toBe('¡listo!')

  expect(view(0, 0, false, 80, CELEBRATE_TICKS - 2).line).toBe('✓ listo')
  expect(view(0, 0, false, 80, CELEBRATE_TICKS).line).not.toMatch(/listo!|✓/)
  // Not from a turn that never ended
  expect(view(0, 0, false, 80, undefined).line).not.toBe('¡listo!')

  // It moves on every tick while it cheers
  const key = (s: number) => viewKey(view(s, 0, false, 80, s))
  for (let s = 0; s < 10; s++) expect(key(s)).not.toBe(key(s + 1))
})

test('Clawd cheers over a turn that answered, not over a subagent', async ($, on) => {
  on('turn.complete', () => ({ text: '' }))
  const done = { answer: '', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' as const }

  await $.turn.complete({ ...done, agentId: 'sub1' })
  let ui = await $.ui.mount({ plugin: 'clawd-buddy', surface: 'terminal', ...band(false) })
  expect(await ui.find({ type: 'Text', text: /¡listo!/ })).toBeUndefined()
  await ui.unmount()

  await $.turn.complete(done)
  ui = await $.ui.mount({ plugin: 'clawd-buddy', surface: 'terminal', ...band(false) })
  expect(await ui.find({ type: 'Text', text: /¡listo!/ })).toBeDefined()
  await ui.unmount()
})

test('a moment shows over work for a few seconds, then lets go', () => {
  const at = (mood: 'cool' | 'love' | 'idea', since: number) => view(10 + since, 0, true, 80, undefined, { mood, since })

  // Cool: an arm lifts a little, sweeps down, and the glasses are on
  expect(at('cool', 0).frame[0]).toBe('.OLOOROv')
  expect(at('cool', 3).frame[0]).toBe('.ssssssv')
  expect(at('cool', 5).frame[0]).toBe('.ssssss.')
  expect(at('cool', 5).line).toBe('todo en verde')
  expect(at('cool', MOMENT_TICKS.cool).line).not.toBe('todo en verde')
  // A finished turn's cheer beats any moment
  expect(view(10, 0, false, 80, 0, { mood: 'love', since: 0 }).line).toBe('¡listo!')

  // Love: a breath sinks the head half a cell, eyes shut, over legs that never
  // move; then eyes squeezed and a heart beside it that beats
  for (const since of [0, 3, 8, 12]) expect(at('love', since).frame[2]).toBe('.aa..bb.')
  expect(at('love', 3).frame[0]).toMatch(/^\.v{6}\./)
  expect(at('love', 3).frame[1]).toContain('m')
  expect(at('love', 8).frame[0]).toContain('>')
  const heartRows = (since: number) => at('love', since).marks.filter(m => m.fg !== 'claude').length
  expect(heartRows(4)).toBe(0)
  expect(heartRows(8)).toBe(3)
  expect(at('love', 8).marks.map(m => m.text).join('')).not.toBe(at('love', 10).marks.map(m => m.text).join(''))

  // Idea: the bulb shows dim, it looks up, the bulb lights, then wide eyes
  const bulb = (since: number) => at('idea', since).marks.find(m => m.text === '●')!
  expect(at('idea', 0).frame[0]).toBe('.OLOORO.')
  expect(at('idea', 2).frame[0]).toBe('.OpOOpO.')
  expect(bulb(2).fg).not.toBe(bulb(4).fg)
  expect(at('idea', 6).frame[0]).toBe('.OwOOwO.')
  expect(at('idea', 6).marks.map(m => m.text).join('')).toContain('\\')
  expect(at('idea', 12).frame[0]).toBe('.OLOORO.')
})

test('thanks, passing tests, commits and fresh plans earn a moment', () => {
  expect(isThanks('muchas gracias!')).toBe(true)
  expect(isThanks('Thanks <3')).toBe(true)
  expect(isThanks('arregla el bug')).toBe(false)

  expect(cueOf('Bash', { command: 'npm test' }, true)).toBe('cool')
  expect(cueOf('Bash', { command: 'pnpm run test -- --watch=false' }, true)).toBe('cool')
  expect(cueOf('Bash', { command: 'git commit -m "fix"' }, true)).toBe('cool')
  expect(cueOf('Bash', { command: 'npm test' }, false)).toBeUndefined()
  expect(cueOf('Bash', { command: 'ls tests/' }, true)).toBeUndefined()

  expect(cueOf('ExitPlanMode', {}, true)).toBe('idea')
  expect(cueOf('Skill', { skill: 'pdf' }, true)).toBe('magic')
  expect(cueOf('TodoWrite', { todos: [{ status: 'pending' }, { status: 'pending' }] }, true)).toBe('idea')
  expect(cueOf('TodoWrite', { todos: [{ status: 'completed' }, { status: 'pending' }] }, true)).toBeUndefined()
  expect(cueOf('Read', { file_path: 'a.ts' }, true)).toBeUndefined()
})

test('a moment during work keeps Clawd where it stood', () => {
  // Dancing across the band, then a moment at tick 30: it stops right there
  const walking = view(30, 0, true, 120).x
  expect(walking).toBeGreaterThan(0)
  for (const since of [0, 5, 10]) {
    expect(view(30 + since, 0, true, 120, undefined, { mood: 'love', since }).x).toBe(walking)
  }
  // Idle, it stays put
  expect(view(30, 0, false, 120, undefined, { mood: 'cool', since: 6 }).x).toBe(0)
})

test('magic: a wand lifted, a flick, and sparks that drift away', () => {
  const at = (since: number) => view(10 + since, 0, true, 80, undefined, { mood: 'magic', since })
  const texts = (since: number) => at(since).marks.map(m => m.text)
  // The arm lifts a little with the wand up, then its tip glints
  expect(at(0).frame[0]!.slice(0, 8)).toBe('.OLOOROv')
  // Two cells up from the hand, the top one its white tip
  expect(texts(0)).toEqual(['▎', '▎'])
  expect(at(0).marks.map(m => m.fg)).toContain('#FFFFFF')
  expect(texts(2)).toContain('*')
  // The flick: the wand level, eyes squeezed, sparks off its tip
  expect(at(4).frame[0]).toContain('>')
  expect(texts(4)).toEqual(expect.arrayContaining(['▂▂', '▂']))
  const sparkX = (since: number) => Math.min(...at(since).marks.filter(m => !m.text.startsWith('▂')).map(m => m.x))
  expect(sparkX(13)).toBeGreaterThan(sparkX(4))
  // The line clears the wand and the sparks
  expect(at(8).frame[0]!.length).toBeGreaterThan(16)
})

test('reading: a book held low at its side and its eyes on it', () => {
  const at = (readingFor: number) => view(40 + readingFor, 0, true, 80, undefined, undefined, readingFor)
  expect(at(0).line).toBe('leyendo…')
  // Its eyes on the book, which it holds in front of its arm and body
  expect(at(0).frame[0]).toBe('.OROORO.')
  expect(at(0).frame[1]).toBe('^OOOOO52')
  expect(at(0).frame[2]).toBe('.aa..b33')
  expect(at(14).frame[1]).toBe('^OOOOO62')
  // Only while working; a moment wins over reading
  expect(view(40, 0, false, 80, undefined, undefined, 0).line).not.toBe('leyendo…')
  expect(view(40, 0, true, 80, undefined, { mood: 'cool', since: 6 }, 0).line).toBe('todo en verde')
  // It stops where it stood when it started reading
  expect(at(5).x).toBe(view(40, 0, true, 80).x)
})
