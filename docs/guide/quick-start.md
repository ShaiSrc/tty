# Quick Start Guide

Get started with KISS ASCII Renderer in under 5 minutes!

## Installation

```bash
npm install @shaisrc/tty
```

## Your First Render

Create an HTML file with a canvas element:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My ASCII Game</title>
  </head>
  <body>
    <canvas id="game"></canvas>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

Create `main.js`:

```typescript
import { Renderer } from "@shaisrc/tty";

// Create a renderer with the modern forCanvas API
const canvas = document.getElementById("game");
const renderer = Renderer.forCanvas(canvas, {
  grid: { width: 80, height: 24 },
  cell: { width: 8, height: 16 },
  colors: { fg: "white", bg: "black" },
});

// Draw something!
renderer
  .box(10, 5, 30, 10, { style: "double", fg: "cyan" })
  .centerText(8, "Hello, World!", { fg: "yellow" })
  .render();
```

That's it! You should see a cyan box with "Hello, World!" centered inside.

## Understanding the Basics

### 1. The Render Target

A render target is where your ASCII art gets displayed. Currently, we support:

- **CanvasTarget**: Renders to an HTML canvas element (browser)
- More targets coming soon (DOM)

```typescript
const target = new CanvasTarget(canvas, {
  width: 80, // 80 characters wide
  height: 24, // 24 characters tall
  charWidth: 8, // Each character is 8 pixels wide
  charHeight: 16, // Each character is 16 pixels tall
});
```

### 2. The Renderer

The renderer is your main drawing tool. It provides:

- **Primitives**: `setChar()`, `drawText()`, `fill()`
- **Shapes**: `box()`, `border()`, `rect()`
- **Helpers**: `menu()`, `progressBar()`, `panel()`
- **Alignment**: `centerText()`, `rightAlign()`, `leftAlign()`

All methods are **chainable**:

```typescript
renderer.clear().box(5, 5, 20, 10).drawText(7, 7, "Chaining!").render();
```

### 3. The Render Loop

Always call `.render()` to flush your drawing to the screen:

```typescript
renderer
  .clear()          // Clear the buffer
  .drawText(...)    // Draw stuff
  .box(...)         // Draw more stuff
  .render()         // Make it visible!
```

## Common Patterns

### Drawing a Menu

```typescript
const menuItems = ["New Game", "Load Game", "Options", "Quit"];
let selected = 0;

function draw() {
  renderer
    .clear()
    .centerText(5, "MAIN MENU", { fg: "yellow" })
    .menu(25, 10, menuItems, {
      selected,
      indicator: ">",
      border: true,
      selectedFg: "black",
      selectedBg: "white",
    })
    .render();
}
```

### Game Loop

```typescript
import { GameLoop } from "@shaisrc/tty";

const game = new GameLoop(
  (deltaTime) => {
    // Update game state
    player.x += velocity.x * deltaTime;
  },
  () => {
    // Draw everything
    renderer.clear().setChar(player.x, player.y, "@", "yellow").render();
  },
  { fps: 60 },
);

game.start();
```

### Keyboard Input

```typescript
import { KeyboardManager } from "@shaisrc/tty";

const keyboard = new KeyboardManager();

keyboard.onKeyDown("ArrowUp", () => {
  player.y -= 1;
});

keyboard.onKeyDown("Space", () => {
  player.shoot();
});
```

### Progress Bar

```typescript
renderer.progressBar(10, 15, 30, health / maxHealth, {
  style: "blocks",
  fillFg: health > 50 ? "green" : "red",
  emptyFg: "gray",
  showPercent: true,
  label: "HP",
});
```

## Working with Layers

Layers let you organize your drawing and control rendering order:

```typescript
renderer
  // Draw background on its own layer
  .layer("background")
  .fill(0, 0, 80, 24, " ", null, "#003366")

  // Draw game entities
  .layer("entities")
  .setChar(player.x, player.y, "@", "yellow")

  // Draw UI on top
  .layer("ui")
  .box(0, 0, 20, 5, { style: "single" })
  .drawText(2, 2, `HP: ${player.hp}`)

  // Set render order (bottom to top)
  .layerOrder(["background", "entities", "ui"])
  .render();
```

## Using the Camera

For games with worlds larger than the screen:

```typescript
const worldSize = { width: 200, height: 200 }
const player = { x: 100, y: 100 }

function render() {
  renderer
    .clear()
    .follow(player.x, player.y)  // Camera follows player
    .setChar(player.x, player.y, '@', 'yellow')

    // Draw world objects using world coordinates
    for (const tree of trees) {
      renderer.setChar(tree.x, tree.y, 'T', 'green')
    }

    .render()
}
```

## Colors

Supports multiple color formats:

```typescript
// Named colors
renderer.drawText(0, 0, "Red", { fg: "red" });

// Hex colors
renderer.drawText(0, 1, "Custom", { fg: "#FF6600" });

// RGB objects
renderer.drawText(0, 2, "RGB", { fg: { r: 255, g: 0, b: 255 } });

// Color utilities
import { brighten, darken, lerp } from "@shaisrc/tty";

const lighter = brighten("blue", 0.3); // 30% brighter
const darker = darken("red", 0.5); // 50% darker
const mixed = lerp("red", "blue", 0.5); // 50% between red and blue
```

## Next Steps

- Check out the [complete examples](../examples/) for full working demos
- Read the [API documentation](./renderer-api.md) for detailed method references
- Explore [advanced features](./README.md) like camera systems and layer management
- Review the [box drawing guide](./box-drawing.md) for styling options
- Learn about [game loop patterns](./game-loop.md)

## Need Help?

- **API Docs**: See [docs/](./README.md) for comprehensive documentation
- **Examples**: Check [examples/](../examples/) for working code
- **Issues**: Report bugs on GitHub

Happy coding! 🎮
