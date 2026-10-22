// Clawd Invaders' surface module: it keeps the game, the key listener and the
// one clock of the instance, and draws the board. It plays only while the pane
// holds the keyboard; anything else pauses it, and playing again is explicit.

import type { ClientSurface } from 'claude-code'

import type { ClaudeState } from '../types'
import { LIVES, fits, move, newGame, resize, step } from './game'
import type { Game } from './game'
import { overlay, paint, runs } from './game-sprites'

export const STEP_MS = 90
// Cells a key press moves the ship
const KEY_STEP = 2
// Rows the HUD and the status line take around the board
const FRAME_ROWS = 2

export type Props = { isFocused: boolean; claude: ClaudeState }

type Local = {
  props: Props
  game?: Game
  isPaused: boolean
  // The size the game was last laid out for
  size: { w: number; h: number }
  stopClock?: () => void
}

const CLAUDE_LINE: Record<ClaudeState, string> = {
  idle: 'Claude: en espera',
  working: 'Claude: trabajando…',
  done: 'Claude: terminó',
}

const isDrawable = (s: Local) => s.size.w > 0 && s.size.h > 0
const isPlaying = (s: Local) =>
  s.props.isFocused && !s.isPaused && s.game?.status === 'playing' && fits(s.size.w, s.size.h)

const seed = () => Math.floor(Math.random() * 4294967296)

export default function GameClient(props: Props, surface: ClientSurface<Local>) {
  const { Box, Text } = surface.elements
  const first = surface.state === undefined
  const s: Local = surface.state ?? { props, isPaused: true, size: { w: 0, h: 0 } }
  s.props = props
  if (!props.isFocused) s.isPaused = true

  const width = surface.columns
  const height = surface.rows - FRAME_ROWS
  if (width > 0 && height > 0 && (width !== s.size.w || height !== s.size.h)) {
    s.size = { w: width, h: height }
    if (fits(width, height)) {
      s.game = s.game ? resize(s.game, width, height) : newGame(width, height, seed())
    }
    if (s.game) s.isPaused = true
  }

  if (first) {
    surface.setState(s)
    const redraw = () => surface.setState(s)

    // The clock runs only while the game plays: it stops itself on the first
    // tick that finds it paused, over or out of room, and a key starts it again
    const tick = () => {
      if (!isPlaying(s) || !s.game) {
        s.stopClock?.()
        s.stopClock = undefined
        return
      }
      s.game = step(s.game)
      redraw()
    }
    const startClock = () => {
      if (s.stopClock === undefined && isPlaying(s)) s.stopClock = surface.every(STEP_MS, tick)
    }

    surface.onKey(({ key, ctrl, meta }) => {
      if (ctrl || meta || !s.game || !fits(s.size.w, s.size.h)) return
      if (key === 'p' && s.game.status === 'playing') {
        s.isPaused = !s.isPaused
      } else if (s.game.status === 'over') {
        if (key === 'return' || key === ' ' || key === 'r') {
          s.game = newGame(s.size.w, s.size.h, seed())
          s.isPaused = false
        }
      } else if (key === 'left' || key === 'a') {
        s.game = move(s.game, -KEY_STEP)
        s.isPaused = false
      } else if (key === 'right' || key === 'd') {
        s.game = move(s.game, KEY_STEP)
        s.isPaused = false
      } else if (key === 'return' || key === ' ') {
        s.isPaused = false
      } else {
        return
      }
      startClock()
      redraw()
    })
  }

  if (!isDrawable(s)) return <Text dimColor>Clawd Invaders…</Text>

  if (!s.game) {
    return (
      <Box flexDirection="column">
        <Text>Panel muy pequeño para Clawd Invaders.</Text>
        <Text dimColor>Ensánchalo o usa un terminal más grande.</Text>
      </Box>
    )
  }

  const g = s.game
  let lines: string[] = []
  if (!fits(s.size.w, s.size.h)) lines = ['Panel muy pequeño', 'Ensánchalo para seguir']
  else if (g.status === 'over') {
    lines = [
      g.cause === 'invaded' ? '¡Los bugs llegaron!' : '¡Sin vidas!',
      `Puntos: ${g.score}`,
      props.isFocused ? 'Enter: reiniciar' : 'Haz clic para volver',
    ]
  } else if (g.celebrate > 0) lines = [`¡Oleada ${g.wave - 1} limpia!`]
  else if (!props.isFocused) lines = ['Pausa', 'Clic o ctrl+x tab para jugar']
  else if (s.isPaused) lines = ['Pausa', 'Enter: seguir · ←/→ o a/d: mover']

  const rows = (lines.length > 0 ? overlay(paint(g), lines) : paint(g)).map(runs)
  const hearts = '♥'.repeat(g.lives) + '♡'.repeat(Math.max(0, LIVES - g.lives))

  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        <Text color="#E5484D">{hearts}</Text>
        {`  Puntos ${g.score}  Oleada ${g.wave}`}
      </Text>
      {rows.map((row, i) => (
        <Text key={`r${i}`} wrap="truncate">
          {row.map((run, j) => (
            <Text
              key={`s${j}`}
              {...(run.fg ? { color: run.fg } : {})}
              {...(run.bg ? { backgroundColor: run.bg } : {})}
            >
              {run.text}
            </Text>
          ))}
        </Text>
      ))}
      <Text dimColor wrap="truncate">
        {`${CLAUDE_LINE[props.claude]} · Esc: prompt · p: pausa`}
      </Text>
    </Box>
  )
}
