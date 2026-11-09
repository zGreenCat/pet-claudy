// The poses drawn in the pixel workshop (the "Clawd de perfil" artifact),
// as it exports them: 24 pixels across by 8 down, two to a cell each way,
// over the band's four rows, Clawd's front-on body four pixels in. Each
// letter is a color (`PIXEL` in desks.ts): O the body, D its shade, K an
// eye, N a book's cover, P its pages, W white, B the headphones, U a mug,
// M coffee, E an ember, Y gold, S smoke and steam, R red; `.` is empty.
// Drawn facing right: the director mirrors them going left. Each fits the
// terminal's cells, two colors to a full cell and one to a cell part empty.

// A drawing and the ticks it holds. A `busy` one is mid-action (a sip, a
// puff): its scene does not give way during it
export type Shot = { ticks: number; px: readonly string[]; busy?: true }

// The ticks one pass of a loop of shots takes
export const loopTicks = (shots: readonly Shot[]) => shots.reduce((n, shot) => n + shot.ticks, 0)

// The shot `s` ticks into a loop of them
export function shotAt(shots: readonly Shot[], s: number): Shot {
  let k = s % loopTicks(shots)
  for (const shot of shots) {
    if (k < shot.ticks) return shot
    k -= shot.ticks
  }
  return shots[0]!
}

// Walking three-quarters on: the shaded side behind, the face ahead, the
// legs stepping in two groups, a shaded far leg in each. A step a half tick
export const WALK: readonly Shot[] = [
  // paso 1
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....D.O.O.OD.O.O.......',
      '........................',
    ],
  },
  // paso 2
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // paso 3
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '......D.O.O..D.O.O......',
      '........................',
    ],
  },
  // paso 4
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....D.O.D.OD..O.O......',
      '........................',
    ],
  },
]

// Half turned between three-quarters and front-on
export const HALF_TURN: readonly string[] = [
  '........................',
  '........................',
  '.....DOOOOOOOOOOOO......',
  '.....DOOOKOOOOOKOO......',
  '.....DOOOOOOOOOOOOO.....',
  '.....DOOOOOOOOOOOO......',
  '.....D.O.O.....O.O......',
  '........................',
]

// Waiting: breathing, an uneven blink, and now and then a half turn to look
// to the side and back
export const IDLE: readonly Shot[] = [
  // quieto
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOOOOOOOOOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // inhala
  {
    ticks: 4,
    px: [
      '........................',
      '........................',
      '......DDDDDDDDDDDD......',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // quieto
  {
    ticks: 6,
    px: [
      '........................',
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOOOOOOOOOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // parpadea
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOOOOOOOOOOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOOOOOOOOOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // quieto
  {
    ticks: 10,
    px: [
      '........................',
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOOOOOOOOOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // inhala
  {
    ticks: 4,
    px: [
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '......OOOOOOOOOOOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOODDDDDDOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
  // medio giro
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DOOOOOOOOOOOO......',
      '.....DOOOKOOOOOKOO......',
      '.....DOOOOOOOOOOOOO.....',
      '.....DOOOOOOOOOOOO......',
      '.....D.O.O.....O.O......',
      '........................',
    ],
  },
  // mira al lado
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // parpadea de lado
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // mira al lado
  {
    ticks: 4,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // medio giro
  {
    ticks: 1,
    px: [
      '........................',
      '........................',
      '.....DOOOOOOOOOOOO......',
      '.....DOOOKOOOOOKOO......',
      '.....DOOOOOOOOOOOOO.....',
      '.....DOOOOOOOOOOOO......',
      '.....D.O.O.....O.O......',
      '........................',
    ],
  },
  // quieto
  {
    ticks: 4,
    px: [
      '........................',
      '........................',
      '......OOOOOOOOOOOO......',
      '......OOKOOOOOOKOO......',
      '....OOOOOOOOOOOOOOOO....',
      '......OOOOOOOOOOOO......',
      '......O.O......O.O......',
      '........................',
    ],
  },
]

// Reading three-quarters on, the book held low ahead and a page turning over
export const READ: readonly Shot[] = [
  // lee
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKOOO....',
      '.....DDDOOOOOOOOOOWWN...',
      '.....DO.O.O..DO.O.NNN...',
      '..................NNN...',
    ],
  },
  // la página se levanta
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKOWO....',
      '.....DDDOOOOOOOOOOWWN...',
      '.....DO.O.O..DO.O.NNN...',
      '..................NNN...',
    ],
  },
  // la página pasa
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKOOW....',
      '.....DDDOOOOOOOOOOWWN...',
      '.....DO.O.O..DO.O.NNN...',
      '..................NNN...',
    ],
  },
  // la página cae
  {
    ticks: 8,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKOOOOOKOOW....',
      '.....DDDOOOOOOOOOOWWN...',
      '.....DO.O.O..DO.O.NNN...',
      '..................NNN...',
    ],
  },
]

// Listening: headphones on, a nod of the eyes on the off-beat, the feet
// taking turns, a hand up now and then, notes rising
export const MUSIC: readonly Shot[] = [
  // tiempo
  {
    ticks: 2,
    px: [
      '....................Y...',
      '......BBBBBBBBBB...YY...',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DBBOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // tiempo
  {
    ticks: 2,
    px: [
      '........................',
      '......BBBBBBBBBB........',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DBBOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // cabecea · pata trasera
  {
    ticks: 2,
    px: [
      '....................Y..Y',
      '......BBBBBBBBBB...YY...',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....D..O.O..DO.O.......',
      '........................',
    ],
  },
  // tiempo
  {
    ticks: 2,
    px: [
      '....................Y...',
      '......BBBBBBBBBB...YY...',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DBBOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // cabecea · chasquea
  {
    ticks: 2,
    px: [
      '......................Y.',
      '......BBBBBBBBBB.....YY.',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOOOOOOOOOO.....',
      '.....DBBOOKOOOOOKOO.....',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.........',
      '........................',
    ],
  },
  // tiempo · guiño
  {
    ticks: 2,
    px: [
      '........................',
      '......BBBBBBBBBB........',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DBBOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // cabecea · pata trasera
  {
    ticks: 2,
    px: [
      '....................Y..Y',
      '......BBBBBBBBBB...YY...',
      '.....DBDOOOOOOOOOO......',
      '.....DBBOOOOOOOOOO......',
      '.....DBBOOKOOOOOKO......',
      '.....DDDOOOOOOOOOO......',
      '.....D..O.O..DO.O.......',
      '........................',
    ],
  },
]

// A coffee: the mug held ahead, steam curling up, a sip now and then
export const COFFEE: readonly Shot[] = [
  // vapor
  {
    ticks: 3,
    px: [
      '........................',
      '..................S.....',
      '.....DDDOOOOOOOOOO.S....',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOMMU...',
      '.....DDDOOOOOOOOOOUUU...',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // vapor
  {
    ticks: 3,
    px: [
      '...................S....',
      '........................',
      '.....DDDOOOOOOOOOOS.....',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOMMU...',
      '.....DDDOOOOOOOOOOUUU...',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // sorbo
  {
    ticks: 4, busy: true,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOOMMU...',
      '.....DDDOOKKOOOKKOUUU...',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // vapor
  {
    ticks: 3,
    px: [
      '........................',
      '..................S.....',
      '.....DDDOOOOOOOOOO.S....',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOMMU...',
      '.....DDDOOOOOOOOOOUUU...',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // vapor
  {
    ticks: 3,
    px: [
      '...................S....',
      '........................',
      '.....DDDOOOOOOOOOOS.....',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOMMU...',
      '.....DDDOOOOOOOOOOUUU...',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
]

// A smoke: the ember glowing on a puff, the smoke blown out ahead
export const SMOKE: readonly Shot[] = [
  // humo
  {
    ticks: 3,
    px: [
      '......................S.',
      '........................',
      '.....DDDOOOOOOOOOO.....S',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOWWWWE.',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // humo
  {
    ticks: 3,
    px: [
      '........................',
      '.......................S',
      '.....DDDOOOOOOOOOO....S.',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOWWWWE.',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // pitada
  {
    ticks: 3, busy: true,
    px: [
      '........................',
      '........................',
      '.....DDDOOOOOOOOOO......',
      '.....DDDOOKKOOOOKK......',
      '.....DDDOOOOOOOOOOWWWWY.',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // exhala
  {
    ticks: 3, busy: true,
    px: [
      '........................',
      '......................S.',
      '.....DDDOOOOOOOOOO..SS..',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOWWWWE.',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
  // humo
  {
    ticks: 2,
    px: [
      '......................S.',
      '........................',
      '.....DDDOOOOOOOOOO.....S',
      '.....DDDOOKOOOOOKO......',
      '.....DDDOOOOOOOOOOWWWWE.',
      '.....DDDOOOOOOOOOO......',
      '.....DO.O.O..DO.O.......',
      '........................',
    ],
  },
]
