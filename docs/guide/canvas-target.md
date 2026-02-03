# CanvasTarget

`CanvasTarget` is a render target implementation that outputs to an HTML Canvas element in browser environments.

## Overview

The `CanvasTarget` class implements the `RenderTarget` interface, providing a way to render ASCII characters to a Canvas element with full color support.

## Constructor

```typescript
new CanvasTarget(canvas: HTMLCanvasElement, options: CanvasTargetOptions)
```

### Parameters

- **canvas**: The HTML Canvas element to render to
- **options**: Configuration (see below)

### CanvasTargetOptions

```typescript
interface CanvasTargetOptions {
  width: number; // Width in characters
  height: number; // Height in characters
  charWidth?: number; // Character width in pixels (default: 8)
  charHeight?: number; // Character height in pixels (default: 16)
  fontFamily?: string; // Font family (default: 'monospace')
  fontSize?: number; // Font size in pixels (default: 14)
}
```

## Example Usage

### Basic Setup

```typescript
import { CanvasTarget } from "@shaisrc/tty";

// Get canvas element
const canvas = document.getElementById("game") as HTMLCanvasElement;

// Create target with 80x24 character grid
const target = new CanvasTarget(canvas, { width: 80, height: 24 });

// Canvas size will be 640x384 pixels (80*8 x 24*16)
```

### Custom Font Settings

```typescript
const target = new CanvasTarget(canvas, {
  width: 80,
  height: 24,
  charWidth: 12,
  charHeight: 20,
  fontFamily: "Courier New",
  fontSize: 16,
});

// Canvas size will be 960x480 pixels (80*12 x 24*20)
```

### Using with Renderer

```typescript
import { CanvasTarget } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });

// Draw some characters
target.clear();
target.setCell(0, 0, "@", "yellow", "black");
target.setCell(1, 0, "H", "white", null);
target.setCell(2, 0, "e", "white", null);
target.setCell(3, 0, "l", "white", null);
target.setCell(4, 0, "l", "white", null);
target.setCell(5, 0, "o", "white", null);
target.flush(); // No-op for canvas (updates are immediate)
```

## Methods

### `setCell(x: number, y: number, char: string, fg: Color, bg: Color): void`

Sets a character at the specified grid position.

```typescript
// Draw an 'X' with red foreground and black background
target.setCell(10, 5, "X", "red", "black");

// Draw a space (effectively clearing the cell)
target.setCell(10, 5, " ", null, null);

// Background only (no visible character)
target.setCell(10, 5, " ", null, "blue");
```

**Behavior:**

- Background is drawn first if provided
- Character is not drawn if it's a space or empty
- Foreground color is used for the character
- Coordinates are in character grid units, not pixels

### `clear(): void`

Clears the entire canvas.

```typescript
target.clear();
```

This removes all content and resets the canvas to transparent.

### `flush(): void`

Flushes changes to the output (no-op for canvas).

```typescript
target.flush();
```

**Note:** Canvas updates are immediate, so this method does nothing. It exists to satisfy the `RenderTarget` interface.

### `getSize(): { width: number; height: number }`

Returns the size of the render target in characters.

```typescript
const { width, height } = target.getSize();
console.log(`Grid is ${width}x${height} characters`);
```

### `getCanvas(): HTMLCanvasElement`

Returns the underlying canvas element.

```typescript
const canvas = target.getCanvas();
console.log(`Canvas size: ${canvas.width}x${canvas.height}px`);
```

### `setOptions(options: Partial<CanvasTargetOptions>): void`

Updates canvas configuration at runtime.

```typescript
// Make characters larger
target.setOptions({
  charWidth: 16,
  charHeight: 24,
});

// Change font
target.setOptions({
  fontFamily: "Consolas",
  fontSize: 18,
});
```

**Note:** Changing `charWidth` or `charHeight` will resize the canvas element.

## Coordinate System

CanvasTarget uses a character-based coordinate system:

- Origin (0, 0) is at the **top-left**
- X increases to the right
- Y increases downward
- All coordinates are in character units, not pixels

```
(0,0) ─────> X
  │
  │
  │
  ▼
  Y
```

Pixel positions are calculated automatically:

```typescript
pixelX = characterX * charWidth;
pixelY = characterY * charHeight;
```

## Color Support

CanvasTarget supports all color formats via the color utility functions:

```typescript
// Named colors
target.setCell(0, 0, "@", "red", "black");

// Hex colors
target.setCell(1, 0, "#", "#ff00ff", "#000000");

// RGB colors
target.setCell(2, 0, "$", { r: 255, g: 128, b: 0 }, null);

// Null for transparent
target.setCell(3, 0, "%", "white", null);
```

Colors are automatically converted to CSS `rgb()` strings internally.

## Performance Considerations

### Immediate Rendering

Unlike some render targets, CanvasTarget draws immediately on each `setCell()` call. This means:

- No buffering delay
- Updates are visible immediately
- No need to call `flush()`

### Optimization Tips

1. **Minimize setCell calls**: Only update cells that have changed
2. **Batch operations**: Group related drawing operations together
3. **Use requestAnimationFrame**: For smooth animations
4. **Clear selectively**: Only clear areas that need updating

Example of efficient rendering:

```typescript
function render() {
  // Only clear and redraw changed regions
  for (const entity of movedEntities) {
    target.setCell(entity.oldX, entity.oldY, " ", null, null);
    target.setCell(entity.x, entity.y, entity.char, entity.color, null);
  }

  movedEntities.clear();
  requestAnimationFrame(render);
}
```

## Browser Compatibility

CanvasTarget requires:

- HTML5 Canvas support
- 2D rendering context

Supported in all modern browsers:

- Chrome/Edge (all versions)
- Firefox (all versions)
- Safari (all versions)

## Error Handling

### Context Unavailable

```typescript
const canvas = document.getElementById("game") as HTMLCanvasElement;

try {
  const target = new CanvasTarget(canvas, { width: 80, height: 24 });
} catch (error) {
  console.error("Failed to create CanvasTarget:", error);
  // Error: "Failed to get 2D context from canvas"
}
```

This can happen if:

- Canvas element is invalid
- Another library has acquired the context
- Browser doesn't support 2D context

## Complete Example

```typescript
<!DOCTYPE html>
<html>
<head>
  <title>CanvasTarget Example</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    canvas {
      border: 2px solid #444;
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>

  <script type="module">
    import { CanvasTarget } from '@shaisrc/tty';

    const canvas = document.getElementById('game');
    const target = new CanvasTarget(canvas, {
      width: 80,
      height: 24,
      charWidth: 10,
      charHeight: 18,
      fontFamily: 'monospace',
      fontSize: 14
    });

    // Draw a simple scene
    target.clear();

    // Title
    const title = "HELLO CANVAS!";
    const startX = Math.floor((80 - title.length) / 2);
    for (let i = 0; i < title.length; i++) {
      target.setCell(startX + i, 2, title[i], 'yellow', 'blue');
    }

    // Border
    for (let x = 0; x < 80; x++) {
      target.setCell(x, 0, '═', 'cyan', null);
      target.setCell(x, 23, '═', 'cyan', null);
    }
    for (let y = 0; y < 24; y++) {
      target.setCell(0, y, '║', 'cyan', null);
      target.setCell(79, y, '║', 'cyan', null);
    }

    // Player
    target.setCell(40, 12, '@', 'white', null);
  </script>
</body>
</html>
```

## Next Steps

- See [Core Types](./core-types.md) for color and type definitions
- See [Color Utilities](./color-utilities.md) for color manipulation
- See [Renderer API](./renderer-api.md) for the high-level rendering interface
