/**
 * ============================================================================
 * MOTOR DE COREOGRAFÍA MUSICAL - "BTS: BLACK SWAN (ORCHESTRAL)" (UNIDAD 6 - UPB)
 * ============================================================================
 * Narrativa Cósmica & Geometría Sagrada de 262 Beats:
 *  - 0:00 a 1:01: Mandalas Geométricas de Paz (Bajos) & Ondas Armónicas Majestuosas (Altos).
 *  - 1:01 a 2:03: Tensión Creciente & Ondas de Choque Sincronizadas (Alas del Cisne).
 *  - 2:03 a 2:42: EL AGUJERO NEGRO VIVO (Vórtice Palpitante que Respira y Modula su Radio).
 *  - 2:42 a 3:03: LA SUPERNOVA CÍCLICA (Múltiples Detonaciones & Rebote Gravitatorio).
 *  - 3:03 a 3:30: Descenso Etéreo en Silencio Alabastro.
 * ============================================================================
 */

class ChoreographyEngine {
  constructor() {
    this.beats = [];
    this.parseAllBeats();

    // Estado continuo
    this.currentTime = 0;
    this.activeCategory = 'super_low';
    this.categoryName = 'SÚPER BAJO';
    this.intensityWeight = 0.2;
    this.targetIntensity = 0.2;
    this.regime = 0.0;

    // Fases Narrativas Cósmicas
    this.isBlackHole = false;   // 2:03 - 2:42 (Vórtice vivo de succión)
    this.isSupernova = false;   // 2:42 - 3:03 (Supernova cíclica con re-explosiones)
    this.supernovaProgress = 0.0;
    this.shockwave = 0.0;
    this.recoilCycle = 0.0;
    this.beatPulseInstant = 0.0;
    this.lastTime = 0;

    // Paleta 100% Monocromática Pura en Escala de Grises (R = G = B, Sin Azul)
    this.bgAlabaster = { r: 245, g: 245, b: 245 }; // Blanco Alabastro Puro
    this.bgSilverAsh = { r: 195, g: 195, b: 195 }; // Ceniza Plateada Neutra
    this.bgTitanium  = { r: 40,  g: 40,  b: 40  }; // Titanio Grafito Neutro
    this.bgObsidian  = { r: 6,   g: 6,   b: 6   }; // Negro Obsidiana Cósmico
    this.currentBg   = { ...this.bgAlabaster };

    this.mandalaAngleOffset = 0;
    this.wavePhase = 0;
  }

  timeToSeconds(str) {
    const parts = str.trim().split(':');
    const min = parseFloat(parts[0]);
    const sec = parseFloat(parts[1]);
    return min * 60 + sec;
  }

  parseAllBeats() {
    const rawData = {
      very_high: [
        '1:01.8', '2:03.2', '2:08.1', '2:16.3', '2:18.7', '2:19.6', '2:21.2', '2:22.8',
        '2:24.5', '2:27.7', '2:28.3', '2:32.2', '2:35.9', '2:37.5', '2:40.0', '2:42.4',
        '2:43.2', '2:44.0', '2:45.7', '2:47.3', '2:48.9', '2:49.7', '2:51.4', '2:52.2',
        '2:53.8', '2:54.6'
      ],
      high: [
        '0:17.7', '0:18.5', '0:19.3', '0:20.9', '0:25.8', '0:29.1', '0:30.8', '0:31.6',
        '0:32.4', '0:34.0', '0:38.9', '0:42.2', '0:43.8', '0:44.6', '0:45.4', '0:47.1',
        '0:52.0', '0:55.2', '0:58.5', '1:00.1', '1:05.0', '1:06.7', '1:14.8', '1:18.1',
        '1:19.7', '2:04.8', '2:05.7', '2:06.5', '2:09.8', '2:11.4', '2:12.2', '2:13.0',
        '2:14.6', '2:17.1', '2:20.4', '2:22.0', '2:23.6', '2:26.1', '2:30.7', '2:34.3',
        '2:35.1', '2:40.8', '2:41.6', '2:44.9', '2:46.5', '2:48.1', '2:50.6', '2:53.0',
        '2:55.5', '2:56.3', '2:57.1', '2:58.8', '3:01.2'
      ],
      mid: [
        '0:00.2', '0:03.4', '0:06.6', '0:09.8', '0:16.0', '0:22.6', '0:23.3', '0:24.2',
        '0:25.0', '0:27.5', '0:29.9', '0:34.8', '0:35.6', '0:36.4', '0:37.3', '0:38.1',
        '0:40.5', '0:41.4', '0:48.7', '0:50.3', '0:51.2', '0:53.6', '0:54.4', '0:56.9',
        '0:57.7', '1:03.4', '1:04.2', '1:08.3', '1:09.1', '1:09.9', '1:10.7', '1:11.6',
        '1:12.4', '1:13.2', '1:14.0', '1:15.6', '1:16.5', '1:17.3', '1:18.9', '1:20.5',
        '1:21.4', '1:22.2', '1:23.0', '1:26.3', '1:27.9', '1:28.7', '1:31.1', '1:33.5',
        '1:38.2', '1:41.4', '1:43.1', '1:46.3', '1:52.3', '1:53.2', '1:54.6', '1:56.6',
        '1:59.8', '2:01.0', '2:04.0', '2:08.9', '2:10.6', '2:13.8', '2:15.5', '2:17.9',
        '2:25.3', '2:26.9', '2:29.1', '2:31.4', '2:33.6', '2:36.6', '2:39.1', '2:57.9',
        '2:59.6', '3:00.4', '3:02.0', '3:06.0', '3:15.1', '3:23.8', '3:24.6'
      ],
      low: [
        '0:05.0', '0:05.7', '0:08.3', '0:11.3', '0:12.1', '0:12.9', '0:13.7', '0:14.5',
        '0:15.3', '0:16.9', '0:20.1', '0:21.8', '0:26.6', '0:28.3', '0:33.2', '0:39.7',
        '0:46.3', '0:47.9', '0:56.1', '0:59.3', '1:01.0', '1:02.6', '1:05.8', '1:07.5',
        '1:23.8', '1:24.6', '1:25.4', '1:27.0', '1:29.5', '1:30.3', '1:31.9', '1:32.8',
        '1:34.2', '1:35.1', '1:35.8', '1:36.5', '1:39.8', '1:40.6', '1:42.3', '1:44.0',
        '1:44.8', '1:47.9', '1:48.7', '1:49.5', '1:50.2', '1:51.0', '1:56.0', '2:07.3',
        '2:29.9', '2:32.9', '2:38.3', '3:02.8', '3:05.1', '3:06.9', '3:08.6', '3:09.4',
        '3:10.2', '3:11.0', '3:12.6', '3:13.4', '3:14.3', '3:17.5', '3:18.3', '3:19.9',
        '3:25.4'
      ],
      super_low: [
        '0:01.1', '0:01.9', '0:02.6', '0:04.2', '0:07.5', '0:09.1', '0:10.6', '0:43.0',
        '0:49.5', '0:52.8', '1:37.4', '1:39.0', '1:45.6', '1:47.0', '1:51.6', '1:53.9',
        '1:55.3', '1:57.4', '1:58.2', '1:59.0', '2:01.7', '2:02.4', '3:03.5', '3:04.3',
        '3:07.7', '3:11.8', '3:15.9', '3:16.7', '3:19.1', '3:20.6', '3:21.4', '3:22.1',
        '3:23.0', '3:26.1', '3:26.9', '3:27.7', '3:28.5', '3:29.3', '3:30.0'
      ]
    };

    const categoryLevels = {
      super_low: { name: 'SÚPER BAJO', index: 0, weight: 0.15 },
      low:       { name: 'BAJO',       index: 1, weight: 0.35 },
      mid:       { name: 'INTERMEDIO', index: 2, weight: 0.65 },
      high:      { name: 'ALTO',       index: 3, weight: 0.88 },
      very_high: { name: 'MUY ALTO',   index: 4, weight: 1.00 }
    };

    this.beats = [];

    for (const [catKey, timeArr] of Object.entries(rawData)) {
      const catInfo = categoryLevels[catKey];
      for (const timeStr of timeArr) {
        this.beats.push({
          time: this.timeToSeconds(timeStr),
          catKey: catKey,
          name: catInfo.name,
          index: catInfo.index,
          weight: catInfo.weight
        });
      }
    }

    this.beats.sort((a, b) => a.time - b.time);
  }

  update(currentTimeSeconds) {
    this.currentTime = Math.max(0, currentTimeSeconds || 0);

    // --- 1. DETECCIÓN DE FASES NARRATIVAS CÓSMICAS ---
    // A. 2:03 a 2:42 -> EL AGUJERO NEGRO VIVO (Singularidad / Succión dinámica)
    this.isBlackHole = (this.currentTime >= 123.0 && this.currentTime < 162.2);

    // B. 2:42 a 3:03 -> LA SUPERNOVA CÍCLICA (Big Bang / Multi-explosiones)
    this.isSupernova = (this.currentTime >= 162.2 && this.currentTime < 183.0);

    if (this.isSupernova) {
      this.supernovaProgress = Math.min(1.0, (this.currentTime - 162.2) / 20.0);
    } else {
      this.supernovaProgress = 0.0;
    }

    // Detección del beat activo más cercano
    let activeBeat = this.beats[0];
    let minDiff = 999;

    for (let i = 0; i < this.beats.length; i++) {
      const diff = this.currentTime - this.beats[i].time;
      if (diff >= -0.05 && diff < minDiff) {
        activeBeat = this.beats[i];
        minDiff = Math.abs(diff);
      } else if (this.beats[i].time > this.currentTime + 0.1) {
        break;
      }
    }

    // Impacto de beat instantáneo
    if (minDiff < 0.12) {
      this.beatPulseInstant = 1.0;
      if (this.isSupernova) {
        // En Supernova: Cada beat fuerte genera una nueva explosión expansiva
        this.shockwave = 1.6;
        this.recoilCycle = 0.0;
      }
    } else {
      this.beatPulseInstant *= 0.82;
    }

    if (this.isSupernova) {
      this.shockwave *= 0.86;
      this.recoilCycle = Math.min(1.0, this.recoilCycle + 0.035);
    }

    this.activeCategory = activeBeat.catKey;
    this.categoryName = activeBeat.name;

    this.targetIntensity = activeBeat.weight;
    if (this.isBlackHole || this.isSupernova) {
      this.targetIntensity = Math.max(this.targetIntensity, 0.95);
    }

    this.intensityWeight = this.intensityWeight * 0.72 + this.targetIntensity * 0.28;
    this.regime = (this.isBlackHole || this.isSupernova) ? 1.0 : (this.intensityWeight > 0.50 ? 0.80 : 0.0);

    this.mandalaAngleOffset += 0.024 * (1.0 + this.intensityWeight * 2.0);
    this.wavePhase += 0.045 * (1.0 + this.intensityWeight * 1.8);

    this.updateCanvasColor();
  }

  /**
   * Actualiza el fondo en Escala de Grises 100% Pura (R = G = B)
   */
  updateCanvasColor() {
    if (this.isBlackHole || this.isSupernova) {
      this.currentBg.r = this.bgObsidian.r;
      this.currentBg.g = this.bgObsidian.g;
      this.currentBg.b = this.bgObsidian.b;
      return;
    }

    if (this.intensityWeight < 0.30) {
      const t = this.intensityWeight / 0.30;
      const v = Math.round(this.bgAlabaster.r * (1 - t) + this.bgSilverAsh.r * t);
      this.currentBg.r = v; this.currentBg.g = v; this.currentBg.b = v;
    } else if (this.intensityWeight < 0.65) {
      const t = (this.intensityWeight - 0.30) / 0.35;
      const v = Math.round(this.bgSilverAsh.r * (1 - t) + this.bgTitanium.r * t);
      this.currentBg.r = v; this.currentBg.g = v; this.currentBg.b = v;
    } else {
      const t = Math.min(1.0, (this.intensityWeight - 0.65) / 0.35);
      const v = Math.round(this.bgTitanium.r * (1 - t) + this.bgObsidian.r * t);
      this.currentBg.r = v; this.currentBg.g = v; this.currentBg.b = v;
    }
  }

  getAttractorNodes(cx, cy) {
    const spanX = Math.min(width, height) * 0.42;
    return [
      { id: 0, x: cx, y: cy, type: 'center' },
      { id: 1, x: cx - spanX, y: cy, type: 'left_satellite' },
      { id: 2, x: cx + spanX, y: cy, type: 'right_satellite' }
    ];
  }

  /**
   * Aplica cinemática viva:
   *  - 2:03 a 2:42: Agujero Negro con Respiración Viva de Radio.
   *  - 2:42 a 3:03: Supernova con Detonaciones Sucesivas y Rebote Gravitatorio.
   *  - < 2:03: Beats bajos = Paz/Mandalas suaves; Beats altos = Ondas majestuosas y mandalas geométricas perfectas.
   */
  applyChoreographyForces(agent, isCleaner, cx, cy, audioData = {}) {
    const dx = agent.x - cx;
    const dy = agent.y - cy;
    const distCenter = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const angleCenter = Math.atan2(dy, dx);

    // Latido orgánico continuo
    const phase = (audioData && audioData.heartbeatPhase !== undefined) ? audioData.heartbeatPhase : (frameCount * 0.08);
    const heartPulse = Math.pow(Math.max(0, Math.sin(phase)), 4);

    // =========================================================================
    // FASE 1: EL AGUJERO NEGRO VIVO (Minuto 2:03 a 2:42)
    // El radio respira, se contrae y se expande con los beats (Vórtice Vivo)
    // =========================================================================
    if (this.isBlackHole) {
      // Oscilación macroscópica de respiración (3.2s) + pulsación por beats
      const macroBreathing = Math.sin(this.currentTime * 2.1) * 0.5 + 0.5; // 0.0 a 1.0
      const instantBeatContract = this.beatPulseInstant; // 1.0 en golpe -> contracción instantánea

      // Radio dinámico que oscila entre 30px (máxima compresión) y 220px (expansión viva)
      const minRadius = 30;
      const maxRadius = Math.min(width, height) * 0.28;
      const dynamicEventHorizon = minRadius + (maxRadius - minRadius) * (macroBreathing * 0.70 + (1.0 - instantBeatContract) * 0.30);

      // Succión hacia el horizonte dinámico
      const radialDelta = distCenter - dynamicEventHorizon;
      const suctionStrength = Math.min(12.0, Math.max(-6.0, (radialDelta / dynamicEventHorizon) * 6.0 + 2.5));

      agent.x -= Math.cos(angleCenter) * suctionStrength;
      agent.y -= Math.sin(angleCenter) * suctionStrength;

      // Giro de vórtice relativista
      const spinDir = isCleaner ? -1 : 1;
      const spiralInward = 0.40 + instantBeatContract * 0.35;
      const vortexAngle = angleCenter + spinDir * (Math.PI / 2.0) - (spinDir * spiralInward);
      const angleDelta = Math.atan2(Math.sin(vortexAngle - agent.angle), Math.cos(vortexAngle - agent.angle));
      agent.angle += angleDelta * (0.45 + instantBeatContract * 0.30);

      // Fluctuación cuántica suave en el núcleo
      if (distCenter < dynamicEventHorizon * 0.8) {
        agent.angle += (Math.random() - 0.5) * 0.5;
      }
      return;
    }

    // =========================================================================
    // FASE 2: LA SUPERNOVA CÍCLICA (Minuto 2:42 a 3:03 - BIG BANG REPETITIVO)
    // Explota con violencia -> Se vuelve a contraer al centro -> Vuelve a explotar
    // =========================================================================
    if (this.isSupernova) {
      if (this.shockwave > 0.15) {
        // --- DETONACIÓN EXPANSIVA EXPLOSIVA ---
        const blastKick = this.shockwave * (isCleaner ? 22.0 : 18.0);
        agent.x += Math.cos(angleCenter) * blastKick;
        agent.y += Math.sin(angleCenter) * blastKick;
        agent.angle = angleCenter + (Math.random() - 0.5) * 0.3;
      } else {
        // --- REBOTE GRAVITATORIO: REAGRUPARSE EN EL CENTRO ---
        const recoilCoreRadius = Math.min(width, height) * 0.14;
        const recoilPull = (distCenter > recoilCoreRadius) ? Math.min(5.5, (distCenter / recoilCoreRadius) * 2.8) : -1.5;

        agent.x -= Math.cos(angleCenter) * recoilPull;
        agent.y -= Math.sin(angleCenter) * recoilPull;

        // Filamentos en espiral cósmica ondulante
        const plasmaWave = Math.sin(distCenter * 0.03 - this.wavePhase * 2.0) * 0.45;
        const orbitAngle = angleCenter + (isCleaner ? -1 : 1) * (Math.PI / 2.0) + plasmaWave;
        const angleDiff = Math.atan2(Math.sin(orbitAngle - agent.angle), Math.cos(orbitAngle - agent.angle));
        agent.angle += angleDiff * 0.35;
      }
      return;
    }

    // =========================================================================
    // FASE 3: COREOGRAFÍAS ANTES DE 2:03 (Evolución según categoría de beat)
    // =========================================================================
    const nodes = this.getAttractorNodes(cx, cy);
    if (agent.targetNodeId === undefined) {
      agent.targetNodeId = Math.random() < 0.35 ? 1 : (Math.random() < 0.5 ? 2 : 0);
    }

    const activeNode = nodes[agent.targetNodeId] || nodes[0];
    const nDx = agent.x - activeNode.x;
    const nDy = agent.y - activeNode.y;
    const distNode = Math.sqrt(nDx * nDx + nDy * nDy) + 0.001;
    const angleNode = Math.atan2(nDy, nDx);

    // Contención suave de pantalla
    const margin = 20;
    if (agent.x < margin) agent.x += (margin - agent.x) * 0.12;
    if (agent.x > width - margin) agent.x -= (agent.x - (width - margin)) * 0.12;
    if (agent.y < margin) agent.y += (margin - agent.y) * 0.12;
    if (agent.y > height - margin) agent.y -= (agent.y - (height - margin)) * 0.12;

    const isHighOrVeryHigh = (this.activeCategory === 'high' || this.activeCategory === 'very_high');

    if (isHighOrVeryHigh) {
      // -----------------------------------------------------------------------
      // BEATS ALTOS Y MUY ALTOS: MAJESTUOSIDAD & ONDAS GEOMÉTRICAS ARMÓNICAS
      // (Mandalas de alta simetría k=12, ondas sinusoidales majestuosas tipo alas de cisne)
      // -----------------------------------------------------------------------
      const symmetryK = isCleaner ? 6 : 12; // Geometría sagrada perfecta
      const sacredRadius = Math.min(width, height) * (0.24 + 0.12 * Math.cos(symmetryK * angleNode + this.mandalaAngleOffset));
      
      // Ondas sinusoidales de choque radial
      const waveRipple = Math.sin(distNode * 0.04 - this.wavePhase * 3.0) * (isCleaner ? 18 : 26);
      const targetRadius = Math.max(30, sacredRadius + waveRipple);

      const radialDiff = (targetRadius - distNode);
      const pullSpeed = Math.min(6.5, Math.max(-6.5, radialDiff * 0.08));
      agent.x += Math.cos(angleNode) * pullSpeed;
      agent.y += Math.sin(angleNode) * pullSpeed;

      // Orientación orbital majestuosa en ondas armónicas
      const spinDir = isCleaner ? -1 : 1;
      const harmonicTangent = angleNode + spinDir * (Math.PI / 2.0) + Math.sin(angleNode * symmetryK) * 0.35;
      const angleDiff = Math.atan2(Math.sin(harmonicTangent - agent.angle), Math.cos(harmonicTangent - agent.angle));
      agent.angle += angleDiff * (0.35 + this.beatPulseInstant * 0.25);

    } else if (this.activeCategory === 'mid') {
      // -----------------------------------------------------------------------
      // BEATS INTERMEDIOS: ONDAS FLUIDAS EN MEANDROS & ALAS SINCRONIZADAS
      // -----------------------------------------------------------------------
      const waveFreq = 0.012;
      const waveAmp = 40.0;
      const sinWaveOffset = Math.sin(agent.x * waveFreq + this.wavePhase) * waveAmp;

      const targetOrbRadius = Math.min(width, height) * 0.26 + sinWaveOffset;
      const radialDiff = distNode - targetOrbRadius;
      if (Math.abs(radialDiff) > 15) {
        const move = Math.min(3.5, radialDiff * 0.05);
        agent.x -= Math.cos(angleNode) * move;
        agent.y -= Math.sin(angleNode) * move;
      }

      const spinDir = isCleaner ? -1 : 1;
      const vortexAngle = angleNode + spinDir * (Math.PI / 2.0) + Math.cos(agent.y * 0.015 + this.wavePhase) * 0.40;
      const angleDelta = Math.atan2(Math.sin(vortexAngle - agent.angle), Math.cos(vortexAngle - agent.angle));
      agent.angle += angleDelta * 0.26;

    } else {
      // -----------------------------------------------------------------------
      // BEATS BAJOS / SÚPER BAJOS: PAZ, SERENIDAD & MANDALAS BOTÁNICAS SUAVES
      // -----------------------------------------------------------------------
      if (activeNode.id === 0) {
        // Orbe central sereno y respirante
        const peacefulRadius = Math.min(width, height) * (0.20 + 0.06 * Math.sin(this.wavePhase * 0.8));
        const diff = distNode - peacefulRadius;
        if (Math.abs(diff) > 20) {
          agent.x -= Math.cos(angleNode) * Math.min(2.5, diff * 0.04);
          agent.y -= Math.sin(angleNode) * Math.min(2.5, diff * 0.04);
        }

        const spinDir = isCleaner ? -1 : 1;
        const sereneAngle = angleNode + spinDir * (Math.PI / 2.0);
        const angleDelta = Math.atan2(Math.sin(sereneAngle - agent.angle), Math.cos(sereneAngle - agent.angle));
        agent.angle += angleDelta * 0.18;

      } else {
        // Satélites laterales en flor de loto suave (k = 6)
        const k = 6;
        const petalRadius = (Math.min(width, height) * 0.18) * (0.80 + 0.20 * Math.sin(k * angleNode + this.mandalaAngleOffset));
        const diff = distNode - petalRadius;
        if (Math.abs(diff) > 15) {
          agent.x -= Math.cos(angleNode) * Math.min(2.2, diff * 0.04);
          agent.y -= Math.sin(angleNode) * Math.min(2.2, diff * 0.04);
        }

        const spinDir = isCleaner ? -1 : 1;
        const petalTangent = angleNode + spinDir * (Math.PI / 2.0);
        const angleDelta = Math.atan2(Math.sin(petalTangent - agent.angle), Math.cos(petalTangent - agent.angle));
        agent.angle += angleDelta * 0.16;
      }
    }
  }

  getChoreographyInfo() {
    let modeName = 'MANDALAS BOTÁNICAS DE PAZ';
    if (this.isBlackHole) {
      modeName = 'SINGULARIDAD: AGUJERO NEGRO VIVO (2:03)';
    } else if (this.isSupernova) {
      modeName = 'BIG BANG: SUPERNOVA CÍCLICA (2:42)';
    } else if (this.activeCategory === 'very_high' || this.activeCategory === 'high') {
      modeName = 'ONDAS MAJESTUOSAS & MANDALAS ARMÓNICAS';
    } else if (this.activeCategory === 'mid') {
      modeName = 'ALAS DE CISNE & MEANDROS FLUIDOS';
    }

    return {
      category: this.categoryName,
      mode: modeName,
      weight: Math.round(this.intensityWeight * 100),
      isBigBang: this.isBlackHole || this.isSupernova || this.intensityWeight > 0.55
    };
  }
}

