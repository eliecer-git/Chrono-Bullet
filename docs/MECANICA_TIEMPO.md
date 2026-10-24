# Mecánica central: el tiempo se mueve cuando tú te mueves

> Inspiración: SUPERHOT. Si el jugador se queda quieto, todo el mundo se ralentiza
> (balas, enemigos, partículas). Si se mueve, el tiempo vuelve a la normalidad.

## Cómo funciona hoy (según `game.js`)

| Situación del jugador | Velocidad del tiempo (`targetTimeScale`) |
|---|---|
| Quieto (no presiona WASD / flechas / joystick) | **0.04** (4 % de la velocidad normal) — `TIME_SCALE_STOPPED` |
| Caminando / moviéndose | **1.0** (velocidad normal) — `TIME_SCALE_ACTIVE` |
| Abriendo un cofre (manteniendo E) | **1.0** (abrir un cofre "cuesta" tiempo) |
| Apuntando con la mira (ADS) | **0.01** (casi congelado) |

- El cambio no es brusco: se suaviza con `TIME_LERP_SPEED = 0.22` cada fotograma.
- La cámara y el movimiento del jugador **no** se ralentizan, solo el mundo.
- El audio acompaña: `chronoAudio.updateDrone(timeScale)` cambia el zumbido de fondo según la velocidad del tiempo.
- Algunos efectos visuales (destellos, humo) usan el tiempo real para desaparecer al instante.

## Dónde está en el código
- Constantes: `game.js`, sección 1 (`TIME_SCALE_STOPPED`, `TIME_SCALE_ACTIVE`, `TIME_LERP_SPEED`).
- Cálculo por fotograma: bucle principal, bloque "Cálculo de dilatación temporal".
- Cada objeto (bala, enemigo, partícula) recibe `update(dt, timeScale)` y multiplica `dt * timeScale`.

## Reglas de diseño (no romper)
1. Quedarse quieto **siempre** debe dar ventaja para pensar y esquivar.
2. Moverse **siempre** debe tener un costo (los enemigos y balas avanzan).
3. Cualquier arma, enemigo o efecto nuevo debe usar `dt * timeScale`, nunca `dt` solo (salvo efectos de interfaz).

## Ideas pendientes (para discutir con ChatGPT)
- [ ] Habilidad "congelar tiempo" por unos segundos con recarga.
- [ ] Barra visual en el HUD que muestre la velocidad del tiempo.
- [ ] Enemigos especiales que NO se ralentizan.
