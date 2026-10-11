// ========================================================
// MÓDULO DE ARMA: FUSIL DE ASALTO CHRONO-SCAR
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// ========================================================

(function(global) {
  'use strict';

  function buildRifleMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;
    const skinNeonMat = ctx.skinNeonMat;
    const getScarGradientTexture = ctx.getScarGradientTexture;

    const scarGradTex = getScarGradientTexture ? getScarGradientTexture() : null;

    // Paleta PBR fiel a Fortnite con gradiente incorporado
    const scarTanHex = isGold ? 0xffd54f : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0xdc2626 : 0xc89657)));
    const scarTanMat = applyFortniteShader(new THREE.MeshStandardMaterial({
      color: scarTanHex,
      map: scarGradTex,
      roughness: 0.38,
      metalness: 0.20
    }), { edge: 0.65, grad: 0.20, rim: 0.16 });

    const scarDarkMat = applyFortniteShader(createStylizedPBR(0x1f2329, 0x000000, 0, 0.70, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const scarSteelMat = applyFortniteShader(createStylizedPBR(0x757c8a, 0x000000, 0, 0.25, 0.70), { edge: 0.70, grad: 0.10, rim: 0.18 });
    const chronoGoldMat = applyFortniteShader(createStylizedPBR(0xd97706, 0x92400e, 0.2, 0.28, 0.85), { edge: 0.75, grad: 0.12, rim: 0.22 });

    const extrudeBevelLarge = { depth: 0.076, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.012, bevelThickness: 0.012 };

    // 1. RECEPTOR SUPERIOR (UPPER RECEIVER) - Silueta estilizada con chaflanes
    const upperShape = new THREE.Shape();
    upperShape.moveTo(-0.16, 0.105);      // Frente superior
    upperShape.lineTo(0.32, 0.105);       // Riel superior continuo
    upperShape.lineTo(0.32, 0.02);        // Cierre trasero
    upperShape.lineTo(0.12, 0.02);        // Borde inferior trasero
    upperShape.lineTo(0.04, -0.015);      // Caída angular pozo cargador
    upperShape.lineTo(-0.16, -0.015);     // Base del guardamanos
    upperShape.lineTo(-0.16, 0.105);      // Frente

    // Ranuras de ventilación alargadas estilo cápsula (Pill Slots)
    for (let v = 0; v < 3; v++) {
      const vHole = new THREE.Path();
      const vx = -0.135 + (v * 0.055);
      const vy = 0.032;
      vHole.moveTo(vx, vy);
      vHole.lineTo(vx + 0.038, vy);
      vHole.lineTo(vx + 0.038, vy + 0.024);
      vHole.lineTo(vx, vy + 0.024);
      vHole.lineTo(vx, vy);
      upperShape.holes.push(vHole);
    }

    const upperGeo = new THREE.ExtrudeGeometry(upperShape, extrudeBevelLarge);
    upperGeo.translate(0, 0, -0.038);
    const upperMesh = new THREE.Mesh(upperGeo, scarTanMat);
    upperMesh.rotation.y = -Math.PI / 2;
    upperMesh.position.set(0, 0, 0);
    group.add(upperMesh);

    // 1.1 HOMBRERAS / CHAFLANES ANGULADOS A 45°
    for (let side of [-1, 1]) {
      const shoulderGeo = new THREE.BoxGeometry(0.014, 0.028, 0.46);
      const shoulder = new THREE.Mesh(shoulderGeo, scarTanMat);
      shoulder.rotation.z = side * 0.78;
      shoulder.position.set(side * 0.040, 0.102, 0.08);
      group.add(shoulder);
    }

    // 1.2 DETALLES DE IDENTIDAD "CHRONO BULLET"
    // A) NÚCLEO DE RESONANCIA TEMPORAL (Vial de Plasma de Taquiones)
    const chronoHousing = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.038, 0.15), scarDarkMat);
    chronoHousing.position.set(-0.045, 0.048, 0.06);

    const chronoVialGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.12, 12), new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.65
    }));
    chronoVialGlass.rotation.x = Math.PI / 2;
    chronoVialGlass.position.set(-0.048, 0.048, 0.06);

    const chronoPlasmaCore = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.11, 10), skinNeonMat);
    chronoPlasmaCore.rotation.x = Math.PI / 2;
    chronoPlasmaCore.position.set(-0.048, 0.048, 0.06);
    group.add(chronoHousing, chronoVialGlass, chronoPlasmaCore);

    // B) ENGRANAJES CRONOGRÁFICOS DE RELOJERÍA (Clockwork Gears)
    const mainGear = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 12), chronoGoldMat);
    mainGear.rotation.z = Math.PI / 2;
    mainGear.position.set(-0.044, 0.052, 0.16);

    for (let g = 0; g < 6; g++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.042), chronoGoldMat);
      tooth.rotation.x = (g * Math.PI) / 3;
      tooth.position.set(-0.044, 0.052, 0.16);
      group.add(tooth);
    }
    group.add(mainGear);

    const subGear = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 10), scarSteelMat);
    subGear.rotation.z = Math.PI / 2;
    subGear.position.set(-0.044, 0.028, 0.185);
    group.add(subGear);

    // C) PALANCA DE CARGA TÁCTICA
    const chargeSlot = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.16), scarDarkMat);
    chargeSlot.position.set(-0.043, 0.082, -0.04);
    const chargingArm = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.010, 0.014), scarSteelMat);
    chargingArm.position.set(-0.056, 0.082, -0.08);
    const chargingKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.022, 12), scarDarkMat);
    chargingKnob.rotation.z = Math.PI / 2;
    chargingKnob.position.set(-0.072, 0.082, -0.08);
    group.add(chargeSlot, chargingArm, chargingKnob);

    for (let side of [-1, 1]) {
      for (let b = 0; b < 3; b++) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 6), scarDarkMat);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(side * 0.044, 0.008, -0.04 + b * 0.065);
        group.add(bolt);
      }
    }

    // 2. RECEPTOR INFERIOR + EMPUÑADURA ERGONÓMICA CON ONDULACIONES
    const lowerShape = new THREE.Shape();
    lowerShape.moveTo(-0.06, -0.015);
    lowerShape.lineTo(0.06, -0.015);
    lowerShape.lineTo(0.06, -0.04);
    lowerShape.lineTo(0.18, -0.04);
    lowerShape.lineTo(0.14, -0.23);
    lowerShape.lineTo(0.05, -0.23);
    lowerShape.lineTo(0.075, -0.08);
    lowerShape.lineTo(0.01, -0.08);
    lowerShape.lineTo(0.01, -0.015);
    lowerShape.lineTo(-0.06, -0.015);

    const lowerGeo = new THREE.ExtrudeGeometry(lowerShape, { depth: 0.076, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.008, bevelThickness: 0.008 });
    lowerGeo.translate(0, 0, -0.038);
    const lowerMesh = new THREE.Mesh(lowerGeo, scarDarkMat);
    lowerMesh.rotation.y = -Math.PI / 2;
    lowerMesh.position.set(0, 0, 0);
    group.add(lowerMesh);

    for (let f = 0; f < 3; f++) {
      const fingerRib = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.065, 8), scarDarkMat);
      fingerRib.rotation.z = Math.PI / 2;
      fingerRib.position.set(0, -0.11 - f * 0.035, 0.085);
      group.add(fingerRib);
    }

    const selectorSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.007, 0.022), scarSteelMat);
    selectorSwitch.rotation.x = -0.4;
    selectorSwitch.position.set(-0.041, -0.045, 0.085);
    const autoIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.004), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    autoIndicator.position.set(-0.041, -0.040, 0.075);
    group.add(selectorSwitch, autoIndicator);

    const trigger = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.028, 8), scarSteelMat);
    trigger.rotation.x = 0.35;
    trigger.position.set(0, -0.045, -0.04);
    group.add(trigger);

    // 3. CARGADOR CURVO CON VENTANA DE BALAS DE ENERGÍA CRONO
    const magShape = new THREE.Shape();
    magShape.moveTo(0, 0);
    magShape.lineTo(0.068, 0);
    magShape.lineTo(0.048, -0.21);
    magShape.lineTo(-0.032, -0.21);
    magShape.lineTo(0, 0);

    const magGeo = new THREE.ExtrudeGeometry(magShape, { depth: 0.054, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    magGeo.translate(0, 0, -0.027);
    const magMesh = new THREE.Mesh(magGeo, scarDarkMat);
    magMesh.rotation.y = -Math.PI / 2;
    magMesh.position.set(0, -0.02, 0.01);
    group.add(magMesh);

    for (let m = 0; m < 3; m++) {
      const magRib = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.009, 0.055), scarDarkMat);
      magRib.position.set(0, -0.075 - m * 0.035, 0.015);
      group.add(magRib);
    }

    const magWindow = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.09, 0.016), skinNeonMat);
    magWindow.position.set(-0.028, -0.11, 0.02);
    group.add(magWindow);

    // 4. CULATA TÁCTICA TELESCÓPICA (BOOT STOCK SCAR)
    const stockShape = new THREE.Shape();
    stockShape.moveTo(0.30, 0.08);
    stockShape.lineTo(0.56, 0.07);
    stockShape.lineTo(0.58, 0.02);
    stockShape.lineTo(0.58, -0.14);
    stockShape.lineTo(0.51, -0.14);
    stockShape.lineTo(0.48, -0.04);
    stockShape.lineTo(0.30, 0.00);
    stockShape.lineTo(0.30, 0.08);

    const stockGeo = new THREE.ExtrudeGeometry(stockShape, { depth: 0.068, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 });
    stockGeo.translate(0, 0, -0.034);
    const stockMesh = new THREE.Mesh(stockGeo, scarTanMat);
    stockMesh.rotation.y = -Math.PI / 2;
    stockMesh.position.set(0, 0, 0);
    group.add(stockMesh);

    const stockHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.075, 10), scarSteelMat);
    stockHinge.position.set(0, 0.04, 0.31);
    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.17, 0.03), scarDarkMat);
    buttPad.position.set(0, -0.05, 0.57);
    const cheekRiser = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.03, 0.16), scarDarkMat);
    cheekRiser.position.set(0, 0.09, 0.42);
    group.add(stockHinge, buttPad, cheekRiser);

    // 5. CAÑÓN PESADO ("CHUNKY") + ANILLO DE RELOJ + GAS BLOCK + COMPENSADOR
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.30, 16), scarSteelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.052, -0.31);
    group.add(barrel);

    const clockRing = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.028, 16), chronoGoldMat);
    clockRing.rotation.x = Math.PI / 2;
    clockRing.position.set(0, 0.052, -0.23);

    for (let h = 0; h < 8; h++) {
      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.068, 0.006), scarDarkMat);
      notch.rotation.z = (h * Math.PI) / 4;
      notch.position.set(0, 0.052, -0.23);
      group.add(notch);
    }
    group.add(clockRing);

    const gasBlock = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.068, 0.045), scarDarkMat);
    gasBlock.position.set(0, 0.075, -0.33);
    const gasPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 12), scarSteelMat);
    gasPiston.rotation.x = Math.PI / 2;
    gasPiston.position.set(0, 0.095, -0.25);
    group.add(gasBlock, gasPiston);

    const flashHider = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.024, 0.09, 14), scarDarkMat);
    flashHider.rotation.x = Math.PI / 2;
    flashHider.position.set(0, 0.052, -0.47);
    const muzzleTip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 12), scarSteelMat);
    muzzleTip.rotation.x = Math.PI / 2;
    muzzleTip.position.set(0, 0.052, -0.52);
    group.add(flashHider, muzzleTip);

    // 6. RIEL PICATINNY SUPERIOR CONTINUO
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.016, 0.50), scarDarkMat);
    topRail.position.set(0, 0.12, -0.07);
    group.add(topRail);

    for (let r = 0; r < 12; r++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.006, 0.009), scarSteelMat);
      groove.position.set(0, 0.126, -0.30 + (r * 0.038));
      group.add(groove);
    }

    // 7. MIRAS ABATIBLES (IRON SIGHTS FORTNITE)
    const frontSightBase = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.03), scarDarkMat);
    frontSightBase.position.set(0, 0.13, -0.28);
    const frontSightPin = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.02, 0.006), skinNeonMat);
    frontSightPin.position.set(0, 0.155, -0.28);
    group.add(frontSightBase, frontSightPin);

    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.04, 0.035), scarDarkMat);
    rearSight.position.set(0, 0.135, 0.15);
    const rearRing = new THREE.Mesh(new THREE.RingGeometry(0.006, 0.014, 12), scarSteelMat);
    rearRing.position.set(0, 0.155, 0.132);
    group.add(rearSight, rearRing);

    // 8. VENTANA DE EYECCIÓN
    const ejectPort = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.035, 0.09), scarDarkMat);
    ejectPort.position.set(0.042, 0.065, -0.01);
    const boltCarrier = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.025, 0.07), scarSteelMat);
    boltCarrier.position.set(0.041, 0.065, -0.01);
    group.add(ejectPort, boltCarrier);
  }

  global.buildRifleMesh = buildRifleMesh;
})(window);
