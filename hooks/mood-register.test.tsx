import { test, expect } from 'claude-code/testing'
import type { ConfigSetInput } from 'claude-code'

import { describe } from './mood-register'

const run = (args: string) => ({
  command: 'clawd-mood',
  args,
  origin: { kind: 'composer' as const },
  presentation: { isFullscreen: true, columns: 120 },
})

test('/clawd-mood alone shows each slot, its choice and its variants', async $ => {
  const result = await $.command.run(run(''))
  expect(result.text).toMatch(/break: rotar \(rotar, azar, cigarro, café\)/)
})

test('the listing reads the choice from the options the plugin loaded with', () => {
  expect(describe({ breakMood: 'cafe' })).toMatch(/break: café/)
  expect(describe({})).toMatch(/break: rotar/)
})

test('choosing a variant writes its userConfig field', async ($, on) => {
  const writes: ConfigSetInput[] = []
  on('config.set', (_$, e) => {
    writes.push(e)
    return { value: e.value }
  })
  const result = await $.command.run(run('break Café'))
  expect(writes.map(w => [w.key, w.value])).toEqual([['clawd-buddy.breakMood', 'cafe']])
  expect(result.text).toMatch(/break: café/)
})

test('a refused write says why', async ($, on) => {
  on('config.set', () => ({ deny: 'managed by policy' }))
  const result = await $.command.run(run('break cigarro'))
  expect(result.text).toMatch(/No se pudo guardar break: managed by policy/)
})

test('an unknown slot or variant is an error naming the valid ones, and nothing is written', async ($, on) => {
  const writes: ConfigSetInput[] = []
  on('config.set', (_$, e) => {
    writes.push(e)
    return { value: e.value }
  })
  expect((await $.command.run(run('baile cafe'))).text).toMatch(/No hay un espacio "baile". Espacios: break/)
  expect((await $.command.run(run('break mate'))).text).toMatch(/"mate" no es una variante de break. Variantes: rotar, azar, cigarro, café/)
  expect((await $.command.run(run('break'))).text).toMatch(/Uso: \/clawd-mood break <variante>/)
  expect(writes).toHaveLength(0)
})
