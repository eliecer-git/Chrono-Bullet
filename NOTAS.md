# Chrono Bullet - Notas del Proyecto

## 1. Descripción del Juego
**Chrono Bullet** es un shooter en primera persona (FPS) en 3D desarrollado sobre la web con estilo cartoon limpio y estilizado (look premium sci-fi / Fortnite AAA) y mecánicas centrales centradas en el control y la manipulación del tiempo.

---

## 2. Armas del Juego (6 Armas)
1. **Pistola táctica (`pistol`)**: Ligera, corredera clara de alto contraste con acentos dorados y marcas de reloj.
2. **Subfusil Vector (`smg`)**: Compacto, cadencia rápida, chasis aerodinámico con emblema cronográfico y cámara expuesta.
3. **Fusil de asalto SCAR / M4 (`rifle`)**: Balanceado para distancias medias, detalles de reloj en el recibidor y cargador curvo.
4. **Escopeta pesada (`shotgun`)**: De alto impacto a corta distancia, cuerpo macizo con corredera acanalada y contrastes limpios.
5. **Rifle francotirador pesado (`sniper`)**: Cañón largo y delgado, bípode plegado, cerrojo rotativo y mira telescópica con lente cronográfica.
6. **Cañón de plasma (`plasma`)**: Arma especial pesada de 5 proyectiles, cuerpo en gris platino, negro carbón y oro, recámara abierta con orbe magenta hiper-luminoso, anillo de reloj giratorio en 3D e indicador diegético de munición de 5 segmentos en el lateral del cuerpo.

---

## 3. Qué hace cada archivo
*(Esta sección debe mantenerse actualizada cada vez que se cree o modifique un archivo)*

- **`index.html`**: Estructura principal del juego, contenedor del lienzo 3D (canvas), interfaz de usuario (HUD de salud, munición, tiempo y menús).
- **`style.css`**: Hojas de estilo para la interfaz de usuario, tipografías, animaciones de pantalla, menús y elementos superpuestos del HUD.
- **`armas/pistola.js`**: Módulo 3D de la pistola táctica Chrono (geometría, materiales PBR, corredera, armazón y detalles cronográficos).
- **`armas/subfusil.js`**: Módulo 3D del subfusil Vector Chrono (geometría aerodinámica, emblema cronográfico, cargador extendido y culata retráctil).
- **`game.js`**: Núcleo lógico del juego: bucle principal (game loop), física, control del jugador en primera persona, cámara, construcción procedural 3D de todas las armas, enemigos, proyectiles, efectos de partículas, shaders estilizados y sistema de tiempo.
- **`audio.js`**: Gestor de audio y efectos de sonido sintetizados y procedurales (disparos, recargas, impactos, habilidades temporales).
- **`three.min.js`**: Biblioteca Three.js para renderizado de gráficos 3D acelerados por GPU vía WebGL.
- **`mapa 10.mp4`**: Recurso multimedia de fondo/video para la ambientación o menú.
- **`iniciar_servidor.bat`**: Script de ejecución rápida para Windows para levantar el servidor local de desarrollo.
- **`serve.ps1`**: Script de PowerShell para servir los archivos localmente mediante HTTP con soporte MIME adecuado.
- **`.gitignore`**: Exclusiones de Git para evitar subir dependencias, temporales, logs y archivos del sistema operativo.
- **`NOTAS.md`**: Registro central del proyecto con descripción, listado de armas, funciones de archivos, reglas de trabajo y lista de tareas pendientes.

---

## 4. Reglas de Trabajo
1. **Una sola cosa a la vez:** Trabajar en una sola tarea por vez (un arma específica o una sola función).
2. **Cero modificaciones no relacionadas:** Nunca modificar archivos que no tengan que ver directamente con la tarea pedida.
3. **Avisar antes de cambios grandes:** Antes de realizar cambios de envergadura, indicar explícitamente qué archivos se van a tocar y el motivo.
4. **Commits frecuentes y claros:** Al terminar cada tarea solicitada, realizar un commit en Git con un mensaje descriptivo y claro.
5. **Guía de estilo obligatoria:** Leer y seguir estrictamente `GUIA_ESTILO_ARMAS.md` antes de crear o retocar cualquier arma del juego (paletas de color, biseles, acento emisivo, niveles de valor y símbolo de reloj/engranaje).

---

## 5. Pendientes
- [ ] Shop con skins para armas y personajes.
- [ ] Editor de colores por bloques para personalización de armas.
- [ ] Sistema de niveles y progresión.
- [ ] Monedas / economía dentro del juego.
- [ ] Zona segura (Safe Zone).
- [ ] Vida en porcentaje *(dejar para el final)*.
- [ ] Compra de balas / munición *(dejar para el final)*.
