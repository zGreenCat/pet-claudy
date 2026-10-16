import { atom, read, update } from 'claude-code'
import type { AgentStatus, Register } from 'claude-code'

import type { Tick } from '../types'
import { CELEBRATE_TICKS, TICK_MS, WIDTH, cueOf, isThanks, view, viewKey } from './clawd'
import type { Frame, Moment, Mood } from './clawd'
import { START_X, describe, oneLine, scene, solo, summary, walk } from './desks'
import type { Agent, Segment } from './desks'

// The view key last drawn. The timer only writes it when what Clawd shows
// changes, so a still Clawd costs no redraws.
const tick = atom({ plugin: 'clawd-buddy', key: 'tick' } as const, 0 as Tick)

// What a finished agent's buddy says when its loop ended without a SubagentStop
const ENDED: Partial<Record<AgentStatus, string>> = { completed: 'listo', failed: '✗ falló', killed: '✗ detenido' }
// Ticks between checks of the agent list, and how old an agent must be to be checked
const RECONCILE_TICKS = 8
// Failed ticks before Clawd says so, once a session: one alone is let pass
const FAILURES_TO_REPORT = 5

export const register: Register = on => {
  // Module state: the clock, and what the last draw saw of the band
  let t = 0
  let idleTicks = 0
  let isWorking = false
  let bodyColumns = 80
  let lastKey = ''
  // The tick the main loop's last turn ended; far back, so none to celebrate
  let finishedAt = -CELEBRATE_TICKS
  // The subagents at their desks, in seat order
  let agents: Agent[] = []
  let failures = 0
  // The moment Clawd is having and the tick it began
  let cue: { mood: Mood; at: number } | undefined

  const now = (): Moment | undefined => (cue ? { mood: cue.mood, since: t - cue.at } : undefined)

  const isBusy = () => isWorking || agents.some(a => a.doneAt === undefined)

  function drawKey(): string {
    if (agents.length === 0) return viewKey(view(t, idleTicks, isWorking, bodyColumns, t - finishedAt, now()))
    return `T${JSON.stringify(desksScene())}`
  }

  function soloScene(): Segment[][] {
    const v = view(t, idleTicks, isWorking, bodyColumns, t - finishedAt, now())
    return solo(v.frame, v.marks, v.x, v.line, v.isWorking, bodyColumns)
  }

  function desksScene() {
    // Clawd alone, not what it holds: the desks start right beside it
    const frame = view(t, idleTicks, isBusy(), bodyColumns, undefined, now()).frame.map(r => r.slice(0, WIDTH)) as Frame
    return scene(t, agents, frame, isWorking ? 'dirigiendo' : 'esperando', bodyColumns)
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
    // interval, and Clawd would freeze on whatever it last drew
    $.clock.every(TICK_MS, async () => {
      try {
        t += 1
        idleTicks = isBusy() ? 0 : idleTicks + 1
        agents = walk(agents, t, bodyColumns)

        // An agent whose loop ended without a SubagentStop still leaves its desk
        const waiting = agents.filter(a => a.doneAt === undefined && t - a.bornAt >= RECONCILE_TICKS)
        if (waiting.length > 0 && t % RECONCILE_TICKS === 0) {
          const list = await $.agent.list()
          for (const a of waiting) {
            const info = list.find(i => i.id === a.id)
            if (!info) finish(a.id, 'listo')
            else if (ENDED[info.status]) finish(a.id, ENDED[info.status]!)
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

    return next(e)
  })

  // These hooks only watch: one that fails passes the event on untouched
  // (a `next` already called replays its answer)

  // A subagent sits down when it starts, its task as its first words. Only the
  // spawn seats one: SubagentStart can fire for loops no agent list names
  // (a workflow's), which the check of the list would send off as done
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (started.agentId && !e.workflow) seat(started.agentId, e.subagentType, oneLine(e.description))
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
    const answer = await next(e)
    const mood = cueOf(e.tool, input, answer.deny === undefined && answer.isError !== true)
    if (mood) cue = { mood, at: t }
    return answer
  }).catch(($, e, next) => next(e))

  // A turn of the main loop that answered: Clawd cheers; a new prompt cuts it short
  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined && e.reason === 'answer') {
      finishedAt = t
      isWorking = false
      idleTicks = 0
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('prompt.submit', ($, e, next) => {
    finishedAt = -CELEBRATE_TICKS
    cue = isThanks(e.text) ? { mood: 'love', at: t } : undefined
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
      </Box>
    )
  })
}
