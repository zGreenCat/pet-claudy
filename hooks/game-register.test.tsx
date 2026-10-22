import { test, expect } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On, PaneOpenArgs } from 'claude-code'

import { IDLE_PAUSE_TICKS, STEP_MS, advance } from './game-client'
import type { Local } from './game-client'
import { newGame } from './game'

const pane = (isFocused: boolean) => ({
  component: 'Pane' as const,
  requestId: 'clawd-play',
  props: {
    title: 'Clawd Invaders',
    isFocused,
    bodyColumns: 30,
    placement: 'dock' as const,
    scroll: { offset: 0, bodyRows: 16 },
    view: {},
  },
})

const shown = async (ui: { findAll: (q: { type: string; in: string }) => Promise<{ text?: string }[]> }) =>
  (await ui.findAll({ type: 'Text', in: 'game' })).map(t => t.text ?? '').join('\n')

const run = {
  command: 'clawd-play',
  args: '',
  origin: { kind: 'composer' as const },
  presentation: { isFullscreen: true, columns: 120 },
}

function engine(on: On) {
  const opened: PaneOpenArgs[] = []
  on('ui.open', (_$, e) => {
    opened.push(e)
    return { value: { isPlaced: true } }
  })
  return opened
}

async function mount($: Engine, isFocused: boolean, size = { columns: 30, rows: 16 }) {
  const ui = await $.ui.mount({ plugin: 'clawd-buddy', surface: 'terminal', ...pane(isFocused) })
  await ui.resize({ ...size, in: 'game' })
  return ui
}

test('/clawd-play opens the pane asking for the keyboard and about a third of the width', async ($, on) => {
  const opened = engine(on)
  const result = await $.command.run(run)
  expect(result.text).toBeUndefined()
  expect(opened).toHaveLength(1)
  expect(opened[0]).toMatchObject({ id: 'clawd-play', focus: true })
  expect(opened[0]!.columns).toBeGreaterThanOrEqual(22)
})

test('a pane that cannot be placed says why', async ($, on) => {
  on('ui.open', () => ({ value: { isPlaced: false, reason: 'terminal too narrow' } }))
  const result = await $.command.run(run)
  expect(result.text).toMatch(/terminal too narrow/)
})

test('a pane that fails to open says so', async ($, on) => {
  on('ui.open', () => ({ deny: 'no pane today' }))
  const result = await $.command.run(run)
  expect(result.text).toMatch(/no pudo abrirse: .*no pane today/)
})

test('the game waits for a key, then plays', async ($, on) => {
  engine(on)
  const ui = await mount($, true)
  expect(await shown(ui)).toMatch(/Enter: jugar/)
  const before = await shown(ui)
  await ui.advance(STEP_MS * 20)
  expect(await shown(ui)).toBe(before)

  await ui.key({ key: 'return', in: 'game' })
  expect(await shown(ui)).not.toMatch(/Pausa/)
  await ui.advance(STEP_MS * 40)
  expect(await shown(ui)).not.toBe(before)
  await ui.unmount()
})

test('without the keyboard the pane plays a demo on its own', async ($, on) => {
  engine(on)
  const ui = await mount($, false)
  expect(await shown(ui)).toMatch(/DEMO/)
  const before = await shown(ui)
  await ui.advance(STEP_MS * 20)
  expect(await shown(ui)).not.toBe(before)

  await ui.redraw(pane(true).props)
  expect(await shown(ui)).toMatch(/Enter: jugar/)
  expect(await shown(ui)).not.toMatch(/DEMO/)
  await ui.unmount()
})

test('a click on the game hands it the keys, though the pane is not focused', async ($, on) => {
  engine(on)
  const ui = await mount($, false)
  expect(await shown(ui)).toMatch(/DEMO/)

  await ui.pointer({ type: 'down', x: 5, y: 5, button: 'left', in: 'game' })
  expect(await shown(ui)).toMatch(/Enter: jugar/)
  await ui.key({ key: 'return', in: 'game' })
  const started = await shown(ui)
  await ui.advance(STEP_MS * 20)
  expect(await shown(ui)).not.toMatch(/Pausa|DEMO/)
  expect(await shown(ui)).not.toBe(started)
  await ui.unmount()
})

test('a key reaching the game is the keyboard too, with no click or pane focus', async ($, on) => {
  engine(on)
  const ui = await mount($, false)
  await ui.key({ key: 'return', in: 'game' })
  await ui.key({ key: 'return', in: 'game' })
  await ui.advance(STEP_MS * 10)
  expect(await shown(ui)).not.toMatch(/Pausa|DEMO/)
  await ui.unmount()
})

test('a game that hears no key for a while pauses until a key', () => {
  const s: Local = {
    props: { isFocused: false, claude: 'idle' },
    play: newGame(30, 14, 1),
    demoOverFor: 0,
    isPaused: false,
    size: { w: 30, h: 14 },
    hasKeys: true,
    idleTicks: 0,
  }
  for (let i = 0; i < IDLE_PAUSE_TICKS - 1; i++) advance(s)
  expect([s.hasKeys, s.isPaused]).toEqual([true, false])
  advance(s)
  expect([s.hasKeys, s.isPaused]).toEqual([false, true])
})

test('a resize pauses the game until a key', async ($, on) => {
  engine(on)
  const ui = await mount($, true)
  await ui.key({ key: 'return', in: 'game' })
  await ui.advance(STEP_MS * 5)

  await ui.resize({ columns: 34, rows: 18, in: 'game' })
  expect(await shown(ui)).toMatch(/Pausa/)
  const frozen = await shown(ui)
  await ui.advance(STEP_MS * 30)
  expect(await shown(ui)).toBe(frozen)

  await ui.key({ key: 'return', in: 'game' })
  await ui.advance(STEP_MS * 30)
  expect(await shown(ui)).not.toMatch(/Pausa/)
  await ui.unmount()
})

test('p pauses the game and p again resumes it', async ($, on) => {
  engine(on)
  const ui = await mount($, true)
  await ui.key({ key: 'return', in: 'game' })
  await ui.advance(STEP_MS * 5)

  await ui.key({ key: 'p', in: 'game' })
  expect(await shown(ui)).toMatch(/Pausa/)
  const frozen = await shown(ui)
  await ui.advance(STEP_MS * 30)
  expect(await shown(ui)).toBe(frozen)

  await ui.key({ key: 'p', in: 'game' })
  await ui.advance(STEP_MS * 30)
  expect(await shown(ui)).not.toMatch(/Pausa/)
  await ui.unmount()
})

test('a panel under the minimum shows a short message and plays nothing', async ($, on) => {
  engine(on)
  const ui = await mount($, true, { columns: 10, rows: 6 })
  expect(await shown(ui)).toMatch(/muy pequeño/)
  await ui.key({ key: 'return', in: 'game' })
  await ui.advance(STEP_MS * 10)
  expect(await shown(ui)).toMatch(/muy pequeño/)
  await ui.unmount()
})

test('the status line follows Claude, and a slash command does not start it', async ($, on) => {
  engine(on)
  on('prompt.submit', (_$, e) => ({ text: e.text }))
  const ui = await mount($, true)
  expect(await shown(ui)).toMatch(/en espera/)

  await $.prompt.submit({ text: '/help' })
  await ui.advance(STEP_MS)
  expect(await shown(ui)).toMatch(/en espera/)

  await $.prompt.submit({ text: '/home/x/foo.ts revisa esto' })
  await ui.advance(STEP_MS)
  expect(await shown(ui)).toMatch(/trabajando/)
  await ui.unmount()
})
