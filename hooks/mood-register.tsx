// Choosing Clawd's moods: the `/clawd-mood` command over the plugin's own
// `userConfig` fields. The engine hands their values to `register` and reloads
// the plugin when one changes, so a choice written here is read back as
// options on the next load, not kept in this module.

import type { EngineInterface, PluginOptions, Register } from 'claude-code'

const COMMAND = 'clawd-mood'

// A slot of moods the person chooses among: its userConfig field, its name in
// the command, and its values with how each is shown and typed
type Slot = {
  field: string
  name: string
  values: readonly { id: string; label: string; aliases?: readonly string[] }[]
}

const SLOTS: readonly Slot[] = [
  {
    field: 'breakMood',
    name: 'break',
    values: [
      { id: 'rotar', label: 'rotar' },
      { id: 'azar', label: 'azar' },
      { id: 'cigarro', label: 'cigarro' },
      { id: 'cafe', label: 'café', aliases: ['café'] },
    ],
  },
]

const configKey = (slot: Slot) => `clawd-buddy.${slot.field}`
const labelOf = (slot: Slot, id: string) => slot.values.find(v => v.id === id)?.label ?? id
const choices = (slot: Slot) => slot.values.map(v => v.label).join(', ')

function current(options: PluginOptions, slot: Slot): string {
  const value = options[slot.field]
  return typeof value === 'string' ? value : slot.values[0]!.id
}

export function describe(options: PluginOptions): string {
  const lines = SLOTS.map(slot => `${slot.name}: ${labelOf(slot, current(options, slot))} (${choices(slot)})`)
  return [...lines, `Cambia uno con /${COMMAND} <espacio> <variante>.`].join('\n')
}

export async function registerMoodCommand($: EngineInterface) {
  await $.command.register({
    name: COMMAND,
    description: 'Elige qué moods usa Clawd en cada momento',
    argumentHint: '[espacio variante]',
    immediate: true,
  })
}

export const registerMoods: Register = (on, options) => {
  on('command.run', { command: COMMAND }, async ($, e) => {
    const [name, value, ...rest] = e.args.trim().split(/\s+/).filter(Boolean)
    if (name === undefined) return { text: describe(options) }

    const slot = SLOTS.find(s => s.name === name)
    if (!slot) return { text: `No hay un espacio "${name}". Espacios: ${SLOTS.map(s => s.name).join(', ')}.` }
    if (value === undefined || rest.length > 0) {
      return { text: `Uso: /${COMMAND} ${slot.name} <variante>. Variantes: ${choices(slot)}.` }
    }
    const typed = value.toLowerCase()
    const chosen = slot.values.find(v => v.id === typed || v.aliases?.includes(typed))
    if (!chosen) return { text: `"${value}" no es una variante de ${slot.name}. Variantes: ${choices(slot)}.` }

    const result = await $.config.set({ key: configKey(slot), value: chosen.id })
    if (result.deny !== undefined) return { text: `No se pudo guardar ${slot.name}: ${result.deny}` }
    return { text: `${slot.name}: ${chosen.label}. Clawd se recarga para usarlo.` }
  }).catch(($, e, next) => {
    const err: unknown = next.error
    const reason = typeof err === 'object' && err !== null && 'message' in err ? String(err.message) : String(err)
    return { text: `/${COMMAND} falló: ${reason}` }
  })
}
