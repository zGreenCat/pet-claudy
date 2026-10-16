import { test, expect, mock } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { AgentInfo, AgentSpawnInput, AgentStatus, On } from 'claude-code'

import { TICK_MS } from './clawd'

const band = {
  component: 'AbovePrompt' as const,
  props: {
    hasSurvey: false,
    isWorking: true,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
}

const info = (id: string, status: AgentStatus): AgentInfo => ({ id, description: '', type: 'Explore', status })

// The Agent tool's call as the engine raises it, with the task's description
const spawnOf = (description: string): AgentSpawnInput => ({
  tool_use_id: 'toolu_1',
  prompt: description,
  description,
  subagentType: 'Explore',
  provider: { plugin: 'engine', tier: 'core' },
  parentModel: 'opus',
  background: false,
  fork: false,
})

// The engine beneath the plugin: a clock the test moves, a spawn that starts
// agent `a1`, and an agent list the test sets
function engine(on: On) {
  const clock = mock.clock(on)
  let list: AgentInfo[] | Error = [info('a1', 'running')]
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'a1' }))
  on('agent.list', () => {
    return list instanceof Error ? { deny: list.message } : { value: list }
  })
  on('classic.SubagentStart', () => ({}))
  on('classic.SubagentStop', () => ({}))
  return {
    clock,
    setList: (next: AgentInfo[] | Error) => {
      list = next
    },
    ticks: (n: number) => clock.advance(n * TICK_MS),
  }
}

async function start($: Engine) {
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
}

async function shows($: Engine, text: RegExp): Promise<boolean> {
  const ui = await $.ui.mount({ plugin: 'clawd-buddy', surface: 'terminal', ...band })
  const found = (await ui.find({ type: 'Text', text })) !== undefined
  await ui.unmount()
  return found
}

test('a spawned subagent walks to its desk and shows its task', async ($, on) => {
  const e = engine(on)
  await start($)
  await $.agent.spawn(spawnOf('buscar  el\nflujo'))
  await e.ticks(7)
  expect(await shows($, /buscar el flujo/)).toBe(true)
})

test('SubagentStart alone seats nobody', async ($, on) => {
  engine(on)
  await start($)
  await $.classic.SubagentStart({ agent_id: 'w1', agent_type: 'general-purpose' })
  expect(await shows($, /dirigiendo/)).toBe(false)
})

test('SubagentStop brings the result to the buddy', async ($, on) => {
  const e = engine(on)
  await start($)
  await $.agent.spawn(spawnOf('buscar'))
  await e.ticks(7)
  await $.classic.SubagentStop({
    agent_id: 'a1',
    agent_type: 'Explore',
    agent_transcript_path: '',
    stop_hook_active: false,
    last_assistant_message: '## **Encontré 3**\n- a',
  })
  await e.ticks(1)
  expect(await shows($, /✓ Encontré 3/)).toBe(true)
})

for (const [status, said] of [
  ['failed', /✗ falló/],
  ['killed', /✗ detenido/],
  [undefined, /✓ listo/],
] as const) {
  test(`an agent ${status ?? 'gone from the list'} leaves its desk`, async ($, on) => {
    const e = engine(on)
    await start($)
    await $.agent.spawn(spawnOf('buscar'))
    await e.ticks(7)
    expect(await shows($, /✓|✗/)).toBe(false)

    e.setList(status ? [info('a1', status)] : [])
    await e.ticks(8)
    expect(await shows($, said)).toBe(true)
  })
}

test('a run of failed ticks is said once, and the clock keeps going', async ($, on) => {
  const e = engine(on)
  const toasts: string[] = []
  on('ui.toast', ($, t) => {
    toasts.push(t.text)
    return { value: undefined }
  })
  await start($)
  await $.agent.spawn(spawnOf('buscar'))
  e.setList(new Error('sin lista'))
  await e.ticks(8 * 8)
  expect(toasts).toHaveLength(1)
  expect(toasts[0]).toContain('sin lista')

  e.setList([])
  await e.ticks(8)
  expect(await shows($, /✓ listo/)).toBe(true)
})

test('a thank-you in the prompt raises a heart', async ($, on) => {
  const e = engine(on)
  on('prompt.submit', ($, e) => ({ text: e.text }))
  await start($)
  await $.prompt.submit({ text: 'gracias!', wait: false, origin: { kind: 'composer' } })
  // Clawd raises its arm first; the heart follows
  expect(await shows($, /♥/)).toBe(false)
  await e.ticks(6)
  expect(await shows($, /♥/)).toBe(true)
})

test('tests that pass put on the sunglasses; tests that fail do not', async ($, on) => {
  const e = engine(on)
  let isError = false
  on('classic.PreToolUse', () => ({}))
  on('tool.call', () => (isError ? { isError: true, result: 'falló', text: 'falló' } : { result: { stdout: 'ok', stderr: '', interrupted: false }, text: 'ok' }))
  await start($)

  isError = true
  await $.tool.call({ tool: 'Bash', command: 'npm test', description: 'Run tests' })
  expect(await shows($, /todo en verde/)).toBe(false)

  isError = false
  await $.tool.call({ tool: 'Bash', command: 'npm test', description: 'Run tests' })
  // The glasses go on first
  await e.ticks(5)
  expect(await shows($, /todo en verde/)).toBe(true)
  await e.ticks(30)
  expect(await shows($, /todo en verde/)).toBe(false)
})

test('reads one after another sit Clawd down to read, until they stop', async ($, on) => {
  const e = engine(on)
  on('classic.PreToolUse', () => ({}))
  on('tool.call', () => ({ result: { type: 'text', file: { filePath: 'a.ts', content: '', numLines: 0, startLine: 1, totalLines: 0 } }, text: '' }))
  await start($)

  await $.tool.call({ tool: 'Read', file_path: '/a.ts' })
  await $.tool.call({ tool: 'Read', file_path: '/b.ts' })
  expect(await shows($, /leyendo/)).toBe(false)
  await $.tool.call({ tool: 'Read', file_path: '/c.ts' })
  expect(await shows($, /leyendo/)).toBe(true)

  // A while with nothing read and it gets up
  await e.ticks(14)
  expect(await shows($, /leyendo/)).toBe(false)
})
