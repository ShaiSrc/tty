# Status Badges

[![npm version](https://badge.fury.io/js/@shaisrc%2Ftty.svg)](https://www.npmjs.com/package/@shaisrc/tty)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](https://github.com/shaisrc/tty/actions/workflows/ci.yml)

# @shaisrc/tty

> A minimalist, high-performance ASCII rendering library for game developers

**KISS Philosophy** • Simple drawing functions, no framework overhead • Output-agnostic design • TypeScript-first with excellent DX

## ✨ Features

- 🎨 **Rich Drawing API** - Box drawing, text alignment, shapes, and more
- 🎮 **Game-Ready** - Built-in game loop, keyboard/gamepad/pointer input, camera system
- ✨ **Animation System** - Flash, pulse, and custom animations with easing functions
- 🧱 **Layering System** - Multiple render layers with z-ordering
  🎯 **Output Agnostic** - Render to Canvas (DOM target planned)
- ⚡ **High Performance** - Double-buffering, dirty rectangle optimization
- 🔗 **Chainable API** - Fluent method chaining for better DX
- 📦 **Zero Dependencies** - Lightweight and self-contained
- 💪 **TypeScript First** - Full type safety and IntelliSense support

## 🚧 Release Status

Current builds are **beta**. A stable `0.1.0` release is blocked by:

- **DOMTarget** (browser DOM render target for accessibility)

## 📦 Installation

```bash
npm install @shaisrc/tty
```

## 🚀 Quick Start

### 30-Second Example

```typescript
import { Renderer, CanvasTarget } from "@shaisrc/tty";

// Create a canvas target
const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });

// Create renderer
const renderer = new Renderer(target);

// Draw something!
renderer
  .clear()
  .box(10, 5, 30, 10, { style: "double", fill: true })
  .centerText(9, "Hello, ASCII World!", { fg: "brightCyan" })
  .render();
```

### Complete Game Loop Example

```typescript
import {
  Renderer,
  CanvasTarget,
  GameLoop,
  KeyboardManager,
} from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);
const keyboard = new KeyboardManager();

let playerX = 40;
let playerY = 12;

// Handle input
keyboard.onKeyDown("ArrowUp", () => playerY--);
keyboard.onKeyDown("ArrowDown", () => playerY++);
keyboard.onKeyDown("ArrowLeft", () => playerX--);
keyboard.onKeyDown("ArrowRight", () => playerX++);

// Game loop
const game = new GameLoop(
  (dt) => {
    // Game logic here
  },
  () => {
    renderer
      .clear()
      .box(0, 0, 80, 24, { style: "single" })
      .setChar(playerX, playerY, "@", "yellow")
      .render();
  },
);

game.start();
```

## 📚 Core API

### Drawing Primitives

```typescript
// Characters and text
renderer.setChar(x, y, "A", "red", "black");
renderer.drawText(x, y, "Hello", { fg: "green" });

// Shapes
renderer.box(x, y, width, height, { style: "double", fill: true });
renderer.border(x, y, width, height, { style: "rounded" });
renderer.rect(x, y, width, height, "█", "blue");
renderer.fill(x, y, width, height, " ");
```

### Text Alignment

```typescript
renderer.centerText(y, "Centered!", { fg: "cyan" });
renderer.rightAlign(y, "Right aligned", { fg: "yellow" });
renderer.leftAlign(y, "Left aligned", { fg: "white" });
renderer.alignText(y, "Auto align", { align: "center" });
```

### UI Helpers

```typescript
// Menus
renderer.menu(x, y, ["New Game", "Continue", "Options", "Quit"], {
  selected: 0,
  indicator: ">",
  border: true,
  title: "Main Menu",
});

// Progress bars
renderer.progressBar(x, y, 20, 0.75, {
  style: "blocks",
  showPercent: true,
  border: true,
});

// Panels
renderer.panel(x, y, 40, 15, {
  title: "Inventory",
  content: ["Sword", "Shield", "Potion x3"],
  style: "double",
});
```

### Layers

```typescript
// Draw on different layers
renderer
  .layer("background")
  .fill(0, 0, 80, 24, ".", "gray")
  .layer("entities")
  .setChar(playerX, playerY, "@", "yellow")
  .layer("ui")
  .box(0, 0, 20, 5, { style: "single" })
  .render(); // Composites all layers

// Control layer visibility
renderer.hideLayer("ui");
renderer.showLayer("ui");
renderer.layerOrder(["background", "entities", "ui"]);
```

### Camera System

```typescript
// Follow a player entity
renderer.follow(playerX, playerY);
renderer.setChar(playerX, playerY, "@", "yellow");
renderer.render();

// Manual camera control
renderer.setCamera(100, 50);
renderer.moveCamera(10, 0);
renderer.resetCamera();

// Coordinate conversion
const screen = renderer.worldToScreen(worldX, worldY);
const world = renderer.screenToWorld(screenX, screenY);
```

### Animations

```typescript
// Custom animations
renderer.animate({
  duration: 1000,
  easing: "easeInOut",
  onUpdate: (progress) => {
    const x = Math.floor(10 + progress * 50);
    renderer.setChar(x, 10, "@", "cyan");
  },
  onComplete: () => console.log("Done!"),
});

// Flash effect
renderer.flash(10, 5, {
  char: "*",
  fg: "red",
  count: 3,
  duration: 500,
});

// Pulsing animation
renderer.pulse(20, 10, {
  duration: 1000,
  minIntensity: 0.3,
  maxIntensity: 1.0,
  loop: true,
  fg: "brightYellow", // Named colors, hex, and RGB are supported
});

// Update animations in game loop
gameLoop.update(() => renderer.updateAnimations());
```

### Input Management

```typescript
// Keyboard
const keyboard = new KeyboardManager();
keyboard.onKeyDown("w", () => player.moveUp());

// Key aliases (normalized): "Space"/"Spacebar" -> " ", "Esc" -> "Escape"
keyboard.onKeyDown("Space", () => player.attack());

// Simple direction input (WASD/Arrows)
const dir = keyboard.getDirection();
player.x += dir.x * speed;
player.y += dir.y * speed;

// Async key waiting
const answer = await keyboard.waitForKey(["y", "n"]);

// Gamepad/Controller
const gamepad = new GamepadManager();
gamepad.update(); // Call once per frame

const leftStick = gamepad.getLeftStick();
player.x += leftStick.x * 5;
player.y += leftStick.y * 5;

if (gamepad.justPressed(0)) {
  // A button
  player.jump();
}

// Vibration/rumble
await gamepad.vibrate(200, 0.5, 0.5);

// Pointer (Mouse/Touch/Pen)
const pointer = new PointerManager(canvas, 80, 24, 8, 16);
pointer.onClick(({ grid }) => {
  console.log(`Clicked at grid: ${grid.x}, ${grid.y}`);
});
pointer.onHover(({ grid }) => {
  // Handle hover
});
```

### Game Loop

```typescript
const loop = new GameLoop(
  (deltaTime) => {
    // Update game state (60 FPS)
  },
  () => {
    // Render current state
    renderer.clear().render();
  },
  { fps: 60 },
);

loop.start();
loop.pause();
loop.resume();
loop.stop();
```

## 🎨 Color Support

```typescript
// Named ANSI colors
renderer.setChar(x, y, "A", "red");
renderer.setChar(x, y, "B", "brightCyan");

// Hex colors
renderer.setChar(x, y, "C", "#ff00ff");

// RGB objects
renderer.setChar(x, y, "D", { r: 255, g: 128, b: 0 });

// Color utilities
import { brighten, darken, lerp, parseColor } from "@shaisrc/tty";

const brighter = brighten("red", 0.2);
const darker = darken("#ff0000", 0.3);
const blended = lerp("red", "blue", 0.5);
```

## 🎯 Box Styles

```typescript
// Built-in styles
renderer.box(x, y, w, h, { style: "single" }); // ┌─┐│└┘
renderer.box(x, y, w, h, { style: "double" }); // ╔═╗║╚╝
renderer.box(x, y, w, h, { style: "rounded" }); // ╭─╮│╰╯
renderer.box(x, y, w, h, { style: "heavy" }); // ┏━┓┃┗┛
renderer.box(x, y, w, h, { style: "ascii" }); // +-+|+-+

// Custom border characters
renderer.box(x, y, w, h, {
  style: {
    topLeft: "╒",
    topRight: "╕",
    bottomLeft: "╘",
    bottomRight: "╛",
    horizontal: "═",
    vertical: "│",
  },
});
```

## 📖 Documentation

- [Quick Start Guide](docs/quick-start.md) - Step-by-step tutorial
- [Core Types](docs/core-types.md) - Type definitions reference
- [Renderer API](docs/renderer-api.md) - Complete API documentation
- [Box Drawing](docs/box-drawing.md) - Box and border styles
- [Color Utilities](docs/color-utilities.md) - Color manipulation
- [Canvas Target](docs/canvas-target.md) - Browser rendering
- [Layer System](docs/layer-system.md) - Multi-layer rendering
- [Camera System](docs/camera-system.md) - Viewport and scrolling
- [Keyboard Input](docs/guide/keyboard-input.md) - Keyboard handling
- [Gamepad Input](docs/guide/gamepad-input.md) - Controller/gamepad support
- [Pointer Input](docs/pointer-input.md) - Mouse/touch/pen handling
- [Game Loop](docs/game-loop.md) - Game loop utilities
- [Menu Helper](docs/menu-helper.md) - Menu rendering
- [Progress Bar](docs/progress-bar.md) - Progress indicators
- [Panel Helper](docs/panel-helper.md) - Panel/window rendering
- [Alignment](docs/alignment.md) - Text alignment helpers

## 💡 Examples

Check out the [examples/](examples/) folder for complete working examples:

- **[basic-game.ts](examples/basic-game.ts)** - Simple player movement
- **[menu-demo.ts](examples/menu-demo.ts)** - Interactive menu system
- **[rpg-ui.ts](examples/rpg-ui.ts)** - RPG-style interface
- **[snake-game.ts](examples/snake-game.ts)** - Complete snake game
- **[space-invaders.ts](examples/space-invaders.ts)** - Space Invaders with keyboard & gamepad support

## 🏗️ Architecture

```
┌─────────────────┐
│   Your Game     │
└────────┬────────┘
         │
┌────────▼────────┐
│   Renderer      │  ← Drawing API, Layers, Camera
└────────┬────────┘
         │
┌────────▼────────┐
│  RenderTarget   │  ← Abstract interface
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  ┌───▼──┐
  │Canvas│  ← Implementation
  └──────┘
```

## 🎮 Real-World Use Cases

- **Roguelike Games** - Perfect for traditional ASCII roguelikes
- **Game Prototyping** - Quick iteration with simple graphics
- **Retro Games** - Snake, Tetris, Breakout
- **Data Visualization** - ASCII charts and graphs
- **Dev Tools** - Create text-based development tools

## ⚙️ Configuration

### Renderer Options

```typescript
const renderer = new Renderer(target, {
  defaultFg: "white",
  defaultBg: "black",
});

// Runtime configuration
renderer.setSafeMode(true); // Throw on out-of-bounds
renderer.setClipMode(true); // Clip instead of error
```

### Canvas Target Options

```typescript
const target = new CanvasTarget(canvas, {
  width: 80,
  height: 24,
  charWidth: 12,
  charHeight: 20,
  fontFamily: "monospace",
  fontSize: 16,
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Build
npm run build

# Generate API docs
npm run docs
```

## 📝 Philosophy

This library follows the **KISS (Keep It Simple, Stupid)** principle:

- ✅ Simple, composable functions over complex frameworks
- ✅ Explicit over implicit behavior
- ✅ Reusable helpers over monolithic components
- ✅ Performance by design, not as an afterthought
- ✅ Developer experience is a first-class concern

## 🤝 Contributing

Contributions are welcome! Please follow the TDD approach:

1. Write tests first (Red)
2. Implement the feature (Green)
3. Refactor for quality (Refactor)

Ensure >90% test coverage for new features.

## 📄 License

MIT © [Shai](https://github.com/shaisrc)

## 🙏 Acknowledgments

Inspired by classic ASCII games and modern game development libraries.

---

**Made with ❤️ for the ASCII art and roguelike community**
