import { test, expect } from 'claude-code/testing'

import { CELEBRATE_TICKS, isSmoking, view, viewKey } from './clawd'

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
