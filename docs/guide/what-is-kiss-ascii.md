# What is @shaisrc/tty?

**@shaisrc/tty** — “A KISS ASCII Renderer” — is a minimalist, high-performance library for rendering ASCII/text-based graphics in the browser and beyond.

## Philosophy

Unlike heavy game frameworks, @shaisrc/tty provides:

- **Simple functions** over complex abstractions
- **Composable helpers** instead of rigid components
- **Output-agnostic design** - works anywhere text can be rendered
- **Developer experience first** - chainable API, TypeScript support, smart defaults

## 🚧 Release Status

Current builds are **beta**. A stable `0.1.0` release is blocked by:

- **DOMTarget** (browser DOM render target for accessibility)

## Who is it for?

@shaisrc/tty is perfect for:

- 🎮 **Game developers** building roguelikes, RPGs, or text-based games
- 🎨 **Creative coders** exploring ASCII art and procedural generation
- 📊 **Dashboard builders** creating text-based UIs
- 🎓 **Educators** teaching game development concepts
- 🔧 **Tool makers** building CLI visualizations in the browser

## Core Principles

### 1. KISS (Keep It Simple, Stupid)

No unnecessary complexity. Every method does one thing well.

```typescript
renderer.clear().box(10, 5, 20, 10).drawText(12, 7, "Hello!").render();
```

### 2. Output Agnostic

Same API works with different outputs:

- **Canvas** - Browser rendering with fonts and colors
- **DOM** - HTML elements for accessibility (planned)
- **Custom** - Extend for any target

### 3. Performance First

- Double-buffering prevents flicker
- Dirty rectangle optimization
- Minimal allocations in game loops
- Designed for 60 FPS

### 4. Excellent DX

- Chainable methods
- TypeScript with full type inference
- Comprehensive JSDoc
- Smart defaults
- Clear error messages

## How It Works

### 1. Render Target

First, create where your ASCII will be displayed:

```typescript
const canvas = document.getElementById("game");
const target = new CanvasTarget(canvas, {
  width: 80,
  height: 24,
  charWidth: 8,
  charHeight: 16,
});
```

### 2. Renderer

Then create a renderer:

```typescript
const renderer = new Renderer(target);
```

### 3. Draw

Use chainable methods to draw:

```typescript
renderer
  .clear()
  .box(5, 5, 30, 10, { style: "double" })
  .centerText(8, "Game Title", { fg: "yellow" })
  .render(); // Flush to screen
```

### 4. Game Loop (Optional)

For games, use the built-in game loop:

```typescript
const game = new GameLoop(
  (deltaTime) => {
    // Update game state
  },
  () => {
    // Draw everything
    renderer.clear()./* ... */.render();
  },
  { fps: 60 },
);

game.start();
```

## Key Features

### Layers

Separate visual concerns:

```typescript
renderer
  .layer("background")
  .fill(0, 0, 80, 24, " ", null, "blue")
  .layer("entities")
  .setChar(player.x, player.y, "@")
  .layer("ui")
  .box(0, 0, 20, 5)
  .layerOrder(["background", "entities", "ui"])
  .render();
```

### Camera

For scrolling worlds:

```typescript
renderer
  .follow(player.x, player.y) // Camera follows player
  .setChar(player.x, player.y, "@") // Draw using world coords
  .render();
```

### Helpers

Common UI patterns built-in:

```typescript
renderer.menu(10, 5, ["New Game", "Load", "Quit"], {
  selected: 0,
  indicator: ">",
  border: true,
});

renderer.progressBar(10, 15, 30, health / maxHealth, {
  style: "blocks",
  fillFg: "green",
});

renderer.panel(5, 5, 40, 15, {
  title: "Inventory",
  content: items,
  scrollOffset: 0,
});
```

## Comparison

### vs Game Frameworks (Phaser, PixiJS)

- ✅ Much lighter weight
- ✅ Focused on ASCII/text rendering
- ✅ Output agnostic
- ❌ Not for sprite-based games

### vs DIY Canvas

- ✅ Ready-to-use helpers
- ✅ Layers and camera built-in
- ✅ Input management
- ✅ Game loop
- ✅ Optimized rendering

## Next Steps

Ready to start building?

- [Quick Start Guide](/guide/quick-start) - Get started in 5 minutes
- [Core Concepts](/guide/core-concepts) - Understand the fundamentals
- [Examples](/examples/index) - See working code
- [API Reference](/api/README) - Complete API documentation
