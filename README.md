# 🦢 Unidad 6 · Agentes Autónomos: Black Swan (Score Visual de Acuarela & Tinta 2D)

**Universidad Pontificia Bolivariana (UPB)**  
*Curso de Simulación de Sistemas Interactivos* — 2026  
**Guía Oficial:** [Unidad 6: Agentes Autónomos](https://juanferfranco.github.io/simulacion-2026-20/units/unit6/)  
**Obra Sonora:** *BTS — Black Swan (Orchestral Instrumental)*

---

## 🎭 Concepto y Performance en Vivo

Esta experiencia audiovisual interactiva explora la dualidad estética entre el **Cisne Blanco** (orden, armonía y monocromo) y el **Cisne Negro** (caos, fractura, explosión de color y vórtice en espiral), inspirada en la coreografía y la banda sonora orquestal de *Black Swan*.

El sistema opera sobre un **Lienzo 2D de Acuarela Expansiva y Tinta sobre Agua** en el que una manada de **140 agentes autónomos 2D** (pinceles / agujas de luz) navega a través de corrientes de agua vivas guiadas por campos de fuerza de Perlin Noise y vórtices cósmicos, depositando pigmento que florece y se evapora orgánicamente sobre el lienzo húmedo.

---

## 🎹 Score Visual y Teclas de Control

El performance está diseñado para conducirse en vivo mediante transiciones continuas e interpoladas (*lerp*) entre 4 estados dramáticos:

| Tecla | Estado | Descripción Dramática | Comportamiento de Agentes & Entorno |
| :---: | :--- | :--- | :--- |
| <kbd>1</kbd> | **ESTADO I: CISNE BLANCO** | *El Templo / Calma & Orden* | Paleta monocromática (obsidiana, plata y blanco marfil). Cohesión y alineación altas ($w_c=2.6, w_a=2.2$). Corrientes de agua calmas. Tinta tenue con secado suave. Cursor como atractor. |
| <kbd>2</kbd> | **ESTADO II: LA GRIETA** | *Tensión / Aceleración* | Aumento de velocidad ($maxSpeed = 5.2$). Aparecen venas luminosas de pigmento cian y oro. Floración de acuarela acelerada. |
| <kbd>3</kbd> | **ESTADO III: CISNE NEGRO** | *Clímax / ¡Explosión de Color & Espiral!* | ¡Explosión cromática total (carmesí, violeta cósmico, turquesa y oro vivo)! Separación violenta ($w_s=4.4$). Flow Field en *Espiral Cósmica / Vórtice*. El mouse actúa como piedra en el agua (onda expansiva *Flee*). |
| <kbd>4</kbd> | **ESTADO IV: METAMORFOSIS** | *Resolución / Calma Final* | Desaceleración y convergencia suave hacia el centro mediante comportamiento **Arrive**. La paleta retorna al blanco plateado y la tinta se evapora dejando el lienzo limpio y en paz. |

### Atajos Globales de Ergonomía:
- <kbd>F</kbd> o <kbd>f</kbd>: Activar / Salir del modo **Pantalla Completa** (*Fullscreen*).
- <kbd>H</kbd> o <kbd>h</kbd>: Ocultar / Mostrar la interfaz (`dat.gui`) y los indicadores HUD para presentaciones limpias.
- <kbd>P</kbd>, <kbd>p</kbd> o <kbd>Espacio</kbd>: Pausar / Reanudar sincrónicamente la simulación y la música.
- <kbd>Click + Arrastre</kbd>: Inyectar gotas de tinta o generar ondas expansivas en el agua.

---

## 🏛️ Fundamentos Teóricos y Algoritmos

1. **Steering Behaviors & Flocking (Craig Reynolds & Daniel Shiffman):**
   - Fórmula fundamental de maniobra: $\vec{F}_{\text{steer}} = \vec{v}_{\text{deseada}} - \vec{v}_{\text{actual}}$, con limitación por masa e inercia ($\vec{a} = \vec{F} / m$).
   - Implementación de **Separación**, **Alineación**, **Cohesión**, **Seek**, **Flee** y **Arrive**.
2. **Campo de Flujo Fluido 2D (*Fluid Flow Field*):**
   - **Corrientes de Agua:** Ondulaciones fluidas mediante muestreo continuo de ruido Perlin multiescala.
   - **Espiral Cósmica:** Vórtice polar giratorio con succión radial y armónicos periódicos.
3. **Simulación de Acuarela & Tinta sobre Agua (Buffer 2D):**
   - Floración capilar mediante propagación microscópica de bordes.
   - Evaporación y secado orgánico progresivo (3-5% por fotograma) para evitar sobrecargas visuales.
   - Gotas de pigmento e interacción reactiva al cursor.

---

## 📂 Estructura Modular del Proyecto

```text
REPOSITORIO_UNIDAD6_SIMULACION/
├── index.html                           # Lienzo 2D, CDNs, HUD y Badge de Estado
├── style.css                            # Estética Dark Glassmorphism y animaciones
├── package.json                         # Configuración de comandos npm (npm run dev)
├── server.js                            # Servidor local nativo Node.js sin dependencias
├── README.md                            # Bitácora e instrucciones de ejecución
├── assets/
│   └── black-swan.mp3                   # Pista instrumental de Black Swan
└── js/
    ├── flowfield.js                     # FluidFlowField2D (Corrientes de agua y vórtice en espiral)
    ├── physarum.js                      # WatercolorBuffer (Acuarela expansiva, floración y secado)
    ├── agent.js                         # Agent2D (Flocking, Agujas de luz 2D, Paletas dinámicas)
    ├── performance.js                   # PerformanceDirector (Máquina de 4 estados dramáticos)
    ├── gui.js                           # SimulationGUI (Panel dat.gui optimizado 2D)
    └── main.js                          # Orquestación 2D, render loop y eventos
```

---

## 🚀 Instrucciones de Ejecución

### Opción 1: Con Git Bash / Terminal (Recomendado)
Abre **Git Bash** o cualquier terminal en la carpeta del repositorio y ejecuta:

```bash
npm run dev
```

El servidor local se iniciará automáticamente en `http://localhost:3000` y **abrirá tu navegador predeterminado** sin requerir instalar paquetes adicionales (`npm install`).

### Opción 2: Ejecución Directa en Navegador
- Haz doble clic sobre [`index.html`](index.html) para abrirlo directamente en Google Chrome, Microsoft Edge, Firefox, Brave o Safari.
