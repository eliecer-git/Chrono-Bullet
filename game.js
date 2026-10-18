/**
 * CHRONO BULLET - 3D FIRST PERSON SHOOTER ENGINE (SUPERHOT INSPIRED)
 * Built with Three.js (WebGL), Native JavaScript & Web Audio API
 * Features: 3D FPS Camera, Time Dilation, Faceted Red Crystal Enemies,
 * Multi-colored Energy Weapons, 3D Interactive Cyber Chests, 3/5 Lives System.
 */

(function () {
  'use strict';

  // ========================================================
  // 1. CONFIGURACIÓN Y CONSTANTES DEL MOTOR 3D
  // ========================================================
  const TIME_SCALE_STOPPED = 0.04;
  const TIME_SCALE_ACTIVE = 1.0;
  const TIME_LERP_SPEED = 0.22;
  const PLAYER_HEIGHT = 1.7; // metros de altura de ojos
  const PLAYER_RADIUS = 0.45; // radio de colisión del jugador

  // Paletas globales de color (5 Temas)
  const THEME_PALETTES = {
    cyan: {
      key: 'cyan', name: 'CIAN',
      primaryHex: 0x00f0ff, primaryCss: '#00f0ff',
      glowCss: 'rgba(0, 240, 255, 0.85)',
      bulletHex: 0x00f0ff, muzzleHex: 0x00f0ff,
      reticleCss: '#00f0ff'
    },
    crimson: {
      key: 'crimson', name: 'ROJO',
      primaryHex: 0xff2052, primaryCss: '#ff2052',
      glowCss: 'rgba(255, 32, 82, 0.85)',
      bulletHex: 0xff3366, muzzleHex: 0xff2052,
      reticleCss: '#ff2052'
    },
    white: {
      key: 'white', name: 'BLANCO',
      primaryHex: 0xffffff, primaryCss: '#f8fafc',
      glowCss: 'rgba(255, 255, 255, 0.9)',
      bulletHex: 0xffffff, muzzleHex: 0xffffff,
      reticleCss: '#ffffff'
    },
    purple: {
      key: 'purple', name: 'PÚRPURA',
      primaryHex: 0xd946ef, primaryCss: '#d946ef',
      glowCss: 'rgba(217, 70, 239, 0.85)',
      bulletHex: 0xe879f9, muzzleHex: 0xd946ef,
      reticleCss: '#d946ef'
    },
    amber: {
      key: 'amber', name: 'ÁMBAR',
      primaryHex: 0xf59e0b, primaryCss: '#f59e0b',
      glowCss: 'rgba(245, 158, 11, 0.85)',
      bulletHex: 0xfbbf24, muzzleHex: 0xf59e0b,
      reticleCss: '#f59e0b'
    }
  };

  let currentGlobalTheme = 'cyan';
  try {
    const savedTheme = localStorage.getItem('chrono_theme');
    if (savedTheme && THEME_PALETTES[savedTheme]) {
      currentGlobalTheme = savedTheme;
    }
  } catch (e) {}

  function applyGlobalTheme(themeKey) {
    if (!THEME_PALETTES[themeKey]) themeKey = 'cyan';
    currentGlobalTheme = themeKey;
    try {
      localStorage.setItem('chrono_theme', themeKey);
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', themeKey);

    document.querySelectorAll('.palette-btn').forEach(btn => {
      if (btn.getAttribute('data-color') === themeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const pal = THEME_PALETTES[themeKey];
    const crosshair = document.getElementById('fps-crosshair');
    if (crosshair) {
      crosshair.style.setProperty('--reticle-color', pal.reticleCss);
    }

    if (player && player.viewWeapon) {
      player.updateViewWeaponModel();
    }
  }

  // ========================================================
  // 2. DEFINICIÓN DE LOS 5 MAPAS TÁCTICOS EN 3D
  // ========================================================
  // Dimensiones en metros: Salas de ~32m x 22m x 4.5m
  const MAPS_3D = [
    {
      id: 0,
      name: "MAPA 01: EL PASILLO 3D",
      subtitle: "LABORATORIO CLÍNICO",
      difficulty: "FÁCIL",
      theme: 'lab',
      playerSpawn: { x: -12, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 32, d: 20, h: 4.5 },
      walls: [
        // Columnas monolíticas centrales
        { x: 0, z: -3.5, w: 2.2, d: 5.5, h: 4.5 },
        { x: 0, z: 3.5, w: 2.2, d: 5.5, h: 4.5 }
      ],
      enemies: [
        { x: 8, z: -3.5, weapon: 'pistol', rotY: Math.PI / 2 },
        { x: 10, z: 0, weapon: 'shotgun', rotY: Math.PI / 2 },
        { x: 8.5, z: 3.5, weapon: 'pistol', rotY: Math.PI / 2 }
      ],
      groundWeapons: [],
      chests: [
        { x: 0, z: 8.5, loot: { type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24 } }
      ]
    },
    {
      id: 1,
      name: "MAPA 02: SALA DE PILARES 3D",
      subtitle: "NEON NOIR",
      difficulty: "MEDIA",
      theme: 'neon',
      playerSpawn: { x: -12, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 32, d: 22, h: 4.8 },
      walls: [
        // 4 pilares tácticos masivos
        { x: -5, z: -4.5, w: 2.8, d: 2.8, h: 4.8 },
        { x: -5, z: 4.5, w: 2.8, d: 2.8, h: 4.8 },
        { x: 5, z: -4.5, w: 2.8, d: 2.8, h: 4.8 },
        { x: 5, z: 4.5, w: 2.8, d: 2.8, h: 4.8 }
      ],
      enemies: [
        { x: -1, z: -6.5, weapon: 'pistol', rotY: Math.PI / 2 },
        { x: -1, z: 6.5, weapon: 'pistol', rotY: Math.PI / 2 },
        { x: 8, z: -4, weapon: 'rifle', rotY: Math.PI / 2 },
        { x: 11, z: 2, weapon: 'shotgun', rotY: Math.PI / 2 }
      ],
      groundWeapons: [],
      chests: [
        { x: 0, z: 0, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } }
      ]
    },
    {
      id: 2,
      name: "MAPA 03: ALMACÉN DE ESCOPETAS 3D",
      subtitle: "COMPLEJO INDUSTRIAL",
      difficulty: "DIFÍCIL",
      theme: 'industrial',
      playerSpawn: { x: -12, y: 0, z: -5, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 34, d: 22, h: 5.0 },
      walls: [
        // Pasillos laberínticos de almacén
        { x: -7, z: -2, w: 1.5, d: 10, h: 5.0 },
        { x: -2, z: 4, w: 10, d: 1.5, h: 5.0 },
        { x: 4, z: -2, w: 1.5, d: 11, h: 5.0 },
        { x: 9, z: 3, w: 1.5, d: 8, h: 5.0 }
      ],
      enemies: [
        { x: -2, z: -5.5, weapon: 'shotgun', rotY: Math.PI / 2 },
        { x: 2, z: 2, weapon: 'pistol', rotY: Math.PI / 2 },
        { x: 7, z: 6, weapon: 'rifle', rotY: Math.PI / 2 },
        { x: 12, z: -4, weapon: 'shotgun', rotY: Math.PI / 2 }
      ],
      groundWeapons: [
        { x: -9, z: 6, type: 'shotgun', name: 'ESCOPETA DE ASALTO', ammo: 4, maxAmmo: 4 }
      ],
      chests: [
        { x: 12, z: 7, loot: { type: 'plasma', name: 'CAÑÓN DE PLASMA', ammo: 5, maxAmmo: 5 } }
      ]
    },
    {
      id: 3,
      name: "MAPA 04: CRUCE CYBERPUNK 3D",
      subtitle: "INTERSECCIÓN URBANA",
      difficulty: "EXPERTO",
      theme: 'crossroads',
      playerSpawn: { x: -13, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 36, d: 24, h: 6.0 },
      walls: [
        // Esquinas de edificios que forman la encrucijada
        { x: -7, z: -7, w: 6, d: 6, h: 6.0 },
        { x: 7, z: -7, w: 6, d: 6, h: 6.0 },
        { x: -7, z: 7, w: 6, d: 6, h: 6.0 },
        { x: 7, z: 7, w: 6, d: 6, h: 6.0 },
        // Coberturas bajas tácticas
        { x: 0, z: -3.5, w: 2.5, d: 1.2, h: 1.4 },
        { x: 0, z: 3.5, w: 2.5, d: 1.2, h: 1.4 }
      ],
      enemies: [
        { x: 0, z: -8.5, weapon: 'rifle', rotY: 0 },
        { x: 0, z: 8.5, weapon: 'shotgun', rotY: Math.PI },
        { x: 12, z: -5, weapon: 'sniper', rotY: Math.PI / 2 },
        { x: 12, z: 5, weapon: 'rifle', rotY: Math.PI / 2 },
        { x: 6, z: 0, weapon: 'shotgun', rotY: Math.PI / 2 }
      ],
      groundWeapons: [],
      chests: [
        { x: -12, z: -8, loot: { type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24 } },
        { x: 12, z: 0, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } }
      ]
    },
    {
      id: 4,
      name: "MAPA 05: EL BÚNKER DEL NÚCLEO 3D",
      subtitle: "REACTOR SUBTERRÁNEO",
      difficulty: "EXTREMO",
      theme: 'reactor',
      playerSpawn: { x: -13, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 36, d: 24, h: 6.5 },
      walls: [
        // Columnas de contención y blindaje perimetral
        { x: -4, z: -4, w: 2, d: 3.5, h: 6.5 },
        { x: 4, z: -4, w: 2, d: 3.5, h: 6.5 },
        { x: -4, z: 4, w: 2, d: 3.5, h: 6.5 },
        { x: 4, z: 4, w: 2, d: 3.5, h: 6.5 },
        { x: -8, z: 0, w: 1.2, d: 5, h: 6.5 },
        { x: 8, z: 0, w: 1.2, d: 5, h: 6.5 }
      ],
      enemies: [
        { x: 13, z: 0, weapon: 'sniper', rotY: Math.PI / 2 },
        { x: 7, z: -7, weapon: 'rifle', rotY: Math.PI / 2 },
        { x: 7, z: 7, weapon: 'shotgun', rotY: Math.PI / 2 },
        { x: 0, z: -7.5, weapon: 'rifle', rotY: Math.PI / 2 },
        { x: 0, z: 7.5, weapon: 'plasma', rotY: Math.PI / 2 },
        { x: -2, z: 0, weapon: 'shotgun', rotY: Math.PI / 2 }
      ],
      groundWeapons: [],
      chests: [
        { x: 0, z: -9.5, loot: { type: 'plasma', name: 'CAÑÓN DE PLASMA', ammo: 5, maxAmmo: 5 } },
        { x: 0, z: 9.5, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } }
      ]
    },
    // ─────────────────── MAPA 06 ───────────────────
    {
      id: 5,
      name: "MAPA 06: LA CATEDRAL DE HIELO",
      subtitle: "TEMPLO CRIOGÉNICO",
      difficulty: "MEDIA",
      theme: 'lab',
      playerSpawn: { x: 0, y: 0, z: -12, rotY: 0 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 28, d: 32, h: 6.0 },
      walls: [
        // Naves laterales de la catedral
        { x: -8, z: -4, w: 2, d: 14, h: 6.0 },
        { x:  8, z: -4, w: 2, d: 14, h: 6.0 },
        // Altar central elevado
        { x:  0, z:  4, w: 6, d: 2.5, h: 6.0 },
        // Columnas frontales
        { x: -4, z: -10, w: 1.8, d: 1.8, h: 6.0 },
        { x:  4, z: -10, w: 1.8, d: 1.8, h: 6.0 }
      ],
      enemies: [
        { x: -6, z:  0, weapon: 'pistol',  rotY: Math.PI / 2 },
        { x:  6, z:  0, weapon: 'pistol',  rotY: -Math.PI / 2 },
        { x:  0, z:  8, weapon: 'rifle',   rotY: Math.PI },
        { x: -4, z:  8, weapon: 'shotgun', rotY: Math.PI }
      ],
      groundWeapons: [
        { x: 0, z: -6, type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24 }
      ],
      chests: [
        { x: -10, z: 10, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } }
      ]
    },
    // ─────────────────── MAPA 07 ───────────────────
    {
      id: 6,
      name: "MAPA 07: LABERINTO DE ESPEJOS",
      subtitle: "CÁMARA DE REFLEXIÓN",
      difficulty: "DIFÍCIL",
      theme: 'neon',
      playerSpawn: { x: -13, y: 0, z: -8, rotY: -Math.PI / 4 },
      startWeapon: { type: 'shotgun', name: 'ESCOPETA DE ASALTO', ammo: 4, maxAmmo: 4 },
      roomSize: { w: 34, d: 26, h: 5.0 },
      walls: [
        // Laberinto de corredores estrechos
        { x: -6, z:  -6, w: 1.2, d: 10, h: 5.0 },
        { x:  0, z:  -2, w: 10,  d: 1.2, h: 5.0 },
        { x:  6, z:   4, w: 1.2, d: 10, h: 5.0 },
        { x: -3, z:   8, w: 8,   d: 1.2, h: 5.0 },
        { x: -9, z:   2, w: 1.2, d: 6,  h: 5.0 }
      ],
      enemies: [
        { x:  2, z: -6, weapon: 'pistol',  rotY: Math.PI },
        { x:  8, z:  0, weapon: 'rifle',   rotY: Math.PI / 2 },
        { x:  3, z:  6, weapon: 'shotgun', rotY: Math.PI },
        { x: -4, z:  5, weapon: 'pistol',  rotY: 0 },
        { x: 10, z:  8, weapon: 'rifle',   rotY: -Math.PI / 2 }
      ],
      groundWeapons: [],
      chests: [
        { x: 12, z: -8, loot: { type: 'plasma',  name: 'CAÑÓN DE PLASMA',      ammo: 5, maxAmmo: 5 } },
        { x: -8, z: 10, loot: { type: 'rifle',   name: 'RIFLE DE ASALTO',      ammo: 24, maxAmmo: 24 } }
      ]
    },
    // ─────────────────── MAPA 08 ───────────────────
    {
      id: 7,
      name: "MAPA 08: FORTALEZA EN RUINAS",
      subtitle: "ZONA DE GUERRA URBANA",
      difficulty: "EXPERTO",
      theme: 'industrial',
      playerSpawn: { x: 0, y: 0, z: 11, rotY: Math.PI },
      startWeapon: { type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24 },
      roomSize: { w: 38, d: 30, h: 5.5 },
      walls: [
        // Muros rotos de fortaleza — cobertura asimétrica
        { x: -12, z: -2, w: 3,   d: 7,   h: 5.5 },
        { x:   4, z:  4, w: 7,   d: 2,   h: 5.5 },
        { x:  10, z: -6, w: 2,   d: 8,   h: 5.5 },
        { x:  -4, z: -8, w: 8,   d: 2,   h: 5.5 },
        { x:  -7, z:  6, w: 2.5, d: 5,   h: 5.5 },
        { x:   2, z: -3, w: 1.8, d: 3.5, h: 5.5 }
      ],
      enemies: [
        { x: -10, z: -8, weapon: 'sniper',  rotY: 0 },
        { x:  -2, z: -6, weapon: 'rifle',   rotY: 0 },
        { x:   8, z:  0, weapon: 'rifle',   rotY: Math.PI / 2 },
        { x:   6, z: -9, weapon: 'shotgun', rotY: Math.PI / 4 },
        { x: -10, z:  8, weapon: 'pistol',  rotY: -Math.PI / 4 },
        { x:   0, z: -2, weapon: 'shotgun', rotY: Math.PI }
      ],
      groundWeapons: [
        { x: 0, z: 8, type: 'shotgun', name: 'ESCOPETA DE ASALTO', ammo: 4, maxAmmo: 4 }
      ],
      chests: [
        { x: -14, z: -10, loot: { type: 'sniper',  name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } },
        { x:  14, z:  10, loot: { type: 'plasma',  name: 'CAÑÓN DE PLASMA',       ammo: 5, maxAmmo: 5 } }
      ]
    },
    // ─────────────────── MAPA 09 ───────────────────
    {
      id: 8,
      name: "MAPA 09: CÁMARA CIRCULAR",
      subtitle: "ARENA DE PLASMA",
      difficulty: "EXTREMO",
      theme: 'reactor',
      playerSpawn: { x: 0, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'plasma', name: 'CAÑÓN DE PLASMA', ammo: 5, maxAmmo: 5 },
      roomSize: { w: 30, d: 30, h: 6.0 },
      walls: [
        // 8 bloques en círculo alrededor del centro — arena tipo gladiador
        { x:  0,  z: -10, w: 3, d: 2, h: 6.0 },
        { x:  0,  z:  10, w: 3, d: 2, h: 6.0 },
        { x: -10, z:   0, w: 2, d: 3, h: 6.0 },
        { x:  10, z:   0, w: 2, d: 3, h: 6.0 },
        { x: -7,  z:  -7, w: 2, d: 2, h: 6.0 },
        { x:  7,  z:  -7, w: 2, d: 2, h: 6.0 },
        { x: -7,  z:   7, w: 2, d: 2, h: 6.0 },
        { x:  7,  z:   7, w: 2, d: 2, h: 6.0 }
      ],
      enemies: [
        { x:  0,  z: -8, weapon: 'plasma',  rotY: Math.PI },
        { x:  0,  z:  8, weapon: 'plasma',  rotY: 0 },
        { x: -8,  z:  0, weapon: 'sniper',  rotY: Math.PI / 2 },
        { x:  8,  z:  0, weapon: 'sniper',  rotY: -Math.PI / 2 },
        { x: -5,  z: -5, weapon: 'rifle',   rotY: Math.PI / 4 },
        { x:  5,  z:  5, weapon: 'rifle',   rotY: -Math.PI * 3 / 4 },
        { x: -5,  z:  5, weapon: 'shotgun', rotY: Math.PI * 3 / 4 }
      ],
      groundWeapons: [],
      chests: [
        { x: -12, z: -12, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5 } },
        { x:  12, z:  12, loot: { type: 'plasma', name: 'CAÑÓN DE PLASMA',       ammo: 5, maxAmmo: 5 } }
      ]
    },
    // ─────────────────── MAPA 10 ───────────────────
    {
      id: 9,
      name: "MAPA 10: EL ABISMO FINAL",
      subtitle: "☠️ NADIE SOBREVIVE",
      difficulty: "LEGENDARIO ☠️",
      theme: 'crossroads',
      playerHp: 5,
      playerSpawn: { x: 0, y: 0, z: 0, rotY: -Math.PI / 2 },
      startWeapon: { type: 'pistol', name: 'PISTOLA', ammo: 6, maxAmmo: 6 },
      roomSize: { w: 44, d: 36, h: 7.5 },
      walls: [
        // Cobertura mínima — el jugador está RODEADO desde el inicio
        { x:  -4, z:  -4, w: 2, d: 2, h: 7.5 },
        { x:  -4, z:   4, w: 2, d: 2, h: 7.5 },
        { x:   4, z:  -4, w: 2, d: 2, h: 7.5 },
        { x:   4, z:   4, w: 2, d: 2, h: 7.5 },
        // Bloques laterales escasos
        { x: -14, z:  -6, w: 2, d: 4, h: 7.5 },
        { x: -14, z:   6, w: 2, d: 4, h: 7.5 },
        { x:  14, z:  -6, w: 2, d: 4, h: 7.5 },
        { x:  14, z:   6, w: 2, d: 4, h: 7.5 },
        // Barricadas superiores e inferiores
        { x:   0, z: -14, w: 5, d: 1.5, h: 7.5 },
        { x:   0, z:  14, w: 5, d: 1.5, h: 7.5 }
      ],
      enemies: [
        // Anillo interior — IA agresiva con rifles y escopetas
        { x: -10, z:   0, weapon: 'rifle',   rotY:  Math.PI / 2 },
        { x:  10, z:   0, weapon: 'rifle',   rotY: -Math.PI / 2 },
        { x:   0, z: -10, weapon: 'shotgun', rotY:  Math.PI },
        { x:   0, z:  10, weapon: 'shotgun', rotY:  0 },
        // Francotiradores en las esquinas
        { x: -16, z: -14, weapon: 'sniper',  rotY:  Math.PI / 4 },
        { x:  16, z: -14, weapon: 'sniper',  rotY:  Math.PI * 3 / 4 },
        { x: -16, z:  14, weapon: 'sniper',  rotY: -Math.PI / 4 },
        { x:  16, z:  14, weapon: 'sniper',  rotY: -Math.PI * 3 / 4 },
        // Cañones de plasma en los flancos
        { x: -16, z:   0, weapon: 'plasma',  rotY:  Math.PI / 2 },
        { x:  16, z:   0, weapon: 'plasma',  rotY: -Math.PI / 2 },
        // Refuerzos de rifle en diagonales
        { x:  -8, z:  -8, weapon: 'rifle',   rotY:  Math.PI / 4 },
        { x:   8, z:  -8, weapon: 'rifle',   rotY:  Math.PI * 3 / 4 },
        { x:  -8, z:   8, weapon: 'rifle',   rotY: -Math.PI / 4 },
        { x:   8, z:   8, weapon: 'rifle',   rotY: -Math.PI * 3 / 4 }
      ],
      groundWeapons: [],
      chests: [
        // Los cofres están LEJOS — hay que cruzar el fuego para llegar
        { x: -18, z: -15, loot: { type: 'plasma', name: 'CAÑÓN DE PLASMA',       ammo: 5, maxAmmo: 5 } },
        { x:  18, z: -15, loot: { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN',  ammo: 5, maxAmmo: 5 } },
        { x: -18, z:  15, loot: { type: 'rifle',  name: 'RIFLE DE ASALTO',        ammo: 24, maxAmmo: 24 } },
        { x:  18, z:  15, loot: { type: 'plasma', name: 'CAÑÓN DE PLASMA',        ammo: 5, maxAmmo: 5 } }
      ]
    }
  ];

  // ========================================================
  // 3. INICIALIZACIÓN DE THREE.JS (ESCENA, CÁMARA, RENDERER)
  // ========================================================
  const canvas = document.getElementById('gameCanvas');
  const pointerLockPrompt = document.getElementById('pointer-lock-prompt');

  // ========================================================
  // SISTEMA DE RETÍCULA DINÁMICA 2D (ESTILO FORTNITE & MODERN SHOOTERS)
  // ========================================================
  const crosshairCanvas = document.getElementById('crosshairCanvas');
  const crosshairCtx = crosshairCanvas ? crosshairCanvas.getContext('2d') : null;

  let crosshairSpread = 0;
  let crosshairBurstSpread = 0;
  let hitmarkerTimer = 0;
  let reticlePulseTimer = 0;
  let isCritHitmarker = false;
  let floatingDamageTexts = [];

  function triggerHitmarker(dmgAmount = 1, worldPos = null, isCrit = false, isShield = false) {
    hitmarkerTimer = 0.28;
    isCritHitmarker = isCrit;
    addFloatingDamageText(dmgAmount, worldPos, isCrit, isShield);
  }

  function addFloatingDamageText(dmgAmount, worldPos = null, isCrit = false, isShield = false) {
    if (!crosshairCanvas) return;
    let scrX = crosshairCanvas.width / 2;
    let scrY = crosshairCanvas.height / 2 - 20;

    if (worldPos && camera) {
      const proj = worldPos.clone().project(camera);
      if (proj.z < 1) {
        scrX = (proj.x * 0.5 + 0.5) * crosshairCanvas.width;
        scrY = (-proj.y * 0.5 + 0.5) * crosshairCanvas.height;
      }
    }

    scrX += (Math.random() - 0.5) * 28;
    scrY += (Math.random() - 0.5) * 14;

    let color = '#ffffff';
    let labelText = `-${dmgAmount}`;
    let scale = 1.1;

    if (isCrit) {
      color = '#ffd700';
      labelText = `-${dmgAmount} CRIT!`;
      scale = 1.6;
    } else if (isShield) {
      color = '#38bdf8';
      scale = 1.25;
    } else if (dmgAmount >= 3) {
      color = '#ff2052';
      scale = 1.35;
    }

    floatingDamageTexts.push({
      text: labelText,
      x: scrX,
      y: scrY,
      vy: 48 + Math.random() * 18,
      alpha: 1.0,
      color: color,
      scale: scale
    });
  }

  function triggerReticlePulse() {
    reticlePulseTimer = 0.35;
  }

  function isCrosshairTargetingEnemy() {
    if (!player || gameState !== 'playing' || enemies.length === 0) return false;
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    const enemyCenter = new THREE.Vector3();
    for (let i = 0; i < enemies.length; i++) {
      const en = enemies[i];
      if (!en || en.hp <= 0) continue;
      enemyCenter.copy(en.position).add(new THREE.Vector3(0, 1.1, 0));
      const toEnemy = enemyCenter.clone().sub(camPos);
      const distAlongRay = toEnemy.dot(camDir);
      if (distAlongRay > 0.5 && distAlongRay < 55) {
        const closestPoint = camPos.clone().addScaledVector(camDir, distAlongRay);
        const perpDist = enemyCenter.distanceTo(closestPoint);
        if (perpDist < (en.radius + 0.55)) {
          return true;
        }
      }
    }
    return false;
  }

  function renderDynamicCrosshair(dt) {
    if (!crosshairCanvas || !crosshairCtx) return;

    if (crosshairCanvas.width !== canvas.width || crosshairCanvas.height !== canvas.height) {
      crosshairCanvas.width = canvas.width;
      crosshairCanvas.height = canvas.height;
    }

    const ctx = crosshairCtx;
    ctx.clearRect(0, 0, crosshairCanvas.width, crosshairCanvas.height);

    if (gameState !== 'playing' && gameState !== 'dead' && gameState !== 'won') return;

    const centerX = crosshairCanvas.width / 2;
    const centerY = crosshairCanvas.height / 2;

    hitmarkerTimer = Math.max(0, hitmarkerTimer - dt * 3.8);
    reticlePulseTimer = Math.max(0, reticlePulseTimer - dt * 2.8);
    crosshairBurstSpread = Math.max(0, crosshairBurstSpread - dt * 22);

    const wType = (player && player.weapon && player.weapon.ammo > 0) ? player.weapon.type : 'fist';

    const isMoving = player ? (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || (joystick.active && Math.hypot(joystick.dirX, joystick.dirY) > 0.1)) : false;

    let targetSpread = 0;
    if (isMoving) {
      targetSpread += (wType === 'sniper') ? 28 : 12;
    }
    if (player && player.isAiming) {
      targetSpread = Math.max(0, targetSpread - 6);
    }
    targetSpread += crosshairBurstSpread;

    crosshairSpread += (targetSpread - crosshairSpread) * Math.min(1.0, dt * 14);

    const isTargeting = isCrosshairTargetingEnemy();

    const pal = THEME_PALETTES[currentGlobalTheme] || THEME_PALETTES.cyan;
    const mainColor = isTargeting ? '#ff2052' : pal.reticleCss;
    const outlineColor = '#000000';

    const S = crosshairSpread;
    const pulseFactor = 1.0 + reticlePulseTimer * 0.35;

    ctx.save();

    if (isTargeting) {
      ctx.shadowColor = 'rgba(255, 32, 82, 0.8)';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
    }

    function drawStrokedPath(drawFn, strokeWidth = 2) {
      ctx.lineWidth = strokeWidth + 2;
      ctx.strokeStyle = outlineColor;
      drawFn();
      ctx.stroke();

      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = mainColor;
      drawFn();
      ctx.stroke();
    }

    function drawStrokedCircle(x, y, radius) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
      ctx.fillStyle = outlineColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
    }

    // A) PUNTO CENTRAL DE ALTA PRECISIÓN ("DOT")
    drawStrokedCircle(centerX, centerY, 2.0 * pulseFactor);

    // B) EFECTO DE PULSO AL CAMBIAR DE ARMA / RECARGAR
    if (reticlePulseTimer > 0) {
      const pulseRadius = (14 + (0.35 - reticlePulseTimer) * 50) * pulseFactor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(0, 240, 255, ${(reticlePulseTimer / 0.35).toFixed(2)})`;
      ctx.stroke();
    }

    // C) RETÍCULAS ESPECÍFICAS SEGÚN EL ARMA EQUIPADA
    if (wType === 'pistol') {
      // 1. PISTOLA TÁCTICA 9MM: Cruz limpia de 4 líneas delgadas
      const gap = (7 + S) * pulseFactor;
      const len = 9;

      drawStrokedPath(() => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - gap);
        ctx.lineTo(centerX, centerY - gap - len);
        ctx.moveTo(centerX, centerY + gap);
        ctx.lineTo(centerX, centerY + gap + len);
        ctx.moveTo(centerX - gap, centerY);
        ctx.lineTo(centerX - gap - len, centerY);
        ctx.moveTo(centerX + gap, centerY);
        ctx.lineTo(centerX + gap + len, centerY);
      }, 2.0);

    } else if (wType === 'shotgun') {
      // 2. ESCOPETA DE COMBATE: Círculo mediano segmentado en 4 arcos + 4 esquineros (L-Brackets)
      const R = (22 + S * 0.75) * pulseFactor;

      drawStrokedPath(() => {
        ctx.beginPath();
        const gapAngle = 0.28;
        ctx.arc(centerX, centerY, R, -Math.PI / 2 + gapAngle, 0 - gapAngle);
        ctx.moveTo(centerX + R * Math.cos(gapAngle), centerY + R * Math.sin(gapAngle));
        ctx.arc(centerX, centerY, R, 0 + gapAngle, Math.PI / 2 - gapAngle);
        ctx.moveTo(centerX - R * Math.cos(gapAngle), centerY + R * Math.sin(gapAngle));
        ctx.arc(centerX, centerY, R, Math.PI / 2 + gapAngle, Math.PI - gapAngle);
        ctx.moveTo(centerX - R * Math.cos(gapAngle), centerY - R * Math.sin(gapAngle));
        ctx.arc(centerX, centerY, R, Math.PI + gapAngle, 3 * Math.PI / 2 - gapAngle);
      }, 2.0);

      const B = R + 5;
      const L = 6;
      drawStrokedPath(() => {
        ctx.beginPath();
        // Top-Left ┌
        ctx.moveTo(centerX - B, centerY - B + L);
        ctx.lineTo(centerX - B, centerY - B);
        ctx.lineTo(centerX - B + L, centerY - B);
        // Top-Right ┐
        ctx.moveTo(centerX + B - L, centerY - B);
        ctx.lineTo(centerX + B, centerY - B);
        ctx.lineTo(centerX + B, centerY - B + L);
        // Bottom-Left └
        ctx.moveTo(centerX - B, centerY + B - L);
        ctx.lineTo(centerX - B, centerY + B);
        ctx.lineTo(centerX - B + L, centerY + B);
        // Bottom-Right ┘
        ctx.moveTo(centerX + B - L, centerY + B);
        ctx.lineTo(centerX + B, centerY + B);
        ctx.lineTo(centerX + B, centerY + B - L);
      }, 1.5);

    } else if (wType === 'smg' || wType === 'rifle' || wType === 'plasma') {
      // 3. SUBFUSIL / RIFLE AUTOMÁTICO: Cruz compacta + 4 Flechas direccionales exteriores (^ v < >)
      const gap = (6 + S * 0.45) * pulseFactor;
      const len = 7;

      drawStrokedPath(() => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - gap);
        ctx.lineTo(centerX, centerY - gap - len);
        ctx.moveTo(centerX, centerY + gap);
        ctx.lineTo(centerX, centerY + gap + len);
        ctx.moveTo(centerX - gap, centerY);
        ctx.lineTo(centerX - gap - len, centerY);
        ctx.moveTo(centerX + gap, centerY);
        ctx.lineTo(centerX + gap + len, centerY);
      }, 2.0);

      const outerDist = gap + len + 5 + S * 0.6;
      const arrowSz = 5;

      drawStrokedPath(() => {
        ctx.beginPath();
        // Chevron Top ^
        ctx.moveTo(centerX - arrowSz, centerY - outerDist + arrowSz);
        ctx.lineTo(centerX, centerY - outerDist);
        ctx.lineTo(centerX + arrowSz, centerY - outerDist + arrowSz);

        // Chevron Bottom v
        ctx.moveTo(centerX - arrowSz, centerY + outerDist - arrowSz);
        ctx.lineTo(centerX, centerY + outerDist);
        ctx.lineTo(centerX + arrowSz, centerY + outerDist - arrowSz);

        // Chevron Left <
        ctx.moveTo(centerX - outerDist + arrowSz, centerY - arrowSz);
        ctx.lineTo(centerX - outerDist, centerY);
        ctx.lineTo(centerX - outerDist + arrowSz, centerY + arrowSz);

        // Chevron Right >
        ctx.moveTo(centerX + outerDist - arrowSz, centerY - arrowSz);
        ctx.lineTo(centerX + outerDist, centerY);
        ctx.lineTo(centerX + outerDist - arrowSz, centerY + arrowSz);
      }, 1.8);

    } else if (wType === 'sniper') {
      // 4. FRANCOTIRADOR PESADO: Mira telescópica circular con escala Mil-Dot
      const R = (28 + S * 0.9) * pulseFactor;

      drawStrokedPath(() => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
      }, 1.8);

      const gap = 5;
      drawStrokedPath(() => {
        ctx.beginPath();
        ctx.moveTo(centerX - R - 6, centerY);
        ctx.lineTo(centerX - gap, centerY);
        ctx.moveTo(centerX + gap, centerY);
        ctx.lineTo(centerX + R + 6, centerY);

        ctx.moveTo(centerX, centerY - R - 6);
        ctx.lineTo(centerX, centerY - gap);
        ctx.moveTo(centerX, centerY + gap);
        ctx.lineTo(centerX, centerY + R + 6);
      }, 1.5);

      const tickDistances = [10, 18, 26];
      drawStrokedPath(() => {
        ctx.beginPath();
        for (const d of tickDistances) {
          if (d < R - 2) {
            ctx.moveTo(centerX - d, centerY - 2.5);
            ctx.lineTo(centerX - d, centerY + 2.5);
            ctx.moveTo(centerX + d, centerY - 2.5);
            ctx.lineTo(centerX + d, centerY + 2.5);

            ctx.moveTo(centerX - 2.5, centerY - d);
            ctx.lineTo(centerX + 2.5, centerY - d);
            ctx.moveTo(centerX - 2.5, centerY + d);
            ctx.lineTo(centerX + 2.5, centerY + d);
          }
        }
      }, 1.2);
    }

    // D) INDICADOR DE IMPACTO (HITMARKERS 'X' DIAGONALES FLASHEANDO EN EL CENTRO)
    if (hitmarkerTimer > 0) {
      const alpha = Math.min(1.0, hitmarkerTimer / 0.28);
      const hmSize = isCritHitmarker ? 12 : 9;
      const hmGap = 4;
      const hmColor = isCritHitmarker ? `rgba(255, 215, 0, ${alpha})` : `rgba(255, 32, 82, ${alpha})`;

      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(centerX - hmSize, centerY - hmSize);
      ctx.lineTo(centerX - hmGap, centerY - hmGap);
      ctx.moveTo(centerX + hmSize, centerY - hmSize);
      ctx.lineTo(centerX + hmGap, centerY - hmGap);
      ctx.moveTo(centerX - hmSize, centerY + hmSize);
      ctx.lineTo(centerX - hmGap, centerY + hmGap);
      ctx.moveTo(centerX + hmSize, centerY + hmSize);
      ctx.lineTo(centerX + hmGap, centerY + hmGap);
      ctx.stroke();

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = hmColor;
      ctx.stroke();
      ctx.restore();
    }

    // E) CIRCULO DE PROGRESO DE RECARGA FORTNITE (RELOAD PROGRESS RING)
    if (player && player.isReloading) {
      const progress = Math.max(0, Math.min(1.0, 1.0 - (player.reloadTimer / player.reloadDuration)));
      const ringRadius = 26 * pulseFactor;

      ctx.save();
      // Track fondo
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.stroke();

      // Arc de carga
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
      ctx.lineWidth = 3.0;
      ctx.strokeStyle = '#eab308';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Texto de recarga
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(`RECARGANDO... ${Math.floor(progress * 100)}%`, centerX, centerY + ringRadius + 6);
      ctx.fillText(`RECARGANDO... ${Math.floor(progress * 100)}%`, centerX, centerY + ringRadius + 6);
      ctx.restore();
    }

    // F) BARRA Y ESTADO DE MUNICIÓN FLOTANTE SOBRE/DEBAJO DEL JUGADOR (FORTNITE LOOT HUD)
    if (player && gameState === 'playing') {
      const playerPos3D = player.position.clone().add(new THREE.Vector3(0, -0.65, 0));
      const proj = playerPos3D.project(camera);

      if (proj.z < 1) {
        const pX = (proj.x * 0.5 + 0.5) * crosshairCanvas.width;
        const pY = (-proj.y * 0.5 + 0.5) * crosshairCanvas.height;

        if (pX > 40 && pX < crosshairCanvas.width - 40 && pY > 40 && pY < crosshairCanvas.height - 40) {
          const wData = player.weapon || WEAPONS_BASE.pistol;
          const wBase = WEAPONS_BASE[wData.type] || {};
          const rarityColor = wData.rarityColor || wBase.rarityColor || '#9e9e9e';
          const rarityName = wData.rarityName || wBase.rarityName || 'COMÚN';
          const ammo = wData.ammo !== undefined ? wData.ammo : 0;
          const max = wData.maxAmmo || wBase.maxAmmo || 6;
          const reserve = wData.reserveAmmo !== undefined ? wData.reserveAmmo : (wBase.reserveAmmo || 60);

          ctx.save();
          ctx.translate(pX, pY);

          // Tarjeta flotante
          const cardW = 110;
          const cardH = 26;
          const left = -cardW / 2;
          const top = 0;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.strokeStyle = rarityColor;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = rarityColor;
          ctx.shadowBlur = 6;

          ctx.beginPath();
          ctx.roundRect(left, top, cardW, cardH, 4);
          ctx.fill();
          ctx.stroke();

          // Insignia de rareza
          ctx.fillStyle = rarityColor;
          ctx.beginPath();
          ctx.roundRect(left + 3, top + 3, 26, cardH - 6, 3);
          ctx.fill();

          ctx.font = 'bold 9px "Orbitron", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rarityName.slice(0, 3), left + 16, top + cardH / 2);

          // Texto de munición (Cargador / Reserva)
          ctx.font = 'bold 12px "Rajdhani", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillStyle = ammo === 0 ? '#ef4444' : '#ffffff';
          ctx.fillText(`${ammo} | ${reserve}`, left + cardW - 8, top + cardH / 2 - 2);

          // Barra de munición mini
          const barW = cardW - 36;
          const barRatio = Math.max(0, Math.min(1.0, ammo / max));
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(left + 32, top + cardH - 6, barW, 3);
          ctx.fillStyle = ammo === 0 ? '#ef4444' : rarityColor;
          ctx.fillRect(left + 32, top + cardH - 6, barW * barRatio, 3);

          ctx.restore();
        }
      }
    }

    // G) RENDERIZADO DE NÚMEROS DE DAÑO FLOTANTES
    ctx.font = 'bold 22px "Rajdhani", "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = floatingDamageTexts.length - 1; i >= 0; i--) {
      const ft = floatingDamageTexts[i];
      ft.y -= ft.vy * dt;
      ft.alpha -= dt * 1.6;

      if (ft.alpha <= 0) {
        floatingDamageTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      const scale = ft.scale || 1.0;
      ctx.translate(ft.x, ft.y);
      ctx.scale(scale, scale);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(ft.text, 0, 0);

      ctx.fillStyle = ft.color || '#ff2052';
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1000 / 650, 0.1, 500);

  let isMobileDevice = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || ('ontouchstart' in window);
  // Permitir forzar modo móvil para pruebas en PC
  let forceMobileMode = isMobileDevice;

  // Resolución interna: en móvil máximo 1.0 para ahorrar GPU fill-rate (vital para Redmi 10)
  const MAX_PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, forceMobileMode ? 1.0 : 1.25);
  let currentPixelRatio = Math.min(MAX_PIXEL_RATIO, forceMobileMode ? 1.0 : 1.15);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !forceMobileMode,
    powerPreference: 'high-performance',
    precision: forceMobileMode ? 'mediump' : 'highp'
  });
  renderer.setSize(1000, 650, false);
  renderer.setPixelRatio(currentPixelRatio);
  // Sombras y tone mapping: apagadas en móvil para reducir draw calls de depth map y cálculo de fragmentos
  renderer.shadowMap.enabled = !forceMobileMode;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!forceMobileMode) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
  }

  // ========================================================
  // POST-PROCESSING: UNREAL BLOOM PASS (FORTNITE GLOW ESTILO)
  // ========================================================
  let composer = null;
  if (typeof THREE.EffectComposer !== 'undefined') {
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Configuración de Bloom optimizada (Fortnite PBR Stylized)
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(1000, 650),
      0.35,  // strength (bajado drásticamente para evitar sobreexposición)
      0.6,   // radius
      0.95   // threshold (solo lo más brillante emitirá bloom)
    );
    composer.addPass(bloomPass);
  }

  // ========================================================
  // IMAGE BASED LIGHTING (IBL) - REFLEJOS PROFESIONALES (Secreto de Fortnite)
  // Genera un mapa de entorno procedural para que el PBR refleje el cielo y el suelo.
  // Sin esto, los metales se ven como plástico negro mate.
  // ========================================================
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 512;
  const envCtx = envCanvas.getContext('2d');
  const envGrad = envCtx.createLinearGradient(0, 0, 0, 512);
  envGrad.addColorStop(0, '#cdd6e0');    // Cielo difuso (no tan quemado para no lavar los negros)
  envGrad.addColorStop(0.3, '#7da2c8');  // Azul atmosférico
  envGrad.addColorStop(0.5, '#445566');  // Horizonte gris metálico
  envGrad.addColorStop(1, '#050508');    // Suelo oscuro (sombras fuertes)
  envCtx.fillStyle = envGrad;
  envCtx.fillRect(0, 0, 512, 512);
  
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  const envRenderTarget = pmremGenerator.fromEquirectangular(envTex);
  scene.environment = envRenderTarget.texture; // Aplica los reflejos globales a todos los materiales Standard
  envTex.dispose();
  pmremGenerator.dispose();

  // Luces de la escena (Reducida drásticamente porque el IBL ya añade luz ambiental)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15); // Era 0.4, lo bajamos para contraste
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.15); // Era 0.25
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); // Más intensidad directa para sacar brillos especulares
  dirLight.position.set(12, 24, 14);
  dirLight.castShadow = !isMobileDevice;
  dirLight.shadow.mapSize.width = isMobileDevice ? 512 : 1024;
  dirLight.shadow.mapSize.height = isMobileDevice ? 512 : 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 70;
  const shadowD = 24;
  dirLight.shadow.camera.left = -shadowD;
  dirLight.shadow.camera.right = shadowD;
  dirLight.shadow.camera.top = shadowD;
  dirLight.shadow.camera.bottom = -shadowD;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  // Contenedor de la cámara FPS (para orientación Yaw y Pitch desacoplados)
  const cameraPitchObject = new THREE.Object3D();
  cameraPitchObject.add(camera);

  const cameraRig = new THREE.Object3D();
  cameraRig.position.set(0, PLAYER_HEIGHT, 0);
  cameraRig.add(cameraPitchObject);
  scene.add(cameraRig);

  // Luces dedicadas para el arma en primera persona (Viewmodel Studio Lights - Estilo AAA)
  // Garantizan que los biseles siempre atrapen brillos especulares y un rim-light de contorno, sin importar adónde mire el jugador
  const vmKeyLight = new THREE.DirectionalLight(0xfff7ed, 1.05);
  vmKeyLight.position.set(2.8, 4.2, 1.8);
  camera.add(vmKeyLight);

  const vmRimLight = new THREE.DirectionalLight(0x38bdf8, 0.68);
  vmRimLight.position.set(-3.2, -1.2, -2.2);
  camera.add(vmRimLight);

  // Luces puntuales dinámicas para fogonazos y disparos
  const muzzleLight = new THREE.PointLight(0x00f0ff, 0, 12);
  if (!isMobileDevice) camera.add(muzzleLight); // en celular una luz extra encarece todos los materiales

  // ========================================================
  // 4. ESTADO GLOBAL DEL JUEGO
  // ========================================================
  let currentMapIndex = 0;
  let gameState = 'instructions'; // 'instructions', 'menu', 'mapSelect', 'shop', 'playing', 'dead', 'won'
  let previousMenuState = 'menu'; // para volver desde la tienda
  let timeScale = TIME_SCALE_STOPPED;
  let targetTimeScale = TIME_SCALE_STOPPED;
  let lastTimestamp = 0;
  let isPointerLocked = false;

  // ========================================================
  // 4.1 SISTEMA DE ECONOMÍA, MONEDAS, ARSENAL Y SKINS
  // ========================================================
  const WEAPONS_BASE = {
    pistol:  { type: 'pistol',  name: 'PISTOLA TÁCTICA 9MM',   ammo: 15, maxAmmo: 15, reserveAmmo: 60,  maxReserve: 120, rarity: 'common',    rarityName: 'COMÚN',       rarityColor: '#9e9e9e', rarityHex: 0x9e9e9e, reloadTime: 1.2 },
    shotgun: { type: 'shotgun', name: 'ESCOPETA DE COMBATE',   ammo: 6,  maxAmmo: 6,  reserveAmmo: 24,  maxReserve: 48,  rarity: 'rare',      rarityName: 'RARA',        rarityColor: '#3b82f6', rarityHex: 0x3b82f6, reloadTime: 1.8 },
    smg:     { type: 'smg',     name: 'SUBFUSIL VECTOR',       ammo: 30, maxAmmo: 30, reserveAmmo: 120, maxReserve: 240, rarity: 'uncommon',  rarityName: 'POCO COMÚN',  rarityColor: '#22c55e', rarityHex: 0x22c55e, reloadTime: 1.4 },
    rifle:   { type: 'rifle',   name: 'FUSIL DE ASALTO M4',    ammo: 30, maxAmmo: 30, reserveAmmo: 120, maxReserve: 240, rarity: 'epic',      rarityName: 'ÉPICA',       rarityColor: '#a855f7', rarityHex: 0xa855f7, reloadTime: 1.6 },
    sniper:  { type: 'sniper',  name: 'FRANCOTIRADOR PESADO',  ammo: 5,  maxAmmo: 5,  reserveAmmo: 15,  maxReserve: 30,  rarity: 'legendary', rarityName: 'LEGENDARIA',  rarityColor: '#eab308', rarityHex: 0xeab308, reloadTime: 2.2 },
    plasma:  { type: 'plasma',  name: 'CAÑÓN DE PLASMA HEAVY', ammo: 5,  maxAmmo: 5,  reserveAmmo: 15,  maxReserve: 30,  rarity: 'legendary', rarityName: 'LEGENDARIA',  rarityColor: '#ff0a85', rarityHex: 0xff0a85, reloadTime: 2.2 }
  };

  const SKINS_DATA = {
    skin_default: {
      id: 'skin_default',
      name: 'Cyber Clásica',
      type: 'skin',
      desc: 'Acabado estándar reactivo al color del sistema cibernético seleccionado.',
      price: 0,
      icon: '💎',
      badge: 'BÁSICA',
      badgeClass: 'badge-skin',
      neonHex: null
    },
    skin_gold: {
      id: 'skin_gold',
      name: 'Gold Legend (Oro Puro)',
      type: 'skin',
      desc: 'Aleación de oro macizo pulido con destellos dorados relucientes.',
      price: 150,
      icon: '👑',
      badge: 'LEGENDARIA',
      badgeClass: 'badge-skin',
      neonHex: 0xffd700,
      steelColor: 0xd4af37,
      chromeColor: 0xfff3a0
    },
    skin_vortex: {
      id: 'skin_vortex',
      name: 'Vortex Void (Obsidiana)',
      type: 'skin',
      desc: 'Materia cósmica de agujero negro con conductos de energía violeta estelar.',
      price: 120,
      icon: '🌌',
      badge: 'ÉPICA',
      badgeClass: 'badge-skin',
      neonHex: 0xc084fc,
      steelColor: 0x07050d,
      chromeColor: 0x2e1065
    },
    skin_matrix: {
      id: 'skin_matrix',
      name: 'Matrix Hacker (Verde Neón)',
      type: 'skin',
      desc: 'Armazón táctico militar con circuitos verdes de terminal cyberpunk.',
      price: 100,
      icon: '💻',
      badge: 'TÁCTICA',
      badgeClass: 'badge-skin',
      neonHex: 0x22c55e,
      steelColor: 0x0f172a,
      chromeColor: 0x334155
    },
    skin_inferno: {
      id: 'skin_inferno',
      name: 'Inferno Crimson (Magma)',
      type: 'skin',
      desc: 'Acabado de roca volcánica ardiente con destellos de fuego puro.',
      price: 130,
      icon: '🔥',
      badge: 'ÉPICA',
      badgeClass: 'badge-skin',
      neonHex: 0xff2b2b,
      steelColor: 0x220c0c,
      chromeColor: 0x7f1d1d
    }
  };

  const WEAPONS_SHOP_DATA = {
    pistol: {
      id: 'pistol',
      name: 'Pistola Táctica (6 Balas)',
      type: 'arsenal',
      weaponType: 'pistol',
      desc: 'Arma de mano estándar de alta precisión. Cargada con 6 balas al desplegarte.',
      price: 0,
      icon: '🔫',
      badge: 'INICIAL',
      badgeClass: 'badge-weapon'
    },
    shotgun: {
      id: 'shotgun',
      name: 'Escopeta Pesada (4 Balas)',
      type: 'arsenal',
      weaponType: 'shotgun',
      desc: 'Despliega con escopeta de perdigones de dispersión masiva cargada con 4 balas.',
      price: 75,
      icon: '💥',
      badge: 'PESADA',
      badgeClass: 'badge-weapon'
    },
    smg: {
      id: 'smg',
      name: 'Subfusil Automático SMG (30 Balas)',
      type: 'arsenal',
      weaponType: 'smg',
      desc: 'Subametralladora compacta de alta cadencia de fuego, ráfagas continuas y gran supresión.',
      price: 90,
      icon: '⚡',
      badge: 'RÁPIDA',
      badgeClass: 'badge-weapon'
    },
    rifle: {
      id: 'rifle',
      name: 'Rifle de Asalto Neón (24 Balas)',
      type: 'arsenal',
      weaponType: 'rifle',
      desc: 'Despliega con rifle automático de 24 cartuchos y disparo continuo.',
      price: 110,
      icon: '⚡',
      badge: 'AUTOMÁTICA',
      badgeClass: 'badge-weapon'
    },
    sniper: {
      id: 'sniper',
      name: 'Rifle Francotirador (5 Balas)',
      type: 'arsenal',
      weaponType: 'sniper',
      desc: 'Despliega con rifle cinético de largo alcance que atraviesa múltiples objetivos.',
      price: 160,
      icon: '🎯',
      badge: 'PRECISIÓN',
      badgeClass: 'badge-weapon'
    },
    plasma: {
      id: 'plasma',
      name: 'Cañón de Plasma (5 Balas)',
      type: 'arsenal',
      weaponType: 'plasma',
      desc: 'Despliega con el cañón pesado de esferas de energía y daño explosivo.',
      price: 220,
      icon: '🔮',
      badge: 'SUPER ARMA',
      badgeClass: 'badge-weapon'
    }
  };

  let playerCoins = 0;
  try {
    playerCoins = parseInt(localStorage.getItem('chrono_coins'), 10) || 0;
  } catch (e) { playerCoins = 0; }

  let unlockedWeapons = ['pistol'];
  try {
    const savedW = JSON.parse(localStorage.getItem('chrono_unlocked_weapons'));
    if (Array.isArray(savedW)) unlockedWeapons = savedW;
    if (!unlockedWeapons.includes('pistol')) unlockedWeapons.push('pistol');
  } catch (e) {}

  let equippedStartWeapon = 'default'; // 'default' o tipo de arma
  try {
    const savedEqW = localStorage.getItem('chrono_start_weapon');
    if (savedEqW) equippedStartWeapon = savedEqW;
  } catch (e) {}

  let unlockedSkins = ['skin_default'];
  try {
    const savedS = JSON.parse(localStorage.getItem('chrono_unlocked_skins'));
    if (Array.isArray(savedS)) unlockedSkins = savedS;
    if (!unlockedSkins.includes('skin_default')) unlockedSkins.push('skin_default');
  } catch (e) {}

  let activeSkin = 'skin_default';
  try {
    const savedSkin = localStorage.getItem('chrono_active_skin');
    if (savedSkin && SKINS_DATA[savedSkin]) activeSkin = savedSkin;
  } catch (e) {}

  let hardMedkitsReserve = 0;
  try {
    hardMedkitsReserve = parseInt(localStorage.getItem('chrono_hard_medkits'), 10) || 0;
  } catch (e) { hardMedkitsReserve = 0; }

  function saveEconomyState() {
    try {
      localStorage.setItem('chrono_coins', playerCoins.toString());
      localStorage.setItem('chrono_unlocked_weapons', JSON.stringify(unlockedWeapons));
      localStorage.setItem('chrono_start_weapon', equippedStartWeapon);
      localStorage.setItem('chrono_unlocked_skins', JSON.stringify(unlockedSkins));
      localStorage.setItem('chrono_active_skin', activeSkin);
      localStorage.setItem('chrono_hard_medkits', hardMedkitsReserve.toString());
    } catch (e) {}
    updateCoinDisplays();
  }

  function updateCoinDisplays() {
    const menuCoins = document.getElementById('menu-coin-count');
    const mapCoins = document.getElementById('map-coin-count');
    const shopCoins = document.getElementById('shop-coin-count');
    if (menuCoins) menuCoins.textContent = playerCoins;
    if (mapCoins) mapCoins.textContent = playerCoins;
    if (shopCoins) shopCoins.textContent = playerCoins;
  }

  function addCoins(amount) {
    playerCoins += amount;
    saveEconomyState();
  }

  function spendCoins(amount) {
    if (playerCoins >= amount) {
      playerCoins -= amount;
      saveEconomyState();
      return true;
    }
    return false;
  }

  // Estado del Jugador y Entidades 3D
  let player = null;
  let enemies = [];
  let bullets = [];
  let thrownWeapons = [];
  let groundWeapons = [];
  let chests = [];
  let crystalShards = [];
  let mapColliders = []; // cajas de colisión AABB para paredes
  let envMeshes = []; // mallas del entorno del mapa actual
  let currentMapTheme = 'lab';
  let currentRoomBounds = null; // Límites infranqueables de la sala { minX, maxX, minZ, maxZ }
  let currentMapDifficultyMod = 1.0; // Multiplicador de agresividad enemiga por mapa (1.0 = normal, >1 = más difícil)

  // Teclado y Controles
  const keys = {
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
    Space: false, KeyE: false, KeyQ: false
  };

  // Joystick Virtual y Toques Móviles
  const joystick = {
    active: false,
    touchId: null,
    startX: 0,
    startY: 0,
    dirX: 0,
    dirY: 0,
    maxRadius: 50
  };
  let lookTouchId = null;
  let lookLastX = 0;
  let lookLastY = 0;
  let isTouchActive = false;
  let isHoldingTouchChest = false;

  // ========================================================
  // SHADER ESTILIZADO "FORTNITE" (GLSL inyectado en el PBR de Three.js)
  // Equivalente web de lo que Epic hace con Substance Painter + materiales de Unreal:
  //  1) Edge Highlight: los biseles (chaflanes) se pintan más claros y pulidos -> delinea la forma sin contornos negros.
  //  2) Gradiente vertical: caras que miran arriba más claras, las de abajo más oscuras (peso visual / AO falso).
  //  3) Rim light: borde de luz tenue que separa el arma de fondos oscuros.
  // El detector de bisel usa la normal local: en piezas extruidas el eje Z local es el de extrusión,
  // así que una cara de bisel mezcla Z con XY. Las caras planas y las tapas no se ven afectadas.
  // ========================================================
  function fortniteShaderCacheKey() { return 'fn-stylized-v1'; }
  function fortniteShaderPatch(shader) {
    shader.uniforms.uFnEdge = { value: this.userData.fnEdge };
    shader.uniforms.uFnGrad = { value: this.userData.fnGrad };
    shader.uniforms.uFnRim = { value: this.userData.fnRim };

    shader.vertexShader = 'varying vec3 vFnObjN;\n' + shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      '#include <beginnormal_vertex>\n  vFnObjN = objectNormal;'
    );

    shader.fragmentShader =
      'uniform float uFnEdge;\nuniform float uFnGrad;\nuniform float uFnRim;\nvarying vec3 vFnObjN;\n' +
      shader.fragmentShader
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  {
    vec3 fnN = normalize(vFnObjN);
    float fnBevel = min(abs(fnN.z), length(fnN.xy));
    float fnEdge = smoothstep(0.28, 0.6, fnBevel) * uFnEdge;
    diffuseColor.rgb = mix(diffuseColor.rgb, min(diffuseColor.rgb * 1.45 + 0.04, vec3(1.0)), fnEdge);
    roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.55, fnEdge);
    float fnUp = clamp(normal.y * 0.5 + 0.5, 0.0, 1.0);
    diffuseColor.rgb *= mix(1.0 - uFnGrad, 1.0 + uFnGrad * 0.5, fnUp);
  }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  {
    float fnRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
    totalEmissiveRadiance += diffuseColor.rgb * fnRim * uFnRim;
  }`);
  }
  function applyFortniteShader(material, opts = {}) {
    // En modo móvil (Redmi 10 y similares), apagamos el shader GLSL personalizado onBeforeCompile
    // para evitar recompilaciones y sobrecarga de fragmentos en GPUs Mali/Adreno
    if (forceMobileMode) {
      return material;
    }
    material.userData.fnStylized = true;
    material.userData.fnEdge = opts.edge !== undefined ? opts.edge : 0.0;
    material.userData.fnGrad = opts.grad !== undefined ? opts.grad : 0.18;
    material.userData.fnRim = opts.rim !== undefined ? opts.rim : 0.10;
    material.onBeforeCompile = fortniteShaderPatch;
    material.customProgramCacheKey = fortniteShaderCacheKey;
    return material;
  }

  // Caché de materiales reutilizables para evitar crear duplicados
  const materialCache = new Map();

  // Función para crear materiales PBR o Lambert simplificado en móvil
  function createStylizedPBR(hexColor, emissiveHex = 0x000000, emissiveInt = 0, roughness = 0.3, metalness = 0.1) {
    const cacheKey = `${hexColor}_${emissiveHex}_${emissiveInt}_${roughness}_${metalness}_${forceMobileMode}`;
    if (materialCache.has(cacheKey)) {
      return materialCache.get(cacheKey);
    }

    let mat;
    if (forceMobileMode) {
      // En móvil: MeshLambertMaterial es ultra-ligero (Gouraud shading por vértice, sin cálculos caros de microfacetas PBR)
      mat = new THREE.MeshLambertMaterial({
        color: hexColor,
        emissive: emissiveHex,
        emissiveIntensity: emissiveInt * 1.5
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: emissiveHex,
        emissiveIntensity: emissiveInt * 2.5,
        roughness: roughness,
        metalness: metalness
      });
    }

    materialCache.set(cacheKey, mat);
    return mat;
  }

  // ========================================================
  // 4.5 CONSTRUCTOR DE ARMAS 3D (ESTILOS Y SILUETAS TOTALMENTE ÚNICAS)
  // ========================================================
  function createWeaponMesh3D(weaponType, isViewModel = false, themeKey = 'cyan') {
    const group = new THREE.Group();
    const pal = THEME_PALETTES[themeKey] || THEME_PALETTES.cyan;

    const isGold = (activeSkin === 'skin_gold');
    const isVortex = (activeSkin === 'skin_vortex');
    const isMatrix = (activeSkin === 'skin_matrix');
    const isInferno = (activeSkin === 'skin_inferno');

    // Neón hiper-luminoso según la skin activa o el tema
    const neonHex = isGold ? 0xffea00 : (isVortex ? 0xc084fc : (isMatrix ? 0x22c55e : (isInferno ? 0xff3b30 : pal.primaryHex)));
    const skinNeonMat = forceMobileMode
      ? new THREE.MeshBasicMaterial({ color: neonHex })
      : new THREE.MeshStandardMaterial({ 
          color: neonHex,
          emissive: neonHex,
          emissiveIntensity: 4.5,
          roughness: 0.1,
          metalness: 0.2
        });

    // Carga de mapas procedurales HD para el sistema de renderizado de armas
    const bmTex = getBrushedMetalTextures();
    const cbTex = getCarbonFiberTextures();
    const gripTex = getTacticalGripTextures();
    const woodTex = getWoodGrainTexture();
    const heatTex = getHeatStainTexture();

    const steelDarkMat = createStylizedPBR(
      isGold ? 0xffea00 : (isVortex ? 0x1a0f30 : (isMatrix ? 0x064e3b : (isInferno ? 0x3d0b0b : 0x242a3a))),
      isGold ? 0x996515 : (isVortex ? 0x4c1d95 : (isMatrix ? 0x047857 : (isInferno ? 0x7f1d1d : 0x000000))),
      isGold ? 0.38 : (isVortex ? 0.45 : (isMatrix ? 0.4 : (isInferno ? 0.45 : 0))),
      0.4, 0.2 // Plástico oscuro denso
    );

    const chromeBrightMat = createStylizedPBR(
      isGold ? 0xfff59d : (isVortex ? 0x4c1d95 : (isMatrix ? 0x10b981 : (isInferno ? 0xef4444 : 0xe2e8f0))),
      isGold ? 0xffd700 : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0x991b1b : 0x000000))),
      isGold ? 0.48 : (isVortex ? 0.5 : (isMatrix ? 0.45 : (isInferno ? 0.5 : 0))),
      0.2, 0.7 // Metal brillante pulido
    );

    const gunmetalMat = createStylizedPBR(
      isGold ? 0xf59e0b : (isVortex ? 0x2e1065 : (isMatrix ? 0x065f46 : (isInferno ? 0x501010 : 0x475569))),
      isGold ? 0x78350f : (isVortex ? 0x4c1d95 : (isMatrix ? 0x047857 : (isInferno ? 0x450a0a : 0x000000))),
      isGold ? 0.32 : (isVortex ? 0.4 : (isMatrix ? 0.35 : (isInferno ? 0.4 : 0))),
      0.35, 0.5
    );

    const walnutWoodMat = createStylizedPBR(
      isGold ? 0xffd700 : 0xa66532,
      isGold ? 0x996515 : 0x000000,
      isGold ? 0.35 : 0,
      0.6, 0.0 // Madera mate
    );

    const darkRubberMat = createStylizedPBR(
      isGold ? 0xb45309 : (isVortex ? 0x120822 : (isMatrix ? 0x022c22 : (isInferno ? 0x250606 : 0x111111))),
      isGold ? 0x451a03 : (isVortex ? 0x2e1065 : (isMatrix ? 0x064e3b : (isInferno ? 0x450a0a : 0x000000))),
      isGold ? 0.25 : (isVortex ? 0.3 : (isMatrix ? 0.25 : (isInferno ? 0.3 : 0))),
      0.8, 0.0 // Goma súper mate
    );

    const militarySlateMat = createStylizedPBR(
      isGold ? 0xffc107 : (isVortex ? 0x1e0b36 : (isMatrix ? 0x047857 : (isInferno ? 0x7f1d1d : 0x64748b))),
      isGold ? 0x854d0e : (isVortex ? 0x5b21b6 : (isMatrix ? 0x065f46 : (isInferno ? 0x450a0a : 0x000000))),
      isGold ? 0.35 : (isVortex ? 0.42 : (isMatrix ? 0.38 : (isInferno ? 0.42 : 0))),
      0.4, 0.1
    );

    const obsidianMat = createStylizedPBR(
      isGold ? 0xffea00 : (isVortex ? 0x090314 : (isMatrix ? 0x022c22 : (isInferno ? 0x180505 : 0x0f172a))),
      isGold ? 0xca8a04 : (isVortex ? 0x3b0764 : (isMatrix ? 0x047857 : (isInferno ? 0x500724 : 0x000000))),
      isGold ? 0.4 : (isVortex ? 0.45 : (isMatrix ? 0.4 : (isInferno ? 0.45 : 0))),
      0.2, 0.4
    );

    const bronzeFinMat = createStylizedPBR(
      isGold ? 0xfff080 : (isVortex ? 0x6b21a8 : (isMatrix ? 0x16a34a : (isInferno ? 0xdc2626 : 0xd97706))),
      isGold ? 0xd97706 : (isVortex ? 0x5b21b6 : (isMatrix ? 0x059669 : (isInferno ? 0x991b1b : 0x000000))),
      isGold ? 0.45 : (isVortex ? 0.5 : (isMatrix ? 0.45 : (isInferno ? 0.5 : 0))),
      0.3, 0.8
    );

    if (!weaponType || weaponType === 'fist') {
      // ========================================================
      // 1. PUÑOS: GUANTELETES DE COMBATE CON PISTONES HIDRÁULICOS
      // ========================================================
      const bracer = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.26), militarySlateMat);
      bracer.position.set(0, 0, 0.06);
      group.add(bracer);

      const pistonGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.2, 10);
      const pistonL = new THREE.Mesh(pistonGeo, chromeBrightMat);
      pistonL.rotation.x = Math.PI / 2;
      pistonL.position.set(-0.075, 0.02, 0.05);
      const pistonR = pistonL.clone();
      pistonR.position.x = 0.075;
      group.add(pistonL, pistonR);

      const fistBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.16), steelDarkMat);
      fistBox.position.set(0, 0, -0.12);
      group.add(fistBox);

      const knuckleBar = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.045, 0.035), chromeBrightMat);
      knuckleBar.position.set(0, 0.03, -0.2);
      group.add(knuckleBar);

      for (let k = 0; k < 4; k++) {
        const stud = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.022, 0.02), skinNeonMat);
        stud.position.set(-0.048 + k * 0.032, 0.03, -0.218);
        group.add(stud);
      }

      const conduit = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.018, 0.22), skinNeonMat);
      conduit.position.set(0, 0.076, -0.02);
      group.add(conduit);

    } else if (weaponType === 'pistol') {
      if (typeof buildPistolMesh === 'function') {
        buildPistolMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader });
      }
    } else if (weaponType === 'shotgun') {
      if (typeof buildShotgunMesh === 'function') {
        buildShotgunMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader });
      }
    } else if (weaponType === 'smg') {
      if (typeof buildSmgMesh === 'function') {
        buildSmgMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader, skinNeonMat, getSmgGradientTexture });
      }
    } else if (weaponType === 'rifle') {
      if (typeof buildRifleMesh === 'function') {
        buildRifleMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader, skinNeonMat, getScarGradientTexture });
      }
    } else if (weaponType === 'sniper') {
      if (typeof buildSniperMesh === 'function') {
        buildSniperMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader, skinNeonMat });
      }
    } else if (weaponType === 'plasma') {
      if (typeof buildPlasmaMesh === 'function') {
        buildPlasmaMesh(group, { activeSkin, createStylizedPBR, applyFortniteShader });
      }
    }

    if (isViewModel && weaponType && weaponType !== 'fist') {
      addPlayerHandsToWeapon(group, weaponType, neonHex, skinNeonMat);
    }


    // Si está en modo móvil o para reducir llamadas de dibujo, optimizamos la jerarquía del arma
    // fusionando piezas estáticas con el mismo material mientras protegemos piezas dinámicas
    optimizeWeaponMeshes(group);

    // Hacer el arma más "Chunky" (proporciones exageradas tipo Fortnite)
    group.scale.set(1.2, 1.2, 1.0);

    return group;
  }

  // ========================================================
  // OPTIMIZACIÓN: FUSIÓN DE PIEZAS ESTÁTICAS DE ARMAS (MERGE BUFFER GEOMETRIES)
  // Agrupa mallas hijas que comparten el mismo material exacto, conservando sus transformaciones
  // Protege explícitamente: balaIndicador_1 a 5, reloj, piezas de skin oUserData
  // ========================================================
  function optimizeWeaponMeshes(rootGroup) {
    if (!rootGroup || !rootGroup.children || rootGroup.children.length === 0) return;

    // Recolectar todas las mallas estáticas agrupadas por material
    const meshesByMaterial = new Map();
    const protectedMeshes = new Set();

    rootGroup.traverse((child) => {
      if (!child.isMesh) return;

      // Proteger piezas que tengan nombres especiales o userData dinámico
      const name = child.name || (child.parent ? child.parent.name : '');
      const isProtected = 
        name.includes('balaIndicador') || 
        name.includes('anilloReloj') || 
        name.includes('nucleo') || 
        child.userData.dynamic ||
        (child.parent && child.parent.userData && child.parent.userData.dynamic);

      if (isProtected) {
        protectedMeshes.add(child);
        return;
      }

      const mat = child.material;
      if (!mat) return;

      if (!meshesByMaterial.has(mat)) {
        meshesByMaterial.set(mat, []);
      }
      meshesByMaterial.get(mat).push(child);
    });

    // Actualizar matrices de mundo relativas al rootGroup
    rootGroup.updateMatrixWorld(true);
    const invRootMatrix = new THREE.Matrix4().copy(rootGroup.matrixWorld).invert();

    // Para cada material con múltiples mallas estáticas, fusionamos sus geometrías
    meshesByMaterial.forEach((meshList, mat) => {
      if (meshList.length <= 1) return; // Nada que fusionar si es solo 1 malla

      const geomsToMerge = [];
      for (const m of meshList) {
        if (!m.geometry) continue;

        // Clonar y transformar la geometría al espacio local del rootGroup
        const geomClone = m.geometry.clone();
        m.updateMatrixWorld(true);
        const relativeMatrix = new THREE.Matrix4().multiplyMatrices(invRootMatrix, m.matrixWorld);
        geomClone.applyMatrix4(relativeMatrix);

        // Asegurarse de que tenga normales y coordenadas consistentes
        if (!geomClone.attributes.normal) {
          geomClone.computeVertexNormals();
        }
        geomsToMerge.push(geomClone);
      }

      if (geomsToMerge.length > 1) {
        const mergedGeom = mergeBufferGeometriesCustom(geomsToMerge);
        if (mergedGeom) {
          // Crear la malla combinada
          const mergedMesh = new THREE.Mesh(mergedGeom, mat);
          mergedMesh.name = (meshList[0].name || 'mergedMesh') + '_batched';
          mergedMesh.castShadow = !forceMobileMode;
          mergedMesh.receiveShadow = !forceMobileMode;

          // Remover las mallas originales individuales de sus padres
          for (const m of meshList) {
            if (m.parent) {
              m.parent.remove(m);
            }
            if (m.geometry && m.geometry.dispose) {
              m.geometry.dispose();
            }
          }

          // Añadir la malla combinada directamente al rootGroup
          rootGroup.add(mergedMesh);
        }
      }
    });
  }

  // Función nativa para fusionar geometrías BufferGeometry sin dependencias externas
  function mergeBufferGeometriesCustom(geometries) {
    if (!geometries || geometries.length === 0) return null;
    if (geometries.length === 1) return geometries[0];

    // Contar total de vértices e índices
    let totalPosCount = 0;
    let totalNormCount = 0;
    let totalUvCount = 0;
    let totalIndexCount = 0;
    let hasIndices = false;

    for (const g of geometries) {
      if (g.attributes.position) totalPosCount += g.attributes.position.array.length;
      if (g.attributes.normal) totalNormCount += g.attributes.normal.array.length;
      if (g.attributes.uv) totalUvCount += g.attributes.uv.array.length;
      if (g.index) {
        hasIndices = true;
        totalIndexCount += g.index.array.length;
      } else if (g.attributes.position) {
        totalIndexCount += g.attributes.position.count;
      }
    }

    const merged = new THREE.BufferGeometry();
    const posArray = new Float32Array(totalPosCount);
    const normArray = totalNormCount > 0 ? new Float32Array(totalNormCount) : null;
    const uvArray = totalUvCount > 0 ? new Float32Array(totalUvCount) : null;
    const indexArray = new Uint32Array(totalIndexCount);

    let posOffset = 0;
    let normOffset = 0;
    let uvOffset = 0;
    let indexOffset = 0;
    let vertexCountOffset = 0;

    for (const g of geometries) {
      const pos = g.attributes.position;
      if (!pos) continue;

      posArray.set(pos.array, posOffset);

      if (normArray && g.attributes.normal) {
        normArray.set(g.attributes.normal.array, normOffset);
      }
      if (uvArray && g.attributes.uv) {
        uvArray.set(g.attributes.uv.array, uvOffset);
      }

      if (g.index) {
        const idx = g.index.array;
        for (let i = 0; i < idx.length; i++) {
          indexArray[indexOffset + i] = idx[i] + vertexCountOffset;
        }
        indexOffset += idx.length;
      } else {
        for (let i = 0; i < pos.count; i++) {
          indexArray[indexOffset + i] = i + vertexCountOffset;
        }
        indexOffset += pos.count;
      }

      posOffset += pos.array.length;
      if (normArray && g.attributes.normal) normOffset += g.attributes.normal.array.length;
      if (uvArray && g.attributes.uv) uvOffset += g.attributes.uv.array.length;
      vertexCountOffset += pos.count;
    }

    merged.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    if (normArray) merged.setAttribute('normal', new THREE.BufferAttribute(normArray, 3));
    if (uvArray) merged.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
    merged.setIndex(new THREE.BufferAttribute(indexArray, 1));

    return merged;
  }

  function addPlayerHandsToWeapon(group, weaponType, neonHex, skinNeonMat) {
    const handGroup = new THREE.Group();

    const cbTex = getCarbonFiberTextures();
    const gripTex = getTacticalGripTextures();
    
    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f, // Guantes tácticos lisos oscuros
      roughness: 0.8,
      metalness: 0.1
    });

    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      map: getBrushedMetalTextures().map,
      bumpMap: getBrushedMetalTextures().bump,
      bumpScale: 0.03,
      roughness: 0.2,
      metalness: 0.85
    });

    const palmMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      map: gripTex.map,
      bumpMap: gripTex.bump,
      bumpScale: 0.05,
      roughness: 0.7,
      metalness: 0.1
    });

    // --- MANO DERECHA ---
    const rightArmGroup = new THREE.Group();
    const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.065), palmMat);

    const rKnuckles = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.03, 0.068), armorPlateMat);
    rKnuckles.position.set(0, 0.035, 0);
    rPalm.add(rKnuckles);

    const rNeonCircuit = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 0.05), skinNeonMat);
    rNeonCircuit.position.set(0, 0.04, 0);
    rPalm.add(rNeonCircuit);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.055), gloveMat);
      finger.position.set(-0.024 + f * 0.016, -0.015, -0.035);
      finger.rotation.x = -0.6;
      rPalm.add(finger);
    }
    const rThumb = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, 0.018), gloveMat);
    rThumb.position.set(-0.038, 0.01, -0.01);
    rThumb.rotation.z = 0.5;
    rThumb.rotation.x = -0.3;
    rPalm.add(rThumb);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.35, 12), gloveMat);
    rForearm.rotation.x = Math.PI / 2 + 0.15;
    rForearm.position.set(0, -0.05, 0.2);
    
    const rWristRing = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.025, 12), armorPlateMat);
    rWristRing.rotation.x = Math.PI / 2 + 0.15;
    rWristRing.position.set(0, -0.02, 0.07);
    const rWristGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.01, 12), skinNeonMat);
    rWristGlow.rotation.x = Math.PI / 2 + 0.15;
    rWristGlow.position.set(0, -0.02, 0.07);
    rForearm.add(rWristRing, rWristGlow);

    rightArmGroup.add(rPalm, rForearm);

    if (weaponType === 'pistol') {
      rightArmGroup.position.set(0.015, -0.08, 0.05);
      rightArmGroup.rotation.x = -0.16;
      // Reorientar el antebrazo para que descienda naturalmente fuera del encuadre de la cámara (evita que el cilindro bloquee la pantalla)
      rForearm.position.set(0, -0.12, 0.18);
      rForearm.rotation.x = Math.PI / 2 + 0.55;
    } else if (weaponType === 'smg') {
      rightArmGroup.position.set(0.01, -0.12, 0.08); // Empuñadura ergonómica SMG
      rightArmGroup.rotation.x = -0.20;
    } else if (weaponType === 'shotgun') {
      rightArmGroup.position.set(0, -0.15, 0.28); // Bajado a la altura del nuevo mango
      rightArmGroup.rotation.x = -0.16;
    } else if (weaponType === 'rifle') {
      rightArmGroup.position.set(0.01, -0.13, 0.10); // Ajustado a la empuñadura ergonómica del SCAR
      rightArmGroup.rotation.x = -0.18;
    } else if (weaponType === 'sniper') {
      rightArmGroup.position.set(0.01, -0.13, 0.12); // Ajustado a la empuñadura de pistola del francotirador
      rightArmGroup.rotation.x = -0.18;
    } else if (weaponType === 'plasma') {
      rightArmGroup.position.set(0.02, -0.12, 0.10);
      rightArmGroup.rotation.x = -0.18;
    }

    handGroup.add(rightArmGroup);

    // --- MANO IZQUIERDA ---
    if (weaponType !== 'pistol' && weaponType !== 'fist') {
      const leftArmGroup = new THREE.Group();

      const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.065), palmMat);
      const lKnuckles = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.03, 0.068), armorPlateMat);
      lKnuckles.position.set(0, 0.035, 0);
      lPalm.add(lKnuckles);

      const lNeonCircuit = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 0.05), skinNeonMat);
      lNeonCircuit.position.set(0, 0.04, 0);
      lPalm.add(lNeonCircuit);

      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.055), gloveMat);
        finger.position.set(-0.024 + f * 0.016, -0.015, -0.035);
        finger.rotation.x = -0.6;
        lPalm.add(finger);
      }

      const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.38, 12), gloveMat);
      lForearm.rotation.x = Math.PI / 2 - 0.2;
      lForearm.position.set(0, -0.06, 0.22);
      leftArmGroup.add(lPalm, lForearm);

      if (weaponType === 'shotgun') {
        leftArmGroup.position.set(0, -0.06, -0.25); // Alineado con la nueva corredera/pump
      } else if (weaponType === 'smg') {
        leftArmGroup.position.set(-0.030, -0.055, -0.08); // Sosteniendo el guardamanos compacto del SMG
        leftArmGroup.rotation.set(-0.20, 0.15, -0.12);
      } else if (weaponType === 'rifle') {
        leftArmGroup.position.set(-0.035, -0.065, -0.09); // Agarre ergonómico desde abajo a la izquierda
        leftArmGroup.rotation.set(-0.22, 0.18, -0.15);
      } else if (weaponType === 'sniper') {
        leftArmGroup.position.set(-0.035, -0.065, -0.16); // Agarre del chasis delantero bajo el riel
        leftArmGroup.rotation.set(-0.20, 0.16, -0.14);
      } else if (weaponType === 'plasma') {
        leftArmGroup.position.set(-0.075, -0.065, -0.08);
        leftArmGroup.rotation.set(-0.22, 0.22, -0.16);
      }

      handGroup.add(leftArmGroup);
    }

    group.add(handGroup);
  }

  // ========================================================
  // 4.8 CLASE EJECTED SHELL 3D (CASQUILLOS DE BALA EYECTADOS EN 3D)
  // ========================================================
  let ejectedShells = [];

  class EjectedShell3D {
    constructor(spawnPos, shootDir, isBrass = true) {
      this.mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.045, 10),
        new THREE.MeshToonMaterial({
          color: isBrass ? 0xf59e0b : 0xff3b30,
          emissive: isBrass ? 0xd97706 : 0x000000,
          emissiveIntensity: 0.2
        })
      );
      this.mesh.rotation.z = Math.PI / 2;
      this.mesh.position.copy(spawnPos);

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

      this.velocity = right.clone().multiplyScalar(1.6 + Math.random() * 0.8)
        .addScaledVector(up, 1.1 + Math.random() * 0.5)
        .addScaledVector(shootDir, -0.3);

      this.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );

      this.life = 2.5;
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const effDt = dt * timeScale;
      this.life -= effDt;
      if (this.life <= 0) {
        scene.remove(this.mesh);
        return true;
      }

      this.velocity.y -= 9.8 * effDt;
      this.mesh.position.addScaledVector(this.velocity, effDt);
      this.mesh.rotation.x += this.rotSpeed.x * effDt;
      this.mesh.rotation.y += this.rotSpeed.y * effDt;

      if (this.mesh.position.y <= 0.02) {
        this.mesh.position.y = 0.02;
        this.velocity.y *= -0.35;
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
      }
      return false;
    }

    destroy() {
      scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 5. CLASE FPS PLAYER (CONTROLADOR DE PRIMERA PERSONA)
  // ========================================================
  class FPSPlayer {
    constructor(spawnX, spawnZ, startRotY, weaponData, initialHp = 5, initialMedkits = 2) {
      this.position = new THREE.Vector3(spawnX, PLAYER_HEIGHT, spawnZ);
      this.yaw = startRotY || 0;
      this.pitch = 0;
      this.speed = 10.5; // m/s en tiempo real
      this.radius = PLAYER_RADIUS;
      this.hp = initialHp;
      this.maxHp = initialHp;
      this.medkits = initialMedkits; // Según dificultad seleccionada
      this.maxMedkits = initialMedkits;
      this.invulnTimer = 0;
      this.weapon = weaponData ? { ...weaponData } : null;

      // Variables de Apuntado ADS & Crono Bullet-Time (2.0s activo + 1.5s cooldown tras soltar)
      this.isAiming = false;       // El jugador puede mantener presionado y seguir apuntando sin límite
      this.isBulletTime = false;   // Indica si el tiempo está ralentizado por el apuntado
      this.aimTimer = 2.0;         // 2.0 segundos de tiempo ralentizado máximo por uso
      this.maxAimTimer = 2.0;
      this.aimCooldown = 0.0;      // 1.5 segundos de cooldown tras soltar el botón
      this.maxAimCooldown = 1.5;

      // Sistema de Recarga Táctica estilo Fortnite
      this.isReloading = false;
      this.reloadTimer = 0;
      this.reloadDuration = 1.5;

      // Variables de Animación Dinámica (Viewmodel Sway, Bobbing, Recoil y Punch)
      this.isPunching = false;
      this.punchProgress = 0;
      this.recoilZ = 0;
      this.recoilRot = 0;
      this.recoilX = 0;
      this.bobTimer = 0;
      this.idleTimer = 0;
      this.swayX = 0;
      this.swayY = 0;
      this.swayRotZ = 0;
      this.strafeTilt = 0;
      this.cameraShakePitch = 0;

      // Crear Modelo de Arma en Primera Persona (In-Hand View Model)
      this.viewWeaponGroup = new THREE.Group();
      this.viewWeaponGroup.position.set(0.30, -0.26, -0.62);
      cameraPitchObject.add(this.viewWeaponGroup);

      this.updateViewWeaponModel();
      this.updateCameraTransform();
    }

    startReload() {
      if (!this.weapon || this.isReloading || gameState !== 'playing') return false;
      const wBase = WEAPONS_BASE[this.weapon.type] || {};
      const max = this.weapon.maxAmmo || wBase.maxAmmo || 6;
      if (this.weapon.ammo >= max) return false;
      
      const reserve = (this.weapon.reserveAmmo !== undefined) ? this.weapon.reserveAmmo : (wBase.reserveAmmo || 60);
      if (reserve <= 0) {
        window.chronoAudio.playEmptyClick();
        return false;
      }

      this.isReloading = true;
      this.reloadDuration = this.weapon.reloadTime || wBase.reloadTime || 1.5;
      this.reloadTimer = this.reloadDuration;
      window.chronoAudio.playPickup();
      triggerReticlePulse();
      updateHUD();
      return true;
    }

    startAiming() {
      this.isAiming = true;
      if (this.aimCooldown <= 0 && this.aimTimer > 0) {
        this.isBulletTime = true;
      }
    }

    stopAiming() {
      if (!this.isAiming) return;
      this.isAiming = false;
      this.isBulletTime = false;
      if (this.aimTimer < 2.0 || this.aimCooldown <= 0) {
        this.aimCooldown = 1.5;
      }
    }

    addSway(deltaX, deltaY) {
      this.swayX = Math.max(-0.065, Math.min(0.065, this.swayX - deltaX * 0.00085));
      this.swayY = Math.max(-0.045, Math.min(0.045, this.swayY + deltaY * 0.0007));
      this.swayRotZ = Math.max(-0.08, Math.min(0.08, this.swayRotZ + deltaX * 0.0012));
    }

    useMedkit() {
      if (gameState !== 'playing') return false;
      if (this.medkits <= 0) {
        window.chronoAudio.playEmptyClick();
        return false;
      }
      if (this.hp >= this.maxHp) {
        window.chronoAudio.playEmptyClick();
        return false;
      }

      this.medkits--;
      this.hp = Math.min(this.maxHp, this.hp + 2);
      window.chronoAudio.playHeal();
      triggerScreenGreenFlash();
      updateHUD(true);
      return true;
    }

    takeDamage(amount = 1) {
      if (this.invulnTimer > 0 || gameState !== 'playing') return;
      this.hp = Math.max(0, this.hp - amount);
      this.invulnTimer = 0.85;

      window.chronoAudio.playPlayerHurt();
      triggerScreenRedFlash();
      updateHUD();

      if (this.hp <= 0) {
        triggerPlayerDeath();
      }
    }

    update(dt, isMoving) {
      if (this.invulnTimer > 0) {
        this.invulnTimer -= dt;
      }

      this.idleTimer += dt;

      // Procesamiento de Recarga de Munición Táctica estilo Fortnite
      if (this.isReloading) {
        this.reloadTimer -= dt;
        this.recoilZ = Math.sin((this.reloadDuration - this.reloadTimer) * Math.PI * 5) * 0.06;
        this.recoilRot = Math.sin((this.reloadDuration - this.reloadTimer) * Math.PI * 5) * 0.10;
        if (this.reloadTimer <= 0) {
          this.isReloading = false;
          this.reloadTimer = 0;
          if (this.weapon) {
            const wBase = WEAPONS_BASE[this.weapon.type] || {};
            const max = this.weapon.maxAmmo || wBase.maxAmmo || 6;
            const needed = max - this.weapon.ammo;
            if (this.weapon.reserveAmmo === undefined) this.weapon.reserveAmmo = wBase.reserveAmmo || 60;
            const fill = Math.min(needed, this.weapon.reserveAmmo);
            this.weapon.ammo += fill;
            this.weapon.reserveAmmo -= fill;
          }
          this.updateViewWeaponModel();
          updateHUD();
        }
      }

      // Actualizar animación diegética y rotación de plasma en el arma activa
      if (this.viewWeaponGroup && this.viewWeaponGroup.children[0]) {
        const wModel = this.viewWeaponGroup.children[0];
        if (wModel.userData && wModel.userData.updatePlasma) {
          const ammo = this.weapon ? this.weapon.ammo : 0;
          wModel.userData.updatePlasma(dt, ammo, this.isReloading, this.reloadTimer, this.reloadDuration);
        }
      }

      // Lógica de Apuntado ADS & Drenaje / Cooldown de Bullet-Time
      if (this.isAiming) {
        if (this.isBulletTime) {
          this.aimTimer -= dt;
          if (this.aimTimer <= 0) {
            this.aimTimer = 0;
            this.isBulletTime = false; // A los 2 segundos el tiempo vuelve a la normalidad, ¡pero sigue apuntando!
          }
        }
      } else {
        if (this.aimCooldown > 0) {
          this.aimCooldown -= dt;
          if (this.aimCooldown <= 0) {
            this.aimCooldown = 0;
            this.aimTimer = 2.0; // ¡1.5s pasaron tras soltar: Bullet-Time vuelve a funcionar!
          }
        }
      }

      // Animación de zoom de cámara FOV y alineación ADS
      let targetFOV = 75;
      if (this.isAiming && this.weapon && this.weapon.ammo > 0) {
        targetFOV = (this.weapon.type === 'sniper') ? 22 : 45;
      }
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, dt * 14);
      camera.updateProjectionMatrix();

      // Control del HUD para mira de sniper y crosshair
      const sniperOverlay = document.getElementById('sniper-scope-overlay');
      const fpsCrosshair = document.getElementById('fps-crosshair');
      if (this.isAiming && this.weapon && this.weapon.type === 'sniper') {
        if (sniperOverlay) sniperOverlay.classList.remove('hidden');
        if (fpsCrosshair) fpsCrosshair.style.opacity = '0';
      } else {
        if (sniperOverlay) sniperOverlay.classList.add('hidden');
        if (fpsCrosshair) fpsCrosshair.style.opacity = '1';
      }

      // Recuperación suave del retroceso y temblor
      this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, dt * 9.5);
      this.recoilRot = THREE.MathUtils.lerp(this.recoilRot, 0, dt * 9.5);
      this.recoilX = THREE.MathUtils.lerp(this.recoilX, 0, dt * 9.5);
      this.cameraShakePitch = THREE.MathUtils.lerp(this.cameraShakePitch, 0, dt * 12);

      // Recuperación elástica del balanceo por ratón (Sway)
      this.swayX = THREE.MathUtils.lerp(this.swayX, 0, dt * 9.0);
      this.swayY = THREE.MathUtils.lerp(this.swayY, 0, dt * 9.0);
      this.swayRotZ = THREE.MathUtils.lerp(this.swayRotZ, 0, dt * 9.0);

      // Animación de puño marcial
      if (this.isPunching) {
        this.punchProgress += dt * 5.2;
        if (this.punchProgress >= 1.0) {
          this.isPunching = false;
          this.punchProgress = 0;
        }
      }

      // Cálculo de movimiento en espacio 3D
      let moveZ = 0;
      let moveX = 0;

      if (keys.KeyW || keys.ArrowUp) moveZ += 1;
      if (keys.KeyS || keys.ArrowDown) moveZ -= 1;
      if (keys.KeyA || keys.ArrowLeft) moveX -= 1;
      if (keys.KeyD || keys.ArrowRight) moveX += 1;

      if (joystick.active) {
        moveX += joystick.dirX;
        moveZ -= joystick.dirY;
      }

      const inputLen = Math.hypot(moveX, moveZ);
      if (inputLen > 0.01) {
        const norm = Math.min(1.0, inputLen) / inputLen;
        moveX *= norm;
        moveZ *= norm;
        this.bobTimer += dt * 8.5;
      } else {
        this.bobTimer = THREE.MathUtils.lerp(this.bobTimer, 0, dt * 6);
      }

      const targetStrafeTilt = moveX * -0.035;
      this.strafeTilt = THREE.MathUtils.lerp(this.strafeTilt, targetStrafeTilt, dt * 7.5);

      const forwardX = -Math.sin(this.yaw);
      const forwardZ = -Math.cos(this.yaw);
      const rightX = -forwardZ;
      const rightZ = forwardX;

      const vx = (forwardX * moveZ + rightX * moveX) * this.speed;
      const vz = (forwardZ * moveZ + rightZ * moveX) * this.speed;

      const newPos = this.position.clone();
      newPos.x += vx * dt;
      resolveCircleAABBCollision(newPos, this.radius, 'x');

      newPos.z += vz * dt;
      resolveCircleAABBCollision(newPos, this.radius, 'z');

      if (currentRoomBounds) {
        newPos.x = Math.max(currentRoomBounds.minX, Math.min(currentRoomBounds.maxX, newPos.x));
        newPos.z = Math.max(currentRoomBounds.minZ, Math.min(currentRoomBounds.maxZ, newPos.z));
      }

      this.position.copy(newPos);
      this.updateCameraTransform();

      this.checkWeaponPickup();
    }

    updateCameraTransform() {
      cameraRig.position.copy(this.position);
      cameraRig.rotation.y = this.yaw;
      cameraPitchObject.rotation.x = this.pitch + this.cameraShakePitch;
      cameraPitchObject.rotation.z = this.strafeTilt;

      const bobX = Math.cos(this.bobTimer * 0.5) * 0.048;
      const bobY = Math.abs(Math.sin(this.bobTimer)) * 0.038;
      const bobRotZ = Math.sin(this.bobTimer * 0.5) * 0.055;
      const bobRotX = Math.sin(this.bobTimer) * 0.035;

      const idleBreatheY = Math.sin(this.idleTimer * 2.2) * 0.008;
      const idleBreatheRotX = Math.sin(this.idleTimer * 1.6) * 0.008;

      const punchOffsetZ = this.isPunching ? Math.sin(this.punchProgress * Math.PI) * -0.68 : 0;
      const punchRotY = this.isPunching ? Math.sin(this.punchProgress * Math.PI) * 0.35 : 0;
      const punchRotZ = this.isPunching ? Math.sin(this.punchProgress * Math.PI) * -0.28 : 0;

      // Posicionamiento de arma con interpolación suave hacia el centro al apuntar (ADS)
      let targetX = 0.30;
      let targetY = -0.26;
      let targetZ = -0.62;

      if (this.isAiming && this.weapon && this.weapon.ammo > 0) {
        targetX = 0;
        targetY = -0.16;
        targetZ = -0.38;
      }

      const lerpFactor = this.isAiming ? 0.85 : 0.15;
      const currX = THREE.MathUtils.lerp(0.30, targetX, lerpFactor);
      const currY = THREE.MathUtils.lerp(-0.26, targetY, lerpFactor);
      const currZ = THREE.MathUtils.lerp(-0.62, targetZ, lerpFactor);

      this.viewWeaponGroup.position.set(
        currX + bobX + this.swayX + this.recoilX,
        currY - bobY + idleBreatheY + this.swayY,
        currZ + this.recoilZ + punchOffsetZ
      );

      this.viewWeaponGroup.rotation.set(
        this.recoilRot + bobRotX + idleBreatheRotX,
        punchRotY,
        bobRotZ + this.swayRotZ + punchRotZ
      );
    }

    destroy() {
      cameraPitchObject.remove(this.viewWeaponGroup);
    }

    updateViewWeaponModel() {
      // Liberar geometrías y materiales huérfanos de la VRAM para evitar micro-tirones y fugas de memoria
      function disposeHierarchy(obj) {
        if (!obj) return;
        if (obj.children) {
          for (let i = obj.children.length - 1; i >= 0; i--) {
            disposeHierarchy(obj.children[i]);
          }
        }
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }

      while (this.viewWeaponGroup.children.length > 0) {
        const obj = this.viewWeaponGroup.children[0];
        this.viewWeaponGroup.remove(obj);
        disposeHierarchy(obj);
      }

      if (!this.weapon || this.weapon.ammo <= 0) {
        const model = createWeaponMesh3D('fist', true, currentGlobalTheme);
        this.viewWeaponGroup.add(model);
      } else {
        const model = createWeaponMesh3D(this.weapon.type, true, currentGlobalTheme);
        this.viewWeaponGroup.add(model);
      }
      triggerReticlePulse();
    }

    shoot() {
      if (this.isReloading) return false;

      if (this.weapon && this.weapon.ammo > 0) {
        this.weapon.ammo--;
        crosshairBurstSpread = Math.min(26, crosshairBurstSpread + 7.5);

        // Calibre del arma determina el retroceso y la sacudida de pantalla (Screen Shake)
        if (this.weapon.type === 'sniper') {
          this.recoilZ = 0.52;
          this.recoilRot = 0.60;
          this.recoilX = (Math.random() - 0.5) * 0.06;
          this.cameraShakePitch = 0.075;
        } else if (this.weapon.type === 'shotgun') {
          this.recoilZ = 0.40;
          this.recoilRot = 0.48;
          this.recoilX = (Math.random() - 0.5) * 0.05;
          this.cameraShakePitch = 0.050;
        } else if (this.weapon.type === 'plasma') {
          this.recoilZ = 0.32;
          this.recoilRot = 0.35;
          this.recoilX = (Math.random() - 0.5) * 0.04;
          this.cameraShakePitch = 0.038;
        } else if (this.weapon.type === 'rifle') {
          this.recoilZ = 0.20;
          this.recoilRot = 0.24;
          this.recoilX = (Math.random() - 0.5) * 0.03;
          this.cameraShakePitch = 0.022;
        } else if (this.weapon.type === 'smg') {
          this.recoilZ = 0.09;
          this.recoilRot = 0.11;
          this.recoilX = (Math.random() - 0.5) * 0.02;
          this.cameraShakePitch = 0.009;
        } else {
          this.recoilZ = 0.14;
          this.recoilRot = 0.16;
          this.recoilX = (Math.random() - 0.5) * 0.025;
          this.cameraShakePitch = 0.015;
        }

        // Dirección hacia donde mira la cámara 3D
        const shootDir = new THREE.Vector3();
        camera.getWorldDirection(shootDir);

        // Posición de inicio del proyectil (desde el cañón en 3D)
        const spawnPos = new THREE.Vector3();
        camera.getWorldPosition(spawnPos);
        spawnPos.addScaledVector(shootDir, 0.65);

        const pal = THEME_PALETTES[currentGlobalTheme] || THEME_PALETTES.cyan;
        const isCustomSkin = (activeSkin !== 'skin_default');
        const customSkinNeon = (SKINS_DATA[activeSkin] && SKINS_DATA[activeSkin].neonHex) ? SKINS_DATA[activeSkin].neonHex : null;

        const bulletColor = (isCustomSkin && customSkinNeon) ? customSkinNeon : null;

        // Fogonazo Poligonal Estrella (Muzzle Flash Starburst Fortnite VFX)
        muzzleFlashes.push(new MuzzleFlashStar3D(spawnPos, shootDir, bulletColor || 0xffd700));

        // Generar humo sutil de fogonazo solo cuando NO se está apuntando con mira limpia
        if (!this.isAiming) {
          smokeParticles.push(new SmokeParticle3D(spawnPos, shootDir));
        }

        if (this.weapon.type === 'pistol') {
          const col = bulletColor || pal.bulletHex;
          bullets.push(new Bullet3D(spawnPos, shootDir, 48, false, 'pistol', col));
          window.chronoAudio.playPistol();
          triggerMuzzleLight(col);

        } else if (this.weapon.type === 'shotgun') {
          const col = bulletColor || 0xf59e0b;
          const count = 6;
          for (let i = 0; i < count; i++) {
            const spreadDir = shootDir.clone();
            spreadDir.x += (Math.random() - 0.5) * 0.09;
            spreadDir.y += (Math.random() - 0.5) * 0.09;
            spreadDir.z += (Math.random() - 0.5) * 0.09;
            spreadDir.normalize();
            bullets.push(new Bullet3D(spawnPos, spreadDir, 44 + Math.random() * 6, false, 'shotgun', col));
          }
          window.chronoAudio.playShotgun();
          triggerMuzzleLight(col);

        } else if (this.weapon.type === 'smg') {
          const col = bulletColor || 0x38bdf8;
          const spreadDir = shootDir.clone();
          spreadDir.x += (Math.random() - 0.5) * 0.045;
          spreadDir.y += (Math.random() - 0.5) * 0.045;
          spreadDir.z += (Math.random() - 0.5) * 0.045;
          spreadDir.normalize();
          bullets.push(new Bullet3D(spawnPos, spreadDir, 58, false, 'smg', col));
          window.chronoAudio.playRifle();
          triggerMuzzleLight(col);

        } else if (this.weapon.type === 'rifle') {
          const col = bulletColor || 0x10b981;
          const spreadDir = shootDir.clone();
          spreadDir.x += (Math.random() - 0.5) * 0.035;
          spreadDir.y += (Math.random() - 0.5) * 0.035;
          spreadDir.z += (Math.random() - 0.5) * 0.035;
          spreadDir.normalize();
          bullets.push(new Bullet3D(spawnPos, spreadDir, 62, false, 'rifle', col));
          window.chronoAudio.playRifle();
          triggerMuzzleLight(col);

        } else if (this.weapon.type === 'sniper') {
          const col = bulletColor || 0xa855f7;
          bullets.push(new Bullet3D(spawnPos, shootDir, 95, false, 'sniper', col));
          window.chronoAudio.playSniper();
          triggerMuzzleLight(col);

        } else if (this.weapon.type === 'plasma') {
          const col = bulletColor || 0xff0a85;
          bullets.push(new Bullet3D(spawnPos, shootDir, 34, false, 'plasma', col));
          window.chronoAudio.playPlasma();
          triggerMuzzleLight(col);
        }

        if (this.weapon.type !== 'fist' && this.weapon.type !== 'plasma') {
          ejectedShells.push(new EjectedShell3D(spawnPos, shootDir, this.weapon.type !== 'shotgun'));
        }

        updateHUD();
        // Si se acabó la munición, cambiar inmediatamente al modelo de puños
        if (this.weapon.ammo <= 0) {
          this.updateViewWeaponModel();
        }
        return true;
      } else if (this.weapon && this.weapon.ammo <= 0) {
        window.chronoAudio.playEmptyClick();
        // Asegurar que el modelo muestre puños aunque el arma esté vacía
        this.updateViewWeaponModel();
        return false;
      } else {
        this.punch();
        return true;
      }
    }

    punch() {
      if (this.isPunching) return;
      this.isPunching = true;
      this.punchProgress = 0;
      window.chronoAudio.playMelee();

      const lookDir = new THREE.Vector3();
      camera.getWorldDirection(lookDir);

      // Vector horizontal de la mirada del jugador (plano XZ)
      const lookH = new THREE.Vector2(lookDir.x, lookDir.z);
      if (lookH.lengthSq() > 0.0001) {
        lookH.normalize();
      } else {
        lookH.set(0, 1);
      }

      const pX = this.position.x;
      const pZ = this.position.z;

      let closestEnemy = null;
      let closestDist = Infinity;
      let closestIndex = -1;

      // Buscar el enemigo más cercano en rango frontal o cuerpo a cuerpo directo
      for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        const dx = en.position.x - pX;
        const dz = en.position.z - pZ;
        const horizDist = Math.hypot(dx, dz);

        // Rango de golpe cuerpo a cuerpo ampliado (hasta 3.0 metros)
        if (horizDist <= 3.0) {
          const toEnemyH = new THREE.Vector2(dx, dz);
          const lenSq = toEnemyH.lengthSq();
          let dotH = 1.0;
          if (lenSq > 0.0001) {
            toEnemyH.multiplyScalar(1 / Math.sqrt(lenSq));
            dotH = lookH.dot(toEnemyH);
          }

          // Si estamos cara a cara (< 1.5m), conecta en casi cualquier ángulo frontal (dot > 0.1)
          // Si estamos a distancia media, requiere estar en el cono frontal visual (dot > 0.42)
          const minDot = horizDist < 1.5 ? 0.10 : 0.42;

          if (dotH >= minDot) {
            if (horizDist < closestDist) {
              closestDist = horizDist;
              closestEnemy = en;
              closestIndex = i;
            }
          }
        }
      }

      if (closestEnemy) {
        // Micro-empuje controlado: solo 0.2m en XZ (NUNCA expulsa al enemigo fuera del rango de combo)
        closestEnemy.position.x += lookH.x * 0.2;
        closestEnemy.position.z += lookH.y * 0.2;
        resolveCircleAABBCollision(closestEnemy.position, closestEnemy.radius, 'x');
        resolveCircleAABBCollision(closestEnemy.position, closestEnemy.radius, 'z');

        // Aturdimiento / Stagger: interrumpe el disparo y telegrafiado enemigo para no recibir balazos cara a cara
        closestEnemy.telegraphTimer = 0;
        if (closestEnemy.laserLine) closestEnemy.laserLine.visible = false;
        closestEnemy.cooldownTimer = Math.max(closestEnemy.cooldownTimer, 0.7);

        // 3 de daño por golpe: permite derrotar enemigos de 5 vidas en 2 puñetazos fluidos y consecutivos sin tener que alejarse
        if (closestEnemy.takeDamage(3, lookDir)) {
          enemies.splice(closestIndex, 1);
          checkVictory();
        }
      }
    }

    throwWeapon() {
      if (!this.weapon) return;

      const shootDir = new THREE.Vector3();
      camera.getWorldDirection(shootDir);

      const spawnPos = new THREE.Vector3();
      camera.getWorldPosition(spawnPos);
      spawnPos.addScaledVector(shootDir, 0.5);

      const thrown = new ThrownWeapon3D(spawnPos, shootDir, 36, this.weapon);
      thrownWeapons.push(thrown);

      window.chronoAudio.playThrow();
      this.weapon = null; // Queda desarmado (puños)
      this.updateViewWeaponModel();
      updateHUD();
    }

    checkWeaponPickup() {
      const needsWeapon = !this.weapon || this.weapon.ammo <= 0;
      if (!needsWeapon) return;

      for (let i = groundWeapons.length - 1; i >= 0; i--) {
        const gw = groundWeapons[i];
        const dist = this.position.distanceTo(gw.position);
        if (dist < 1.8) {
          this.weapon = {
            type: gw.type,
            name: gw.name,
            ammo: gw.ammo,
            maxAmmo: gw.maxAmmo
          };
          gw.destroy();
          groundWeapons.splice(i, 1);
          window.chronoAudio.playPickup();
          this.updateViewWeaponModel();
          updateHUD();
          break;
        }
      }
    }
  }

  // Vectores reusables para IA y Raycasts (Cero Garbage Collection para máxima fluidez)
  const _enemyRayStart = new THREE.Vector3();
  const _enemyRayTarget = new THREE.Vector3();
  const _tempRayDir = new THREE.Vector3();
  const _tempRay = new THREE.Ray();
  const _tempBoxHit = new THREE.Vector3();

  // ========================================================
  // 6. CLASE ENEMY 3D (FIGURAS DE CRISTAL ROJO FACETADO)
  // ========================================================
  class Enemy3D {
    constructor(x, z, weaponType = 'pistol', rotY = Math.PI) {
      this.position = new THREE.Vector3(x, 0, z);
      this.weaponType = weaponType;
      this.rotY = rotY;
      // Velocidad escalada por dificultad del mapa
      this.speed = 5.2 * currentMapDifficultyMod;
      this.radius = 0.55;

      // 5 VIDAS PARA LOS NPC
      this.hp = 5;
      this.maxHp = 5;
      this.hitFlashTimer = 0;

      // IA y Telegrafiado con láser — más corto en mapas difíciles = disparan MUCHO más rápido
      this.state = 'patrol';
      this.telegraphTimer = 0;
      const baseTelegraph = this.weaponType === 'sniper' ? 0.55 : (this.weaponType === 'rifle' ? 0.32 : 0.42);
      this.telegraphDuration = baseTelegraph / currentMapDifficultyMod;
      this.cooldownTimer = 0;
      const baseCooldown = this.weaponType === 'rifle' ? 0.65 : (this.weaponType === 'sniper' ? 1.25 : 0.88);
      this.cooldownDuration = baseCooldown / currentMapDifficultyMod;

      // Crear Malla 3D Humanoide de Cristal Rojo Facetado (Estilo SUPERHOT)
      this.mesh = new THREE.Group();
      this.mesh.position.copy(this.position);

      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x990518,
        emissive: 0xbb0a22,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.85,
        flatShading: true
      });
      this.crystalMat = crystalMat;

      // Torso angular
      const torsoGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.75, 6);
      const torso = new THREE.Mesh(torsoGeo, crystalMat);
      torso.position.y = 1.15;
      torso.castShadow = true;
      this.mesh.add(torso);

      // Cabeza facetada de diamante
      const headGeo = new THREE.IcosahedronGeometry(0.24, 0);
      const head = new THREE.Mesh(headGeo, crystalMat);
      head.position.y = 1.72;
      head.castShadow = true;
      this.mesh.add(head);

      // Piernas de cristal
      const legGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.8, 5);
      const legL = new THREE.Mesh(legGeo, crystalMat);
      legL.position.set(-0.16, 0.4, 0);
      legL.castShadow = true;
      const legR = legL.clone();
      legR.position.x = 0.16;
      this.mesh.add(legL, legR);

      // Brazo con arma
      const armGeo = new THREE.BoxGeometry(0.1, 0.1, 0.45);
      const arm = new THREE.Mesh(armGeo, crystalMat);
      arm.position.set(0.35, 1.2, 0.25);
      this.mesh.add(arm);

      // Arma 3D sostenida con modelo geométrico detallado
      const heldGun = createWeaponMesh3D(this.weaponType, false, 'crimson');
      heldGun.scale.setScalar(0.92);
      heldGun.position.set(0.35, 1.2, 0.45);
      this.mesh.add(heldGun);

      // Láser 3D telegrafiado
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1)
      ]);
      this.laserMat = new THREE.LineBasicMaterial({
        color: 0xff2052,
        transparent: true,
        opacity: 0
      });
      this.laserLine = new THREE.Line(laserGeo, this.laserMat);
      this.laserLine.visible = false;
      scene.add(this.laserLine);

      // 5 Pips 3D de Salud sobre la cabeza
      this.healthPipsGroup = new THREE.Group();
      this.healthPipsGroup.position.set(0, 2.15, 0);
      this.pips = [];

      for (let p = 0; p < 5; p++) {
        const pipGeo = new THREE.OctahedronGeometry(0.05, 0);
        const pipMat = new THREE.MeshBasicMaterial({ color: 0xff2052 });
        const pipMesh = new THREE.Mesh(pipGeo, pipMat);
        pipMesh.position.x = (p - 2) * 0.13;
        this.healthPipsGroup.add(pipMesh);
        this.pips.push(pipMesh);
      }
      this.mesh.add(this.healthPipsGroup);

      scene.add(this.mesh);
    }

    takeDamage(amount = 1, impactDir = null) {
      const isCrit = (Math.random() < 0.28 || amount >= 3);
      const actualDmg = isCrit ? amount * 2 : amount;
      this.hp = Math.max(0, this.hp - actualDmg);
      this.hitFlashTimer = 0.18;
      this.crystalMat.color.setHex(0xffffff);
      this.crystalMat.emissive.setHex(0xffffff);

      if (impactDir) {
        this.position.x += impactDir.x * (0.18 + actualDmg * 0.12);
        this.position.z += impactDir.z * (0.18 + actualDmg * 0.12);
        for (let d = 0; d < 5; d++) {
          debrisParticles.push(new DebrisParticle3D(this.position.clone().add(new THREE.Vector3(0, 1.2, 0)), impactDir.clone().negate()));
        }
      }

      window.chronoAudio.playEnemyHurt();
      triggerHitmarker(actualDmg, this.position.clone().add(new THREE.Vector3(0, 1.4, 0)), isCrit, false);

      for (let p = 0; p < 5; p++) {
        this.pips[p].visible = p < this.hp;
      }

      if (this.hp <= 0) {
        this.shatter(impactDir);
        return true;
      }
      return false;
    }

    shatter(impactDir) {
      window.chronoAudio.playCrystalShatter();

      // Generar 24 esquirlas de cristal rojo poligonales en 3D
      const origin = this.position.clone().add(new THREE.Vector3(0, 1.1, 0));
      for (let s = 0; s < 24; s++) {
        crystalShards.push(new CrystalShard3D(origin, impactDir));
      }

      // Soltar arma cargada al suelo en 3D
      dropEnemyWeapon3D(this);

      this.destroy();
    }

    destroy() {
      if (this.laserLine) {
        scene.remove(this.laserLine);
      }
      if (this.mesh) {
        scene.remove(this.mesh);
      }
    }

    update(dt, timeScale) {
      const scaledDt = dt * timeScale;

      // Destello blanco tras impacto
      if (this.hitFlashTimer > 0) {
        this.hitFlashTimer -= scaledDt;
        if (this.hitFlashTimer <= 0) {
          this.crystalMat.color.setHex(0x990518);
          this.crystalMat.emissive.setHex(0xbb0a22);
        }
      }

      this.mesh.position.y = this.position.y;

      if (!player) return;

      const pPos = player.position;
      const dx = pPos.x - this.position.x;
      const dz = pPos.z - this.position.z;
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      // Comprobar línea de visión directa en 3D (Raycast contra paredes con vectores preasignados)
      _enemyRayStart.set(this.position.x, this.position.y + 1.4, this.position.z);
      _enemyRayTarget.set(pPos.x, pPos.y - 0.2, pPos.z);
      const hasLOS = checkLineOfSight3D(_enemyRayStart, _enemyRayTarget);

      // Rotar hacia el jugador
      const targetAngle = Math.atan2(dx, dz);
      this.rotY = THREE.MathUtils.lerp(this.rotY, targetAngle, 0.22);
      this.mesh.rotation.y = this.rotY;

      // Movimiento táctico: flanquear o avanzar con resolución de colisiones y límites de sala
      if (distToPlayer > 3.0) {
        const enemyMoveSpeed = this.speed * (hasLOS ? 0.52 : 0.88);
        this.position.x += Math.sin(this.rotY) * enemyMoveSpeed * scaledDt;
        resolveCircleAABBCollision(this.position, this.radius, 'x');

        this.position.z += Math.cos(this.rotY) * enemyMoveSpeed * scaledDt;
        resolveCircleAABBCollision(this.position, this.radius, 'z');

        if (currentRoomBounds) {
          this.position.x = Math.max(currentRoomBounds.minX, Math.min(currentRoomBounds.maxX, this.position.x));
          this.position.z = Math.max(currentRoomBounds.minZ, Math.min(currentRoomBounds.maxZ, this.position.z));
        }

        this.mesh.rotation.z = 0;
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
      } else {
        this.mesh.rotation.z = 0;
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
      }

      if (hasLOS) {
        if (this.cooldownTimer > 0) {
          this.cooldownTimer -= scaledDt;
          this.laserLine.visible = false;
        } else {
          // Telegrafiado con láser 3D rápido
          this.state = 'aiming';
          this.telegraphTimer += scaledDt;
          const progress = Math.min(1.0, this.telegraphTimer / this.telegraphDuration);

          // Actualizar rayo láser 3D sin alocar objetos
          const gunTipX = this.position.x + Math.cos(this.rotY) * 0.35 + Math.sin(this.rotY) * 0.5;
          const gunTipY = this.position.y + 1.2;
          const gunTipZ = this.position.z - Math.sin(this.rotY) * 0.35 + Math.cos(this.rotY) * 0.5;

          const positions = this.laserLine.geometry.attributes.position.array;
          positions[0] = gunTipX;
          positions[1] = gunTipY;
          positions[2] = gunTipZ;
          positions[3] = pPos.x;
          positions[4] = pPos.y - 0.2;
          positions[5] = pPos.z;
          this.laserLine.geometry.attributes.position.needsUpdate = true;

          const blink = Math.sin(progress * Math.PI * 16) > 0 || progress > 0.8;
          this.laserMat.opacity = blink ? 0.95 : 0.35;
          this.laserLine.visible = true;

          if (this.telegraphTimer >= this.telegraphDuration) {
            this.shoot();
            this.telegraphTimer = 0;
            this.cooldownTimer = this.cooldownDuration;
            this.laserLine.visible = false;
          }
        }
      } else {
        this.laserLine.visible = false;
        this.telegraphTimer = Math.max(0, this.telegraphTimer - scaledDt * 2);
        if (this.cooldownTimer > 0) this.cooldownTimer -= scaledDt;
      }
    }

    shoot() {
      if (!player) return;

      const playerTarget = player.position.clone().add(new THREE.Vector3(0, -0.2, 0));
      const gunTip = this.position.clone().add(new THREE.Vector3(
        Math.cos(this.rotY) * 0.35 + Math.sin(this.rotY) * 0.5,
        1.2,
        -Math.sin(this.rotY) * 0.35 + Math.cos(this.rotY) * 0.5
      ));

      const shootDir = playerTarget.clone().sub(gunTip).normalize();

      if (this.weaponType === 'pistol') {
        shootDir.x += (Math.random() - 0.5) * 0.05;
        shootDir.z += (Math.random() - 0.5) * 0.05;
        shootDir.normalize();
        bullets.push(new Bullet3D(gunTip, shootDir, 28, true, 'pistol', 0xff2052));
        window.chronoAudio.playPistol();

      } else if (this.weaponType === 'shotgun') {
        for (let i = 0; i < 5; i++) {
          const spreadDir = shootDir.clone();
          spreadDir.x += (Math.random() - 0.5) * 0.14;
          spreadDir.y += (Math.random() - 0.5) * 0.1;
          spreadDir.z += (Math.random() - 0.5) * 0.14;
          spreadDir.normalize();
          bullets.push(new Bullet3D(gunTip, spreadDir, 26 + Math.random() * 4, true, 'shotgun', 0xff2052));
        }
        window.chronoAudio.playShotgun();

      } else if (this.weaponType === 'rifle') {
        for (let r = 0; r < 3; r++) {
          setTimeout(() => {
            if (gameState !== 'playing' || !enemies.includes(this)) return;
            const rDir = shootDir.clone();
            rDir.x += (Math.random() - 0.5) * 0.06;
            rDir.z += (Math.random() - 0.5) * 0.06;
            rDir.normalize();
            bullets.push(new Bullet3D(gunTip, rDir, 34, true, 'rifle', 0xff2052));
            window.chronoAudio.playRifle();
          }, r * 110);
        }

      } else if (this.weaponType === 'sniper') {
        bullets.push(new Bullet3D(gunTip, shootDir, 55, true, 'sniper', 0xff2052));
        window.chronoAudio.playSniper();
      }
    }
  }

  // ========================================================
  // 7. CLASE BULLET 3D (PROYECTILES FLOTANTES CON LUZ Y ESTELA)
  // ========================================================
  class Bullet3D {
    constructor(pos, dir, speed, isEnemy, weaponType = 'pistol', hexColor = 0x00f0ff) {
      this.position = pos.clone();
      this.velocity = dir.clone().multiplyScalar(speed);
      this.isEnemy = isEnemy;
      this.weaponType = weaponType;
      this.hexColor = hexColor;
      this.radius = weaponType === 'plasma' ? 0.35 : (weaponType === 'shotgun' ? 0.12 : 0.16);
      this.lifeTime = weaponType === 'sniper' ? 1.8 : 2.5;
      this.damage = (weaponType === 'sniper' || weaponType === 'plasma') ? 2 : 1;
      this.hitEnemies = [];

      // Malla 3D de la bala con núcleo blanco puro hiper-brillante y halo de plasma exterior
      this.mesh = new THREE.Group();

      if (weaponType === 'plasma') {
        const coreGeo = new THREE.SphereGeometry(this.radius * 0.75, 10, 10);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.mesh.add(coreMesh);

        const haloGeo = new THREE.SphereGeometry(this.radius * 1.35, 10, 10);
        const haloMat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.55 });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        this.mesh.add(haloMesh);
      } else {
        const coreGeo = new THREE.CylinderGeometry(this.radius * 0.75, this.radius * 0.75, 0.42, 6);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.mesh.add(coreMesh);

        const haloGeo = new THREE.CylinderGeometry(this.radius * 1.45, this.radius * 1.45, 0.52, 6);
        const haloMat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.5 });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        this.mesh.add(haloMesh);

        this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      }

      this.mesh.position.copy(this.position);
      this.light = null;

      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const scaledDt = dt * timeScale;
      this.lifeTime -= scaledDt;

      this.position.addScaledVector(this.velocity, scaledDt);
      this.mesh.position.copy(this.position);
      if (this.light) this.light.position.copy(this.position);

      // Colisión de bala contra muros 3D
      for (const box of mapColliders) {
        if (box.containsPoint(this.position)) {
          if (this.weaponType === 'plasma') {
            this.detonatePlasma();
          } else {
            for (let sp = 0; sp < 8; sp++) {
              sparkParticles.push(new SparkParticle3D(this.position, this.velocity.clone().negate().normalize()));
            }
          }
          this.destroy();
          return true;
        }
      }

      // Comprobar si la bala sale fuera de los límites del mapa
      if (currentRoomBounds) {
        if (
          this.position.x < currentRoomBounds.minX - 0.8 ||
          this.position.x > currentRoomBounds.maxX + 0.8 ||
          this.position.z < currentRoomBounds.minZ - 0.8 ||
          this.position.z > currentRoomBounds.maxZ + 0.8
        ) {
          if (this.weaponType === 'plasma') {
            this.detonatePlasma();
          } else {
            for (let sp = 0; sp < 6; sp++) {
              sparkParticles.push(new SparkParticle3D(this.position, this.velocity.clone().negate().normalize()));
            }
          }
          this.destroy();
          return true;
        }
      }

      // Colisión contra entidades
      if (this.isEnemy) {
        // Bala enemiga contra Jugador
        if (player && this.position.distanceTo(player.position) < (player.radius + this.radius + 0.4)) {
          player.takeDamage(1);
          this.destroy();
          return true;
        }
      } else {
        // Bala del jugador contra Enemigos
        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies[i];
          const dist = this.position.distanceTo(en.position.clone().add(new THREE.Vector3(0, 1.1, 0)));
          if (dist < (en.radius + this.radius + 0.5)) {
            if (this.weaponType === 'plasma') {
              this.detonatePlasma();
              this.destroy();
              return true;
            } else if (this.weaponType === 'sniper') {
              if (!this.hitEnemies.includes(en)) {
                this.hitEnemies.push(en);
                if (en.takeDamage(2, this.velocity.clone().normalize())) {
                  enemies.splice(i, 1);
                  checkVictory();
                }
              }
            } else {
              if (en.takeDamage(1, this.velocity.clone().normalize())) {
                enemies.splice(i, 1);
                checkVictory();
              }
              this.destroy();
              return true;
            }
          }
        }
      }

      if (this.lifeTime <= 0) {
        this.destroy();
        return true;
      }
      return false;
    }

    detonatePlasma() {
      window.chronoAudio.playPlasma();
      triggerScreenRedFlash(0.35);

      for (let j = enemies.length - 1; j >= 0; j--) {
        const en = enemies[j];
        if (this.position.distanceTo(en.position.clone().add(new THREE.Vector3(0, 1.1, 0))) <= 4.2) {
          if (en.takeDamage(2, en.position.clone().sub(this.position).normalize())) {
            enemies.splice(j, 1);
            checkVictory();
          }
        }
      }
    }

    destroy() {
      if (this.light) scene.remove(this.light);
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 8. CLASE THROWN WEAPON 3D (ARMA LANZADA GIRATORIA)
  // ========================================================
  class ThrownWeapon3D {
    constructor(pos, dir, speed, weaponData) {
      this.position = pos.clone();
      this.velocity = dir.clone().multiplyScalar(speed);
      this.weapon = weaponData;
      this.radius = 0.55;
      this.isLethal = true;

      this.mesh = new THREE.Group();
      const model = createWeaponMesh3D(this.weapon ? this.weapon.type : 'pistol', false, currentGlobalTheme);
      model.scale.setScalar(1.2);
      this.mesh.add(model);
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const scaledDt = dt * timeScale;
      this.position.addScaledVector(this.velocity, scaledDt);
      this.velocity.multiplyScalar(Math.pow(0.94, scaledDt * 60));

      this.mesh.rotation.x += 18 * scaledDt;
      this.mesh.rotation.y += 12 * scaledDt;
      this.mesh.position.copy(this.position);

      const currentSpeed = this.velocity.length();
      if (currentSpeed < 6) this.isLethal = false;

      if (this.isLethal) {
        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies[i];
          const dist = this.position.distanceTo(en.position.clone().add(new THREE.Vector3(0, 1.1, 0)));
          if (dist < (en.radius + this.radius)) {
            if (en.takeDamage(5, this.velocity.clone().normalize())) {
              enemies.splice(i, 1);
              checkVictory();
            }
            this.settleOnFloor();
            return true;
          }
        }
      }

      for (const box of mapColliders) {
        if (box.containsPoint(this.position)) {
          this.settleOnFloor();
          return true;
        }
      }

      if (this.position.y <= 0.2 || currentSpeed < 1.5) {
        this.settleOnFloor();
        return true;
      }
      return false;
    }

    settleOnFloor() {
      groundWeapons.push(new GroundWeapon3D(
        this.position.x,
        this.position.z,
        this.weapon.type,
        this.weapon.name,
        this.weapon.ammo,
        this.weapon.maxAmmo
      ));
      this.destroy();
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 9. CLASE GROUND WEAPON 3D (ARMAS RECOGIBLES EN EL SUELO)
  // ========================================================
  class GroundWeapon3D {
    constructor(x, z, type, name, ammo, maxAmmo) {
      this.position = new THREE.Vector3(x, 0.45, z);
      this.type = type;
      this.name = name;
      this.ammo = ammo;
      this.maxAmmo = maxAmmo;
      this.rotY = Math.random() * Math.PI * 2;
      this.bobTimer = Math.random() * Math.PI * 2;
      this.hopAnim = 0; // Para animación de salto al salir del cofre

      let hexColor = 0x00f0ff;
      if (type === 'shotgun') hexColor = 0xf59e0b;
      else if (type === 'rifle') hexColor = 0x10b981;
      else if (type === 'sniper') hexColor = 0xa855f7;
      else if (type === 'plasma') hexColor = 0xff0a85;

      this.mesh = new THREE.Group();
      const model = createWeaponMesh3D(type, false, currentGlobalTheme);
      model.scale.setScalar(1.25);
      model.rotation.z = 0.28;
      this.mesh.add(model);
      this.mesh.position.copy(this.position);

      if (!isMobileDevice && groundWeapons.length < 3) {
        this.light = new THREE.PointLight(hexColor, 0.9, 2.5);
        this.light.position.set(x, 0.55, z);
        scene.add(this.light);
      } else {
        this.light = null;
      }

      scene.add(this.mesh);
    }

    update(dt) {
      if (this.hopAnim > 0) {
        this.hopAnim = Math.max(0, this.hopAnim - dt * 2.2);
        const arc = Math.sin(this.hopAnim * Math.PI) * 0.9;
        this.mesh.position.y = 0.45 + arc;
        this.mesh.rotation.y += dt * 8.0;
        this.mesh.rotation.x += dt * 4.0;
      } else {
        this.bobTimer += dt * 3.2;
        this.rotY += dt * 1.6;
        this.mesh.rotation.y = this.rotY;
        this.mesh.rotation.x = 0;
        this.mesh.position.y = 0.42 + Math.sin(this.bobTimer) * 0.08;
      }
      if (this.light) this.light.position.y = this.mesh.position.y + 0.15;
      if (this.mesh && this.mesh.children[0]) {
        const model = this.mesh.children[0];
        if (model.userData && model.userData.updatePlasma) {
          model.userData.updatePlasma(dt, this.ammo, false, 0, 1);
        }
      }
    }

    destroy() {
      if (this.light) scene.remove(this.light);
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 10. CLASE CYBER CHEST 3D (COFRES BLINDADOS INTERACTIVOS)
  // ========================================================
  class CyberChest3D {
    constructor(x, z, loot) {
      this.position = new THREE.Vector3(x, 0, z);
      this.loot = loot || { type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24 };
      this.isOpened = false;
      this.openAnim = 0;
      this.holdProgress = 0;
      this.requiredHoldTime = 1.1;

      // Grupo de Malla 3D del Cofre
      this.group = new THREE.Group();
      this.group.position.copy(this.position);

      // Cuerpo base metálico
      const baseGeo = new THREE.BoxGeometry(1.4, 0.8, 0.9);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.85
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.4;
      baseMesh.castShadow = true;
      this.group.add(baseMesh);

      // Banda de aleación dorada neón
      const goldMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const band = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.12, 0.94), goldMat);
      band.position.y = 0.4;
      this.group.add(band);

      // Tapa con bisagra articulada
      this.lidGroup = new THREE.Group();
      this.lidGroup.position.set(0, 0.8, -0.45);
      const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.18, 0.92), baseMat);
      lidMesh.position.set(0, 0.09, 0.45);
      this.lidGroup.add(lidMesh);
      this.group.add(this.lidGroup);

      // Anillo holográfico 3D de progreso radial
      const ringGeo = new THREE.RingGeometry(0.35, 0.42, 32);
      this.ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      this.ringMesh = new THREE.Mesh(ringGeo, this.ringMat);
      this.ringMesh.position.y = 1.6;
      this.ringMesh.rotation.x = -Math.PI / 2;
      this.group.add(this.ringMesh);

      if (!isMobileDevice) {
        this.light = new THREE.PointLight(0xf59e0b, 1.2, 4.5);
        this.light.position.set(0, 0.8, 0);
        this.group.add(this.light);
      } else {
        this.light = null;
      }

      scene.add(this.group);
    }

    update(dt) {
      if (this.isOpened) {
        // Animación suave de apertura de la tapa del cofre
        if (this.openAnim < 1.0) {
          this.openAnim = Math.min(1.0, this.openAnim + dt * 4.5);
          this.lidGroup.rotation.x = -this.openAnim * 1.85;
        }
        return;
      }
      if (!player) return;

      const dist = this.position.distanceTo(new THREE.Vector3(player.position.x, 0, player.position.z));

      if (dist < 2.8) {
        this.ringMesh.lookAt(camera.position);

        const isHolding = keys.KeyE || isHoldingTouchChest;
        if (isHolding) {
          this.holdProgress = Math.min(1.0, this.holdProgress + dt / this.requiredHoldTime);
          window.chronoAudio.playChestCharging(this.holdProgress);

          this.ringMat.opacity = 0.85;
          this.ringMesh.scale.setScalar(0.8 + this.holdProgress * 0.4);

          if (this.holdProgress >= 1.0) {
            this.open();
          }
        } else {
          this.holdProgress = Math.max(0, this.holdProgress - dt * 2.8);
          this.ringMat.opacity = 0.45;
          this.ringMesh.scale.setScalar(0.8);
        }
      } else {
        this.holdProgress = Math.max(0, this.holdProgress - dt * 3.5);
        this.ringMat.opacity = 0;
      }
    }

    open() {
      if (this.isOpened) return;
      this.isOpened = true;
      window.chronoAudio.playChestUnlock();
      this.ringMat.opacity = 0;

      // ARMAS SORTEADAS EN LOS COFRES
      const chestLootPool = [
        { type: 'rifle', name: 'RIFLE DE ASALTO', ammo: 24, maxAmmo: 24, weight: 35 },
        { type: 'shotgun', name: 'ESCOPETA DE PLASMA', ammo: 4, maxAmmo: 4, weight: 30 },
        { type: 'sniper', name: 'FRANCOTIRADOR RAILGUN', ammo: 5, maxAmmo: 5, weight: 20 },
        { type: 'plasma', name: 'CAÑÓN DE PLASMA', ammo: 5, maxAmmo: 5, weight: 15 }
      ];

      const totalWeight = chestLootPool.reduce((acc, it) => acc + it.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosenLoot = chestLootPool[0];
      for (const item of chestLootPool) {
        if (rand < item.weight) {
          chosenLoot = item;
          break;
        }
        rand -= item.weight;
      }

      // Soltar arma recompensada que salta fuera del cofre con animación
      const groundW = new GroundWeapon3D(
        this.position.x,
        this.position.z + 1.2,
        chosenLoot.type,
        chosenLoot.name,
        chosenLoot.ammo,
        chosenLoot.maxAmmo
      );
      groundW.hopAnim = 1.0;
      groundWeapons.push(groundW);

      if (player && (!player.weapon || player.weapon.ammo <= 0)) {
        player.weapon = { ...chosenLoot };
        player.updateViewWeaponModel();
        updateHUD();
        window.chronoAudio.playPickup();
      }
    }

    destroy() {
      if (this.group) scene.remove(this.group);
    }
  }

  // ========================================================
  // 11. CLASE CRYSTAL SHARD 3D (ESQUIRLAS DE CRISTAL ROJO)
  // ========================================================
  class CrystalShard3D {
    constructor(origin, impactDir) {
      this.position = origin.clone();
      const speed = 4 + Math.random() * 9;

      this.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.8 + 0.5,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed);

      if (impactDir) {
        this.velocity.addScaledVector(impactDir, 3.5);
      }

      this.rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18
      );

      this.lifeTime = 1.6 + Math.random() * 0.8;
      this.initialLife = this.lifeTime;

      const size = 0.08 + Math.random() * 0.14;
      const geo = new THREE.TetrahedronGeometry(size, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff2052,
        emissive: 0xff1535,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.85,
        transparent: true,
        opacity: 1.0,
        flatShading: true
      });

      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const scaledDt = dt * timeScale;
      this.lifeTime -= scaledDt;

      // Gravedad y velocidad
      this.velocity.y -= 9.8 * scaledDt;
      this.position.addScaledVector(this.velocity, scaledDt);

      // Rebote suave en el suelo
      if (this.position.y <= 0.05) {
        this.position.y = 0.05;
        this.velocity.y *= -0.4;
        this.velocity.x *= 0.7;
        this.velocity.z *= 0.7;
      }

      this.mesh.rotation.x += this.rotVel.x * scaledDt;
      this.mesh.rotation.y += this.rotVel.y * scaledDt;
      this.mesh.rotation.z += this.rotVel.z * scaledDt;
      this.mesh.position.copy(this.position);

      this.mesh.material.opacity = Math.max(0, this.lifeTime / this.initialLife);

      if (this.lifeTime <= 0) {
        this.destroy();
        return true;
      }
      return false;
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 11.5 CLASES SPARK, SMOKE, MUZZLE FLASH Y DEBRIS VFX (FORTNITE STYLE)
  // ========================================================
  let sparkParticles = [];
  let smokeParticles = [];
  let muzzleFlashes = [];
  let debrisParticles = [];

  class MuzzleFlashStar3D {
    constructor(spawnPos, shootDir, colorHex = 0xffd700) {
      this.position = spawnPos.clone();
      this.lifeTime = 0.05;
      this.initialLife = 0.05;

      const starGeo = new THREE.OctahedronGeometry(0.14 + Math.random() * 0.05, 0);
      const starMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.85
      });

      this.mesh = new THREE.Mesh(starGeo, starMat);
      this.mesh.position.copy(this.position);
      this.mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.mesh.scale.set(1.2, 1.2, 0.3);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      // Usar dt real (sin ralentizar por timeScale) para que el destello se disuelva al instante
      this.lifeTime -= dt * 4.0;
      if (this.lifeTime <= 0) {
        scene.remove(this.mesh);
        return true;
      }
      this.mesh.scale.multiplyScalar(1.1);
      this.mesh.material.opacity = Math.max(0, this.lifeTime / this.initialLife) * 0.85;
      return false;
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  class DebrisParticle3D {
    constructor(origin, normalDir) {
      this.position = origin.clone();
      const speed = 2.5 + Math.random() * 6.5;

      this.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2.5 + 0.8,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed);

      if (normalDir) {
        this.velocity.addScaledVector(normalDir, 2.5);
      }

      this.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );

      this.lifeTime = 0.4 + Math.random() * 0.35;
      this.initialLife = this.lifeTime;

      const size = 0.04 + Math.random() * 0.06;
      const geo = new THREE.DodecahedronGeometry(size, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.8,
        metalness: 0.2
      });

      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const effDt = dt * timeScale;
      this.lifeTime -= effDt;
      if (this.lifeTime <= 0) {
        scene.remove(this.mesh);
        return true;
      }

      this.velocity.y -= 14 * effDt;
      this.position.addScaledVector(this.velocity, effDt);
      this.mesh.rotation.x += this.rotSpeed.x * effDt;
      this.mesh.rotation.y += this.rotSpeed.y * effDt;
      this.mesh.position.copy(this.position);

      if (this.position.y <= 0.02) {
        this.position.y = 0.02;
        this.velocity.y *= -0.3;
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
      }
      return false;
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  class SparkParticle3D {
    constructor(origin, normalDir) {
      this.position = origin.clone();
      const speed = 3.5 + Math.random() * 8.5;

      this.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2.2 + 0.6,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed);

      if (normalDir) {
        this.velocity.addScaledVector(normalDir, 3.8);
      }

      this.lifeTime = 0.35 + Math.random() * 0.3;
      this.initialLife = this.lifeTime;

      const size = 0.035 + Math.random() * 0.045;
      const geo = new THREE.SphereGeometry(size, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 1.0
      });

      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      const scaledDt = dt * timeScale;
      this.lifeTime -= scaledDt;
      if (this.lifeTime <= 0) {
        scene.remove(this.mesh);
        return true;
      }

      this.velocity.y -= 12 * scaledDt;
      this.position.addScaledVector(this.velocity, scaledDt);
      this.mesh.position.copy(this.position);

      const ratio = Math.max(0, this.lifeTime / this.initialLife);
      this.mesh.material.opacity = ratio;
      return false;
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  class SmokeParticle3D {
    constructor(origin, dir) {
      this.position = origin.clone();
      // Desplazar el humo hacia arriba y hacia un lado para NO tapar la línea de visión al apuntar
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      this.position.addScaledVector(right, (Math.random() - 0.5) * 0.22);
      this.position.y += 0.12;

      this.velocity = right.clone().multiplyScalar((Math.random() - 0.5) * 0.6);
      this.velocity.y += 1.4 + Math.random() * 0.6;

      this.lifeTime = 0.14 + Math.random() * 0.08;
      this.initialLife = this.lifeTime;

      const size = 0.035 + Math.random() * 0.035;
      const geo = new THREE.SphereGeometry(size, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xcbd5e1,
        transparent: true,
        opacity: 0.18
      });

      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    }

    update(dt, timeScale) {
      // Usar dt real (sin ralentizar por timeScale) para disipación instantánea
      this.lifeTime -= dt * 3.5;
      if (this.lifeTime <= 0) {
        scene.remove(this.mesh);
        return true;
      }

      this.position.addScaledVector(this.velocity, dt);
      this.mesh.position.copy(this.position);
      
      const ratio = Math.max(0, this.lifeTime / this.initialLife);
      this.mesh.material.opacity = ratio * 0.18;
      return false;
    }

    destroy() {
      if (this.mesh) scene.remove(this.mesh);
    }
  }

  // ========================================================
  // 12. FÍSICA Y COLISIONES EN ESPACIO 3D
  // ========================================================

  function resolveCircleAABBCollision(pos, radius, axis) {
    for (const box of mapColliders) {
      if (
        pos.x + radius > box.min.x &&
        pos.x - radius < box.max.x &&
        pos.z + radius > box.min.z &&
        pos.z - radius < box.max.z
      ) {
        if (axis === 'x') {
          const midX = (box.min.x + box.max.x) * 0.5;
          if (pos.x < midX) {
            pos.x = box.min.x - radius;
          } else {
            pos.x = box.max.x + radius;
          }
        } else if (axis === 'z') {
          const midZ = (box.min.z + box.max.z) * 0.5;
          if (pos.z < midZ) {
            pos.z = box.min.z - radius;
          } else {
            pos.z = box.max.z + radius;
          }
        }
      }
    }
  }

  function checkLineOfSight3D(startPos, endPos) {
    _tempRayDir.subVectors(endPos, startPos);
    const maxDistSq = _tempRayDir.lengthSq();
    if (maxDistSq < 0.0001) return true;
    const maxDist = Math.sqrt(maxDistSq);
    _tempRayDir.multiplyScalar(1 / maxDist);

    _tempRay.origin.copy(startPos);
    _tempRay.direction.copy(_tempRayDir);

    const testDistLimit = Math.max(0, maxDist - 0.2);
    const testDistLimitSq = testDistLimit * testDistLimit;

    for (let i = 0; i < mapColliders.length; i++) {
      const hit = _tempRay.intersectBox(mapColliders[i], _tempBoxHit);
      if (hit && startPos.distanceToSquared(_tempBoxHit) < testDistLimitSq) {
        return false; // muro bloquea la visión
      }
    }
    return true;
  }

  function dropEnemyWeapon3D(enemy) {
    let name = 'PISTOLA';
    let ammo = 6;
    let maxAmmo = 6;
    if (enemy.weaponType === 'shotgun') {
      name = 'ESCOPETA DE ASALTO';
      ammo = 4;
      maxAmmo = 4;
    } else if (enemy.weaponType === 'rifle') {
      name = 'RIFLE DE ASALTO';
      ammo = 24;
      maxAmmo = 24;
    } else if (enemy.weaponType === 'sniper') {
      name = 'FRANCOTIRADOR RAILGUN';
      ammo = 5;
      maxAmmo = 5;
    } else if (enemy.weaponType === 'plasma') {
      name = 'CAÑÓN DE PLASMA';
      ammo = 5;
      maxAmmo = 5;
    }

    groundWeapons.push(new GroundWeapon3D(
      enemy.position.x,
      enemy.position.z,
      enemy.weaponType,
      name,
      ammo,
      maxAmmo
    ));
  }

  function triggerMuzzleLight(hexColor) {
    muzzleLight.color.setHex(hexColor);
    muzzleLight.intensity = 2.5;
    setTimeout(() => { muzzleLight.intensity = 0; }, 65);
  }

  function triggerScreenRedFlash(intensity = 0.5) {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    wrapper.style.boxShadow = `inset 0 0 60px rgba(255, 32, 82, ${intensity})`;
    setTimeout(() => { wrapper.style.boxShadow = ''; }, 160);
  }

  function triggerScreenGreenFlash(intensity = 0.65) {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    wrapper.style.boxShadow = `inset 0 0 75px rgba(16, 185, 129, ${intensity})`;
    setTimeout(() => { wrapper.style.boxShadow = ''; }, 220);
  }

  // ========================================================
  // 12.5 GENERADORES DE TEXTURAS PROCEDURALES HD (OPTIMIZADAS)
  // ========================================================
  let cachedFloorTexture = null;
  let cachedWallTexture = null;
  let cachedBrushedMetalTex = null;
  let cachedBrushedMetalBump = null;
  let cachedCarbonFiberTex = null;
  let cachedCarbonFiberBump = null;
  let cachedTacticalGripTex = null;
  let cachedTacticalGripBump = null;
  let cachedWoodGrainTex = null;
  let cachedHeatStainTex = null;
  let cachedScarGradTex = null;

  function getScarGradientTexture() {
    if (cachedScarGradTex) return cachedScarGradTex;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#e5be82');
    grad.addColorStop(0.12, '#cf9a58');
    grad.addColorStop(0.70, '#b88242');
    grad.addColorStop(0.92, '#96632c');
    grad.addColorStop(1.0, '#754b1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#fae1b3';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 30; y < 480; y += 45) {
      ctx.fillRect(0, y, 512, 3);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 45; y < 490; y += 45) {
      ctx.fillRect(0, y, 512, 2);
    }

    cachedScarGradTex = new THREE.CanvasTexture(c);
    cachedScarGradTex.generateMipmaps = true;
    return cachedScarGradTex;
  }

  let cachedSmgGradTex = null;
  function getSmgGradientTexture() {
    if (cachedSmgGradTex) return cachedSmgGradTex;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#6884a8');  // Borde superior iluminado (Edge Highlight cobalto claro)
    grad.addColorStop(0.18, '#465b77'); // Azul pizarra titanio militar
    grad.addColorStop(0.65, '#324257'); // Cuerpo medio cobalto oscuro
    grad.addColorStop(0.88, '#1e2836'); // Sombra de contacto
    grad.addColorStop(1.0, '#121822');  // Cavidad inferior profunda
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#7c98bf';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 502);

    // Franjas de acento cálidas estilizadas (Cobre / Naranja mecánico)
    ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
    ctx.fillRect(0, 110, 512, 14);
    ctx.fillRect(0, 360, 512, 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    for (let y = 30; y < 480; y += 42) {
      ctx.fillRect(0, y, 512, 3);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 46; y < 490; y += 42) {
      ctx.fillRect(0, y, 512, 2);
    }

    cachedSmgGradTex = new THREE.CanvasTexture(c);
    cachedSmgGradTex.generateMipmaps = true;
    return cachedSmgGradTex;
  }

  let cachedSniperGradTex = null;
  function getSniperGradientTexture() {
    if (cachedSniperGradTex) return cachedSniperGradTex;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#4a6080');  // Borde superior iluminado (Edge Highlight cobalto)
    grad.addColorStop(0.18, '#2d3d54'); // Azul pizarra militar táctico
    grad.addColorStop(0.68, '#1e293b'); // Cuerpo medio azul noche carbón
    grad.addColorStop(0.90, '#131924'); // Sombra de contacto
    grad.addColorStop(1.0, '#0a0d14');  // Cavidad inferior profunda
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    for (let y = 30; y < 480; y += 42) {
      ctx.fillRect(0, y, 512, 3);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    for (let y = 46; y < 490; y += 42) {
      ctx.fillRect(0, y, 512, 2);
    }

    cachedSniperGradTex = new THREE.CanvasTexture(c);
    cachedSniperGradTex.generateMipmaps = true;
    return cachedSniperGradTex;
  }

  function getBrushedMetalTextures() {
    if (cachedBrushedMetalTex) return { map: cachedBrushedMetalTex, bump: cachedBrushedMetalBump };
    
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 18000; i++) {
      const y = Math.random() * 512;
      const x = Math.random() * 512;
      const len = 30 + Math.random() * 90;
      const val = Math.random() * 0.18 - 0.09;
      ctx.fillStyle = val > 0 ? `rgba(255, 255, 255, ${val})` : `rgba(0, 0, 0, ${Math.abs(val)})`;
      ctx.fillRect(x, y, len, 1.2);
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 508);

    cachedBrushedMetalTex = new THREE.CanvasTexture(c);
    cachedBrushedMetalTex.wrapS = THREE.RepeatWrapping;
    cachedBrushedMetalTex.wrapT = THREE.RepeatWrapping;
    cachedBrushedMetalTex.repeat.set(2, 2);

    const cb = document.createElement('canvas');
    cb.width = 512;
    cb.height = 512;
    const ctxB = cb.getContext('2d');
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 12000; i++) {
      const y = Math.random() * 512;
      const x = Math.random() * 512;
      const len = 20 + Math.random() * 60;
      const b = Math.random() > 0.5 ? '#a0a0a0' : '#606060';
      ctxB.fillStyle = b;
      ctxB.fillRect(x, y, len, 1);
    }
    cachedBrushedMetalBump = new THREE.CanvasTexture(cb);
    cachedBrushedMetalBump.wrapS = THREE.RepeatWrapping;
    cachedBrushedMetalBump.wrapT = THREE.RepeatWrapping;
    cachedBrushedMetalBump.repeat.set(2, 2);

    return { map: cachedBrushedMetalTex, bump: cachedBrushedMetalBump };
  }

  function getCarbonFiberTextures() {
    if (cachedCarbonFiberTex) return { map: cachedCarbonFiberTex, bump: cachedCarbonFiberBump };

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 256, 256);

    const tileSize = 16;
    for (let y = 0; y < 256; y += tileSize) {
      for (let x = 0; x < 256; x += tileSize) {
        const isAlt = ((x + y) / tileSize) % 2 === 0;
        const grad = isAlt
          ? ctx.createLinearGradient(x, y, x + tileSize, y + tileSize)
          : ctx.createLinearGradient(x + tileSize, y, x, y + tileSize);

        if (isAlt) {
          grad.addColorStop(0, '#1f2937');
          grad.addColorStop(0.5, '#4b5563');
          grad.addColorStop(1, '#111827');
        } else {
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#334155');
          grad.addColorStop(1, '#020617');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, tileSize, tileSize);

        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    cachedCarbonFiberTex = new THREE.CanvasTexture(c);
    cachedCarbonFiberTex.wrapS = THREE.RepeatWrapping;
    cachedCarbonFiberTex.wrapT = THREE.RepeatWrapping;
    cachedCarbonFiberTex.repeat.set(4, 4);

    const cb = document.createElement('canvas');
    cb.width = 256;
    cb.height = 256;
    const ctxB = cb.getContext('2d');
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += tileSize) {
      for (let x = 0; x < 256; x += tileSize) {
        const isAlt = ((x + y) / tileSize) % 2 === 0;
        ctxB.fillStyle = isAlt ? '#b0b0b0' : '#505050';
        ctxB.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }
    cachedCarbonFiberBump = new THREE.CanvasTexture(cb);
    cachedCarbonFiberBump.wrapS = THREE.RepeatWrapping;
    cachedCarbonFiberBump.wrapT = THREE.RepeatWrapping;
    cachedCarbonFiberBump.repeat.set(4, 4);

    return { map: cachedCarbonFiberTex, bump: cachedCarbonFiberBump };
  }

  function getTacticalGripTextures() {
    if (cachedTacticalGripTex) return { map: cachedTacticalGripTex, bump: cachedTacticalGripBump };

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#27272a';
    for (let y = 4; y < 256; y += 8) {
      for (let x = 4; x < 256; x += 8) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    cachedTacticalGripTex = new THREE.CanvasTexture(c);
    cachedTacticalGripTex.wrapS = THREE.RepeatWrapping;
    cachedTacticalGripTex.wrapT = THREE.RepeatWrapping;
    cachedTacticalGripTex.repeat.set(3, 3);

    const cb = document.createElement('canvas');
    cb.width = 256;
    cb.height = 256;
    const ctxB = cb.getContext('2d');
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, 256, 256);
    ctxB.fillStyle = '#ffffff';
    for (let y = 4; y < 256; y += 8) {
      for (let x = 4; x < 256; x += 8) {
        ctxB.beginPath();
        ctxB.arc(x, y, 2.5, 0, Math.PI * 2);
        ctxB.fill();
      }
    }
    cachedTacticalGripBump = new THREE.CanvasTexture(cb);
    cachedTacticalGripBump.wrapS = THREE.RepeatWrapping;
    cachedTacticalGripBump.wrapT = THREE.RepeatWrapping;
    cachedTacticalGripBump.repeat.set(3, 3);

    return { map: cachedTacticalGripTex, bump: cachedTacticalGripBump };
  }

  function getWoodGrainTexture() {
    if (cachedWoodGrainTex) return cachedWoodGrainTex;

    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#3e1d0f');
    grad.addColorStop(0.5, '#5c2c17');
    grad.addColorStop(1, '#2a1208');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(20, 8, 3, 0.45)';
    ctx.lineWidth = 3;
    for (let y = -100; y < 650; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(150, y + 25, 350, y - 25, 512, y + 10);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(120, 60, 30, 0.25)';
    ctx.lineWidth = 1.5;
    for (let y = -80; y < 650; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(180, y - 15, 320, y + 20, 512, y - 5);
      ctx.stroke();
    }

    cachedWoodGrainTex = new THREE.CanvasTexture(c);
    cachedWoodGrainTex.wrapS = THREE.RepeatWrapping;
    cachedWoodGrainTex.wrapT = THREE.RepeatWrapping;
    return cachedWoodGrainTex;
  }

  function getHeatStainTexture() {
    if (cachedHeatStainTex) return cachedHeatStainTex;

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.4, '#d97706');
    grad.addColorStop(0.65, '#c084fc');
    grad.addColorStop(0.85, '#0284c7');
    grad.addColorStop(1.0, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 64);

    cachedHeatStainTex = new THREE.CanvasTexture(c);
    return cachedHeatStainTex;
  }

  function getFloorTexture() {
    if (cachedFloorTexture) return cachedFloorTexture;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    // Fondo blanco cerámico
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);

    // Paneles con biseles sutiles
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 254);

    // Cuadrícula interior suave
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.lineWidth = 1;
    for (let p = 64; p < 256; p += 64) {
      ctx.beginPath();
      ctx.moveTo(p, 0); ctx.lineTo(p, 256);
      ctx.moveTo(0, p); ctx.lineTo(256, p);
      ctx.stroke();
    }

    // Micro remaches tácticos en las esquinas
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    const dots = [8, 248];
    for (const dx of dots) {
      for (const dy of dots) {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    cachedFloorTexture = new THREE.CanvasTexture(c);
    cachedFloorTexture.wrapS = THREE.RepeatWrapping;
    cachedFloorTexture.wrapT = THREE.RepeatWrapping;
    return cachedFloorTexture;
  }

  function getWallTexture() {
    if (cachedWallTexture) return cachedWallTexture;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    // Fondo blanco puro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Paneles modulares arquitectónicos
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(8, 8, 240, 240);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 240, 240);

    // Ranuras de ventilación / datos sutiles
    ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
    for (let r = 0; r < 4; r++) {
      ctx.fillRect(28, 48 + r * 42, 200, 4);
    }

    cachedWallTexture = new THREE.CanvasTexture(c);
    cachedWallTexture.wrapS = THREE.RepeatWrapping;
    cachedWallTexture.wrapT = THREE.RepeatWrapping;
    return cachedWallTexture;
  }

  // ========================================================
  // 13. GENERACIÓN DE ENTORNOS 3D POR TEMA
  // ========================================================

  function buildMapEnvironment(mapData) {
    // Limpiar entorno previo
    for (const mesh of envMeshes) {
      scene.remove(mesh);
    }
    envMeshes = [];
    mapColliders = [];

    const theme = mapData.theme || 'lab';
    const { w, d, h } = mapData.roomSize;

    // Establecer límites de habitación infranqueables
    currentRoomBounds = {
      minX: -w / 2 + PLAYER_RADIUS,
      maxX: w / 2 - PLAYER_RADIUS,
      minZ: -d / 2 + PLAYER_RADIUS,
      maxZ: d / 2 - PLAYER_RADIUS
    };

    // ==========================================
    // ESTÉTICA SUPERHOT: 100% BLANCA, LUMINOSA Y ULTRA NÍTIDA CON TEXTURAS HD
    // ==========================================
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.008);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.15;
    dirLight.color.setHex(0xffffff);

    // Texturas de Suelo y Paredes Procedurales con repetición según tamaño
    const fTex = getFloorTexture().clone();
    fTex.repeat.set(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(d / 4)));
    fTex.needsUpdate = true;

    const wTex = getWallTexture().clone();
    wTex.repeat.set(Math.max(1, Math.round(w / 5)), Math.max(1, Math.round(h / 3)));
    wTex.needsUpdate = true;

    // Suelo porcelana texturizado
    const floorMat = new THREE.MeshStandardMaterial({
      map: fTex,
      roughness: 0.18,
      metalness: 0.08
    });

    // Muros arquitectónicos texturizados
    const wallMat = new THREE.MeshStandardMaterial({
      map: wTex,
      roughness: 0.25,
      metalness: 0.05
    });

    // Techo blanco clínico
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.02
    });

    // Columnas y estructuras monolíticas blancas
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.18,
      metalness: 0.06
    });

    // Color de acento neón según el mapa (franjas y detalles sutiles)
    let accentHex = 0x00f0ff;
    if (theme === 'neon') accentHex = 0xd946ef;
    else if (theme === 'industrial') accentHex = 0xf59e0b;
    else if (theme === 'crossroads') accentHex = 0x10b981;
    else if (theme === 'reactor') accentHex = 0xa855f7;

    // Suelo
    const floorGeo = new THREE.PlaneGeometry(w, d);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    envMeshes.push(floorMesh);

    // Cuadrícula táctica en el suelo (SUPERHOT Grid) para juzgar distancias con precisión
    const maxDim = Math.max(w, d);
    const grid = new THREE.GridHelper(maxDim, Math.round(maxDim), 0x94a3b8, 0xe2e8f0);
    grid.position.y = 0.015;
    scene.add(grid);
    envMeshes.push(grid);

    // Techo
    const ceilingGeo = new THREE.PlaneGeometry(w, d);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.y = h;
    ceilingMesh.rotation.x = Math.PI / 2;
    scene.add(ceilingMesh);
    envMeshes.push(ceilingMesh);

    // Muros perimetrales con zócalo oscuro para delimitar perfectamente el espacio
    const halfW = w / 2;
    const halfD = d / 2;
    const wallThick = 1.0;

    const perimWalls = [
      { x: 0, z: -halfD - wallThick / 2, w: w + wallThick * 2, d: wallThick, h },
      { x: 0, z: halfD + wallThick / 2, w: w + wallThick * 2, d: wallThick, h },
      { x: -halfW - wallThick / 2, z: 0, w: wallThick, d: d, h },
      { x: halfW + wallThick / 2, z: 0, w: wallThick, d: d, h }
    ];

    for (const pw of perimWalls) {
      const geo = new THREE.BoxGeometry(pw.w, pw.h, pw.d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(pw.x, pw.h / 2, pw.z);
      scene.add(mesh);
      envMeshes.push(mesh);

      // Zócalo inferior oscuro de alta visibilidad (0.16m de altura)
      const baseGeo = new THREE.BoxGeometry(pw.w, 0.16, pw.d + 0.04);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(pw.x, 0.08, pw.z);
      scene.add(baseMesh);
      envMeshes.push(baseMesh);

      mapColliders.push(new THREE.Box3(
        new THREE.Vector3(pw.x - pw.w / 2, 0, pw.z - pw.d / 2),
        new THREE.Vector3(pw.x + pw.w / 2, pw.h, pw.z + pw.d / 2)
      ));
    }

    // Muros y columnas interiores del mapa (Blancas con zócalo y franja neón de acento)
    for (const mw of mapData.walls) {
      const geo = new THREE.BoxGeometry(mw.w, mw.h, mw.d);
      const mesh = new THREE.Mesh(geo, columnMat);
      mesh.position.set(mw.x, mw.h / 2, mw.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      envMeshes.push(mesh);

      // Franja neón de acento temático a media altura
      const trimGeo = new THREE.BoxGeometry(mw.w + 0.04, 0.08, mw.d + 0.04);
      const trimMat = new THREE.MeshBasicMaterial({ color: accentHex });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.position.set(mw.x, 1.25, mw.z);
      scene.add(trimMesh);
      envMeshes.push(trimMesh);

      // Zócalo inferior oscuro para contrastar con el suelo blanco
      const baseGeo = new THREE.BoxGeometry(mw.w + 0.02, 0.16, mw.d + 0.02);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(mw.x, 0.08, mw.z);
      scene.add(baseMesh);
      envMeshes.push(baseMesh);

      mapColliders.push(new THREE.Box3(
        new THREE.Vector3(mw.x - mw.w / 2, 0, mw.z - mw.d / 2),
        new THREE.Vector3(mw.x + mw.w / 2, mw.h, mw.z + mw.d / 2)
      ));
    }

    // Decoración especial para Mapa 5: Núcleo del reactor central
    if (theme === 'reactor') {
      const coreGeo = new THREE.CylinderGeometry(1.6, 1.6, 5.0, 24);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, 2.5, 0);
      scene.add(coreMesh);
      envMeshes.push(coreMesh);

      for (let r = 0; r < 3; r++) {
        const ringGeo = new THREE.TorusGeometry(2.3, 0.08, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(0, 1.2 + r * 1.3, 0);
        ringMesh.rotation.x = Math.PI / 2;
        scene.add(ringMesh);
        envMeshes.push(ringMesh);
      }

      if (!isMobileDevice) {
        const coreLight = new THREE.PointLight(0xf43f5e, 2.0, 12);
        coreLight.position.set(0, 2.5, 0);
        scene.add(coreLight);
        envMeshes.push(coreLight);
      }
    }
  }

  // ========================================================
  // 14. CARGA DE MAPAS Y GESTIÓN DE PANTALLAS
  // ========================================================

  const screenLogin = document.getElementById('screen-login');
  const screenInstructions = document.getElementById('screen-instructions');
  const screenMainMenu = document.getElementById('screen-main-menu');
  const screenMapSelect = document.getElementById('screen-map-select');
  const screenShop = document.getElementById('screen-shop');
  const screenGame = document.getElementById('screen-game');

  const modalDeath = document.getElementById('modal-death');
  const modalVictory = document.getElementById('modal-victory');
  const modalDifficulty = document.getElementById('modal-difficulty');
  const diffModalMapName = document.getElementById('diff-modal-map-name');
  const diffCardsGrid = document.getElementById('diff-cards-grid');
  const btnCancelDifficulty = document.getElementById('btn-cancel-difficulty');

  let currentDifficultyConfig = { hp: 5, medkits: 2, name: 'FÁCIL' };
  let selectedMapIndexForDifficulty = 0;

  const hudAmmoText = document.getElementById('hud-ammo-text');
  const hudTimeChip = document.getElementById('hud-time-chip');
  const hudTimeText = document.getElementById('hud-time-text');
  const hudTimeIcon = document.getElementById('hud-time-icon');
  const hudMapName = document.getElementById('hud-map-name');
  const hudLivesChip = document.getElementById('hud-lives-chip');
  const hudLivesText = document.getElementById('hud-lives-text');

  function showScreen(screenElement) {
    [screenLogin, screenInstructions, screenMainMenu, screenMapSelect, screenShop, screenGame].forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (screenElement) screenElement.classList.add('active');

    updateCoinDisplays();

    if (screenElement === screenGame) {
      window.chronoAudio.startDrone();
    } else {
      window.chronoAudio.stopDrone();
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    }
  }

  function loadMap(mapIndex) {
    currentMapIndex = mapIndex;
    const mapData = MAPS_3D[mapIndex];
    currentMapTheme = mapData.theme || 'lab';

    // Dificultad escalable por mapa: el mapa 10 (id=9) es SALVAJE
    const difficultyTable = [1.0, 1.0, 1.1, 1.2, 1.3, 1.0, 1.2, 1.35, 1.5, 2.2];
    currentMapDifficultyMod = difficultyTable[mapIndex] || 1.0;

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      wrapper.className = `theme-${currentMapTheme}`;
    }

    // Limpiar el jugador previo (elimina el modelo de arma de la cámara del mapa anterior)
    if (player) {
      player.destroy();
      player = null;
    }

    // Limpiar entidades 3D previas
    for (const b of bullets) b.destroy();
    for (const tw of thrownWeapons) tw.destroy();
    for (const gw of groundWeapons) gw.destroy();
    for (const ch of chests) ch.destroy();
    for (const en of enemies) en.destroy();
    for (const cs of crystalShards) cs.destroy();
    for (const es of ejectedShells) es.destroy();
    for (const sp of sparkParticles) sp.destroy();
    for (const sm of smokeParticles) sm.destroy();
    for (const mf of muzzleFlashes) mf.destroy();
    for (const db of debrisParticles) db.destroy();

    bullets = [];
    thrownWeapons = [];
    groundWeapons = [];
    chests = [];
    enemies = [];
    crystalShards = [];
    ejectedShells = [];
    sparkParticles = [];
    smokeParticles = [];
    muzzleFlashes = [];
    debrisParticles = [];

    // Construir geometría y luces 3D del mapa
    buildMapEnvironment(mapData);

    // Crear Jugador con configuración de vidas y botiquines de la dificultad elegida
    const playerHp = (currentDifficultyConfig && currentDifficultyConfig.hp) ? currentDifficultyConfig.hp : (mapIndex === 9 ? 5 : 3);
    let playerMedkits = (currentDifficultyConfig && currentDifficultyConfig.medkits !== undefined) ? currentDifficultyConfig.medkits : 2;

    // Si es modo DIFÍCIL o ULTRA DIFÍCIL (donde los botiquines están a 0) y tiene botiquines comprados en la tienda:
    const isHardMode = currentDifficultyConfig && (currentDifficultyConfig.name === 'DIFÍCIL' || currentDifficultyConfig.name === 'ULTRA DIFÍCIL');
    if (isHardMode && hardMedkitsReserve > 0) {
      playerMedkits = 1; // Le otorga el botiquín especial comprado en la tienda
      hardMedkitsReserve--;
      saveEconomyState();
    }

    // Arma inicial: si el jugador equipó un arma del Arsenal en la tienda
    let chosenStartWeapon = mapData.startWeapon;
    if (equippedStartWeapon && equippedStartWeapon !== 'default' && WEAPONS_BASE[equippedStartWeapon]) {
      const wBase = WEAPONS_BASE[equippedStartWeapon];
      chosenStartWeapon = {
        type: wBase.type,
        name: wBase.name,
        ammo: wBase.maxAmmo,
        maxAmmo: wBase.maxAmmo
      };
    }

    player = new FPSPlayer(
      mapData.playerSpawn.x,
      mapData.playerSpawn.z,
      mapData.playerSpawn.rotY,
      chosenStartWeapon,
      playerHp,
      playerMedkits
    );

    // Crear Guardias Enemigos 3D
    enemies = mapData.enemies.map(e => new Enemy3D(e.x, e.z, e.weapon, e.rotY));

    // Crear Cofres 3D
    chests = (mapData.chests || []).map(ch => new CyberChest3D(ch.x, ch.z, ch.loot));

    // Armas iniciales en el suelo
    for (const gw of mapData.groundWeapons) {
      groundWeapons.push(new GroundWeapon3D(gw.x, gw.z, gw.type, gw.name, gw.ammo, gw.maxAmmo));
    }

    modalDeath.classList.remove('active');
    modalVictory.classList.remove('active');
    if (modalDifficulty) modalDifficulty.classList.remove('active');

    const diffLabel = currentDifficultyConfig && currentDifficultyConfig.name ? ` [${currentDifficultyConfig.name}]` : '';
    hudMapName.textContent = mapData.name + diffLabel;
    updateHUD(true);

    gameState = 'playing';
    timeScale = TIME_SCALE_STOPPED;
    targetTimeScale = TIME_SCALE_STOPPED;

    showScreen(screenGame);

    // Mostrar prompt de clic para mouse look en PC
    if (pointerLockPrompt && !isPointerLocked && !isTouchActive) {
      pointerLockPrompt.classList.remove('hidden');
    }
  }

  function triggerPlayerDeath() {
    if (gameState !== 'playing') return;
    gameState = 'dead';
    window.chronoAudio.playPlayerDeath();
    modalDeath.classList.add('active');
    if (document.exitPointerLock) document.exitPointerLock();
  }

  function checkVictory() {
    if (enemies.length === 0 && gameState === 'playing') {
      gameState = 'won';
      window.chronoAudio.playVictory();

      // Calcular recompensa de monedas según la dificultad seleccionada
      const diffName = (currentDifficultyConfig && currentDifficultyConfig.name) ? currentDifficultyConfig.name : 'MEDIO';
      let reward = 10;
      if (diffName === 'FÁCIL') reward = 5;
      else if (diffName === 'MEDIO') reward = 10;
      else if (diffName === 'DIFÍCIL' || diffName === 'PRO') reward = 15;
      else if (diffName === 'ULTRA DIFÍCIL') reward = 25;

      addCoins(reward);
      setTimeout(() => {
        window.chronoAudio.playCoin();
      }, 350);

      const victoryCoinsEarned = document.getElementById('victory-coins-earned');
      const victoryTotalCoins = document.getElementById('victory-total-coins');
      if (victoryCoinsEarned) victoryCoinsEarned.textContent = reward;
      if (victoryTotalCoins) victoryTotalCoins.textContent = playerCoins;

      modalVictory.classList.add('active');
      if (document.exitPointerLock) document.exitPointerLock();
    }
  }

  let lastHudHp = -1;
  let lastHudMaxHp = -1;
  let lastHudWeaponType = null;
  let lastHudAmmo = -1;
  let lastHudIsStopped = null;
  let lastHudMedkits = -1;

  function updateHUD(force = false) {
    if (!player) return;
    if (force) {
      lastHudHp = -1;
      lastHudMaxHp = -1;
      lastHudWeaponType = null;
      lastHudAmmo = -1;
      lastHudIsStopped = null;
      lastHudMedkits = -1;
    }

    // 1. Vidas del jugador (3 Vidas estándar, 5 en Mapa 10)
    if (hudLivesText && hudLivesChip && (player.hp !== lastHudHp || player.maxHp !== lastHudMaxHp)) {
      lastHudHp = player.hp;
      lastHudMaxHp = player.maxHp;
      const hearts = '❤️'.repeat(player.hp) + '🖤'.repeat(Math.max(0, player.maxHp - player.hp));
      hudLivesText.innerHTML = `<span class="lives-hearts">${hearts}</span> <span class="lives-num">${player.hp}/${player.maxHp}</span>`;
      if (player.hp === 1) {
        hudLivesChip.classList.add('low-hp');
      } else {
        hudLivesChip.classList.remove('low-hp');
      }
    }

    // 2. Botiquines en la Mochila (Q en PC, ✚ en celular)
    const hudMedkitText = document.getElementById('hud-medkit-text');
    const hudMedkitChip = document.getElementById('hud-medkit-chip');
    const btnTouchMedkitCount = document.getElementById('btn-touch-medkit-count');
    const btnTouchMedkit = document.getElementById('btn-touch-medkit');

    if (player.medkits !== lastHudMedkits) {
      lastHudMedkits = player.medkits;
      if (hudMedkitText) {
        hudMedkitText.innerHTML = `MOCHILA: <strong style="color: #34d399;">✚ × ${player.medkits}</strong> <span style="opacity: 0.65; font-size: 0.8em;">[Q]</span>`;
      }
      if (hudMedkitChip) {
        if (player.medkits <= 0) {
          hudMedkitChip.classList.add('empty');
        } else {
          hudMedkitChip.classList.remove('empty');
        }
      }
      if (btnTouchMedkitCount) {
        btnTouchMedkitCount.textContent = player.medkits;
      }
      if (btnTouchMedkit) {
        if (player.medkits <= 0) {
          btnTouchMedkit.classList.add('empty');
        } else {
          btnTouchMedkit.classList.remove('empty');
        }
      }
    }

    // 2. Munición con micro-balas visuales de neón según el arma
    const currentWeaponType = player.weapon ? player.weapon.type : 'none';
    const currentAmmo = player.weapon ? player.weapon.ammo : 0;
    if (currentWeaponType !== lastHudWeaponType || currentAmmo !== lastHudAmmo) {
      lastHudWeaponType = currentWeaponType;
      lastHudAmmo = currentAmmo;
      if (player.weapon) {
        const wName = player.weapon.name;
        const ammo = player.weapon.ammo;
        const maxAmmo = player.weapon.maxAmmo || 6;
        let pipColorClass = '';
        if (player.weapon.type === 'rifle') pipColorClass = 'pip-rifle';
        else if (player.weapon.type === 'sniper') pipColorClass = 'pip-sniper';
        else if (player.weapon.type === 'plasma') pipColorClass = 'pip-plasma';
        else if (player.weapon.type === 'shotgun') pipColorClass = 'pip-shotgun';

        let pips = '';
        for (let i = 0; i < maxAmmo; i++) {
          pips += `<span class="hud-pip ${pipColorClass} ${i < ammo ? 'active' : 'spent'}"></span>`;
        }
        hudAmmoText.innerHTML = `<span class="weapon-label">${wName}:</span> <span class="pips-container">${pips}</span> <span class="ammo-count">${ammo}/${maxAmmo}</span>`;
      } else {
        hudAmmoText.innerHTML = `<span class="weapon-label unequipped">👊 PUÑOS // DESARMADO</span>`;
      }
    }

    // 3. Tiempo con estado y pulso
    const isStopped = timeScale < 0.25;
    if (isStopped !== lastHudIsStopped) {
      lastHudIsStopped = isStopped;
      if (isStopped) {
        hudTimeChip.className = "hud-chip time-stopped";
        hudTimeIcon.textContent = "⏱️";
        hudTimeText.innerHTML = `TIEMPO: <span class="pulse-txt">DETENIDO (4%)</span>`;
      } else {
        hudTimeChip.className = "hud-chip time-flowing";
        hudTimeIcon.textContent = "⚡";
        hudTimeText.innerHTML = `TIEMPO: <span class="flow-txt">EN FLUJO (100%)</span>`;
      }
    }

    // 3.5. Estado de Apuntado ADS y Bullet-Time
    const hudAimText = document.getElementById('hud-aim-text');
    const hudAimChip = document.getElementById('hud-aim-chip');
    if (hudAimText && hudAimChip && player) {
      if (player.isAiming) {
        if (player.isBulletTime) {
          hudAimText.innerHTML = `MIRA: <strong style="color: #00f0ff;">${player.aimTimer.toFixed(1)}s</strong> <span style="font-size: 0.8em; color: #38bdf8;">[BULLET-TIME]</span>`;
          hudAimChip.className = "hud-chip cyan-chip active";
        } else {
          hudAimText.innerHTML = `MIRA: <strong style="color: #f59e0b;">0.0s</strong> <span style="font-size: 0.8em; color: #f59e0b;">[MIRA ACTIVA]</span>`;
          hudAimChip.className = "hud-chip amber-chip";
        }
      } else {
        if (player.aimCooldown > 0) {
          hudAimText.innerHTML = `RECARGA: <strong style="color: #ef4444;">${player.aimCooldown.toFixed(1)}s</strong>`;
          hudAimChip.className = "hud-chip danger-chip";
        } else {
          hudAimText.innerHTML = `MIRA: <strong style="color: #10b981;">LISTO (2.0s)</strong>`;
          hudAimChip.className = "hud-chip cyan-chip";
        }
      }
    }

    // 4. Skin Activa en HUD
    const hudSkinChip = document.getElementById('hud-skin-chip');
    const hudSkinIcon = document.getElementById('hud-skin-icon');
    const hudSkinText = document.getElementById('hud-skin-text');
    if (hudSkinChip && hudSkinText && hudSkinIcon) {
      const skinObj = SKINS_DATA[activeSkin] || SKINS_DATA.skin_default;
      hudSkinIcon.textContent = skinObj.icon;
      hudSkinText.textContent = skinObj.name.split('(')[0].trim();
      hudSkinChip.className = `hud-chip skin-chip skin-chip-${activeSkin}`;
    }
  }

  // ========================================================
  // 15. CONFIGURACIÓN DE LISTENERS, POINTER LOCK Y MÓVILES
  // ========================================================

  // Menús y Botones de Flujo
  document.getElementById('btn-goto-menu').addEventListener('click', () => {
    try { localStorage.setItem('chrono_intro_seen', 'true'); } catch (e) {}
    window.chronoAudio.init();
    showScreen(screenMainMenu);
    gameState = 'menu';
  });

  // ========================================================
  // SESIÓN DE USUARIO (Fase 1 y 2: Invitado, Google y cerrar sesión)
  // El progreso de invitado vive en las claves chrono_* del localStorage de este
  // dispositivo. Aquí se guarda el tipo de sesión y el nombre visible.
  // ========================================================
  const loginErrorMsg = document.getElementById('login-error-msg');

  function showLoginError(msg) {
    if (!loginErrorMsg) return;
    if (!msg) {
      loginErrorMsg.textContent = '';
      loginErrorMsg.classList.add('hidden');
    } else {
      loginErrorMsg.textContent = msg;
      loginErrorMsg.classList.remove('hidden');
    }
  }

  function getSession() {
    try { return localStorage.getItem('chrono_session'); } catch (e) { return null; }
  }

  function getSessionName() {
    try { return localStorage.getItem('chrono_session_name') || ''; } catch (e) { return ''; }
  }

  function setSession(type, displayName) {
    try {
      localStorage.setItem('chrono_session', type);
      if (displayName) {
        localStorage.setItem('chrono_session_name', displayName);
      } else {
        localStorage.removeItem('chrono_session_name');
      }
    } catch (e) {}
    updateSessionLabel();
  }

  function clearSession() {
    try {
      localStorage.removeItem('chrono_session');
      localStorage.removeItem('chrono_session_name');
    } catch (e) {}
  }

  function updateSessionLabel() {
    const label = document.getElementById('menu-session-label');
    const chip = document.getElementById('menu-session-chip');
    const icon = chip ? chip.querySelector('.session-icon') : null;
    const type = getSession();
    const name = getSessionName();

    if (type === 'google') {
      if (icon) icon.textContent = 'G';
      if (label) label.textContent = name ? `GOOGLE · ${name}` : 'GOOGLE';
    } else if (type === 'chrono') {
      if (icon) icon.textContent = '⏱';
      if (label) label.textContent = name ? `CHRONO · ${name}` : 'CHRONO';
    } else {
      if (icon) icon.textContent = '👤';
      if (label) label.textContent = 'INVITADO';
    }
  }

  function hasSeenIntroNow() {
    try { return localStorage.getItem('chrono_intro_seen') === 'true'; } catch (e) { return false; }
  }

  // Tras iniciar sesión: instrucciones la primera vez, menú las demás
  function enterAfterLogin() {
    showLoginError('');
    window.chronoAudio.init();
    updateSessionLabel();
    if (hasSeenIntroNow()) {
      showScreen(screenMainMenu);
      gameState = 'menu';
    } else {
      showScreen(screenInstructions);
      gameState = 'instructions';
    }
  }

  const btnLoginGoogle = document.getElementById('btn-login-google');
  if (btnLoginGoogle) {
    const originalGoogleHtml = btnLoginGoogle.innerHTML;
    btnLoginGoogle.addEventListener('click', async () => {
      showLoginError('');
      if (!window.chronoAuth) {
        showLoginError('El módulo de Firebase no se cargó correctamente.');
        return;
      }
      btnLoginGoogle.disabled = true;
      btnLoginGoogle.innerHTML = '<span class="btn-icon">G</span> CONECTANDO...';
      try {
        const res = await window.chronoAuth.loginWithGoogle();
        setSession('google', res.displayName);
        enterAfterLogin();
      } catch (err) {
        showLoginError(err && err.message ? err.message : 'No se pudo iniciar sesión con Google.');
      } finally {
        btnLoginGoogle.disabled = false;
        btnLoginGoogle.innerHTML = originalGoogleHtml;
      }
    });
  }

  const btnLoginGuest = document.getElementById('btn-login-guest');
  if (btnLoginGuest) {
    btnLoginGuest.addEventListener('click', () => {
      setSession('guest');
      enterAfterLogin();
    });
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (window.chronoAuth && typeof window.chronoAuth.logout === 'function') {
        await window.chronoAuth.logout();
      }
      clearSession();
      showLoginError('');
      showScreen(screenLogin);
      gameState = 'login';
    });
  }

  document.getElementById('btn-start-game').addEventListener('click', () => {
    window.chronoAudio.init();
    showScreen(screenMapSelect);
    gameState = 'mapSelect';
  });

  document.getElementById('btn-view-instructions').addEventListener('click', () => {
    window.chronoAudio.init();
    showScreen(screenInstructions);
    gameState = 'instructions';
  });

  document.getElementById('btn-back-to-menu').addEventListener('click', () => {
    window.chronoAudio.init();
    showScreen(screenMainMenu);
    gameState = 'menu';
  });

  // Botones de acceso a la Tienda
  const btnOpenShop = document.getElementById('btn-open-shop');
  if (btnOpenShop) {
    btnOpenShop.addEventListener('click', () => {
      window.chronoAudio.init();
      previousMenuState = 'menu';
      showScreen(screenShop);
      gameState = 'shop';
      renderShop('tactical');
    });
  }

  const btnShopFromMaps = document.getElementById('btn-shop-from-maps');
  if (btnShopFromMaps) {
    btnShopFromMaps.addEventListener('click', () => {
      window.chronoAudio.init();
      previousMenuState = 'mapSelect';
      showScreen(screenShop);
      gameState = 'shop';
      renderShop('tactical');
    });
  }

  const btnBackFromShop = document.getElementById('btn-back-from-shop');
  if (btnBackFromShop) {
    btnBackFromShop.addEventListener('click', () => {
      window.chronoAudio.init();
      if (previousMenuState === 'mapSelect') {
        showScreen(screenMapSelect);
        gameState = 'mapSelect';
      } else {
        showScreen(screenMainMenu);
        gameState = 'menu';
      }
    });
  }

  // Pestañas de la Tienda
  document.querySelectorAll('.shop-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.chronoAudio.init();
      const tab = btn.getAttribute('data-tab');
      renderShop(tab);
    });
  });

  // Renderizador Dinámico de la Tienda
  let currentShopTab = 'tactical';
  function renderShop(tab = 'tactical') {
    currentShopTab = tab;
    const shopGrid = document.getElementById('shop-items-grid');
    if (!shopGrid) return;
    shopGrid.innerHTML = '';
    updateCoinDisplays();

    // Actualizar botones de pestaña
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tab === 'tactical') {
      // 1. Botiquín Táctico de Emergencia para Modo Difícil / Ultra Difícil
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <span class="shop-card-badge badge-tactical">MODO DIFÍCIL</span>
        <div class="shop-card-icon-box">🎒</div>
        <h3 class="shop-card-title">Botiquín de Emergencia</h3>
        <p class="shop-card-desc">
          Suministro médico especial para los modos <strong>DIFÍCIL</strong> y <strong>ULTRA DIFÍCIL</strong> (donde normalmente los botiquines están bloqueados a 0).
          <br><br>
          <em>Te otorga +1 Botiquín en la mochila al desplegarte en esas dificultades.</em>
          <br><br>
          <strong style="color: #34d399;">📦 En tu reserva: ${hardMedkitsReserve} botiquín(es)</strong>
        </p>
        <div class="shop-card-footer">
          <div class="shop-card-price">🪙 60</div>
          <button class="shop-action-btn btn-buy" id="btn-buy-hard-medkit">COMPRAR (+1)</button>
        </div>
      `;

      const buyBtn = card.querySelector('#btn-buy-hard-medkit');
      buyBtn.addEventListener('click', () => {
        if (spendCoins(60)) {
          hardMedkitsReserve++;
          saveEconomyState();
          window.chronoAudio.playBuy();
          renderShop('tactical');
        } else {
          window.chronoAudio.playEmptyClick();
          buyBtn.textContent = '¡FALTAN MONEDAS!';
          setTimeout(() => { if (buyBtn) buyBtn.textContent = 'COMPRAR (+1)'; }, 1000);
        }
      });
      shopGrid.appendChild(card);

    } else if (tab === 'arsenal') {
      // 2. Arsenal de Armas Iniciales
      // Opción: "Por Defecto del Mapa"
      const defCard = document.createElement('div');
      const isDefEquipped = (equippedStartWeapon === 'default');
      defCard.className = `shop-card ${isDefEquipped ? 'equipped' : ''}`;
      defCard.innerHTML = `
        <span class="shop-card-badge ${isDefEquipped ? 'badge-equipped' : 'badge-weapon'}">${isDefEquipped ? 'ACTIVO' : 'DEFECTO'}</span>
        <div class="shop-card-icon-box">🎲</div>
        <h3 class="shop-card-title">Arma por Defecto del Mapa</h3>
        <p class="shop-card-desc">Despliega con el arma estándar asignada a cada nivel (o desarmado si el mapa lo especifica).</p>
        <div class="shop-card-footer">
          <div class="shop-card-price" style="color:#6ee7b7;">GRATIS</div>
          <button class="shop-action-btn ${isDefEquipped ? 'btn-equipped' : 'btn-equip'}">${isDefEquipped ? 'EQUIPADO ✓' : 'EQUIPAR'}</button>
        </div>
      `;
      const defBtn = defCard.querySelector('button');
      if (!isDefEquipped) {
        defBtn.addEventListener('click', () => {
          equippedStartWeapon = 'default';
          saveEconomyState();
          window.chronoAudio.playEquip();
          renderShop('arsenal');
        });
      }
      shopGrid.appendChild(defCard);

      Object.values(WEAPONS_SHOP_DATA).forEach(w => {
        const isOwned = unlockedWeapons.includes(w.weaponType);
        const isEquipped = (equippedStartWeapon === w.weaponType);

        const card = document.createElement('div');
        card.className = `shop-card ${isEquipped ? 'equipped' : (isOwned ? 'owned-card' : '')}`;
        card.innerHTML = `
          <span class="shop-card-badge ${isEquipped ? 'badge-equipped' : w.badgeClass}">${isEquipped ? 'EQUIPADO' : (isOwned ? 'DESBLOQUEADO' : w.badge)}</span>
          <div class="shop-card-icon-box">${w.icon}</div>
          <h3 class="shop-card-title">${w.name}</h3>
          <p class="shop-card-desc">${w.desc}</p>
          <div class="shop-card-footer">
            <div class="shop-card-price">${isOwned ? '<span style="color:#34d399;">PROPIO</span>' : `🪙 ${w.price}`}</div>
            <button class="shop-action-btn ${isEquipped ? 'btn-equipped' : (isOwned ? 'btn-equip' : 'btn-buy')}">
              ${isEquipped ? 'EQUIPADO ✓' : (isOwned ? 'EQUIPAR' : 'COMPRAR')}
            </button>
          </div>
        `;

        const actionBtn = card.querySelector('.shop-action-btn');
        actionBtn.addEventListener('click', () => {
          if (isEquipped) return;
          if (isOwned) {
            equippedStartWeapon = w.weaponType;
            saveEconomyState();
            window.chronoAudio.playEquip();
            renderShop('arsenal');
          } else {
            if (spendCoins(w.price)) {
              unlockedWeapons.push(w.weaponType);
              equippedStartWeapon = w.weaponType;
              saveEconomyState();
              window.chronoAudio.playBuy();
              renderShop('arsenal');
            } else {
              window.chronoAudio.playEmptyClick();
              actionBtn.textContent = '¡FALTAN MONEDAS!';
              setTimeout(() => { if (actionBtn) actionBtn.textContent = 'COMPRAR'; }, 1000);
            }
          }
        });

        shopGrid.appendChild(card);
      });

    } else if (tab === 'skins') {
      // 3. Skins de Personalización
      Object.values(SKINS_DATA).forEach(s => {
        const isOwned = unlockedSkins.includes(s.id);
        const isEquipped = (activeSkin === s.id);

        const card = document.createElement('div');
        card.className = `shop-card ${isEquipped ? 'equipped' : (isOwned ? 'owned-card' : '')}`;
        card.innerHTML = `
          <span class="shop-card-badge ${isEquipped ? 'badge-equipped' : s.badgeClass}">${isEquipped ? 'EQUIPADA' : (isOwned ? 'EN PROPIEDAD' : s.badge)}</span>
          <div class="shop-card-icon-box">${s.icon}</div>
          <h3 class="shop-card-title">${s.name}</h3>
          <p class="shop-card-desc">${s.desc}</p>
          <div class="shop-card-footer">
            <div class="shop-card-price">${isOwned ? '<span style="color:#34d399;">PROPIA</span>' : `🪙 ${s.price}`}</div>
            <button class="shop-action-btn ${isEquipped ? 'btn-equipped' : (isOwned ? 'btn-equip' : 'btn-buy')}">
              ${isEquipped ? 'EQUIPADA ✓' : (isOwned ? 'EQUIPAR' : 'COMPRAR')}
            </button>
          </div>
        `;

        const actionBtn = card.querySelector('.shop-action-btn');
        actionBtn.addEventListener('click', () => {
          if (isEquipped) return;
          if (isOwned) {
            activeSkin = s.id;
            saveEconomyState();
            window.chronoAudio.playEquip();
            if (player && player.viewWeaponGroup) player.updateViewWeaponModel();
            renderShop('skins');
          } else {
            if (spendCoins(s.price)) {
              unlockedSkins.push(s.id);
              activeSkin = s.id;
              saveEconomyState();
              window.chronoAudio.playBuy();
              if (player && player.viewWeaponGroup) player.updateViewWeaponModel();
              renderShop('skins');
            } else {
              window.chronoAudio.playEmptyClick();
              actionBtn.textContent = '¡FALTAN MONEDAS!';
              setTimeout(() => { if (actionBtn) actionBtn.textContent = 'COMPRAR'; }, 1000);
            }
          }
        });

        shopGrid.appendChild(card);
      });
    }
  }

  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colorKey = btn.getAttribute('data-color');
      applyGlobalTheme(colorKey);
      window.chronoAudio.init();
      window.chronoAudio.playPickup();
    });
  });

  // ========================================================
  // SELECTOR DE DIFICULTAD POR NIVEL (FÁCIL, MEDIO, PRO / ULTRA)
  // ========================================================
  let difficultyOpenedAt = 0;
  function stopDifficultyVideo() {
    const v = document.getElementById('diff-video-player');
    if (v) {
      try { v.pause(); } catch (e) {}
    }
  }
  function openDifficultyModal(mapIndex) {
    difficultyOpenedAt = Date.now();
    selectedMapIndexForDifficulty = mapIndex;
    const mapData = MAPS_3D[mapIndex];
    if (!mapData || !modalDifficulty || !diffCardsGrid) {
      loadMap(mapIndex);
      return;
    }

    if (diffModalMapName) {
      diffModalMapName.textContent = mapData.name;
    }

    diffCardsGrid.innerHTML = '';

    // Video "¿imposible el ULTRA DIFÍCIL?" solo en el Mapa 10
    const diffVideoBlock = document.getElementById('diff-video-block');
    const diffVideoPlayer = document.getElementById('diff-video-player');
    if (diffVideoBlock && diffVideoPlayer) {
      if (mapIndex === 9) {
        diffVideoBlock.classList.remove('hidden');
        if (!diffVideoPlayer.getAttribute('src')) {
          diffVideoPlayer.src = 'mapa%2010.mp4';
        }
      } else {
        stopDifficultyVideo();
        diffVideoBlock.classList.add('hidden');
      }
    }

    // Si son los dos últimos niveles (Mapas 9 y 10: índices 8 y 9)
    if (mapIndex >= 8) {
      const options = [
        {
          name: 'FÁCIL',
          hp: 5,
          medkits: 2,
          badgeClass: 'diff-facil',
          desc: '5 vidas y 2 botiquines en la mochila. Igual que en los niveles anteriores.',
          hearts: '❤️❤️❤️❤️❤️ 5 Vidas',
          kits: '🎒 2 Botiquines'
        },
        {
          name: 'MEDIO',
          hp: 5,
          medkits: 1,
          badgeClass: 'diff-medio',
          desc: '5 vidas y 1 botiquín en la mochila.',
          hearts: '❤️❤️❤️❤️❤️ 5 Vidas',
          kits: '🎒 1 Botiquín'
        },
        {
          name: 'DIFÍCIL',
          hp: 5,
          medkits: 0,
          badgeClass: 'diff-dificil',
          desc: '5 vidas y 0 botiquines. Tienes que sobrevivir con tu habilidad y puntería.',
          hearts: '❤️❤️❤️❤️❤️ 5 Vidas',
          kits: '🎒 0 Botiquines'
        },
        {
          name: 'ULTRA DIFÍCIL',
          hp: 3,
          medkits: 0,
          badgeClass: 'diff-ultra',
          desc: '☠️ 3 vidas y 0 botiquines. ¡Si yo pude con 3 vidas después de 10 intentos, ellos también podrán!',
          hearts: '❤️❤️❤️ 3 Vidas',
          kits: '🎒 0 Botiquines'
        }
      ];

      options.forEach(opt => {
        const card = document.createElement('div');
        card.className = `diff-card ${opt.badgeClass}`;
        card.innerHTML = `
          <span class="diff-card-badge">${opt.name}</span>
          <h3 class="diff-card-title">${opt.name}</h3>
          <div class="diff-card-stats">
            <div class="diff-stat-item">${opt.hearts}</div>
            <div class="diff-stat-item">${opt.kits}</div>
          </div>
          <p class="diff-card-desc">${opt.desc}</p>
          <button type="button" class="cyber-btn primary-btn diff-deploy-btn">▶ DESPLEGAR</button>
        `;
        card.addEventListener('click', () => {
          deployWithDifficulty(mapIndex, opt.hp, opt.medkits, opt.name);
        });
        diffCardsGrid.appendChild(card);
      });
    } else {
      // Para los mapas estándar (Mapas 1 al 8: índices 0 al 7)
      const options = [
        {
          name: 'FÁCIL',
          hp: 5,
          medkits: 2,
          badgeClass: 'diff-facil',
          desc: '+ 2 botiquines en la mochila y 5 vidas completas. Ideal para aprender el mapa.',
          hearts: '❤️❤️❤️❤️❤️ 5 Vidas',
          kits: '🎒 2 Botiquines'
        },
        {
          name: 'MEDIO',
          hp: 5,
          medkits: 1,
          badgeClass: 'diff-medio',
          desc: '5 vidas completas y 1 botiquín táctico. Desafío equilibrado.',
          hearts: '❤️❤️❤️❤️❤️ 5 Vidas',
          kits: '🎒 1 Botiquín'
        },
        {
          name: 'PRO',
          hp: 3,
          medkits: 0,
          badgeClass: 'diff-pro',
          desc: 'Solo 3 vidas y 0 botiquines. Sin margen de error.',
          hearts: '❤️❤️❤️ 3 Vidas',
          kits: '🎒 0 Botiquines'
        }
      ];

      options.forEach(opt => {
        const card = document.createElement('div');
        card.className = `diff-card ${opt.badgeClass}`;
        card.innerHTML = `
          <span class="diff-card-badge">${opt.name}</span>
          <h3 class="diff-card-title">${opt.name}</h3>
          <div class="diff-card-stats">
            <div class="diff-stat-item">${opt.hearts}</div>
            <div class="diff-stat-item">${opt.kits}</div>
          </div>
          <p class="diff-card-desc">${opt.desc}</p>
          <button type="button" class="cyber-btn primary-btn diff-deploy-btn">▶ DESPLEGAR</button>
        `;
        card.addEventListener('click', () => {
          deployWithDifficulty(mapIndex, opt.hp, opt.medkits, opt.name);
        });
        diffCardsGrid.appendChild(card);
      });
    }

    modalDifficulty.classList.add('active');
  }

  function deployWithDifficulty(mapIndex, hp, medkits, name) {
    if (Date.now() - difficultyOpenedAt < 450) return;
    stopDifficultyVideo();
    currentDifficultyConfig = { hp, medkits, name };
    if (modalDifficulty) modalDifficulty.classList.remove('active');
    window.chronoAudio.playChestUnlock();
    loadMap(mapIndex);
  }

  if (btnCancelDifficulty) {
    btnCancelDifficulty.addEventListener('click', () => {
      stopDifficultyVideo();
      if (modalDifficulty) modalDifficulty.classList.remove('active');
    });
  }

  // Selección de Mapas -> Abre selector de dificultad
  document.querySelectorAll('.rivals-card, .map-card').forEach(card => {
    let lastTap = 0;
    function handleSelect(e) {
      const now = Date.now();
      if (now - lastTap < 350) return;
      lastTap = now;
      window.chronoAudio.init();
      const mapIdx = parseInt(card.getAttribute('data-map'), 10);
      if (!isNaN(mapIdx)) {
        openDifficultyModal(mapIdx);
      }
    }
    card.addEventListener('click', handleSelect);
    card.addEventListener('touchend', handleSelect, { passive: true });
  });

  // Botón Ver Video Tutorial desde el Menú Principal
  const btnViewVideo = document.getElementById('btn-view-video');
  if (btnViewVideo) {
    btnViewVideo.addEventListener('click', () => {
      showScreen(screenInstructions);
      const videoBox = document.getElementById('tutorial-video-box');
      if (videoBox) {
        setTimeout(() => {
          videoBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    });
  }

  // Soporte Dinámico para Video Tutorial (YouTube o Archivo Local)
  window.setTutorialVideo = function(url) {
    if (!url) return;
    const placeholder = document.getElementById('video-placeholder-inner');
    const iframe = document.getElementById('tutorial-video-iframe');
    const videoPlayer = document.getElementById('tutorial-video-player');

    try {
      localStorage.setItem('chrono_tutorial_video', url);
    } catch(e) {}

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.classList.remove('hidden');
      }
      if (videoPlayer) videoPlayer.classList.add('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    } else {
      if (videoPlayer) {
        videoPlayer.src = url;
        videoPlayer.classList.remove('hidden');
        videoPlayer.load();
      }
      if (iframe) iframe.classList.add('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    }
  };

  try {
    const savedVideo = localStorage.getItem('chrono_tutorial_video');
    if (savedVideo) {
      window.setTutorialVideo(savedVideo);
    }
  } catch(e) {}

  document.getElementById('btn-exit-to-menu').addEventListener('click', () => {
    showScreen(screenMapSelect);
    gameState = 'mapSelect';
  });

  document.getElementById('btn-retry-death').addEventListener('click', () => {
    modalDeath.classList.remove('active');
    openDifficultyModal(currentMapIndex);
  });

  document.getElementById('btn-change-map-death').addEventListener('click', () => {
    modalDeath.classList.remove('active');
    showScreen(screenMapSelect);
    gameState = 'mapSelect';
  });

  document.getElementById('btn-next-map').addEventListener('click', () => {
    modalVictory.classList.remove('active');
    showScreen(screenMapSelect);
    gameState = 'mapSelect';
    const nextIdx = (currentMapIndex + 1) % MAPS_3D.length;
    openDifficultyModal(nextIdx);
  });

  const btnShopWin = document.getElementById('btn-shop-win');
  if (btnShopWin) {
    btnShopWin.addEventListener('click', () => {
      window.chronoAudio.init();
      modalVictory.classList.remove('active');
      previousMenuState = 'mapSelect';
      showScreen(screenShop);
      gameState = 'shop';
      renderShop('tactical');
    });
  }

  document.getElementById('btn-change-map-win').addEventListener('click', () => {
    modalVictory.classList.remove('active');
    showScreen(screenMapSelect);
    gameState = 'mapSelect';
  });

  const btnGotoMenuDeath = document.getElementById('btn-goto-menu-death');
  if (btnGotoMenuDeath) {
    btnGotoMenuDeath.addEventListener('click', () => {
      window.chronoAudio.init();
      modalDeath.classList.remove('active');
      showScreen(screenMainMenu);
      gameState = 'menu';
    });
  }

  const btnGotoMenuWin = document.getElementById('btn-goto-menu-win');
  if (btnGotoMenuWin) {
    btnGotoMenuWin.addEventListener('click', () => {
      window.chronoAudio.init();
      modalVictory.classList.remove('active');
      showScreen(screenMainMenu);
      gameState = 'menu';
    });
  }

  // Reintentar rápido con R
  document.getElementById('btn-quick-restart').addEventListener('click', () => {
    window.chronoAudio.init();
    if (gameState === 'playing' || gameState === 'dead' || gameState === 'won') {
      loadMap(currentMapIndex);
    }
  });

  // Pointer Lock API (Control de Cámara FPS con Ratón)
  function requestPointerLock() {
    if (isTouchActive || gameState !== 'playing') return;
    try {
      canvas.requestPointerLock();
    } catch (e) {}
  }

  if (pointerLockPrompt) {
    pointerLockPrompt.addEventListener('click', () => {
      window.chronoAudio.init();
      requestPointerLock();
    });
  }

  canvas.addEventListener('click', () => {
    window.chronoAudio.init();
    if (!isPointerLocked && !isTouchActive && gameState === 'playing') {
      requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = (document.pointerLockElement === canvas);
    if (pointerLockPrompt) {
      if (isPointerLocked) {
        pointerLockPrompt.classList.add('hidden');
      } else if (gameState === 'playing' && !isTouchActive) {
        pointerLockPrompt.classList.remove('hidden');
      }
    }
  });

  // Movimiento del Ratón para apuntar en 3D
  document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked || gameState !== 'playing' || !player) return;

    const sensitivity = 0.0022;
    player.yaw -= e.movementX * sensitivity;
    player.pitch -= e.movementY * sensitivity;

    // Inercia y balanceo del arma en primera persona
    player.addSway(e.movementX, e.movementY);

    // Limitar ángulo de inclinación vertical (pitch) a ~80 grados
    const maxPitch = 1.4;
    player.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.pitch));
  });

  // Clic Izquierdo (Disparar) y Clic Derecho (Apuntar ADS & Bullet-Time)
  window.addEventListener('mousedown', (e) => {
    window.chronoAudio.init();
    if (gameState !== 'playing' || !player) return;

    const target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;

    if (e.button === 2) {
      // Clic Derecho: Apuntar con Mira 3D (ADS) y ralentizar tiempo
      e.preventDefault();
      player.startAiming();
    } else if (e.button === 0) {
      if (isPointerLocked) {
        player.shoot();
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (gameState !== 'playing' || !player) return;
    if (e.button === 2) {
      player.stopAiming();
    }
  });

  // Prevenir menú contextual para el clic derecho
  window.addEventListener('contextmenu', (e) => {
    if (gameState === 'playing') e.preventDefault();
  });

  // Teclado
  window.addEventListener('keydown', (e) => {
    window.chronoAudio.init();

    if (e.code in keys) {
      keys[e.code] = true;
    }

    if (e.code === 'KeyR') {
      if (gameState === 'playing' || gameState === 'dead' || gameState === 'won') {
        loadMap(currentMapIndex);
      }
    }

    if (e.code === 'KeyQ') {
      e.preventDefault();
      if (gameState === 'playing' && player) {
        player.useMedkit();
      }
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'playing' && player) {
        player.throwWeapon();
      }
    }

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
      e.preventDefault();
      if (gameState === 'playing' && player) {
        player.startAiming();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code in keys) {
      keys[e.code] = false;
    }

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
      if (gameState === 'playing' && player) {
        player.stopAiming();
      }
    }
  });

  // Controles Táctiles para Móviles
  const btnTouchMedkit = document.getElementById('btn-touch-medkit');
  const btnTouchChest = document.getElementById('btn-touch-chest');
  const btnTouchPunch = document.getElementById('btn-touch-punch');
  const btnTouchThrow = document.getElementById('btn-touch-throw');
  const btnTouchShoot = document.getElementById('btn-touch-shoot');
  const joystickZone = document.getElementById('joystick-zone');
  const joystickBase = document.getElementById('joystick-base');
  const joystickKnob = document.getElementById('joystick-knob');

  if (btnTouchMedkit) {
    btnTouchMedkit.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.useMedkit();
      btnTouchMedkit.classList.add('active-touch');
    }, { passive: false });

    btnTouchMedkit.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      btnTouchMedkit.classList.remove('active-touch');
    }, { passive: false });

    btnTouchMedkit.addEventListener('touchcancel', () => {
      btnTouchMedkit.classList.remove('active-touch');
    });

    btnTouchMedkit.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.useMedkit();
    });
  }

  if (btnTouchChest) {
    btnTouchChest.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      isHoldingTouchChest = true;
      btnTouchChest.classList.add('active-touch');
    }, { passive: false });

    btnTouchChest.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      isHoldingTouchChest = false;
      btnTouchChest.classList.remove('active-touch');
    }, { passive: false });

    btnTouchChest.addEventListener('touchcancel', () => {
      isHoldingTouchChest = false;
      btnTouchChest.classList.remove('active-touch');
    });
  }

  if (btnTouchPunch) {
    btnTouchPunch.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.punch();
      btnTouchPunch.classList.add('active-touch');
    }, { passive: false });

    btnTouchPunch.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      btnTouchPunch.classList.remove('active-touch');
    }, { passive: false });
  }

  if (btnTouchThrow) {
    btnTouchThrow.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.throwWeapon();
      btnTouchThrow.classList.add('active-touch');
    }, { passive: false });

    btnTouchThrow.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      btnTouchThrow.classList.remove('active-touch');
    }, { passive: false });
  }

  if (btnTouchShoot) {
    btnTouchShoot.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.shoot();
      btnTouchShoot.classList.add('active-touch');
    }, { passive: false });

    btnTouchShoot.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      btnTouchShoot.classList.remove('active-touch');
    }, { passive: false });

    btnTouchShoot.addEventListener('touchcancel', () => {
      btnTouchShoot.classList.remove('active-touch');
    });

    btnTouchShoot.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      window.chronoAudio.init();
      if (gameState !== 'playing' || !player) return;
      player.shoot();
    });
  }

  function updateJoystickVisual(dx, dy) {
    if (joystickKnob) {
      joystickKnob.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    }
  }

  function resetJoystick() {
    joystick.active = false;
    joystick.touchId = null;
    joystick.dirX = 0;
    joystick.dirY = 0;
    if (joystickBase) joystickBase.classList.remove('active');
    updateJoystickVisual(0, 0);
  }

  window.addEventListener('touchstart', (e) => {
    isTouchActive = true;
    document.body.classList.add('is-touch');
    window.chronoAudio.init();

    if (pointerLockPrompt) pointerLockPrompt.classList.add('hidden');
    if (gameState !== 'playing' || !player) return;

    const screenWidth = window.innerWidth;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Mitad izquierda: Joystick virtual de movimiento
      if (touch.clientX < screenWidth * 0.5 && !joystick.active) {
        joystick.active = true;
        joystick.touchId = touch.identifier;
        joystick.startX = touch.clientX;
        joystick.startY = touch.clientY;
        joystick.dirX = 0;
        joystick.dirY = 0;

        if (joystickZone && joystickBase) {
          const zoneRect = joystickZone.getBoundingClientRect();
          joystickBase.style.left = `${touch.clientX - zoneRect.left}px`;
          joystickBase.style.top = `${touch.clientY - zoneRect.top}px`;
          joystickBase.style.bottom = 'auto';
          joystickBase.classList.add('active');
        }
        updateJoystickVisual(0, 0);
      }
      // Mitad derecha: Arrastrar para girar cámara (solo mirar, NO dispara al tocar)
      else if (touch.clientX >= screenWidth * 0.5 && lookTouchId === null) {
        const target = touch.target;
        const isActionBtn = target && (target.closest('.mobile-action-btn') || target.closest('button'));
        if (!isActionBtn) {
          lookTouchId = touch.identifier;
          lookLastX = touch.clientX;
          lookLastY = touch.clientY;
          // SOLO gira la cámara — el disparo es EXCLUSIVO del botón 🎯 DISPARAR
        }
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (gameState !== 'playing' || !player) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (joystick.active && touch.identifier === joystick.touchId) {
        let dx = touch.clientX - joystick.startX;
        let dy = touch.clientY - joystick.startY;
        const dist = Math.hypot(dx, dy);
        const maxR = joystick.maxRadius;
        if (dist > maxR) {
          dx = (dx / dist) * maxR;
          dy = (dy / dist) * maxR;
        }
        joystick.dirX = dx / maxR;
        joystick.dirY = dy / maxR;
        updateJoystickVisual(dx, dy);
      }
      else if (touch.identifier === lookTouchId) {
        const deltaX = touch.clientX - lookLastX;
        const deltaY = touch.clientY - lookLastY;
        lookLastX = touch.clientX;
        lookLastY = touch.clientY;

        const touchSens = 0.005;
        player.yaw -= deltaX * touchSens;
        player.pitch -= deltaY * touchSens;
        player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch));

        // Inercia y balanceo del arma en celular al girar cámara
        player.addSway(deltaX * 2.8, deltaY * 2.8);
      }
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const id = e.changedTouches[i].identifier;
      if (id === joystick.touchId) resetJoystick();
      if (id === lookTouchId) lookTouchId = null;
    }
  });

  window.addEventListener('touchcancel', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const id = e.changedTouches[i].identifier;
      if (id === joystick.touchId) resetJoystick();
      if (id === lookTouchId) lookTouchId = null;
    }
  });

  // Pantalla Completa
  const btnFullscreenHud = document.getElementById('btn-fullscreen-hud');
  const btnFullscreenMenu = document.getElementById('btn-fullscreen-menu');
  const btnFullscreenOrient = document.getElementById('btn-fullscreen-orient');
  const orientationWarning = document.getElementById('orientation-warning');
  const btnDismissOrient = document.getElementById('btn-dismiss-orient');

  function toggleFullscreen() {
    window.chronoAudio.init();
    const doc = document.documentElement;
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      if (doc.requestFullscreen) doc.requestFullscreen().catch(err => console.warn(err));
      else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(err => console.warn(err));
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  if (btnFullscreenHud) btnFullscreenHud.addEventListener('click', toggleFullscreen);
  if (btnFullscreenMenu) btnFullscreenMenu.addEventListener('click', toggleFullscreen);
  if (btnFullscreenOrient) {
    btnFullscreenOrient.addEventListener('click', () => {
      toggleFullscreen();
      if (orientationWarning) orientationWarning.style.display = 'none';
    });
  }
  if (btnDismissOrient) {
    btnDismissOrient.addEventListener('click', () => {
      if (orientationWarning) orientationWarning.style.display = 'none';
    });
  }

  // Comprobar si ya vio las instrucciones la primera vez
  const hasSeenIntro = (function () {
    try { return localStorage.getItem('chrono_intro_seen') === 'true'; } catch (e) { return false; }
  })();

  applyGlobalTheme(currentGlobalTheme);

  if (!getSession()) {
    // Sin sesión: primero elegir cómo entrar (Google / Cuenta Chrono / Invitado)
    showScreen(screenLogin);
    gameState = 'login';
  } else if (hasSeenIntro) {
    updateSessionLabel();
    showScreen(screenMainMenu);
    gameState = 'menu';
  } else {
    updateSessionLabel();
    showScreen(screenInstructions);
    gameState = 'instructions';
  }

  // ========================================================
  // 16. BUCLE PRINCIPAL DE JUEGO (GAME LOOP)
  // ========================================================

  let perfFrameCount = 0;
  let perfTimeAccum = 0;

  function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    if (gameState === 'playing') {
      // Detección de movimiento
      const isKeyboardMoving = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD ||
                               keys.ArrowUp || keys.ArrowLeft || keys.ArrowDown || keys.ArrowRight;
      const isJoystickMoving = joystick.active && Math.hypot(joystick.dirX, joystick.dirY) > 0.08;
      const isMoving = isKeyboardMoving || isJoystickMoving;

      // Actualizar cofres y comprobar interacción activa
      let isInteractingChest = false;
      for (const ch of chests) {
        ch.update(dt);
        if (!ch.isOpened && player) {
          const dist = ch.position.distanceTo(new THREE.Vector3(player.position.x, 0, player.position.z));
          if (dist < 2.8 && (keys.KeyE || isHoldingTouchChest)) {
            isInteractingChest = true;
          }
        }
      }

      // Cálculo de dilatación temporal (Time Dilation al estilo SUPERHOT & ADS)
      if (player && player.isAiming) {
        targetTimeScale = 0.01;
      } else if (isMoving || isInteractingChest) {
        targetTimeScale = TIME_SCALE_ACTIVE;
      } else {
        targetTimeScale = TIME_SCALE_STOPPED;
      }

      timeScale += (targetTimeScale - timeScale) * TIME_LERP_SPEED;

      // Modulación del drone de dilatación temporal
      window.chronoAudio.updateDrone(timeScale);

      // Actualizar Jugador (su respuesta de movimiento y cámara es fluida)
      player.update(dt, isMoving);

      // Actualizar Enemigos según timeScale
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(dt, timeScale);
      }

      // Actualizar Balas en vuelo
      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].update(dt, timeScale)) {
          bullets.splice(i, 1);
        }
      }

      // Actualizar Armas lanzadas
      for (let i = thrownWeapons.length - 1; i >= 0; i--) {
        if (thrownWeapons[i].update(dt, timeScale)) {
          thrownWeapons.splice(i, 1);
        }
      }

      // Actualizar Casquillos 3D eyectados
      for (let i = ejectedShells.length - 1; i >= 0; i--) {
        if (ejectedShells[i].update(dt, timeScale)) {
          ejectedShells.splice(i, 1);
        }
      }

      // Actualizar Armas recogibles en el suelo
      for (let i = 0; i < groundWeapons.length; i++) {
        groundWeapons[i].update(dt);
      }

      // Actualizar Esquirlas de cristal
      for (let i = crystalShards.length - 1; i >= 0; i--) {
        if (crystalShards[i].update(dt, timeScale)) {
          crystalShards.splice(i, 1);
        }
      }

      // Actualizar Partículas VFX (Chispas, Humo, Fogonazos Estrella y Debris)
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        if (sparkParticles[i].update(dt, timeScale)) sparkParticles.splice(i, 1);
      }
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        if (smokeParticles[i].update(dt, timeScale)) smokeParticles.splice(i, 1);
      }
      for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        if (muzzleFlashes[i].update(dt, timeScale)) muzzleFlashes.splice(i, 1);
      }
      for (let i = debrisParticles.length - 1; i >= 0; i--) {
        if (debrisParticles[i].update(dt, timeScale)) debrisParticles.splice(i, 1);
      }

      updateHUD();
    }

    // Renderizar escena 3D solo cuando la pantalla de juego está visible (en menús el canvas está oculto)
    if (gameState === 'playing' || gameState === 'dead' || gameState === 'won') {
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      renderDynamicCrosshair(dt);

      // Resolución dinámica universal: monitoriza los FPS en PC y móvil; si detecta tirones, baja la carga al vuelo
      perfFrameCount++;
      perfTimeAccum += dt;
      if (perfFrameCount >= 30) {
        const avgMs = (perfTimeAccum / perfFrameCount) * 1000;
        let newRatio = currentPixelRatio;
        if (avgMs > 22 && currentPixelRatio > 0.75) {
          newRatio = Math.max(0.75, currentPixelRatio - 0.15);
        } else if (avgMs < 16.5 && currentPixelRatio < MAX_PIXEL_RATIO) {
          newRatio = Math.min(MAX_PIXEL_RATIO, currentPixelRatio + 0.05);
        }
        if (Math.abs(newRatio - currentPixelRatio) > 0.001) {
          currentPixelRatio = newRatio;
          renderer.setPixelRatio(currentPixelRatio);
          onWindowResize();
        }
        perfFrameCount = 0;
        perfTimeAccum = 0;
      }

      // Actualizar Panel de Depuración (FPS, Draw Calls, Triángulos) si está visible
      updateDebugPerfPanel(dt);
    }

    requestAnimationFrame(gameLoop);
  }

  // ========================================================
  // PANEL DE DEPURACIÓN Y MONITOREO DE RENDIMIENTO
  // ========================================================
  let isDebugPanelOpen = false;
  let debugFpsCounter = 0;
  let debugFpsAccum = 0;
  let currentFpsDisplay = 60;

  const btnDebugHud = document.getElementById('btn-debug-hud');
  const debugPerfPanel = document.getElementById('debug-perf-panel');
  const debugFpsElem = document.getElementById('debug-fps');
  const debugDrawCallsElem = document.getElementById('debug-draw-calls');
  const debugTrianglesElem = document.getElementById('debug-triangles');
  const debugPixelRatioElem = document.getElementById('debug-pixel-ratio');
  const debugMobileModeElem = document.getElementById('debug-mobile-mode');
  const btnToggleMobileMode = document.getElementById('btn-toggle-mobile-mode');

  function toggleDebugPanel() {
    isDebugPanelOpen = !isDebugPanelOpen;
    if (debugPerfPanel) {
      debugPerfPanel.classList.toggle('hidden', !isDebugPanelOpen);
    }
  }

  if (btnDebugHud) {
    btnDebugHud.addEventListener('click', toggleDebugPanel);
  }

  // Tecla de acceso rápido F3 para depuración
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F3') {
      e.preventDefault();
      toggleDebugPanel();
    }
  });

  // Alternador de modo móvil / PC para pruebas y banco de benchmarking
  function applyMobilePerformanceMode(active) {
    forceMobileMode = active;
    renderer.setPixelRatio(active ? 1.0 : currentPixelRatio);
    renderer.shadowMap.enabled = !active;
    if (dirLight) dirLight.castShadow = !active;

    // Limpiar caché de materiales para que las armas se regeneren con el material adecuado
    materialCache.clear();

    // Recrear arma del jugador si está activa
    if (player && player.weapon) {
      player.setupViewWeapon();
    }

    // Actualizar armas en el suelo
    for (let gw of groundWeapons) {
      if (gw.rebuildMesh) gw.rebuildMesh();
    }

    if (debugMobileModeElem) {
      debugMobileModeElem.textContent = active ? 'ON (Móvil Ultra)' : 'OFF (PC PBR)';
      debugMobileModeElem.className = 'debug-val ' + (active ? 'green' : 'yellow');
    }
  }

  if (btnToggleMobileMode) {
    btnToggleMobileMode.addEventListener('click', () => {
      applyMobilePerformanceMode(!forceMobileMode);
    });
  }

  function updateDebugPerfPanel(dt) {
    debugFpsCounter++;
    debugFpsAccum += dt;

    if (debugFpsAccum >= 0.25) {
      currentFpsDisplay = Math.round(debugFpsCounter / debugFpsAccum);
      debugFpsCounter = 0;
      debugFpsAccum = 0;

      if (isDebugPanelOpen && renderer && renderer.info) {
        if (debugFpsElem) {
          debugFpsElem.textContent = currentFpsDisplay;
          debugFpsElem.className = 'debug-val ' + (currentFpsDisplay >= 50 ? 'green' : (currentFpsDisplay >= 30 ? 'yellow' : 'red'));
        }
        if (debugDrawCallsElem) {
          debugDrawCallsElem.textContent = renderer.info.render.calls;
        }
        if (debugTrianglesElem) {
          debugTrianglesElem.textContent = renderer.info.render.triangles.toLocaleString();
        }
        if (debugPixelRatioElem) {
          debugPixelRatioElem.textContent = (renderer.getPixelRatio ? renderer.getPixelRatio() : currentPixelRatio).toFixed(2);
        }
        if (debugMobileModeElem) {
          debugMobileModeElem.textContent = forceMobileMode ? 'ON (Móvil Ultra)' : 'OFF (PC PBR)';
          debugMobileModeElem.className = 'debug-val ' + (forceMobileMode ? 'green' : 'yellow');
        }
      }
    }
  }

  // Ajuste de resolución dinámica para mantener proporción
  function onWindowResize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      if (composer) {
        composer.setSize(rect.width, rect.height);
      }
    }
  }
  window.addEventListener('resize', onWindowResize);
  setTimeout(onWindowResize, 100);

  // Iniciar animación
  requestAnimationFrame(gameLoop);

})();
