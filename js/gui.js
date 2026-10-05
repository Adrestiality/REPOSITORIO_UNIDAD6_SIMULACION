/**
 * ============================================================================
 * SIMULACIÓN POÉTICA 2D - UNIDAD 6 (UPB)
 * Módulo de Interfaz Gráfica (dat.GUI) y Monitor de Coreografía Musical
 * ============================================================================
 */

class SimulationGUI {
  constructor() {
    this.gui = null;
    this.isVisible = true;
    this.controllers = {};

    this.params = {
      // Monitor de Coreografía Rítmica
      currentBeatCategory: 'SÚPER BAJO',
      currentChoreography: 'MANDALAS BOTÁNICAS',
      songTime: '0:00',

      // Saltos Rápidos de Coreografía
      jumpIntro: () => this.seekSong(0),
      jumpFirstTension: () => this.seekSong(58.0),
      jumpBlackHole: () => this.seekSong(123.0),
      jumpSupernova: () => this.seekSong(162.0),
      jumpOutro: () => this.seekSong(188.0),

      // Control de Simulación
      isPaused: false,
      toggleFullscreen: () => toggleFullscreenMode(),
      clearCanvas: () => this.onClearCanvas(),
      reseedAgents: () => this.onReseedAgents(),

      // Audio (Black Swan)
      audioPlay: () => this.onAudioPlay(),
      audioPause: () => this.onAudioPause(),
      audioRestart: () => this.onAudioRestart(),
      volume: 0.8,
      audioStatus: 'Esperando inicio',

      // Visualización & HUD
      showHUD: true,

      // Población de Agentes de Tinta / Sangre
      physarum: {
        numAgents: 650,          // 650 partículas de tinta / sangre
        stepSize: 4.5,           // Velocidad equilibrada de time-lapse
        sensorAngle: 34,
        sensorDist: 16,
        turnAngle: 36,
        depositRadius: 1.4,      // Filamentos capilares nítidos
        depositAlpha: 65
      },

      // Población de Agentes Limpiadores (Luz Blanca / Borradores)
      cleaners: {
        enableCleaners: true,
        numCleaners: 280,        // 280 partículas de luz
        cleanerSpeed: 4.8,       // Velocidad ágil
        cleanerRadius: 7.5,      // Aerógrafo suave difuminado
        cleanerStrength: 55,
        cleanerSensorDist: 18
      },

      // Física de Fluidos
      fluid: {
        enableDiffusion: true,
        diffusionRate: 0.5,
        enableEvaporation: true,
        evaporationRate: 4.0
      },

      // Cursor
      cursor: {
        cursorMode: 'Espátula / Limpiador',
        cursorRadius: 65,
        cursorStrength: 1.0,
        showCursorRing: true
      }
    };

    this.init();
  }

  init() {
    this.gui = new dat.GUI({ width: 340, autoPlace: true });
    this.gui.domElement.id = 'custom-dat-gui';

    // --- CARPETA 1: MONITOR DE COREOGRAFÍA (262 BEATS) ---
    const choreoFolder = this.gui.addFolder('Coreografía Musical (262 Beats)');
    this.controllers.currentBeatCategory = choreoFolder.add(this.params, 'currentBeatCategory')
      .name('Intensidad Beat')
      .listen();
    this.controllers.currentChoreography = choreoFolder.add(this.params, 'currentChoreography')
      .name('Forma Activa')
      .listen();
    this.controllers.songTime = choreoFolder.add(this.params, 'songTime')
      .name('Tiempo Audio')
      .listen();

    choreoFolder.add(this.params, 'jumpIntro').name('⏭ 0:00 Mandalas de Paz');
    choreoFolder.add(this.params, 'jumpFirstTension').name('⏭ 1:01 Ondas de Choque');
    choreoFolder.add(this.params, 'jumpBlackHole').name('⏭ 2:03 AGUJERO NEGRO (Vivo)');
    choreoFolder.add(this.params, 'jumpSupernova').name('⏭ 2:42 SUPERNOVA (Cíclica)');
    choreoFolder.add(this.params, 'jumpOutro').name('⏭ 3:03 Descenso Etéreo');
    choreoFolder.open();

    // --- CARPETA 2: AUDIO REACTIVO ---
    const audioFolder = this.gui.addFolder('Música (Black Swan)');
    audioFolder.add(this.params, 'audioPlay').name('▶ Reproducir Audio');
    audioFolder.add(this.params, 'audioPause').name('⏸ Pausar Audio');
    audioFolder.add(this.params, 'audioRestart').name('⏮ Reiniciar');

    this.controllers.volume = audioFolder.add(this.params, 'volume', 0.0, 1.0, 0.01)
      .name('Volumen')
      .onChange((val) => {
        if (typeof audioEngine !== 'undefined' && audioEngine) {
          audioEngine.setVolume(val);
        }
      });

    this.controllers.audioStatus = audioFolder.add(this.params, 'audioStatus')
      .name('Estado Audio')
      .listen();
    audioFolder.open();

    // --- CARPETA 3: AGENTES LIMPIADORES (Luz Blanca) ---
    const cleanFolder = this.gui.addFolder('Agentes Limpiadores (Luz Blanca)');
    this.controllers.enableCleaners = cleanFolder.add(this.params.cleaners, 'enableCleaners').name('Activar Limpiadores');
    this.controllers.numCleaners = cleanFolder.add(this.params.cleaners, 'numCleaners', 50, 800, 10)
      .name('Nº Partículas Luz')
      .onChange((count) => {
        if (typeof setCleanerCount === 'function') {
          setCleanerCount(count);
        }
      });
    this.controllers.cleanerRadius = cleanFolder.add(this.params.cleaners, 'cleanerRadius', 3.0, 25.0, 0.5).name('Radio Aerógrafo (px)');
    this.controllers.cleanerStrength = cleanFolder.add(this.params.cleaners, 'cleanerStrength', 10, 120, 2).name('Fuerza Borrado');
    this.controllers.cleanerSpeed = cleanFolder.add(this.params.cleaners, 'cleanerSpeed', 1.0, 15.0, 0.2).name('Velocidad Base');
    cleanFolder.open();

    // --- CARPETA 4: AGENTES DE TINTA (Sangre & Brea) ---
    const physFolder = this.gui.addFolder('Agentes de Tinta (Oscuridad)');
    this.controllers.numAgents = physFolder.add(this.params.physarum, 'numAgents', 100, 1500, 25)
      .name('Nº Partículas Tinta')
      .onChange((newCount) => {
        if (typeof setAgentCount === 'function') {
          setAgentCount(newCount);
        }
      });
    this.controllers.stepSize = physFolder.add(this.params.physarum, 'stepSize', 1.0, 15.0, 0.2).name('Velocidad Base');
    this.controllers.depositRadius = physFolder.add(this.params.physarum, 'depositRadius', 0.6, 3.5, 0.1).name('Grosor Depósito');
    this.controllers.depositAlpha = physFolder.add(this.params.physarum, 'depositAlpha', 10, 160, 2).name('Opacidad Tinta');
    physFolder.close();

    // --- CARPETA 5: FÍSICA DEL FLUIDO ---
    const fluidFolder = this.gui.addFolder('Física del Fluido');
    this.controllers.enableDiffusion = fluidFolder.add(this.params.fluid, 'enableDiffusion').name('Activar Difusión');
    this.controllers.diffusionRate = fluidFolder.add(this.params.fluid, 'diffusionRate', 0.0, 2.0, 0.1).name('Tasa Difusión (px)');
    this.controllers.enableEvaporation = fluidFolder.add(this.params.fluid, 'enableEvaporation').name('Activar Secado');
    this.controllers.evaporationRate = fluidFolder.add(this.params.fluid, 'evaporationRate', 0.5, 20, 0.5).name('Tasa Secado (Evap)');
    fluidFolder.close();

    // --- CARPETA 6: CURSOR ---
    const cursorFolder = this.gui.addFolder('Cursor ("Can\'t Help Myself")');
    this.controllers.cursorMode = cursorFolder.add(this.params.cursor, 'cursorMode', ['Espátula / Limpiador', 'Vertido de Tinta'])
      .name('Modo Cursor (C)')
      .onChange((mode) => {
        this.showToast(`Modo Cursor: ${mode}`);
      });
    this.controllers.cursorRadius = cursorFolder.add(this.params.cursor, 'cursorRadius', 15, 140, 1).name('Radio Cursor');
    this.controllers.cursorStrength = cursorFolder.add(this.params.cursor, 'cursorStrength', 0.2, 2.5, 0.1).name('Fuerza Cursor');
    this.controllers.showCursorRing = cursorFolder.add(this.params.cursor, 'showCursorRing').name('Mostrar Guía Visual');
    cursorFolder.close();

    // --- CARPETA 7: SIMULACIÓN & VISTA ---
    const simFolder = this.gui.addFolder('Simulación & Vista');
    this.controllers.isPaused = simFolder.add(this.params, 'isPaused')
      .name('Pausar (P / Espacio)')
      .listen()
      .onChange((value) => {
        if (typeof togglePauseSimulation === 'function') {
          togglePauseSimulation(value);
        }
      });
    simFolder.add(this.params, 'toggleFullscreen').name('Pantalla Completa (F)');
    simFolder.add(this.params, 'clearCanvas').name('Limpiar Lienzo');
    simFolder.add(this.params, 'reseedAgents').name('Reubicar Agentes');
    this.controllers.showHUD = simFolder.add(this.params, 'showHUD')
      .name('Mostrar Info HUD')
      .onChange((val) => {
        this.toggleHUD(val);
      });
    simFolder.close();

    this.setupKeyboardShortcuts();
  }

  seekSong(seconds) {
    if (typeof audioEngine !== 'undefined' && audioEngine && audioEngine.audioElement) {
      audioEngine.audioElement.currentTime = seconds;
      if (!audioEngine.isPlaying) {
        audioEngine.play();
      }
      this.showToast(`Saltando a: ${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`);
    }
  }

  seekToTimelineState(stateIdx) {
    if (typeof choreographyEngine !== 'undefined' && choreographyEngine) {
      const targetTime = choreographyEngine.jumpToState(stateIdx);
      this.seekSong(targetTime);
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'h' || e.key === 'H') this.toggleVisibility();
      if (e.key === 'c' || e.key === 'C') this.toggleCursorMode();
      if (e.key === 'f' || e.key === 'F') toggleFullscreenMode();
    });
  }

  updateChoreographyReadout(info, formattedTime) {
    this.params.currentBeatCategory = info.category;
    this.params.currentChoreography = info.mode;
    this.params.songTime = formattedTime;
  }

  toggleCursorMode() {
    if (this.params.cursor.cursorMode === 'Espátula / Limpiador') {
      this.params.cursor.cursorMode = 'Vertido de Tinta';
    } else {
      this.params.cursor.cursorMode = 'Espátula / Limpiador';
    }
    this.gui.updateDisplay();
    this.showToast(`Modo Cursor: ${this.params.cursor.cursorMode}`);
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    const guiElement = this.gui.domElement.parentElement;
    const hudElement = document.getElementById('hud-overlay');
    const sceneIndicator = document.getElementById('scene-indicator');
    const promptElement = document.getElementById('audio-start-prompt');

    if (guiElement) guiElement.classList.toggle('gui-custom-hidden', !this.isVisible);
    if (hudElement) hudElement.classList.toggle('hud-hidden', !this.isVisible);
    if (sceneIndicator) sceneIndicator.classList.toggle('hud-hidden', !this.isVisible);
    if (promptElement && !this.isVisible) promptElement.classList.add('prompt-hidden');

    this.showToast(this.isVisible ? 'Interfaz visible (H)' : 'Performance puro (Presiona H para restaurar)');
  }

  toggleHUD(show) {
    const hudElement = document.getElementById('hud-overlay');
    const sceneIndicator = document.getElementById('scene-indicator');
    if (hudElement) hudElement.classList.toggle('hud-hidden', !show);
    if (sceneIndicator) sceneIndicator.classList.toggle('hud-hidden', !show);
  }

  showToast(text) {
    const toast = document.getElementById('toast-message');
    if (!toast) return;

    toast.innerText = text;
    toast.classList.add('show');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  onClearCanvas() {
    if (typeof resetInkBuffer === 'function') {
      resetInkBuffer();
      this.showToast('Lienzo limpiado');
    }
  }

  onReseedAgents() {
    if (typeof reseedAgentsPool === 'function') {
      reseedAgentsPool();
      this.showToast('Agentes reubicados');
    }
  }

  onAudioPlay() {
    if (typeof startAudioPerformance === 'function') {
      startAudioPerformance();
    }
  }

  onAudioPause() {
    if (typeof audioEngine !== 'undefined' && audioEngine) {
      audioEngine.pause();
      this.setAudioStatus('Pausado');
      this.showToast('Audio Pausado');
    }
  }

  onAudioRestart() {
    if (typeof audioEngine !== 'undefined' && audioEngine) {
      audioEngine.restart();
      this.showToast('Audio Reiniciado');
    }
  }

  setAudioStatus(statusText) {
    this.params.audioStatus = statusText;
    const audioHud = document.getElementById('hud-audio-state');
    if (audioHud) {
      audioHud.innerText = `Audio: ${statusText}`;
    }
  }

  setPauseState(isPaused) {
    this.params.isPaused = isPaused;
    const simHud = document.getElementById('hud-sim-state');
    if (simHud) {
      simHud.innerText = isPaused ? 'Estado: Pausado' : 'Estado: En marcha';
    }
  }
}

let simGUI = null;

