/**
 * ============================================================================
 * CLASE CLEANERAGENT - AGENTES LIMPIADORES / BORRADORES DE LUZ (UNIDAD 6 - UPB)
 * ============================================================================
 * Partículas de luz blanca pura y aerógrafos ultra-suaves difuminados:
 *  - 0 puntos duros ni círculos nítidos (difuminado orgánico tipo aerógrafo / niebla).
 *  - Beats bajos = Brisa perlada suave y serena que limpia canales armónicos.
 *  - Beats altos = Ondas etéreas difuminadas, polvo de luz y halos cósmicos fluidos.
 * ============================================================================
 */

class CleanerAgent {
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Cinemática ágil y fluida
    this.baseSpeed = config.cleanerSpeed || 4.8;
    this.speed = this.baseSpeed;
    this.sensorDist = config.cleanerSensorDist || 18;
    this.sensorAngle = radians(36);
    this.turnSpeed = radians(40);

    // Dimensiones de aerógrafo suave
    this.baseRadius = config.cleanerRadius || 8.5;
    this.baseAlpha = config.cleanerStrength || 55;

    this.seedOffset = random(3000, 6000);
    this.targetNodeId = Math.random() < 0.35 ? 1 : (Math.random() < 0.5 ? 2 : 0);
    this.prevX = this.x;
    this.prevY = this.y;

    // Seducción temporal por el mouse
    this.mouseSeducedTimer = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
  }

  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}, choreography = null) {
    if (currentParams.cleanerSpeed) this.baseSpeed = currentParams.cleanerSpeed;
    if (currentParams.cleanerRadius) this.baseRadius = currentParams.cleanerRadius;
    if (currentParams.cleanerStrength) this.baseAlpha = currentParams.cleanerStrength;

    const bass = audioData.bass || 0;
    const energy = audioData.energy || 0;
    const beatPulse = audioData.beatPulse || 0;
    const intensityWeight = choreography ? choreography.intensityWeight : 0.2;
    const isClimax = choreography ? (choreography.isBlackHole || choreography.isSupernova || intensityWeight > 0.55) : false;
    const beatPulseInstant = choreography ? choreography.beatPulseInstant : 0;

    this.prevX = this.x;
    this.prevY = this.y;

    // --- ESCALA DE VELOCIDADES ---
    if (!isClimax) {
      this.speed = this.baseSpeed * (0.90 + intensityWeight * 0.65 + beatPulse * 0.40);
    } else {
      this.speed = this.baseSpeed * (1.5 + intensityWeight * 2.4 + beatPulse * 1.3 + beatPulseInstant * 1.1);
    }

    // --- 1. SEDUCCIÓN TEMPORAL POR EL MOUSE ---
    if (this.mouseSeducedTimer > 0) {
      this.mouseSeducedTimer--;
      const angleToMouse = Math.atan2(this.mouseTargetY - this.y, this.mouseTargetX - this.x);
      const angleDiff = Math.atan2(Math.sin(angleToMouse - this.angle), Math.cos(angleToMouse - this.angle));
      this.angle += angleDiff * 0.22 + (random() - 0.5) * 0.10;
    } else {
      // --- 2. SENSADO DE TINTA ---
      const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
      const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
      const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

      const THRESHOLD = 6;

      if (trailF > trailL && trailF > trailR && trailF > THRESHOLD) {
        this.angle += (random() - 0.5) * 0.04;
      } else if (trailL > trailR && trailL > THRESHOLD) {
        this.angle -= this.turnSpeed * (1.0 + beatPulse * 0.35);
      } else if (trailR > trailL && trailR > THRESHOLD) {
        this.angle += this.turnSpeed * (1.0 + beatPulse * 0.35);
      } else if (trailL > THRESHOLD && trailL === trailR) {
        this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
      } else {
        const noiseVal = noise(
          this.x * 0.003 + this.seedOffset,
          this.y * 0.003 + this.seedOffset,
          frameCount * 0.004
        );
        const flowAngle = noiseVal * TWO_PI * 2.0;
        const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
        this.angle += angleDiff * 0.09 + (random() - 0.5) * 0.12;
      }

      // --- 3. FUERZAS COREOGRÁFICAS ---
      if (choreography) {
        choreography.applyChoreographyForces(this, true, bufWidth / 2, bufHeight / 2, audioData);
      }
    }

    // --- 4. AVANCE CINEMÁTICO ---
    const steps = Math.max(1, Math.ceil(this.speed / 4.0));
    const stepDist = this.speed / steps;

    for (let s = 0; s < steps; s++) {
      this.x += Math.cos(this.angle) * stepDist;
      this.y += Math.sin(this.angle) * stepDist;

      if (this.x < 0) { this.x += bufWidth; this.prevX = this.x; }
      if (this.x >= bufWidth) { this.x -= bufWidth; this.prevX = this.x; }
      if (this.y < 0) { this.y += bufHeight; this.prevY = this.y; }
      if (this.y >= bufHeight) { this.y -= bufHeight; this.prevY = this.y; }

      this.erase(buffer, choreography, bass, energy, beatPulse, 1.0 / steps);
    }
  }

  sense(pixels, w, h, angleOffset) {
    const sAngle = this.angle + angleOffset;
    const sX = this.x + Math.cos(sAngle) * this.sensorDist;
    const sY = this.y + Math.sin(sAngle) * this.sensorDist;

    const sampleX = (Math.floor(sX) % w + w) % w;
    const sampleY = (Math.floor(sY) % h + h) % h;

    const idx = (sampleY * w + sampleX) * 4;
    if (!pixels || idx < 0 || idx >= pixels.length) return 0;

    const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
    return Math.max(0, 255 - brightness);
  }

  /**
   * Borrado en aerógrafo ultra-suave y plumaje difuminado (sin círculos duros)
   */
  erase(buffer, choreography, bass = 0, energy = 0, beatPulse = 0, stepWeight = 1.0) {
    buffer.noStroke();

    const intensity = choreography ? choreography.intensityWeight : 0.2;
    const isClimax = choreography ? (choreography.isBlackHole || choreography.isSupernova || intensity > 0.55) : false;
    const bg = choreography ? choreography.currentBg : { r: 245, g: 245, b: 245 };

    if (!isClimax) {
      // === BEATS BAJOS / PAZ: AERÓGRAFO SUAVE Y SERENO DE LUZ MARFIL ===
      const radius = this.baseRadius * (1.1 + intensity * 0.5 + beatPulse * 0.3);
      const alphaBase = Math.min(80, (this.baseAlpha * 0.75 + beatPulse * 20) * stepWeight);

      // Difuminado multicapa tipo aerógrafo (suavidad concéntrica sin bordes duros)
      buffer.fill(bg.r, bg.g, bg.b, alphaBase * 0.20);
      buffer.circle(this.x, this.y, radius * 2.4);

      buffer.fill(bg.r, bg.g, bg.b, alphaBase * 0.45);
      buffer.circle(this.x, this.y, radius * 1.5);

      buffer.fill(255, 255, 255, alphaBase * 0.65);
      buffer.circle(this.x, this.y, radius * 0.8);
    } else {
      // === BEATS ALTOS / CLÍMAX: NIEBLA Y POLVO DE LUZ ULTRA-DIFUMINADO ===
      const radius = this.baseRadius * (2.2 + intensity * 2.8 + beatPulse * 2.0);
      const softAlpha = Math.min(65, (this.baseAlpha * 0.40 + beatPulse * 25) * stepWeight);

      buffer.fill(bg.r, bg.g, bg.b, softAlpha * 0.18);
      buffer.circle(this.x, this.y, radius * 2.8);

      buffer.fill(bg.r, bg.g, bg.b, softAlpha * 0.38);
      buffer.circle(this.x, this.y, radius * 1.8);

      buffer.fill(255, 255, 255, softAlpha * 0.55);
      buffer.circle(this.x, this.y, radius * 1.0);

      buffer.fill(255, 255, 255, softAlpha * 0.80);
      buffer.circle(this.x, this.y, radius * 0.45);
    }
  }

  /**
   * Renderiza el aura y presencia luminosa en aerógrafo ultra-suave
   * (Totalmente libre de círculos duros o líneas artificiales)
   */
  renderBody(audioData = {}, choreography = null) {
    const beatPulse = audioData.beatPulse || 0;
    const intensity = choreography ? choreography.intensityWeight : 0.2;
    const isClimax = choreography ? (choreography.isBlackHole || choreography.isSupernova || intensity > 0.55) : false;

    push();
    noStroke();

    if (!isClimax) {
      // Halo de luz etérea y suave (difuminado concéntrico sin borde duro)
      const glowR = (this.baseRadius * 1.4) * (1.0 + beatPulse * 0.4);
      
      fill(255, 255, 255, 12 + beatPulse * 18);
      circle(this.x, this.y, glowR * 2.2);

      fill(255, 255, 255, 28 + beatPulse * 25);
      circle(this.x, this.y, glowR * 1.3);

      fill(255, 255, 255, 60 + beatPulse * 40);
      circle(this.x, this.y, glowR * 0.6);
    } else {
      // Bruma cósmica resplandeciente en clímax
      const glowR = (this.baseRadius * 2.2) * (1.0 + beatPulse * 0.6);

      fill(255, 255, 255, 15 + intensity * 20);
      circle(this.x, this.y, glowR * 2.6);

      fill(255, 255, 255, 35 + intensity * 35);
      circle(this.x, this.y, glowR * 1.5);

      fill(255, 255, 255, 75 + intensity * 45);
      circle(this.x, this.y, glowR * 0.7);
    }
    pop();
  }
}

