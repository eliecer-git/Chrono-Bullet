# Guía de estilo de armas — Chrono Bullet

`NOTAS.md` pide leer este archivo antes de crear o retocar cualquier arma. Resume el estilo que ya usan los 6 módulos de `armas/`.

## Estilo general
- Cartoon 3D limpio y estilizado, look sci-fi premium (tipo Fortnite AAA).
- Formas con **biseles y chaflanes**: nada de cajas planas, sobre todo en la parte que mira a la cámara.
- Siluetas claras y fáciles de reconocer desde lejos.
- Tema del juego: **el tiempo**. Toda arma lleva un símbolo de reloj o engranaje (esfera con números romanos, reloj de bolsillo, anillo giratorio, lente de reloj).

## Paleta (máximo 3 colores base + 1 emisivo)
1. **Zona clara** (parte superior / corredera): beige, marfil, tan, gris platino o rojo según el arma.
2. **Zona oscura** (armazón, empuñadura, interiores): negro azulado `0x0c111d` aprox.
3. **Acento cálido** (bordes, reloj, gatillo): dorado `0xe8c14a` o cobre `0xe8922b`.
4. **Emisivo** (energía temporal, franjas que brillan): turquesa `0x2fe0d0` (el plasma usa magenta `0xff0a85`).

## Reglas técnicas para Antigravity
- Colores agrupados al inicio del módulo como constantes.
- Cada pieza con nombre (`mesh.name`).
- Respetar las 5 skins: `skin_default`, `skin_gold`, `skin_vortex`, `skin_matrix`, `skin_inferno`.
- Usar `createStylizedPBR` + `applyFortniteShader` del `ctx`.
- Piezas animadas con nombre propio para que `game.js` no las fusione.
- Evitar z-fighting: dejar holgura (~0.003) entre capas o usar `polygonOffset`.
- Pensar en el celular: compartir materiales para que se fusionen en pocas llamadas de dibujo.
