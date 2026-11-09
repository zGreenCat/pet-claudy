# clawd-buddy

Clawd, the Claude Code mascot, above the prompt. It reacts to what Claude is doing:

- **quieto**: waits, blinks and sways.
- **baila**: dances while a turn runs.
- **cocina**: tosses code in a pan ("cocinando código").
- **fuma**: takes a smoke break now and then when idle.
- **duerme**: falls asleep after 3 minutes idle.
- **celebra**: cheers with confetti when a turn ends.
- **camina**: while Claude works, Clawd walks three-quarters on, turns to face you and stops to dance or cook, then walks on. It steps at 8 frames a second; everything else keeps its pace.
- **agentes**: each subagent walks out of Clawd with its own laptop, shows what it is doing in a bubble, and walks back in when it finishes.

In December Clawd wears a Santa hat. It follows its head through every pose
and falls off when Clawd does. Choose `diciembre`, `siempre` or `nunca` in
`/config` or with `/clawd-mood gorro <choice>`.

A pine stands at the band's right edge in December, when the band is 70
columns or wider. It gets an ornament every few days, its point lights as a
star on the 24th and presents show up on the 25th; each turn that ends lights
one more ornament for the session, and the lit ones twinkle while Claude
works. Choose it like the hat: `/clawd-mood arbol <choice>`.

## Clawd Invaders

A small shooter for long tasks. `/clawd-play` opens a pane (docked beside the
transcript in fullscreen from 110 columns, inline above the prompt otherwise)
where Clawd flies a ship against waves of bugs. The ship fires on its own; you only steer.

- `←` `→` or `a` `d`: move. `Enter` or `Space`: start or resume. `p`: pause. `r` or `Enter` after game over: restart.
- The pane opens without the keyboard and plays a demo on autopilot. Click it to give it the keyboard and play; `Esc` hands it back to the prompt. The engine tells the game nothing when a click's keyboard goes back, so twelve seconds without a key, or a resize, pause your game until you click and press a key.
- The board takes the pane's whole height and at most 44 columns, centered; it needs at least 26 columns and 16 rows. A taller pane brings more rows of bugs, faster bombs and longer drops.
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
node scripts/preview.ts cambios  # a made-up turn, scene after scene
node scripts/preview.ts gorro    # the Santa hat over the poses that move the head
node scripts/preview.ts navidad  # December in seconds: the tree filling in and lighting up
node scripts/preview.ts caminata # work as it plays now: walking three-quarters on, then dancing in place
```

## Pixel editor

`scripts/editor.html` opens in a browser and draws Clawd with the terminal's
rules: two pixels to a cell each way, cells twice as tall as wide, two colors
to a cell. Paint an accessory over the poses, check the terminal preview, and
copy the JSON out. It opens with the poses the plugin draws now; after
changing an accessory, refresh them with `node scripts/editor-poses.ts`.

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
