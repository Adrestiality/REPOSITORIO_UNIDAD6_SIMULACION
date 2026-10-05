/**
 * ============================================================================
 * MÓDULO PHYSARUM: FÍSICA DE FLUIDOS Y DINÁMICA DE INTERACCIÓN (UNIDAD 6 - UPB)
 * ============================================================================
 * Difusión capilar, secado progresivo y agitación con el cursor:
 *  - Trazo del cursor en aerógrafo suave multicapa (100% Escala de Grises).
 *  - Disipación continua y dinámica para evitar acumulación excesiva de masa.
 *  - Seducción física de partículas mediante arrastre hidrodinámico.
 * ============================================================================
 */

class PhysarumFluidSystem {
  constructor() {
    this.COLOR_ALABASTRO_RGB = { r: 245, g: 245, b: 245 };
  }

  /**
   * Procesa la física de fluidos con difusión y secado progresivo gobernado por la coreografía
   */
  processFluidDynamics(buffer, params, audioData = {}, choreography = null) {
    if (!buffer) return;

    const ctx = buffer.drawingContext;
    const choreoParams = choreography ? choreography.currentParams : {};

    const baseDiffuse = choreoParams.diffusionRate !== undefined ? choreoParams.diffusionRate : (params.diffusionRate || 0.5);
    const baseEvap = choreoParams.evaporationRate !== undefined ? choreoParams.evaporationRate : (params.evaporationRate || 5.5);
    const enableDiffuse = params.enableDiffusion !== undefined ? params.enableDiffusion : true;
    const enableEvap = params.enableEvaporation !== undefined ? params.enableEvaporation : true;

    // --- 1. DIFUSIÓN CAPILAR ACUOSA SUTIL (sin emborronar las partículas en halos gigantes) ---
    if (enableDiffuse && baseDiffuse > 0.05) {
      ctx.save();
      ctx.filter = `blur(${Math.min(0.6, baseDiffuse * 0.4).toFixed(1)}px)`;
      ctx.globalAlpha = 0.12; // Suave veladura acuosa
      ctx.drawImage(buffer.canvas, 0, 0);
      ctx.filter = 'none';
      ctx.restore();
    }

    // --- 2. EVAPORACIÓN / SECADO CONTINUO HACIA EL FONDO ACTUAL ---
    if (enableEvap && baseEvap > 0) {
      const bg = choreography ? choreography.currentBg : this.COLOR_ALABASTRO_RGB;
      buffer.push();
      buffer.noStroke();
      buffer.fill(bg.r, bg.g, bg.b, baseEvap);
      buffer.rect(0, 0, buffer.width, buffer.height);
      buffer.pop();
    }
  }

  /**
   * Perturba hidrodinámicamente y seduce temporalmente a las partículas cercanas
   */
  disturbSwarmWithCursor(allAgentArrays, mx, my, pmx, pmy, params, isPressed, audioData = {}) {
    const baseRadius = params.cursorRadius || 65;
    const radius = baseRadius * 1.1;
    const radiusSq = radius * radius;

    const vx = mx - pmx;
    const vy = my - pmy;
    const mouseSpeed = Math.hypot(vx, vy);
    const mode = params.cursorMode || 'Espátula / Limpiador';

    for (let arr = 0; arr < allAgentArrays.length; arr++) {
      const list = allAgentArrays[arr];
      for (let i = 0; i < list.length; i++) {
        const ag = list[i];
        const dx = ag.x - mx;
        const dy = ag.y - my;
        const dSq = dx * dx + dy * dy;

        if (dSq < radiusSq && dSq > 0.01) {
          const d = Math.sqrt(dSq);
          const force = 1.0 - d / radius;
          const awayAngle = Math.atan2(dy, dx);

          // 1. Seducción temporal por el mouse
          if (ag.mouseSeducedTimer <= 0 && Math.random() < 0.45) {
            ag.mouseSeducedTimer = Math.floor(random(70, 160));
            ag.mouseTargetX = mx + (Math.random() - 0.5) * 30;
            ag.mouseTargetY = my + (Math.random() - 0.5) * 30;
          } else if (ag.mouseSeducedTimer > 0) {
            ag.mouseTargetX = mx;
            ag.mouseTargetY = my;
          }

          // 2. Arrastre por velocidad del mouse
          if (mouseSpeed > 0.4) {
            ag.x += vx * force * 0.35;
            ag.y += vy * force * 0.35;
            ag.angle += (Math.atan2(vy, vx) - ag.angle) * force * 0.20;
          }

          // 3. Remolino tangencial
          const tangentAngle = awayAngle + Math.PI / 2;
          ag.angle += (tangentAngle - ag.angle) * force * 0.28 + (Math.random() - 0.5) * 0.15;

          // 4. Si se presiona clic
          if (isPressed) {
            if (mode === 'Espátula / Limpiador') {
              const pushForce = force * 5.0;
              ag.x += Math.cos(awayAngle) * pushForce;
              ag.y += Math.sin(awayAngle) * pushForce;
              ag.angle = awayAngle + (Math.random() - 0.5) * 0.4;
            } else {
              const pullForce = force * 4.0;
              ag.x -= Math.cos(awayAngle) * pullForce;
              ag.y -= Math.sin(awayAngle) * pullForce;
              ag.angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 0.3;
            }
          }
        }
      }
    }
  }

  /**
   * Aplica depósito en aerógrafo suave difuminado sobre el buffer
   */
  applyCursorStimulus(buffer, mx, my, pmx, pmy, params, choreography = null, audioData = {}) {
    const mode = params.cursorMode || 'Espátula / Limpiador';
    const baseRadius = params.cursorRadius || 65;
    const strength = params.cursorStrength || 1.0;
    const radius = baseRadius;
    const bg = choreography ? choreography.currentBg : this.COLOR_ALABASTRO_RGB;

    buffer.push();
    buffer.noStroke();

    const distMoved = Math.hypot(mx - pmx, my - pmy);
    const steps = Math.max(1, Math.min(10, Math.ceil(distMoved / (radius * 0.25))));

    for (let step = 0; step <= steps; step++) {
      const t = steps > 0 ? step / steps : 1;
      const x = pmx + (mx - pmx) * t;
      const y = pmy + (my - pmy) * t;

      if (mode === 'Espátula / Limpiador') {
        // Aerógrafo borrador
        for (let r = radius; r >= 4; r -= radius / 5) {
          const normR = r / radius;
          const alpha = Math.min(255, 110 * strength * Math.pow(1.0 - normR, 1.6));
          buffer.fill(bg.r, bg.g, bg.b, alpha);
          buffer.circle(x, y, r * 2);
        }
      } else {
        // Aerógrafo vertido de tinta
        for (let r = radius; r >= 4; r -= radius / 5) {
          const normR = r / radius;
          const alpha = Math.min(255, 95 * strength * Math.pow(1.0 - normR, 1.8));
          buffer.fill(0, 0, 0, alpha);
          buffer.circle(x, y, r * 2);
        }
      }
    }

    buffer.pop();
  }

  /**
   * Renderiza la guía visual orgánica del cursor
   */
  renderCursorFeedback(p, mx, my, params, choreography = null, audioData = {}) {
    if (mx < 0 || mx > width || my < 0 || my > height) return;

    const mode = params.cursorMode || 'Espátula / Limpiador';
    const baseRadius = params.cursorRadius || 65;
    const radius = baseRadius;

    push();
    noFill();

    if (mode === 'Espátula / Limpiador') {
      stroke(245, 245, 245, 45);
      strokeWeight(2.5);
      circle(mx, my, radius * 2.0);

      stroke(245, 245, 245, 120);
      strokeWeight(1.2);
      circle(mx, my, radius * 1.5);

      fill(255, 255, 255, 200);
      noStroke();
      circle(mx, my, 3.5);
    } else {
      stroke(180, 180, 180, 100);
      strokeWeight(1.2);
      circle(mx, my, radius * 1.8);

      stroke(180, 180, 180, 140);
      strokeWeight(2.0);
      circle(mx, my, radius * 1.2);

      fill(255, 255, 255);
      noStroke();
      circle(mx, my, 4);
    }
    pop();
  }
}
