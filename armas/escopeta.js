// ========================================================
// MÓDULO DE ARMA: ESCOPETA PESADA CHRONO
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// Estructura modular: colores agrupados al inicio y piezas nombradas (mesh.name)
// ========================================================

(function(global) {
  'use strict';

  function buildShotgunMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;

    // ========================================================
    // PALETA DE COLORES Y MATERIALES (Fácil de modificar o cambiar a Rojo Oscuro + Oro)
    // ========================================================
    const COLOR_BASE_HEX   = isGold ? 0xffd54f : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0xdc2626 : 0x1f2a44))); // Azul Oscuro principal
    const COLOR_DEEP_HEX   = 0x0b1020; // Negro azulado para cargador, zonas profundas y pump
    const COLOR_COPPER_HEX = 0xe8922b; // Cobre / Naranja para recámara y escudo térmico
    const COLOR_GOLD_HEX   = 0xe8c14a; // Dorado fino para bordes y engranaje
    const COLOR_TURQ_HEX   = 0x2fe0d0; // Turquesa emisivo de energía temporal

    const matDarkBlue = applyFortniteShader(createStylizedPBR(COLOR_BASE_HEX, 0x000000, 0, 0.38, 0.20), { edge: 0.75, grad: 0.22, rim: 0.22 });
    const matDeepDark = applyFortniteShader(createStylizedPBR(COLOR_DEEP_HEX, 0x000000, 0, 0.70, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const matCopper   = applyFortniteShader(createStylizedPBR(COLOR_COPPER_HEX, 0x7c2d12, 0.15, 0.30, 0.82), { edge: 0.75, grad: 0.14, rim: 0.22 });
    const matGold     = applyFortniteShader(createStylizedPBR(COLOR_GOLD_HEX, 0x92400e, 0.20, 0.28, 0.85), { edge: 0.80, grad: 0.12, rim: 0.24 });
    const matTurquoise = new THREE.MeshBasicMaterial({ color: COLOR_TURQ_HEX });

    const extrudeSettingsShotgun = { depth: 0.074, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.010, bevelThickness: 0.010 };

    // ========================================================
    // 1. PIEZA: CUERPO (Receptor principal y culata anatómica esculpida)
    // ========================================================
    const cuerpoGroup = new THREE.Group();
    cuerpoGroup.name = 'cuerpo';

    const chasisShape = new THREE.Shape();
    chasisShape.moveTo(-0.02, 0.10);             // Frente superior
    chasisShape.lineTo(0.20, 0.10);              // Hacia la recámara
    chasisShape.lineTo(0.20, 0.02);              // Bajada bajo la recámara
    chasisShape.lineTo(0.40, 0.02);              // Paso bajo la recámara
    chasisShape.lineTo(0.40, 0.08);              // Salida superior del recibidor
    chasisShape.lineTo(0.45, 0.08);              // Lomo de la culata
    chasisShape.lineTo(0.48, 0.05);              // Chaflán suave que desciende (Corte para mejilla)
    chasisShape.lineTo(0.53, 0.04);              // Hueco anatómico para el hombro
    chasisShape.lineTo(0.54, -0.07);             // Caída biselada de la cantonera
    chasisShape.lineTo(0.47, -0.07);             // Base de la cantonera
    chasisShape.lineTo(0.43, -0.02);             // Alivio inferior curvado
    chasisShape.lineTo(0.38, -0.04);             // Unión hacia la empuñadura
    chasisShape.lineTo(0.36, -0.24);             // Base de la empuñadura
    chasisShape.lineTo(0.26, -0.24);             // Frente de la empuñadura
    chasisShape.lineTo(0.30, -0.08);             // Curva interior
    chasisShape.lineTo(0.23, -0.08);             // Guardamonte fondo
    chasisShape.lineTo(0.23, -0.02);             // Guardamonte frente
    chasisShape.lineTo(0.12, -0.02);             // Piso del Shroud frontal
    chasisShape.lineTo(0.08, -0.05);             // Chaflán biselado inferior
    chasisShape.lineTo(-0.02, -0.02);            // Morro inferior
    chasisShape.lineTo(-0.02, 0.10);

    // Ranuras de ventilación alargadas estilo cápsula en el Shroud
    for (let i = 0; i < 3; i++) {
      const hPath = new THREE.Path();
      const hx = 0.03 + (i * 0.052);
      const hy = 0.046;
      hPath.moveTo(hx, hy);
      hPath.lineTo(hx + 0.034, hy);
      hPath.lineTo(hx + 0.034, hy + 0.018);
      hPath.lineTo(hx, hy + 0.018);
      hPath.lineTo(hx, hy);
      chasisShape.holes.push(hPath);
    }

    const chasisGeo = new THREE.ExtrudeGeometry(chasisShape, extrudeSettingsShotgun);
    chasisGeo.translate(0, 0, -0.037);
    const chasisMesh = new THREE.Mesh(chasisGeo, matDarkBlue);
    chasisMesh.name = 'chasisMesh';
    chasisMesh.rotation.y = -Math.PI / 2;
    chasisMesh.position.set(0, 0.02, -0.15);
    cuerpoGroup.add(chasisMesh);

    // Hombreras superiores a 45° a lo largo del chasis para atrapar reflejos
    for (let side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.022, 0.52), matDarkBlue);
      shoulder.name = 'hombreraChasis';
      shoulder.rotation.z = side * 0.78;
      shoulder.position.set(side * 0.040, 0.122, -0.02);
      cuerpoGroup.add(shoulder);
    }

    group.add(cuerpoGroup);

    // ========================================================
    // 2. PIEZA: CANTONERA (Terminación acolchada biselada con estrías)
    // ========================================================
    const cantoneraGroup = new THREE.Group();
    cantoneraGroup.name = 'cantonera';

    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.14, 0.025), matDeepDark);
    buttPad.name = 'buttPadMesh';
    buttPad.position.set(0, 0.005, 0.39);
    for (let r = 0; r < 3; r++) {
      const padRib = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.008, 0.006), matCopper);
      padRib.position.set(0, -0.04 + (r * 0.04), 0.403);
      cantoneraGroup.add(padRib);
    }
    cantoneraGroup.add(buttPad);
    group.add(cantoneraGroup);

    // ========================================================
    // 3. PIEZA: RECÁMARA Y ESCUDO TÉRMICO
    // ========================================================
    const recamaraGroup = new THREE.Group();
    recamaraGroup.name = 'recamara';

    const chamberGeo = new THREE.BoxGeometry(0.070, 0.080, 0.20);
    const chamber = new THREE.Mesh(chamberGeo, matCopper);
    chamber.name = 'chamberBlock';
    chamber.position.set(0, 0.08, -0.05);
    recamaraGroup.add(chamber);

    const heatShieldShape = new THREE.Shape();
    heatShieldShape.moveTo(0.18, 0.115);
    heatShieldShape.lineTo(0.38, 0.115);
    heatShieldShape.lineTo(0.35, 0.04);
    heatShieldShape.lineTo(0.20, 0.04);
    heatShieldShape.lineTo(0.18, 0.115);

    const heatShieldGeo = new THREE.ExtrudeGeometry(heatShieldShape, { depth: 0.078, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    heatShieldGeo.translate(0, 0, -0.039);
    const heatShieldMesh = new THREE.Mesh(heatShieldGeo, matCopper);
    heatShieldMesh.name = 'heatShieldMesh';
    heatShieldMesh.rotation.y = -Math.PI / 2;
    heatShieldMesh.position.set(0, 0.02, -0.15);
    recamaraGroup.add(heatShieldMesh);

    const orangeRecessPanel = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.062, 0.15), matDeepDark);
    orangeRecessPanel.position.set(-0.041, 0.085, 0.13);
    const goldTrimTop = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.005, 0.16), matGold);
    goldTrimTop.position.set(-0.042, 0.118, 0.13);
    const goldTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.005, 0.16), matGold);
    goldTrimBottom.position.set(-0.042, 0.052, 0.13);
    recamaraGroup.add(orangeRecessPanel, goldTrimTop, goldTrimBottom);

    for (let side of [-1, 1]) {
      for (let s of [0.05, 0.21]) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6), matDeepDark);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(side * 0.042, 0.115, s);
        recamaraGroup.add(bolt);
      }
    }

    group.add(recamaraGroup);

    // ========================================================
    // 4. PIEZA: RELOJ (Símbolo Chrono / Engranaje con dial de luz)
    // ========================================================
    const relojGroup = new THREE.Group();
    relojGroup.name = 'reloj';

    const gearShotgunRadius = 0.026;
    const chronoShotgunGear = new THREE.Mesh(new THREE.CylinderGeometry(gearShotgunRadius, gearShotgunRadius, 0.008, 16), matGold);
    chronoShotgunGear.name = 'chronoShotgunGear';
    chronoShotgunGear.rotation.z = Math.PI / 2;
    chronoShotgunGear.position.set(-0.044, 0.085, 0.13);

    for (let g = 0; g < 8; g++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.062), matGold);
      tooth.rotation.x = (g * Math.PI) / 4;
      tooth.position.set(-0.044, 0.085, 0.13);
      relojGroup.add(tooth);
    }

    const gearOuterRim = new THREE.Mesh(new THREE.TorusGeometry(gearShotgunRadius + 0.003, 0.0025, 8, 20), matCopper);
    gearOuterRim.rotation.y = Math.PI / 2;
    gearOuterRim.position.set(-0.044, 0.085, 0.13);

    const gearCenterNeon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 14), matTurquoise);
    gearCenterNeon.rotation.z = Math.PI / 2;
    gearCenterNeon.position.set(-0.0445, 0.085, 0.13);

    const clockHand1 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.011, 0.003), matDeepDark);
    clockHand1.position.set(-0.045, 0.090, 0.13);
    const clockHand2 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.003, 0.013), matDeepDark);
    clockHand2.position.set(-0.045, 0.085, 0.135);
    relojGroup.add(chronoShotgunGear, gearOuterRim, gearCenterNeon, clockHand1, clockHand2);

    group.add(relojGroup);

    // ========================================================
    // 5. PIEZA: CÁPSULA PLASMA (Gran cápsula de plasma temporal en el Shroud)
    // ========================================================
    const capsulaPlasmaGroup = new THREE.Group();
    capsulaPlasmaGroup.name = 'capsulaPlasma';

    const plasmaCoreBig = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 14), matTurquoise);
    plasmaCoreBig.name = 'plasmaCoreBig';
    plasmaCoreBig.rotation.x = Math.PI / 2;
    plasmaCoreBig.position.set(0, 0.066, -0.08);

    const ventWindowGlow = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.018, 0.16), matTurquoise);
    ventWindowGlow.name = 'ventWindowGlow';
    ventWindowGlow.position.set(-0.038, 0.066, -0.08);

    capsulaPlasmaGroup.add(plasmaCoreBig, ventWindowGlow);
    group.add(capsulaPlasmaGroup);

    // ========================================================
    // 6. PIEZA: CAÑO (Cañón doble y anillo frontal)
    // ========================================================
    const canoGroup = new THREE.Group();
    canoGroup.name = 'cano';

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.26, 16), matDeepDark);
    barrel.name = 'barrelUpper';
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.08, -0.27);

    const underBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.36, 16), matDeepDark);
    underBarrel.name = 'barrelUnder';
    underBarrel.rotation.x = Math.PI / 2;
    underBarrel.position.set(0, 0.02, -0.30);

    const barrelClamp = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.095, 0.024), matCopper);
    barrelClamp.name = 'barrelClamp';
    barrelClamp.position.set(0, 0.05, -0.34);

    const muzzleChronoRing = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.010, 16), matTurquoise);
    muzzleChronoRing.name = 'muzzleChronoRing';
    muzzleChronoRing.rotation.x = Math.PI / 2;
    muzzleChronoRing.position.set(0, 0.08, -0.395);

    canoGroup.add(barrel, underBarrel, barrelClamp, muzzleChronoRing);
    group.add(canoGroup);

    // ========================================================
    // 7. PIEZA: PUMP (Corredera inferior gruesa con hendiduras)
    // ========================================================
    const pumpGroup = new THREE.Group();
    pumpGroup.name = 'pump';

    const pumpShape = new THREE.Shape();
    pumpShape.moveTo(0, 0.02);
    pumpShape.lineTo(0.24, 0.02);
    pumpShape.lineTo(0.24, -0.06);
    pumpShape.lineTo(0.20, -0.12);
    pumpShape.lineTo(0.06, -0.12);
    pumpShape.lineTo(0, -0.05);
    pumpShape.lineTo(0, 0.02);

    const pumpGeo = new THREE.ExtrudeGeometry(pumpShape, { depth: 0.092, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.008, bevelThickness: 0.008 });
    pumpGeo.translate(0, 0, -0.046);
    const pumpMesh = new THREE.Mesh(pumpGeo, matDeepDark);
    pumpMesh.name = 'pumpMesh';
    pumpMesh.rotation.y = -Math.PI / 2;
    pumpMesh.position.set(0, 0.0, -0.25);

    for (let p = 0; p < 4; p++) {
      const pumpGroove = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.038, 0.018), matDarkBlue);
      pumpGroove.position.set(0, -0.08, -0.18 - (p * 0.04));
      pumpGroup.add(pumpGroove);
    }
    pumpGroup.add(pumpMesh);
    group.add(pumpGroup);

    // ========================================================
    // 8. PIEZA: MIRA Y RIEL SUPERIOR
    // ========================================================
    const miraGroup = new THREE.Group();
    miraGroup.name = 'mira';

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.016, 0.36), matDeepDark);
    topRail.position.set(0, 0.13, -0.02);
    miraGroup.add(topRail);

    for (let r = 0; r < 8; r++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.005, 0.009), matCopper);
      groove.position.set(0, 0.138, -0.16 + (r * 0.042));
      miraGroup.add(groove);
    }

    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.032, 0.04), matDeepDark);
    rearSight.position.set(0, 0.145, 0.13);
    const sightDot = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.006), matTurquoise);
    sightDot.position.set(0, 0.155, 0.11);
    miraGroup.add(rearSight, sightDot);

    group.add(miraGroup);

    // ========================================================
    // 9. PIEZA: GATILLO
    // ========================================================
    const gatilloGroup = new THREE.Group();
    gatilloGroup.name = 'gatillo';

    const trigger = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.028, 8), matCopper);
    trigger.name = 'triggerMesh';
    trigger.rotation.x = 0.4;
    trigger.position.set(0, -0.02, 0.08);
    gatilloGroup.add(trigger);

    group.add(gatilloGroup);
  }

  global.buildShotgunMesh = buildShotgunMesh;
})(window);
