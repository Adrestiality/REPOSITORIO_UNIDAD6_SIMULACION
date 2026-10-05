/**
 * ============================================================================
 * CLASE CLEANERAGENT - AGENTES LIMPIADORES / BORRADORES DE LUZ (UNIDAD 6 - UPB)
 * ============================================================================
 * Agentes difuminadores y limpiadores de espacio negativo:
 *  - Disuelven suavemente la acumulación excesiva de tinta mediante aerógrafos.
 *  - Garantizan que el lienzo conserve amplias zonas de espacio negativo.
 *  - Trazos 100% difuminados sin círculos duros ni bordes artificiales.
 * ============================================================================
 */

class CleanerAgent {
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Cinemática ágil y fluida
    this.baseSpeed = config.cleanerSpeed || 3.2;
    this.speed = this.baseSpeed;
    this.sensorDist = config.cleanerSensorDist || 18;
    this.sensorAngle = radians(36);
    this.turnSpeed = radians(38);

    // Dimensiones de aerógrafo suave
    this.baseRadius = config.cleanerRadius || 7.0;
    this.baseAlpha = config.cleanerStrength || 45;

    this.seedOffset = Math.floor(random(3000, 9000));
    this.prevX = this.x;
    this.prevY = this.y;

    // Seducción temporal por el mouse
    this.mouseSeducedTimer = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
  }

  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}, choreography = null) {
    const choreoParams = choreography ? choreography.currentParams : {};

    if (choreoParams.speed !== undefined) {
      this.speed = choreoParams.speed * 1.15;
    } else if (currentParams.cleanerSpeed) {
      this.speed = currentParams.cleanerSpeed;
    }

    if (currentParams.cleanerRadius) this.baseRadius = currentParams.cleanerRadius;
    if (currentParams.cleanerStrength) this.baseAlpha = currentParams.cleanerStrength;

    this.prevX = this.x;
    this.prevY = this.y;

    // 1. Seducción por interacción del mouse
    if (this.mouseSeducedTimer > 0) {
      this.mouseSeducedTimer--;
      const angleToMouse = Math.atan2(this.mouseTargetY - this.y, this.mouseTargetX - this.x);
      const angleDiff = Math.atan2(Math.sin(angleToMouse - this.angle), Math.cos(angleToMouse - this.angle));
      this.angle += angleDiff * 0.22 + (random() - 0.5) * 0.10;
    } else {
      // 2. Sensado Physarum de Tinta
      const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
      const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
      const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

      const THRESHOLD = 6;

      if (trailF > trailL && trailF > trailR && trailF > THRESHOLD) {
        this.angle += (random() - 0.5) * 0.04;
      } else if (trailL > trailR && trailL > THRESHOLD) {
        this.angle -= this.turnSpeed;
      } else if (trailR > trailL && trailR > THRESHOLD) {
        this.angle += this.turnSpeed;
      } else if (trailL > THRESHOLD && trailL === trailR) {
        this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
      } else {
        const noiseVal = noise(
          this.x * 0.003 + this.seedOffset,
          this.y * 0.003 + this.seedOffset,
          frameCount * 0.003
        );
        const flowAngle = noiseVal * TWO_PI * 2.0;
        const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
        this.angle += angleDiff * 0.08 + (random() - 0.5) * 0.10;
      }

      // 3. Fuerzas coreográficas
      if (choreography) {
        choreography.applyChoreographyForces(this, true, bufWidth / 2, bufHeight / 2, audioData);
      }
    }

    // 4. Avance cinemático multi-paso
    const steps = Math.max(1, Math.ceil(this.speed / 3.0));
    const stepDist = this.speed / steps;

    for (let s = 0; s < steps; s++) {
      this.x += Math.cos(this.angle) * stepDist;
      this.y += Math.sin(this.angle) * stepDist;

      if (this.x < 0) { this.x += bufWidth; this.prevX = this.x; }
      if (this.x >= bufWidth) { this.x -= bufWidth; this.prevX = this.x; }
      if (this.y < 0) { this.y += bufHeight; this.prevY = this.y; }
      if (this.y >= bufHeight) { this.y -= bufHeight; this.prevY = this.y; }

      this.erase(buffer, choreography, 1.0 / steps);
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
   * Borrado / difuminado limpio con el color de fondo actual (sin halos gigantes)
   */
  erase(buffer, choreography, stepWeight = 1.0) {
    const choreoParams = choreography ? choreography.currentParams : {};
    const bg = choreography ? choreography.currentBg : { r: 245, g: 245, b: 245 };
    const radius = Math.max(2.5, (choreoParams.depositRadius || this.baseRadius) * 1.4);
    const alpha = Math.min(100, (this.baseAlpha * 0.80) * stepWeight);

    // Trazo de borrado continuo conectado
    const dist = Math.hypot(this.x - this.prevX, this.y - this.prevY);
    if (dist > 0.1 && dist < 80) {
      buffer.stroke(bg.r, bg.g, bg.b, alpha * 0.65);
      buffer.strokeWeight(radius * 1.5);
      buffer.line(this.prevX, this.prevY, this.x, this.y);
    }

    buffer.noStroke();
    buffer.fill(bg.r, bg.g, bg.b, alpha * 0.80);
    buffer.circle(this.x, this.y, radius * 1.5);
  }

  /**
   * Renderiza el aura luminosa etérea (sin círculos duros)
   */
  renderBody(audioData = {}, choreography = null) {
    const choreoParams = choreography ? choreography.currentParams : {};
    const theme = choreoParams.theme || 'light';

    if (theme === 'dark_swan') {
      // En modo cisnes blancos: aura perlada suave
      push();
      noStroke();
      fill(255, 255, 255, 12);
      circle(this.x, this.y, 22.0);
      fill(255, 255, 255, 30);
      circle(this.x, this.y, 11.0);
      fill(255, 255, 255, 70);
      circle(this.x, this.y, 4.5);
      pop();
    }
  }
}
