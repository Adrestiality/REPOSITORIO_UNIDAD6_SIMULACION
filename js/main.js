/**
 * ============================================================================
 * SIMULACIÓN POÉTICA 2D - UNIDAD 6 (UPB)
 * Creative Coding & Sistemas Emergentes
 * Physarum Polycephalum, Física de Fluidos y Reactividad Espectral "Black Swan"
 * ============================================================================
 */

// Buffers y Lienzos
let inkBuffer; // Buffer secundario 2D para las trazas de Physarum

// Arreglo de Agentes Autónomos
let agents = [];

// Motores de Fluido y Audio Reactivo
let fluidSystem = null;
let audioEngine = null;

// Estado de la Simulación y Escena Activa
let currentSceneId = 1;
let isSimulationPaused = false;

// Color base del lienzo (Blanco marfil / papel poético)
const COLOR_MARFIL = '#f4f1ea';

/**
 * DEFINICIÓN DE LAS 4 ESCENAS DRAMÁTICAS (BLACK SWAN SCORE)
 */
const SCENES = {
  1: {
    id: 1,
    roman: 'ACTO I',
    name: 'CISNE BLANCO',
    subtitle: 'Orden & Lienzo Limpio',
    evaporationRate: 14.0,   // Secado muy rápido (pantalla limpia)
    diffusionRate: 0.6,      // Difusión sutil
    stepSize: 1.1,           // Agentes lentos y ceremoniales
    sensorAngle: 28,
    sensorDist: 18,
    turnAngle: 24,
    depositRadius: 1.8,      // Trazos finos
    depositAlpha: 18,        // Muy tenue
    cursorMode: 'Espátula / Limpiador',
    cursorRadius: 65,
    cursorStrength: 1.3,
    palette: 'white-swan',
    guiName: '1. Cisne Blanco',
    targetAgents: 180
  },
  2: {
    id: 2,
    roman: 'ACTO II',
    name: 'TENSIÓN',
    subtitle: 'La Grieta & Tinta Fluida',
    evaporationRate: 5.5,    // Evaporación media, acumulación en el centro
    diffusionRate: 0.8,
    stepSize: 2.2,           // Agentes aceleran
    sensorAngle: 35,
    sensorDist: 24,
    turnAngle: 32,
    depositRadius: 3.2,
    depositAlpha: 45,        // Ramificaciones densas
    cursorMode: 'Espátula / Limpiador',
    cursorRadius: 55,
    cursorStrength: 1.0,
    palette: 'tension',
    guiName: '2. Tensión',
    targetAgents: 230
  },
  3: {
    id: 3,
    roman: 'ACTO III',
    name: 'CISNE NEGRO',
    subtitle: 'Clímax & "Can\'t Help Myself"',
    evaporationRate: 1.2,    // Mínima evaporación (desborde de tinta)
    diffusionRate: 1.2,
    stepSize: 2.8,           // Movimiento agresivo y frenético
    sensorAngle: 42,
    sensorDist: 30,
    turnAngle: 40,
    depositRadius: 5.2,      // Manchas anchas y pesadas
    depositAlpha: 85,        // Emisión máxima
    cursorMode: 'Vertido de Tinta', // Pulso que agita la tinta
    cursorRadius: 85,
    cursorStrength: 1.8,
    palette: 'black-swan',
    guiName: '3. Cisne Negro',
    targetAgents: 320
  },
  4: {
    id: 4,
    roman: 'ACTO IV',
    name: 'METAMORFOSIS',
    subtitle: 'Resolución Áurea & Calma',
    evaporationRate: 7.5,    // Evaporación vuelve a subir para limpiar suavemente
    diffusionRate: 0.9,
    stepSize: 1.4,           // Calma serena
    sensorAngle: 30,
    sensorDist: 20,
    turnAngle: 26,
    depositRadius: 2.2,
    depositAlpha: 38,
    cursorMode: 'Vertido de Tinta',
    cursorRadius: 60,
    cursorStrength: 1.0,
    palette: 'gold',         // Tono dorado noble sobre blanco
    guiName: '4. Metamorfosis',
    targetAgents: 210
  }
};

/**
 * Setup principal de p5.js (Entorno 2D estricto)
 */
function setup() {
  // 1. Crear Lienzo Principal 2D a pantalla completa
  const mainCanvas = createCanvas(windowWidth, windowHeight);
  mainCanvas.parent(document.body);
  pixelDensity(1); // 60 FPS estables

  // 2. Crear Buffer Secundario 2D (inkBuffer)
  inkBuffer = createGraphics(windowWidth, windowHeight);
  inkBuffer.pixelDensity(1);
  resetInkBuffer();

  // 3. Inicializar Motores de Fluidos, Audio e Interfaz
  fluidSystem = new PhysarumFluidSystem();
  audioEngine = new AudioReactiveEngine();
  simGUI = new SimulationGUI();

  // 4. Inicializar Población de Agentes
  initAgents();

  // 5. Aplicar la Escena Inicial (Acto I: Cisne Blanco)
  switchScene(1, false);

  // 6. Configuración de cursor interactivo
  noCursor();
}

/**
 * Bucle Principal de Renderizado (draw)
 */
function draw() {
  // --- ACTUALIZACIÓN DE AUDIO REACTIVO ---
  const audioData = audioEngine ? audioEngine.update() : {};

  // Actualizar medidor visual en el HUD
  updateAudioVisualizer(audioData);

  // --- FASE 1: SIMULACIÓN ACTIVA ---
  if (!isSimulationPaused) {
    const currentCursorParams = simGUI ? simGUI.params.cursor : {};
    const currentPhysParams = simGUI ? simGUI.params.physarum : {};
    const currentFluidParams = simGUI ? simGUI.params.fluid : {};
    const activePalette = currentPhysParams.palette || 'black-swan';

    // 1. Interacción del Cursor (Espátula / Vertido adaptado a la música)
    if (mouseIsPressed) {
      let activeParams = { ...currentCursorParams };
      if (keyIsDown(SHIFT) || mouseButton === RIGHT) {
        activeParams.cursorMode = (activeParams.cursorMode === 'Espátula / Limpiador')
          ? 'Vertido de Tinta'
          : 'Espátula / Limpiador';
      }

      fluidSystem.applyCursorStimulus(
        inkBuffer,
        agents,
        mouseX,
        mouseY,
        pmouseX,
        pmy(),
        activeParams,
        activePalette,
        audioData
      );
    }

    // 2. Cargar píxeles para lectura de sensores de alta velocidad
    inkBuffer.loadPixels();
    const pixelArray = inkBuffer.pixels;
    const bufW = inkBuffer.width;
    const bufH = inkBuffer.height;

    // 3. Actualizar Agentes con modulación armónica del audio
    for (let i = 0; i < agents.length; i++) {
      agents[i].update(pixelArray, bufW, bufH, inkBuffer, currentPhysParams, audioData);
    }

    // 4. Física de Fluidos: Difusión capilar y Secado progresivo
    fluidSystem.processFluidDynamics(inkBuffer, currentFluidParams, audioData);
  }

  // --- FASE 2: RENDERIZADO VISUAL ---
  image(inkBuffer, 0, 0, width, height);

  // Renderizar indicador visual del cursor
  if (simGUI && simGUI.params.cursor.showCursorRing) {
    const currentPhysParams = simGUI ? simGUI.params.physarum : {};
    fluidSystem.renderCursorFeedback(
      this,
      mouseX,
      mouseY,
      simGUI.params.cursor,
      currentPhysParams.palette,
      audioData
    );
  }

  // Actualizar métricas en el HUD
  updateHUDMetrics();
}

/**
 * Helper para posición Y previa segura
 */
function pmy() {
  return pmouseY !== undefined ? pmouseY : mouseY;
}

/**
 * Actualiza el medidor de energía orquestal en el HUD
 */
function updateAudioVisualizer(audioData) {
  const meterFill = document.getElementById('meter-fill');
  const meterVal = document.getElementById('meter-val');
  if (meterFill && meterVal) {
    const pct = Math.round((audioData.energy || 0) * 100);
    meterFill.style.width = `${pct}%`;
    meterVal.innerText = `${pct}%`;
  }
}

/**
 * Inicia la reproducción de la música y desbloquea el contexto de audio
 */
function startAudioPerformance() {
  const prompt = document.getElementById('audio-start-prompt');
  if (prompt) {
    prompt.classList.add('prompt-hidden');
  }

  if (audioEngine) {
    audioEngine.play().then((success) => {
      if (success && simGUI) {
        simGUI.showToast('🎵 Música activada: BTS - Black Swan');
      }
    });
  }
}

/**
 * Evento al hacer clic en el lienzo: si el audio no ha iniciado, desbloquearlo
 */
function mousePressed() {
  if (audioEngine && !audioEngine.isPlaying && !audioEngine.hasUserInteracted) {
    startAudioPerformance();
  }
}

/**
 * ============================================================================
 * TRANSICIÓN DE ESCENAS DRAMÁTICAS (ACTOS 1 AL 4)
 * ============================================================================
 */
function switchScene(sceneId, notify = true) {
  const scene = SCENES[sceneId];
  if (!scene) return;

  currentSceneId = sceneId;

  if (simGUI) {
    simGUI.params.fluid.evaporationRate = scene.evaporationRate;
    simGUI.params.fluid.diffusionRate = scene.diffusionRate;

    simGUI.params.physarum.stepSize = scene.stepSize;
    simGUI.params.physarum.sensorAngle = scene.sensorAngle;
    simGUI.params.physarum.sensorDist = scene.sensorDist;
    simGUI.params.physarum.turnAngle = scene.turnAngle;
    simGUI.params.physarum.depositRadius = scene.depositRadius;
    simGUI.params.physarum.depositAlpha = scene.depositAlpha;
    simGUI.params.physarum.palette = scene.palette;
    simGUI.params.physarum.numAgents = scene.targetAgents;

    simGUI.params.cursor.cursorMode = scene.cursorMode;
    simGUI.params.cursor.cursorRadius = scene.cursorRadius;
    simGUI.params.cursor.cursorStrength = scene.cursorStrength;

    simGUI.params.currentSceneName = scene.guiName;
    simGUI.updateDisplay();

    if (notify) {
      simGUI.showToast(`${scene.roman}: ${scene.name} (${scene.subtitle})`);
    }
  }

  setAgentCount(scene.targetAgents);

  const romanElem = document.getElementById('scene-roman');
  const titleElem = document.getElementById('scene-title');
  const descElem = document.getElementById('scene-desc');
  const indicator = document.getElementById('scene-indicator');

  if (romanElem) romanElem.innerText = scene.roman;
  if (titleElem) titleElem.innerText = scene.name;
  if (descElem) descElem.innerText = scene.subtitle;
  if (indicator) {
    indicator.className = `scene-indicator-container act-${scene.id}`;
  }
}

/**
 * Inicializa la población de agentes
 */
function initAgents() {
  const targetCount = simGUI ? simGUI.params.physarum.numAgents : 180;
  const spawnMode = simGUI ? simGUI.params.physarum.spawnMode : 'Centro Circular';
  const config = simGUI ? simGUI.params.physarum : {};

  agents = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < targetCount; i++) {
    let x, y, angle;

    if (spawnMode === 'Centro Circular') {
      const r = random(5, min(width, height) * 0.18);
      const theta = random(TWO_PI);
      x = cx + Math.cos(theta) * r;
      y = cy + Math.sin(theta) * r;
      angle = theta + random(-0.4, 0.4);
    } else if (spawnMode === 'Anillo Perimetral') {
      const r = min(width, height) * 0.42;
      const theta = random(TWO_PI);
      x = cx + Math.cos(theta) * r;
      y = cy + Math.sin(theta) * r;
      angle = theta + Math.PI + random(-0.3, 0.3);
    } else {
      x = random(width);
      y = random(height);
      angle = random(TWO_PI);
    }

    agents.push(new Agent(x, y, angle, config));
  }
}

function setAgentCount(newCount) {
  const currentCount = agents.length;
  const config = simGUI ? simGUI.params.physarum : {};

  if (newCount > currentCount) {
    const toAdd = newCount - currentCount;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(10, min(width, height) * 0.2);
      const theta = random(TWO_PI);
      agents.push(new Agent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, theta, config));
    }
  } else if (newCount < currentCount) {
    agents.length = newCount;
  }
}

function reseedAgentsPool() {
  initAgents();
}

function resetInkBuffer() {
  if (inkBuffer) {
    inkBuffer.background(COLOR_MARFIL);
  }
}

function toggleFullscreenMode() {
  const isFS = fullscreen();
  fullscreen(!isFS);
  if (simGUI) {
    simGUI.showToast(!isFS ? 'Pantalla Completa Activada (F)' : 'Pantalla Completa Desactivada (F)');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  const tempBuffer = createGraphics(windowWidth, windowHeight);
  tempBuffer.pixelDensity(1);
  tempBuffer.background(COLOR_MARFIL);
  tempBuffer.image(inkBuffer, 0, 0);

  inkBuffer = tempBuffer;
}

/**
 * ============================================================================
 * CONTROL DE TECLADO Y PAUSA
 * ============================================================================
 */
function keyPressed() {
  // Desbloquear audio si aún no se ha iniciado
  if (audioEngine && !audioEngine.isPlaying && !audioEngine.hasUserInteracted) {
    startAudioPerformance();
  }

  // Teclas 1, 2, 3, 4: Cambio de Escenas
  if (key === '1') { switchScene(1); return false; }
  if (key === '2') { switchScene(2); return false; }
  if (key === '3') { switchScene(3); return false; }
  if (key === '4') { switchScene(4); return false; }

  // Tecla 'F' o 'f': Pantalla Completa
  if (key === 'f' || key === 'F') {
    toggleFullscreenMode();
    return false;
  }

  // Tecla 'P', 'p' o Barra Espaciadora: Pausa
  if (key === 'p' || key === 'P' || keyCode === 32) {
    togglePauseSimulation(!isSimulationPaused);
    return false;
  }
}

function togglePauseSimulation(pauseState) {
  isSimulationPaused = pauseState;

  if (simGUI) {
    simGUI.setPauseState(isSimulationPaused);
  }

  if (isSimulationPaused) {
    if (audioEngine && audioEngine.isPlaying) {
      audioEngine.pause();
      if (simGUI) simGUI.setAudioStatus('Pausado (Sincronizado)');
    }
    if (simGUI) simGUI.showToast('Simulación Pausada (P)');
  } else {
    if (audioEngine && !audioEngine.isPlaying) {
      audioEngine.play();
      if (simGUI) simGUI.setAudioStatus('Reproduciendo');
    }
    if (simGUI) simGUI.showToast('Simulación Reanudada');
  }
}

/**
 * ============================================================================
 * HUD & MÉTRICAS
 * ============================================================================
 */
let lastFpsUpdate = 0;
function updateHUDMetrics() {
  if (millis() - lastFpsUpdate > 250) {
    const fpsElement = document.getElementById('hud-fps');
    if (fpsElement) {
      const currentFPS = Math.round(frameRate());
      const scene = SCENES[currentSceneId] || SCENES[1];
      fpsElement.innerText = `FPS: ${currentFPS} | ${scene.roman} | Agentes: ${agents.length}`;
    }
    lastFpsUpdate = millis();
  }
}
