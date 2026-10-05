/**
 * ============================================================================
 * SIMULACIÓN POÉTICA 2D - UNIDAD 6 (UPB)
 * Creative Coding & Sistemas Emergentes
 * Coreografía Musical de 262 Beats · BTS Black Swan (Orchestral)
 * Coexistencia continua de Tinta Negra (Materia) y Luz Marfil (Espacio Limpio)
 * ============================================================================
 */

// Buffers y Lienzos
let inkBuffer;

// Poblaciones Coexistentes de Alta Densidad (Equilibrio de Alto Rendimiento)
let agents = [];         // 650 Partículas de Tinta Negra / Sangre
let cleanerAgents = [];  // 280 Partículas de Luz Blanca / Borradores Marfil

// Motores de Fluido, Audio y Coreografía de 262 Beats
let fluidSystem = null;
let audioEngine = null;
let choreographyEngine = null;

// Estado de la Simulación
let isSimulationPaused = false;

// Color base inicial en escala de grises alabastro pura
const COLOR_BASE_ALABASTRO = '#f5f5f5';

/**
 * Setup principal de p5.js
 */
function setup() {
  const mainCanvas = createCanvas(windowWidth, windowHeight);
  mainCanvas.parent(document.body);
  pixelDensity(1); // 60 FPS estables

  // Buffer secundario de pintura acumulada
  inkBuffer = createGraphics(windowWidth, windowHeight);
  inkBuffer.pixelDensity(1);
  resetInkBuffer();

  // Inicializar Motores
  fluidSystem = new PhysarumFluidSystem();
  audioEngine = new AudioReactiveEngine();
  choreographyEngine = new ChoreographyEngine();
  simGUI = new SimulationGUI();

  // Inicializar Poblaciones (650 Negras y 280 Blancas)
  initAgents();
  initCleanerAgents();

  noCursor();
}

/**
 * Bucle Principal de Renderizado (draw)
 */
function draw() {
  // 1. Métricas de Audio y Tiempo
  const audioData = audioEngine ? audioEngine.update() : {};
  const currentSongTime = (audioEngine && audioEngine.audioElement) ? audioEngine.audioElement.currentTime : 0;

  // 2. Actualizar Motor de Coreografía (262 Beats con Time-lapse orgánico)
  if (choreographyEngine) {
    choreographyEngine.update(currentSongTime);
  }

  // 3. Actualizar HUD y Medidores
  updateChoreographyUI(audioData, currentSongTime);

  // --- FASE 1: SIMULACIÓN ACTIVA ---
  if (!isSimulationPaused) {
    const currentCursorParams = simGUI ? simGUI.params.cursor : {};
    const currentPhysParams = simGUI ? simGUI.params.physarum : {};
    const currentCleanerParams = simGUI ? simGUI.params.cleaners : {};
    const currentFluidParams = simGUI ? simGUI.params.fluid : {};

    // A. Interacción y Agitación del Cursor (Molestar y alterar partículas)
    fluidSystem.disturbSwarmWithCursor(
      [agents, cleanerAgents],
      mouseX,
      mouseY,
      pmouseX,
      pmy(),
      currentCursorParams,
      mouseIsPressed,
      audioData
    );

    if (mouseIsPressed) {
      let activeParams = { ...currentCursorParams };
      if (keyIsDown(SHIFT) || mouseButton === RIGHT) {
        activeParams.cursorMode = (activeParams.cursorMode === 'Espátula / Limpiador')
          ? 'Vertido de Tinta'
          : 'Espátula / Limpiador';
      }

      fluidSystem.applyCursorStimulus(
        inkBuffer,
        mouseX,
        mouseY,
        pmouseX,
        pmy(),
        activeParams,
        choreographyEngine,
        audioData
      );
    }

    // B. Cargar píxeles para lectura de sensores
    inkBuffer.loadPixels();
    const pixelArray = inkBuffer.pixels;
    const bufW = inkBuffer.width;
    const bufH = inkBuffer.height;

    // C. Actualizar Partículas de Tinta Negra (Pintan y trazan filamentos)
    for (let i = 0; i < agents.length; i++) {
      agents[i].update(pixelArray, bufW, bufH, inkBuffer, currentPhysParams, audioData, choreographyEngine);
    }

    // D. Actualizar Partículas Blancas Limpiadoras (Borran con aerógrafos y pluma en beats)
    if (currentCleanerParams.enableCleaners) {
      for (let j = 0; j < cleanerAgents.length; j++) {
        cleanerAgents[j].update(pixelArray, bufW, bufH, inkBuffer, currentCleanerParams, audioData, choreographyEngine);
      }
    }

    // E. Física de Fluidos: Difusión y Secado con tinte progresivo de fondo
    fluidSystem.processFluidDynamics(inkBuffer, currentFluidParams, audioData, choreographyEngine);
  }

  // --- FASE 2: RENDERIZADO VISUAL ---
  image(inkBuffer, 0, 0, width, height);

  // Renderizar la presencia luminosa de las partículas blancas
  if (simGUI && simGUI.params.cleaners.enableCleaners) {
    for (let j = 0; j < cleanerAgents.length; j++) {
      cleanerAgents[j].renderBody(audioData, choreographyEngine);
    }
  }

  // Renderizar guía visual del cursor
  if (simGUI && simGUI.params.cursor.showCursorRing) {
    fluidSystem.renderCursorFeedback(
      this,
      mouseX,
      mouseY,
      simGUI.params.cursor,
      choreographyEngine,
      audioData
    );
  }

  // Métricas FPS
  updateFPSMetrics();
}

/**
 * Helper para posición previa segura
 */
function pmy() {
  return pmouseY !== undefined ? pmouseY : mouseY;
}

/**
 * Formatea segundos a "m:ss"
 */
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Actualiza la información visual en el HUD y en la esquina inferior izquierda
 */
function updateChoreographyUI(audioData, songTime) {
  if (!choreographyEngine) return;

  const info = choreographyEngine.getChoreographyInfo();
  const timeStr = formatTime(songTime);

  // 1. Medidor de beat en HUD
  const beatLabel = document.getElementById('beat-label');
  const meterFill = document.getElementById('meter-fill');
  const meterVal = document.getElementById('meter-val');
  const simState = document.getElementById('hud-sim-state');

  if (beatLabel) beatLabel.innerText = `Beat: ${info.category}`;
  if (meterFill) meterFill.style.width = `${info.weight}%`;
  if (meterVal) meterVal.innerText = `${info.weight}%`;
  if (simState) simState.innerText = `Tiempo: ${timeStr}`;

  // 2. Indicador en la esquina inferior izquierda
  const romanElem = document.getElementById('scene-roman');
  const titleElem = document.getElementById('scene-title');
  const descElem = document.getElementById('scene-desc');
  const indicator = document.getElementById('scene-indicator');

  if (romanElem) romanElem.innerText = info.category.toUpperCase();
  if (titleElem) titleElem.innerText = info.mode;
  if (descElem) {
    descElem.innerText = info.isBigBang
      ? 'Orbe Gravitatorio Central en Vórtice & Fondo Vino Tinto'
      : 'Mandalas Botánicas en Blanco & Rubor';
  }

  if (indicator) {
    indicator.className = `scene-indicator-container ${info.isBigBang ? 'act-3' : 'act-1'}`;
  }

  // 3. Sincronizar lectura con GUI
  if (simGUI) {
    simGUI.updateChoreographyReadout(info, timeStr);
  }
}

/**
 * Desbloquea y arranca el audio
 */
function startAudioPerformance() {
  const prompt = document.getElementById('audio-start-prompt');
  if (prompt) {
    prompt.classList.add('prompt-hidden');
  }

  if (audioEngine) {
    audioEngine.play().then((success) => {
      if (success && simGUI) {
        simGUI.showToast('🎵 Coreografía de 262 Beats iniciada');
      }
    });
  }
}

function mousePressed() {
  if (audioEngine && !audioEngine.isPlaying && !audioEngine.hasUserInteracted) {
    startAudioPerformance();
  }
}

/**
 * Inicialización de Poblaciones Multi-Nodo (Centro + Satélites Laterales)
 */
function initAgents() {
  const targetCount = simGUI ? simGUI.params.physarum.numAgents : 650;
  const config = simGUI ? simGUI.params.physarum : {};

  agents = [];
  const cx = width / 2;
  const cy = height / 2;
  const nodes = choreographyEngine ? choreographyEngine.getAttractorNodes(cx, cy) : [{ id: 0, x: cx, y: cy }];

  for (let i = 0; i < targetCount; i++) {
    const nodeIdx = i % nodes.length;
    const node = nodes[nodeIdx];
    const r = random(5, min(width, height) * 0.20);
    const theta = random(TWO_PI);
    const x = node.x + Math.cos(theta) * r;
    const y = node.y + Math.sin(theta) * r;
    const angle = theta + random(-0.4, 0.4);

    const ag = new Agent(x, y, angle, config);
    ag.targetNodeId = node.id;
    agents.push(ag);
  }
}

function initCleanerAgents() {
  const targetCount = simGUI ? simGUI.params.cleaners.numCleaners : 280;
  const config = simGUI ? simGUI.params.cleaners : {};

  cleanerAgents = [];
  const cx = width / 2;
  const cy = height / 2;
  const nodes = choreographyEngine ? choreographyEngine.getAttractorNodes(cx, cy) : [{ id: 0, x: cx, y: cy }];

  for (let i = 0; i < targetCount; i++) {
    const nodeIdx = i % nodes.length;
    const node = nodes[nodeIdx];
    const r = random(min(width, height) * 0.04, min(width, height) * 0.22);
    const theta = random(TWO_PI);
    const x = node.x + Math.cos(theta) * r;
    const y = node.y + Math.sin(theta) * r;
    const angle = theta + Math.PI / 2 + random(-0.4, 0.4);

    const cl = new CleanerAgent(x, y, angle, config);
    cl.targetNodeId = node.id;
    cleanerAgents.push(cl);
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
      const r = random(5, min(width, height) * 0.25);
      const theta = random(TWO_PI);
      agents.push(new Agent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, theta, config));
    }
  } else if (newCount < currentCount) {
    agents.length = newCount;
  }
}

function setCleanerCount(newCount) {
  const currentCount = cleanerAgents.length;
  const config = simGUI ? simGUI.params.cleaners : {};

  if (newCount > currentCount) {
    const toAdd = newCount - currentCount;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(5, min(width, height) * 0.28);
      const theta = random(TWO_PI);
      cleanerAgents.push(new CleanerAgent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, random(TWO_PI), config));
    }
  } else if (newCount < currentCount) {
    cleanerAgents.length = newCount;
  }
}

function reseedAgentsPool() {
  initAgents();
  initCleanerAgents();
}

function resetInkBuffer() {
  if (inkBuffer) {
    const bg = choreographyEngine ? choreographyEngine.currentBg : { r: 245, g: 245, b: 245 };
    inkBuffer.background(bg.r, bg.g, bg.b);
  }
}

function toggleFullscreenMode() {
  const isFS = !fullscreen();
  fullscreen(isFS);
  if (isFS) {
    document.body.classList.add('is-fullscreen');
  } else {
    document.body.classList.remove('is-fullscreen');
  }
}

document.addEventListener('fullscreenchange', () => {
  const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
  document.body.classList.toggle('is-fullscreen', isFS);
});
document.addEventListener('webkitfullscreenchange', () => {
  const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
  document.body.classList.toggle('is-fullscreen', isFS);
});

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  const bg = choreographyEngine ? choreographyEngine.currentBg : { r: 245, g: 245, b: 245 };
  const tempBuffer = createGraphics(windowWidth, windowHeight);
  tempBuffer.pixelDensity(1);
  tempBuffer.background(bg.r, bg.g, bg.b);
  tempBuffer.image(inkBuffer, 0, 0, windowWidth, windowHeight);

  inkBuffer = tempBuffer;
}

/**
 * Control de Teclado
 */
function keyPressed() {
  if (audioEngine && !audioEngine.isPlaying && !audioEngine.hasUserInteracted) {
    startAudioPerformance();
  }

  if (key === 'f' || key === 'F') {
    toggleFullscreenMode();
    return false;
  }

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

let lastFpsUpdate = 0;
function updateFPSMetrics() {
  if (millis() - lastFpsUpdate > 250) {
    const fpsElement = document.getElementById('hud-fps');
    if (fpsElement) {
      const currentFPS = Math.round(frameRate());
      fpsElement.innerText = `FPS: ${currentFPS} | Tinta: ${agents.length} | Limpiadores: ${cleanerAgents.length}`;
    }
    lastFpsUpdate = millis();
  }
}
