/**
 * ============================================================================
 * SIMULACIÓN POÉTICA 2D - UNIDAD 6 (UPB)
 * Módulo de Interfaz Gráfica (dat.GUI) y Gestión de Escenas Dramáticas
 * ============================================================================
 */

class SimulationGUI {
  constructor() {
    this.gui = null;
    this.isVisible = true;
    this.controllers = {};

    // Objeto central de parámetros
    this.params = {
      // Control de Escenas Dramáticas (Teclas 1, 2, 3, 4)
      currentSceneName: '1. Cisne Blanco',
      scene1: () => switchScene(1),
      scene2: () => switchScene(2),
      scene3: () => switchScene(3),
      scene4: () => switchScene(4),

      // Control de Simulación
      isPaused: false,
      toggleFullscreen: () => toggleFullscreenMode(),
      clearCanvas: () => this.onClearCanvas(),
      reseedAgents: () => this.onReseedAgents(),

      // Audio Reactivo (Black Swan)
      audioPlay: () => this.onAudioPlay(),
      audioPause: () => this.onAudioPause(),
      audioRestart: () => this.onAudioRestart(),
      volume: 0.8,
      audioStatus: 'Esperando inicio',

      // Visualización & HUD
      showHUD: true,

      // Parámetros de Agentes
      physarum: {
        numAgents: 220,
        stepSize: 1.1,
        sensorAngle: 28,
        sensorDist: 18,
        turnAngle: 24,
        depositRadius: 1.8,
        depositAlpha: 18,
        palette: 'white-swan',
        spawnMode: 'Centro Circular'
      },

      // Física de Fluidos
      fluid: {
        enableDiffusion: true,
        diffusionRate: 0.6,
        enableEvaporation: true,
        evaporationRate: 14
      },

      // Herramienta / Cursor
      cursor: {
        cursorMode: 'Espátula / Limpiador',
        cursorRadius: 65,
        cursorStrength: 1.2,
        showCursorRing: true
      }
    };

    this.init();
  }

  /**
   * Inicializa dat.GUI
   */
  init() {
    this.gui = new dat.GUI({ width: 330, autoPlace: true });
    this.gui.domElement.id = 'custom-dat-gui';

    // --- CARPETA 1: ACTOS DRAMÁTICOS (1 al 4) ---
    const sceneFolder = this.gui.addFolder('Narrativa (Teclas 1-4)');
    this.controllers.currentSceneName = sceneFolder.add(this.params, 'currentSceneName', [
      '1. Cisne Blanco',
      '2. Tensión',
      '3. Cisne Negro',
      '4. Metamorfosis'
    ]).name('Acto Activo').onChange((val) => {
      const sceneId = parseInt(val.charAt(0), 10);
      switchScene(sceneId);
    });

    sceneFolder.add(this.params, 'scene1').name('[1] Cisne Blanco');
    sceneFolder.add(this.params, 'scene2').name('[2] Tensión');
    sceneFolder.add(this.params, 'scene3').name('[3] Cisne Negro');
    sceneFolder.add(this.params, 'scene4').name('[4] Metamorfosis');
    sceneFolder.open();

    // --- CARPETA 2: AUDIO REACTIVO (Black Swan) ---
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

    // --- CARPETA 3: SIMULACIÓN & VISTA ---
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

    // --- CARPETA 4: FÍSICA DEL FLUIDO ---
    const fluidFolder = this.gui.addFolder('Física del Fluido (Tinta)');
    this.controllers.enableDiffusion = fluidFolder.add(this.params.fluid, 'enableDiffusion').name('Activar Difusión');
    this.controllers.diffusionRate = fluidFolder.add(this.params.fluid, 'diffusionRate', 0.0, 2.5, 0.1).name('Tasa Difusión (px)');
    this.controllers.enableEvaporation = fluidFolder.add(this.params.fluid, 'enableEvaporation').name('Activar Secado');
    this.controllers.evaporationRate = fluidFolder.add(this.params.fluid, 'evaporationRate', 0.5, 22, 0.5).name('Tasa Secado (Evap)');
    fluidFolder.close();

    // --- CARPETA 5: CURSOR / ESTÍMULO ---
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

    // --- CARPETA 6: AGENTES PHYSARUM ---
    const physFolder = this.gui.addFolder('Agentes Physarum 2D');
    this.controllers.numAgents = physFolder.add(this.params.physarum, 'numAgents', 50, 600, 10)
      .name('Nº Agentes')
      .onChange((newCount) => {
        if (typeof setAgentCount === 'function') {
          setAgentCount(newCount);
        }
      });

    this.controllers.stepSize = physFolder.add(this.params.physarum, 'stepSize', 0.5, 5.0, 0.1).name('Velocidad Base');
    this.controllers.sensorAngle = physFolder.add(this.params.physarum, 'sensorAngle', 10, 80, 1).name('Ángulo Sensores (°)');
    this.controllers.sensorDist = physFolder.add(this.params.physarum, 'sensorDist', 8, 50, 1).name('Distancia Sensor (px)');
    this.controllers.turnAngle = physFolder.add(this.params.physarum, 'turnAngle', 10, 65, 1).name('Fuerza de Giro (°)');
    this.controllers.depositRadius = physFolder.add(this.params.physarum, 'depositRadius', 1.0, 8.0, 0.2).name('Grosor Depósito');
    this.controllers.depositAlpha = physFolder.add(this.params.physarum, 'depositAlpha', 5, 120, 1).name('Opacidad Tinta');
    this.controllers.spawnMode = physFolder.add(this.params.physarum, 'spawnMode', ['Centro Circular', 'Aleatorio', 'Anillo Perimetral'])
      .name('Patrón Siembra')
      .onChange(() => this.onReseedAgents());
    physFolder.close();

    this.setupKeyboardShortcuts();
  }

  /**
   * Configura atajos globales
   */
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'h' || e.key === 'H') this.toggleVisibility();
      if (e.key === 'c' || e.key === 'C') this.toggleCursorMode();
      if (e.key === 'f' || e.key === 'F') toggleFullscreenMode();

      if (e.key === '1') switchScene(1);
      if (e.key === '2') switchScene(2);
      if (e.key === '3') switchScene(3);
      if (e.key === '4') switchScene(4);
    });
  }

  /**
   * Refresca todos los controladores visuales de dat.GUI
   */
  updateDisplay() {
    for (const key in this.controllers) {
      if (this.controllers[key] && typeof this.controllers[key].updateDisplay === 'function') {
        this.controllers[key].updateDisplay();
      }
    }
  }

  toggleCursorMode() {
    if (this.params.cursor.cursorMode === 'Espátula / Limpiador') {
      this.params.cursor.cursorMode = 'Vertido de Tinta';
    } else {
      this.params.cursor.cursorMode = 'Espátula / Limpiador';
    }
    this.updateDisplay();
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

// Instancia global accesible
let simGUI = null;
