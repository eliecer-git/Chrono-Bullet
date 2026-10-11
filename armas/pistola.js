// ========================================================
// MÓDULO DE ARMA: PISTOLA TÁCTICA CHRONO
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// ========================================================

(function(global) {
  'use strict';

  function buildPistolMesh(group, ctx) {
    const isGold = (ctx.activeSkin === 'skin_gold');
    const isVortex = (ctx.activeSkin === 'skin_vortex');
    const isMatrix = (ctx.activeSkin === 'skin_matrix');
    const isInferno = (ctx.activeSkin === 'skin_inferno');
    const createStylizedPBR = ctx.createStylizedPBR;
    const applyFortniteShader = ctx.applyFortniteShader;

    // Paleta oficial de 3 colores base + Turquesa emisivo:
    // 1. Beige/Marfil (zona clara: corredera superior)
    // 2. Azul Oscuro / Negro azulado (zona media/oscura: armazón, cañón y paneles)
    // 3. Cobre / Dorado (acento cálido: engranaje Chrono, compensador, placa trasera, gatillo)
    // + Turquesa emisivo: energía temporal (franja lomo, franjas laterales, núcleo reloj)
    const cbBeigeHex = isGold ? 0xffd54f : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0xdc2626 : 0xd9c7a0)));
    const cbDarkBlueHex = isGold ? 0x241d08 : (isVortex ? 0x2d124d : (isMatrix ? 0x063025 : (isInferno ? 0x450a0a : 0x1f2a44)));
    const cbBeigeMat = applyFortniteShader(createStylizedPBR(cbBeigeHex, 0x000000, 0, 0.35, 0.20), { edge: 0.78, grad: 0.20, rim: 0.24 });
    const cbDarkMat = applyFortniteShader(createStylizedPBR(0x0b1020, 0x000000, 0, 0.70, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const cbFrameMat = applyFortniteShader(createStylizedPBR(cbDarkBlueHex, 0x000000, 0, 0.52, 0.18), { edge: 0.70, grad: 0.20, rim: 0.20 });
    const cbCopperMat = applyFortniteShader(createStylizedPBR(0xe8922b, 0x7c2d12, 0.15, 0.30, 0.82), { edge: 0.75, grad: 0.14, rim: 0.22 });
    const cbGoldMat = applyFortniteShader(createStylizedPBR(0xe8c14a, 0x92400e, 0.20, 0.28, 0.85), { edge: 0.80, grad: 0.12, rim: 0.24 });
    const cbTurquoiseMat = new THREE.MeshBasicMaterial({ color: 0x2fe0d0 });

    const extrudeBevelPistol = { depth: 0.068, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 };

    // 1. CORREDERA SUPERIOR ESTILIZADA (UPPER SLIDE) - Beige Marfil con biseles y chaflán trasero
    // Nota de rotación: y = -Math.PI / 2 => +X en forma 2D apunta hacia +Z (hacia la cámara del jugador)
    const slideShape = new THREE.Shape();
    slideShape.moveTo(-0.16, 0.062);      // Nariz frontal
    slideShape.lineTo(-0.14, 0.080);      // Chaflán superior delantero
    slideShape.lineTo(0.132, 0.080);      // Lomo superior continuo
    slideShape.lineTo(0.158, 0.054);      // Chaflán trasero a 45° (elimina la caja plana frente a los ojos del jugador)
    slideShape.lineTo(0.158, 0.005);      // Caída trasera
    slideShape.lineTo(0.145, 0.00);       // Base trasera sobre la cola de castor
    slideShape.lineTo(0.055, 0.00);       // Borde trasero de la ventana de eyección
    slideShape.lineTo(0.038, 0.026);      // Recorte ventana de eyección
    slideShape.lineTo(-0.062, 0.026);     // Frente de la ventana
    slideShape.lineTo(-0.075, 0.00);      // Borde delantero de la ventana
    slideShape.lineTo(-0.145, 0.00);      // Base delantera
    slideShape.lineTo(-0.16, 0.015);      // Bisel inferior de la nariz
    slideShape.lineTo(-0.16, 0.062);

    const slideGeo = new THREE.ExtrudeGeometry(slideShape, extrudeBevelPistol);
    slideGeo.translate(0, 0, -0.034);
    const slideMesh = new THREE.Mesh(slideGeo, cbBeigeMat);
    slideMesh.rotation.y = -Math.PI / 2;
    slideMesh.position.set(0, 0.040, -0.05);
    group.add(slideMesh);

    // Chaflanes biselados superiores a 45° a lo largo de la corredera
    for (let side of [-1, 1]) {
      const slideShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.016, 0.30), cbBeigeMat);
      slideShoulder.rotation.z = side * 0.78;
      slideShoulder.position.set(side * 0.036, 0.116, -0.05);
      group.add(slideShoulder);
    }

    // Placa trasera de corredera (Slide Backplate) en Cobre/Oro frente al jugador
    const rearBackplate = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.046, 0.008), cbCopperMat);
    rearBackplate.position.set(0, 0.072, 0.108);
    const strikerNotch = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.018, 0.006), cbDarkMat);
    strikerNotch.position.set(0, 0.076, 0.112);
    group.add(rearBackplate, strikerNotch);

    // Ranuras de agarre tácticas traseras en relieve (Slide Serrations) en ambos laterales
    for (let s = 0; s < 5; s++) {
      const serrationZ = 0.046 + s * 0.012;
      for (let side of [-1, 1]) {
        const serrationRib = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.038, 0.006), cbDarkMat);
        serrationRib.position.set(side * 0.038, 0.078, serrationZ);
        serrationRib.rotation.y = side * 0.10;
        group.add(serrationRib);
      }
    }

    // Ventana de eyección de cartuchos con cañón interior de cobre
    const ejectionPort = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.030, 0.09), cbDarkMat);
    ejectionPort.position.set(0.036, 0.082, -0.06);
    const chamberBlock = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.024, 0.07), cbCopperMat);
    chamberBlock.position.set(0.035, 0.082, -0.06);
    group.add(ejectionPort, chamberBlock);

    // 1.1 FIRMA CHRONO DESTACADA (ENGRANAJE / RELOJ DE ORO TAMAÑO MONEDA VISIBLE EN AMBOS LATERALES)
    for (let side of [-1, 1]) {
      const chronoGear = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 16), cbGoldMat);
      chronoGear.rotation.z = Math.PI / 2;
      chronoGear.position.set(side * 0.038, 0.078, -0.010);

      // 8 Dientes de engranaje dorados de alta precisión
      for (let g = 0; g < 4; g++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.005, 0.058), cbGoldMat);
        tooth.rotation.x = (g * Math.PI) / 4;
        tooth.position.set(side * 0.038, 0.078, -0.010);
        group.add(tooth);
      }

      // Bisel exterior de cobre cálido
      const gearRim = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0028, 8, 20), cbCopperMat);
      gearRim.rotation.y = Math.PI / 2;
      gearRim.position.set(side * 0.038, 0.078, -0.010);

      // Dial de reloj cronográfico turquesa emisivo
      const gearCore = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.0075, 12), cbTurquoiseMat);
      gearCore.rotation.z = Math.PI / 2;
      gearCore.position.set(side * 0.0385, 0.078, -0.010);

      // Manecillas del tiempo en oro
      const clockHand = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.018, 0.003), cbGoldMat);
      clockHand.position.set(side * 0.039, 0.078, -0.010);
      clockHand.rotation.x = 0.55;

      group.add(chronoGear, gearRim, gearCore, clockHand);
    }

    // 1.2 ACENTOS TURQUESA EMISIVOS DE ENERGÍA TEMPORAL (Lomo superior + Franjas laterales)
    // Franja emisiva visible a lo largo del lomo superior hacia la mira frontal
    const topEnergyRail = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.005, 0.22), cbCopperMat);
    topEnergyRail.position.set(0, 0.1205, -0.05);
    const topEnergyLine = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.007, 0.20), cbTurquoiseMat);
    topEnergyLine.position.set(0, 0.1225, -0.05);
    group.add(topEnergyRail, topEnergyLine);

    // Franjas emisivas laterales en ambos costados de la corredera
    for (let side of [-1, 1]) {
      const sideEnergyBezel = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.011, 0.14), cbCopperMat);
      sideEnergyBezel.position.set(side * 0.038, 0.096, -0.09);
      const sideEnergyStrip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.13), cbTurquoiseMat);
      sideEnergyStrip.position.set(side * 0.0385, 0.096, -0.09);
      group.add(sideEnergyBezel, sideEnergyStrip);
    }

    // 2. ARMAZÓN INFERIOR (LOWER FRAME) - Azul Oscuro con cola de castor y riel
    const frameShape = new THREE.Shape();
    frameShape.moveTo(-0.16, 0.00);
    frameShape.lineTo(0.12, 0.00);
    frameShape.lineTo(0.145, -0.035);     // Cola de castor ergonómica extendida
    frameShape.lineTo(0.095, -0.22);      // Base trasera empuñadura
    frameShape.lineTo(0.015, -0.22);      // Base delantera
    frameShape.lineTo(0.045, -0.08);      // Curva interior
    frameShape.lineTo(-0.04, -0.08);      // Fondo del guardamonte biselado
    frameShape.lineTo(-0.04, -0.02);      // Frente del guardamonte
    frameShape.lineTo(-0.16, -0.02);      // Riel Picatinny inferior
    frameShape.lineTo(-0.16, 0.00);

    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: 0.062, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.007 });
    frameGeo.translate(0, 0, -0.031);
    const frameMesh = new THREE.Mesh(frameGeo, cbFrameMat);
    frameMesh.rotation.y = -Math.PI / 2;
    frameMesh.position.set(0, 0.040, -0.05);
    group.add(frameMesh);

    // CACHAS DE AGARRE TÁCTICAS CON TEXTURA EN RELIEVE (Grip Texture Panels)
    for (let side of [-1, 1]) {
      // Placa base de la cacha en polímero oscuro
      const gripPanel = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.135, 0.068), cbDarkMat);
      gripPanel.rotation.x = -0.26;
      gripPanel.position.set(side * 0.032, -0.065, 0.055);

      // Tornillo / medallón dorado de sujeción
      const gripScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8), cbGoldMat);
      gripScrew.rotation.z = Math.PI / 2;
      gripScrew.position.set(side * 0.035, -0.055, 0.052);
      group.add(gripPanel, gripScrew);

      // Estrías horizontales tácticas de sujeción antideslizante
      for (let r = 0; r < 5; r++) {
        const gripRidge = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.006, 0.055), cbDarkMat);
        gripRidge.rotation.x = -0.26;
        gripRidge.position.set(side * 0.033, -0.025 - r * 0.022, 0.042 + r * 0.006);
        group.add(gripRidge);
      }
    }

    // Nervaduras anatómicas de agarre en la parte frontal de la empuñadura
    for (let f = 0; f < 3; f++) {
      const fingerRib = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.052, 8), cbDarkMat);
      fingerRib.rotation.z = Math.PI / 2;
      fingerRib.position.set(0, -0.045 - (f * 0.034), 0.032);
      group.add(fingerRib);
    }

    // Riel Picatinny inferior ranurado bajo el cañón
    for (let slot = 0; slot < 3; slot++) {
      const railSlot = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.005, 0.010), cbDarkMat);
      railSlot.position.set(0, 0.016, -0.14 - slot * 0.022);
      group.add(railSlot);
    }

    // Gatillo táctico biselado en Cobre cálido
    const trigger = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.026, 8), cbCopperMat);
    trigger.rotation.x = 0.38;
    trigger.position.set(0, 0.015, -0.04);
    group.add(trigger);

    // Talón del cargador extendido biselado en Cobre con nodo de energía turquesa
    const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.022, 0.095), cbCopperMat);
    magBase.rotation.x = -0.26;
    magBase.position.set(0, -0.18, 0.085);
    const magDot = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), cbTurquoiseMat);
    magDot.rotation.x = -0.26;
    magDot.position.set(0, -0.192, 0.088);
    group.add(magBase, magDot);

    // 3. CAÑÓN CILÍNDRICO PROTAGONISTA + COMPENSADOR TÁCTICO BISELADO EN COBRE
    // Cañón exterior cilíndrico en acero oscuro visible saliendo de la corredera
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16), cbDarkMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.080, -0.23);
    // Ánima hueca del cañón
    const barrelBore = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 12), new THREE.MeshBasicMaterial({ color: 0x050810 }));
    barrelBore.rotation.x = Math.PI / 2;
    barrelBore.position.set(0, 0.080, -0.281);
    // Varilla guía inferior
    const guideRod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 10), cbCopperMat);
    guideRod.rotation.x = Math.PI / 2;
    guideRod.position.set(0, 0.054, -0.22);

    // Freno de boca compensador compacto biselado en cobre
    const comp = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.058, 0.046), cbCopperMat);
    comp.position.set(0, 0.080, -0.265);
    // Puertos de escape gemelos del compensador
    const compPort1 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.012), cbDarkMat);
    compPort1.position.set(0, 0.110, -0.272);
    const compPort2 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.012), cbDarkMat);
    compPort2.position.set(0, 0.110, -0.258);
    group.add(barrel, barrelBore, guideRod, comp, compPort1, compPort2);

    // 4. MIRAS TÁCTICAS (Alza trasera oscura y Punto frontal turquesa emisivo)
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.020, 0.018), cbDarkMat);
    rearSight.position.set(0, 0.126, 0.092);
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.022, 0.018), cbDarkMat);
    frontSight.position.set(0, 0.128, -0.185);
    const sightDot = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.007, 0.007), cbTurquoiseMat);
    sightDot.position.set(0, 0.133, -0.185);
    group.add(rearSight, frontSight, sightDot);
  }

  global.buildPistolMesh = buildPistolMesh;
})(window);
