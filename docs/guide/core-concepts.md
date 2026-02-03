# Core Concepts

Understanding these fundamental concepts will help you get the most out of KISS ASCII Renderer.

## The Rendering Pipeline

### 1. Buffer → Composite → Target

```
┌─────────┐    ┌──────────┐    ┌────────┐
│ Layers  │ => │ Renderer │ => │ Target │
│ Buffers │    │ Composite│    │ Output │
└─────────┘    └──────────┘    └────────┘
```

1. **Buffers**: Each layer has a buffer (sparse map of cells)
2. **Composite**: When rendering, layers combine in order
3. **Target**: The composite is flushed to the output (canvas, DOM, etc.)

### 2. Double Buffering

Drawing happens in memory, then flushes to screen:

```typescript
renderer
  .clear()           // Clear in-memory buffer
  .drawText(...)     // Draw to buffer
  .box(...)          // Draw to buffer
  .render()          // Flush buffer to screen
```

This prevents flickering and allows for batched updates.

## Coordinates

### Screen vs World Coordinates

- **Screen coords**: What you see (0,0 to width-1, height-1)
- **World coords**: The full game world (can be much larger)

The **camera** transforms world coords to screen coords:

```typescript
// World is 200x200, screen is 80x24
const player = { x: 100, y: 100 };

renderer
  .follow(player.x, player.y) // Camera at (100-40, 100-12) = (60, 88)
  .setChar(player.x, player.y, "@") // World coords
  .render(); // Shows at screen center
```

### Bounds Checking

Two modes for handling out-of-bounds:

```typescript
// Safe mode: Throws error on out-of-bounds
renderer.setSafeMode(true);
renderer.setChar(100, 100, "X"); // Error!

// Clip mode: Silently ignores out-of-bounds
renderer.setClipMode(true);
renderer.drawText(75, 10, "This text clips at edge"); // OK
```

## Layers

Layers let you organize drawing into separate concerns:

```typescript
renderer
  // Background layer
  .layer("background")
  .fill(0, 0, 80, 24, "░", "gray")

  // Entities layer
  .layer("entities")
  .setChar(player.x, player.y, "@", "yellow")
  .setChar(enemy.x, enemy.y, "E", "red")

  // UI layer (always on top)
  .layer("ui")
  .panel(0, 0, 20, 5, { title: "Stats" })

  // Set render order (bottom to top)
  .layerOrder(["background", "entities", "ui"])
  .render();
```

### Layer Operations

```typescript
// Switch active layer
renderer.layer("ui");

// Hide/show layers
renderer.hideLayer("debug");
renderer.showLayer("debug");

// Clear specific layer
renderer.clearLayer("effects");
```

## Colors

### Color Formats

KISS ASCII supports multiple color formats:

```typescript
// Named colors
{ fg: 'red', bg: 'black' }

// Hex strings
{ fg: '#FF0000', bg: '#000000' }

// RGB objects
{ fg: { r: 255, g: 0, b: 0 }, bg: { r: 0, g: 0, b: 0 } }

// Null (transparent/default)
{ fg: null, bg: null }
```

### Color Utilities

```typescript
import { parseColor, brighten, darken, lerp } from "@shaisrc/tty";

const rgb = parseColor("red"); // { r: 255, g: 0, b: 0 }
const light = brighten("blue", 0.3); // 30% brighter
const dark = darken("red", 0.5); // 50% darker
const purple = lerp("red", "blue", 0.5); // Blend
```

## The Chainable API

Almost all methods return `this` for chaining:

```typescript
renderer
  .clear()
  .layer("background")
  .fill(0, 0, 80, 24, " ", null, "blue")
  .layer("ui")
  .box(10, 5, 30, 10, { style: "double" })
  .centerText(8, "Hello", { fg: "yellow" })
  .render();
```

This makes complex scenes readable and maintainable.

## Render Targets

A render target is where output goes. It's an interface:

```typescript
interface RenderTarget {
  setCell(x: number, y: number, char: string, fg: Color, bg: Color): void;
  clear(): void;
  flush(): void;
  getSize(): { width: number; height: number };
}
```

### Built-in Targets

**CanvasTarget**: Renders to HTML5 canvas

```typescript
const target = new CanvasTarget(canvas, {
  width: 80,
  height: 24,
  charWidth: 8,
  charHeight: 16,
  font: "monospace",
});
```

### Custom Targets

You can create your own:

```typescript
class CustomTarget implements RenderTarget {
  setCell(x, y, char, fg, bg) {
    // Write to your custom output
  }

  clear() {
    // Clear your output
  }

  flush() {
    // Flush to output
  }

  getSize() {
    return { width: 80, height: 24 };
  }
}
```

## The Update-Render Loop

For games, separate logic from drawing:

```typescript
const game = new GameLoop(
  (deltaTime) => {
    // Fixed timestep updates
    player.x += velocity.x * deltaTime;
    updateEnemies(deltaTime);
    checkCollisions();
  },

  render: () => {
    // Variable framerate rendering
    renderer.clear().setChar(player.x, player.y, "@").render();
  },
});
```

- **update()**: Fixed rate (60 times/sec), deterministic
- **render()**: Variable rate, may skip frames
- **deltaTime**: Time since last update (for smooth movement)

## Input Handling

### Keyboard

```typescript
const keyboard = new KeyboardManager();

keyboard.onKeyDown("Space", () => player.jump());
keyboard.onKeyDown("w", () => player.move(0, -1));
keyboard.onKeyUp("Shift", () => (player.sprint = false));
```

### Pointer Input

```typescript
const pointer = new PointerManager(canvas, 80, 24, 8, 16);

pointer.onClick(({ grid }) => {
  console.log(`Clicked screen (${grid.x}, ${grid.y})`);

  const world = renderer.screenToWorld(grid.x, grid.y);
  console.log(`World position (${world.x}, ${world.y})`);
});

pointer.onHover(({ grid }) => {
  // Update cursor position
});
```

## Performance Tips

### 1. Reuse Objects

```typescript
// Bad: Creates garbage
renderer.setChar(x, y, "@", { r: 255, g: 0, b: 0 });

// Good: Reuse color object
const RED = { r: 255, g: 0, b: 0 };
renderer.setChar(x, y, "@", RED);
```

### 2. Use Layers Wisely

Draw static content once:

```typescript
// One-time background
renderer.layer("background").drawMap(map);

// Each frame, only update dynamic layers
renderer.layer("entities").clearLayer("entities").drawEntities().render();
```

### 3. Avoid Unnecessary Renders

```typescript
// Bad: Renders even if nothing changed
setInterval(() => renderer.clear().render(), 16);

// Good: Only render when needed
if (gameState.dirty) {
  renderer.clear().drawEverything().render();
  gameState.dirty = false;
}
```

### 4. Batch Drawing Operations

```typescript
// Renderer is already batched!
// All drawing happens in memory, single flush
renderer.setChar(1, 1, "a").setChar(2, 1, "b").setChar(3, 1, "c").render(); // Single flush
```

## Next Steps

- [Renderer API](/guide/renderer-api) - Complete API reference
- [Box Drawing](/guide/box-drawing) - Borders and styles
- [Layer System](/guide/layer-system) - Advanced layer techniques
- [Camera System](/guide/camera-system) - Scrolling and viewports
