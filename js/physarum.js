/**
 * ============================================================================
 * MÓDULO PHYSARUM: FÍSICA DE FLUIDOS Y DINÁMICA DE INTERACCIÓN (UNIDAD 6 - UPB)
 * ============================================================================
 * Difusión capilar, secado reactivo a la música y herramientas interactivas
 * inspiradas en "Can't Help Myself" y el comportamiento de la tinta en agua.
 * ============================================================================
 */

class PhysarumFluidSystem {
  constructor() {
    this.COLOR_MARFIL_RGB = { r: 244, g: 241, b: 234 };
  }

  /**
   * Procesa la física de fluidos con modulación armónica del audio
   * 
   * @param {p5.Graphics} buffer - Buffer de tinta
   * @param {Object} params - Configuración del fluido
   * @param {Object} audioData - Métricas espectrales del audio
   */
  processFluidDynamics(buffer, params, audioData = {}) {
    if (!buffer) return;

    const ctx = buffer.drawingContext;
    const baseDiffuse = params.diffusionRate !== undefined ? params.diffusionRate : 0.8;
    const baseEvap = params.evaporationRate !== undefined ? params.evaporationRate : 5;
    const enableDiffuse = params.enableDiffusion !== undefined ? params.enableDiffusion : true;
    const enableEvap = params.enableEvaporation !== undefined ? params.enableEvaporation : true;

    const energy = audioData.energy || 0;
    const mid = audioData.mid || 0;

    // --- 1. DIFUSIÓN CAPILAR EXPANSIVA ---
    // Las cuerdas orquestales (Mid) intensifican sutilmente la floración en agua
    const dynamicDiffuse = baseDiffuse * (1.0 + mid * 0.45);

    if (enableDiffuse && dynamicDiffuse > 0.05) {
      ctx.save();
      ctx.filter = `blur(${dynamicDiffuse.toFixed(1)}px)`;
      ctx.globalAlpha = 0.88;
      ctx.drawImage(buffer.canvas, 0, 0);
      ctx.filter = 'none';
      ctx.restore();
    }

    // --- 2. EVAPORACIÓN / SECADO ORGÁNICO ---
    if (enableEvap && baseEvap > 0) {
      buffer.push();
      buffer.noStroke();
      buffer.fill(
        this.COLOR_MARFIL_RGB.r,
        this.COLOR_MARFIL_RGB.g,
        this.COLOR_MARFIL_RGB.b,
        baseEvap
      );
      buffer.rect(0, 0, buffer.width, buffer.height);
      buffer.pop();
    }
  }

  /**
   * Aplica estímulo interactivo del cursor
   */
  applyCursorStimulus(buffer, agents, mx, my, pmx, pmy, params, activePalette = 'black-swan', audioData = {}) {
    const mode = params.cursorMode || 'Espátula / Limpiador';
    const baseRadius = params.cursorRadius || 55;
    const strength = params.cursorStrength || 1.0;
    const beatPulse = audioData.beatPulse || 0;
    const radius = baseRadius * (1.0 + beatPulse * 0.3);

    if (mode === 'Espátula / Limpiador') {
      // === MODO ESPÁTULA ("Can't Help Myself") ===
      buffer.push();
      buffer.stroke(
        this.COLOR_MARFIL_RGB.r,
        this.COLOR_MARFIL_RGB.g,
        this.COLOR_MARFIL_RGB.b,
        Math.min(255, 190 * strength)
      );
      buffer.strokeWeight(radius);
      buffer.strokeCap(ROUND);
      buffer.line(pmx, pmy, mx, my);

      buffer.noStroke();
      buffer.fill(
        this.COLOR_MARFIL_RGB.r,
        this.COLOR_MARFIL_RGB.g,
        this.COLOR_MARFIL_RGB.b,
        Math.min(255, 220 * strength)
      );
      buffer.circle(mx, my, radius);
      buffer.pop();

      // Repulsión física de agentes
      const repulseRadiusSq = (radius * 1.3) * (radius * 1.3);
      for (let i = 0; i < agents.length; i++) {
        const ag = agents[i];
        const dx = ag.x - mx;
        const dy = ag.y - my;
        const dSq = dx * dx + dy * dy;

        if (dSq < repulseRadiusSq && dSq > 0.001) {
          const d = Math.sqrt(dSq);
          const pushForce = (1 - d / (radius * 1.3)) * 5.2 * strength;
          const awayAngle = Math.atan2(dy, dx);

          ag.angle = awayAngle + (Math.random() - 0.5) * 0.3;
          ag.x += Math.cos(awayAngle) * pushForce;
          ag.y += Math.sin(awayAngle) * pushForce;
        }
      }

    } else {
      // === MODO VERTIDO DE TINTA (Atrayente quimiotáctico orgánico) ===
      buffer.push();
      buffer.noStroke();

      if (activePalette === 'gold') {
        buffer.fill(197, 160, 89, 45 * strength);
        buffer.circle(mx, my, radius * 1.4);
        buffer.fill(160, 115, 45, 140 * strength);
        buffer.circle(mx, my, radius * 0.8);
      } else if (activePalette === 'white-swan') {
        buffer.fill(55, 58, 65, 35 * strength);
        buffer.circle(mx, my, radius * 1.3);
        buffer.fill(35, 38, 42, 110 * strength);
        buffer.circle(mx, my, radius * 0.7);
      } else {
        buffer.fill(42, 6, 14, 55 * strength);
        buffer.circle(mx, my, radius * 1.5);
        buffer.fill(12, 14, 18, 180 * strength);
        buffer.circle(mx, my, radius * 0.85);
      }

      // Salpicaduras y gotas periféricas orgánicas
      const numSplashes = 3 + Math.floor(beatPulse * 4);
      for (let s = 0; s < numSplashes; s++) {
        const angle = Math.random() * TWO_PI;
        const r = (radius * 0.45) + Math.random() * (radius * 0.65);
        if (activePalette === 'gold') {
          buffer.fill(197, 160, 89, 90 * strength);
        } else {
          buffer.fill(24, 10, 18, 95 * strength);
        }
        buffer.circle(mx + Math.cos(angle) * r, my + Math.sin(angle) * r, Math.random() * 8 + 3);
      }
      buffer.pop();

      // Atracción quimiotáctica
      const attractRadiusSq = (radius * 2.8) * (radius * 2.8);
      for (let i = 0; i < agents.length; i++) {
        const ag = agents[i];
        const dx = mx - ag.x;
        const dy = my - ag.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < attractRadiusSq && dSq > 4) {
          const towardsAngle = Math.atan2(dy, dx);
          ag.angle = towardsAngle + (Math.random() - 0.5) * 0.2;
        }
      }
    }
  }

  /**
   * Renderiza el aro y guía visual del cursor
   */
  renderCursorFeedback(p, mx, my, params, activePalette = 'black-swan', audioData = {}) {
    if (mx < 0 || mx > width || my < 0 || my > height) return;

    const mode = params.cursorMode || 'Espátula / Limpiador';
    const baseRadius = params.cursorRadius || 55;
    const beatPulse = audioData.beatPulse || 0;
    const radius = baseRadius * (1.0 + beatPulse * 0.15);

    push();
    noFill();
    if (mode === 'Espátula / Limpiador') {
      stroke(197, 160, 89, 150 + beatPulse * 80);
      strokeWeight(1.5);
      circle(mx, my, radius);
      
      stroke(197, 160, 89, 210);
      strokeWeight(2);
      line(mx - radius * 0.45, my, mx + radius * 0.45, my);
    } else {
      if (activePalette === 'gold') {
        stroke(197, 160, 89, 180 + beatPulse * 60);
      } else {
        stroke(40, 42, 48, 160 + beatPulse * 80);
      }
      strokeWeight(1.5);
      circle(mx, my, radius);
      
      fill(activePalette === 'gold' ? '#c5a059' : '#181a1e');
      noStroke();
      circle(mx, my, 4 + beatPulse * 3);
    }
    pop();
  }
}
