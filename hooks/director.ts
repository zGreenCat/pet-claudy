// The director: which scene Clawd is playing and since when, so one scene
// ends before the next begins. A loop gives way only where it can stop
// cleanly, a moment or the cheer plays to its end, and the events that come
// meanwhile wait their turn. Pure: the clock steps it, the tests drive it.

import { HALF_TURN, SCENES, headOf, mirrored, strolled, want } from './clawd.ts'
import type { Context, Mood, Place, Scene, SceneId, View } from './clawd.ts'

// What arrives from outside: a moment, or a turn that answered
export type Cue = 'celebrate' | Mood

export type Director = {
  id: SceneId
  // The tick the scene began, how far into it it began, and the tick its way
  // out began, if it is leaving
  from: number
  offset: number
  exitFrom?: number
  // How far work had got when it last gave way: it picks up there, at the
  // clean stop it left on, so its lines keep turning and the pan still comes out
  worked: number
  // Events waiting their turn, oldest first, and the tick each arrived
  queue: { id: Cue; at: number }[]
  // Ticks Clawd has walked since it last stood at its spot, and the tick of
  // the last step: a second step in the same tick does not walk again
  walkT: number
  at: number
}

// An event that waits longer than this is old news and is dropped. Longer
// than the longest scene (dizzy, 32) and a loop's way to a stop, so one
// scene alone never makes the next one stale: only a queue behind it does
export const STALE_TICKS = 40
const QUEUE_MAX = 2

export function start(t: number): Director {
  return { id: 'idle', from: t, offset: 0, queue: [], walkT: 0, at: t, worked: 0 }
}

// An event arrives. One already playing or waiting is not repeated; a full
// queue lets its oldest go
export function cue(d: Director, id: Cue, t: number): Director {
  if ((d.id === id && d.exitFrom === undefined) || d.queue.some(q => q.id === id)) return d
  return { ...d, queue: [...d.queue, { id, at: t }].slice(-QUEUE_MAX) }
}

// The person sends a prompt: what Clawd was celebrating or feeling is over,
// and nothing waiting is still news. A loop goes on: it is not stale
export function reset(d: Director, c: Context, t: number): Director {
  const isEvent = SCENES[d.id].length !== undefined
  return isEvent ? enter({ ...d, queue: [] }, want(c), t) : { ...d, exitFrom: undefined, queue: [] }
}

// Begin scene `id` at tick `t`; work picks up where it left off
function enter(d: Director, id: SceneId, t: number): Director {
  const worked = d.id === 'work' && d.exitFrom === undefined ? d.offset + t - d.from : d.worked
  return { ...d, id, from: t, offset: id === 'work' ? worked : 0, exitFrom: undefined, worked }
}

const placeOf = (scene: Scene, s: number): Place => scene.placeAt?.(s) ?? scene.place

// One tick: keep playing, begin the way out, or begin the next scene. It can
// run more than once in a tick, so an event shows at once when what Clawd is
// doing can already give way
export function step(d: Director, c: Context, t: number): Director {
  const queue = d.queue.filter(q => t - q.at <= STALE_TICKS)
  let next: Director = { ...d, queue }
  const scene = SCENES[d.id]
  const isExiting = d.exitFrom !== undefined
  const hasExited = isExiting && t - d.exitFrom! >= scene.exit!.ticks

  if (!isExiting || hasExited) {
    const held = t - d.from
    const s = d.offset + held
    const wanted = queue[0]?.id ?? want(c)
    const isOver = scene.length !== undefined && s >= scene.length
    const mayLeave =
      hasExited ||
      (scene.length !== undefined ? isOver : held >= (scene.minTicks ?? 0) && (scene.canLeave?.(s) ?? true))
    const isSame = wanted === d.id && !isOver && !hasExited

    if (!isSame && mayLeave) {
      if (scene.exit && !hasExited) {
        next = { ...next, exitFrom: t }
      } else {
        next = enter({ ...next, queue: queue[0]?.id === wanted ? queue.slice(1) : queue }, wanted, t)
      }
    }
  }

  const place = next.exitFrom !== undefined ? 'stand' : placeOf(SCENES[next.id], next.offset + t - next.from)
  const steps = t > d.at ? 1 : 0
  const walkT = place === 'walk' ? next.walkT + steps : place === 'home' ? 0 : next.walkT
  return { ...next, walkT, at: t }
}

// What Clawd shows at tick `t`, `half` a tick on. A step on its own feet
// shows every half tick, facing where it goes. Turning, it half turns for
// half a tick: on its way to front-on it faces where it came from, on its way
// back to walking where it goes, and at the band's end both, one half each
export function pose(d: Director, c: Context, t: number, bodyColumns: number, half = 0): View {
  const scene = SCENES[d.id]
  const isExiting = d.exitFrom !== undefined
  const s = d.offset + t - d.from
  const { dx = 0, walking, turning, quarters, ...p } = isExiting ? scene.exit!.play(t - d.exitFrom!) : scene.play(s, half)
  const place = isExiting ? 'stand' : placeOf(scene, s)
  const x = place === 'home' ? 0 : strolled(d.walkT, bodyColumns)
  // Which way it came, and which way it goes on: 1 right, -1 left, 0 still
  const came = d.walkT > 0 ? Math.sign(x - strolled(d.walkT - 1, bodyColumns)) : 0
  const goes = Math.sign(strolled(d.walkT + 1, bodyColumns) - x)
  const facing = (pixels: readonly string[], way: number) => (way < 0 ? mirrored(pixels) : pixels)
  let drawn = quarters
  if (walking && quarters) {
    const isTurningBack = goes === 0 || (came !== 0 && came !== goes)
    drawn = isTurningBack ? facing(HALF_TURN, half === 0 ? came || goes : goes || came) : facing(quarters, goes)
  } else if (turning === 'in') {
    drawn = half === 0 ? facing(HALF_TURN, came || goes) : undefined
  } else if (turning === 'out') {
    drawn = half === 0 ? undefined : facing(HALF_TURN, goes || came)
  }
  // Nothing worn over a pose drawn in pixels: what it wears follows the cells
  const head = scene.coversHead || drawn ? undefined : headOf(p.frame)
  return { ...p, x: x + dx, isWorking: d.id === 'celebrate' || c.isWorking, head, ...(drawn ? { quarters: drawn } : {}) }
}
