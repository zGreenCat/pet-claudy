# clawd-buddy

Clawd, the Claude Code mascot, above the prompt. It reacts to what Claude is doing:

- **quieto**: waits, blinks and sways.
- **baila**: dances while a turn runs.
- **cocina**: tosses code in a pan ("cocinando código").
- **fuma**: takes a smoke break now and then when idle.
- **duerme**: falls asleep after 3 minutes idle.
- **celebra**: cheers with confetti when a turn ends.
- **agentes**: each subagent walks out of Clawd with its own laptop, shows what it is doing in a bubble, and walks back in when it finishes.

## Install

In a Claude Code terminal session:

```
/plugin install clawd-buddy --marketplace <owner>/<repo>
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

```
claude plugin validate .
claude plugin test .
```

The hooks module is `hooks/register.tsx`; the poses are in `hooks/clawd.ts` and the subagent scene in `hooks/desks.ts`.
