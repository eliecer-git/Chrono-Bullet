# Cofres (Cyber Chests)

Clase `CyberChest3D` en `game.js` (sección 10).

## Cómo funcionan
1. El jugador se acerca a menos de **2.8 m** del cofre.
2. Aparece un anillo holográfico dorado encima.
3. Mantiene **E** (o el botón táctil del cofre en el celular) durante **1.1 segundos**.
4. Mientras lo mantiene, **el tiempo corre a velocidad normal** (abrir un cofre es arriesgado).
5. Si suelta, el progreso baja poco a poco.
6. Al completarse, la tapa se abre y sale un arma saltando del cofre.
7. Si el jugador no tiene arma o se quedó sin balas, la recoge automáticamente.

## Qué arma sale (sorteo con pesos)
| Arma | Probabilidad |
|---|---|
| Rifle de asalto (24 balas) | 35 % |
| Escopeta (4 balas) | 30 % |
| Francotirador (5 balas) | 20 % |
| Cañón de plasma (5 balas) | 15 % |

## Aspecto
- Caja metálica azul muy oscuro, con banda dorada neón y tapa con bisagra.
- Luz dorada (solo en PC, en celular se quita para rendimiento).

## Cofres por mapa
| Mapa | Cofres (arma indicada en el mapa) |
|---|---|
| 01 El pasillo | 1 (rifle) |
| 02 Sala de pilares | 1 (francotirador) |
| 03 Almacén de escopetas | 1 (plasma) |
| 04 Cruce cyberpunk | 2 (rifle, francotirador) |
| 05 Búnker del núcleo | 2 (plasma, francotirador) |
| 06 Catedral de hielo | 1 (francotirador) |
| 07 Laberinto de espejos | 2 (plasma, rifle) |
| 08 Fortaleza en ruinas | 2 (francotirador, plasma) |
| 09 Cámara circular | 2 (francotirador, plasma) |
| 10 El abismo final | 4 (plasma, francotirador, rifle, plasma) |

## ⚠️ Detalle importante
Cada mapa dice qué arma lleva su cofre (`loot`), pero al abrirlo el código **ignora eso y sortea** de la tabla de arriba. Hay que decidir cuál de las dos cosas se quiere y pedírselo a Antigravity.

## Ideas pendientes
- [ ] Cofres de distinta rareza (común / épico / legendario) con colores distintos.
- [ ] Que el subfusil también pueda salir.
- [ ] Cofres que den munición, botiquines o monedas.
