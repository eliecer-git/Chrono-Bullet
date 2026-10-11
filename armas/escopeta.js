// ========================================================
// MÓDULO DE ARMA: ESCOPETA PESADA CHRONO
// Guía de estilo Chrono Bullet: Cartoon 3D limpio y estilizado
// Rol: Arma de corto alcance, pesada, maciza y contundente.
// Paleta: Rojo Oscuro (cuerpo) + Dorado (bordes/acentos) + Negro Azulado (profundo) + Turquesa Emisivo (energía)
// Color extra de contraste: Grafito Acero (0x384152) para placas intermedias y remaches
// Optimización: Cero Z-fighting (capas con clearance de 0.003 y polygonOffset),
// piezas fusionadas para menos draw calls y paneles esculpidos sin superficies lisas.
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
    // PALETA DE COLORES Y MATERIALES (Agrupados al inicio)
    // ========================================================
    // 1. Rojo Oscuro (Cuerpo principal macizo)
    const COLOR_ROJO_HEX     = isGold ? 0xffd54f : (isVortex ? 0x7e22ce : (isMatrix ? 0x059669 : (isInferno ? 0xdc2626 : 0x821319)));
    // 2. Dorado Puro (Acentos, bordes biselados, engranaje de reloj y detalles)
    const COLOR_DORADO_HEX   = isGold ? 0xfff3b0 : (isVortex ? 0xc084fc : (isMatrix ? 0x34d399 : (isInferno ? 0xfbbf24 : 0xe8c14a)));
    // 3. Negro Azulado (Zonas profundas, cantonera, empuñadura y cavidades)
    const COLOR_NEGRO_HEX    = isGold ? 0x221a08 : (isVortex ? 0x180f28 : (isMatrix ? 0x052018 : (isInferno ? 0x240808 : 0x0c111d)));
    // 4. Color extra de contraste: Grafito Acero (Placas de blindaje, tambor y bases de remaches)
    const COLOR_GRAFITO_HEX  = isGold ? 0x6b5314 : (isVortex ? 0x3b1d5c : (isMatrix ? 0x064e3b : (isInferno ? 0x5a1a1a : 0x384152)));
    // 5. Turquesa Emisivo (Acentos de energía temporal y doble punto de luz)
    const COLOR_TURQUESA_HEX = 0x2fe0d0;

    const matRojoOscuro = applyFortniteShader(createStylizedPBR(COLOR_ROJO_HEX, 0x000000, 0, 0.40, 0.22), { edge: 0.85, grad: 0.24, rim: 0.28 });
    const matDorado     = applyFortniteShader(createStylizedPBR(COLOR_DORADO_HEX, 0x92400e, 0.20, 0.26, 0.86), { edge: 0.88, grad: 0.14, rim: 0.26 });
    const matNegroAzul  = applyFortniteShader(createStylizedPBR(COLOR_NEGRO_HEX, 0x000000, 0, 0.68, 0.12), { edge: 0.50, grad: 0.15, rim: 0.12 });
    const matGrafito    = applyFortniteShader(createStylizedPBR(COLOR_GRAFITO_HEX, 0x000000, 0.10, 0.45, 0.35), { edge: 0.70, grad: 0.18, rim: 0.20 });
    const matTurquesa   = new THREE.MeshBasicMaterial({ color: COLOR_TURQUESA_HEX });

    // Protección anti-Z-fighting: sesgo de profundidad para relieves y líneas de borde
    matDorado.polygonOffset = true;
    matDorado.polygonOffsetFactor = -1.0;
    matDorado.polygonOffsetUnits = -2.0;

    matTurquesa.polygonOffset = true;
    matTurquesa.polygonOffsetFactor = -2.0;
    matTurquesa.polygonOffsetUnits = -4.0;

    matGrafito.polygonOffset = true;
    matGrafito.polygonOffsetFactor = -0.5;
    matGrafito.polygonOffsetUnits = -1.0;

    // ========================================================
    // 1. PIEZA: CUERPO (Chasis frontal y receptor en Rojo Oscuro)
    // Sin solapar con la recámara ni con la culata para evitar Z-fighting
    // ========================================================
    const cuerpo = new THREE.Group();
    cuerpo.name = 'cuerpo';

    const extrudeBevelShotgun = { depth: 0.082, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.008, bevelThickness: 0.008 };

    // Forma del chasis frontal y guardamanos: va desde x = -0.04 hasta x = 0.15 (no invade el bloque trasero)
    const chasisShape = new THREE.Shape();
    chasisShape.moveTo(-0.04, 0.105);             // Frente superior
    chasisShape.lineTo(0.15, 0.105);              // Hacia el recibidor (termina antes del bloque trasero)
    chasisShape.lineTo(0.15, -0.015);             // Bajada limpia hacia la cuna
    chasisShape.lineTo(0.06, -0.045);             // Chaflán biselado inferior
    chasisShape.lineTo(-0.04, -0.025);            // Morro inferior
    chasisShape.lineTo(-0.04, 0.105);

    // Ranuras de ventilación biseladas estilo cápsula en el guardamanos
    for (let i = 0; i < 2; i++) {
      const hPath = new THREE.Path();
      const hx = -0.01 + (i * 0.065);
      const hy = 0.045;
      hPath.moveTo(hx, hy);
      hPath.lineTo(hx + 0.040, hy);
      hPath.lineTo(hx + 0.040, hy + 0.022);
      hPath.lineTo(hx, hy + 0.022);
      hPath.lineTo(hx, hy);
      chasisShape.holes.push(hPath);
    }

    const chasisGeo = new THREE.ExtrudeGeometry(chasisShape, extrudeBevelShotgun);
    chasisGeo.translate(0, 0, -0.041);
    const chasisMesh = new THREE.Mesh(chasisGeo, matRojoOscuro);
    chasisMesh.name = 'chasisPrincipal';
    chasisMesh.rotation.y = -Math.PI / 2;
    chasisMesh.position.set(0, 0.02, -0.15);
    cuerpo.add(chasisMesh);

    // Hombreras superiores a 45° en rojo oscuro y borde dorado biselado
    for (let side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.022, 0.24), matRojoOscuro);
      shoulder.rotation.z = side * 0.78;
      shoulder.position.set(side * 0.044, 0.122, -0.12);
      
      const shoulderTrim = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.007, 0.24), matDorado);
      shoulderTrim.rotation.z = side * 0.78;
      shoulderTrim.position.set(side * 0.049, 0.131, -0.12);
      cuerpo.add(shoulder, shoulderTrim);
    }

    // Empuñadura táctica ergonómica en Negro Azulado con estrías y ribete de oro
    const gripCover = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.18, 0.070), matNegroAzul);
    gripCover.rotation.x = 0.35;
    gripCover.position.set(0, -0.11, 0.15);
    cuerpo.add(gripCover);

    // Estrías tácticas en la empuñadura
    for (let side of [-1, 1]) {
      for (let r = 0; r < 3; r++) {
        const gripRib = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, 0.052), matGrafito);
        gripRib.rotation.x = 0.35;
        gripRib.position.set(side * 0.033, -0.06 - r * 0.038, 0.13 + r * 0.014);
        cuerpo.add(gripRib);
      }
    }

    group.add(cuerpo);

    // ========================================================
    // 2. PIEZA: CULATA (Culata anatómica curva con PANEL HUNDIDO, LÍNEAS DORADAS y hueco de hombro)
    // ========================================================
    const culata = new THREE.Group();
    culata.name = 'culata';

    // Extrusión curvada esculpida: nace limpiamente en x = 0.22 (detrás del receptor)
    const culataShape = new THREE.Shape();
    culataShape.moveTo(0.22, 0.095);              // Salida del recibidor superior
    culataShape.lineTo(0.32, 0.095);              // Lomo recto
    culataShape.quadraticCurveTo(0.40, 0.085, 0.44, 0.055); // Caída anatómica para la mejilla
    culataShape.quadraticCurveTo(0.49, 0.045, 0.52, 0.015); // Cavidad cóncava para el hombro
    culataShape.quadraticCurveTo(0.53, -0.05, 0.49, -0.10); // Talón redondeado de la culata
    culataShape.lineTo(0.42, -0.10);              // Base de la cantonera
    culataShape.quadraticCurveTo(0.34, -0.04, 0.26, -0.03); // Alivio cóncavo inferior
    culataShape.lineTo(0.22, -0.03);              // Reingreso
    culataShape.closePath();

    const culataGeo = new THREE.ExtrudeGeometry(culataShape, { depth: 0.072, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    culataGeo.translate(0, 0, -0.036);
    const culataMesh = new THREE.Mesh(culataGeo, matRojoOscuro);
    culataMesh.name = 'culataEstructural';
    culataMesh.rotation.y = -Math.PI / 2;
    culataMesh.position.set(0, 0.02, -0.15);
    culata.add(culataMesh);

    // PANELES HUNDIDOS Y LÍNEAS DORADAS EN LA CULATA (Eliminan la superficie grande y lisa)
    for (let side of [-1, 1]) {
      // Panel lateral hundido en Negro Azulado
      const stockSunkenPanel = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.065, 0.12), matNegroAzul);
      stockSunkenPanel.position.set(side * 0.038, 0.035, 0.23);
      
      // Línea dorada de refuerzo perimetral que recorre el panel de la culata
      const stockGoldTrimTop = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, 0.124), matDorado);
      stockGoldTrimTop.position.set(side * 0.039, 0.068, 0.23);
      const stockGoldTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, 0.124), matDorado);
      stockGoldTrimBottom.position.set(side * 0.039, 0.002, 0.23);
      
      // Remaches grandes en la culata
      const stockRivet1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 8), matDorado);
      stockRivet1.rotation.z = Math.PI / 2;
      stockRivet1.position.set(side * 0.040, 0.035, 0.18);
      const stockRivet2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 8), matDorado);
      stockRivet2.rotation.z = Math.PI / 2;
      stockRivet2.position.set(side * 0.040, 0.035, 0.28);

      culata.add(stockSunkenPanel, stockGoldTrimTop, stockGoldTrimBottom, stockRivet1, stockRivet2);
    }

    // Cantonera gruesa engomada en Negro Azulado con curva de amortiguación
    const buttPadShape = new THREE.Shape();
    buttPadShape.moveTo(0.50, 0.025);
    buttPadShape.quadraticCurveTo(0.54, 0.005, 0.55, -0.04);
    buttPadShape.quadraticCurveTo(0.54, -0.085, 0.50, -0.105);
    buttPadShape.lineTo(0.45, -0.105);
    buttPadShape.lineTo(0.45, 0.025);
    buttPadShape.closePath();

    const buttPadGeo = new THREE.ExtrudeGeometry(buttPadShape, { depth: 0.076, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.006, bevelThickness: 0.006 });
    buttPadGeo.translate(0, 0, -0.038);
    const buttPadMesh = new THREE.Mesh(buttPadGeo, matNegroAzul);
    buttPadMesh.name = 'cantoneraGoma';
    buttPadMesh.rotation.y = -Math.PI / 2;
    buttPadMesh.position.set(0, 0.02, -0.15);
    culata.add(buttPadMesh);

    // Estrías de absorción de retroceso en la cantonera
    for (let r = 0; r < 3; r++) {
      const padRib = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.008, 0.008), matGrafito);
      padRib.position.set(0, -0.065 + (r * 0.035), 0.388);
      culata.add(padRib);
    }

    // Ribete de refuerzo dorado superior en la culata
    const stockRidgeGold = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.16), matDorado);
    stockRidgeGold.position.set(0, 0.110, 0.22);
    culata.add(stockRidgeGold);

    group.add(culata);

    // ========================================================
    // 3. PIEZA: PANEL (Bloque receptor con PANEL HUNDIDO, LÍNEAS DORADAS y RELOJ GRANDE LEGIBLE)
    // Dimensiones y posición sin solapar chasis ni culata (Clearance estricto en X y Z)
    // ========================================================
    const panel = new THREE.Group();
    panel.name = 'panel';

    // Bloque central del receptor en Negro Azulado (Z de 0.01 a 0.22, ancho X = 0.084)
    const receiverBlock = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.096, 0.21), matNegroAzul);
    receiverBlock.name = 'receiverBlock';
    receiverBlock.position.set(0, 0.076, 0.115);
    panel.add(receiverBlock);

    // Paneles laterales hundidos con marcos dorados y el RELOJ CHRONO
    for (let side of [-1, 1]) {
      // Panel hundido en Grafito Acero (X = side * 0.0435, sobresale 0.0015 del bloque)
      const sunkenPanel = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.076, 0.18), matGrafito);
      sunkenPanel.position.set(side * 0.0435, 0.076, 0.115);
      panel.add(sunkenPanel);

      // Líneas doradas de borde (X = side * 0.046, clearance físico de 0.0025 para cero Z-fighting)
      const goldTrimTop = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, 0.186), matDorado);
      goldTrimTop.position.set(side * 0.046, 0.114, 0.115);
      const goldTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, 0.186), matDorado);
      goldTrimBottom.position.set(side * 0.046, 0.038, 0.115);
      const goldTrimFront = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.076, 0.005), matDorado);
      goldTrimFront.position.set(side * 0.046, 0.076, 0.022);
      const goldTrimBack = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.076, 0.005), matDorado);
      goldTrimBack.position.set(side * 0.046, 0.076, 0.208);
      panel.add(goldTrimTop, goldTrimBottom, goldTrimFront, goldTrimBack);

      // SÍMBOLO DE RELOJ / ENGRANAJE CHRONO GRANDE Y LEGIBLE EN EL CENTRO
      // X = side * 0.049 (Clearance limpio de 0.003 sobre el marco dorado)
      const clockRadius = 0.034;
      const clockGear = new THREE.Mesh(new THREE.CylinderGeometry(clockRadius, clockRadius, 0.008, 16), matDorado);
      clockGear.name = 'relojChronoEngranaje_' + (side < 0 ? 'izq' : 'der');
      clockGear.rotation.z = Math.PI / 2;
      clockGear.position.set(side * 0.049, 0.076, 0.115);
      panel.add(clockGear);

      // 4 Barras cruzadas dobles (8 Dientes tridimensionales dorados fusionados, reduciendo draw calls)
      for (let g = 0; g < 4; g++) {
        const toothCross = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.082), matDorado);
        toothCross.rotation.x = (g * Math.PI) / 4;
        toothCross.position.set(side * 0.049, 0.076, 0.115);
        panel.add(toothCross);
      }

      // Aro exterior concéntrico dorado
      const clockBezel = new THREE.Mesh(new THREE.TorusGeometry(clockRadius + 0.003, 0.003, 8, 20), matDorado);
      clockBezel.rotation.y = Math.PI / 2;
      clockBezel.position.set(side * 0.050, 0.076, 0.115);
      panel.add(clockBezel);

      // Dial interior negro azabache
      const dialPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.009, 14), matNegroAzul);
      dialPlate.rotation.z = Math.PI / 2;
      dialPlate.position.set(side * 0.051, 0.076, 0.115);
      panel.add(dialPlate);

      // Manecillas de reloj en oro
      const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.013, 0.003), matDorado);
      hand1.position.set(side * 0.052, 0.082, 0.115);
      const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.003, 0.014), matDorado);
      hand2.position.set(side * 0.052, 0.076, 0.121);
      panel.add(hand1, hand2);

      // SEGUNDO PUNTO DE LUZ TURQUESA EMISIVO (Centro del dial de reloj)
      const clockCenterGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.010, 12), matTurquesa);
      clockCenterGlow.rotation.z = Math.PI / 2;
      clockCenterGlow.position.set(side * 0.053, 0.076, 0.115);
      panel.add(clockCenterGlow);
    }

    group.add(panel);

    // ========================================================
    // 4. PIEZA: TAMBOR (Cargador / Tambor rotatorio con ACENTO DORADO Y BANDA TURQUESA EN LA BASE)
    // ========================================================
    const tambor = new THREE.Group();
    tambor.name = 'tambor';

    // Tambor rotatorio macizo en Grafito Acero
    const drumCore = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.13, 20), matGrafito);
    drumCore.name = 'tamborCuerpo';
    drumCore.rotation.x = Math.PI / 2;
    drumCore.position.set(0, -0.015, -0.02);
    tambor.add(drumCore);

    // Bridas y collarines de sujeción en Dorado puro
    for (let pos of [-0.06, 0.06]) {
      const drumFlange = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.005, 8, 22), matDorado);
      drumFlange.position.set(0, -0.015, -0.02 + pos);
      tambor.add(drumFlange);
    }

    // 6 Cartuchos visibles con culotes metálicos dorados reflectantes
    for (let c = 0; c < 6; c++) {
      const angle = (c * Math.PI) / 3;
      const cx = Math.cos(angle) * 0.036;
      const cy = -0.015 + Math.sin(angle) * 0.036;

      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.12, 12), matRojoOscuro);
      shell.rotation.x = Math.PI / 2;
      shell.position.set(cx, cy, -0.02);

      const shellRim = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12), matDorado);
      shellRim.rotation.x = Math.PI / 2;
      shellRim.position.set(cx, cy, 0.04);

      tambor.add(shell, shellRim);
    }

    // Eje central de pivote con perno hexagonal masivo en Dorado
    const drumAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.15, 6), matDorado);
    drumAxle.rotation.x = Math.PI / 2;
    drumAxle.position.set(0, -0.015, -0.02);
    tambor.add(drumAxle);

    // Cuna de soporte inferior reforzada en Negro Azulado
    const drumBracket = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.024, 0.14), matNegroAzul);
    drumBracket.position.set(0, -0.075, -0.02);
    tambor.add(drumBracket);

    // ACENTOS EN LA PARTE BAJA (Para que no se pierda en el fondo oscuro):
    // 1) Placa protectora dorada inferior con relieve
    const drumBottomGold = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.006, 0.144), matDorado);
    drumBottomGold.position.set(0, -0.088, -0.02);
    tambor.add(drumBottomGold);

    // 2) Banda luminosa turquesa emisiva en el fondo del tambor
    const drumEnergyBand = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.008, 0.11), matTurquesa);
    drumEnergyBand.position.set(0, -0.092, -0.02);
    tambor.add(drumEnergyBand);

    group.add(tambor);

    // ========================================================
    // 5. PIEZA: REFUERZOS (Placas de blindaje con REMACHES GRANDES)
    // Rediseñado con clearance de 0.003 para cero Z-fighting y menos meshes
    // ========================================================
    const refuerzos = new THREE.Group();
    refuerzos.name = 'refuerzos';

    for (let side of [-1, 1]) {
      // Placa de blindaje lateral en Grafito Acero (X = side * 0.046)
      const plateSide = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.045, 0.14), matGrafito);
      plateSide.position.set(side * 0.046, 0.095, -0.07);
      refuerzos.add(plateSide);

      // 4 Remaches GRANDES y prominentes bien posicionados (X = side * 0.0495)
      const rivetPositions = [
        [-0.12, 0.105],
        [-0.03, 0.105],
        [-0.12, 0.080],
        [-0.03, 0.080]
      ];

      for (let [rz, ry] of rivetPositions) {
        const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.007, 8), matDorado);
        rivet.rotation.z = Math.PI / 2;
        rivet.position.set(side * 0.0495, ry, rz);
        refuerzos.add(rivet);
      }
    }

    // Placa de recámara superior en Grafito con costillas doradas
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.012, 0.20), matGrafito);
    topPlate.position.set(0, 0.124, -0.06);
    refuerzos.add(topPlate);

    for (let t = 0; t < 2; t++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.006, 0.018), matDorado);
      rib.position.set(0, 0.131, -0.11 + t * 0.10);
      refuerzos.add(rib);
    }

    group.add(refuerzos);

    // ========================================================
    // 6. PIEZA: CAÑO (Cañón doble ancho con bocas grandes y ANILLOS DE REFUERZO)
    // ========================================================
    const cano = new THREE.Group();
    cano.name = 'cano';

    const topBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.40, 18), matNegroAzul);
    topBarrel.name = 'canonSuperior';
    topBarrel.rotation.x = Math.PI / 2;
    topBarrel.position.set(0, 0.082, -0.27);
    cano.add(topBarrel);

    const bottomBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 18), matNegroAzul);
    bottomBarrel.name = 'canonInferior';
    bottomBarrel.rotation.x = Math.PI / 2;
    bottomBarrel.position.set(0, 0.034, -0.26);
    cano.add(bottomBarrel);

    // Bocas de cañón ensanchadas en Grafito con ánima oscura
    const topMuzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.025, 0.05, 18), matGrafito);
    topMuzzle.rotation.x = Math.PI / 2;
    topMuzzle.position.set(0, 0.082, -0.46);
    const topBore = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16), matNegroAzul);
    topBore.rotation.x = Math.PI / 2;
    topBore.position.set(0, 0.082, -0.48);
    cano.add(topMuzzle, topBore);

    const bottomMuzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.022, 0.045, 18), matGrafito);
    bottomMuzzle.rotation.x = Math.PI / 2;
    bottomMuzzle.position.set(0, 0.034, -0.44);
    const bottomBore = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), matNegroAzul);
    bottomBore.rotation.x = Math.PI / 2;
    bottomBore.position.set(0, 0.034, -0.46);
    cano.add(bottomMuzzle, bottomBore);

    // Anillos de refuerzo dobles macizos a lo largo de los cañones
    const ringPositions = [-0.18, -0.32, -0.42];
    for (let i = 0; i < ringPositions.length; i++) {
      const rz = ringPositions[i];
      const clampBlock = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.094, 0.024), matGrafito);
      clampBlock.position.set(0, 0.058, rz);
      
      const goldRingTop = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0045, 8, 18), matDorado);
      goldRingTop.position.set(0, 0.082, rz);
      const goldRingBottom = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 8, 18), matDorado);
      goldRingBottom.position.set(0, 0.034, rz);

      cano.add(clampBlock, goldRingTop, goldRingBottom);
    }

    // Corona frontal de energía temporal en la boca del cañón superior
    const muzzleEnergyRing = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.004, 8, 18), matTurquesa);
    muzzleEnergyRing.position.set(0, 0.082, -0.482);
    cano.add(muzzleEnergyRing);

    group.add(cano);

    // ========================================================
    // 7. PIEZA: VENTANA (VENTANA TURQUESA MUCHO MÁS GRANDE Y VISIBLE CON CÁPSULA EXPUESTA)
    // Ubicada hacia afuera (X = -0.050) y visible desde ambos lados y el lomo superior
    // ========================================================
    const ventana = new THREE.Group();
    ventana.name = 'ventana';

    // Núcleo cilíndrico de plasma temporal de alto calibre (centro luminoso resplandeciente)
    const plasmaCore = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 16), matTurquesa);
    plasmaCore.name = 'capsulaPlasmaCore';
    plasmaCore.rotation.x = Math.PI / 2;
    plasmaCore.position.set(0, 0.070, -0.08);
    ventana.add(plasmaCore);

    // Anillos magnéticos dorados de confinamiento alrededor del plasma
    for (let k of [-0.07, 0, 0.07]) {
      const magRing = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.0035, 8, 16), matDorado);
      magRing.position.set(0, 0.070, -0.08 + k);
      ventana.add(magRing);
    }

    // Ventanas luminosas translúcidas grandes en AMBOS laterales para total visibilidad en el suelo y en mano
    for (let side of [-1, 1]) {
      // Marco dorado ancho y biselado
      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.046, 0.19), matDorado);
      windowFrame.position.set(side * 0.048, 0.070, -0.08);
      ventana.add(windowFrame);

      // Gran cristal turquesa emisivo hiper-visible (sobresale limpiamente del chasis, cero clipping)
      const windowGlow = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.038, 0.17), matTurquesa);
      windowGlow.name = 'ventanaTurquesaGrande_' + (side < 0 ? 'izq' : 'der');
      windowGlow.position.set(side * 0.050, 0.070, -0.08);
      ventana.add(windowGlow);
    }

    // Cúpula superior de inspección en el lomo (visible desde la perspectiva del jugador ADS)
    const topDomeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.008, 0.15), matTurquesa);
    topDomeGlow.position.set(0, 0.134, -0.08);
    ventana.add(topDomeGlow);

    group.add(ventana);

    // ========================================================
    // 8. PIEZA: MIRA (Riel Picatinny reforzado y miras tácticas)
    // ========================================================
    const mira = new THREE.Group();
    mira.name = 'mira';

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.018, 0.38), matNegroAzul);
    topRail.position.set(0, 0.138, -0.04);
    mira.add(topRail);

    // 5 Ranuras tácticas anchas y robustas (menos meshes, más contundentes)
    for (let r = 0; r < 5; r++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.006, 0.016), matDorado);
      groove.position.set(0, 0.147, -0.16 + (r * 0.065));
      mira.add(groove);
    }

    // Alza de mira trasera robusta con punto turquesa
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.032, 0.040), matNegroAzul);
    rearSight.position.set(0, 0.152, 0.12);
    const sightDot = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.008), matTurquesa);
    sightDot.position.set(0, 0.163, 0.10);
    mira.add(rearSight, sightDot);

    // Punto de mira delantero sobre el cañón
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.022, 0.020), matDorado);
    frontSight.position.set(0, 0.118, -0.42);
    const frontDot = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.006), matTurquesa);
    frontDot.position.set(0, 0.126, -0.42);
    mira.add(frontSight, frontDot);

    group.add(mira);

    // ========================================================
    // 9. PIEZA: GATILLO (Guardamonte redondeado y gatillo deportivo en Oro)
    // ========================================================
    const gatillo = new THREE.Group();
    gatillo.name = 'gatillo';

    const guardLoop = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.005, 8, 16), matGrafito);
    guardLoop.position.set(0, -0.045, 0.10);
    guardLoop.rotation.y = Math.PI / 2;
    gatillo.add(guardLoop);

    const triggerBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.030, 8), matDorado);
    triggerBlade.name = 'triggerBlade';
    triggerBlade.rotation.x = 0.42;
    triggerBlade.position.set(0, -0.042, 0.10);
    gatillo.add(triggerBlade);

    group.add(gatillo);
  }

  global.buildShotgunMesh = buildShotgunMesh;
})(window);
