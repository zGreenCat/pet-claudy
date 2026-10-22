// Clawd Invaders' surface module: it keeps the games, the key and pointer
// listeners and the one clock of the instance, and draws the board. Without
// the keyboard the pane plays a demo on autopilot, so it shows what it is;
// with it, the player's game runs.
//
// Two things hand the game the keyboard: the pane's own focus (ctrl+x tab, or
// the open asking for it) and a click on the game, which gives this Client the
// keys while the pane's isFocused stays false. No event says when a click's
// focus ends (Escape returns it unseen), so a game that hears no key for a
// while pauses itself, and playing again is explicit.

import type { ClientSurface } from 'claude-code'

import type { ClaudeState } from '../types'
import { LIVES, autopilot, fits, move, newGame, resize, step } from './game'
import type { Game } from './game'
import { FLAME, ORANGE, frame, overlay, paint, runs } from './game-sprites'
import type { Line, Run } from './game-sprites'

export const STEP_MS = 90
// Cells a key press moves the ship
const KEY_STEP = 2
// Rows the HUD, the board's two borders and the status line take
const FRAME_ROWS = 4
// The board stays this small at most, centered in a bigger pane, so the
// sprites keep their proportions
const MAX_W = 44
const MAX_H = 20
// Ticks the demo shows its lost game before it plays another
const DEMO_RESTART_TICKS = 20
// Ticks of play without a key before the game takes the keyboard for gone
export const IDLE_PAUSE_TICKS = Math.round(12_000 / STEP_MS)
const HEART = '#E5484D'

export type Props = { isFocused: boolean; claude: ClaudeState }

export type Local = {
  props: Props
  // The player's game, from the first time the pane has the keyboard
  play?: Game
  demo?: Game
  demoOverFor: number
  isPaused: boolean
  // The board size the games were last laid out for
  size: { w: number; h: number }
  // True from a click on the game or a key it heard, until it hears none for
  // IDLE_PAUSE_TICKS
  hasKeys: boolean
  idleTicks: number
}

const CLAUDE_LINE: Record<ClaudeState, string> = {
  idle: 'Claude: en espera',
  working: 'Claude: trabajando…',
  done: 'Claude: terminó',
}

const seed = () => Math.floor(Math.random() * 4294967296)

const hasKeyboard = (s: Local) => s.props.isFocused || s.hasKeys

// The demo plays whenever the game has no keyboard and no game of the
// player's is waiting on it
const isDemo = (s: Local) => !hasKeyboard(s) && s.play?.status !== 'playing'

const shouldRun = (s: Local) => {
  if (!fits(s.size.w, s.size.h)) return false
  if (isDemo(s)) return s.demo !== undefined
  return hasKeyboard(s) && !s.isPaused && s.play?.status === 'playing'
}

export function advance(s: Local) {
  if (isDemo(s) && s.demo) {
    if (s.demo.status === 'over') {
      s.demoOverFor += 1
      if (s.demoOverFor >= DEMO_RESTART_TICKS) {
        s.demo = newGame(s.size.w, s.size.h, seed())
        s.demoOverFor = 0
      }
    } else {
      s.demo = step(move(s.demo, autopilot(s.demo)))
    }
  } else if (s.play) {
    s.play = step(s.play)
    s.idleTicks += 1
    if (s.idleTicks >= IDLE_PAUSE_TICKS) {
      s.hasKeys = false
      s.isPaused = true
    }
  }
}

// What to say over the player's board, if anything
function message(s: Local, g: Game): Line[] {
  if (g.status === 'over') {
    return [
      { text: g.cause === 'invaded' ? '¡Los bugs llegaron!' : '¡Sin vidas!', fg: HEART, bold: true },
      { text: `Puntos: ${g.score}` },
      { text: hasKeyboard(s) ? 'Enter: otra vez' : 'Clic para jugar otra' },
    ]
  }
  if (!hasKeyboard(s)) return [{ text: 'Pausa', bold: true }, { text: 'Clic para seguir' }]
  if (s.isPaused && g.t === 0) {
    return [
      { text: 'CLAWD INVADERS', fg: ORANGE, bold: true },
      { text: 'Enter: jugar' },
      { text: '←/→ o a/d: mover · dispara sola' },
    ]
  }
  if (s.isPaused) return [{ text: 'Pausa', bold: true }, { text: 'Enter: seguir · p: pausa' }]
  if (g.celebrate > 0) return [{ text: `¡Oleada ${g.wave - 1} limpia!`, fg: FLAME, bold: true }]
  return []
}

export default function GameClient(props: Props, surface: ClientSurface<Local>) {
  const { Box, Text } = surface.elements
  const first = surface.state === undefined
  const s: Local =
    surface.state ?? { props, demoOverFor: 0, isPaused: true, size: { w: 0, h: 0 }, hasKeys: false, idleTicks: 0 }
  s.props = props
  if (!hasKeyboard(s)) {
    s.isPaused = true
    if (s.play?.status === 'over') s.play = undefined
  }

  // Not w and h: the JSX factory is h
  const width = Math.min(MAX_W, surface.columns - 2)
  const height = Math.min(MAX_H, surface.rows - FRAME_ROWS)
  if (width > 0 && height > 0 && (width !== s.size.w || height !== s.size.h)) {
    s.size = { w: width, h: height }
    if (fits(width, height)) {
      if (s.play) s.play = resize(s.play, width, height)
      s.demo = s.demo ? resize(s.demo, width, height) : newGame(width, height, seed())
    }
    s.isPaused = true
  }
  const ensurePlay = () => {
    if (s.play || !fits(s.size.w, s.size.h)) return
    s.play = newGame(s.size.w, s.size.h, seed())
    s.isPaused = true
  }
  if (hasKeyboard(s)) ensurePlay()

  if (first) {
    surface.setState(s)
    const redraw = () => surface.setState(s)

    // One clock for the instance, started once as the engine asks; a paused
    // game's tick does nothing and draws nothing
    surface.every(STEP_MS, () => {
      if (!shouldRun(s)) return
      advance(s)
      redraw()
    })

    surface.onPointer(({ type }) => {
      if (type !== 'down' || s.hasKeys) return
      s.hasKeys = true
      s.idleTicks = 0
      ensurePlay()
      redraw()
    })

    surface.onKey(({ key, ctrl, meta }) => {
      if (ctrl || meta) return
      s.hasKeys = true
      s.idleTicks = 0
      ensurePlay()
      const g = s.play
      if (!g || !fits(s.size.w, s.size.h)) return redraw()
      if (g.status === 'over') {
        if (key !== 'return' && key !== ' ' && key !== 'r') return redraw()
        s.play = newGame(s.size.w, s.size.h, seed())
        s.isPaused = false
      } else if (key === 'p') {
        s.isPaused = !s.isPaused
      } else if (key === 'left' || key === 'a') {
        s.play = move(g, -KEY_STEP)
        s.isPaused = false
      } else if (key === 'right' || key === 'd') {
        s.play = move(g, KEY_STEP)
        s.isPaused = false
      } else if (key === 'return' || key === ' ') {
        s.isPaused = false
      }
      redraw()
    })
  }

  if (s.size.w <= 0 || s.size.h <= 0) return <Text dimColor>Clawd Invaders…</Text>

  if (!fits(s.size.w, s.size.h) || !s.demo) {
    return (
      <Box flexDirection="column">
        <Text>Panel muy pequeño para Clawd Invaders.</Text>
        <Text dimColor>Ensánchalo o usa un terminal más grande.</Text>
      </Box>
    )
  }

  const demo = isDemo(s)
  const g = demo ? s.demo : s.play!
  const lines = demo ? [] : message(s, g)
  const board = frame(lines.length > 0 ? overlay(paint(g), lines) : paint(g)).map(runs)

  const margin = ' '.repeat(Math.max(0, Math.floor((surface.columns - (s.size.w + 2)) / 2)))
  const above = Math.max(0, Math.floor((surface.rows - (s.size.h + FRAME_ROWS)) / 2))
  const hint = hasKeyboard(s) ? 'Esc: prompt · p: pausa' : 'clic: jugar'
  const styled = (run: Run, key: string) => (
    <Text
      key={key}
      {...(run.fg ? { color: run.fg } : {})}
      {...(run.bg ? { backgroundColor: run.bg } : {})}
      {...(run.bold ? { bold: true } : {})}
    >
      {run.text}
    </Text>
  )

  return (
    <Box flexDirection="column">
      {Array.from({ length: above }, (_, i) => (
        <Text key={`a${i}`}> </Text>
      ))}
      {demo ? (
        <Text wrap="truncate">
          {margin}
          <Text color={ORANGE} bold>
            DEMO
          </Text>
          <Text dimColor>{'  haz clic para jugar'}</Text>
        </Text>
      ) : (
        <Text wrap="truncate">
          {margin}
          <Text color={HEART}>{'♥'.repeat(g.lives) + '♡'.repeat(Math.max(0, LIVES - g.lives))}</Text>
          <Text bold>{`  PUNTOS ${g.score}`}</Text>
          <Text dimColor>{`  OLEADA ${g.wave}`}</Text>
        </Text>
      )}
      {board.map((row, i) => (
        <Text key={`r${i}`} wrap="truncate">
          {margin}
          {row.map((run, j) => styled(run, `s${j}`))}
        </Text>
      ))}
      <Text dimColor wrap="truncate">
        {`${margin}${CLAUDE_LINE[props.claude]} · ${hint}`}
      </Text>
    </Box>
  )
}
