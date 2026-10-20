# clawd-buddy

Clawd, the Claude Code mascot, above the prompt. It reacts to what Claude is doing:

- **quieto**: waits, blinks and sways.
- **baila**: dances while a turn runs.
- **cocina**: tosses code in a pan ("cocinando código").
- **fuma**: takes a smoke break now and then when idle.
- **duerme**: falls asleep after 3 minutes idle.
- **celebra**: cheers with confetti when a turn ends.
- **agentes**: each subagent walks out of Clawd with its own laptop, shows what it is doing in a bubble, and walks back in when it finishes.

## Clawd Invaders

A small shooter for long tasks. `/clawd-play` opens a pane (docked beside the
transcript in fullscreen from 110 columns, inline above the prompt otherwise)
where Clawd flies a ship against waves of bugs. The ship fires on its own; you only steer.

- `←` `→` or `a` `d`: move. `Enter` or `Space`: start or resume. `p`: pause. `r` or `Enter` after game over: restart.
- Click the pane (or `ctrl+x tab`) to give it the keyboard; `Esc` hands it back to the prompt. Without the keyboard, or after a resize, the game pauses and waits for you.
- Three lives, a short invulnerability after a hit, harder waves. The status line shows whether Claude is working or done.
- Closing the pane ends the game. The engine decides the pane width and side; the game asks for about a third.

## Install

In a Claude Code terminal session:

```
/plugin install clawd-buddy --marketplace zGreenCat/pet-claudy
```

Answer `y` to add the marketplace, then pick a scope (user, to have it in every session).

## Preview

See every mood without running a session (Node 23.6 or newer):

```
node scripts/preview.ts ?        # list the moods
node scripts/preview.ts cocina   # play one
node scripts/preview.ts todos    # play them in turn
```

## Develop

Clawd shares the area above the prompt with other plugins, including image-preview.
It preserves their rendered content and reserves four rows for its scene when
passing the remaining row budget along. With fewer than four available rows or
a survey, Clawd steps aside.

```
claude plugin validate .
claude plugin test .
```

The hooks module is `hooks/register.tsx`; the poses are in `hooks/clawd.ts` and the subagent scene in `hooks/desks.ts`.
