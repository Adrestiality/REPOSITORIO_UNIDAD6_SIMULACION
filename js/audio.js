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
      bass: 0,        // Graves / Percusión / Bombos orquestales
      mid: 0,         // Medios / Cuerdas / Violines
      treble: 0,      // Agudos / Detalles brillantes
      energy: 0,      // Energía RMS global
      isBeat: false,  // Trigger booleano de golpe rítmico
      beatPulse: 0    // Decaimiento exponencial del golpe (1.0 -> 0.0)
    };

    // Historial y umbrales para detección de beats
    this.beatThreshold = 0.62;
    this.runningBassAvg = 0.3;
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
    this.audioElement.volume = 0.8;
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

      // Analizador FFT
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

      // Nodo de Ganancia
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.8;

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
   * Extrae los valores espectrales del frame actual y calcula los triggers reactivos
   * @returns {Object} Datos de análisis de audio normalizados
   */
  update() {
    // Si no está reproduciendo o no está inicializado el analizador, decaer gradualmente
    if (!this.isPlaying || !this.analyser || !this.freqData) {
      this.data.bass *= 0.92;
      this.data.mid *= 0.92;
      this.data.treble *= 0.92;
      this.data.energy *= 0.92;
      this.data.beatPulse *= 0.88;
      this.data.isBeat = false;
      this.data.isPlaying = this.isPlaying;
      return this.data;
    }

    // Obtener datos de frecuencia (0 a 255 por bin)
    this.analyser.getByteFrequencyData(this.freqData);

    const totalBins = this.freqData.length; // 256 bins

    // Rangos de frecuencia según la orquestación de Black Swan
    // 1. Bass: bins 1 a 14 (~20 Hz a 240 Hz) -> Timbales, chelos graves y bombos
    let bassSum = 0;
    const bassEnd = 14;
    for (let i = 1; i <= bassEnd; i++) {
      bassSum += this.freqData[i];
    }
    const currentBass = (bassSum / bassEnd) / 255;

    // 2. Mid: bins 15 a 70 (~250 Hz a 1200 Hz) -> Cuerdas tensas, violines y piano
    let midSum = 0;
    const midEnd = 70;
    for (let i = 15; i <= midEnd; i++) {
      midSum += this.freqData[i];
    }
    const currentMid = (midSum / (midEnd - 15)) / 255;

    // 3. Treble: bins 71 a 190 (~1300 Hz a 6000 Hz) -> Aire, armónicos y detalles finos
    let trebleSum = 0;
    const trebleEnd = 190;
    for (let i = 71; i <= trebleEnd; i++) {
      trebleSum += this.freqData[i];
    }
    const currentTreble = (trebleSum / (trebleEnd - 71)) / 255;

    // 4. Energía global
    const currentEnergy = (currentBass * 0.45 + currentMid * 0.35 + currentTreble * 0.20);

    // Suavizado temporal (Low-pass filter)
    this.data.bass = this.data.bass * 0.7 + currentBass * 0.3;
    this.data.mid = this.data.mid * 0.7 + currentMid * 0.3;
    this.data.treble = this.data.treble * 0.7 + currentTreble * 0.3;
    this.data.energy = this.data.energy * 0.75 + currentEnergy * 0.25;

    // Detección dinámica de golpes de beat (Surge detection)
    const now = performance.now();
    this.runningBassAvg = this.runningBassAvg * 0.95 + this.data.bass * 0.05;
    const bassRatio = this.runningBassAvg > 0.01 ? (this.data.bass / this.runningBassAvg) : 1;

    let isBeat = false;
    if (this.data.bass > 0.35 && bassRatio > 1.32 && (now - this.lastBeatTime > 190)) {
      isBeat = true;
      this.lastBeatTime = now;
      this.data.beatPulse = 1.0;
    } else {
      this.data.beatPulse *= 0.88; // Decaimiento suave del pulso
    }

    this.data.isBeat = isBeat;
    this.data.isPlaying = true;

    return this.data;
  }
}
