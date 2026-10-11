// ========================================================
// MÓDULO DE ARMA: RIFLE DE FRANCOTIRADOR CHRONO
// Edición Prestigio Negro y Oro (Guía de estilo Chrono Bullet)
// ========================================================

(function(global) {
  'use strict';

  function buildSniperMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;
    const skinNeonMat = ctx.skinNeonMat;

    const cbBlackChassisHex = isGold ? 0x221a08 : (isVortex ? 0x1d102f : (isMatrix ? 0x052018 : (isInferno ? 0x2b0808 : 0x121722)));
    const cbGraphiteBiselHex = isGold ? 0x4a3b12 : (isVortex ? 0x361c56 : (isMatrix ? 0x0c382a : (isInferno ? 0x4a1212 : 0x252e3e)));
    const cbCopperHex = isGold ? 0xffd54f : (isVortex ? 0xc084fc : (isMatrix ? 0x34d399 : (isInferno ? 0xf87171 : 0xe8922b)));
    const cbGoldHex = isGold ? 0xffe082 : (isVortex ? 0xe9d5ff : (isMatrix ? 0x6ee7b7 : (isInferno ? 0xfca5a5 : 0xe8c14a)));

    const matCuerpo = applyFortniteShader(createStylizedPBR(cbBlackChassisHex, 0x000000, 0, 0.44, 0.16), { edge: 0.76, grad: 0.18, rim: 0.22 });
    const matCuerpoBisel = applyFortniteShader(createStylizedPBR(cbGraphiteBiselHex, 0x000000, 0, 0.50, 0.15), { edge: 0.70, grad: 0.16, rim: 0.20 });
    const matOscuro = applyFortniteShader(createStylizedPBR(0x090d16, 0x000000, 0, 0.70, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const matCobre = applyFortniteShader(createStylizedPBR(cbCopperHex, 0x7c2d12, 0.15, 0.30, 0.82), { edge: 0.78, grad: 0.14, rim: 0.24 });
    const matOro = applyFortniteShader(createStylizedPBR(cbGoldHex, 0x92400e, 0.20, 0.28, 0.88), { edge: 0.85, grad: 0.12, rim: 0.26 });
    const matAcero = applyFortniteShader(createStylizedPBR(0x8898a8, 0x000000, 0, 0.25, 0.75), { edge: 0.70, grad: 0.10, rim: 0.20 });
    const matTurquesa = skinNeonMat || new THREE.MeshBasicMaterial({ color: 0x2fe0d0 });
    const matTurquesaGlow = new THREE.MeshBasicMaterial({ color: 0x55ffff });

    const extrudeBevelSniper = { depth: 0.068, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.009, bevelThickness: 0.009 };

    // ========================================================
    // 1. PIEZA: CUERPO
    // ========================================================
    const cuerpoGroup = new THREE.Group();
    cuerpoGroup.name = 'cuerpo';

    const cuerpoShape = new THREE.Shape();
    cuerpoShape.moveTo(-0.25, 0.092);
    cuerpoShape.lineTo(0.25, 0.092);
    cuerpoShape.lineTo(0.25, 0.015);
    cuerpoShape.lineTo(0.12, 0.015);
    cuerpoShape.lineTo(0.04, -0.018);
    cuerpoShape.lineTo(-0.08, -0.018);
    cuerpoShape.lineTo(-0.25, 0.018);
    cuerpoShape.lineTo(-0.25, 0.092);

    for (let v = 0; v < 3; v++) {
      const vHole = new THREE.Path();
      const vx = -0.22 + (v * 0.052);
      const vy = 0.038;
      vHole.moveTo(vx, vy);
      vHole.lineTo(vx + 0.036, vy);
      vHole.lineTo(vx + 0.036, vy + 0.022);
      vHole.lineTo(vx, vy + 0.022);
      vHole.lineTo(vx, vy);
      cuerpoShape.holes.push(vHole);
    }

    const cuerpoGeo = new THREE.ExtrudeGeometry(cuerpoShape, extrudeBevelSniper);
    cuerpoGeo.translate(0, 0, -0.034);
    const cuerpoMesh = new THREE.Mesh(cuerpoGeo, matCuerpo);
    cuerpoMesh.rotation.y = -Math.PI / 2;
    cuerpoMesh.position.set(0, 0, 0.02);
    cuerpoGroup.add(cuerpoMesh);

    for (let side of [-1, 1]) {
      const hombrera = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.022, 0.50), matCuerpoBisel);
      hombrera.rotation.z = side * 0.78;
      hombrera.position.set(side * 0.038, 0.090, 0.02);
      cuerpoGroup.add(hombrera);
    }

    for (let side of [-1, 1]) {
      const panelOro = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.036, 0.16), matOro);
      panelOro.position.set(side * 0.039, 0.048, 0.05);
      cuerpoGroup.add(panelOro);
      for (let b = 0; b < 3; b++) {
        const perno = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 6), matCobre);
        perno.rotation.z = Math.PI / 2;
        perno.position.set(side * 0.043, 0.048, -0.01 + b * 0.06);
        cuerpoGroup.add(perno);
      }
    }

    const celdaEnergiaBase = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.12), matOro);
    celdaEnergiaBase.position.set(-0.040, 0.052, 0.14);
    const celdaEnergiaGlow = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.10), matTurquesaGlow);
    celdaEnergiaGlow.position.set(-0.044, 0.052, 0.14);
    cuerpoGroup.add(celdaEnergiaBase, celdaEnergiaGlow);

    const boltStem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.042, 8), matAcero);
    boltStem.rotation.z = -Math.PI / 2 + 0.35;
    boltStem.position.set(-0.055, 0.076, -0.03);
    const boltKnob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), matOro);
    boltKnob.position.set(-0.074, 0.086, -0.03);
    cuerpoGroup.add(boltStem, boltKnob);

    const gripShape = new THREE.Shape();
    gripShape.moveTo(0.04, -0.018);
    gripShape.lineTo(0.14, -0.018);
    gripShape.lineTo(0.11, -0.21);
    gripShape.lineTo(0.03, -0.21);
    gripShape.lineTo(0.04, -0.018);
    const gripGeo = new THREE.ExtrudeGeometry(gripShape, { depth: 0.056, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 });
    gripGeo.translate(0, 0, -0.028);
    const gripMesh = new THREE.Mesh(gripGeo, matOscuro);
    gripMesh.rotation.y = -Math.PI / 2;
    gripMesh.position.set(0, 0, 0.02);
    cuerpoGroup.add(gripMesh);

    for (let side of [-1, 1]) {
      for (let r = 0; r < 4; r++) {
        const gripRib = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.045), matCuerpoBisel);
        gripRib.rotation.x = -0.25;
        gripRib.position.set(side * 0.030, -0.05 - r * 0.032, 0.065 + r * 0.008);
        cuerpoGroup.add(gripRib);
      }
    }

    group.add(cuerpoGroup);

    // ========================================================
    // 2. PIEZA: CAÑO
    // ========================================================
    const canoGroup = new THREE.Group();
    canoGroup.name = 'cano';

    const trunnion = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.06, 14), matOro);
    trunnion.rotation.x = Math.PI / 2;
    trunnion.position.set(0, 0.050, -0.26);
    canoGroup.add(trunnion);

    const barrelMain = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0135, 0.80, 16), matAcero);
    barrelMain.rotation.x = Math.PI / 2;
    barrelMain.position.set(0, 0.050, -0.66);
    canoGroup.add(barrelMain);

    const barrelBore = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.015, 12), new THREE.MeshBasicMaterial({ color: 0x050810 }));
    barrelBore.rotation.x = Math.PI / 2;
    barrelBore.position.set(0, 0.050, -1.106);
    canoGroup.add(barrelBore);

    for (let a of [-0.48, -0.72, -0.92]) {
      const ringGold = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 12), matOro);
      ringGold.rotation.x = Math.PI / 2;
      ringGold.position.set(0, 0.050, a);
      canoGroup.add(ringGold);
    }

    const muzzleBrakeBody = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.044, 0.060), matOro);
    muzzleBrakeBody.position.set(0, 0.050, -1.08);
    const ventL = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.018, 0.014), matOscuro);
    ventL.position.set(0, 0.050, -1.07);
    const ventR = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.018, 0.014), matOscuro);
    ventR.position.set(0, 0.050, -1.09);
    const crownSteel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.016, 12), matAcero);
    crownSteel.rotation.x = Math.PI / 2;
    crownSteel.position.set(0, 0.050, -1.10);
    canoGroup.add(muzzleBrakeBody, ventL, ventR, crownSteel);

    group.add(canoGroup);

    // ========================================================
    // 3. PIEZA: CULATA
    // ========================================================
    const culataGroup = new THREE.Group();
    culataGroup.name = 'culata';

    const culataShape = new THREE.Shape();
    culataShape.moveTo(0.25, 0.050);
    culataShape.quadraticCurveTo(0.38, 0.056, 0.52, 0.046);
    culataShape.quadraticCurveTo(0.57, 0.010, 0.54, -0.060);
    culataShape.quadraticCurveTo(0.52, -0.125, 0.47, -0.120);
    culataShape.quadraticCurveTo(0.42, -0.110, 0.38, -0.040);
    culataShape.quadraticCurveTo(0.31, -0.020, 0.25, -0.035);
    culataShape.lineTo(0.25, 0.050);

    const culataHole = new THREE.Path();
    culataHole.moveTo(0.30, 0.020);
    culataHole.quadraticCurveTo(0.40, 0.026, 0.45, 0.018);
    culataHole.quadraticCurveTo(0.42, -0.020, 0.37, -0.022);
    culataHole.quadraticCurveTo(0.31, -0.020, 0.30, 0.020);
    culataShape.holes.push(culataHole);

    const culataGeo = new THREE.ExtrudeGeometry(culataShape, { depth: 0.058, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.008, bevelThickness: 0.008 });
    culataGeo.translate(0, 0, -0.029);
    const culataMesh = new THREE.Mesh(culataGeo, matCuerpo);
    culataMesh.rotation.y = -Math.PI / 2;
    culataMesh.position.set(0, 0, 0.02);
    culataGroup.add(culataMesh);

    const stockTube = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), matAcero);
    stockTube.rotation.x = Math.PI / 2;
    stockTube.position.set(0, 0.010, 0.40);
    culataGroup.add(stockTube);

    const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.034, 0.17), matOscuro);
    cheekRest.position.set(0, 0.082, 0.38);
    const cheekTrim = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.008, 0.15), matOro);
    cheekTrim.position.set(0, 0.065, 0.38);
    const cheekKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.012, 8), matOro);
    cheekKnob.rotation.z = Math.PI / 2;
    cheekKnob.position.set(0.030, 0.075, 0.38);
    culataGroup.add(cheekRest, cheekTrim, cheekKnob);

    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.16, 0.022), matOscuro);
    buttPad.rotation.x = -0.12;
    buttPad.position.set(0, -0.035, 0.56);
    for (let s = 0; s < 4; s++) {
      const padStripe = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.008, 0.005), matOro);
      padStripe.position.set(0, -0.09 + s * 0.038, 0.572);
      culataGroup.add(padStripe);
    }
    culataGroup.add(buttPad);

    group.add(culataGroup);

    // ========================================================
    // 4. PIEZA: MIRA
    // ========================================================
    const miraGroup = new THREE.Group();
    miraGroup.name = 'mira';

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.012, 0.46), matCuerpoBisel);
    topRail.position.set(0, 0.106, 0.02);
    miraGroup.add(topRail);

    for (let r of [-0.07, 0.11]) {
      const scopeBase = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.050, 0.032), matOscuro);
      scopeBase.position.set(0, 0.130, r);
      const scopeRing = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 16), matOro);
      scopeRing.rotation.x = Math.PI / 2;
      scopeRing.position.set(0, 0.160, r);
      miraGroup.add(scopeBase, scopeRing);
    }

    const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.36, 16), matOscuro);
    scopeBody.rotation.x = Math.PI / 2;
    scopeBody.position.set(0, 0.160, 0.02);
    miraGroup.add(scopeBody);

    const scopeEnergyLine = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.28), matTurquesaGlow);
    scopeEnergyLine.position.set(0, 0.188, -0.06);
    miraGroup.add(scopeEnergyLine);

    const objectiveBell = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.026, 0.10, 16), matCuerpo);
    objectiveBell.rotation.x = -Math.PI / 2;
    objectiveBell.position.set(0, 0.160, -0.19);
    const sunshade = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.040, 0.05, 16), matOro);
    sunshade.rotation.x = Math.PI / 2;
    sunshade.position.set(0, 0.160, -0.245);
    miraGroup.add(objectiveBell, sunshade);

    const ocularBell = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.07, 16), matCuerpo);
    ocularBell.rotation.x = Math.PI / 2;
    ocularBell.position.set(0, 0.160, 0.205);
    miraGroup.add(ocularBell);

    const turretTop = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.018, 12), matOro);
    turretTop.position.set(0, 0.192, 0.02);
    const turretSide = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.018, 12), matOro);
    turretSide.rotation.z = Math.PI / 2;
    turretSide.position.set(0.032, 0.160, 0.02);
    miraGroup.add(turretTop, turretSide);

    group.add(miraGroup);

    // ========================================================
    // 5. PIEZA: LENTE
    // ========================================================
    const lenteGroup = new THREE.Group();
    lenteGroup.name = 'lente';

    const lensRearGlow = new THREE.Mesh(new THREE.CircleGeometry(0.026, 20), matTurquesaGlow);
    lensRearGlow.position.set(0, 0.160, 0.241);
    lenteGroup.add(lensRearGlow);

    const dialBezel = new THREE.Mesh(new THREE.TorusGeometry(0.0255, 0.0025, 8, 24), matOro);
    dialBezel.position.set(0, 0.160, 0.2415);
    lenteGroup.add(dialBezel);

    for (let h = 0; h < 12; h++) {
      const isCardinal = (h % 3 === 0);
      const tickLength = isCardinal ? 0.006 : 0.0035;
      const tickWidth = isCardinal ? 0.0020 : 0.0012;
      const angle = (h * Math.PI) / 6;
      const dist = 0.021;
      const tick = new THREE.Mesh(new THREE.BoxGeometry(tickWidth, tickLength, 0.001), matOro);
      tick.position.set(Math.sin(angle) * dist, 0.160 + Math.cos(angle) * dist, 0.242);
      tick.rotation.z = -angle;
      lenteGroup.add(tick);
    }

    const reticleCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.0012, 0.001), matOro);
    reticleCrossH.position.set(0, 0.160, 0.242);
    const reticleCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.028, 0.001), matOro);
    reticleCrossV.position.set(0, 0.160, 0.242);
    const reticleRing = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.0095, 16), matOro);
    reticleRing.position.set(0, 0.160, 0.242);
    lenteGroup.add(reticleCrossH, reticleCrossV, reticleRing);

    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.010, 0.0012), matCobre);
    hourHand.position.set(0.003, 0.164, 0.2422);
    hourHand.rotation.z = -0.7;
    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.016, 0.0012), matOro);
    minuteHand.position.set(-0.002, 0.166, 0.2422);
    minuteHand.rotation.z = 0.4;
    lenteGroup.add(hourHand, minuteHand);

    const lensFrontGlow = new THREE.Mesh(new THREE.CircleGeometry(0.036, 20), matTurquesaGlow);
    lensFrontGlow.rotation.y = Math.PI;
    lensFrontGlow.position.set(0, 0.160, -0.271);

    const lensFrontCore = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), new THREE.MeshBasicMaterial({ color: 0xecfeff }));
    lensFrontCore.rotation.y = Math.PI;
    lensFrontCore.position.set(0, 0.160, -0.2715);

    const frontBezel = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0035, 8, 24), matOro);
    frontBezel.position.set(0, 0.160, -0.271);
    lenteGroup.add(lensFrontGlow, lensFrontCore, frontBezel);

    group.add(lenteGroup);

    // ========================================================
    // 6. PIEZA: BÍPODE
    // ========================================================
    const bipodeGroup = new THREE.Group();
    bipodeGroup.name = 'bipode';

    const bipodMount = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.028, 0.040), matOscuro);
    bipodMount.position.set(0, 0.005, -0.26);
    const bipodPivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.052, 8), matOro);
    bipodPivotPin.rotation.z = Math.PI / 2;
    bipodPivotPin.position.set(0, 0.005, -0.26);
    bipodeGroup.add(bipodMount, bipodPivotPin);

    for (let side of [-1, 1]) {
      const foldedLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.22, 10), matAcero);
      foldedLeg.rotation.x = Math.PI / 2;
      foldedLeg.position.set(side * 0.024, 0.005, -0.38);

      const legCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.016, 8), matOro);
      legCollar.rotation.x = Math.PI / 2;
      legCollar.position.set(side * 0.024, 0.005, -0.34);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.018, 0.024), matOscuro);
      foot.position.set(side * 0.024, 0.005, -0.49);

      bipodeGroup.add(foldedLeg, legCollar, foot);
    }

    group.add(bipodeGroup);

    // ========================================================
    // 7. PIEZA: CARGADOR
    // ========================================================
    const cargadorGroup = new THREE.Group();
    cargadorGroup.name = 'cargador';

    const magShape = new THREE.Shape();
    magShape.moveTo(0, 0);
    magShape.lineTo(0.070, 0);
    magShape.lineTo(0.056, -0.17);
    magShape.lineTo(-0.014, -0.17);
    magShape.lineTo(0, 0);

    const magGeo = new THREE.ExtrudeGeometry(magShape, { depth: 0.052, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    magGeo.translate(0, 0, -0.026);
    const magMesh = new THREE.Mesh(magGeo, matOscuro);
    magMesh.rotation.y = -Math.PI / 2;
    magMesh.position.set(0, -0.018, -0.015);
    cargadorGroup.add(magMesh);

    const magGoldShield = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.046, 0.074), matOro);
    magGoldShield.position.set(0, -0.095, -0.035);
    const magEnergyWindow = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.014, 0.048), matTurquesaGlow);
    magEnergyWindow.position.set(0, -0.095, -0.035);
    const magBasepad = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.018, 0.082), matOro);
    magBasepad.rotation.x = -0.22;
    magBasepad.position.set(0, -0.165, -0.010);
    const magDot = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.008, 10), matTurquesaGlow);
    magDot.rotation.x = -0.22;
    magDot.position.set(0, -0.176, -0.008);
    cargadorGroup.add(magGoldShield, magEnergyWindow, magBasepad, magDot);

    group.add(cargadorGroup);

    // ========================================================
    // 8. PIEZA: GATILLO
    // ========================================================
    const gatilloGroup = new THREE.Group();
    gatilloGroup.name = 'gatillo';

    const guardShape = new THREE.Shape();
    guardShape.moveTo(-0.02, -0.018);
    guardShape.lineTo(-0.02, -0.075);
    guardShape.lineTo(0.045, -0.075);
    guardShape.lineTo(0.045, -0.018);
    guardShape.lineTo(0.035, -0.018);
    guardShape.lineTo(0.035, -0.065);
    guardShape.lineTo(-0.010, -0.065);
    guardShape.lineTo(-0.010, -0.018);
    guardShape.lineTo(-0.02, -0.018);
    const guardGeo = new THREE.ExtrudeGeometry(guardShape, { depth: 0.030, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.004, bevelThickness: 0.004 });
    guardGeo.translate(0, 0, -0.015);
    const guardMesh = new THREE.Mesh(guardGeo, matCuerpoBisel);
    guardMesh.rotation.y = -Math.PI / 2;
    guardMesh.position.set(0, 0, 0.02);
    gatilloGroup.add(guardMesh);

    const triggerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.008), matOro);
    triggerBlade.rotation.x = 0.32;
    triggerBlade.position.set(0, -0.045, 0.035);
    const triggerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018, 8), matAcero);
    triggerPin.rotation.z = Math.PI / 2;
    triggerPin.position.set(0, -0.032, 0.035);
    gatilloGroup.add(triggerBlade, triggerPin);

    group.add(gatilloGroup);
  }

  global.buildSniperMesh = buildSniperMesh;
})(window);
