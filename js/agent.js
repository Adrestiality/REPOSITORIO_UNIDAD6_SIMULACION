/**
 * ============================================================================
 * CLASE AGENT - AGENTES DE TINTA LÍQUIDA & MATERIA (UNIDAD 6 - UPB)
 * ============================================================================
 * Partículas de Tinta / Cisnes / Venas Borgoña con Alta Legibilidad:
 *  - 3 Escalas de Partículas: Tiny (1–3 px), Medium (3–5 px), Large (5–8 px, raras).
 *  - Alto contraste garantizado:
 *      * Fondo Oscuro: Partículas blanco perla, gris claro plateado y borgoña vivo.
 *      * Fondo Blanco: Tinta china negra profunda y borgoña oscuro.
 *  - Estelas finas continuas conectadas (prevX -> x, prevY -> y).
 *  - Cero halos grises gigantes ni círculos difusos repetitivos.
 *  - Gotas orgánicas con sutil elongación según el vector de movimiento.
 * ============================================================================
 */

class Agent {
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.prevX = this.x;
    this.prevY = this.y;
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Cinemática base
    this.baseSpeed = config.stepSize || 3.0;
    this.speed = this.baseSpeed;
    this.baseSensorAngle = radians(config.sensorAngle || 34);
    this.sensorAngle = this.baseSensorAngle;
    this.baseSensorDist = config.sensorDist || 16;
    this.sensorDist = this.baseSensorDist;
    this.turnSpeed = radians(config.turnAngle || 36);

    // Semilla única y variación
    this.seedOffset = Math.floor(random(1000, 9000));
    this.variation = random();

    // 1. Asignación determinista de Escala (1-3px, 3-5px, 5-8px)
    const scaleSeed = (this.seedOffset % 1000) / 1000.0;
    if (scaleSeed < 0.07) {
      this.scaleCategory = 'large';   // ~7% Gotas prominentes / impactos (5–8 px)
      this.scaleBase = 5.6;
    } else if (scaleSeed < 0.45) {
      this.scaleCategory = 'medium';  // ~38% Partículas primarias de tinta (3–5 px)
      this.scaleBase = 3.6;
    } else {
      this.scaleCategory = 'tiny';    // ~55% Polvo, humo, filamentos delicados (1–3 px)
      this.scaleBase = 1.8;
    }

    // 2. Geometría orgánica de gota (ligera elongación y micro-variación)
    this.aspectRatio = 1.15 + ((this.seedOffset % 40) / 40.0) * 0.35; // 1.15x a 1.50x
    this.shapeWobble = ((this.seedOffset % 60) / 60.0 - 0.5) * 0.20;

    // Seducción temporal por el ratón
    this.mouseSeducedTimer = 0;
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
  }

  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}, choreography = null) {
    const choreoParams = choreography ? choreography.currentParams : {};

    // 1. Velocidad gobernada por el estado coreografiado
    if (choreoParams.speed !== undefined) {
      this.speed = choreoParams.speed;
    } else if (currentParams.stepSize) {
      this.speed = currentParams.stepSize;
    }

    if (currentParams.sensorAngle) this.baseSensorAngle = radians(currentParams.sensorAngle);
    if (currentParams.sensorDist) this.baseSensorDist = currentParams.sensorDist;
    if (currentParams.turnAngle) this.turnSpeed = radians(currentParams.turnAngle);

    // 2. Seducción por interacción del ratón
    if (this.mouseSeducedTimer > 0) {
      this.mouseSeducedTimer--;
      const angleToMouse = Math.atan2(this.mouseTargetY - this.y, this.mouseTargetX - this.x);
      const angleDiff = Math.atan2(Math.sin(angleToMouse - this.angle), Math.cos(angleToMouse - this.angle));
      this.angle += angleDiff * 0.20 + (random() - 0.5) * 0.10;
    } else {
      // 3. Quimiotaxis / Sensado Physarum
      const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
      const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
      const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

      const THRESHOLD = 6;

      if (trailF > trailL && trailF > trailR) {
        this.angle += (random() - 0.5) * 0.04;
      } else if (trailL > trailR && trailL > THRESHOLD) {
        this.angle -= this.turnSpeed;
      } else if (trailR > trailL && trailR > THRESHOLD) {
        this.angle += this.turnSpeed;
      } else if (trailL > THRESHOLD && trailL === trailR) {
        this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
      } else {
        const noiseVal = noise(
          this.x * 0.0035 + this.seedOffset,
          this.y * 0.0035 + this.seedOffset,
          frameCount * 0.004
        );
        const flowAngle = noiseVal * TWO_PI * 2.0;
        const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
        this.angle += angleDiff * 0.08 + (random() - 0.5) * 0.10;
      }

      // 4. Fuerzas coreográficas de la línea de tiempo
      if (choreography) {
        choreography.applyChoreographyForces(this, false, bufWidth / 2, bufHeight / 2, audioData);
      }
    }

    // 5. Avance cinemático multi-paso suave con trazos continuos
    const steps = Math.max(1, Math.ceil(this.speed / 2.5));
    const stepDist = this.speed / steps;

    for (let s = 0; s < steps; s++) {
      this.prevX = this.x;
      this.prevY = this.y;

      this.x += Math.cos(this.angle) * stepDist;
      this.y += Math.sin(this.angle) * stepDist;

      // Wrap suave
      let wrapped = false;
      if (this.x < 0) { this.x += bufWidth; wrapped = true; }
      if (this.x >= bufWidth) { this.x -= bufWidth; wrapped = true; }
      if (this.y < 0) { this.y += bufHeight; wrapped = true; }
      if (this.y >= bufHeight) { this.y -= bufHeight; wrapped = true; }

      if (wrapped) {
        this.prevX = this.x;
        this.prevY = this.y;
      }

      this.deposit(buffer, choreography, 1.0 / steps);
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
   * Renderizado de alta legibilidad: trazo de estela fino + cabeza de gota orgánica
   */
  deposit(buffer, choreography, stepWeight = 1.0) {
    const choreoParams = choreography ? choreography.currentParams : {};
    const bg = choreography ? choreography.currentBg : { r: 245, g: 245, b: 245 };
    const isDarkBg = (bg.r + bg.g + bg.b) / 3 < 128;
    const theme = choreoParams.theme || (isDarkBg ? 'dark_ink' : 'light');
    const burgundyRatio = choreoParams.burgundyRatio || 0.0;

    // 1. Dimensiones de la partícula
    // Tiny: 1.2–2.8px | Medium: 3.0–4.8px | Large: 5.0–7.5px
    const baseDepositR = choreoParams.depositRadius || 1.8;
    const sizeScale = (baseDepositR / 1.8);
    const particleWidth = Math.max(1.0, this.scaleBase * sizeScale * (1.0 + this.shapeWobble));
    const particleLength = particleWidth * this.aspectRatio;

    // 2. Asignación de Color de Alto Contraste
    // Deterministic selection based on particle seed for exact percentage
    const particleColorSeed = (this.seedOffset % 1000) / 1000.0;
    const isBurgundy = burgundyRatio > 0.001 && (particleColorSeed < burgundyRatio);
    const isWhiteHighlight = !isBurgundy && (this.variation < 0.14); // ~14% partículas blanco brillante

    let colR = 0, colG = 0, colB = 0;
    let mainAlpha = Math.min(255, (choreoParams.depositAlpha || 65) * 1.5 * stepWeight);

    if (isDarkBg) {
      // === FONDO OSCURO / NEGRO ===
      if (isBurgundy) {
        // Tinta borgoña / vino sobria y claramente visible sobre fondo oscuro (#ba2642)
        // Rojo vino contenido (como tinta roja contaminando tinta negra/blanca, NO neon)
        colR = 186; colG = 38; colB = 66;
      } else if (isWhiteHighlight || theme === 'dark_swan') {
        // Blanco puro luminoso
        colR = 255; colG = 255; colB = 255;
      } else {
        // Gris claro plateado / blanco roto (#dcdfe6)
        if (this.scaleCategory === 'tiny') {
          colR = 195; colG = 200; colB = 210;
        } else {
          colR = 225; colG = 228; colB = 236;
        }
      }
    } else {
      // === FONDO BLANCO / CLARO ===
      if (isBurgundy) {
        // Tinta borgoña profunda visible en agua clara (#82162e)
        colR = 130; colG = 22; colB = 46;
      } else {
        // Tinta china negra (#0e0e0e)
        colR = 14; colG = 14; colB = 14;
      }
    }

    // --- 3. DIBUJO DE ESTELA FINA & NÍTIDA (particle -> short visible ink trail) ---
    const trailDist = Math.hypot(this.x - this.prevX, this.y - this.prevY);
    if (trailDist > 0.1 && trailDist < 80) {
      buffer.stroke(colR, colG, colB, mainAlpha * (isBurgundy ? 0.85 : 0.65));
      buffer.strokeWeight(Math.max(0.8, particleWidth * 0.65));
      buffer.line(this.prevX, this.prevY, this.x, this.y);
    }

    // --- 4. DIBUJO DE CABEZA DE PARTÍCULA / GOTA ORGÁNICA (sin halos gigantes) ---
    buffer.noStroke();

    // Micro-borde sutil (máximo 1.25x para suavidad orgánica)
    buffer.fill(colR, colG, colB, mainAlpha * 0.35);
    buffer.ellipse(this.x, this.y, particleLength * 1.25, particleWidth * 1.25);

    // Núcleo nítido de la gota
    buffer.fill(colR, colG, colB, mainAlpha * 0.95);
    buffer.ellipse(this.x, this.y, particleLength, particleWidth);
  }
}
