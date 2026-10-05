/**
 * ============================================================================
 * MOTOR DE AUDIO REACTIVO Y ANÁLISIS ESPECTRAL (UNIDAD 6 - UPB)
 * ============================================================================
 * Pista: "BTS - Black Swan (Orchestral Ver.) Instrumental"
 * 
 * Este módulo gestiona:
 *  1. Carga robusta y reproducción del archivo de audio con soporte de fallbacks.
 *  2. Pipeline de Web Audio API (AudioContext + AnalyserNode FFT de 512 bandas).
 *  3. Extracción en tiempo real de bandas: Bass (Bombos/Percusión), Mid (Cuerdas/Violines),
 *     Treble (Agudos orquestales) y detección estocástica de Beats (Golpes de compás).
 *  4. Desbloqueo suave de políticas de Autoplay mediante interacción del usuario.
 * ============================================================================
 */

class AudioReactiveEngine {
  constructor() {
    this.audioElement = null;
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.freqData = null;
    this.timeData = null;

    this.isInitialized = false;
    this.isPlaying = false;
    this.hasUserInteracted = false;

    // Métricas reactivas normalizadas (0.0 a 1.0)
    this.data = {
      isPlaying: false,
      bass: 0,            // Graves / Bombos / Timbales orquestales
      mid: 0,             // Medios / Cuerdas / Violines
      treble: 0,          // Agudos / Armónicos
      energy: 0,          // Energía RMS global
      isBeat: false,      // Trigger booleano de golpe rítmico
      beatPulse: 0,       // Decaimiento rápido del golpe (1.0 -> 0.0)
      transientFlux: 0,   // Ataque dinámico instantáneo
      heartbeatPhase: 0   // Pulso orgánico continuo (0 a TWO_PI)
    };

    // Historial y umbrales para detección de beats ultra sensible
    this.beatThreshold = 0.42;
    this.runningBassAvg = 0.25;
    this.prevEnergy = 0;
    this.lastBeatTime = 0;

    // Rutas de audio (soporta tanto carpeta assets como raíz)
    this.audioSources = [
      'assets/black-swan.mp3',
      'BTS Black Swan (Orchestral Ver.) Instrumental.mp3',
      './assets/black-swan.mp3'
    ];
    this.currentSourceIdx = 0;

    this.setupAudioElement();
  }

  /**
   * Crea el elemento HTML5 Audio con listeners de ciclo de vida
   */
  setupAudioElement() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;
    this.audioElement.volume = 0.85;
    this.audioElement.preload = 'auto';

    this.audioElement.src = this.audioSources[this.currentSourceIdx];

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.data.isPlaying = true;
      if (typeof simGUI !== 'undefined' && simGUI) {
        simGUI.setAudioStatus('Reproduciendo (Black Swan)');
      }
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.data.isPlaying = false;
      if (typeof simGUI !== 'undefined' && simGUI) {
        simGUI.setAudioStatus('Pausado');
      }
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn(`Intento de carga fallido para ${this.audioSources[this.currentSourceIdx]}. Probando alternativa...`);
      if (this.currentSourceIdx < this.audioSources.length - 1) {
        this.currentSourceIdx++;
        this.audioElement.src = this.audioSources[this.currentSourceIdx];
        this.audioElement.load();
      } else {
        if (typeof simGUI !== 'undefined' && simGUI) {
          simGUI.setAudioStatus('Error de archivo');
        }
      }
    });
  }

  /**
   * Inicializa la cadena de Web Audio API tras el primer gesto del usuario
   */
  async initAudioContext() {
    if (this.isInitialized) {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API no soportada en este navegador.');
        return;
      }

      this.audioCtx = new AudioContextClass();

      // Analizador FFT con respuesta rápida
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.70; // Mayor reactividad temporal

      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

      // Nodo de Ganancia
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.85;

      // Conexión del elemento Audio
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.isInitialized = true;
      console.log('🎵 Web Audio API & Analyser inicializados correctamente.');
    } catch (err) {
      console.warn('Nota: Web Audio API inicializada en modo fallback HTML5:', err);
    }
  }

  /**
   * Reproduce el audio asegurando el contexto activo
   */
  async play() {
    await this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    try {
      await this.audioElement.play();
      this.hasUserInteracted = true;
      this.isPlaying = true;
      this.data.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Autoplay bloqueado. Esperando clic del usuario.', err);
      return false;
    }
  }

  /**
   * Pausa la pista
   */
  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.data.isPlaying = false;
    }
  }

  /**
   * Reinicia la pista desde el segundo 0
   */
  async restart() {
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      await this.play();
    }
  }

  /**
   * Ajusta el volumen (0.0 a 1.0)
   */
  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    if (this.gainNode) {
      this.gainNode.gain.value = clamped;
    }
  }

  /**
   * Extrae los valores espectrales del frame actual con alta sensibilidad y transitorios
   * @returns {Object} Datos de análisis de audio normalizados
   */
  update() {
    if (!this.isPlaying || !this.analyser || !this.freqData) {
      this.data.bass *= 0.88;
      this.data.mid *= 0.88;
      this.data.treble *= 0.88;
      this.data.energy *= 0.88;
      this.data.beatPulse *= 0.82;
      this.data.transientFlux *= 0.80;
      this.data.isBeat = false;
      this.data.isPlaying = this.isPlaying;
      return this.data;
    }

    // Obtener datos de frecuencia (0 a 255 por bin)
    this.analyser.getByteFrequencyData(this.freqData);

    // 1. Bass: bins 1 a 16 (~20 Hz a 280 Hz) -> Timbales, bombos y contrabajos
    let bassSum = 0;
    const bassEnd = 16;
    for (let i = 1; i <= bassEnd; i++) {
      bassSum += this.freqData[i];
    }
    const rawBass = (bassSum / bassEnd) / 255;

    // 2. Mid: bins 17 a 80 (~290 Hz a 1400 Hz) -> Cuerdas, violas y violines
    let midSum = 0;
    const midEnd = 80;
    for (let i = 17; i <= midEnd; i++) {
      midSum += this.freqData[i];
    }
    const rawMid = (midSum / (midEnd - 17)) / 255;

    // 3. Treble: bins 81 a 200 (~1400 Hz a 6500 Hz) -> Aire, platillos y armónicos
    let trebleSum = 0;
    const trebleEnd = 200;
    for (let i = 81; i <= trebleEnd; i++) {
      trebleSum += this.freqData[i];
    }
    const rawTreble = (trebleSum / (trebleEnd - 81)) / 255;

    // 4. Energía y flujo espectral instantáneo
    const rawEnergy = (rawBass * 0.50 + rawMid * 0.35 + rawTreble * 0.15);
    const flux = Math.max(0, rawEnergy - this.prevEnergy);
    this.prevEnergy = rawEnergy;

    // Suavizado dinámico ultrarrápido (Fast Attack / Gentle Release)
    this.data.bass = rawBass > this.data.bass ? (this.data.bass * 0.3 + rawBass * 0.7) : (this.data.bass * 0.82 + rawBass * 0.18);
    this.data.mid = rawMid > this.data.mid ? (this.data.mid * 0.35 + rawMid * 0.65) : (this.data.mid * 0.82 + rawMid * 0.18);
    this.data.treble = rawTreble > this.data.treble ? (this.data.treble * 0.4 + rawTreble * 0.6) : (this.data.treble * 0.82 + rawTreble * 0.18);
    this.data.energy = rawEnergy > this.data.energy ? (this.data.energy * 0.35 + rawEnergy * 0.65) : (this.data.energy * 0.85 + rawEnergy * 0.15);
    this.data.transientFlux = this.data.transientFlux * 0.7 + flux * 0.3;

    // Fase de latido orgánico pulsante (como un corazón en cámara rápida)
    const heartSpeed = 0.08 + this.data.energy * 0.18 + this.data.bass * 0.14;
    this.data.heartbeatPhase = (this.data.heartbeatPhase + heartSpeed) % (Math.PI * 2);

    // Detección dinámica y ultra sensible de beats (Surge & Transient detector)
    const now = performance.now();
    this.runningBassAvg = this.runningBassAvg * 0.92 + this.data.bass * 0.08;
    const bassRatio = this.runningBassAvg > 0.01 ? (this.data.bass / this.runningBassAvg) : 1;

    let isBeat = false;
    if ((this.data.bass > 0.28 && bassRatio > 1.22 && (now - this.lastBeatTime > 140)) || (flux > 0.18 && (now - this.lastBeatTime > 160))) {
      isBeat = true;
      this.lastBeatTime = now;
      this.data.beatPulse = 1.0;
    } else {
      this.data.beatPulse *= 0.84; // Decaimiento ágil
    }

    this.data.isBeat = isBeat;
    this.data.isPlaying = true;

    return this.data;
  }
}



