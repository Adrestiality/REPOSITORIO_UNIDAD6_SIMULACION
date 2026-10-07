/**
 * ============================================================================
 * MOTOR DE COREOGRAFÍA MUSICAL & LÍNEA DE TIEMPO (UNIDAD 6 - UPB)
 * ============================================================================
 * BTS — "Black Swan (Orchestral Instrumental)" (~3:18)
 * 
 * 12 Estados Coreografiados con Controladores Dedicados y Reutilizables:
 *  0. 0:00–0:18 — INK BIRTH (Nacimiento de Tinta)
 *  1. 0:18–0:38 — INK IN WATER (Tinta en Agua / Corrientes Fluidas)
 *  2. 0:38–0:58 — SWAN FLOCK (Bandada de Cisnes Blancos / Flocking)
 *  3. 0:58–1:18 — FEATHERS (Plumas & Humo de Incienso)
 *  4. 1:18–1:38 — CONTAMINATION (Contaminación / Espirales & Borgoña)
 *  5. 1:38–2:03 — CONVERGENCE (Convergencia hacia Vórtice con Vacío Central)
 *  6. 2:03–2:14 — BLACK HOLE (PRIMER CLÍMAX: Agujero Negro Vivo / Respiración / Vacío Central)
 *  7. 2:14–2:30 — FRAGMENTATION (Fragmentación & Fuga de Corrientes)
 *  8. 2:30–2:40 — BURGUNDY VEINS (Venas Borgoña / Redes Capilares)
 *  9. 2:40–2:55 — BLACK HOLE EXPLOSION (SEGUNDO CLÍMAX: Supernova Irregular & Rebote Gravitatorio)
 * 10. 2:55–3:08 — COLLAPSE (Colapso & Agotamiento Cinético)
 * 11. 3:08–3:18 — FINAL BREATH (Último Aliento / Quietud en Blanco Alabastro)
 * ============================================================================
 */

/**
 * ============================================================================
 * CONTROLADOR DEDICADO Y REUTILIZABLE: BLACK_HOLE (2:03)
 * ============================================================================
 * Dinámica:
 *  partículas → órbita → contracción → vacío → expansión → contracción → vacío
 * 
 * Características:
 *  - Radio dinámico controlable (`blackHoleRadius`).
 *  - Vacío central protegido (`innerVoidRadius`) que NUNCA es invadido (centro visiblemente vacío).
 *  - Anillo orgánico e imperfecto modulado por armónicos y turbulencia Perlin.
 *  - Distinción física explícita:
 *      * CONTRACCIÓN = Las partículas caen activamente hacia adentro con espiral relativista.
 *      * EXPANSIÓN = Las partículas orbitan hacia afuera con arrastre centrífugo.
 *  - Fuga ocasional de filamentos (~5-6%).
 */
class BlackHoleController {
  constructor() {
    this.blackHoleRadius = 220;
    this.innerVoidRadius = 120;
    this.isContracting = true;
    this.contractionPhase = 0; // 0, 1, 2
    this.phaseProgress = 0.0;
    this.suctionForce = 1.0;
    this.currentSpinSpeed = 1.0;
    this.shockwave = 0.0;
    this.lastImpactTime = 0.0;
    this.timeSinceImpact = 0.0;
    this.impactKeyframes = [162.4, 165.7, 168.9, 172.2];
    this.cycleIndex = 0;
  }

  reset() {
    this.blackHoleRadius = 220;
    this.innerVoidRadius = 120;
    this.isContracting = true;
    this.contractionPhase = 0;
    this.phaseProgress = 0.0;
    this.suctionForce = 1.0;
    this.currentSpinSpeed = 1.0;
    this.shockwave = 0.0;
    this.lastImpactTime = 0.0;
    this.timeSinceImpact = 0.0;
    this.cycleIndex = 0;
  }

  /**
   * Actualiza el ciclo de respiración y sincronización de impactos con la música (2:42)
   * @param {number} currentTime - Tiempo actual de la canción en segundos
   * @param {number} canvasMinDim - Dimensión mínima del viewport para escalado
   */
  update(currentTime, canvasMinDim = 800) {
    const scale = Math.min(1.35, Math.max(0.75, canvasMinDim / 850));

    // Detectar impactos clave sincronizados de la percusión orquestal
    for (let i = 0; i < this.impactKeyframes.length; i++) {
      const tKey = this.impactKeyframes[i];
      if (currentTime >= tKey && currentTime <= tKey + 0.35 && this.lastImpactTime < tKey) {
        this.shockwave = 2.8 + i * 0.4; // Contracción súbita e impacto violento
        this.lastImpactTime = tKey;
        this.cycleIndex = i + 1;
      }
    }

    let activeKey = 160.0;
    for (let i = 0; i < this.impactKeyframes.length; i++) {
      if (currentTime >= this.impactKeyframes[i]) {
        activeKey = this.impactKeyframes[i];
        this.cycleIndex = i + 1;
      }
    }

    this.timeSinceImpact = Math.max(0, currentTime - activeKey);

    // --- 1. PRE-IMPACTO (160.0s a 162.4s): Tensión creciente y contracción anticipatoria ---
    if (this.lastImpactTime < 162.4 && currentTime >= 160.0 && currentTime < 162.4) {
      const tensionP = (currentTime - 160.0) / 2.4; // 0.0 a 1.0
      const tensionEase = Math.pow(tensionP, 1.8);
      // Reducción progresiva del radio orbital e incremento notable de succión/tensión
      this.blackHoleRadius = (230 - (230 - 110) * tensionEase) * scale;
      this.isContracting = true;
      this.suctionForce = 1.2 + tensionEase * 2.5;
      this.currentSpinSpeed = 1.1 + tensionEase * 1.6;
      this.innerVoidRadius = Math.max(18 * scale, this.blackHoleRadius * 0.54);
      return;
    }

    // --- 2. CICLOS DE RESPIRACIÓN Y GOLPES DE CLÍMAX TRAS 162.4s ---
    if (this.cycleIndex <= 1) {
      // Ciclo 1 (162.4s - 165.7s): IMPACTO PRINCIPAL A 2:42.4
      this.contractionPhase = 0;
      const u = Math.max(0, Math.min(1.0, this.timeSinceImpact / 3.3));
      this.phaseProgress = u;

      if (u < 0.24) {
        // Contracción súbita violenta en el golpe exacto
        const p = u / 0.24;
        const snapEase = Math.pow(p, 0.7);
        this.blackHoleRadius = (110 - (110 - 52) * snapEase) * scale;
        this.isContracting = true;
        this.suctionForce = 3.2 + (1.0 - p) * 3.5;
        this.currentSpinSpeed = 2.4 + (1.0 - p) * 2.2;
      } else if (u < 0.70) {
        // Liberación explosiva / expansión inmediata tras el impacto
        const p = (u - 0.24) / 0.46;
        const expandEase = Math.sin(p * Math.PI * 0.5);
        this.blackHoleRadius = (52 + (195 - 52) * expandEase) * scale;
        this.isContracting = false;
        this.suctionForce = 0.5;
        this.currentSpinSpeed = 1.3 - expandEase * 0.35;
      } else {
        // Re-contracción gravitatoria suave
        const p = (u - 0.70) / 0.30;
        const ease = p * p;
        this.blackHoleRadius = (195 - (195 - 150) * ease) * scale;
        this.isContracting = true;
        this.suctionForce = 0.9 + ease * 0.6;
        this.currentSpinSpeed = 1.1 + ease * 0.4;
      }

    } else if (this.cycleIndex === 2) {
      // Ciclo 2 (165.7s - 168.9s): Segundo golpe de percusión
      this.contractionPhase = 1;
      const u = Math.max(0, Math.min(1.0, this.timeSinceImpact / 3.2));
      this.phaseProgress = u;

      if (u < 0.30) {
        const p = u / 0.30;
        const snapEase = Math.pow(p, 0.8);
        this.blackHoleRadius = (150 - (150 - 44) * snapEase) * scale;
        this.isContracting = true;
        this.suctionForce = 2.6 + (1.0 - p) * 2.2;
        this.currentSpinSpeed = 2.0 + (1.0 - p) * 1.5;
      } else if (u < 0.75) {
        const p = (u - 0.30) / 0.45;
        const expandEase = Math.sin(p * Math.PI * 0.5);
        this.blackHoleRadius = (44 + (165 - 44) * expandEase) * scale;
        this.isContracting = false;
        this.suctionForce = 0.6;
        this.currentSpinSpeed = 1.2 - expandEase * 0.25;
      } else {
        const p = (u - 0.75) / 0.25;
        this.blackHoleRadius = (165 - (165 - 135) * p) * scale;
        this.isContracting = true;
        this.suctionForce = 1.2;
        this.currentSpinSpeed = 1.3;
      }

    } else {
      // Ciclo 3 (168.9s - 175.5s): Tercer impacto y colapso extremo a singularidad
      this.contractionPhase = 2;
      const u = Math.max(0, Math.min(1.0, this.timeSinceImpact / 3.3));
      this.phaseProgress = u;

      const ease = Math.pow(u, 1.6);
      this.blackHoleRadius = (135 - (135 - 28) * ease) * scale;
      this.isContracting = true;
      this.suctionForce = 2.2 + ease * 3.8;
      this.currentSpinSpeed = 1.8 + ease * 2.5;
    }

    // Vacío central protegido: proporcional al radio dinámico (~54% del radio del anillo)
    // Garantiza que el centro esté SIEMPRE visiblemente vacío
    this.innerVoidRadius = Math.max(16 * scale, this.blackHoleRadius * 0.54);
    this.shockwave *= 0.88;
  }

  /**
   * Aplica cinemática de Agujero Negro sobre un agente individual (3 Capas Visuales)
   */
  applyForces(agent, isCleaner, cx, cy, audioData = {}) {
    const dx = agent.x - cx;
    const dy = agent.y - cy;
    const distCenter = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const angleCenter = Math.atan2(dy, dx);

    // --- 1. TRES CAPAS VISUALES VOLUMÉTRICAS (Requirement 7) ---
    // INNER LAYER (~32%): Partículas pequeñas y veloces trazando el horizonte del vacío
    // MIDDLE LAYER (~50%): Flujo orbital principal y venas densas de materia
    // OUTER LAYER (~18%): Halo exterior disperso con estelas más largas
    const layerSeed = (agent.seedOffset % 100) / 100.0;
    let targetLayerRadius = this.blackHoleRadius;
    let layerSpeedMult = 1.0;
    let layerSpiralTightness = 0.30;

    if (layerSeed < 0.32) {
      // INNER LAYER: Rápidas y ceñidas al vacío interior
      targetLayerRadius = this.innerVoidRadius * (1.08 + 0.16 * (layerSeed / 0.32));
      layerSpeedMult = 1.65;
      layerSpiralTightness = 0.42;
    } else if (layerSeed < 0.82) {
      // MIDDLE LAYER: Flujo principal
      const midT = (layerSeed - 0.32) / 0.50;
      targetLayerRadius = this.blackHoleRadius * (0.88 + 0.26 * midT);
      layerSpeedMult = 1.0;
      layerSpiralTightness = 0.28;
    } else {
      // OUTER LAYER: Halo disperso
      const outT = (layerSeed - 0.82) / 0.18;
      targetLayerRadius = this.blackHoleRadius * (1.30 + 0.45 * outT);
      layerSpeedMult = 0.68;
      layerSpiralTightness = 0.18;
    }

    // 2. ONDULACIÓN ORGÁNICA E IMPERFECTA DEL ANILLO (NO es un círculo geométrico)
    const harmonicA = Math.sin(3 * angleCenter + frameCount * 0.035) * 0.14;
    const harmonicB = Math.cos(5 * angleCenter - frameCount * 0.028) * 0.09;
    const harmonicC = Math.sin(7 * angleCenter + frameCount * 0.042) * 0.05;
    const inkTurbulence = (noise(agent.x * 0.004, agent.y * 0.004, frameCount * 0.003) - 0.5) * 0.28;
    const seedWobble = ((agent.seedOffset % 100) / 100.0 - 0.5) * 0.22;

    const organicRingRadius = targetLayerRadius * (1.0 + harmonicA + harmonicB + harmonicC + inkTurbulence + seedWobble);

    // 3. CAMPO REPULSIVO DE VACÍO CENTRAL PROTEGIDO
    // El centro DEBE permanecer visiblemente vacío: repele con fuerza cualquier partícula intrusa
    if (distCenter < this.innerVoidRadius) {
      const intrusion = 1.0 - (distCenter / this.innerVoidRadius);
      const repelForce = intrusion * intrusion * 6.5 + 2.0;
      agent.x += Math.cos(angleCenter) * repelForce;
      agent.y += Math.sin(angleCenter) * repelForce;
      agent.angle = angleCenter + (isCleaner ? -1 : 1) * (Math.PI / 2.0);
      return;
    }

    // 4. FUGITIVOS OCASIONALES (~5% de las partículas escapan tangencialmente)
    const isEscapee = (agent.seedOffset % 19 === 0);
    if (isEscapee) {
      const escapeAngle = angleCenter + (noise(agent.seedOffset, frameCount * 0.008) - 0.5) * 1.8;
      agent.x += Math.cos(escapeAngle) * 2.2;
      agent.y += Math.sin(escapeAngle) * 2.2;
      agent.angle = escapeAngle;
      return;
    }

    // 5. DISTINCIÓN CINEMÁTICA: CONTRACCIÓN vs EXPANSIÓN
    const radialDiff = distCenter - organicRingRadius;
    const spinDir = isCleaner ? -1 : 1;
    const shockImpulse = this.shockwave * 3.6;

    if (this.isContracting) {
      // --- CONTRACCIÓN = Las partículas caen activamente hacia adentro hacia el anillo ---
      const pullSpeed = Math.min(14.0, Math.max(0.6, radialDiff * 0.09 * this.suctionForce + 1.8 + shockImpulse));
      agent.x -= Math.cos(angleCenter) * pullSpeed;
      agent.y -= Math.sin(angleCenter) * pullSpeed;

      // Espiral cerrada relativista de alta velocidad tangencial
      const spiralInward = angleCenter + spinDir * (Math.PI / 2.0) - spinDir * (layerSpiralTightness + 0.12 * this.contractionPhase);
      const angleDiff = Math.atan2(Math.sin(spiralInward - agent.angle), Math.cos(spiralInward - agent.angle));
      agent.angle += angleDiff * (0.36 * this.currentSpinSpeed * layerSpeedMult);

      // Micro-turbulencia de tinta
      agent.angle += (noise(agent.x * 0.01, agent.y * 0.01, frameCount * 0.01) - 0.5) * 0.16;

    } else {
      // --- EXPANSIÓN = Las partículas orbitan hacia afuera con arrastre centrífugo ---
      const pushSpeed = Math.min(8.5, Math.max(-1.5, (organicRingRadius - distCenter) * 0.08 + 1.3 + shockImpulse * 0.4));
      agent.x += Math.cos(angleCenter) * pushSpeed;
      agent.y += Math.sin(angleCenter) * pushSpeed;

      // Espiral abierta y centrífuga
      const openCentrifugal = angleCenter + spinDir * (Math.PI / 2.0) + spinDir * (0.22 * layerSpeedMult);
      const angleDiff = Math.atan2(Math.sin(openCentrifugal - agent.angle), Math.cos(openCentrifugal - agent.angle));
      agent.angle += angleDiff * (0.32 * this.currentSpinSpeed * layerSpeedMult);

      // Ondulación de humo en expansión
      agent.angle += (noise(agent.x * 0.008, agent.y * 0.008, frameCount * 0.005) - 0.5) * 0.12;
    }
  }

  getParams() {
    return {
      blackHoleRadius: this.blackHoleRadius,
      innerVoidRadius: this.innerVoidRadius,
      isContracting: this.isContracting,
      phase: this.contractionPhase,
      progress: this.phaseProgress,
      shockwave: this.shockwave
    };
  }
}

/**
 * ============================================================================
 * CONTROLADOR DEDICADO Y REUTILIZABLE: BLACK_HOLE_EXPLOSION (2:03)
 * ============================================================================
 * Dinámica:
 *  EXPLOSIÓN IRREGULAR → DISPERSIÓN → REBOTE GRAVITATORIO → REFORMACIÓN DE VACÍO
 * 
 * Características:
 *  - Empieza con el vacío central rodeado de partículas.
 *  - Estallido irregular y heterogéneo: cada partícula recibe un impulso único
 *    (algunas viajan lejos, otras poco, algunas quedan atrapadas, formando estelas curvadas).
 *  - Contención dentro del lienzo: radio máximo individual entre 7 y 9 (sin tocar bordes).
 *  - Rebote gravitatorio: las partículas son atraídas de vuelta para reformar el vacío.
 *  - Repetición de impactos con inestabilidad creciente.
 *  - El ciclo final falla en reformar el agujero negro, dejando dispersión en calma.
 */
class BlackHoleExplosionController {
  constructor() {
    this.shockwave = 0.0;
    this.lastImpactTime = 0.0;
    this.cycleIndex = 0;
    this.timeSinceImpact = 0.0;
    this.impactKeyframes = [123.2, 126.8, 130.4];
    this.isBlastActive = false;
  }

  reset() {
    this.shockwave = 0.0;
    this.lastImpactTime = 0.0;
    this.cycleIndex = 0;
    this.timeSinceImpact = 0.0;
    this.isBlastActive = false;
  }

  triggerImpact(intensity = 1.0) {
    this.shockwave = 2.4 * intensity;
  }

  /**
   * Actualiza el estado cíclico de explosiones e impactos (2:03)
   * @param {number} currentTime - Tiempo actual de la canción en segundos
   */
  update(currentTime) {
    // Detectar impactos clave de la percusión orquestal en 2:03
    for (let i = 0; i < this.impactKeyframes.length; i++) {
      const tKey = this.impactKeyframes[i];
      if (currentTime >= tKey && currentTime <= tKey + 0.35 && this.lastImpactTime < tKey) {
        this.shockwave = 2.5 + i * 0.45; // Cada impacto es más violento
        this.lastImpactTime = tKey;
        this.cycleIndex = i + 1;
      }
    }

    // Calcular ciclo activo y tiempo transcurrido desde el último golpe
    let activeKey = 121.5;
    for (let i = 0; i < this.impactKeyframes.length; i++) {
      if (currentTime >= this.impactKeyframes[i]) {
        activeKey = this.impactKeyframes[i];
        this.cycleIndex = i + 1;
      }
    }

    this.timeSinceImpact = Math.max(0, currentTime - activeKey);
    this.isBlastActive = (currentTime >= 123.2 && this.timeSinceImpact < 1.15);

    // Decaimiento del pulso de choque
    this.shockwave *= 0.88;
  }

  /**
   * Aplica cinemática de Supernova / Explosión sobre un agente individual
   */
  applyForces(agent, isCleaner, cx, cy, audioData = {}) {
    const dx = agent.x - cx;
    const dy = agent.y - cy;
    const distCenter = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const angleCenter = Math.atan2(dy, dx);

    // 1. PRE-IMPACTO (121.5 a 123.2s): Formación del vacío pre-explosión
    if (this.lastImpactTime < 123.2) {
      const preVoid = Math.min(width, height) * 0.12;
      const rDiff = distCenter - preVoid;
      agent.x -= Math.cos(angleCenter) * rDiff * 0.09;
      agent.y -= Math.sin(angleCenter) * rDiff * 0.09;

      const preSwirl = angleCenter + (isCleaner ? -1 : 1) * (Math.PI / 2.0);
      agent.angle += Math.atan2(Math.sin(preSwirl - agent.angle), Math.cos(preSwirl - agent.angle)) * 0.45;
      return;
    }

    // 2. FASES DEL CICLO MUSICAL:
    // FASE A: EXPLOSIÓN & DISPERSIÓN IRREGULAR CONTENIDA (0.0s a ~1.15s tras cada impacto)
    // FASE B: ATRACCIÓN GRAVITATORIA & REFORMACIÓN DEL VACÍO (1.15s hasta el siguiente impacto)

    const seedVal = (agent.seedOffset % 1000) / 1000.0;
    const minCanvas = Math.min(width, height);
    const maxCanvasRadius = minCanvas * 0.48; // Escala 10 = borde de pantalla

    // Radio máximo individual aleatorizado para cada partícula entre 7 y 9 (0.70 a 0.88)
    const targetMaxRadius = maxCanvasRadius * (0.70 + 0.18 * seedVal + ((agent.seedOffset % 79) / 79.0 - 0.5) * 0.08);

    if (this.isBlastActive) {
      // --- ESTALLIDO IRREGULAR Y HETEROGÉNEO SIN CHOQUE CON BORDES ---
      const blastT = this.timeSinceImpact / 1.15;
      const blastDecay = Math.max(0, 1.0 - blastT * blastT);

      // Multiplicador de alcance heterogéneo
      const reachMultiplier = 0.30 + 1.8 * Math.pow(seedVal, 1.4);

      // Desviación angular y asimetría de chorro de tinta
      const angleDeviation = (noise(agent.seedOffset * 0.1, frameCount * 0.015) - 0.5) * 1.5;

      // Frenado suave al aproximarse al radio máximo individual (evita golpear paredes)
      const proximity = Math.min(1.0, distCenter / targetMaxRadius);
      const radialBrake = Math.max(0.0, 1.0 - Math.pow(proximity, 2.5));

      // Inestabilidad acumulativa por ciclo
      const cycleInstability = 1.0 + this.cycleIndex * 0.30;
      const blastSpeed = (this.shockwave * 7.5 + 4.0) * reachMultiplier * blastDecay * cycleInstability * radialBrake;

      const blastAngle = angleCenter + angleDeviation;
      agent.x += Math.cos(blastAngle) * blastSpeed;
      agent.y += Math.sin(blastAngle) * blastSpeed;

      // Curvatura de trazo de tinta disparada (forma estelas curvadas que giran antes del borde)
      const streakCurl = (seedVal > 0.48 ? 1 : -1) * (0.35 + seedVal * 0.45);
      agent.angle = blastAngle + streakCurl;

    } else {
      // --- ATRACCIÓN GRAVITATORIA DE RETORNO HACIA EL CENTRO & REFORMACIÓN DEL VACÍO ---
      if (this.cycleIndex >= 4) {
        const driftSpeed = 1.4;
        const turbulentField = noise(agent.x * 0.005, agent.y * 0.005, frameCount * 0.003) * TWO_PI * 1.8;
        agent.x += Math.cos(agent.angle) * driftSpeed;
        agent.y += Math.sin(agent.angle) * driftSpeed;
        agent.angle += Math.atan2(Math.sin(turbulentField - agent.angle), Math.cos(turbulentField - agent.angle)) * 0.16;
        return;
      }

      // Vacío reformado objetivo (crece ligeramente con cada ciclo debido a la inestabilidad)
      const reformedVoidRadius = minCanvas * (0.11 + 0.025 * this.cycleIndex);

      if (distCenter < reformedVoidRadius) {
        // Centro protegido (mantener vacío)
        const pushOut = (1.0 - distCenter / reformedVoidRadius) * 4.5 + 1.2;
        agent.x += Math.cos(angleCenter) * pushOut;
        agent.y += Math.sin(angleCenter) * pushOut;
      } else {
        // Potente atracción gravitatoria de retorno
        const pullFactor = Math.min(6.5, (distCenter / reformedVoidRadius) * 2.8 + 0.8);
        agent.x -= Math.cos(angleCenter) * pullFactor;
        agent.y -= Math.sin(angleCenter) * pullFactor;
      }

      // Re-alineación en vórtice orbital alrededor del vacío central
      const orbitDir = isCleaner ? -1 : 1;
      const swirlAngle = angleCenter + orbitDir * (Math.PI / 2.0);
      const angleDiff = Math.atan2(Math.sin(swirlAngle - agent.angle), Math.cos(swirlAngle - agent.angle));
      agent.angle += angleDiff * 0.38;
    }
  }

  getParams() {
    return {
      shockwave: this.shockwave,
      cycleIndex: this.cycleIndex,
      isBlastActive: this.isBlastActive,
      timeSinceImpact: this.timeSinceImpact
    };
  }
}

/**
 * ============================================================================
 * MOTOR PRINCIPAL DE COREOGRAFÍA & LÍNEA DE TIEMPO
 * ============================================================================
 */
class ChoreographyEngine {
  constructor() {
    // Controladores Dedicados para los Dos Grandes Clímax
    this.blackHoleController = new BlackHoleController();
    this.explosionController = new BlackHoleExplosionController();

    this.states = [
      {
        id: 0,
        roman: 'I',
        name: 'INK BIRTH',
        tag: '0:00 – 0:18',
        startTime: 0.0,
        endTime: 18.0,
        bg: { r: 245, g: 245, b: 245 }, // Fondo blanco alabastro
        targetCount: 65,
        targetCleaners: 20,
        speed: 1.5,
        depositRadius: 1.3,
        depositAlpha: 30,
        evaporationRate: 7.5, // 75%+ espacio negativo
        diffusionRate: 0.6,
        burgundyRatio: 0.0,   // Tinta negra pura y delicada
        theme: 'light',
        motionMode: 'birth',
        description: 'Nacimiento de tinta: expansión orgánica delicada desde el centro sobre blanco alabastro'
      },
      {
        id: 1,
        roman: 'II',
        name: 'INK IN WATER',
        tag: '0:18 – 0:38',
        startTime: 18.0,
        endTime: 38.0,
        bg: { r: 238, g: 238, b: 238 }, // Blanco acuoso
        targetCount: 95,
        targetCleaners: 25,
        speed: 2.2,
        depositRadius: 1.5,
        depositAlpha: 38,
        evaporationRate: 7.0, // 60%+ espacio negativo entre corrientes
        diffusionRate: 0.7,
        burgundyRatio: 0.05,  // Trazo inicial sutil de borgoña en agua
        theme: 'light',
        motionMode: 'streams',
        description: 'Tinta en agua: 3 ríos orgánicos con direcciones diferenciadas y amplio espacio negativo'
      },
      {
        id: 2,
        roman: 'III',
        name: 'SWAN FLOCK',
        tag: '0:38 – 0:58',
        startTime: 38.0,
        endTime: 58.0,
        bg: { r: 10, g: 10, b: 10 }, // Fondo negro profundo
        targetCount: 110,
        targetCleaners: 25,
        speed: 3.4,
        depositRadius: 1.7,
        depositAlpha: 45,
        evaporationRate: 7.8, // 60%+ espacio negativo
        diffusionRate: 0.45,
        burgundyRatio: 0.0,   // Cisnes blancos puros
        theme: 'dark_swan',
        motionMode: 'flock',
        description: 'Bandada de cisnes blancos: 3 grupos coordinados en vuelo sinuoso y ondulación alar'
      },
      {
        id: 3,
        roman: 'IV',
        name: 'SUSPENDED INK',
        tag: '0:58 – 1:18',
        startTime: 58.0,
        endTime: 78.0,
        bg: { r: 8, g: 8, b: 8 }, // Fondo negro
        targetCount: 85,
        targetCleaners: 20,
        speed: 1.3,
        depositRadius: 1.6,
        depositAlpha: 38,
        evaporationRate: 6.8, // 70%+ espacio negativo
        diffusionRate: 0.65,
        burgundyRatio: 0.04,  // Acento borgoña muy sutil
        theme: 'dark_ink',
        motionMode: 'suspended',
        description: 'Tinta suspendida: partículas flotando en agua con suave deriva y contención interior'
      },
      {
        id: 4,
        roman: 'V',
        name: 'CONTAMINATION',
        tag: '1:18 – 1:38',
        startTime: 78.0,
        endTime: 98.0,
        bg: { r: 16, g: 16, b: 16 }, // Carbón oscuro
        targetCount: 130,
        targetCleaners: 25,
        speed: 3.0,
        depositRadius: 1.9,
        depositAlpha: 50,
        evaporationRate: 7.5,
        diffusionRate: 0.55,
        burgundyRatio: 0.14, // Inicio sutil de racimos y venas borgoña
        theme: 'dark_ink',
        motionMode: 'contamination',
        description: 'Contaminación: vórtices gemelos entrelazados y primeras venas de tinta borgoña'
      },
      {
        id: 5,
        roman: 'VI',
        name: 'CONVERGENCE',
        tag: '1:38 – 2:03',
        startTime: 98.0,
        endTime: 123.0,
        bg: { r: 10, g: 10, b: 10 }, // Fondo oscuro
        targetCount: 155,
        targetCleaners: 25,
        speed: 3.8,
        depositRadius: 2.1,
        depositAlpha: 56,
        evaporationRate: 8.2,
        diffusionRate: 0.45,
        burgundyRatio: 0.16,
        theme: 'dark_ink',
        motionMode: 'convergence',
        description: 'Convergencia: succión hacia vórtice central preservando un ojo interior despejado'
      },
      {
        id: 6,
        roman: 'VII',
        name: 'BLACK HOLE EXPLOSION',
        tag: '2:03 – 2:14',
        startTime: 123.0,
        endTime: 134.0,
        bg: { r: 2, g: 2, b: 2 }, // Negro cósmico puro
        targetCount: 200,          // Conteo estable (180-240)
        targetCleaners: 25,
        speed: 6.8,
        depositRadius: 2.5,
        depositAlpha: 70,
        evaporationRate: 9.8,     // Disipación ultra-rápida de trazos viejos: estelas nítidas y espacio vacío
        diffusionRate: 0.35,
        burgundyRatio: 0.20,
        theme: 'dark_ink',
        motionMode: 'explosion',
        description: 'Primer Gran Clímax: supernova violenta irregular contenida dentro del lienzo y rebote gravitatorio'
      },
      {
        id: 7,
        roman: 'VIII',
        name: 'FRAGMENTATION',
        tag: '2:14 – 2:30',
        startTime: 134.0,
        endTime: 150.0,
        bg: { r: 8, g: 8, b: 8 }, // Fondo oscuro
        targetCount: 115,
        targetCleaners: 25,
        speed: 3.4,
        depositRadius: 1.9,
        depositAlpha: 46,
        evaporationRate: 8.2,
        diffusionRate: 0.55,
        burgundyRatio: 0.18,
        theme: 'dark_ink',
        motionMode: 'fragmentation',
        description: 'Fragmentación: las partículas escapan en corrientes desgarradas y filamentos turbulentos'
      },
      {
        id: 8,
        roman: 'IX',
        name: 'BURGUNDY VEINS',
        tag: '2:30 – 2:40',
        startTime: 150.0,
        endTime: 160.0,
        bg: { r: 6, g: 6, b: 6 }, // Fondo negro
        targetCount: 110,
        targetCleaners: 25,
        speed: 2.8,
        depositRadius: 1.8,
        depositAlpha: 52,
        evaporationRate: 7.8,
        diffusionRate: 0.5,
        burgundyRatio: 0.28, // Redes capilares ricas en borgoña
        theme: 'dark_ink',
        motionMode: 'veins',
        description: 'Venas borgoña: redes de ramificación capilar y bifurcación vascular orgánica'
      },
      {
        id: 9,
        roman: 'X',
        name: 'BLACK HOLE',
        tag: '2:40 – 2:55',
        startTime: 160.0,
        endTime: 175.5,
        bg: { r: 4, g: 4, b: 4 }, // Negro obsidiana profundo
        targetCount: 195,          // Rango estricto 180-240
        targetCleaners: 25,
        speed: 5.2,
        depositRadius: 2.3,
        depositAlpha: 64,
        evaporationRate: 9.0,     // Decaimiento continuo de trazos (45% espacio negativo)
        diffusionRate: 0.35,
        burgundyRatio: 0.18,      // Mayormente negro, ~18% borgoña contenida
        theme: 'dark_ink',
        motionMode: 'black_hole',
        description: 'Segundo Gran Clímax: agujero negro vivo con vacío central, respiración por contracción/expansión y turbulencia de tinta'
      },
      {
        id: 10,
        roman: 'XI',
        name: 'COLLAPSE',
        tag: '2:55 – 3:08',
        startTime: 175.5,
        endTime: 188.0,
        bg: { r: 8, g: 8, b: 8 }, // Fondo oscuro
        targetCount: 50,
        targetCleaners: 15,
        speed: 1.65,
        depositRadius: 2.4,       // Escala 1.5x a 1.8x para alta legibilidad de fragmentos pesados
        depositAlpha: 52,         // Tinta densa y claramente visible
        evaporationRate: 6.2,     // Estelas más perceptibles y largas
        diffusionRate: 0.60,
        burgundyRatio: 0.12,
        theme: 'dark_ink',
        motionMode: 'collapse',
        description: 'Colapso cinético: fragmentos pesados, exhaustos y claramente legibles con suave inercia gravitatoria'
      },
      {
        id: 11,
        roman: 'XII',
        name: 'FINAL BREATH',
        tag: '3:08 – 3:18+',
        startTime: 188.0,
        endTime: 215.0,
        bg: { r: 245, g: 245, b: 245 }, // Retorno a blanco alabastro
        targetCount: 55,          // Presencia amplia de 45-70 partículas con abundante espacio negativo
        targetCleaners: 15,
        speed: 0.75,              // Movimiento visible, calmado y pesado
        depositRadius: 2.8,       // Partículas sustancialmente más grandes (3–6 px, ocasionales 6–8 px)
        depositAlpha: 45,         // Claramente identificables a primera vista
        evaporationRate: 5.8,     // Estelas delicadas y perceptibles
        diffusionRate: 0.75,
        burgundyRatio: 0.0,
        theme: 'light',
        motionMode: 'still',
        description: 'Último aliento: fragmentos dispersos por todo el espacio con suave deriva sobre blanco alabastro'
      }
    ];

    // Estado activo
    this.currentTime = 0;
    this.currentStateIndex = 0;
    this.stateProgress = 0.0;
    this.manualOverride = false;
    this.manualStateIndex = 0;

    // Parámetros interpolados actuales
    this.currentBg = { r: 245, g: 245, b: 245 };
    this.currentParams = {
      speed: 1.6,
      depositRadius: 1.4,
      depositAlpha: 32,
      evaporationRate: 6.0,
      diffusionRate: 0.6,
      burgundyRatio: 0.08,
      targetCount: 75,
      targetCleaners: 25,
      theme: 'light',
      motionMode: 'birth'
    };
  }

  /**
   * Actualiza el motor de coreografía basado en el tiempo actual de la canción
   */
  update(currentTimeSeconds) {
    this.currentTime = Math.max(0, currentTimeSeconds || 0);

    // 1. Determinar el estado activo según el tiempo
    let activeIdx = 0;
    for (let i = 0; i < this.states.length; i++) {
      if (this.currentTime >= this.states[i].startTime) {
        activeIdx = i;
      }
    }

    if (this.manualOverride) {
      activeIdx = this.manualStateIndex;
    }

    this.currentStateIndex = activeIdx;
    const currState = this.states[activeIdx];
    const nextState = this.states[Math.min(this.states.length - 1, activeIdx + 1)];

    // 2. Calcular factor de interpolación suave (0.0 a 1.0)
    const duration = Math.max(0.1, currState.endTime - currState.startTime);
    const elapsed = this.currentTime - currState.startTime;
    const rawT = Math.min(1.0, Math.max(0.0, elapsed / duration));

    // Curva de transición suave en los últimos 2.5 segundos del estado
    const blendZone = 2.5;
    let blendT = 0.0;
    if (currState.endTime - this.currentTime < blendZone && activeIdx < this.states.length - 1) {
      const blendElapsed = blendZone - (currState.endTime - this.currentTime);
      blendT = Math.min(1.0, Math.max(0.0, blendElapsed / blendZone));
      blendT = 0.5 - 0.5 * Math.cos(blendT * Math.PI);
    }

    this.stateProgress = rawT;

    // 3. Interpolar parámetros de forma continua
    this.interpolateParameters(currState, nextState, blendT);

    // 4. Actualizar controladores dedicados de clímax (Swapped: Explosion en 2:03, Black Hole en 2:42)
    const canvasMinDim = typeof width !== 'undefined' ? Math.min(width, height) : 800;

    if (currState.motionMode === 'explosion' || activeIdx === 6 || (this.currentTime >= 121.5 && this.currentTime <= 134.0)) {
      this.explosionController.update(this.currentTime);
    }

    if (currState.motionMode === 'black_hole' || activeIdx === 9 || (this.currentTime >= 160.0 && this.currentTime <= 175.5)) {
      this.blackHoleController.update(this.currentTime, canvasMinDim);
    }
  }

  /**
   * Interpola suavemente todos los parámetros físicos y visuales entre dos estados
   */
  interpolateParameters(sA, sB, t) {
    const lerpVal = (a, b, fac) => a + (b - a) * fac;

    // Color de fondo
    this.currentBg.r = Math.round(lerpVal(sA.bg.r, sB.bg.r, t));
    this.currentBg.g = Math.round(lerpVal(sA.bg.g, sB.bg.g, t));
    this.currentBg.b = Math.round(lerpVal(sA.bg.b, sB.bg.b, t));

    // Parámetros de partículas
    this.currentParams.speed = lerpVal(sA.speed, sB.speed, t);
    this.currentParams.depositRadius = lerpVal(sA.depositRadius, sB.depositRadius, t);
    this.currentParams.depositAlpha = lerpVal(sA.depositAlpha, sB.depositAlpha, t);
    this.currentParams.evaporationRate = lerpVal(sA.evaporationRate, sB.evaporationRate, t);
    this.currentParams.diffusionRate = lerpVal(sA.diffusionRate, sB.diffusionRate, t);
    this.currentParams.burgundyRatio = lerpVal(sA.burgundyRatio, sB.burgundyRatio, t);
    this.currentParams.targetCount = Math.round(lerpVal(sA.targetCount, sB.targetCount, t));
    this.currentParams.targetCleaners = Math.round(lerpVal(sA.targetCleaners, sB.targetCleaners, t));
    this.currentParams.theme = t > 0.5 ? sB.theme : sA.theme;
    this.currentParams.motionMode = t > 0.5 ? sB.motionMode : sA.motionMode;
  }

  /**
   * Salto directo a un estado de la coreografía
   */
  jumpToState(stateIndex) {
    const idx = Math.max(0, Math.min(this.states.length - 1, stateIndex));
    this.manualOverride = false;
    this.manualStateIndex = idx;

    // Si se salta directamente al Estado 12 (Final Breath), distribuir ampliamente por el 70-85% del lienzo
    if (idx === 11 && typeof agents !== 'undefined' && agents.length > 0) {
      for (let i = 0; i < agents.length; i++) {
        agents[i].x = width * (0.12 + Math.random() * 0.76);
        agents[i].y = height * (0.12 + Math.random() * 0.76);
        agents[i].prevX = agents[i].x;
        agents[i].prevY = agents[i].y;
        agents[i].angle = Math.random() * Math.PI * 2;
      }
    } else if (idx === 3 && typeof agents !== 'undefined' && agents.length > 0) {
      // Estado 4 (Suspended Ink): distribuir en el 70-80% interior
      for (let i = 0; i < agents.length; i++) {
        agents[i].x = width * (0.15 + Math.random() * 0.70);
        agents[i].y = height * (0.15 + Math.random() * 0.70);
        agents[i].prevX = agents[i].x;
        agents[i].prevY = agents[i].y;
        agents[i].angle = Math.random() * Math.PI * 2;
      }
    }

    return this.states[idx].startTime;
  }

  /**
   * Aplica la cinemática correspondiente a cada modo de movimiento de la coreografía
   */
  applyChoreographyForces(agent, isCleaner, cx, cy, audioData = {}) {
    const mode = this.currentParams.motionMode;
    const dx = agent.x - cx;
    const dy = agent.y - cy;
    const distCenter = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const angleCenter = Math.atan2(dy, dx);

    // Contención suave de bordes de lienzo para evitar rayas artificiales
    const margin = 24;
    if (agent.x < margin) agent.x += (margin - agent.x) * 0.10;
    if (agent.x > width - margin) agent.x -= (agent.x - (width - margin)) * 0.10;
    if (agent.y < margin) agent.y += (margin - agent.y) * 0.10;
    if (agent.y > height - margin) agent.y -= (agent.y - (height - margin)) * 0.10;

    switch (mode) {
      // -----------------------------------------------------------------------
      // 0. INK BIRTH (0:00–0:18): Difusión orgánica de gota de tinta sobre blanco
      // -----------------------------------------------------------------------
      case 'birth': {
        const expandRadius = 15 + (this.currentTime / 18.0) * (Math.min(width, height) * 0.22);
        if (distCenter > expandRadius) {
          agent.x -= Math.cos(angleCenter) * 0.75;
          agent.y -= Math.sin(angleCenter) * 0.75;
        } else {
          agent.x += Math.cos(angleCenter) * 0.45;
          agent.y += Math.sin(angleCenter) * 0.45;
        }
        const curl = noise(agent.x * 0.004, agent.y * 0.004, frameCount * 0.003) * TWO_PI;
        agent.angle += Math.atan2(Math.sin(curl - agent.angle), Math.cos(curl - agent.angle)) * 0.14;
        break;
      }

      // -----------------------------------------------------------------------
      // 1. INK IN WATER (0:18–0:38): 3 Ríos / Corrientes Coreografiadas Diferentes
      // -----------------------------------------------------------------------
      case 'streams': {
        const riverId = (agent.seedOffset || 0) % 3;

        if (riverId === 0) {
          // Río 1: Corriente diagonal ascendente hacia arriba-derecha (~ -26°)
          const theta0 = -0.45;
          const centerline0 = -(agent.x - cx) * Math.sin(theta0) + (agent.y - (cy + height * 0.15)) * Math.cos(theta0);
          const wave0 = Math.sin(agent.x * 0.005 + frameCount * 0.015) * 36;
          const diff0 = centerline0 + wave0;

          // Atracción suave a la franja del río
          agent.x += -Math.sin(theta0) * (-diff0 * 0.038);
          agent.y += Math.cos(theta0) * (-diff0 * 0.038);

          // Vector de flujo
          const flowAngle0 = theta0 + Math.sin(agent.x * 0.004 + frameCount * 0.012) * 0.28;
          const angleDiff = Math.atan2(Math.sin(flowAngle0 - agent.angle), Math.cos(flowAngle0 - agent.angle));
          agent.angle += angleDiff * 0.25;

        } else if (riverId === 1) {
          // Río 2: Corriente diagonal descendente hacia abajo-derecha (~ +28°)
          const theta1 = 0.50;
          const centerline1 = -(agent.x - cx) * Math.sin(theta1) + (agent.y - (cy - height * 0.15)) * Math.cos(theta1);
          const wave1 = Math.cos(agent.x * 0.005 + frameCount * 0.014) * 36;
          const diff1 = centerline1 + wave1;

          agent.x += -Math.sin(theta1) * (-diff1 * 0.038);
          agent.y += Math.cos(theta1) * (-diff1 * 0.038);

          const flowAngle1 = theta1 + Math.cos(agent.x * 0.004 + frameCount * 0.014) * 0.26;
          const angleDiff = Math.atan2(Math.sin(flowAngle1 - agent.angle), Math.cos(flowAngle1 - agent.angle));
          agent.angle += angleDiff * 0.25;

        } else {
          // Río 3: Corriente sinuosa central que atraviesa hacia la izquierda (~ 170°)
          const targetY2 = cy + Math.sin(agent.x * 0.004 + frameCount * 0.016) * (height * 0.24);
          const diffY2 = targetY2 - agent.y;
          agent.y += diffY2 * 0.042;

          const flowAngle2 = Math.PI - 0.15 + Math.cos(agent.x * 0.004 + frameCount * 0.016) * 0.36;
          const angleDiff = Math.atan2(Math.sin(flowAngle2 - agent.angle), Math.cos(flowAngle2 - agent.angle));
          agent.angle += angleDiff * 0.25;
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 2. SWAN FLOCK (0:38–0:58): 3 bandadas de cisnes blancos con vuelo en ocho
      // -----------------------------------------------------------------------
      case 'flock': {
        const flockId = (agent.seedOffset || 0) % 3;
        const spanX = Math.min(width, height) * 0.36;
        const spanY = Math.min(width, height) * 0.22;
        const flockAngle = frameCount * 0.014 + flockId * (TWO_PI / 3);
        const targetFlockX = cx + Math.cos(flockAngle) * spanX;
        const targetFlockY = cy + Math.sin(flockAngle * 2.0) * spanY; // Trayectoria en 8 entrelazada

        const toFlockAngle = Math.atan2(targetFlockY - agent.y, targetFlockX - agent.x);
        const angleDelta = Math.atan2(Math.sin(toFlockAngle - agent.angle), Math.cos(toFlockAngle - agent.angle));
        agent.angle += angleDelta * 0.25;

        // Ondulación alar suave
        agent.y += Math.sin(frameCount * 0.07 + agent.x * 0.01) * 0.85;
        break;
      }

      // -----------------------------------------------------------------------
      // 3. SUSPENDED INK (0:58–1:18): Tinta suspendida en agua con suave deriva y contención
      // -----------------------------------------------------------------------
      case 'suspended':
      case 'feathers': {
        const noiseAngle = noise(
          agent.x * 0.0025 + (agent.seedOffset % 500) * 0.05,
          agent.y * 0.0025 + (agent.seedOffset % 500) * 0.05,
          frameCount * 0.0025
        ) * TWO_PI * 2.0;

        const angleDiff = Math.atan2(Math.sin(noiseAngle - agent.angle), Math.cos(noiseAngle - agent.angle));
        agent.angle += angleDiff * 0.07 + (noise(agent.seedOffset, frameCount * 0.008) - 0.5) * 0.06;

        // Contención natural dentro del 70-80% interior del lienzo (sin colisiones ni rebotes)
        const maxDistX = width * 0.38;
        const maxDistY = height * 0.38;
        const offsetX = agent.x - cx;
        const offsetY = agent.y - cy;

        if (Math.abs(offsetX) > maxDistX) {
          agent.x -= Math.sign(offsetX) * (Math.abs(offsetX) - maxDistX) * 0.035;
        }
        if (Math.abs(offsetY) > maxDistY) {
          agent.y -= Math.sign(offsetY) * (Math.abs(offsetY) - maxDistY) * 0.035;
        }

        // Suave giro hacia el interior si se acerca a la frontera (sin colisión)
        if (Math.abs(offsetX) > maxDistX * 0.85 || Math.abs(offsetY) > maxDistY * 0.85) {
          const toCenterAngle = Math.atan2(cy - agent.y, cx - agent.x);
          const inwardDiff = Math.atan2(Math.sin(toCenterAngle - agent.angle), Math.cos(toCenterAngle - agent.angle));
          agent.angle += inwardDiff * 0.04;
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 4. CONTAMINATION (1:18–1:38): Vórtices gemelos entrelazados y venas borgoña
      // -----------------------------------------------------------------------
      case 'contamination': {
        const isLeftVortex = (agent.seedOffset % 2 === 0);
        const vCenterDist = Math.min(width, height) * 0.20;
        const vx = cx + (isLeftVortex ? -vCenterDist : vCenterDist);
        const vy = cy;

        const vdx = agent.x - vx;
        const vdy = agent.y - vy;
        const vDist = Math.sqrt(vdx * vdx + vdy * vdy) + 0.001;
        const vAngle = Math.atan2(vdy, vdx);

        const targetRadius = Math.min(width, height) * 0.16;
        const diffR = vDist - targetRadius;
        agent.x -= Math.cos(vAngle) * diffR * 0.035;
        agent.y -= Math.sin(vAngle) * diffR * 0.035;

        const spinDir = isLeftVortex ? 1 : -1;
        const spiralAngle = vAngle + spinDir * (Math.PI / 2.0) - spinDir * 0.22;
        const angleDiff = Math.atan2(Math.sin(spiralAngle - agent.angle), Math.cos(spiralAngle - agent.angle));
        agent.angle += angleDiff * 0.28;
        break;
      }

      // -----------------------------------------------------------------------
      // 5. CONVERGENCE (1:38–2:03): Succión hacia núcleo con ojo central protegido
      // -----------------------------------------------------------------------
      case 'convergence': {
        const voidRadius = Math.min(width, height) * 0.11;
        if (distCenter < voidRadius) {
          // Mantener el centro despejado
          agent.x += Math.cos(angleCenter) * 3.6;
          agent.y += Math.sin(angleCenter) * 3.6;
        } else if (distCenter > voidRadius * 2.2) {
          // Succión hacia la corona
          agent.x -= Math.cos(angleCenter) * 2.6;
          agent.y -= Math.sin(angleCenter) * 2.6;
        }
        const orbitAngle = angleCenter + (isCleaner ? -1 : 1) * (Math.PI / 2.0);
        const angleDiff = Math.atan2(Math.sin(orbitAngle - agent.angle), Math.cos(orbitAngle - agent.angle));
        agent.angle += angleDiff * 0.32;
        break;
      }

      // -----------------------------------------------------------------------
      // 6. PRIMER CLÍMAX — 2:03: SUPERNOVA / EXPLOSIÓN (Swapped to 1st Climax)
      // -----------------------------------------------------------------------
      case 'explosion': {
        this.explosionController.applyForces(agent, isCleaner, cx, cy, audioData);
        break;
      }

      // -----------------------------------------------------------------------
      // 7. FRAGMENTATION (2:14–2:30): Desgarre y filamentos turbulentos fugitivos
      // -----------------------------------------------------------------------
      case 'fragmentation': {
        agent.x += Math.cos(angleCenter) * 2.0;
        agent.y += Math.sin(angleCenter) * 2.0;
        const turb = noise(agent.x * 0.007, agent.y * 0.007, frameCount * 0.007) * TWO_PI * 1.8;
        agent.angle += Math.atan2(Math.sin(turb - agent.angle), Math.cos(turb - agent.angle)) * 0.36;
        break;
      }

      // -----------------------------------------------------------------------
      // 8. BURGUNDY VEINS (2:30–2:40): Ramificación vascular y capilares orgánicos
      // -----------------------------------------------------------------------
      case 'veins': {
        const branchNoise = noise(agent.x * 0.012, agent.y * 0.012, frameCount * 0.004);
        const branchDir = branchNoise > 0.5 ? 0.65 : -0.65;
        const vascularAngle = angleCenter + branchDir;
        const angleDiff = Math.atan2(Math.sin(vascularAngle - agent.angle), Math.cos(vascularAngle - agent.angle));
        agent.angle += angleDiff * 0.30;
        break;
      }

      // -----------------------------------------------------------------------
      // 9. SEGUNDO CLÍMAX — 2:42: EL AGUJERO NEGRO VIVO (Swapped to 2nd Climax)
      // -----------------------------------------------------------------------
      case 'black_hole': {
        this.blackHoleController.applyForces(agent, isCleaner, cx, cy, audioData);
        break;
      }

      // -----------------------------------------------------------------------
      // 10. COLLAPSE (2:55–3:08): Fragmentos pesados, exhaustos y claramente visibles
      // -----------------------------------------------------------------------
      case 'collapse': {
        const heavyDrift = noise(agent.x * 0.0035, agent.y * 0.0035, frameCount * 0.002) * TWO_PI * 1.5;
        const angleDiff = Math.atan2(Math.sin(heavyDrift - agent.angle), Math.cos(heavyDrift - agent.angle));
        agent.angle += angleDiff * 0.07;

        // Inercia pesada con suave gravedad residual
        const slowPull = Math.min(0.75, distCenter * 0.0025);
        agent.x -= Math.cos(angleCenter) * slowPull;
        agent.y -= Math.sin(angleCenter) * slowPull;
        break;
      }

      // -----------------------------------------------------------------------
      // 11. FINAL BREATH (3:08–3:18+): Quietud y amplia dispersión sobre blanco alabastro
      // -----------------------------------------------------------------------
      case 'still':
      default: {
        // Deriva amplia, pesada y tranquila a través del 70-85% del lienzo
        const broadFlow = noise(
          agent.x * 0.0018 + (agent.seedOffset % 100) * 0.1,
          agent.y * 0.0018 + (agent.seedOffset % 100) * 0.1,
          frameCount * 0.0015
        ) * TWO_PI * 1.6;

        const angleDiff = Math.atan2(Math.sin(broadFlow - agent.angle), Math.cos(broadFlow - agent.angle));
        agent.angle += angleDiff * 0.04;

        // Suave dispersión hacia el 70-85% del lienzo si están muy concentradas
        if (distCenter < Math.min(width, height) * 0.22) {
          agent.x += Math.cos(angleCenter) * 0.45;
          agent.y += Math.sin(angleCenter) * 0.45;
        }

        // Contención suave en 85% del lienzo
        const maxBoundX = width * 0.42;
        const maxBoundY = height * 0.42;
        const offX = agent.x - cx;
        const offY = agent.y - cy;
        if (Math.abs(offX) > maxBoundX) agent.x -= Math.sign(offX) * (Math.abs(offX) - maxBoundX) * 0.02;
        if (Math.abs(offY) > maxBoundY) agent.y -= Math.sign(offY) * (Math.abs(offY) - maxBoundY) * 0.02;
        break;
      }
    }
  }

  /**
   * Métodos delegados para máxima compatibilidad
   */
  applyBlackHoleForces(agent, isCleaner, cx, cy, audioData) {
    this.blackHoleController.applyForces(agent, isCleaner, cx, cy, audioData);
  }

  applyExplosionForces(agent, isCleaner, cx, cy, audioData) {
    this.explosionController.applyForces(agent, isCleaner, cx, cy, audioData);
  }

  /**
   * Obtiene la información visual formateada para el HUD y el indicador de escena
   */
  getChoreographyInfo() {
    const currState = this.states[this.currentStateIndex] || this.states[0];
    return {
      id: currState.id,
      roman: currState.roman,
      name: currState.name,
      tag: currState.tag,
      description: currState.description,
      category: currState.roman,
      mode: currState.name,
      progress: Math.round(this.stateProgress * 100),
      targetCount: this.currentParams.targetCount,
      theme: this.currentParams.theme,
      isClimax: currState.motionMode === 'black_hole' || currState.motionMode === 'explosion'
    };
  }
}
