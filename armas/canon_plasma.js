// ========================================================
// MÓDULO DE ARMA: CAÑÓN DE PLASMA CHRONO
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// Estructura modular: colores agrupados al inicio y piezas nombradas (mesh.name)
// Conserva el indicador diegético de 5 segmentos y toda su lógica de animación
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
    // 1. Gris Claro / Platino: Carcasa exterior aerodinámica (zona clara)
    const COLOR_GRIS_CLARO_HEX = isGold ? 0xfff3b0 : (isVortex ? 0xe9d5ff : (isMatrix ? 0xd1fae5 : (isInferno ? 0xfecaca : 0xcbd5e1)));
    // 2. Negro Carbón: Chasis interno, culata, empuñadura y cavidades (zona oscura)
    const COLOR_NEGRO_HEX      = isGold ? 0x221a08 : (isVortex ? 0x180f28 : (isMatrix ? 0x052018 : (isInferno ? 0x240808 : 0x111622)));
    // 3. Grafito / Plata Medio: Disipadores, biseles y herrajes (zona media)
    const COLOR_GRAFITO_HEX    = isGold ? 0x6b5314 : (isVortex ? 0x3b1d5c : (isMatrix ? 0x064e3b : (isInferno ? 0x5a1a1a : 0x475569)));
    // 4. Dorado Puro: Anillo de reloj giratorio, marcas, biseles y detalles
    const COLOR_ORO_HEX        = isGold ? 0xffd54f : (isVortex ? 0xc084fc : (isMatrix ? 0x34d399 : (isInferno ? 0xf87171 : 0xe8c14a)));
    // 5. Magenta Brillante: Plasma, núcleo y balas indicadoras de munición
    const COLOR_MAGENTA_HEX    = isGold ? 0xffea00 : (isVortex ? 0xd946ef : (isMatrix ? 0x10b981 : (isInferno ? 0xff3b30 : 0xff0a85)));

    const matGrisClaro  = applyFortniteShader(createStylizedPBR(COLOR_GRIS_CLARO_HEX, 0x000000, 0, 0.35, 0.20), { edge: 0.85, grad: 0.22, rim: 0.26 });
    const matNegro      = applyFortniteShader(createStylizedPBR(COLOR_NEGRO_HEX, 0x000000, 0, 0.65, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const matGrafito    = applyFortniteShader(createStylizedPBR(COLOR_GRAFITO_HEX, 0x000000, 0, 0.45, 0.25), { edge: 0.70, grad: 0.18, rim: 0.18 });
    const matOro        = applyFortniteShader(createStylizedPBR(COLOR_ORO_HEX, 0x92400e, 0.20, 0.28, 0.88), { edge: 0.85, grad: 0.14, rim: 0.26 });
    const matPlasmaGlow = new THREE.MeshBasicMaterial({ color: COLOR_MAGENTA_HEX });
    const matPlasmaCore = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const extrudeBevelPlasma = { depth: 0.13, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012 };

    // ========================================================
    // 1. PIEZA: CUERPO (Chasis aerodinámico con cámara abierta, culata y relieves)
    // ========================================================
    const cuerpo = new THREE.Group();
    cuerpo.name = 'cuerpo';

    // Chasis exterior en Gris Claro con curvas suaves y cámara central calada
    const cuerpoShape = new THREE.Shape();
    cuerpoShape.moveTo(-0.20, 0.095);
    cuerpoShape.quadraticCurveTo(0.00, 0.110, 0.14, 0.085);
    cuerpoShape.quadraticCurveTo(0.24, 0.060, 0.25, -0.010);
    cuerpoShape.quadraticCurveTo(0.24, -0.090, 0.16, -0.110);
    cuerpoShape.quadraticCurveTo(0.08, -0.100, 0.03, -0.035);
    cuerpoShape.lineTo(-0.10, -0.035);
    cuerpoShape.quadraticCurveTo(-0.16, -0.040, -0.20, 0.010);
    cuerpoShape.lineTo(-0.20, 0.095);

    // Cámara de energía central abierta
    const chamberOpening = new THREE.Path();
    chamberOpening.moveTo(-0.14, 0.075);
    chamberOpening.quadraticCurveTo(-0.04, 0.085, 0.04, 0.070);
    chamberOpening.quadraticCurveTo(0.05, 0.010, 0.03, -0.015);
    chamberOpening.quadraticCurveTo(-0.05, -0.020, -0.14, -0.010);
    chamberOpening.quadraticCurveTo(-0.15, 0.030, -0.14, 0.075);
    cuerpoShape.holes.push(chamberOpening);

    const cuerpoGeo = new THREE.ExtrudeGeometry(cuerpoShape, extrudeBevelPlasma);
    cuerpoGeo.translate(0, 0, -0.065);
    const cuerpoMesh = new THREE.Mesh(cuerpoGeo, matGrisClaro);
    cuerpoMesh.name = 'cuerpoMesh';
    cuerpoMesh.rotation.y = -Math.PI / 2;
    cuerpoMesh.position.set(0, 0, 0.02);
    cuerpo.add(cuerpoMesh);

    // Estructura interna de contención
    const chamberCradle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.22), matGrafito);
    chamberCradle.name = 'chamberCradle';
    chamberCradle.position.set(0, -0.012, -0.06);
    cuerpo.add(chamberCradle);

    for (let s of [-1, 1]) {
      const topStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8), matOro);
      topStrut.rotation.x = Math.PI / 2;
      topStrut.position.set(s * 0.055, 0.085, -0.06);
      cuerpo.add(topStrut);
    }

    const frontReceiver = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.08, 16), matNegro);
    frontReceiver.rotation.x = Math.PI / 2;
    frontReceiver.position.set(0, 0.035, -0.18);
    const frontReceiverTrim = new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.004, 8, 20), matOro);
    frontReceiverTrim.position.set(0, 0.035, -0.18);
    cuerpo.add(frontReceiver, frontReceiverTrim);

    // Bloque trasero biselado en Negro Carbón
    const rearReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.095, 0.11), matNegro);
    rearReceiver.name = 'rearReceiver';
    rearReceiver.position.set(0, 0.035, 0.17);
    cuerpo.add(rearReceiver);

    const rearEndPlate = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.088, 0.016), matGrafito);
    rearEndPlate.position.set(0, 0.035, 0.225);
    const rearBezelGold = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.006, 0.018), matOro);
    rearBezelGold.position.set(0, 0.080, 0.225);
    cuerpo.add(rearEndPlate, rearBezelGold);

    // Indicador cronográfico posterior
    const rearClockRim = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.003, 8, 20), matOro);
    rearClockRim.position.set(0, 0.040, 0.235);
    const rearClockFace = new THREE.Mesh(new THREE.CircleGeometry(0.024, 16), matNegro);
    rearClockFace.position.set(0, 0.040, 0.2355);
    const rearClockCore = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), matPlasmaGlow);
    rearClockCore.position.set(0, 0.040, 0.236);
    const rearClockHand = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.014, 0.002), matOro);
    rearClockHand.position.set(0, 0.046, 0.2365);
    cuerpo.add(rearClockRim, rearClockFace, rearClockCore, rearClockHand);

    for (let v = 0; v < 3; v++) {
      const rearVent = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.004, 0.012), matGrafito);
      rearVent.position.set(0, 0.086, 0.14 + v * 0.025);
      cuerpo.add(rearVent);
    }

    for (let side of [-1, 1]) {
      const hombrera = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.36, 12), matGrafito);
      hombrera.rotation.x = Math.PI / 2;
      hombrera.position.set(side * 0.068, 0.090, 0.03);
      cuerpo.add(hombrera);
    }

    // Engranaje Chrono en ambos flancos
    for (let side of [-1, 1]) {
      const gearHub = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 16), matOro);
      gearHub.rotation.z = Math.PI / 2;
      gearHub.position.set(side * 0.074, 0.045, 0.11);

      for (let g = 0; g < 4; g++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.006, 0.080), matOro);
        tooth.rotation.x = (g * Math.PI) / 4;
        tooth.position.set(side * 0.074, 0.045, 0.11);
        cuerpo.add(tooth);
      }

      const gearRim = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0035, 8, 20), matOro);
      gearRim.rotation.y = Math.PI / 2;
      gearRim.position.set(side * 0.074, 0.045, 0.11);

      const dialCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.009, 14), matNegro);
      dialCenter.rotation.z = Math.PI / 2;
      dialCenter.position.set(side * 0.0745, 0.045, 0.11);

      const handH = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.020, 0.003), matOro);
      handH.rotation.x = 0.6;
      handH.position.set(side * 0.075, 0.045, 0.11);

      cuerpo.add(gearHub, gearRim, dialCenter, handH);
    }

    // Culata trasera
    const buttPad = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.024, 16), matNegro);
    buttPad.rotation.x = Math.PI / 2;
    buttPad.position.set(0, -0.015, 0.27);
    const buttPadTrim = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.004, 8, 20), matOro);
    buttPadTrim.position.set(0, -0.015, 0.27);
    cuerpo.add(buttPad, buttPadTrim);

    // Empuñadura ergonómica
    const gripShape = new THREE.Shape();
    gripShape.moveTo(0.05, -0.035);
    gripShape.lineTo(0.13, -0.035);
    gripShape.lineTo(0.10, -0.22);
    gripShape.lineTo(0.02, -0.22);
    gripShape.lineTo(0.05, -0.035);
    const gripGeo = new THREE.ExtrudeGeometry(gripShape, { depth: 0.058, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 });
    gripGeo.translate(0, 0, -0.029);
    const gripMesh = new THREE.Mesh(gripGeo, matNegro);
    gripMesh.name = 'gripMesh';
    gripMesh.rotation.y = -Math.PI / 2;
    gripMesh.position.set(0, 0, 0.02);
    cuerpo.add(gripMesh);

    for (let side of [-1, 1]) {
      for (let r = 0; r < 4; r++) {
        const gripRib = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.007, 0.046), matGrafito);
        gripRib.rotation.x = -0.22;
        gripRib.position.set(side * 0.031, -0.065 - r * 0.032, 0.075 + r * 0.008);
        cuerpo.add(gripRib);
      }
    }

    group.add(cuerpo);

    // ========================================================
    // 2. PIEZA: CAÑO (Tobera tipo embudo con corona y electrodos)
    // ========================================================
    const cano = new THREE.Group();
    cano.name = 'cano';

    const emitterHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.048, 0.16, 20), matGrisClaro);
    emitterHorn.name = 'emitterHorn';
    emitterHorn.rotation.x = -Math.PI / 2;
    emitterHorn.position.set(0, 0.035, -0.29);
    cano.add(emitterHorn);

    const muzzleMouthRing = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.006, 10, 24), matOro);
    muzzleMouthRing.position.set(0, 0.035, -0.37);
    cano.add(muzzleMouthRing);

    const muzzleInterior = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 16), matNegro);
    muzzleInterior.rotation.x = Math.PI / 2;
    muzzleInterior.position.set(0, 0.035, -0.365);
    const plasmaMuzzleDisc = new THREE.Mesh(new THREE.CircleGeometry(0.046, 16), matPlasmaGlow);
    plasmaMuzzleDisc.rotation.y = Math.PI;
    plasmaMuzzleDisc.position.set(0, 0.035, -0.372);
    cano.add(muzzleInterior, plasmaMuzzleDisc);

    for (let p = 0; p < 4; p++) {
      const angle = (p * Math.PI) / 2;
      const prongMount = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.022, 0.11), matOro);
      prongMount.position.set(
        Math.cos(angle) * 0.068,
        0.035 + Math.sin(angle) * 0.068,
        -0.33
      );
      prongMount.rotation.z = angle;

      const prongNode = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.020, 8), matPlasmaGlow);
      prongNode.rotation.x = Math.PI / 2;
      prongNode.position.set(
        Math.cos(angle) * 0.068,
        0.035 + Math.sin(angle) * 0.068,
        -0.39
      );
      cano.add(prongMount, prongNode);
    }

    group.add(cano);

    // ========================================================
    // 3. PIEZA: NÚCLEO (Cámara de energía visible y orbe de plasma magenta)
    // ========================================================
    const nucleo = new THREE.Group();
    nucleo.name = 'nucleo';

    const coreZ = -0.06;
    const coreY = 0.035;

    const nucleoOrb = new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 20), matPlasmaCore);
    nucleoOrb.name = 'nucleoOrb';
    nucleoOrb.position.set(0, coreY, coreZ);
    nucleo.add(nucleoOrb);

    const nucleoHalo = new THREE.Mesh(new THREE.SphereGeometry(0.058, 18, 18), new THREE.MeshBasicMaterial({
      color: COLOR_MAGENTA_HEX,
      transparent: true,
      opacity: 0.75
    }));
    nucleoHalo.name = 'nucleoHalo';
    nucleoHalo.position.set(0, coreY, coreZ);
    nucleo.add(nucleoHalo);

    for (let e of [-1, 1]) {
      const electrode = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.016, 0.035, 12), matOro);
      electrode.rotation.z = e * Math.PI / 2;
      electrode.position.set(e * 0.055, coreY, coreZ);
      nucleo.add(electrode);
    }

    group.add(nucleo);

    // ========================================================
    // 4. PIEZA: ANILLO RELOJ (Anillo de reloj que gira alrededor del núcleo)
    // ========================================================
    const anilloReloj = new THREE.Group();
    anilloReloj.name = 'anilloReloj';
    anilloReloj.position.set(0, coreY, coreZ);

    const clockTorus = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.0055, 8, 28), matOro);
    clockTorus.name = 'clockTorus';
    anilloReloj.add(clockTorus);

    for (let t = 0; t < 12; t++) {
      const tAngle = (t * Math.PI) / 6;
      const tickBox = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.009, 0.007), matOro);
      tickBox.position.set(Math.cos(tAngle) * 0.070, Math.sin(tAngle) * 0.070, 0);
      tickBox.rotation.z = tAngle;
      anilloReloj.add(tickBox);
    }

    group.add(anilloReloj);

    // ========================================================
    // 5. PIEZA: BOBINAS (Bobinas magnéticas toroidales con soportes)
    // ========================================================
    const bobinas = new THREE.Group();
    bobinas.name = 'bobinas';

    const coilZPositions = [-0.22, -0.13, 0.02];
    for (let i = 0; i < coilZPositions.length; i++) {
      const cz = coilZPositions[i];
      const coilTorus = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 10, 24), matOro);
      coilTorus.position.set(0, 0.035, cz);
      bobinas.add(coilTorus);

      const isolatorRing = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.005, 8, 20), matGrafito);
      isolatorRing.position.set(0, 0.035, cz);
      bobinas.add(isolatorRing);

      for (let s of [-1, 1]) {
        const mountBracket = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.024, 0.022), matGrisClaro);
        mountBracket.position.set(s * 0.065, 0.035, cz);
        bobinas.add(mountBracket);
      }
    }

    group.add(bobinas);

    // ========================================================
    // 6. PIEZA: ALETAS (Aletas de disipación térmica)
    // ========================================================
    const aletas = new THREE.Group();
    aletas.name = 'aletas';

    for (let f = 0; f < 3; f++) {
      const fz = -0.06 + f * 0.06;
      for (let side of [-1, 1]) {
        const finPlate = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.075, 0.040), matGrafito);
        finPlate.rotation.z = side * 0.35;
        finPlate.rotation.y = side * 0.15;
        finPlate.position.set(side * 0.082, 0.035, fz);

        const finEdgeGold = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.078, 0.006), matOro);
        finEdgeGold.rotation.z = side * 0.35;
        finEdgeGold.rotation.y = side * 0.15;
        finEdgeGold.position.set(side * 0.083, 0.035, fz + 0.018);

        aletas.add(finPlate, finEdgeGold);
      }
    }

    group.add(aletas);

    // ========================================================
    // 7. PIEZA: CELDA (Celda de energía cilíndrica como cargador)
    // ========================================================
    const celda = new THREE.Group();
    celda.name = 'celda';

    const cellAngle = -0.32;
    celda.position.set(0, -0.095, 0.01);
    celda.rotation.x = cellAngle;

    const cellCapTop = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.018, 16), matOro);
    cellCapTop.position.set(0, 0.065, 0);
    const cellCapBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.022, 16), matOro);
    cellCapBottom.position.set(0, -0.065, 0);
    celda.add(cellCapTop, cellCapBottom);

    const cellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.12, 16), matNegro);
    celda.add(cellBody);

    const cellCore = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.10, 14), matPlasmaGlow);
    celda.add(cellCore);

    for (let cr of [-0.03, 0.03]) {
      const cellRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.003, 8, 16), matOro);
      cellRing.rotation.x = Math.PI / 2;
      cellRing.position.set(0, cr, 0);
      celda.add(cellRing);
    }

    const cellMount = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.028, 0.040), matGrafito);
    cellMount.position.set(0, 0.075, 0);
    celda.add(cellMount);

    group.add(celda);

    // ========================================================
    // 8. PIEZA: GATILLO (Guardamonte redondeado y gatillo en Oro)
    // ========================================================
    const gatillo = new THREE.Group();
    gatillo.name = 'gatillo';

    const guardShape = new THREE.Shape();
    guardShape.moveTo(-0.02, -0.035);
    guardShape.quadraticCurveTo(-0.02, -0.095, 0.03, -0.095);
    guardShape.lineTo(0.06, -0.095);
    guardShape.lineTo(0.06, -0.035);
    guardShape.lineTo(0.05, -0.035);
    guardShape.lineTo(0.05, -0.085);
    guardShape.quadraticCurveTo(0.02, -0.085, -0.01, -0.085);
    guardShape.lineTo(-0.01, -0.035);
    guardShape.lineTo(-0.02, -0.035);
    const guardGeo = new THREE.ExtrudeGeometry(guardShape, { depth: 0.032, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.005, bevelThickness: 0.005 });
    guardGeo.translate(0, 0, -0.016);
    const guardMesh = new THREE.Mesh(guardGeo, matGrafito);
    guardMesh.name = 'guardMesh';
    guardMesh.rotation.y = -Math.PI / 2;
    guardMesh.position.set(0, 0, 0.02);
    gatillo.add(guardMesh);

    const triggerBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.026, 8), matOro);
    triggerBlade.rotation.x = 0.38;
    triggerBlade.position.set(0, -0.058, 0.038);
    const triggerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.022, 8), matOro);
    triggerPin.rotation.z = Math.PI / 2;
    triggerPin.position.set(0, -0.046, 0.038);
    gatillo.add(triggerBlade, triggerPin);

    group.add(gatillo);

    // ========================================================
    // 9. PIEZA: MIRA (Colimador holográfico cronográfico compacto)
    // ========================================================
    const mira = new THREE.Group();
    mira.name = 'mira';

    const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.018, 0.08), matGrafito);
    sightBase.position.set(0, 0.125, -0.02);
    mira.add(sightBase);

    const sightHood = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 8, 16), matOro);
    sightHood.position.set(0, 0.155, -0.02);
    mira.add(sightHood);

    const holoGlass = new THREE.Mesh(new THREE.CircleGeometry(0.022, 16), new THREE.MeshBasicMaterial({
      color: COLOR_MAGENTA_HEX,
      transparent: true,
      opacity: 0.35
    }));
    holoGlass.position.set(0, 0.155, -0.02);
    const holoDot = new THREE.Mesh(new THREE.CircleGeometry(0.004, 10), matPlasmaGlow);
    holoDot.position.set(0, 0.155, -0.019);
    mira.add(holoGlass, holoDot);

    group.add(mira);

    // ========================================================
    // 10. PIEZA: INDICADOR CONSOLA (5 segmentos: balaIndicador_1 a 5)
    // ========================================================
    const indicatorConsole = new THREE.Group();
    indicatorConsole.name = 'indicadorConsola';
    indicatorConsole.position.set(-0.065, 0.098, 0.10);
    indicatorConsole.rotation.z = -0.55;

    const consolePlate = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.006, 0.16), matGrafito);
    const consoleBezel = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.008, 0.006), matOro);
    consoleBezel.position.set(0, 0.001, 0.08);
    indicatorConsole.add(consolePlate, consoleBezel);

    const indicatorMaterials = [];
    const indicatorMeshes = [];

    for (let s = 1; s <= 5; s++) {
      const indMat = new THREE.MeshBasicMaterial({ color: COLOR_MAGENTA_HEX });
      indicatorMaterials.push(indMat);

      const segGroup = new THREE.Group();
      segGroup.name = 'balaIndicador_' + s;

      const segBezel = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.008, 0.022), matOro);
      const sz = 0.055 - (s - 1) * 0.028;
      segBezel.position.set(0, 0.004, sz);

      const segMesh = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.010, 0.016), indMat);
      segMesh.position.set(0, 0.006, sz);
      segMesh.name = 'balaIndicador_' + s + '_mesh';

      segGroup.add(segBezel, segMesh);
      indicatorConsole.add(segGroup);
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
        indicatorMaterials[i].color.setHex(i < ammoCount ? COLOR_MAGENTA_HEX : 0x181e28);
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
          indicatorMaterials[i].color.setHex(i < activeCount ? COLOR_MAGENTA_HEX : 0x181e28);
        }
      } else {
        // Estado normal de combate
        const now = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
          if (group.userData.flickerTimers[i] > 0) {
            group.userData.flickerTimers[i] -= dt;
            const flash = Math.sin(group.userData.flickerTimers[i] * 55) > 0;
            indicatorMaterials[i].color.setHex(flash ? 0xffffff : COLOR_MAGENTA_HEX);
          } else if (i < currentAmmo) {
            if (currentAmmo === 1 && i === 0) {
              const warnBlink = (Math.sin(now * 12) > 0);
              indicatorMaterials[i].color.setHex(warnBlink ? COLOR_MAGENTA_HEX : 0x4a0a28);
            } else {
              indicatorMaterials[i].color.setHex(COLOR_MAGENTA_HEX);
            }
          } else {
            indicatorMaterials[i].color.setHex(0x181e28);
          }
        }
      }
    };
  }

  global.buildPlasmaMesh = buildPlasmaMesh;
})(window);
