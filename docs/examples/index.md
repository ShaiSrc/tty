# Examples

Explore complete, working examples to learn KISS ASCII Renderer.

::: tip Try the Interactive Demos!
<a href="/demos/" target="_blank"><strong>🎮 Launch Live Demos →</strong></a>

Run all examples in your browser with live code and interactive demos.
:::

:::

## Available Examples

### Basic Game

A simple game demonstrating core concepts:

- Player movement with keyboard input
- Boundary collision detection
- Score tracking and UI elements
- Basic game loop structure

**Source**: `examples/basic-game.ts`

**Perfect for**: First-time users learning the basics

---

### Menu System

Interactive menu demonstration:

- Keyboard navigation (up/down arrows)
- Selection handling
- Menu styling and borders
- State management

**Source**: `examples/menu-demo.ts`

**Perfect for**: Building game menus and UI

---

### RPG UI

Complex RPG-style interface:

- Multiple panels and windows
- Character stats display
- Inventory management
- Progress bars for health/mana/XP
- Layered UI elements

**Source**: `examples/rpg-ui.ts`

**Perfect for**: Learning advanced layout and panels

---

### Snake Game

Complete Snake game implementation:

- Game state management
- Collision detection
- Food spawning
- Score and high score tracking
- Game over and restart logic

**Source**: `examples/snake-game.ts`

**Perfect for**: Full game implementation reference

---

### Space Invaders

Classic arcade game with dual input support:

- 🎮 **Gamepad support** (D-pad/analog stick + buttons)
- Keyboard controls (arrow keys + spacebar)
- Enemy AI with formation movement
- Barrier/shield destructibility
- Multiple levels with increasing difficulty
- Lives and scoring system

**Source**: `examples/space-invaders.ts`

**Perfect for**: Learning gamepad input and complex game mechanics

---

## Running the Examples

### In Browser

1. Clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open `examples/index.html` in your browser
5. Select an example from the dropdown

### From Source

Each example is a standalone TypeScript file in the `examples/` directory:

```bash
# View the source
cat examples/basic-game.ts

# Run with Vite
npm run dev
```

## Learning Path

We recommend exploring examples in this order:

1. **Basic Game** → Core concepts and game loop
2. **Menu Demo** → Input handling and UI
3. **Snake Game** → Complete game structure
4. **RPG UI** → Advanced layouts and helpers

## Example Template

Want to create your own? Here's a minimal template:

```typescript
import {
  Renderer,
  CanvasTarget,
  GameLoop,
  KeyboardManager,
} from "@shaisrc/tty";

// Setup
const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, {
  width: 80,
  height: 24,
  charWidth: 8,
  charHeight: 16,
});
const renderer = new Renderer(target);
const keyboard = new KeyboardManager();

// Game state
const state = {
  // Your game state here
};

// Input
keyboard.onKeyDown("Space", () => {
  // Handle input
});

// Game loop
const game = new GameLoop(
  (dt) => {
    // Update logic
  },
  () => {
    renderer
      .clear()
      // Draw everything
      .render();
  },
});

game.start();
```

## Contributing Examples

Have a cool example? We'd love to see it!

1. Create a new file in `examples/`
2. Follow the existing pattern
3. Add it to `examples/index.html`
4. Submit a pull request

---

## Next Steps

- [Quick Start Guide](/guide/quick-start) - Get started in 5 minutes
- [API Reference](/api/README) - Complete API documentation
- [Core Concepts](/guide/core-concepts) - Understand the fundamentals
