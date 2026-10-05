/**
 * ============================================================================
 * CLASE AGENT - AGENTES DE TINTA / MATERIA OSCURA (UNIDAD 6 - UPB)
 * ============================================================================
 * Dinámica de Tinta Líquida en Agua (Imágenes 2, 3, 4, 5):
 *  - Trazo en aerógrafo difuminado ultra-suave sin puntos circulares duros.
 *  - Beats bajos = Trazos sedosos de tinta china y filamentos elegantes.
 *  - Beats altos = Ondas majestuosas de humo y veladuras cósmicas difuminadas.
 *  - Paleta 100% Monocromática en Escala de Grises Pura (R = G = B).
 * ============================================================================
 */

class Agent {
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Cinemática equilibrada
    this.baseSpeed = config.stepSize || 4.6;
    this.speed = this.baseSpeed;
    this.baseSensorAngle = radians(config.sensorAngle || 34);
    this.sensorAngle = this.baseSensorAngle;
    this.baseSensorDist = config.sensorDist || 16;
    this.sensorDist = this.baseSensorDist;
    this.turnSpeed = radians(config.turnAngle || 36);

    // Depósito de tinta suave
    this.baseDepositRadius = config.depositRadius || 2.2;
    this.baseDepositAlpha = config.depositAlpha || 65;

    this.seedOffset = random(1000);
    this.variation = random();
    this.targetNodeId = Math.random() < 0.35 ? 1 : (Math.random() < 0.5 ? 2 : 0);

    // Seducción temporal por el mouse
    this.mouseSeducedTimer = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
  }

  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}, choreography = null) {
    if (currentParams.stepSize) this.baseSpeed = currentParams.stepSize;
    if (currentParams.sensorAngle) this.baseSensorAngle = radians(currentParams.sensorAngle);
    if (currentParams.sensorDist) this.baseSensorDist = currentParams.sensorDist;
    if (currentParams.turnAngle) this.turnSpeed = radians(currentParams.turnAngle);
    if (currentParams.depositRadius) this.baseDepositRadius = currentParams.depositRadius;
    if (currentParams.depositAlpha) this.baseDepositAlpha = currentParams.depositAlpha;

    const bass = audioData.bass || 0;
    const energy = audioData.energy || 0;
    const beatPulse = audioData.beatPulse || 0;
    const intensityWeight = choreography ? choreography.intensityWeight : 0.2;
    const isClimax = choreography ? (choreography.isBlackHole || choreography.isSupernova || intensityWeight > 0.55) : false;
    const beatPulseInstant = choreography ? choreography.beatPulseInstant : 0;

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
      this.angle += angleDiff * 0.20 + (random() - 0.5) * 0.10;
    } else {
      // --- 2. QUIMIOTAXIS & SENSADO ---
      const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
      const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
      const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

      const THRESHOLD = 6;

      if (trailF > trailL && trailF > trailR) {
        this.angle += (random() - 0.5) * 0.04;
      } else if (trailL > trailR && trailL > THRESHOLD) {
        this.angle -= this.turnSpeed * (1.0 + beatPulse * 0.35);
      } else if (trailR > trailL && trailR > THRESHOLD) {
        this.angle += this.turnSpeed * (1.0 + beatPulse * 0.35);
      } else if (trailL > THRESHOLD && trailL === trailR) {
        this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
      } else {
        const noiseVal = noise(
          this.x * 0.0035 + this.seedOffset,
          this.y * 0.0035 + this.seedOffset,
          frameCount * 0.005
        );
        const flowAngle = noiseVal * TWO_PI * 2.0;
        const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
        this.angle += angleDiff * 0.09 + (random() - 0.5) * 0.12;
      }

      // --- 3. FUERZAS COREOGRÁFICAS ---
      if (choreography) {
        choreography.applyChoreographyForces(this, false, bufWidth / 2, bufHeight / 2, audioData);
      }
    }

    // --- 4. AVANCE CINEMÁTICO MULTI-PASO ---
    const steps = Math.max(1, Math.ceil(this.speed / 3.5));
    const stepDist = this.speed / steps;

    for (let s = 0; s < steps; s++) {
      this.x += Math.cos(this.angle) * stepDist;
      this.y += Math.sin(this.angle) * stepDist;

      if (this.x < 0) this.x += bufWidth;
      if (this.x >= bufWidth) this.x -= bufWidth;
      if (this.y < 0) this.y += bufHeight;
      if (this.y >= bufHeight) this.y -= bufHeight;

      this.deposit(buffer, choreography, bass, energy, beatPulse, 1.0 / steps);
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
   * Depósito de Tinta Líquida en Aerógrafo Feathered (100% Escala de Grises Pura)
   */
  deposit(buffer, choreography, bass = 0, energy = 0, beatPulse = 0, stepWeight = 1.0) {
    buffer.noStroke();

    const intensity = choreography ? choreography.intensityWeight : 0.2;
    const isClimax = choreography ? (choreography.isBlackHole || choreography.isSupernova || intensity > 0.55) : false;

    if (!isClimax) {
      // === BEATS BAJOS / MEDIOS: FILAMENTOS SUAVES DE TINTA CHINA (Aerógrafo orgánico) ===
      const radius = this.baseDepositRadius * (1.2 + intensity * 0.6 + beatPulse * 0.3);
      const alpha = Math.min(85, (this.baseDepositAlpha * 0.85 + beatPulse * 20) * stepWeight);

      // Plumaje de tinta difuminada multicapa concéntrica
      const shadeOuter = this.variation < 0.5 ? 24 : 12;
      const shadeInner = 0;

      buffer.fill(shadeOuter, shadeOuter, shadeOuter, alpha * 0.25);
      buffer.circle(this.x, this.y, radius * 2.5);

      buffer.fill(shadeOuter, shadeOuter, shadeOuter, alpha * 0.55);
      buffer.circle(this.x, this.y, radius * 1.4);

      buffer.fill(shadeInner, shadeInner, shadeInner, alpha * 0.90);
      buffer.circle(this.x, this.y, radius * 0.65);
    } else {
      // === BEATS ALTOS / AGUJERO NEGRO / SUPERNOVA: HUMO DE TINTA OBSIDIANA DIFUMINADO ===
      const radius = this.baseDepositRadius * (2.6 + intensity * 3.2 + beatPulse * 2.2);
      const softAlpha = Math.min(75, (this.baseDepositAlpha * 0.50 + beatPulse * 28) * stepWeight);

      // Humo denso de obsidiana difuminada (niebla cósmica profunda en escala de grises pura)
      buffer.fill(18, 18, 18, softAlpha * 0.20);
      buffer.circle(this.x, this.y, radius * 2.8);

      buffer.fill(8, 8, 8, softAlpha * 0.45);
      buffer.circle(this.x, this.y, radius * 1.6);

      buffer.fill(0, 0, 0, softAlpha * 0.85);
      buffer.circle(this.x, this.y, radius * 0.75);
    }
  }
}

