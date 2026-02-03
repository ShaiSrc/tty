# Renderer API

The `Renderer` class is the main interface for drawing to the screen. It provides a chainable API with double-buffering and support for multiple rendering primitives.

## Overview

The Renderer class:

- Provides drawing primitives (setChar, drawText, fill)
- Uses double-buffering for flicker-free rendering
- Supports method chaining for better DX
- Offers both safe mode (throws on errors) and clip mode (ignores out-of-bounds)
- Works with any RenderTarget implementation

## Constructor

```typescript
new Renderer(target: RenderTarget, options?: RendererCreateOptions)
```

### Parameters

- **target**: Any object implementing the `RenderTarget` interface
- **options**: Optional configuration

### RendererCreateOptions

```typescript
interface RendererCreateOptions {
  defaultFg?: Color; // Default foreground color
  defaultBg?: Color; // Default background color
  autoClear?: boolean; // Auto-clear render target each frame
  clearColor?: Color; // Optional clear color when autoClear is enabled
}
```

## Auto-Clear Example

```typescript
import { Renderer } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const renderer = Renderer.fromCanvas(
  canvas,
  { width: 80, height: 24 },
  {
    defaultFg: "white",
    defaultBg: "black",
    autoClear: true,
    clearColor: "black",
  },
);

function renderFrame() {
  renderer.clear().drawText(0, 0, "AUTO-CLEAR", { fg: "yellow" }).render();
}
```

By default, `autoClear` is `false`, so you control background clearing manually
with `.fill(...)` or custom draw logic. Enable `autoClear` to have the renderer
clear the target before each frame.

## Factory Methods (Recommended)

For convenience, Renderer provides static factory methods.

### `Renderer.forCanvas(canvas, options)` (Recommended)

Create a renderer with improved, semantic API grouping. **This is the recommended method for new code.**

```typescript
const renderer = Renderer.forCanvas(canvas, {
  grid: { width: 80, height: 24 },
  cell: { width: 12, height: 20 },
  font: { family: "monospace", size: 16 },
  colors: { fg: "white", bg: "black" },
});
```

#### CanvasRendererOptions

```typescript
interface CanvasRendererOptions {
  // Grid dimensions (required)
  grid: {
    width: number; // Grid width in characters
    height: number; // Grid height in characters
  };
  // Cell/character sizing (optional)
  cell?: {
    width?: number; // Character width in pixels (default: 8)
    height?: number; // Character height in pixels (default: 16)
  };
  // Font configuration (optional)
  font?: {
    family?: string; // Font family (default: 'monospace')
    size?: number; // Font size in pixels (default: 14)
  };
  // Color defaults (optional)
  colors?: {
    fg?: Color; // Default foreground color
    bg?: Color; // Default background color
  };
  // Auto-clear behavior (optional)
  autoClear?: boolean; // Auto-clear render target each frame
  clearColor?: Color; // Clear color when autoClear is enabled
}
```

### `Renderer.fromCanvas(canvas, canvasOptions, rendererOptions?)`

Alternative factory method with separate canvas and renderer options.

```typescript
const renderer = Renderer.fromCanvas(
  canvas,
  {
    width: 80,
    height: 24,
    charWidth: 12,
    charHeight: 20,
  },
  {
    defaultFg: "white",
    defaultBg: "black",
  },
);
```

### Comparison

```typescript
// Manual approach (most control, most verbose)
import { Renderer, CanvasTarget } from "@shaisrc/tty";
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target, { defaultFg: "white" });

// fromCanvas (simpler, flat options)
const renderer = Renderer.fromCanvas(
  canvas,
  { width: 80, height: 24 },
  { defaultFg: "white" },
);

// forCanvas (recommended, semantic grouping)
const renderer = Renderer.forCanvas(canvas, {
  grid: { width: 80, height: 24 },
  colors: { fg: "white" },
});
```

## Properties

### `width: number` (readonly)

Width of the render target in characters.

```typescript
console.log(renderer.width); // 80
```

### `height: number` (readonly)

Height of the render target in characters.

```typescript
console.log(renderer.height); // 24
```

## Drawing Methods

### `setChar(x, y, char, fg?, bg?): this`

Set a single character at the specified position.

```typescript
renderer.setChar(10, 5, "@", "yellow", "black");
```

**Parameters:**

- `x`: X coordinate (0-indexed)
- `y`: Y coordinate (0-indexed)
- `char`: Character to display
- `fg`: Foreground color (optional, uses default if omitted)
- `bg`: Background color (optional, uses default if omitted)

**Returns:** The renderer instance for chaining

### `drawText(x, y, text, options?): this`

Draw a string of text horizontally.

```typescript
renderer.drawText(5, 10, "Hello, World!", { fg: "green" });
```

**Parameters:**

- `x`: Starting X coordinate
- `y`: Y coordinate
- `text`: Text to draw
- `options`: Text styling options

**TextOptions:**

```typescript
interface TextOptions {
  fg?: Color; // Foreground color
  bg?: Color; // Background color
  wrap?: boolean; // Enable word wrapping (not yet implemented)
  align?: TextAlign; // Text alignment (not yet implemented)
}
```

**Returns:** The renderer instance for chaining

### `fill(x, y, width, height, char, fg?, bg?): this`

Fill a rectangular area with a character.

```typescript
renderer.fill(10, 5, 20, 10, " ", null, "blue");
```

**Parameters:**

- `x`: Starting X coordinate
- `y`: Starting Y coordinate
- `width`: Width of the rectangle
- `height`: Height of the rectangle
- `char`: Character to fill with
- `fg`: Foreground color (optional)
- `bg`: Background color (optional)

**Returns:** The renderer instance for chaining

## Buffer Management

### `clear(): this`

Clear the render buffer.

```typescript
renderer.clear();
```

**Note:** This clears the internal buffer, not the screen. Call `render()` to update the display.

**Returns:** The renderer instance for chaining

### `render(): this`

Flush the buffer to the render target.

```typescript
renderer.render();
```

This method:

1. Sends all buffered cells to the render target
2. Calls `flush()` on the target
3. Leaves the buffer intact for the next frame

**Returns:** The renderer instance for chaining

### `getCell(x, y): Cell | undefined`

Get the current cell at a position from the buffer.

```typescript
const cell = renderer.getCell(10, 5);
if (cell) {
  console.log(`Character: ${cell.char}, Color: ${cell.fg}`);
}
```

**Returns:** The cell at the position, or undefined if not set

## Mode Configuration

### `setSafeMode(enabled): this`

Enable or disable safe mode.

In safe mode, out-of-bounds operations throw errors. This is useful during development to catch bugs.

```typescript
renderer.setSafeMode(true);
renderer.setChar(-1, 0, "X"); // Throws error
```

**Default:** `false`

**Returns:** The renderer instance for chaining

### `setClipMode(enabled): this`

Enable or disable clip mode.

In clip mode, out-of-bounds operations are silently ignored. This is useful for drawing that might extend beyond screen boundaries.

```typescript
renderer.setClipMode(true);
renderer.setChar(-1, 0, "X"); // Silently ignored
renderer.drawText(78, 0, "Hello"); // Only 'He' appears
```

**Default:** `false`

**Returns:** The renderer instance for chaining

### `validate` (object)

Validation helpers for bounds checking operations before drawing.

The `validate` object provides methods to check if drawing operations would fit within the renderer's bounds. This is useful for conditional rendering logic and preventing out-of-bounds errors.

#### `validate.cell(x, y): boolean`

Check if a single cell position is within bounds.

```typescript
if (renderer.validate.cell(x, y)) {
  renderer.setChar(x, y, "@");
} else {
  console.warn("Position out of bounds");
}
```

#### `validate.box(x, y, width, height): boolean`

Check if a box would fit entirely within bounds.

```typescript
if (renderer.validate.box(x, y, 20, 10)) {
  renderer.box(x, y, 20, 10);
} else {
  console.warn("Box would extend outside screen");
}
```

#### `validate.text(x, y, text): boolean`

Check if text would fit within bounds.

```typescript
const message = "This is a long message";
if (renderer.validate.text(x, y, message)) {
  renderer.drawText(x, y, message);
} else {
  // Truncate to fit
  const maxLen = renderer.width - x;
  renderer.drawText(x, y, message.substring(0, maxLen));
}
```

#### `validate.line(x1, y1, x2, y2): boolean`

Check if both line endpoints are within bounds.

```typescript
if (renderer.validate.line(x1, y1, x2, y2)) {
  renderer.drawLine(x1, y1, x2, y2, "-");
}
```

**Usage Examples:**

```typescript
// Safe dynamic menu positioning
const menuWidth = 30;
const menuHeight = 10;
const x = playerX - menuWidth / 2;
const y = playerY - menuHeight - 2;

if (renderer.validate.box(x, y, menuWidth, menuHeight)) {
  renderer.menu(x, y, menuItems);
} else {
  // Fallback to center screen
  const centerX = (renderer.width - menuWidth) / 2;
  const centerY = (renderer.height - menuHeight) / 2;
  renderer.menu(centerX, centerY, menuItems);
}
```

## Usage Examples

### Basic Usage

```typescript
import { Renderer, CanvasTarget } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);

// Draw something
renderer
  .clear()
  .setChar(10, 5, "@", "yellow")
  .drawText(0, 0, "Hello, World!", { fg: "green" })
  .render();
```

### Game Loop

```typescript
function gameLoop() {
  // Clear previous frame
  renderer.clear();

  // Draw game state
  drawMap(renderer);
  drawEntities(renderer);
  drawUI(renderer);

  // Render to screen
  renderer.render();

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### With Method Chaining

```typescript
renderer
  .clear()
  .fill(0, 0, 80, 24, " ", null, "black")
  .drawText(35, 10, "GAME OVER", { fg: "red" })
  .drawText(30, 12, "Press SPACE to retry", { fg: "white" })
  .render();
```

### Clip Mode for Scrolling

```typescript
renderer.setClipMode(true);

// Draw a large map, only visible portion appears
for (let y = 0; y < map.height; y++) {
  for (let x = 0; x < map.width; x++) {
    const screenX = x - camera.x;
    const screenY = y - camera.y;
    renderer.setChar(screenX, screenY, map.getTile(x, y).char);
  }
}

renderer.render();
```

### Safe Mode for Development

```typescript
if (process.env.NODE_ENV === "development") {
  renderer.setSafeMode(true);
}

// This will throw in development if coordinates are invalid
function drawPlayer(x: number, y: number) {
  renderer.setChar(x, y, "@", "yellow");
}
```

### Double Buffering Pattern

```typescript
// Frame 1
renderer.clear();
renderer.setChar(10, 10, "@");
renderer.render(); // Player at (10, 10)

// Frame 2
renderer.clear();
renderer.setChar(11, 10, "@");
renderer.render(); // Player at (11, 10)

// No flicker! Buffer is swapped cleanly
```

### Efficient Partial Updates

```typescript
// Only clear and redraw what changed
if (playerMoved) {
  // Clear old position
  renderer.setChar(player.oldX, player.oldY, " ");
  // Draw new position
  renderer.setChar(player.x, player.y, "@", "yellow");
  renderer.render();
}
```

## Performance Considerations

### Buffer Management

The renderer uses a Map-based buffer:

- Only stores cells that have been explicitly set
- No allocation for empty cells
- Fast lookups and updates

### Rendering Strategy

```typescript
// Good: Only render what's needed
renderer.clear();
drawVisibleArea();
renderer.render();

// Bad: Rendering unnecessary cells
for (let y = 0; y < 1000; y++) {
  for (let x = 0; x < 1000; x++) {
    renderer.setChar(x, y, " "); // Most won't be visible!
  }
}
```

### Chaining Optimization

Method chaining returns `this`, which has zero overhead:

```typescript
// These are equivalent in performance
renderer.clear();
renderer.setChar(0, 0, "A");
renderer.render();

renderer.clear().setChar(0, 0, "A").render();
```

## Coordinate System

The renderer uses a character-based coordinate system:

- Origin (0, 0) is at the top-left
- X increases to the right
- Y increases downward
- All coordinates are 0-indexed

```
(0,0) ────> X
  │
  │
  ▼
  Y
```

## Error Handling

### Safe Mode Errors

```typescript
renderer.setSafeMode(true);

try {
  renderer.setChar(-1, 0, "X");
} catch (error) {
  console.error(error.message);
  // "Position (-1, 0) is out of bounds (80x24)"
}
```

### Graceful Degradation

```typescript
// In normal mode (not safe, not clip), out-of-bounds is ignored
renderer.setChar(1000, 1000, "X"); // No error, just ignored
```

## Integration with RenderTargets

The Renderer works with any RenderTarget:

```typescript
// Browser Canvas
const canvasTarget = new CanvasTarget(canvas, { width: 80, height: 24 });
const canvasRenderer = new Renderer(canvasTarget);

// Future: DOM
const domTarget = new DOMTarget(element, 80, 24);
const domRenderer = new Renderer(domTarget);
```

## Complete Example

```typescript
import { Renderer, CanvasTarget } from "@shaisrc/tty";

// Setup
const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target, {
  defaultFg: "white",
  defaultBg: "black",
  autoClear: true,
  clearColor: "black",
});

// Enable clip mode for easier drawing
renderer.setClipMode(true);

// Game state
const player = { x: 40, y: 12, char: "@" };

// Render function
function render() {
  renderer
    .clear()
    .drawText(0, 0, "SCORE: 1000", { fg: "yellow" })
    .setChar(player.x, player.y, player.char, "green")
    .render();
}

// Input
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") player.x++;
  if (e.key === "ArrowLeft") player.x--;
  if (e.key === "ArrowDown") player.y++;
  if (e.key === "ArrowUp") player.y--;
  render();
});

// Initial render
render();
```

## Next Steps

- See [Box Drawing](./box-drawing.md) for drawing boxes and borders
- See [Layer System](./layer-system.md) for multi-layer rendering
- See [Alignment Helpers](./alignment.md) for text alignment utilities
