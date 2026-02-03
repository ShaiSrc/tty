---
layout: home

hero:
  name: "@shaisrc/tty"
  text: "KISS ASCII Renderer"
  tagline: A minimalist, high-performance ASCII rendering library for game developers
  image:
    src: /logo.png
    alt: "@shaisrc/tty - KISS ASCII Renderer"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/shaisrc/tty
    - theme: alt
      text: API Reference
      link: /api/README

features:
  - icon: 🎮
    title: Game-First Design
    details: Built specifically for ASCII games with double-buffering, layers, and camera systems.

  - icon: ⚡
    title: High Performance
    details: Optimized rendering with dirty rectangle tracking and minimal overhead for smooth 60 FPS gameplay.

  - icon: 🔗
    title: Chainable API
    details: Fluent, chainable methods for excellent developer experience. Draw complex scenes in readable code.

  - icon: 🎨
    title: Rich Drawing Helpers
    details: Boxes, menus, progress bars, panels, and text alignment out of the box. No boilerplate needed.

  - icon: 📐
    title: Layer System
    details: Multi-layer rendering with customizable order. Perfect for separating background, entities, and UI.

  - icon: 📷
    title: Camera & Viewport
    details: Built-in camera system for scrolling worlds. Follow entities, transform coordinates, pan smoothly.

  - icon: 🎹
    title: Complete Input Support
    details: Keyboard (with getDirection/waitForKey helpers), Gamepad (with vibration), and Pointer managers for all your input needs.

  - icon: 🔄
    title: Game Loop
    details: Configurable game loop with fixed timestep updates and variable rendering. Just focus on your game logic.

  - icon: 📦
    title: Output Agnostic
    details: Render to Canvas today; DOM targets are planned. Extend to any output target with a simple interface.
---

## 🚧 Release Status

Current builds are **beta**. A stable `0.1.0` release is blocked by:

- **DOMTarget** (browser DOM render target for accessibility)

## Quick Example

```typescript
import {
  Renderer,
  CanvasTarget,
  GameLoop,
  KeyboardManager,
} from "@shaisrc/tty";

// Set up canvas rendering
const canvas = document.getElementById("game");
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);

// Create player
const player = { x: 40, y: 12, char: "@", color: "yellow" };

// Handle input
const keyboard = new KeyboardManager();
keyboard.onKeyDown("ArrowUp", () => player.y--);
keyboard.onKeyDown("ArrowDown", () => player.y++);
keyboard.onKeyDown("ArrowLeft", () => player.x--);
keyboard.onKeyDown("ArrowRight", () => player.x++);
// Key aliases (normalized): "Space"/"Spacebar" -> " ", "Esc" -> "Escape"
keyboard.onKeyDown("Space", () => player.attack());

// Game loop
const game = new GameLoop(
  (dt) => {
    // Game logic here
  },
  () => {
    renderer
      .clear()
      .box(0, 0, 80, 24, { style: "double", fg: "cyan" })
      .centerText(1, "KISS ASCII Game", { fg: "yellow" })
      .setChar(player.x, player.y, player.char, player.color)
      .render();
  },
});

game.start();
```

## Why KISS ASCII?

- **KISS Philosophy**: Simple functions, not complex frameworks
- **DX First**: Chainable API, smart defaults, excellent TypeScript support
- **Performance**: Double-buffering, dirty rectangles, minimal overhead
- **Output Agnostic**: Works in Browser (Canvas/DOM), Electron

## Installation

```bash
npm install @shaisrc/tty
```

## Features Overview

### Drawing Primitives

- `setChar()` - Set individual characters
- `drawText()` - Draw text strings
- `fill()` - Fill rectangular areas

### Shapes & Borders

- `box()` - Bordered boxes with fill options
- `border()` - Border-only frames
- `rect()` - Solid rectangles
- Multiple styles: single, double, rounded, heavy, ASCII

### High-Level Helpers

- `menu()` - Interactive menus with selection
- `progressBar()` - Horizontal/vertical progress indicators
- `panel()` - Titled panels with scrollable content

### Text Alignment

- `centerText()` - Center text horizontally
- `rightAlign()` - Right-align text
- `leftAlign()` - Left-align text
- `alignText()` - Generic alignment with options

### Layer Management

- `layer()` - Create and switch layers
- `layerOrder()` - Control rendering order
- `hideLayer()` / `showLayer()` - Toggle layer visibility
- Perfect for separating background, game, and UI

### Camera System

- `setCamera()` - Position viewport in world
- `follow()` - Follow an entity smoothly
- `moveCamera()` - Pan the camera
- `worldToScreen()` / `screenToWorld()` - Coordinate transforms

### Input Handling

- **KeyboardManager**: Key press/release events
- **PointerManager**: Unified mouse/touch/pen input with grid coords
- **MouseManager** (deprecated): Use PointerManager instead
- Works seamlessly with the renderer

### Game Loop

- Configurable FPS
- Separate update and render callbacks
- Delta time for smooth movement
- Start/stop/pause controls

## Next Steps

<div class="vp-doc">
  <div class="tip custom-block">
    <p class="custom-block-title">👉 Ready to start?</p>
    <p>Check out the <a href="/guide/quick-start">Quick Start Guide</a> to build your first ASCII game in under 5 minutes!</p>
  </div>
</div>

---

<div style="text-align: center; margin-top: 3rem; padding: 2rem;">
  <p style="font-size: 0.9rem; color: var(--vp-c-text-2);">
    MIT Licensed | Copyright © 2026-present ShaiDev
  </p>
</div>
