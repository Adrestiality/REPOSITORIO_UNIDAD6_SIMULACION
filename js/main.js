/**
 * ============================================================================
 * SIMULACIÓN POÉTICA 2D - UNIDAD 6 (UPB)
 * Creative Coding & Sistemas Emergentes
 * Coreografía Visual & Línea de Tiempo · BTS Black Swan (Orchestral)
 * Coexistencia Continua de Tinta Negra, Cisnes Blancos y Venas Borgoña
 * ============================================================================
 */

// Buffers y Lienzos
let inkBuffer;

// Poblaciones Coexistentes
let agents = [];         // Partículas de Tinta / Cisnes / Borgoña
let cleanerAgents = [];  // Partículas de Luz / Limpiadores de Espacio Negativo

// Motores de Fluido, Audio y Coreografía
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

  // Inicializar Poblaciones con conteos moderados
  initAgents(75);
  initCleanerAgents(25);

  noCursor();
}

/**
 * Bucle Principal de Renderizado (draw)
 */
function draw() {
  // 1. Métricas de Audio y Tiempo
  const audioData = audioEngine ? audioEngine.update() : {};
  const currentSongTime = (audioEngine && audioEngine.audioElement) ? audioEngine.audioElement.currentTime : 0;

  // 2. Actualizar Motor de Coreografía de 12 Estados
  if (choreographyEngine) {
    choreographyEngine.update(currentSongTime);
  }

  // 3. Ajuste dinámico y suave de poblaciones según el estado activo
  syncPopulationCounts();

  // 4. Actualizar HUD e Indicador de Escena
  updateChoreographyUI(audioData, currentSongTime);

  // --- FASE 1: SIMULACIÓN ACTIVA ---
  if (!isSimulationPaused) {
    const currentCursorParams = simGUI ? simGUI.params.cursor : {};
    const currentPhysParams = simGUI ? simGUI.params.physarum : {};
    const currentCleanerParams = simGUI ? simGUI.params.cleaners : {};
    const currentFluidParams = simGUI ? simGUI.params.fluid : {};

    // A. Interacción y Agitación del Cursor
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

    // C. Actualizar Partículas Principales (Tinta / Cisnes / Borgoña)
    for (let i = 0; i < agents.length; i++) {
      agents[i].update(pixelArray, bufW, bufH, inkBuffer, currentPhysParams, audioData, choreographyEngine);
    }

    // D. Actualizar Agentes Limpiadores de Espacio Negativo
    if (currentCleanerParams.enableCleaners) {
      for (let j = 0; j < cleanerAgents.length; j++) {
        cleanerAgents[j].update(pixelArray, bufW, bufH, inkBuffer, currentCleanerParams, audioData, choreographyEngine);
      }
    }

    // E. Física de Fluidos: Difusión y Secado continuo hacia el color de fondo
    fluidSystem.processFluidDynamics(inkBuffer, currentFluidParams, audioData, choreographyEngine);
  }

  // --- FASE 2: RENDERIZADO VISUAL ---
  image(inkBuffer, 0, 0, width, height);

  // Renderizar presencia luminosa de agentes limpiadores en modo cisnes
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
 * Sincroniza suavemente el número de partículas hacia el objetivo del estado coreografiado
 */
function syncPopulationCounts() {
  if (!choreographyEngine) return;

  const targetAgents = choreographyEngine.currentParams.targetCount || 80;
  const targetCleaners = choreographyEngine.currentParams.targetCleaners || 25;

  // Ajuste suave de tinta (máximo 2 por frame para evitar tirones)
  if (agents.length < targetAgents) {
    const toAdd = Math.min(2, targetAgents - agents.length);
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(5, min(width, height) * 0.20);
      const theta = random(TWO_PI);
      agents.push(new Agent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, theta));
    }
  } else if (agents.length > targetAgents) {
    const toRemove = Math.min(2, agents.length - targetAgents);
    agents.splice(0, toRemove);
  }

  // Ajuste suave de limpiadores
  if (cleanerAgents.length < targetCleaners) {
    const toAdd = Math.min(1, targetCleaners - cleanerAgents.length);
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(5, min(width, height) * 0.25);
      const theta = random(TWO_PI);
      cleanerAgents.push(new CleanerAgent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, random(TWO_PI)));
    }
  } else if (cleanerAgents.length > targetCleaners) {
    const toRemove = Math.min(1, cleanerAgents.length - targetCleaners);
    cleanerAgents.splice(0, toRemove);
  }
}

/**
 * Actualiza la información visual en el HUD y en la esquina inferior izquierda
 */
function updateChoreographyUI(audioData, songTime) {
  if (!choreographyEngine) return;

  const info = choreographyEngine.getChoreographyInfo();
  const timeStr = formatTime(songTime);

  // 1. Medidor en HUD
  const beatLabel = document.getElementById('beat-label');
  const meterFill = document.getElementById('meter-fill');
  const meterVal = document.getElementById('meter-val');
  const simState = document.getElementById('hud-sim-state');

  if (beatLabel) beatLabel.innerText = `Estado: ${info.name} (${info.tag})`;
  if (meterFill) meterFill.style.width = `${info.progress}%`;
  if (meterVal) meterVal.innerText = `${info.progress}%`;
  if (simState) simState.innerText = `Tiempo: ${timeStr}`;

  // 2. Indicador en la esquina inferior izquierda
  const romanElem = document.getElementById('scene-roman');
  const titleElem = document.getElementById('scene-title');
  const descElem = document.getElementById('scene-desc');
  const indicator = document.getElementById('scene-indicator');

  if (romanElem) romanElem.innerText = info.roman;
  if (titleElem) titleElem.innerText = info.name;
  if (descElem) descElem.innerText = info.description;

  if (indicator) {
    indicator.className = `scene-indicator-container ${info.isClimax ? 'act-3' : 'act-1'}`;
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
        simGUI.showToast('🎵 Coreografía Visual de Black Swan iniciada');
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
 * Inicialización de Poblaciones
 */
function initAgents(initialCount = 75) {
  agents = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < initialCount; i++) {
    const r = random(5, min(width, height) * 0.18);
    const theta = random(TWO_PI);
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    agents.push(new Agent(x, y, theta + random(-0.3, 0.3)));
  }
}

function initCleanerAgents(initialCount = 25) {
  cleanerAgents = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < initialCount; i++) {
    const r = random(min(width, height) * 0.05, min(width, height) * 0.22);
    const theta = random(TWO_PI);
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    cleanerAgents.push(new CleanerAgent(x, y, random(TWO_PI)));
  }
}

function setAgentCount(newCount) {
  const currentCount = agents.length;
  if (newCount > currentCount) {
    const toAdd = newCount - currentCount;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(5, min(width, height) * 0.25);
      const theta = random(TWO_PI);
      agents.push(new Agent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, theta));
    }
  } else if (newCount < currentCount) {
    agents.length = newCount;
  }
}

function setCleanerCount(newCount) {
  const currentCount = cleanerAgents.length;
  if (newCount > currentCount) {
    const toAdd = newCount - currentCount;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < toAdd; i++) {
      const r = random(5, min(width, height) * 0.28);
      const theta = random(TWO_PI);
      cleanerAgents.push(new CleanerAgent(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, random(TWO_PI)));
    }
  } else if (newCount < currentCount) {
    cleanerAgents.length = newCount;
  }
}

function reseedAgentsPool() {
  const targetA = choreographyEngine ? choreographyEngine.currentParams.targetCount : 75;
  const targetC = choreographyEngine ? choreographyEngine.currentParams.targetCleaners : 25;
  initAgents(targetA);
  initCleanerAgents(targetC);
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
 * Control de Teclado: Atajos directos a los 12 Estados
 */
function keyPressed() {
  if (audioEngine && !audioEngine.isPlaying && !audioEngine.hasUserInteracted) {
    startAudioPerformance();
  }

  // Atajos a los 12 estados de la coreografía
  const keyMap = {
    '1': 0, // 0:00 INK BIRTH
    '2': 1, // 0:18 INK IN WATER
    '3': 2, // 0:38 SWAN FLOCK
    '4': 3, // 0:58 FEATHERS
    '5': 4, // 1:18 CONTAMINATION
    '6': 5, // 1:38 CONVERGENCE
    '7': 6, // 2:03 BLACK HOLE
    '8': 7, // 2:14 FRAGMENTATION
    '9': 8, // 2:30 BURGUNDY VEINS
    '0': 9, // 2:40 BLACK HOLE EXPLOSION
    '-': 10, // 2:55 COLLAPSE
    '=': 11  // 3:08 FINAL BREATH
  };

  if (key in keyMap) {
    const stateIdx = keyMap[key];
    if (choreographyEngine && simGUI) {
      simGUI.seekToTimelineState(stateIdx);
    }
    return false;
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
