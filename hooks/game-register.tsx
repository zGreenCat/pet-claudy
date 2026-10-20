import { atom, read, update } from 'claude-code'
import type { EngineInterface, PromptSubmitInput, Register, TurnCompleteInput } from 'claude-code'

import type { ClaudeState } from '../types'
import { MIN_W } from './game'

const PANE = 'clawd-play'
const COMMAND = 'clawd-play'
// Rows asked of the pane when it sits inline above the prompt
const INLINE_ROWS = 16
// The cap on an inline board, whatever room the layout spares
const MAX_INLINE_ROWS = 18

const claude = atom({ plugin: 'clawd-buddy', key: 'claude' } as const, 'idle' as ClaudeState)

// The pieces below ride on hooks the mascot's module already has: one module
// cannot register the same event twice

export async function registerGameCommand($: EngineInterface) {
  await $.command.register({
    name: COMMAND,
    description: 'Juega Clawd Invaders en un panel mientras Claude trabaja',
  })
}

// A slash command is no turn for Claude: only a prompt starts the work
export async function trackPrompt($: EngineInterface, e: PromptSubmitInput) {
  if (!e.text.startsWith('/')) await update($, claude, () => 'working')
}

export async function trackTurn($: EngineInterface, e: TurnCompleteInput) {
  if (e.agentId === undefined) await update($, claude, () => (e.reason === 'answer' ? 'done' : 'idle'))
}

export const registerGame: Register = on => {
  on('command.run', { command: COMMAND }, async ($, e) => {
    const columns = Math.max(MIN_W + 2, Math.round(e.presentation.columns / 3))
    const opened = await $.ui.open({ id: PANE, title: 'Clawd Invaders', focus: true, rows: INLINE_ROWS, columns })
    return opened.isPlaced ? {} : { text: `Clawd Invaders no cabe aquí: ${opened.reason}` }
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Client } = $.ui.resolve(e)
    const state = await read($, claude)
    const height =
      e.props.placement === 'inline' ? Math.min(e.props.scroll.bodyRows, MAX_INLINE_ROWS) : e.props.scroll.bodyRows

    return (
      <Client
        key="game"
        module="./game-client.tsx"
        props={{ isFocused: e.props.isFocused, claude: state }}
        width="100%"
        height={height}
      />
    )
  })
}
