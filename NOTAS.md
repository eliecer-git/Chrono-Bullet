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

- **`index.html`**: Estructura principal del juego, contenedor del lienzo 3D (canvas), interfaz de usuario (HUD de salud, munición, tiempo y menús). Incluye la pantalla de acceso (`screen-login`: Google, Cuenta Chrono e Invitado) y el botón de cerrar sesión del menú.
- **`style.css`**: Hojas de estilo para la interfaz de usuario, tipografías, animaciones de pantalla, menús y elementos superpuestos del HUD.
- **`armas/pistola.js`**: Módulo 3D de la pistola táctica Chrono (geometría, materiales PBR, corredera, armazón y detalles cronográficos).
- **`armas/subfusil.js`**: Módulo 3D del subfusil Vector Chrono (geometría aerodinámica, emblema cronográfico, cargador extendido y culata retráctil).
- **`armas/fusil.js`**: Módulo 3D del fusil de asalto SCAR / M4 Chrono (vial de taquiones, engranajes cronográficos, cargador curvo y culata telescópica).
- **`armas/francotirador.js`**: Módulo 3D del rifle de francotirador Chrono (chasis negro y oro, cañón largo, bípode plegado, cerrojo y mira telescópica con lente de reloj).
- **`armas/escopeta.js`**: Módulo 3D de la escopeta pesada Chrono (chasis rojo oscuro con bordes dorados, zonas profundas negro azulado, acentos turquesa emisivos, culata ergonómica biselada, tambor acentuado, símbolo de reloj frontal y doble cañón macizo).
- **`armas/canon_plasma.js`**: Módulo 3D del cañón de plasma Chrono (carcasa platino/gris claro, núcleo de plasma suspendido, anillo de reloj 3D giratorio, bobinas magnéticas, tobera tipo embudo y consola diegética con 5 segmentos luminosos `balaIndicador_1` a `5`).
- **`game.js`**: Núcleo lógico del juego: sesión de usuario (invitado y cerrar sesión; el progreso de invitado vive en `localStorage` del dispositivo), bucle principal (game loop), física, control del jugador en primera persona, cámara, construcción procedural 3D de todas las armas, enemigos, proyectiles, efectos de partículas, shaders estilizados, sistema de tiempo, optimización por batching/fusión de geometrías estáticas, reciclado de materiales y modo de alto rendimiento móvil con panel de depuración (FPS, draw calls, triángulos).
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

## 5. Optimización y Rendimiento Móvil
- **Detección automática de móvil:** Limita `pixelRatio` a 1.0 máx, apaga antialias costoso y desactiva sombras dinámicas complejas.
- **Materiales y Shaders:** En modo móvil conmuta PBR pesado a `MeshLambertMaterial` / sin `onBeforeCompile` GLSL para aliviar GPUs móviles como Mali G52 (Redmi 10).
- **Fusión de Geometrías (Batching):** Combina mallas estáticas de cada arma con material compartido, reduciendo drásticamente las llamadas de dibujo (draw calls) y preservando los elementos dinámicos (`balaIndicador`, anillos de reloj).
- **Monitor de Rendimiento:** Panel accesible con botón "STATS" o tecla `F3`, que mide FPS en tiempo real, draw calls (`renderer.info.render.calls`) y triángulos (`renderer.info.render.triangles`).

---

## 6. Pendientes
- [ ] Shop con skins para armas y personajes.
- [ ] Editor de colores por bloques para personalización de armas.
- [ ] Sistema de niveles y progresión.
- [ ] Monedas / economía dentro del juego.
- [ ] Zona segura (Safe Zone).
- [ ] Vida en porcentaje *(dejar para el final)*.
- [ ] Compra de balas / munición *(dejar para el final)*.

