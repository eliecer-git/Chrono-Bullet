# Las 6 armas de Chrono Bullet

Datos sacados de `game.js` (`WEAPONS_BASE` y la función de disparo). Si cambias un valor en el código, actualiza esta tabla.

| # | Arma | Clave en código | Rareza | Cargador | Reserva | Recarga | Daño por bala | Velocidad bala | Módulo 3D | Modelo .glb |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pistola táctica 9mm | `pistol` | Común (gris) | 15 | 60 / 120 | 1.2 s | 1 | 48 | `armas/pistola.js` | `pistola tactica.glb` |
| 2 | Subfusil Vector | `smg` | Poco común (verde) | 30 | 120 / 240 | 1.4 s | 1 | 58 | `armas/subfusil.js` | `subfusil automatico.glb` |
| 3 | Fusil de asalto SCAR/M4 | `rifle` | Épica (morado) | 30 | 120 / 240 | 1.6 s | 1 | 62 | `armas/fusil.js` | `rifle de asalto.glb` |
| 4 | Escopeta de combate | `shotgun` | Rara (azul) | 6 | 24 / 48 | 1.8 s | 1 × 6 perdigones | 44–50 | `armas/escopeta.js` | `escopeta.glb` |
| 5 | Francotirador pesado | `sniper` | Legendaria (dorado) | 5 | 15 / 30 | 2.2 s | **2** | 95 | `armas/francotirador.js` | `franco rirador.glb` |
| 6 | Cañón de plasma | `plasma` | Legendaria (magenta) | 5 | 15 / 30 | 2.2 s | **2** (bala grande) | 34 | `armas/canon_plasma.js` | `cañon de plasma.glb` |

## Ficha rápida de cada arma

### 1. Pistola táctica (`pistol`)
- Rol: arma inicial en casi todos los mapas. Precisa, sin dispersión.
- Colores: beige marfil (corredera), azul oscuro (armazón), cobre/dorado (acentos), turquesa emisivo (energía).
- Imagen de referencia: `imagenes de referencia 3D/pistola tactica.png`.

### 2. Subfusil Vector (`smg`)
- Rol: cadencia rápida, poca dispersión, corta-media distancia.
- Colores: azul cobalto + cobre/naranja + dorado.
- Imagen de referencia: `Gemini_Generated_Image_60ydib...png` (Vector blanco, azul marino y oro con reloj).

### 3. Fusil de asalto (`rifle`)
- Rol: balanceado para media distancia.
- Colores: tan/arena (tipo SCAR) + negro + acero + dorado (reloj de bolsillo en el lateral).
- Imagen de referencia: `Gemini_Generated_Image_e4ge4p...png` (SCAR arena con reloj de bolsillo).

### 4. Escopeta (`shotgun`)
- Rol: mucho daño a corta distancia, 6 perdigones con dispersión.
- Colores: rojo oscuro + dorado + negro azulado + grafito + turquesa emisivo.

### 5. Francotirador (`sniper`)
- Rol: larga distancia, bala muy rápida y de doble daño.
- Colores: "Edición Prestigio" negro y oro, cobre, acento turquesa. Mira con lente de reloj.

### 6. Cañón de plasma (`plasma`)
- Rol: arma especial pesada. Bala lenta, enorme y de doble daño. No expulsa casquillos.
- Colores: gris platino, grafito, negro azulado, magenta brillante.
- Detalles únicos: orbe de plasma, anillo de reloj giratorio, indicador de 5 balas en el lateral (`balaIndicador_1` a `_5`).
- Imagen de referencia: `imagenes de referencia 3D/plasma gun.png`. Archivo Blender: `corrección de plasma gun.blend`.

## Skins existentes
`skin_default`, `skin_gold`, `skin_vortex`, `skin_matrix`, `skin_inferno`. Cada módulo de arma cambia su paleta según la skin activa.

## ⚠️ Cosas que no cuadran (revisar con Antigravity)
- Los nombres cambian según el lugar: la escopeta aparece como "ESCOPETA DE COMBATE", "ESCOPETA DE ASALTO" y "ESCOPETA DE PLASMA"; el fusil como "FUSIL DE ASALTO M4" y "RIFLE DE ASALTO".
- Las balas tampoco cuadran: en los mapas el rifle trae 24 y la escopeta 4, pero en `WEAPONS_BASE` son 30 y 6.
- El subfusil (`smg`) no sale nunca en los cofres.
