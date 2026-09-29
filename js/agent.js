/**
 * ============================================================================
 * CLASE AGENT - SIMULACIÓN BIOLÓGICA PHYSARUM POLYCEPHALUM (UNIDAD 6 - UPB)
 * ============================================================================
 * Agentes autónomos quimiotácticos y reactivos al audio orquestal de "Black Swan".
 * 
 * Dinámicas Orgánicas Implementadas:
 *  1. Flujo Curvilíneo Perlin: Ramificación dendrítica y crecimiento miceliar suave.
 *  2. Reactividad al Audio: Modulación en tiempo real de velocidad, apertura de sensores,
 *     radio de depósito y floración de pigmento al compás de los beats.
 *  3. Depósito Acuarela Multicapa: Micro-gotas de tinta líquida con bordes difuminados.
 *  4. Paletas Cromáticas Dramáticas (Actos 1 al 4).
 * ============================================================================
 */

class Agent {
  /**
   * @param {number} x - Posición X inicial
   * @param {number} y - Posición Y inicial
   * @param {number} angle - Orientación en radianes
   * @param {Object} config - Configuración base
   */
  constructor(x, y, angle = null, config = {}) {
    this.x = x !== undefined ? x : random(width);
    this.y = y !== undefined ? y : random(height);
    this.angle = angle !== null ? angle : random(TWO_PI);

    // Propiedades cinemáticas base
    this.baseSpeed = config.stepSize || 1.6;
    this.speed = this.baseSpeed;
    this.baseSensorAngle = radians(config.sensorAngle || 30);
    this.sensorAngle = this.baseSensorAngle;
    this.baseSensorDist = config.sensorDist || 20;
    this.sensorDist = this.baseSensorDist;
    this.turnSpeed = radians(config.turnAngle || 28);

    // Propiedades de depósito de pigmento acuarela
    this.baseDepositRadius = config.depositRadius || 2.5;
    this.baseDepositAlpha = config.depositAlpha || 35;

    // Factores de variación orgánica individual
    this.seedOffset = random(1000);
    this.variation = random();
    this.branchProb = random(0.002, 0.008);
  }

  /**
   * Actualiza el agente considerando gradientes de tinta y análisis espectral de audio
   * 
   * @param {Uint8ClampedArray} pixelArray - Memoria del buffer de tinta
   * @param {number} bufWidth - Ancho del lienzo
   * @param {number} bufHeight - Alto del lienzo
   * @param {p5.Graphics} buffer - Gráfico de depósito (inkBuffer)
   * @param {Object} currentParams - Parámetros de la GUI
   * @param {Object} audioData - Datos en tiempo real de AudioReactiveEngine
   */
  update(pixelArray, bufWidth, bufHeight, buffer, currentParams = {}, audioData = {}) {
    // Sincronizar parámetros base desde GUI
    if (currentParams.stepSize) this.baseSpeed = currentParams.stepSize;
    if (currentParams.sensorAngle) this.baseSensorAngle = radians(currentParams.sensorAngle);
    if (currentParams.sensorDist) this.baseSensorDist = currentParams.sensorDist;
    if (currentParams.turnAngle) this.turnSpeed = radians(currentParams.turnAngle);
    if (currentParams.depositRadius) this.baseDepositRadius = currentParams.depositRadius;
    if (currentParams.depositAlpha) this.baseDepositAlpha = currentParams.depositAlpha;

    // --- MODULACIÓN DINÁMICA POR AUDIO (Black Swan Orchestral) ---
    const bass = audioData.bass || 0;
    const mid = audioData.mid || 0;
    const energy = audioData.energy || 0;
    const beatPulse = audioData.beatPulse || 0;

    // Aceleración reactiva al ritmo y cuerdas
    this.speed = this.baseSpeed * (0.85 + energy * 0.75 + (audioData.isBeat ? 0.35 : 0));
    
    // Las cuerdas orquestales (Mid) tensan y abren el ángulo de búsqueda de ramas
    this.sensorAngle = this.baseSensorAngle * (1.0 + mid * 0.45);
    this.sensorDist = this.baseSensorDist * (0.9 + energy * 0.5);

    // --- 1. SENSADO DE GRADIENTE DE TINTA (3 Sensores) ---
    const trailF = this.sense(pixelArray, bufWidth, bufHeight, 0);
    const trailL = this.sense(pixelArray, bufWidth, bufHeight, -this.sensorAngle);
    const trailR = this.sense(pixelArray, bufWidth, bufHeight, this.sensorAngle);

    // --- 2. TOMA DE DECISIÓN Y COMPORTAMIENTO BIOLÓGICO ---
    const THRESHOLD = 10;

    if (trailF > trailL && trailF > trailR) {
      // Rumbo directo hacia el canal de tinta más denso
      this.angle += (random() - 0.5) * 0.03;
    } else if (trailL > trailR && trailL > THRESHOLD) {
      // Giro a la izquierda
      this.angle -= this.turnSpeed;
    } else if (trailR > trailL && trailR > THRESHOLD) {
      // Giro a la derecha
      this.angle += this.turnSpeed;
    } else if (trailL > THRESHOLD && trailL === trailR) {
      // Bifurcación estocástica de vena
      this.angle += (random() < 0.5 ? -1 : 1) * this.turnSpeed;
    } else {
      // Movimiento orgánico armónico guiado por campo de ruido Perlin
      const noiseVal = noise(
        this.x * 0.003 + this.seedOffset,
        this.y * 0.003 + this.seedOffset,
        frameCount * 0.002
      );
      const flowAngle = noiseVal * TWO_PI * 2.5;
      
      // Interpolación angular suave hacia el flujo botánico
      const angleDiff = Math.atan2(Math.sin(flowAngle - this.angle), Math.cos(flowAngle - this.angle));
      this.angle += angleDiff * 0.08 + (random() - 0.5) * 0.12;
    }

    // --- 3. AVANCE CINEMÁTICO ---
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Confinamiento toroidal suave
    if (this.x < 0) this.x += bufWidth;
    if (this.x >= bufWidth) this.x -= bufWidth;
    if (this.y < 0) this.y += bufHeight;
    if (this.y >= bufHeight) this.y -= bufHeight;

    // --- 4. DEPÓSITO DE PIGMENTO ACUARELA REACTIVO ---
    const palette = currentParams.palette || 'black-swan';
    this.depositOrganic(buffer, palette, bass, energy, beatPulse);
  }

  /**
   * Muestrea la concentración de tinta con acceso directo al array de memoria
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
   * Deposita una gota orgánica multicapa de tinta líquida con floración de acuarela
   */
  depositOrganic(buffer, palette, bass = 0, energy = 0, beatPulse = 0) {
    buffer.noStroke();

    // Floración del radio con los golpes de timbal/bombo de Black Swan
    const audioExpansion = 1.0 + bass * 1.5 + beatPulse * 1.2;
    const radius = this.baseDepositRadius * audioExpansion;
    const alpha = Math.min(180, this.baseDepositAlpha * (0.9 + energy * 0.7 + beatPulse * 0.5));

    // Capas concéntricas para simular el borde degradado de la acuarela sobre papel húmedo
    switch (palette) {
      case 'white-swan':
        // Acto I: Grafito tenue y pluma suave
        buffer.fill(42, 45, 50, alpha * 0.45);
        buffer.circle(this.x, this.y, radius * 1.6);
        buffer.fill(32, 34, 38, alpha);
        buffer.circle(this.x, this.y, radius * 0.85);
        break;

      case 'tension':
        // Acto II: Carbón profundo con toques de violeta/ciruela
        if (this.variation < 0.35) {
          buffer.fill(52, 14, 30, alpha * 0.4);
          buffer.circle(this.x, this.y, radius * 1.7);
          buffer.fill(38, 10, 22, alpha);
          buffer.circle(this.x, this.y, radius * 0.9);
        } else {
          buffer.fill(22, 24, 28, alpha * 0.4);
          buffer.circle(this.x, this.y, radius * 1.6);
          buffer.fill(16, 18, 22, alpha);
          buffer.circle(this.x, this.y, radius * 0.85);
        }
        break;

      case 'black-swan':
        // Acto III: Negro visceral, brea y sangre espesa ("Can't Help Myself")
        if (this.variation < 0.38) {
          buffer.fill(48, 4, 12, alpha * 0.5); // Halo sanguíneo
          buffer.circle(this.x, this.y, radius * 1.8);
          buffer.fill(28, 2, 8, alpha * 1.1); // Núcleo viscoso
          buffer.circle(this.x, this.y, radius * 0.9);
        } else {
          buffer.fill(10, 12, 14, alpha * 0.45);
          buffer.circle(this.x, this.y, radius * 1.7);
          buffer.fill(6, 8, 10, alpha * 1.15); // Brea pura
          buffer.circle(this.x, this.y, radius * 0.9);
        }
        break;

      case 'gold':
        // Acto IV: Oro antiguo noble, ámbar y sepia luminoso
        if (this.variation < 0.45) {
          buffer.fill(197, 160, 89, alpha * 0.4); // Halo áureo
          buffer.circle(this.x, this.y, radius * 1.7);
          buffer.fill(185, 145, 75, alpha * 0.95);
          buffer.circle(this.x, this.y, radius * 0.85);
        } else if (this.variation < 0.75) {
          buffer.fill(160, 115, 45, alpha * 0.4);
          buffer.circle(this.x, this.y, radius * 1.6);
          buffer.fill(140, 95, 35, alpha * 0.9);
          buffer.circle(this.x, this.y, radius * 0.85);
        } else {
          buffer.fill(82, 58, 30, alpha * 0.35);
          buffer.circle(this.x, this.y, radius * 1.5);
          buffer.fill(65, 45, 22, alpha * 0.85);
          buffer.circle(this.x, this.y, radius * 0.8);
        }
        break;

      default:
        buffer.fill(20, 22, 26, alpha);
        buffer.circle(this.x, this.y, radius);
        break;
    }
  }
}
