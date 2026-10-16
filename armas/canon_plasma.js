// ========================================================
// MÓDULO DE ARMA: CAÑÓN DE PLASMA CHRONO
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// Estructura modular: colores agrupados al inicio y piezas nombradas (mesh.name)
// Conserva el indicador diegético de 5 segmentos y toda su lógica de animación
//
// SILUETA: un solo cañón central con boca en campana, bobinas separadas, cámara
// de núcleo abierta, celda cilíndrica grande y aletas laterales (todo redondeado).
// PIEZAS ANIMADAS (nunca se fusionan, game.js las protege por nombre):
//   - balaIndicador_1 a balaIndicador_5
//   - nucleoOrb / nucleoHalo
//   - anilloReloj_aro (aro + 12 marcas en UNA sola malla)
// El resto de piezas comparte materiales (gris claro, grafito, negro, magenta) y
// game.js las fusiona por material: 4 draw calls estáticos en total.
// ========================================================

(function(global) {
  'use strict';

  function buildPlasmaMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;

    // ========================================================
    // PALETA DE COLORES Y MATERIALES (Agrupados al inicio para fácil edición)
    // ========================================================
    // 1. Gris Claro: blindaje superior, collar frontal, bobinas y bordes (zona clara)
    const COLOR_GRIS_CLARO_HEX = isGold ? 0xfff3b0 : (isVortex ? 0xe9d5ff : (isMatrix ? 0xd1fae5 : (isInferno ? 0xfecaca : 0xb9c2d3)));
    // 2. Negro Azulado: carcasa trasera, marco del contador, interior de la boca (zona oscura)
    const COLOR_NEGRO_HEX      = isGold ? 0x221a08 : (isVortex ? 0x180f28 : (isMatrix ? 0x052018 : (isInferno ? 0x240808 : 0x0c0e24)));
    // 3. Grafito: cañón, soportes, aletas y herrajes (zona media)
    const COLOR_GRAFITO_HEX    = isGold ? 0x6b5314 : (isVortex ? 0x3b1d5c : (isMatrix ? 0x064e3b : (isInferno ? 0x5a1a1a : 0x4b566b)));
    // 4. Magenta Brillante: plasma, núcleo, celda, anillo de reloj y balas indicadoras
    const COLOR_MAGENTA_HEX    = isGold ? 0xffea00 : (isVortex ? 0xd946ef : (isMatrix ? 0x10b981 : (isInferno ? 0xff3b30 : 0xff0a85)));
    // 5. Derivados del magenta (no son colores nuevos, salen del magenta de la skin)
    const COLOR_NUCLEO_HEX       = new THREE.Color(COLOR_MAGENTA_HEX).lerp(new THREE.Color(0xffffff), 0.55).getHex(); // magenta incandescente
    const COLOR_BALA_ALERTA_HEX  = new THREE.Color(COLOR_MAGENTA_HEX).multiplyScalar(0.30).getHex();                  // parpadeo de última bala
    // 6. Indicador de munición: vacío = gris oscuro siempre visible sobre el marco negro
    const COLOR_BALA_VACIA_HEX = 0x3a4256;
    const COLOR_BALA_FLASH_HEX = 0xffffff;

    const matGrisClaro  = applyFortniteShader(createStylizedPBR(COLOR_GRIS_CLARO_HEX, 0x000000, 0, 0.35, 0.20), { edge: 0.85, grad: 0.22, rim: 0.26 });
    const matNegro      = applyFortniteShader(createStylizedPBR(COLOR_NEGRO_HEX, 0x000000, 0, 0.65, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const matGrafito    = applyFortniteShader(createStylizedPBR(COLOR_GRAFITO_HEX, 0x000000, 0, 0.45, 0.25), { edge: 0.70, grad: 0.18, rim: 0.18 });
    const matPlasmaGlow = new THREE.MeshBasicMaterial({ color: COLOR_MAGENTA_HEX });
    const matNucleo     = new THREE.MeshBasicMaterial({ color: COLOR_NUCLEO_HEX });
    const matHalo       = new THREE.MeshBasicMaterial({ color: COLOR_MAGENTA_HEX, transparent: true, opacity: 0.70, depthWrite: false });

    // Altura del eje del cañón (misma que antes para que las manos sigan encajando)
    const AX = 0.035;

    // ========================================================
    // HELPERS DE GEOMETRÍA (todas las piezas nacen con nombre y se agregan a su padre)
    // ========================================================
    function pieza(padre, geo, mat, nombre, x, y, z, rx, ry, rz) {
      const m = new THREE.Mesh(geo, mat);
      m.name = nombre;
      m.position.set(x || 0, y || 0, z || 0);
      if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
      padre.add(m);
      return m;
    }

    // Cilindro con el eje a lo largo del cañón (Z)
    function cilindroZ(r1, r2, largo, seg) {
      const g = new THREE.CylinderGeometry(r1, r2, largo, seg || 12);
      g.rotateX(Math.PI / 2);
      return g;
    }

    // Revolución alrededor del eje Z. perfil = [[radio, z], ...] de adelante (z menor) hacia atrás.
    // En orden creciente de z las caras miran hacia afuera; en orden decreciente miran hacia adentro.
    function revolucionZ(perfil, seg) {
      const pts = perfil.map(function(p) { return new THREE.Vector2(p[0], p[1]); });
      const g = new THREE.LatheGeometry(pts, seg || 20);
      g.rotateX(Math.PI / 2);
      return g;
    }

    // Placa de esquinas redondeadas con bisel, tumbada sobre el plano XZ (grosor en Y, largo en Z)
    function placaRedondeada(ancho, largo, radio, grosor, bisel) {
      const w = ancho / 2, l = largo / 2, r = radio;
      const s = new THREE.Shape();
      s.moveTo(-w + r, -l);
      s.lineTo(w - r, -l);
      s.quadraticCurveTo(w, -l, w, -l + r);
      s.lineTo(w, l - r);
      s.quadraticCurveTo(w, l, w - r, l);
      s.lineTo(-w + r, l);
      s.quadraticCurveTo(-w, l, -w, l - r);
      s.lineTo(-w, -l + r);
      s.quadraticCurveTo(-w, -l, -w + r, -l);
      const g = new THREE.ExtrudeGeometry(s, { depth: grosor, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: bisel, bevelThickness: bisel, curveSegments: 4 });
      g.translate(0, 0, -grosor / 2);
      g.rotateX(-Math.PI / 2);
      return g;
    }

    // Une varias geometrías ya transformadas en una sola (solo para el anillo de reloj)
    function fusionarGeometrias(lista) {
      let nPos = 0, nIdx = 0;
      lista.forEach(function(g) {
        nPos += g.attributes.position.count;
        nIdx += g.index ? g.index.count : g.attributes.position.count;
      });
      const pos = new Float32Array(nPos * 3);
      const nor = new Float32Array(nPos * 3);
      const uvs = new Float32Array(nPos * 2);
      const idx = new Uint16Array(nIdx);
      let vOff = 0, iOff = 0;
      lista.forEach(function(g) {
        const cnt = g.attributes.position.count;
        pos.set(g.attributes.position.array, vOff * 3);
        nor.set(g.attributes.normal.array, vOff * 3);
        if (g.attributes.uv) uvs.set(g.attributes.uv.array, vOff * 2);
        if (g.index) {
          for (let i = 0; i < g.index.count; i++) idx[iOff++] = g.index.array[i] + vOff;
        } else {
          for (let i = 0; i < cnt; i++) idx[iOff++] = i + vOff;
        }
        vOff += cnt;
      });
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      out.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      out.setIndex(new THREE.BufferAttribute(idx, 1));
      return out;
    }

    // Esfera de reloj (símbolo grande y legible). Se construye mirando a +Z y luego se orienta.
    // Piezas estáticas: comparten material y game.js las fusiona.
    function crearDial(padre, nombre, radio, x, y, z, rotY) {
      const dial = new THREE.Group();
      dial.name = nombre;
      dial.position.set(x, y, z);
      dial.rotation.y = rotY;

      pieza(dial, new THREE.CircleGeometry(radio, 20), matNegro, nombre + '_cara', 0, 0, 0);
      pieza(dial, new THREE.TorusGeometry(radio * 0.96, 0.0028, 6, 26), matPlasmaGlow, nombre + '_aro', 0, 0, 0.0015);

      for (let h = 0; h < 12; h++) {
        const a = h * Math.PI / 6;
        const cardinal = (h % 3 === 0);
        const largo = radio * (cardinal ? 0.26 : 0.15);
        const rad = radio * (cardinal ? 0.72 : 0.77);
        pieza(dial, new THREE.BoxGeometry(0.0036, largo, 0.004), matPlasmaGlow, nombre + '_marca',
          Math.sin(a) * rad, Math.cos(a) * rad, 0.001, 0, 0, -a);
      }

      // Manecillas en las 10:10 (agujas en gris claro para contrastar con la esfera negra)
      const aH = -Math.PI / 3, lH = radio * 0.48;
      pieza(dial, new THREE.BoxGeometry(0.0055, lH, 0.0035), matGrisClaro, nombre + '_horario',
        Math.sin(aH) * lH / 2, Math.cos(aH) * lH / 2, 0.0035, 0, 0, -aH);
      const aM = Math.PI / 3, lM = radio * 0.70;
      pieza(dial, new THREE.BoxGeometry(0.0045, lM, 0.0035), matGrisClaro, nombre + '_minutero',
        Math.sin(aM) * lM / 2, Math.cos(aM) * lM / 2, 0.0045, 0, 0, -aM);
      pieza(dial, new THREE.CylinderGeometry(0.0058, 0.0058, 0.006, 10), matPlasmaGlow, nombre + '_centro', 0, 0, 0.0045, Math.PI / 2, 0, 0);

      padre.add(dial);
      return dial;
    }

    // ========================================================
    // 1. PIEZA: CUERPO (cámara del núcleo, carcasa trasera oscura, blindaje claro, culata, empuñadura)
    // ========================================================
    const cuerpo = new THREE.Group();
    cuerpo.name = 'cuerpo';

    // Collar frontal en Gris Claro: transición redondeada del tubo a la cámara
    pieza(cuerpo, revolucionZ([
      [0.030, -0.155], [0.046, -0.150], [0.064, -0.138], [0.077, -0.122],
      [0.0835, -0.108], [0.084, -0.100], [0.0835, -0.094], [0.0, -0.094]
    ], 24), matGrisClaro, 'cuerpo_collar', 0, AX, 0);
    pieza(cuerpo, new THREE.TorusGeometry(0.0842, 0.0040, 6, 28), matNegro, 'cuerpo_collarRanura', 0, AX, -0.101);

    // Carcasa trasera en Negro Azulado (la zona oscura bien marcada del arma)
    pieza(cuerpo, revolucionZ([
      [0.0, 0.030], [0.062, 0.030], [0.073, 0.036], [0.078, 0.048],
      [0.078, 0.205], [0.073, 0.218], [0.064, 0.224], [0.0, 0.224]
    ], 24), matNegro, 'cuerpo_carcasa', 0, AX, 0);
    for (let zb of [0.044, 0.210]) {
      pieza(cuerpo, new THREE.TorusGeometry(0.0785, 0.0045, 5, 22), matGrafito, 'cuerpo_banda', 0, AX, zb);
    }

    // Blindaje superior en Gris Claro (arco de 103°) con bordes de grafito para dar relieve
    const blindajeGeo = new THREE.CylinderGeometry(0.0815, 0.0815, 0.148, 20, 1, true, Math.PI - 0.9, 1.8);
    blindajeGeo.rotateX(Math.PI / 2);
    pieza(cuerpo, blindajeGeo, matGrisClaro, 'cuerpo_blindaje', 0, AX, 0.126);
    for (let zt of [0.052, 0.200]) {
      pieza(cuerpo, new THREE.TorusGeometry(0.0815, 0.0042, 5, 12, 1.8), matGrafito, 'cuerpo_blindajeBorde', 0, AX, zt, 0, 0, Math.PI / 2 - 0.9);
    }
    for (let sb of [-1, 1]) {
      pieza(cuerpo, cilindroZ(0.0042, 0.0042, 0.148, 6), matGrafito, 'cuerpo_blindajeLista',
        sb * 0.0815 * Math.sin(0.9), AX + 0.0815 * Math.cos(0.9), 0.126);
    }

    // Jaula de la cámara del núcleo: 4 soportes en diagonal dejan ventanas abiertas para ver el plasma
    for (let k = 0; k < 4; k++) {
      const ang = Math.PI / 4 + k * Math.PI / 2;
      pieza(cuerpo, cilindroZ(0.008, 0.008, 0.142, 8), matGrafito, 'cuerpo_soporteCamara',
        Math.cos(ang) * 0.070, AX + Math.sin(ang) * 0.070, -0.026);
    }
    // Eje central que sostiene el núcleo + bridas magenta en ambas caras de la cámara
    pieza(cuerpo, cilindroZ(0.009, 0.009, 0.130, 10), matGrafito, 'camara_eje', 0, AX, -0.032);
    pieza(cuerpo, new THREE.TorusGeometry(0.018, 0.0040, 6, 18), matPlasmaGlow, 'camara_bridaFrontal', 0, AX, -0.0925);
    pieza(cuerpo, new THREE.TorusGeometry(0.018, 0.0040, 6, 18), matPlasmaGlow, 'camara_bridaTrasera', 0, AX, 0.0285);
    // Poste que une la celda con la cámara (soporte bajo el núcleo)
    pieza(cuerpo, new THREE.CylinderGeometry(0.010, 0.012, 0.050, 8), matGrafito, 'camara_posteCelda', 0, -0.027, -0.034);

    // Símbolo de reloj/engranaje grande en ambos flancos (visible en mano y desde el suelo)
    for (let side of [-1, 1]) {
      const lado = side < 0 ? 'Izq' : 'Der';
      pieza(cuerpo, new THREE.CylinderGeometry(0.049, 0.049, 0.030, 20), matGrisClaro, 'cuerpo_engranaje' + lado,
        side * 0.075, AX, 0.150, 0, 0, Math.PI / 2);
      for (let t = 0; t < 10; t++) {
        const a = t * Math.PI / 5;
        pieza(cuerpo, new THREE.CylinderGeometry(0.0065, 0.0065, 0.036, 6), matGrafito, 'cuerpo_diente' + lado,
          side * 0.075, AX + Math.sin(a) * 0.0505, 0.150 + Math.cos(a) * 0.0505, 0, 0, Math.PI / 2);
      }
      crearDial(cuerpo, 'relojFlanco' + lado, 0.039, side * 0.0915, AX, 0.150, side * Math.PI / 2);
    }

    // Culata trasera redondeada con esfera de reloj mirando al jugador
    pieza(cuerpo, revolucionZ([
      [0.0, 0.222], [0.060, 0.222], [0.067, 0.229], [0.067, 0.241], [0.061, 0.248], [0.0, 0.248]
    ], 24), matGrafito, 'cuerpo_culata', 0, AX, 0);
    pieza(cuerpo, new THREE.TorusGeometry(0.0545, 0.0045, 6, 26), matGrisClaro, 'cuerpo_culataAro', 0, AX, 0.2495);
    crearDial(cuerpo, 'relojCulata', 0.046, 0, AX, 0.250, 0);

    // Empuñadura ergonómica curva en Negro Azulado (con nervaduras de grafito)
    const gripShape = new THREE.Shape();
    gripShape.moveTo(0.06, -0.02);
    gripShape.lineTo(0.13, -0.02);
    gripShape.quadraticCurveTo(0.128, -0.12, 0.108, -0.212);
    gripShape.quadraticCurveTo(0.080, -0.240, 0.045, -0.220);
    gripShape.quadraticCurveTo(0.040, -0.12, 0.06, -0.02);
    const gripGeo = new THREE.ExtrudeGeometry(gripShape, { depth: 0.058, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007, curveSegments: 6 });
    gripGeo.translate(0, 0, -0.029);
    const gripMesh = pieza(cuerpo, gripGeo, matNegro, 'cuerpo_empunadura', 0, 0, 0.02, 0, -Math.PI / 2, 0);

    for (let side of [-1, 1]) {
      for (let r = 0; r < 4; r++) {
        const ry = -0.07 - r * 0.03;
        const rz = 0.115 + (ry + 0.02) * 0.11;
        pieza(cuerpo, cilindroZ(0.0042, 0.0042, 0.05, 6), matGrafito, 'cuerpo_empunaduraNervio', side * 0.036, ry, rz);
      }
    }

    group.add(cuerpo);

    // ========================================================
    // 2. PIEZA: CAÑO (un solo tubo central de grafito)
    // ========================================================
    const cano = new THREE.Group();
    cano.name = 'cano';

    pieza(cano, cilindroZ(0.030, 0.030, 0.215, 12), matGrafito, 'cano_tubo', 0, AX, -0.2225);

    group.add(cano);

    // ========================================================
    // 3. PIEZA: BOCA (campana en embudo con labio, interior oscuro y plasma al fondo)
    // ========================================================
    const boca = new THREE.Group();
    boca.name = 'boca';

    const bocaGarganta = -0.33;
    const bocaLabio = -0.44;
    const radioCampana = function(t) { return 0.034 + 0.052 * Math.pow(t, 2.2); }; // t: 0 garganta, 1 labio
    const zCampana = function(t) { return bocaGarganta + (bocaLabio - bocaGarganta) * t; };

    const perfilExterior = [];
    for (let k = 0; k <= 8; k++) {
      const t = 1 - k / 8; // del labio (z menor) hacia la garganta
      perfilExterior.push([radioCampana(t), zCampana(t)]);
    }
    pieza(boca, revolucionZ(perfilExterior, 26), matGrisClaro, 'boca_campana', 0, AX, 0);

    // Interior oscuro: mismo perfil achicado y en orden inverso para que sus caras miren hacia adentro
    const perfilInterior = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8; // de la garganta al labio (z decreciente)
      perfilInterior.push([radioCampana(t) - 0.007, bocaGarganta - 0.005 + (bocaLabio + 0.004 - bocaGarganta + 0.005) * t]);
    }
    pieza(boca, revolucionZ(perfilInterior, 26), matNegro, 'boca_interior', 0, AX, 0);

    pieza(boca, new THREE.TorusGeometry(0.0825, 0.0085, 6, 24), matGrafito, 'boca_labio', 0, AX, bocaLabio);
    for (let tb of [0.45, 0.72]) {
      pieza(boca, new THREE.TorusGeometry(radioCampana(tb), 0.0045, 5, 20), matGrafito, 'boca_banda', 0, AX, zCampana(tb));
    }
    // Disco de plasma al fondo de la campana
    pieza(boca, new THREE.CircleGeometry(0.026, 18), matPlasmaGlow, 'boca_plasma', 0, AX, -0.343, 0, Math.PI, 0);

    group.add(boca);

    // ========================================================
    // 4. PIEZA: BOBINAS (anillos separados a lo largo del tubo, con soportes y bandas de energía)
    // ========================================================
    const bobinas = new THREE.Group();
    bobinas.name = 'bobinas';

    const bobinaZ = [-0.305, -0.255, -0.205, -0.155];
    const bobinaR = [0.044, 0.048, 0.052, 0.056];
    for (let i = 0; i < bobinaZ.length; i++) {
      pieza(bobinas, new THREE.TorusGeometry(bobinaR[i], 0.0095, 6, 18), matGrisClaro, 'bobinas_aro', 0, AX, bobinaZ[i]);
      // Dos radios cruzados sostienen cada aro al tubo (sus extremos quedan dentro del aro)
      pieza(bobinas, new THREE.CylinderGeometry(0.0045, 0.0045, bobinaR[i] * 2, 6), matGrafito, 'bobinas_radioY', 0, AX, bobinaZ[i]);
      pieza(bobinas, new THREE.CylinderGeometry(0.0045, 0.0045, bobinaR[i] * 2, 6), matGrafito, 'bobinas_radioX', 0, AX, bobinaZ[i], 0, 0, Math.PI / 2);
    }
    // Bandas magenta de carga entre bobinas
    for (let zb of [-0.280, -0.230, -0.180]) {
      pieza(bobinas, new THREE.TorusGeometry(0.0325, 0.0045, 5, 14), matPlasmaGlow, 'bobinas_energia', 0, AX, zb);
    }

    group.add(bobinas);

    // ========================================================
    // 5. PIEZA: NÚCLEO (orbe magenta incandescente en la cámara, lo más brillante del arma)
    // ========================================================
    const nucleo = new THREE.Group();
    nucleo.name = 'nucleo';

    const coreZ = -0.032;
    const coreY = AX;
    nucleo.position.set(0, coreY, coreZ);

    const nucleoOrb = pieza(nucleo, new THREE.SphereGeometry(0.035, 14, 10), matNucleo, 'nucleoOrb', 0, 0, 0);
    const nucleoHalo = pieza(nucleo, new THREE.SphereGeometry(0.048, 14, 10), matHalo, 'nucleoHalo', 0, 0, 0);

    group.add(nucleo);

    // ========================================================
    // 6. PIEZA: ANILLO RELOJ (una sola malla: aro + 12 marcas de hora, gira alrededor del núcleo)
    // ========================================================
    const anilloReloj = new THREE.Group();
    anilloReloj.name = 'anilloReloj';
    anilloReloj.position.set(0, coreY, coreZ);

    const relojGeos = [new THREE.TorusGeometry(0.052, 0.0045, 6, 28)];
    for (let h = 0; h < 12; h++) {
      const a = h * Math.PI / 6;
      const cardinal = (h % 3 === 0);
      const largo = cardinal ? 0.016 : 0.010;
      const g = new THREE.BoxGeometry(0.0045, largo, 0.007);
      const mtx = new THREE.Matrix4().compose(
        new THREE.Vector3(Math.sin(a) * 0.052, Math.cos(a) * 0.052, 0),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -a)),
        new THREE.Vector3(1, 1, 1)
      );
      g.applyMatrix4(mtx);
      relojGeos.push(g);
    }
    // Esfera en las 12 para distinguir el giro
    const marca12 = new THREE.SphereGeometry(0.006, 8, 6);
    marca12.translate(0, 0.055, 0);
    relojGeos.push(marca12);

    pieza(anilloReloj, fusionarGeometrias(relojGeos), matPlasmaGlow, 'anilloReloj_aro', 0, 0, 0);

    group.add(anilloReloj);

    // ========================================================
    // 7. PIEZA: ALETAS (aletas de ventilación laterales, lentes achatados con borde suave)
    // ========================================================
    const aletas = new THREE.Group();
    aletas.name = 'aletas';

    for (let side of [-1, 1]) {
      for (let f = 0; f < 3; f++) {
        const fin = pieza(aletas, new THREE.SphereGeometry(0.036, 8, 5), matGrafito, 'aletas_placa',
          side * 0.086, AX, 0.052 + f * 0.018);
        fin.scale.set(1.0, 1.4, 0.16);
      }
    }

    group.add(aletas);

    // ========================================================
    // 8. PIEZA: CELDA (celda de energía cilíndrica grande, con núcleo magenta visible tras barras)
    // ========================================================
    const celda = new THREE.Group();
    celda.name = 'celda';
    celda.position.set(0, -0.125, -0.065);
    celda.rotation.x = 0.18;

    pieza(celda, new THREE.CylinderGeometry(0.050, 0.050, 0.024, 16), matNegro, 'celda_base', 0, 0.066, 0);
    pieza(celda, new THREE.CylinderGeometry(0.044, 0.044, 0.016, 16), matGrisClaro, 'celda_tapaSuperior', 0, 0.058, 0);
    pieza(celda, new THREE.CylinderGeometry(0.044, 0.044, 0.016, 16), matGrisClaro, 'celda_tapaInferior', 0, -0.058, 0);
    pieza(celda, new THREE.CylinderGeometry(0.036, 0.040, 0.012, 16), matGrafito, 'celda_pie', 0, -0.072, 0);
    pieza(celda, new THREE.CylinderGeometry(0.030, 0.030, 0.100, 14), matPlasmaGlow, 'celda_plasma', 0, 0, 0);
    for (let cr of [-0.03, 0.03]) {
      pieza(celda, new THREE.TorusGeometry(0.034, 0.005, 5, 14), matNegro, 'celda_anillo', 0, cr, 0, Math.PI / 2, 0, 0);
    }
    for (let b = 0; b < 6; b++) {
      const ang = b * Math.PI / 3;
      pieza(celda, new THREE.CylinderGeometry(0.0035, 0.0035, 0.116, 6), matGrafito, 'celda_barra',
        Math.cos(ang) * 0.036, 0, Math.sin(ang) * 0.036);
    }

    group.add(celda);

    // ========================================================
    // 9. PIEZA: GATILLO (guardamonte redondeado y palanca con acento magenta)
    // ========================================================
    const gatillo = new THREE.Group();
    gatillo.name = 'gatillo';

    const guardShape = new THREE.Shape();
    guardShape.moveTo(-0.02, -0.02);
    guardShape.lineTo(-0.02, -0.07);
    guardShape.quadraticCurveTo(-0.02, -0.10, 0.015, -0.10);
    guardShape.lineTo(0.06, -0.10);
    guardShape.lineTo(0.06, -0.02);
    guardShape.lineTo(0.05, -0.02);
    guardShape.lineTo(0.05, -0.09);
    guardShape.lineTo(0.015, -0.09);
    guardShape.quadraticCurveTo(-0.01, -0.09, -0.01, -0.07);
    guardShape.lineTo(-0.01, -0.02);
    guardShape.lineTo(-0.02, -0.02);
    const guardGeo = new THREE.ExtrudeGeometry(guardShape, { depth: 0.026, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.004, bevelThickness: 0.004, curveSegments: 4 });
    guardGeo.translate(0, 0, -0.013);
    pieza(gatillo, guardGeo, matGrafito, 'gatillo_guardamonte', 0, 0, 0.02, 0, -Math.PI / 2, 0);

    pieza(gatillo, new THREE.CylinderGeometry(0.0045, 0.0045, 0.028, 8), matPlasmaGlow, 'gatillo_palanca', 0, -0.052, 0.036, -0.35, 0, 0);
    pieza(gatillo, new THREE.CylinderGeometry(0.004, 0.004, 0.030, 8), matGrafito, 'gatillo_eje', 0, -0.040, 0.032, 0, 0, Math.PI / 2);

    group.add(gatillo);

    // ========================================================
    // 10. PIEZA: MIRA (anillo colimador con punto magenta sobre el collar)
    // ========================================================
    const mira = new THREE.Group();
    mira.name = 'mira';

    pieza(mira, new THREE.CylinderGeometry(0.008, 0.009, 0.024, 8), matGrafito, 'mira_poste', 0, 0.127, -0.105);
    pieza(mira, new THREE.TorusGeometry(0.016, 0.0045, 6, 18), matGrafito, 'mira_aro', 0, 0.155, -0.105);
    pieza(mira, new THREE.CylinderGeometry(0.0025, 0.0025, 0.032, 6), matGrafito, 'mira_barra', 0, 0.155, -0.105, 0, 0, Math.PI / 2);
    pieza(mira, new THREE.SphereGeometry(0.006, 8, 6), matPlasmaGlow, 'mira_punto', 0, 0.155, -0.105);

    group.add(mira);

    // ========================================================
    // 11. PIEZA: INDICADOR CONSOLA (fila propia sobre el blindaje, marco oscuro y 5 segmentos gruesos)
    // balaIndicador_1 queda más cerca del jugador (última bala) y balaIndicador_5 más al frente
    // ========================================================
    const indicatorConsole = new THREE.Group();
    indicatorConsole.name = 'indicadorConsola';
    indicatorConsole.position.set(0, AX + 0.0885, 0.1265);
    indicatorConsole.rotation.x = 0.12;

    // Zócalo de grafito: sostiene el marco inclinado sobre el blindaje (sin piezas flotando)
    pieza(indicatorConsole, placaRedondeada(0.040, 0.118, 0.010, 0.030, 0.0015), matGrafito, 'indicadorBase', 0, -0.0175, 0.0);
    pieza(indicatorConsole, placaRedondeada(0.052, 0.158, 0.013, 0.008, 0.0015), matNegro, 'indicadorMarco', 0, 0, 0);

    const indicatorMaterials = [];
    const indicatorMeshes = [];

    for (let s = 1; s <= 5; s++) {
      const indMat = new THREE.MeshBasicMaterial({ color: COLOR_MAGENTA_HEX });
      indicatorMaterials.push(indMat);

      const sz = 0.060 - (s - 1) * 0.030;
      const segMesh = pieza(indicatorConsole, placaRedondeada(0.032, 0.019, 0.007, 0.008, 0.0015), indMat,
        'balaIndicador_' + s, 0, 0.0055, sz);
      indicatorMeshes.push(segMesh);
    }

    group.add(indicatorConsole);

    // ========================================================
    // CONTROL DINÁMICO Y DIEGÉTICO DEL CAÑÓN DE PLASMA
    // ========================================================
    group.userData.isPlasma = true;
    group.userData.anilloReloj = anilloReloj;
    group.userData.nucleoOrb = nucleoOrb;
    group.userData.nucleoHalo = nucleoHalo;
    group.userData.indicators = indicatorMeshes;
    group.userData.indicatorMats = indicatorMaterials;
    group.userData.lastAmmo = 5;
    group.userData.flickerTimers = [0, 0, 0, 0, 0];

    // Función expuesta para encender o apagar cada segmento según munición
    group.userData.setAmmoSegments = function(ammoCount) {
      for (let i = 0; i < 5; i++) {
        indicatorMaterials[i].color.setHex(i < ammoCount ? COLOR_MAGENTA_HEX : COLOR_BALA_VACIA_HEX);
      }
    };

    // Función de ciclo de animación diegética: rotación del reloj, pulsos y parpadeos
    group.userData.updatePlasma = function(dt, currentAmmo, isReloading, reloadTimer, reloadDuration) {
      // 1. Rotación continua del anillo de reloj en 3D alrededor del núcleo
      if (anilloReloj) {
        anilloReloj.rotation.y += dt * 2.2;
        anilloReloj.rotation.z += dt * 1.1;
      }

      // 2. Pulso de energía en el núcleo de plasma
      if (nucleoOrb) {
        const t = Date.now() * 0.007;
        const pulse = 1.0 + Math.sin(t) * 0.08;
        nucleoOrb.scale.setScalar(pulse);
        if (nucleoHalo) nucleoHalo.scale.setScalar(1.0 + Math.cos(t * 1.4) * 0.12);
      }

      // 3. Indicador de munición diegético
      if (currentAmmo < group.userData.lastAmmo && !isReloading) {
        const spentIdx = currentAmmo;
        if (spentIdx >= 0 && spentIdx < 5) {
          group.userData.flickerTimers[spentIdx] = 0.18;
        }
      }
      group.userData.lastAmmo = currentAmmo;

      if (isReloading && reloadDuration > 0) {
        // Al recargar: se encienden de a uno en orden, de abajo hacia arriba (de 1 a 5)
        const progress = Math.max(0, Math.min(1.0, 1.0 - (reloadTimer / reloadDuration)));
        const activeCount = Math.floor(progress * 5.99);
        for (let i = 0; i < 5; i++) {
          indicatorMaterials[i].color.setHex(i < activeCount ? COLOR_MAGENTA_HEX : COLOR_BALA_VACIA_HEX);
        }
      } else {
        // Estado normal de combate
        const now = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
          if (group.userData.flickerTimers[i] > 0) {
            group.userData.flickerTimers[i] -= dt;
            const flash = Math.sin(group.userData.flickerTimers[i] * 55) > 0;
            indicatorMaterials[i].color.setHex(flash ? COLOR_BALA_FLASH_HEX : COLOR_MAGENTA_HEX);
          } else if (i < currentAmmo) {
            if (currentAmmo === 1 && i === 0) {
              const warnBlink = (Math.sin(now * 12) > 0);
              indicatorMaterials[i].color.setHex(warnBlink ? COLOR_MAGENTA_HEX : COLOR_BALA_ALERTA_HEX);
            } else {
              indicatorMaterials[i].color.setHex(COLOR_MAGENTA_HEX);
            }
          } else {
            indicatorMaterials[i].color.setHex(COLOR_BALA_VACIA_HEX);
          }
        }
      }
    };
  }

  global.buildPlasmaMesh = buildPlasmaMesh;
})(window);
