// ========================================================
// MÓDULO DE ARMA: SUBFUSIL VECTOR CHRONO-TACTICAL
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// ========================================================

(function(global) {
  'use strict';

  function buildSmgMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;
    const skinNeonMat = ctx.skinNeonMat;
    const getSmgGradientTexture = ctx.getSmgGradientTexture;

    const smgGradTex = getSmgGradientTexture ? getSmgGradientTexture() : null;

    // Paleta PBR estilizada de alto contraste: Cobalto titanio enriquecido + Cobre/Naranja mecánico
    const smgBodyHex = isGold ? 0xffd54f : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0xdc2626 : 0x2a4c78)));
    const smgBodyMat = applyFortniteShader(new THREE.MeshStandardMaterial({
      color: smgBodyHex,
      map: smgGradTex,
      roughness: 0.32,
      metalness: 0.24
    }), { edge: 0.78, grad: 0.28, rim: 0.25 });

    const smgDarkMat = applyFortniteShader(createStylizedPBR(0x191c22, 0x000000, 0, 0.70, 0.12), { edge: 0.50, grad: 0.15, rim: 0.10 });
    const smgSteelMat = applyFortniteShader(createStylizedPBR(0x7c8799, 0x000000, 0, 0.22, 0.76), { edge: 0.70, grad: 0.10, rim: 0.18 });
    const smgCopperMat = applyFortniteShader(createStylizedPBR(0xc25e1a, 0x7c2d12, 0.15, 0.30, 0.82), { edge: 0.75, grad: 0.14, rim: 0.22 });
    const chronoGoldMat = applyFortniteShader(createStylizedPBR(0xd97706, 0x92400e, 0.2, 0.28, 0.85), { edge: 0.80, grad: 0.12, rim: 0.24 });

    // Bisel amplio con extrusión redondeada para atrapar especulares marcados
    const smgExtrude = { depth: 0.070, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012 };

    // 1. RECEPTOR PRINCIPAL AERODINÁMICO CON MORRO Y TRASERA BISELADAS
    const smgShape = new THREE.Shape();
    smgShape.moveTo(-0.12, 0.095);     // Frente superior guardamanos
    smgShape.lineTo(0.18, 0.095);      // Riel superior continuo
    smgShape.lineTo(0.22, 0.055);      // Chaflán biselado trasero superior (45°)
    smgShape.lineTo(0.22, 0.020);      // Borde trasero
    smgShape.lineTo(0.14, 0.010);      // Unión inferior trasera
    smgShape.lineTo(0.04, -0.025);     // Caída angular al pozo del cargador
    smgShape.lineTo(-0.06, -0.025);    // Frente del pozo
    smgShape.lineTo(-0.12, 0.018);     // Guardamanos inferior
    smgShape.lineTo(-0.155, 0.036);    // Curva aerodinámica frontal inferior
    smgShape.lineTo(-0.175, 0.056);    // Vértice redondeado de salida del cañón
    smgShape.lineTo(-0.155, 0.080);    // Chaflán de unión superior
    smgShape.lineTo(-0.12, 0.095);

    // Ranuras de ventilación alargadas estilo cápsula en el guardamanos
    for (let v = 0; v < 2; v++) {
      const vHole = new THREE.Path();
      const vx = -0.11 + (v * 0.050);
      const vy = 0.045;
      vHole.moveTo(vx, vy);
      vHole.lineTo(vx + 0.032, vy);
      vHole.lineTo(vx + 0.032, vy + 0.022);
      vHole.lineTo(vx, vy + 0.022);
      vHole.lineTo(vx, vy);
      smgShape.holes.push(vHole);
    }

    const smgGeo = new THREE.ExtrudeGeometry(smgShape, smgExtrude);
    smgGeo.translate(0, 0, -0.035);
    const smgMesh = new THREE.Mesh(smgGeo, smgBodyMat);
    smgMesh.rotation.y = -Math.PI / 2;
    smgMesh.position.set(0, 0, 0);
    group.add(smgMesh);

    // 1.1 MORRO FRONTAL BISELADO Y REDONDEADO (Elimina la caja de aristas duras)
    const frontNoseCone = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.034, 0.040, 16), smgDarkMat);
    frontNoseCone.rotation.x = Math.PI / 2;
    frontNoseCone.position.set(0, 0.056, -0.175);
    const frontNoseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.015, 16), smgCopperMat);
    frontNoseRing.rotation.x = Math.PI / 2;
    frontNoseRing.position.set(0, 0.056, -0.192);
    group.add(frontNoseCone, frontNoseRing);

    // 1.2 HOMBRERAS / CHAFLANES SUPERIORES A 45°
    for (let side of [-1, 1]) {
      const smgShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.024, 0.34), smgBodyMat);
      smgShoulder.rotation.z = side * 0.78;
      smgShoulder.position.set(side * 0.038, 0.095, 0.01);
      group.add(smgShoulder);
    }

    // 1.3 TAPA TRASERA BISELADA (RECEIVER END-CAP CON AMORTIGUADOR)
    const endCap = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.075, 0.022), smgDarkMat);
    endCap.position.set(0, 0.048, 0.22);
    const endCapPlate = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.065, 0.010), smgCopperMat);
    endCapPlate.position.set(0, 0.048, 0.232);
    group.add(endCap, endCapPlate);

    // 1.4 PANELES LATERALES MECÁNICOS
    const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.068, 0.17), smgCopperMat);
    sideFrame.position.set(-0.040, 0.050, 0.04);
    const sideInnerMat = applyFortniteShader(createStylizedPBR(0x222834, 0x000000, 0, 0.65, 0.15), { edge: 0.60, grad: 0.15, rim: 0.12 });
    const sideInnerPanel = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.054, 0.15), sideInnerMat);
    sideInnerPanel.position.set(-0.041, 0.050, 0.04);
    group.add(sideFrame, sideInnerPanel);

    // Tornillos Torx en las esquinas del marco de cobre
    for (let b of [-0.065, 0.065]) {
      for (let by of [0.030, 0.070]) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 6), smgSteelMat);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(-0.043, by, 0.04 + b);
        group.add(bolt);
      }
    }

    // 1.5 GRAN EMBLEMA CRONOGRÁFICO "CHRONO CLOCKWORK" (FIRMA CHRONO DEL ARMA)
    const chronoGearRadius = 0.026;
    const smgGearMain = new THREE.Mesh(new THREE.CylinderGeometry(chronoGearRadius, chronoGearRadius, 0.008, 16), chronoGoldMat);
    smgGearMain.rotation.z = Math.PI / 2;
    smgGearMain.position.set(-0.044, 0.052, 0.04);

    for (let g = 0; g < 8; g++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.007, 0.062), chronoGoldMat);
      tooth.rotation.x = (g * Math.PI) / 4;
      tooth.position.set(-0.044, 0.052, 0.04);
      group.add(tooth);
    }

    const chronoOuterRim = new THREE.Mesh(new THREE.TorusGeometry(chronoGearRadius + 0.003, 0.003, 8, 20), smgCopperMat);
    chronoOuterRim.rotation.y = Math.PI / 2;
    chronoOuterRim.position.set(-0.044, 0.052, 0.04);

    const chronoCoreGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.009, 14), skinNeonMat);
    chronoCoreGlow.rotation.z = Math.PI / 2;
    chronoCoreGlow.position.set(-0.0445, 0.052, 0.04);

    const clockCenterPin = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.011, 8), smgSteelMat);
    clockCenterPin.rotation.z = Math.PI / 2;
    clockCenterPin.position.set(-0.045, 0.052, 0.04);
    const clockHandHour = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.012, 0.003), smgSteelMat);
    clockHandHour.position.set(-0.045, 0.057, 0.04);
    const clockHandMin = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.003, 0.015), smgSteelMat);
    clockHandMin.position.set(-0.045, 0.052, 0.046);
    group.add(smgGearMain, chronoOuterRim, chronoCoreGlow, clockCenterPin, clockHandHour, clockHandMin);

    const sidePlateR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.052, 0.15), smgCopperMat);
    sidePlateR.position.set(0.040, 0.050, 0.04);
    group.add(sidePlateR);

    // 2. EMPUÑADURA ERGONÓMICA DE PISTOLA + GUARDAMONTE
    const smgGripShape = new THREE.Shape();
    smgGripShape.moveTo(0.04, -0.02);
    smgGripShape.lineTo(0.14, -0.02);
    smgGripShape.lineTo(0.11, -0.21);
    smgGripShape.lineTo(0.03, -0.21);
    smgGripShape.lineTo(0.05, -0.08);
    smgGripShape.lineTo(-0.01, -0.08);
    smgGripShape.lineTo(-0.01, -0.02);
    smgGripShape.lineTo(0.04, -0.02);

    const smgGripGeo = new THREE.ExtrudeGeometry(smgGripShape, { depth: 0.062, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 });
    smgGripGeo.translate(0, 0, -0.031);
    const smgGripMesh = new THREE.Mesh(smgGripGeo, smgDarkMat);
    smgGripMesh.rotation.y = -Math.PI / 2;
    smgGripMesh.position.set(0, 0, 0);
    group.add(smgGripMesh);

    for (let f = 0; f < 3; f++) {
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.054, 8), smgDarkMat);
      rib.rotation.z = Math.PI / 2;
      rib.position.set(0, -0.10 - (f * 0.032), 0.075);
      group.add(rib);
    }

    const trigger = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.026, 8), smgSteelMat);
    trigger.rotation.x = 0.35;
    trigger.position.set(0, -0.045, -0.02);
    group.add(trigger);

    // 3. CARGADOR EXTENDIDO DE ALTO CONTRASTE
    const smgMagShape = new THREE.Shape();
    smgMagShape.moveTo(0, 0);
    smgMagShape.lineTo(0.048, 0);
    smgMagShape.lineTo(0.032, -0.24);
    smgMagShape.lineTo(-0.022, -0.24);
    smgMagShape.lineTo(0, 0);

    const smgMagGeo = new THREE.ExtrudeGeometry(smgMagShape, { depth: 0.046, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    smgMagGeo.translate(0, 0, -0.023);
    const smgMagMesh = new THREE.Mesh(smgMagGeo, smgDarkMat);
    smgMagMesh.rotation.y = -Math.PI / 2;
    smgMagMesh.position.set(0, -0.02, 0.01);
    group.add(smgMagMesh);

    const magBaseplate = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.024, 0.065), smgCopperMat);
    magBaseplate.position.set(0, -0.26, 0.012);
    magBaseplate.rotation.x = -0.15;
    group.add(magBaseplate);

    const magCopperBand = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.016, 0.058), smgCopperMat);
    magCopperBand.position.set(0, -0.16, 0.012);
    magCopperBand.rotation.x = -0.15;
    group.add(magCopperBand);

    const magNeonStripL = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.16, 0.018), skinNeonMat);
    magNeonStripL.position.set(-0.024, -0.13, 0.012);
    magNeonStripL.rotation.x = -0.15;
    const magNeonStripR = magNeonStripL.clone();
    magNeonStripR.position.x = 0.024;
    group.add(magNeonStripL, magNeonStripR);

    // 4. CAÑÓN CORTO + COMPENSADOR
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 14), smgSteelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.048, -0.24);
    group.add(barrel);

    const barrelRing = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.022, 14), smgCopperMat);
    barrelRing.rotation.x = Math.PI / 2;
    barrelRing.position.set(0, 0.048, -0.22);
    group.add(barrelRing);

    const compensator = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.023, 0.075, 14), smgDarkMat);
    compensator.rotation.x = Math.PI / 2;
    compensator.position.set(0, 0.048, -0.34);
    const muzzleRing = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.018, 14), smgSteelMat);
    muzzleRing.rotation.x = Math.PI / 2;
    muzzleRing.position.set(0, 0.048, -0.38);
    group.add(compensator, muzzleRing);

    // 5. RIEL SUPERIOR Y MIRA HOLOGRÁFICA
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.014, 0.34), smgDarkMat);
    topRail.position.set(0, 0.108, -0.01);
    group.add(topRail);

    for (let r = 0; r < 8; r++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.005, 0.009), smgSteelMat);
      groove.position.set(0, 0.114, -0.16 + (r * 0.042));
      group.add(groove);
    }

    const holoBase = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.024, 0.11), smgDarkMat);
    holoBase.position.set(0, 0.126, -0.02);
    const holoHood = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.044, 0.09), smgDarkMat);
    holoHood.position.set(0, 0.150, -0.02);
    const holoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.046, 0.012), smgCopperMat);
    holoFrame.position.set(0, 0.150, -0.065);
    const holoLens = new THREE.Mesh(new THREE.CircleGeometry(0.017, 16), skinNeonMat);
    holoLens.position.set(0, 0.150, -0.066);
    group.add(holoBase, holoHood, holoFrame, holoLens);

    // 6. CULATA RETRÁCTIL
    const stockHousing = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.055, 0.05), smgDarkMat);
    stockHousing.position.set(0, 0.035, 0.23);
    const stockHingePin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.086, 10), smgCopperMat);
    stockHingePin.rotation.z = Math.PI / 2;
    stockHingePin.position.set(0, 0.035, 0.23);
    group.add(stockHousing, stockHingePin);

    for (let side of [-1, 1]) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.030, 10), smgCopperMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(side * 0.036, 0.035, 0.25);
      group.add(collar);
    }

    const stockArmL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.016, 0.20), smgSteelMat);
    stockArmL.position.set(-0.036, 0.035, 0.34);
    const stockArmR = stockArmL.clone();
    stockArmR.position.x = 0.036;

    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.12, 0.024), smgDarkMat);
    buttPad.position.set(0, 0.015, 0.44);
    const buttPadPlate = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.11, 0.008), smgCopperMat);
    buttPadPlate.position.set(0, 0.015, 0.448);
    group.add(stockArmL, stockArmR, buttPad, buttPadPlate);
  }

  global.buildSmgMesh = buildSmgMesh;
})(window);
