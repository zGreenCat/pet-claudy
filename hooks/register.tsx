import { atom, read, update } from 'claude-code'
import type { AgentStatus, Register } from 'claude-code'

import type { Tick } from '../types'
import { HAT, dress, wearsHat } from './accessories'
import {
  ERRORS_TO_DIZZY,
  READING_LINGER_TICKS,
  READS_TO_START,
  READS_WINDOW_TICKS,
  SUPER_WINDOW_TICKS,
  TICK_MS,
  WIDTH,
  cueOf,
  isRead,
  isThanks,
  viewKey,
} from './clawd'
import type { Context, Frame } from './clawd'
import { START_X, describe, oneLine, scene, solo, summary, usableColumns, walk } from './desks'
import { cue, pose, reset, start, step } from './director'
import type { Agent, Decor, Segment } from './desks'
import { registerGame, registerGameCommand, trackPrompt, trackTurn } from './game-register'
import { registerMoodCommand, registerMoods } from './mood-register'
import { TREE_MIN_COLUMNS, treeCells, treeDay } from './tree'

// The view key last drawn. The timer only writes it when what Clawd shows
// changes, so a still Clawd costs no redraws.
const tick = atom({ plugin: 'clawd-buddy', key: 'tick' } as const, 0 as Tick)

// What a finished agent's buddy says when its loop ended without a SubagentStop
const ENDED: Partial<Record<AgentStatus, string>> = { completed: 'listo', failed: '✗ falló', killed: '✗ detenido' }
// Ticks between checks of the agent list, and how old an agent must be to be checked
const RECONCILE_TICKS = 8
// Failed ticks before Clawd says so, once a session: one alone is let pass
const FAILURES_TO_REPORT = 5

export const register: Register = (on, options) => {
  registerGame(on, options)
  registerMoods(on, options)

  // Module state: the clock, and what the last draw saw of the band
  let t = 0
  let idleTicks = 0
  let isWorking = false
  let bodyColumns = 80
  let lastKey = ''
  // The subagents at their desks, in seat order
  let agents: Agent[] = []
  let failures = 0
  // The scene Clawd is playing, and the moments and cheer waiting their turn
  let director = start(t)
  // The ticks of the main loop's recent reads, and the tick it sat down to read
  let reads: number[] = []
  let readingFrom: number | undefined
  const readingFor = () => (readingFrom === undefined ? undefined : t - readingFrom)
  // Commands the main loop has running, and the tick the first of them began
  let running = 0
  let runningFrom: number | undefined
  const runningFor = () => (runningFrom === undefined ? undefined : t - runningFrom)
  // The ticks recent subagents were spawned
  let spawns: number[] = []
  // The main loop's tool calls that failed in a row
  let errors = 0

  const isBusy = () => isWorking || agents.some(a => a.doneAt === undefined)
  const context = (): Context => ({ idleTicks, isWorking: isBusy(), readingFor: readingFor(), runningFor: runningFor() })
  // The hat, through December or as chosen in /config
  const worn = () => (wearsHat(options.hat, new Date()) ? [HAT] : [])
  // The tree's lights this session: one more for each turn that answered
  let lit = 0
  // The tree at the band's right edge, through December or as chosen in
  // /config, when the band has room for it
  function decor(): Decor | undefined {
    const day = treeDay(options.tree, new Date())
    if (day === undefined || bodyColumns < TREE_MIN_COLUMNS) return undefined
    return treeCells(day, lit, isBusy(), t)
  }
  // The half tick within the tick: 1 between ticks, 0 on one
  let half = 0
  // What Clawd shows now. Stepping the director here, not only on the clock,
  // lets an event show at once when the scene it waits on can already end
  function shown() {
    director = step(director, context(), t)
    return dress(pose(director, context(), t, usableColumns(bodyColumns, decor()), half), worn())
  }

  function drawKey(): string {
    if (agents.length === 0) return `${viewKey(shown())}#${JSON.stringify(decor() ?? null)}`
    return `T${JSON.stringify(desksScene())}`
  }

  function soloScene(): Segment[][] {
    const v = shown()
    return solo(v.frame, v.marks, v.x, v.line, v.isWorking, bodyColumns, decor(), v.quarters, v.eyes, v.cells)
  }

  function desksScene() {
    // Clawd alone, not what it holds: the desks start right beside it
    const frame = shown().frame.map(r => r.slice(0, WIDTH)) as Frame
    return scene(t, agents, frame, isWorking ? 'dirigiendo' : 'esperando', bodyColumns, decor())
  }

  function seat(id: string, type: string, task: string) {
    if (!agents.some(a => a.id === id)) {
      agents = [...agents, { id, type, activity: task, x: START_X, bornAt: t }]
    }
  }

  function finish(id: string, result: string) {
    agents = agents.map(a => (a.id === id && a.doneAt === undefined ? { ...a, doneAt: t, result } : a))
  }

  on('session.start', async ($, e, next) => {
    // The clock must outlive a bad tick: a period that fails would end the
    // interval, and Clawd would freeze on whatever it last drew.
    // Half ticks, for a walk that steps twice a tick; everything else keeps to
    // the whole ticks, every other half
    $.clock.every(TICK_MS / 2, async () => {
      try {
        half = 1 - half
        if (half === 0) {
          t += 1
          idleTicks = isBusy() ? 0 : idleTicks + 1
          if (readingFrom !== undefined && t - (reads[reads.length - 1] ?? t) > READING_LINGER_TICKS) readingFrom = undefined
          agents = walk(agents, t, usableColumns(bodyColumns, decor()))

          // An agent whose loop ended without a SubagentStop still leaves its desk
          const waiting = agents.filter(a => a.doneAt === undefined && t - a.bornAt >= RECONCILE_TICKS)
          if (waiting.length > 0 && t % RECONCILE_TICKS === 0) {
            const list = await $.agent.list()
            for (const a of waiting) {
              const info = list.find(i => i.id === a.id)
              if (!info) finish(a.id, 'listo')
              else if (ENDED[info.status]) {
                finish(a.id, ENDED[info.status]!)
                // A subagent that failed or was stopped leaves Clawd dizzy
                if (info.status !== 'completed') director = cue(director, 'dizzy', t)
              }
            }
          }
        }

        const key = drawKey()
        if (key !== lastKey) {
          lastKey = key
          await update($, tick, n => n + 1)
        }
      } catch (err) {
        // The next tick draws again; a run of failures is said, not hidden
        failures += 1
        if (failures === FAILURES_TO_REPORT) {
          const reason = err instanceof Error ? err.message : String(err)
          $.ui.toast(`clawd-buddy: el reloj está fallando (${reason})`)
        }
      }
    })

    try {
      await registerGameCommand($)
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      $.ui.toast(`clawd-buddy: /clawd-play no está disponible (${reason})`)
    }
    try {
      await registerMoodCommand($)
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      $.ui.toast(`clawd-buddy: /clawd-mood no está disponible (${reason})`)
    }

    return next(e)
  })

  // These hooks only watch: one that fails passes the event on untouched
  // (a `next` already called replays its answer)

  // A subagent sits down when it starts, its task as its first words. Only the
  // spawn seats one: SubagentStart can fire for loops no agent list names
  // (a workflow's), which the check of the list would send off as done
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (started.agentId && !e.workflow) {
      seat(started.agentId, e.subagentType, oneLine(e.description))
      // Two or more at once: Clawd suits up
      spawns = [...spawns.filter(s => t - s < SUPER_WINDOW_TICKS), t]
      if (spawns.length >= 2) director = cue(director, 'super', t)
    }
    return started
  }).catch(($, e, next) => next(e))

  // Its bubble follows its tool calls; a call that went well can give Clawd a
  // moment (passing tests, a commit, a plan)
  on('tool.call', async ($, e, next) => {
    const input = e as unknown as Record<string, unknown>
    const a = e.agentId === undefined ? undefined : agents.find(x => x.id === e.agentId)
    if (a && a.doneAt === undefined) {
      const activity = describe(e.tool, input)
      agents = agents.map(x => (x === a ? { ...x, activity } : x))
    }
    // The main loop reading one thing after another sits down to read
    if (e.agentId === undefined && isRead(e.tool)) {
      reads = [...reads.filter(r => t - r < READS_WINDOW_TICKS), t]
      if (readingFrom === undefined && reads.length >= READS_TO_START) readingFrom = t
    }
    // While the main loop waits on a command, the headphones go on
    const isCommand = e.agentId === undefined && e.tool === 'Bash'
    if (isCommand) {
      running += 1
      runningFrom ??= t
    }
    let answer
    try {
      answer = await next(e)
    } finally {
      if (isCommand) {
        running -= 1
        if (running === 0) runningFrom = undefined
      }
    }
    const isOk = answer.deny === undefined && answer.isError !== true
    const mood = cueOf(e.tool, input, isOk)
    if (mood) director = cue(director, mood, t)
    // Failure after failure leaves it dizzy
    if (e.agentId === undefined) {
      errors = isOk ? 0 : errors + 1
      if (errors === ERRORS_TO_DIZZY) director = cue(director, 'dizzy', t)
    }
    return answer
  }).catch(($, e, next) => next(e))

  // A turn of the main loop that answered: Clawd cheers once what it is doing
  // can stop; a new prompt cuts it short
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && e.reason === 'answer') {
      director = cue(director, 'celebrate', t)
      lit += 1
      isWorking = false
      idleTicks = 0
      reads = []
      readingFrom = undefined
    }
    await trackTurn($, e)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('prompt.submit', async ($, e, next) => {
    director = reset(director, context(), t)
    if (isThanks(e.text)) director = cue(director, 'love', t)
    await trackPrompt($, e)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('classic.SubagentStop', ($, e, next) => {
    finish(e.agent_id, summary(e.last_assistant_message))
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || e.props.maxRows < 4) {
      return next(e)
    }

    // AbovePrompt is shared. Keep the rest of the render chain alive and
    // give downstream plugins the space left after our four-row scene.
    const below = await next({ ...e, props: { ...e.props, maxRows: e.props.maxRows - 4 } })

    // Read so a write of the key redraws this band
    await read($, tick)
    if (e.props.isWorking) idleTicks = 0
    isWorking = e.props.isWorking
    bodyColumns = e.props.bodyColumns

    const { Box, Text } = $.ui.resolve(e)
    lastKey = drawKey()

    const rows = agents.length > 0 ? desksScene() : soloScene()

    return (
      <Box flexDirection="column">
        {rows.map((row, i) => (
          <Text key={`r${i}`} wrap="truncate">
            {row.map(({ text, style }, j) =>
              Object.keys(style).length === 0 ? (
                text
              ) : (
                <Text
                  key={`s${j}`}
                  {...(style.bg ? { backgroundColor: style.bg } : {})}
                  {...(style.fg ? { color: style.fg } : {})}
                  {...(style.dim ? { dimColor: true } : {})}
                  {...(style.italic ? { italic: true } : {})}
                  {...(style.bold ? { bold: true } : {})}
                >
                  {text}
                </Text>
              ),
            )}
          </Text>
        ))}
        {below}
      </Box>
    )
  })
}
