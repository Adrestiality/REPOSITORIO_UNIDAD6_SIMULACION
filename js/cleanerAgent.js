/**
 * ============================================================================
 * CLASE CLEANERAGENT - AGENTES LIMPIADORES / BORRADORES DE LUZ (UNIDAD 6 - UPB)
 * ============================================================================
 * Agentes opuestos a la tinta: operan como aerógrafos y esponjas autónomas de
 * pigmento marfil (#f4f1ea), buscando y consumiendo manchas densas de tinta.
 * 
 * Características:
 *  1. Población reducida (15 a 35 agentes) de tamaño mediano (18 - 40 px).
 *  2. Quimiotaxis inversa: Sienten la tinta y son atraídos hacia ella para borrarla.
 *  3. Trazo tipo Aerógrafo / Esponja suave que se densifica a "Pluma Firme"
 *     con los beats y golpes orquestales de Black Swan.
 *  4. Genera un equilibrio ecológico autónomo sin requerir intervención del mouse.
 * ============================================================================
 */

class CleanerAgent {
  /**
   * @param {number} x - Posición inicial X
   * @param {number} y - Posición inicial Y
   * @param {number} angle - Orientación inicial en radianes
   * @param {Object} config - Configuración base
   */
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Cinemática y percepción
    this.baseSpeed = config.cleanerSpeed || 1.3;
    this.speed = this.baseSpeed;
    this.sensorDist = config.cleanerSensorDist || 32;
    this.sensorAngle = radians(38);
    this.turnSpeed = radians(26);

    // Dimensiones y fuerza de borrado
    this.baseRadius = config.cleanerRadius || 24;
    this.baseAlpha = config.cleanerStrength || 22;

    this.seedOffset = random(3000, 6000);
    this.colorMarfil = { r: 244, g: 241, b: 234 };
  }

  /**
   * Actualiza el agente limpiador en cada cuadro
   * 
   * @param {Uint8ClampedArray} pixelArray - Memoria del buffer de tinta
   * @param {number} bufWidth - Ancho del lienzo
   * @param {number} bufHeight - Alto del lienzo
   * @param {p5.Graphics} buffer - Gráfico de destino (inkBuffer)
   * @param {Object} currentParams - Parámetros desde la GUI
   * @param {Object} audioData - Métricas espectrales del audio
   */
  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}) {
    if (currentParams.cleanerSpeed) this.baseSpeed = currentParams.cleanerSpeed;
    if (currentParams.cleanerRadius) this.baseRadius = currentParams.cleanerRadius;
    if (currentParams.cleanerStrength) this.baseAlpha = currentParams.cleanerStrength;

    const bass = audioData.bass || 0;
    const mid = audioData.mid || 0;
    const energy = audioData.energy || 0;
    const beatPulse = audioData.beatPulse || 0;

    // Aceleración con la música
    this.speed = this.baseSpeed * (0.9 + energy * 0.6 + beatPulse * 0.4);

    // --- 1. SENSADO DE TINTA (Búsqueda de manchas oscuras) ---
    const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
    const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
    const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

    const THRESHOLD = 12; // Mínima densidad de tinta para ser detectada

    // --- 2. QUIMIOTAXIS DE LIMPIEZA ---
    if (trailF > trailL && trailF > trailR && trailF > THRESHOLD) {
      // Avanzar directamente hacia el núcleo de la mancha
      this.angle += (random() - 0.5) * 0.04;
    } else if (trailL > trailR && trailL > THRESHOLD) {
      // Girar hacia la mancha a la izquierda
      this.angle -= this.turnSpeed;
    } else if (trailR > trailL && trailR > THRESHOLD) {
      // Girar hacia la mancha a la derecha
      this.angle += this.turnSpeed;
    } else if (trailL > THRESHOLD && trailL === trailR) {
      this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
    } else {
      // Patrullaje orgánico en zonas limpias mediante flujo Perlin
      const noiseVal = noise(
        this.x * 0.002 + this.seedOffset,
        this.y * 0.002 + this.seedOffset,
        frameCount * 0.0015
      );
      const flowAngle = noiseVal * TWO_PI * 2;
      const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
      this.angle += angleDiff * 0.06 + (random() - 0.5) * 0.1;
    }

    // --- 3. AVANCE CINEMÁTICO ---
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Confinamiento toroidal suave
    if (this.x < 0) this.x += bufWidth;
    if (this.x >= bufWidth) this.x -= bufWidth;
    if (this.y < 0) this.y += bufHeight;
    if (this.y >= bufHeight) this.y -= bufHeight;

    // --- 4. BORRADO ORGÁNICO TIPO AERÓGRAFO / PLUMA FIRME ---
    this.erase(buffer, bass, energy, beatPulse);
  }

  /**
   * Muestrea densidad de tinta (inversión de brillo en inkBuffer)
   */
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
   * Deposita pigmento marfil (#f4f1ea) con gradiente de aerógrafo que se endurece con los beats
   */
  erase(buffer, bass = 0, energy = 0, beatPulse = 0) {
    buffer.noStroke();

    // En reposo: Aerógrafo suave y difuso.
    // Con Beats: Pluma firme y limpia con mayor concentración y opacidad.
    const radius = this.baseRadius * (1.0 + bass * 0.8 + beatPulse * 0.6);
    const alphaBase = this.baseAlpha * (0.8 + energy * 0.6 + beatPulse * 1.4);

    const r = this.colorMarfil.r;
    const g = this.colorMarfil.g;
    const b = this.colorMarfil.b;

    // Capa 1: Halo externo difuminado (Aerógrafo)
    buffer.fill(r, g, b, Math.min(255, alphaBase * 0.35));
    buffer.circle(this.x, this.y, radius * 1.8);

    // Capa 2: Cuerpo medio
    buffer.fill(r, g, b, Math.min(255, alphaBase * 0.7));
    buffer.circle(this.x, this.y, radius * 1.1);

    // Capa 3: Núcleo denso que se activa con la fuerza rítmica (Pluma firme)
    if (beatPulse > 0.15 || bass > 0.4) {
      buffer.fill(r, g, b, Math.min(255, alphaBase * 1.5));
      buffer.circle(this.x, this.y, radius * 0.55);
    }
  }
}
