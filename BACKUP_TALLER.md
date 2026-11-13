# Respaldo del taller de Clawd

Los moods que tenía el taller antes de quedarse solo con los del plugin
(noviembre de 2026): los dibujos en 8 filas, los descartados y las pruebas.
Son los de fábrica; lo que alguien haya retocado en su navegador sin pegarlo
en el chat no está aquí.

Para recuperar un mood: copia su bloque JSON, pégalo en el taller en
"Pasar al chat" y usa "Cargar JSON pegado". Entra como un mood más, con su
nombre; si ya hay uno con ese nombre, lo reemplaza.

Las letras son colores: `o` cuerpo, `d` sombra, `k` ojo, `r` rojo, `w` blanco,
`n` tapa del libro, `p` páginas, `b` audífonos, `g` gris, `m` café, `e` brasa,
`y` dorado, `s` humo; `1` `2` `3` mezclas de cuerpo y sombra; `.` vacío.

## base

El Clawd de frente original, de referencia. 1 fotogramas, 4 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"frente","role":"front","ticks":4,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"],"mood":"base"}
]}
```

## caminata

La caminata y el medio giro en 8 filas (cuartos). 5 fotogramas, 5 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"medio giro","role":"turn","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"],"mood":"caminata"},
{"name":"paso 1 · trasero adelante","role":"walk","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....d.o.o.od.o.o.......","........................"],"mood":"caminata"},
{"name":"paso 2 · tuyo","role":"walk","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"],"mood":"caminata"},
{"name":"paso 3 · delantero adelante","role":"walk","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......","......d.o.o..d.o.o......","........................"],"mood":"caminata"},
{"name":"paso 4 · al revés del tuyo","role":"walk","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....d.o.d.od..o.o......","........................"],"mood":"caminata"}
]}
```

## gorro

Bocetos del gorro de Navidad en píxeles. 2 fotogramas, 5 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"gorro · frente","role":"other","ticks":4,"px":["........rrrrrrrrrrrrr...","......wwwwwwwwwwwwrrrrr.","......oooooooooooo...rww","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"],"mood":"gorro"},
{"name":"gorro · paso 2","role":"other","ticks":1,"px":["....rrrrrrrrrrrr........","..ww..wwwwwwwwwwww......",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"],"mood":"gorro"}
]}
```

## reposo

El reposo en 8 filas, antes de la respiración de a octavos. 12 fotogramas, 52 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"reposo · quieto","mood":"reposo","role":"other","ticks":8,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · inhala","mood":"reposo","role":"other","ticks":4,"px":["........................","......oooooooooooo......","......ookooooookoo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · quieto","mood":"reposo","role":"other","ticks":6,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · parpadea","mood":"reposo","role":"other","ticks":1,"px":["........................","........................","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · quieto","mood":"reposo","role":"other","ticks":10,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · inhala","mood":"reposo","role":"other","ticks":4,"px":["........................","......oooooooooooo......","......ookooooookoo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"reposo · medio giro","mood":"reposo","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"reposo · mira al lado","mood":"reposo","role":"other","ticks":8,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"reposo · parpadea de lado","mood":"reposo","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddoooooooooo......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"reposo · mira al lado","mood":"reposo","role":"other","ticks":4,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"reposo · medio giro","mood":"reposo","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"reposo · quieto","mood":"reposo","role":"other","ticks":4,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## leer

Leer en 8 filas, con sus 6 fotogramas. 6 fotogramas, 21 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"leer · lee","mood":"leer","role":"other","ticks":8,"px":["........................","........................",".....dddoooooooooo......",".....dddoooooooooopppp..",".....dddookoooookopnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]},
{"name":"leer · parpadea","mood":"leer","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddoooooooooopppp..",".....dddookkooookkpnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]},
{"name":"leer · lee","mood":"leer","role":"other","ticks":6,"px":["........................","........................",".....dddoooooooooo......",".....dddoooooooooopppp..",".....dddookoooookopnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]},
{"name":"leer · levanta la página","mood":"leer","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooo..pp..",".....dddoooooooooopppp..",".....dddookoooookopnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]},
{"name":"leer · la pasa","mood":"leer","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooopp....",".....dddoooooooooopppp..",".....dddookoooookopnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]},
{"name":"leer · lee","mood":"leer","role":"other","ticks":4,"px":["........................","........................",".....dddoooooooooo......",".....dddoooooooooopppp..",".....dddookoooookopnnp..",".....dddoooooooooonnnn..",".....do.o.o..do.o.......","........................"]}
]}
```

## música

Primera música: un solo cabeceo. Descartada. 2 fotogramas, 4 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"música · golpe","mood":"música","role":"other","ticks":2,"px":["........................","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música · cabeceo","mood":"música","role":"other","ticks":2,"px":["......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.........","........................"]}
]}
```

## café

Café en 8 filas. 5 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"café · vapor","mood":"café","role":"other","ticks":3,"px":["........................","..................s.....",".....dddoooooooooo.s....",".....dddookoooooko......",".....dddoooooooooommg...",".....dddooooooooooggg...",".....do.o.o..do.o.......","........................"]},
{"name":"café · vapor","mood":"café","role":"other","ticks":3,"px":["...................s....","........................",".....dddoooooooooos.....",".....dddookoooooko......",".....dddoooooooooommg...",".....dddooooooooooggg...",".....do.o.o..do.o.......","........................"]},
{"name":"café · sorbo","mood":"café","role":"other","ticks":4,"px":["........................","........................",".....dddoooooooooommg...",".....dddookkoookkoggg...",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"café · vapor","mood":"café","role":"other","ticks":3,"px":["........................","..................s.....",".....dddoooooooooo.s....",".....dddookoooooko......",".....dddoooooooooommg...",".....dddooooooooooggg...",".....do.o.o..do.o.......","........................"]},
{"name":"café · vapor","mood":"café","role":"other","ticks":3,"px":["...................s....","........................",".....dddoooooooooos.....",".....dddookoooooko......",".....dddoooooooooommg...",".....dddooooooooooggg...",".....do.o.o..do.o.......","........................"]}
]}
```

## cigarro

Cigarro en 8 filas. 5 fotogramas, 14 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"cigarro · humo","mood":"cigarro","role":"other","ticks":3,"px":["......................s.","........................",".....dddoooooooooo.....s",".....dddookoooooko......",".....dddoooooooooowwwwe.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cigarro · humo","mood":"cigarro","role":"other","ticks":3,"px":["........................",".......................s",".....dddoooooooooo....s.",".....dddookoooooko......",".....dddoooooooooowwwwe.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cigarro · pitada","mood":"cigarro","role":"other","ticks":3,"px":["........................","........................",".....dddoooooooooo......",".....dddookkooookk......",".....dddoooooooooowwwwy.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cigarro · exhala","mood":"cigarro","role":"other","ticks":3,"px":["........................","......................s.",".....dddoooooooooo..ss..",".....dddookoooooko......",".....dddoooooooooowwwwe.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cigarro · humo","mood":"cigarro","role":"other","ticks":2,"px":["......................s.","........................",".....dddoooooooooo.....s",".....dddookoooooko......",".....dddoooooooooowwwwe.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]}
]}
```

## música 2

Segunda música: el cuerpo se deformaba. Descartada. 8 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"música · abajo","mood":"música 2","role":"other","ticks":2,"px":["....................y...","...................yy...","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música · arriba · chasquea","mood":"música 2","role":"other","ticks":2,"px":["......bbbbbbbbbb......y.",".....dddoooooooooo...yy.",".....dbbookkooookko.....",".....dbbooooooooooo.....",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.........","........................"]},
{"name":"música · abajo · cabeza adelante","mood":"música 2","role":"other","ticks":2,"px":["........................","........................","........bbbbbbbbbb......",".......dddoooooooooo....",".......dbbookkooookk....",".....dddbboooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música · arriba · pata trasera","mood":"música 2","role":"other","ticks":2,"px":["......bbbbbbbbbb....y..y",".....dddoooooooooo.yy...",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....dddoooooooooo......",".....d..o.o..do.o.......","........................"]},
{"name":"música · abajo","mood":"música 2","role":"other","ticks":2,"px":["....................y...","...................yy...","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música · arriba · chasquea","mood":"música 2","role":"other","ticks":2,"px":["......bbbbbbbbbb......y.",".....dddoooooooooo...yy.",".....dbbookkooookko.....",".....dbbooooooooooo.....",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.........","........................"]},
{"name":"música · abajo · guiño","mood":"música 2","role":"other","ticks":2,"px":["........................","........................","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooooko......",".....dbboooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música · arriba · cabeza atrás","mood":"música 2","role":"other","ticks":2,"px":["....bbbbbbbbbb......y..y","...dddoooooooooo...yy...","...dbbookkooookk........","....bbddoooooooooo......",".....dddoooooooooo......",".....dddoooooooooo......",".....d..o.o..do.o.......","........................"]}
]}
```

## música 3

La música elegida, en 8 filas. 8 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"música 3 · tiempo","mood":"música 3","role":"other","ticks":2,"px":["....................y...","......bbbbbbbbbb...yy...",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música 3 · cabecea · chasquea","mood":"música 3","role":"other","ticks":2,"px":["......................y.","......bbbbbbbbbb.....yy.",".....dddoooooooooo......",".....dbbooooooooooo.....",".....dbbookkooookko.....",".....dddoooooooooo......",".....do.o.o..do.........","........................"]},
{"name":"música 3 · tiempo","mood":"música 3","role":"other","ticks":2,"px":["........................","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música 3 · cabecea · pata trasera","mood":"música 3","role":"other","ticks":2,"px":["....................y..y","......bbbbbbbbbb...yy...",".....dddoooooooooo......",".....dbboooooooooo......",".....dbbookkooookk......",".....dddoooooooooo......",".....d..o.o..do.o.......","........................"]},
{"name":"música 3 · tiempo","mood":"música 3","role":"other","ticks":2,"px":["....................y...","......bbbbbbbbbb...yy...",".....dddoooooooooo......",".....dbbookkooookk......",".....dbboooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música 3 · cabecea · chasquea","mood":"música 3","role":"other","ticks":2,"px":["......................y.","......bbbbbbbbbb.....yy.",".....dddoooooooooo......",".....dbbooooooooooo.....",".....dbbookkooookko.....",".....dddoooooooooo......",".....do.o.o..do.........","........................"]},
{"name":"música 3 · tiempo · guiño","mood":"música 3","role":"other","ticks":2,"px":["........................","......bbbbbbbbbb........",".....dddoooooooooo......",".....dbbookkooooko......",".....dbboooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"música 3 · cabecea · pata trasera","mood":"música 3","role":"other","ticks":2,"px":["....................y..y","......bbbbbbbbbb...yy...",".....dddoooooooooo......",".....dbboooooooooo......",".....dbbookkooookk......",".....dddoooooooooo......",".....d..o.o..do.o.......","........................"]}
]}
```

## festejo

Primer festejo: salto en el lugar con ojos anchos. Descartado. 13 fotogramas, 28 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"festejo · medio giro","mood":"festejo","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"festejo · se agacha","mood":"festejo","role":"other","ticks":2,"px":["........................","........................","........................","......oooooooooooo......","......ookkooookkoo......","....oooooooooooooooo....","......o.o......o.o......","........................"]},
{"name":"festejo · salta","mood":"festejo","role":"other","ticks":2,"px":[".y..oo............oo....","....oooooooooooooooob...","......ookkooookkoo......","b.....oooooooooooo.....r","......oooooooooooo...w..","...r..o.o......o.o......","......................y.","..w....................."]},
{"name":"festejo · aterriza","mood":"festejo","role":"other","ticks":2,"px":["..w.....................",".y......................","....................b...","......oooooooooooo......","b.....ookkooookkoo.....r","....oooooooooooooooo.w..","...r..o.o......o.o......","......................y."]},
{"name":"festejo · salta","mood":"festejo","role":"other","ticks":2,"px":["....oo............oo..y.","..w.oooooooooooooooo....",".y....ookkooookkoo......","......oooooooooooo..b...","......oooooooooooo......","b.....o.o......o.o.....r",".....................w..","...r...................."]},
{"name":"festejo · aterriza","mood":"festejo","role":"other","ticks":2,"px":["...r....................","......................y.","..w.....................",".y....oooooooooooo......","......ookkooookkoo..b...","....oooooooooooooooo....","b.....o.o......o.o.....r",".....................w.."]},
{"name":"festejo · salta","mood":"festejo","role":"other","ticks":2,"px":["....oo............oo.w..","...roooooooooooooooo....","......ookkooookkoo....y.","..w...oooooooooooo......",".y....oooooooooooo......","......o.o......o.o..b...","........................","b......................r"]},
{"name":"festejo · aterriza","mood":"festejo","role":"other","ticks":1,"px":["b......................r",".....................w..","...r....................","......oooooooooooo....y.","..w...ookkooookkoo......",".y..oooooooooooooooo....","......o.o......o.o..b...","........................"]},
{"name":"festejo · brazos arriba","mood":"festejo","role":"other","ticks":2,"px":["........................","b...oo............oo...r","....oooooooooooooooo.w..","...r..ookkooookkoo......","......oooooooooooo....y.","..w...oooooooooooo......",".y....o.o......o.o......","....................b..."]},
{"name":"festejo · brazos arriba","mood":"festejo","role":"other","ticks":2,"px":["....................b...","....oo............oo....","b...oooooooooooooooo...r","......ookkooookkoo...w..","...r..oooooooooooo......","......oooooooooooo....y.","..w...o.o......o.o......",".y......................"]},
{"name":"festejo · se asienta","mood":"festejo","role":"other","ticks":6,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"festejo · parpadea","mood":"festejo","role":"other","ticks":1,"px":["........................","........................","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"festejo · quieto","mood":"festejo","role":"other","ticks":3,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## dormir

Dormir en 8 filas, con los ojos en sombra. 4 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"dormir · exhala","mood":"dormir","role":"other","ticks":4,"px":["........................","........................","......oooooooooooo......","......ooddooooddoo......","....oooooooooooooooo....","......oooooooooooo..w...","......o.o......o.o......","........................"]},
{"name":"dormir · exhala","mood":"dormir","role":"other","ticks":4,"px":["........................","........................","......oooooooooooo......","......ooddooooddoo..www.","....oooooooooooooooo.w..","......oooooooooooo..www.","......o.o......o.o......","........................"]},
{"name":"dormir · inhala","mood":"dormir","role":"other","ticks":4,"px":["........................","......oooooooooooo...www","......ooddooooddoo....w.","......oooooooooooo...www","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"dormir · inhala","mood":"dormir","role":"other","ticks":4,"px":[".....................www","......oooooooooooo....w.","......ooddooooddoo...www","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## festejo 2

El festejo elegido (salto en diagonal), en 8 filas. 17 fotogramas, 28 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"festejo 2 · medio giro","mood":"festejo 2","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"festejo 2 · se prepara","mood":"festejo 2","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......","......d.o..d.o..........","........................"]},
{"name":"festejo 2 · despega","mood":"festejo 2","role":"other","ticks":1,"px":["........................","........................",".......dddoooooooooo....",".......dddookoooooko....",".......dddoooooooooo....",".......dddoooooooooo....","........o.o....o.o......","......o.o....o.o........"]},
{"name":"festejo 2 · vuela en diagonal","mood":"festejo 2","role":"other","ticks":2,"px":[".y.......dddoooooooooo..",".........dddookoooooko..",".........dddoooooooooo..","b........dddoooooooooo.r","............o.o....o.o..","...r....................","..............r.......y.","..w....................."]},
{"name":"festejo 2 · gira en el aire","mood":"festejo 2","role":"other","ticks":1,"px":["..w......doooooooooooo..",".y.......doookoooookoo..",".........dooooooooooooo.",".........doooooooooooo..","b........d.o.o.....o.o.r","........................","...r....................","..............r.......y."]},
{"name":"festejo 2 · de frente en el aire","mood":"festejo 2","role":"other","ticks":2,"px":["........oo............oo","..w.....oooooooooooooooo",".y........ookooooookoo..","..........oooooooooooo..","..........oooooooooooo..","b..........o.o....o.o..r",".....................w..","...r...................."]},
{"name":"festejo 2 · aterriza abierto","mood":"festejo 2","role":"other","ticks":2,"px":["...r....................","..............r.......y.","..w.......oooooooooooo..",".y........ookooooookoo..","........oooooooooooooooo","..........oooooooooooo..","b........o.o........o.o.","........................"]},
{"name":"festejo 2 · festeja · pata","mood":"festejo 2","role":"other","ticks":2,"px":[".....................w..","...r....oo............oo","........oooooooooooooooo","..w.......ookooooookoo..",".y........oooooooooooo..","..........oooooooooooo..",".........o..o......o.o..","b......................r"]},
{"name":"festejo 2 · festeja · otra pata","mood":"festejo 2","role":"other","ticks":2,"px":["b.......................","........oo...........woo","...r....oooooooooooooooo","..........ookooooookoo..","..w.......oooooooooooo..",".y........oooooooooooo..","..........o.o......ob.o.","........................"]},
{"name":"festejo 2 · gira de vuelta","mood":"festejo 2","role":"other","ticks":1,"px":["............y...........","b......................r","..........ooooooooooood.","...r......ookoooookoood.",".........oooooooooooood.","..w.......ooooooooooood.",".y........o.o.....o.o.d.","........................"]},
{"name":"festejo 2 · despega de vuelta","mood":"festejo 2","role":"other","ticks":1,"px":["....................b...","............y...........","b.........ooooooooooddd.","..........okoooookooddd.","...r......ooooooooooddd.","..........ooooooooooddd.","..w.........o.o....o.o..",".y............o.o....o.o"]},
{"name":"festejo 2 · vuelve en diagonal","mood":"festejo 2","role":"other","ticks":2,"px":[".y......ooooooooooddd...","........okoooookooddd...","........ooooooooooddd...","b.......ooooooooooddd..r","........o.o....o.o...w..","...r....................","..............r.......y.","..w....................."]},
{"name":"festejo 2 · cae","mood":"festejo 2","role":"other","ticks":1,"px":["........................","........................","......ooooooooooddd.....","......okoooookooddd.....","......ooooooooooddd.....","......ooooooooooddd.....",".......o.o....o.o.......",".....o.o....o.o........."]},
{"name":"festejo 2 · se da vuelta","mood":"festejo 2","role":"other","ticks":1,"px":["........................","........................","......ooooooooooood.....","......ookoooookoood.....",".....oooooooooooood.....","......ooooooooooood.....","......o.o.....o.o.d.....","........................"]},
{"name":"festejo 2 · se asienta · pata","mood":"festejo 2","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o..o.....","........................"]},
{"name":"festejo 2 · quieto","mood":"festejo 2","role":"other","ticks":4,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"festejo 2 · parpadea","mood":"festejo 2","role":"other","ticks":1,"px":["........................","........................","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## festejo actual

El festejo viejo de celdas y caracteres, pasado a píxeles como referencia. 21 fotogramas, 28 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"festejo actual · arriba 0","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","r....y............y....r","......oooooooooooo......","....ooookooooookoooob...","......oooooooooooo......","y.....oooooooooooo......",".......o.o....o.o.......","...y...................."]},
{"name":"festejo actual · arriba 1","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................",".....y............y....w","......oooooooooooo......","r...ooookooooookoooo...r","......oooooooooooo......","......oooooooooooo..b...",".......o.o....o.o.......","y......................."]},
{"name":"festejo actual · abajo 2","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","...yy..............y....","......oooooooooooo......","......ookooooookoo.....w","....oooooooooooooooo....","r.....oooooooooooo.....r","......o.o......o.o......","....................b..."]},
{"name":"festejo actual · abajo 3","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","y...y..............y....","......oooooooooooo......","...y..ookooooookoo......","....oooooooooooooooo....","......oooooooooooo.....w","......o.o......o.o......","r......................r"]},
{"name":"festejo actual · arriba 4","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................",".....y............y.b...","......oooooooooooo......","y...ooookooooookoooo....","......oooooooooooo......","...y..oooooooooooo......",".......o.o....o.o.......",".......................w"]},
{"name":"festejo actual · arriba 5","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","r....y............y....r","......oooooooooooo......","....ooookooooookoooob...","......oooooooooooo......","y.....oooooooooooo......",".......o.o....o.o.......","...y...................."]},
{"name":"festejo actual · abajo 6","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","....y..............y...w","......oooooooooooo......","r.....ookooooookoo.....r","....oooooooooooooooo....","......oooooooooooo..b...","......o.o......o.o......","y......................."]},
{"name":"festejo actual · abajo 7","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","...yy..............y....","......oooooooooooo......","......ookooooookoo.....w","....oooooooooooooooo....","r.....oooooooooooo.....r","......o.o......o.o......","....................b..."]},
{"name":"festejo actual · arriba 8","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","y....y............y.....","......oooooooooooo......","...yooookooooookoooo....","......oooooooooooo......","......oooooooooooo.....w",".......o.o....o.o.......","r......................r"]},
{"name":"festejo actual · arriba 9","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................",".....y............y.b...","......oooooooooooo......","y...ooookooooookoooo....","......oooooooooooo......","...y..oooooooooooo......",".......o.o....o.o.......",".......................w"]},
{"name":"festejo actual · abajo 10","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","r...y..............y...r","......oooooooooooo......","......ookooooookoo..b...","....oooooooooooooooo....","y.....oooooooooooo......","......o.o......o.o......","...y...................."]},
{"name":"festejo actual · abajo 11","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","....y..............y...w","......oooooooooooo......","r.....ookooooookoo.....r","....oooooooooooooooo....","......oooooooooooo..b...","......o.o......o.o......","y......................."]},
{"name":"festejo actual · arriba 12","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","...y.y............y.....","......oooooooooooo......","....ooookooooookoooo...w","......oooooooooooo......","r.....oooooooooooo.....r",".......o.o....o.o.......","....................b..."]},
{"name":"festejo actual · arriba 13","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","y....y............y.....","......oooooooooooo......","...yooookooooookoooo....","......oooooooooooo......","......oooooooooooo.....w",".......o.o....o.o.......","r......................r"]},
{"name":"festejo actual · abajo 14","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","....y..............yb...","......oooooooooooo......","y.....ookooooookoo......","....oooooooooooooooo....","...y..oooooooooooo......","......o.o......o.o......",".......................w"]},
{"name":"festejo actual · abajo 15","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","r...y..............y...r","......oooooooooooo......","......ookooooookoo..b...","....oooooooooooooooo....","y.....oooooooooooo......","......o.o......o.o......","...y...................."]},
{"name":"festejo actual · arriba 16","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................",".....y............y....w","......oooooooooooo......","r...ooookooooookoooo...r","......oooooooooooo......","......oooooooooooo..b...",".......o.o....o.o.......","y......................."]},
{"name":"festejo actual · arriba 17","mood":"festejo actual","role":"other","ticks":1,"px":["....y...................","...y.y............y.....","......oooooooooooo......","....ooookooooookoooo...w","......oooooooooooo......","r.....oooooooooooo.....r",".......o.o....o.o.......","....................b..."]},
{"name":"festejo actual · abajo 18","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","y...y..............y....","......oooooooooooo......","...y..ookooooookoo......","....oooooooooooooooo....","......oooooooooooo.....w","......o.o......o.o......","r......................r"]},
{"name":"festejo actual · abajo 19","mood":"festejo actual","role":"other","ticks":1,"px":["..................y.....","....y..............yb...","......oooooooooooo......","y.....ookooooookoo......","....oooooooooooooooo....","...y..oooooooooooo......","......o.o......o.o......",".......................w"]},
{"name":"festejo actual · se asienta (✓ listo)","mood":"festejo actual","role":"other","ticks":8,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## cool

Lote 3, en 8 filas, antes de pasarlo a 12. 10 fotogramas, 24 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"cool · levanta el brazo (momento…)","mood":"cool","role":"other","ticks":3,"px":["........................","........................","......oooooooooooo......","......ookooooookoooo....","....oooooooooooooo......","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"cool · se pone los lentes","mood":"cool","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......ookoookkkkkooo....","....ooooooooookkko......","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"cool · lentes puestos (todo en verde)","mood":"cool","role":"other","ticks":4,"px":["........................","........................","......oooooooooooo......","......okkkkkkkkkko......","....oookkkooookkkooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"cool · medio giro","mood":"cool","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....dokkkkkkkkkkk......",".....dookkkooookkko.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"cool · pose de lado","mood":"cool","role":"other","ticks":4,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cool · pose · golpea la pata","mood":"cool","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do..o......","........................"]},
{"name":"cool · pose de lado","mood":"cool","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cool · pose · golpea la pata","mood":"cool","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do..o......","........................"]},
{"name":"cool · pose de lado","mood":"cool","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cool · pose · golpea la pata","mood":"cool","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddokkkkkkkkk......",".....dddokkkoookkk......",".....dddoooooooooo......",".....do.o.o..do..o......","........................"]}
]}
```

## amor

Lote 3, en 8 filas, antes de pasarlo a 12. 9 fotogramas, 20 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"amor · quieto (…)","mood":"amor","role":"other","ticks":2,"px":["........................","........................","..oooooooooooo..........","..ookooooookoo..........","oooooooooooooooo........","..oooooooooooo..........","..o.o......o.o..........","........................"]},
{"name":"amor · respira hondo","mood":"amor","role":"other","ticks":4,"eyes":"shut","px":["........................","..oooooooooooo..........","..ookooooookoo..........","..oooooooooooo..........","oooooooooooooooo........","..oooooooooooo..........","..o.o......o.o..........","........................"]},
{"name":"amor · sonríe · corazón chico (¡de nada!)","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","........................","..oooooooooooo..........","..ookooooookoo.....r.r..","oooooooooooooooo....r...","..oooooooooooo..........","..o.o......o.o..........","........................"]},
{"name":"amor · late · grande","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","..................rr.rr.","..oooooooooooo...rrrrrrr","..ookooooookoo...rrrrrrr","oooooooooooooooo..rrrrr.","..oooooooooooo.....rrr..","..o.o......o.o......r...","........................"]},
{"name":"amor · late · chico","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","........................","..oooooooooooo.....r.r..","..ookooooookoo....rrrrr.","oooooooooooooooo...rrr..","..oooooooooooo......r...","..o.o......o..o.........","........................"]},
{"name":"amor · late · grande","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","..................rr.rr.","..oooooooooooo...rrrrrrr","..ookooooookoo...rrrrrrr","oooooooooooooooo..rrrrr.","..oooooooooooo.....rrr..","..o.o......o.o......r...","........................"]},
{"name":"amor · late · chico","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","........................","..oooooooooooo.....r.r..","..ookooooookoo....rrrrr.","oooooooooooooooo...rrr..","..oooooooooooo......r...","..o.o......o..o.........","........................"]},
{"name":"amor · late · grande","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","..................rr.rr.","..oooooooooooo...rrrrrrr","..ookooooookoo...rrrrrrr","oooooooooooooooo..rrrrr.","..oooooooooooo.....rrr..","..o.o......o.o......r...","........................"]},
{"name":"amor · late · chico","mood":"amor","role":"other","ticks":2,"eyes":"joy","px":["........................","........................","..oooooooooooo.....r.r..","..ookooooookoo....rrrrr.","oooooooooooooooo...rrr..","..oooooooooooo......r...","..o.o......o..o.........","........................"]}
]}
```

## idea

Lote 3, en 8 filas, antes de pasarlo a 12. 8 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"idea · ampolleta apagada (mmm…)","mood":"idea","role":"other","ticks":2,"px":["..........ssss..........","...........ss...........","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"idea · mira arriba","mood":"idea","role":"other","ticks":2,"px":["..........ssss..........","...........ss...........","......ookooooookoo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"idea · se prende (¡oh!)","mood":"idea","role":"other","ticks":2,"px":["........y.yyyy.y........","...........yy...........","......ookooooookoo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"idea · brazos arriba (¡idea!)","mood":"idea","role":"other","ticks":2,"eyes":"joy","px":["........y.yyyy.y........","....oo.....yy.....oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......",".....o..o......o.o......","........................"]},
{"name":"idea · brazos arriba · otra pata","mood":"idea","role":"other","ticks":2,"eyes":"joy","px":["..........yyyy..........","....oo.y...yy...y.oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......","......o.o......o..o.....","........................"]},
{"name":"idea · brilla","mood":"idea","role":"other","ticks":2,"px":["........y.yyyy.y........","...........yy...........","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"idea · brilla","mood":"idea","role":"other","ticks":2,"px":["..........yyyy..........",".......y...yy...y.......","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"idea · brilla","mood":"idea","role":"other","ticks":2,"px":["........y.yyyy.y........","...........yy...........","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## magia

Lote 3, en 8 filas, antes de pasarlo a 12. 8 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"magia · levanta la varita (abra…)","mood":"magia","role":"other","ticks":2,"px":["........................",".....................w..",".....dddoooooooooo..m...",".....dddookoooooko.m....",".....dddooooooooooo.....",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"magia · brilla la punta","mood":"magia","role":"other","ticks":2,"px":["......................y.",".....................w..",".....dddoooooooooo..m...",".....dddookoooooko.m....",".....dddooooooooooo.....",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"magia · agita (¡cadabra!)","mood":"magia","role":"other","ticks":2,"eyes":"joy","px":["........................","...................w....",".....dddoooooooooo.....y",".....dddookoooooko......",".....dddoooooooooommmmw.",".....dddoooooooooo......",".....do.o.o..do..o..b...","........................"]},
{"name":"magia · chispas (¡magia!)","mood":"magia","role":"other","ticks":2,"eyes":"joy","px":["......................r.",".....................y..",".....dddoooooooooo.w....",".....dddookoooooko.....y",".....dddoooooooooommmmw.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"magia · chispas (¡magia!)","mood":"magia","role":"other","ticks":2,"eyes":"joy","px":["....................b...","......................r.",".....dddoooooooooo...y..",".....dddookoooooko......",".....dddoooooooooommmmw.",".....dddoooooooooo......",".....do.o.o..do.o.......",".......................y"]},
{"name":"magia · chispas (¡magia!)","mood":"magia","role":"other","ticks":2,"px":[".......................y","....................b...",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooommmmw.",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"magia · chispas (¡magia!)","mood":"magia","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko....r.",".....dddoooooooooommmmw.",".....dddoooooooooo......",".....do.o.o..do.o......y","........................"]},
{"name":"magia · baja la varita","mood":"magia","role":"other","ticks":2,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]}
]}
```

## súper

Lote 3, en 8 filas, antes de pasarlo a 12. 12 fotogramas, 24 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"súper · medio giro (¡súper!)","mood":"súper","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"súper · aparece la capa","mood":"súper","role":"other","ticks":3,"px":["........................","........................",".....rrroooooooooo......","....rrrrookoooooko......","....rrrroooooooooo......","...rrrrroooooooooo......","...rrro.o.o..do.o.......","........................"]},
{"name":"súper · puño arriba · capa ondea (¡súper Clawd!)","mood":"súper","role":"other","ticks":2,"px":["..................oo....","..................oo....",".....rrroooooooooooo....","....rrrrookoooooko......","...rrrrroooooooooo......","..rrrrrroooooooooo......","...r.ro.o.o..do.o.......","........................"]},
{"name":"súper · puño arriba · capa ondea (¡súper Clawd!)","mood":"súper","role":"other","ticks":2,"px":["..................oo....","..................oo....",".....rrroooooooooooo....","...rrrrrookoooooko......","..rrrrrroooooooooo......","...rrrrroooooooooo......","..r..ro.o.o..do.o.......","........................"]},
{"name":"súper · puño arriba · capa ondea (¡súper Clawd!)","mood":"súper","role":"other","ticks":2,"px":["..................oo....","..................oo....",".....rrroooooooooooo....","....rrrrookoooooko......","...rrrrroooooooooo......","..rrrrrroooooooooo......","...r.ro.o.o..do.o.......","........................"]},
{"name":"súper · puño arriba · capa ondea (¡súper Clawd!)","mood":"súper","role":"other","ticks":2,"px":["..................oo....","..................oo....",".....rrroooooooooooo....","...rrrrrookoooooko......","..rrrrrroooooooooo......","...rrrrroooooooooo......","..r..ro.o.o..do.o.......","........................"]},
{"name":"súper · despega","mood":"súper","role":"other","ticks":2,"px":["........................","........................",".....rrroooooooooo......","....rrrrookoooooko......","...rrrrroooooooooo......","..rrrrrroooooooooo......","...r.r..o.o....o.o......","........................"]},
{"name":"súper · vuela","mood":"súper","role":"other","ticks":2,"eyes":"joy","px":["...rrrrrrroooooooooo....","..rrrrrrrrookoooookooo..","....rrrrrroooooooooo....",".......rrroooooooooo....","..........o.o....o.o....","........................","........................","........................"]},
{"name":"súper · vuela","mood":"súper","role":"other","ticks":2,"eyes":"joy","px":["..rrrrrrrroooooooooo....","...rrrrrrrookoooookooo..",".....rrrrroooooooooo....",".......rrroooooooooo....","..........o.o....o.o....","........................","........................","........................"]},
{"name":"súper · vuela","mood":"súper","role":"other","ticks":2,"eyes":"joy","px":["...rrrrrrroooooooooo....","..rrrrrrrrookoooookooo..","....rrrrrroooooooooo....",".......rrroooooooooo....","..........o.o....o.o....","........................","........................","........................"]},
{"name":"súper · aterriza","mood":"súper","role":"other","ticks":2,"px":["........................","........................",".....rrroooooooooo......","....rrrrookoooooko......","....rrrroooooooooo......","...rrrrroooooooooo......","...rrro.o.o..do.o.......","........................"]},
{"name":"súper · puño arriba","mood":"súper","role":"other","ticks":2,"px":["..................oo....","..................oo....",".....rrroooooooooooo....","...rrrrrookoooooko......","..rrrrrroooooooooo......","...rrrrroooooooooo......","..r..ro.o.o..do.o.......","........................"]}
]}
```

## mareo

Lote 3, en 8 filas, antes de pasarlo a 12. 18 fotogramas, 32 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"mareo · se sobresalta (¿eh?)","mood":"mareo","role":"other","ticks":2,"px":["....oo............oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......",".......o.o....o.o.......","........................","........................"]},
{"name":"mareo · se tambalea (mareado…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["......y.................","............w...........","....oooooooooooo........","....ookooooookoo........","..oooooooooooooooo......","....oooooooooooo........","....o.o......o..o.......","........................"]},
{"name":"mareo · se tambalea (mareado…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["........y...............","..............w.........","........oooooooooooo....","........ookooooookoo....","......oooooooooooooooo..","........oooooooooooo....",".......o..o......o.o....","........................"]},
{"name":"mareo · se tambalea (mareado…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["..........y.............","................w.......","....oooooooooooo........","....ookooooookoo........","..oooooooooooooooo......","....oooooooooooo........","....o.o......o..o.......","........................"]},
{"name":"mareo · se tambalea (mareado…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["............y...........","......w.................","........oooooooooooo....","........ookooooookoo....","......oooooooooooooooo..","........oooooooooooo....",".......o..o......o.o....","........................"]},
{"name":"mareo · se tambalea (mareado…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["..............y.........","........w...............","....oooooooooooo........","....ookooooookoo........","..oooooooooooooooo......","....oooooooooooo........","....o.o......o..o.......","........................"]},
{"name":"mareo · pierde el equilibrio (¡uy!)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["................y.......","......oo..w.............","......oooooooooooooo....","........ookooooookoo....","........oooooooooooooo..","........oooooooooooo....","........o.o......o..o...","........................"]},
{"name":"mareo · patas arriba (ay…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["......y.................","............w...........","......o.o......o..o.....","......oooooooooooo......","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","........................"]},
{"name":"mareo · patas arriba (ay…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["........y...............","..............w.........",".....o..o......o.o......","......oooooooooooo......","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","........................"]},
{"name":"mareo · patas arriba (ay…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["..........y.............","................w.......","......o.o......o..o.....","......oooooooooooo......","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","........................"]},
{"name":"mareo · patas arriba (ay…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["............y...........","......w.................",".....o..o......o.o......","......oooooooooooo......","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","........................"]},
{"name":"mareo · patas arriba (ay…)","mood":"mareo","role":"other","ticks":2,"eyes":"dizzy","px":["..............y.........","........w...............","......o.o......o..o.....","......oooooooooooo......","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","........................"]},
{"name":"mareo · se levanta (uf…)","mood":"mareo","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"mareo · parpadea","mood":"mareo","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]},
{"name":"mareo · se sacude","mood":"mareo","role":"other","ticks":1,"px":["........................","........................","....oooooooooooo........","....ookooooookoo........","..oooooooooooooooo......","....oooooooooooo........","....o.o......o.o........","........................"]},
{"name":"mareo · se sacude","mood":"mareo","role":"other","ticks":1,"px":["........................","........................","........oooooooooooo....","........ookooooookoo....","......oooooooooooooooo..","........oooooooooooo....","........o.o......o.o....","........................"]},
{"name":"mareo · se sacude","mood":"mareo","role":"other","ticks":1,"px":["........................","........................","....oooooooooooo........","....ookooooookoo........","..oooooooooooooooo......","....oooooooooooo........","....o.o......o.o........","........................"]},
{"name":"mareo · quieto","mood":"mareo","role":"other","ticks":1,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## baile

Lote 3, en 8 filas, antes de pasarlo a 12. 10 fotogramas, 16 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"baile · brazos arriba","mood":"baile","role":"other","ticks":2,"eyes":"joy","px":["........................","....oo............oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......",".....o..o......o.o......","........................"]},
{"name":"baile · brazos abajo","mood":"baile","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o..o.....","........................"]},
{"name":"baile · brazos arriba","mood":"baile","role":"other","ticks":2,"eyes":"joy","px":["........................","....oo............oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......","......o.o......o..o.....","........................"]},
{"name":"baile · salta","mood":"baile","role":"other","ticks":2,"eyes":"joy","px":["....oo............oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......",".......o.o....o.o.......","........................","........................"]},
{"name":"baile · gira · medio","mood":"baile","role":"other","ticks":1,"px":["........................","........................",".....doooooooooooo......",".....doookoooookoo......",".....dooooooooooooo.....",".....doooooooooooo......",".....d.o.o.....o.o......","........................"]},
{"name":"baile · gira · de lado","mood":"baile","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do..o......","........................"]},
{"name":"baile · gira · de lado al otro","mood":"baile","role":"other","ticks":1,"px":["........................","........................","......ooooooooooddd.....","......okoooookooddd.....","......ooooooooooddd.....","......ooooooooooddd.....","......o..od..o.o.od.....","........................"]},
{"name":"baile · gira · medio al otro","mood":"baile","role":"other","ticks":1,"px":["........................","........................","......ooooooooooood.....","......ookoooookoood.....",".....oooooooooooood.....","......ooooooooooood.....","......o.o.....o.o.d.....","........................"]},
{"name":"baile · brazos arriba","mood":"baile","role":"other","ticks":2,"eyes":"joy","px":["........................","....oo............oo....","....oooooooooooooooo....","......ookooooookoo......","......oooooooooooo......","......oooooooooooo......",".....o..o......o.o......","........................"]},
{"name":"baile · quieto","mood":"baile","role":"other","ticks":2,"px":["........................","........................","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","......oooooooooooo......","......o.o......o.o......","........................"]}
]}
```

## cocina

Lote 3, en 8 filas, antes de pasarlo a 12. 5 fotogramas, 8 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"cocina · en la sartén (cocinando código)","mood":"cocina","role":"other","ticks":2,"px":["......................s.",".....................s..",".....dddoooooooooo......",".....dddookoooooko...yr.",".....dddoooooooooogggggg",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cocina · levanta la sartén","mood":"cocina","role":"other","ticks":1,"px":["........................",".....................yr.",".....dddoooooooooo......",".....dddookoooookogggggg",".....dddoooooooooo......",".....dddoooooooooo......",".....do.o.o..do..o......","........................"]},
{"name":"cocina · arriba","mood":"cocina","role":"other","ticks":2,"px":[".....................yr.","........................",".....dddoooooooooo......",".....dddookoooooko......",".....dddoooooooooogggggg",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cocina · baja","mood":"cocina","role":"other","ticks":1,"px":["........................","........................",".....dddoooooooooo...yr.",".....dddookoooooko......",".....dddoooooooooogggggg",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]},
{"name":"cocina · cae y chisporrotea","mood":"cocina","role":"other","ticks":2,"px":[".....................s..","......................s.",".....dddoooooooooo......",".....dddookoooooko...yr.",".....dddoooooooooogggggg",".....dddoooooooooo......",".....do.o.o..do.o.......","........................"]}
]}
```

## reposo alto

Muestra alta: patas de 2/3, panza en sombra, respiración de a octavos. No se usa. 22 fotogramas, 52 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"reposo alto · quieto","mood":"reposo alto","role":"other","ticks":6,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]},
{"name":"reposo alto · inhala 1/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"}]},
{"name":"reposo alto · inhala 2/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"}]},
{"name":"reposo alto · inhala 3/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"}]},
{"name":"reposo alto · sostiene","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"}]},
{"name":"reposo alto · exhala 2/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"}]},
{"name":"reposo alto · exhala 1/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"}]},
{"name":"reposo alto · quieto","mood":"reposo alto","role":"other","ticks":6,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]},
{"name":"reposo alto · parpadea","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......ookooooookoo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[]},
{"name":"reposo alto · quieto","mood":"reposo alto","role":"other","ticks":8,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]},
{"name":"reposo alto · inhala 1/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"}]},
{"name":"reposo alto · inhala 2/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"}]},
{"name":"reposo alto · inhala 3/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"}]},
{"name":"reposo alto · sostiene","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":3,"color":"o"}]},
{"name":"reposo alto · exhala 2/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":2,"color":"o"}]},
{"name":"reposo alto · exhala 1/8","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":3,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":4,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":5,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":6,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":7,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"},{"x":8,"y":0,"grid":"eighths","from":"bottom","level":1,"color":"o"}]},
{"name":"reposo alto · medio giro","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................",".....d11oooooooooo......",".....d11oooooooooo......",".....d11oooooooooo......",".....d11ooooooooooo.....",".....d11ooooooooooo.....",".....d11dddddddddd......",".....d.o.o.....o.o......",".....d.o.o.....o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]},
{"name":"reposo alto · mira al lado","mood":"reposo alto","role":"other","ticks":8,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....do.o.o..do.o.......",".....do.o.o..do.o.......","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]},
{"name":"reposo alto · parpadea de lado","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211koooooko......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....do.o.o..do.o.......",".....do.o.o..do.o.......","........................"],"cells":[]},
{"name":"reposo alto · mira al lado","mood":"reposo alto","role":"other","ticks":4,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....do.o.o..do.o.......",".....do.o.o..do.o.......","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]},
{"name":"reposo alto · medio giro","mood":"reposo alto","role":"other","ticks":1,"px":["........................","........................","........................",".....d11oooooooooo......",".....d11oooooooooo......",".....d11oooooooooo......",".....d11ooooooooooo.....",".....d11ooooooooooo.....",".....d11dddddddddd......",".....d.o.o.....o.o......",".....d.o.o.....o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ok"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]},
{"name":"reposo alto · quieto","mood":"reposo alto","role":"other","ticks":4,"px":["........................","........................","........................","......oooooooooooo......","......oooooooooooo......","......oooooooooooo......","....oooooooooooooooo....","....oooooooooooooooo....","......dddddddddddd......","......o.o......o.o......","......o.o......o.o......","........................"],"cells":[{"x":4,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":7,"y":1,"grid":"quarters","px":["oo","ok"]}]}
]}
```

## caminata alta

Muestra alta de la caminata, con el costado degradado. No se usa. 4 fotogramas, 4 ticks.

```json
{"kind":"clawd-perfil","frames":[
{"name":"caminata alta · paso 1","mood":"caminata alta","role":"other","ticks":1,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....d.o.o.od.o.o.......",".......o...o..o.........","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]},
{"name":"caminata alta · paso 2","mood":"caminata alta","role":"other","ticks":1,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....do.o.o..do.o.......",".....do.o.o..do.o.......","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]},
{"name":"caminata alta · paso 3","mood":"caminata alta","role":"other","ticks":1,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......","......d.o.o..d.o.o......","......d...o..d...o......","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]},
{"name":"caminata alta · paso 4","mood":"caminata alta","role":"other","ticks":1,"px":["........................","........................","........................",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211oooooooo......",".....d2211dddddddd......",".....d.o.d.od..o.o......",".....d...d..d..o........","........................"],"cells":[{"x":5,"y":1,"grid":"quarters","px":["oo","ko"]},{"x":8,"y":1,"grid":"quarters","px":["oo","ko"]}]}
]}
```

