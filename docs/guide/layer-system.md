# Layer System

The layer system provides z-order rendering, allowing you to organize your scene into multiple layers that can be shown, hidden, and rendered in a specific order.

## Overview

Layers let you separate different parts of your UI/game into independent render buffers. Common use cases:

- **Background layer**: terrain, floor tiles
- **Entities layer**: player, enemies, NPCs
- **UI layer**: menus, HUD, dialogs

## Basic Usage

```typescript
const renderer = new Renderer(target);

renderer
  .layer("background")
  .fill(0, 0, 80, 24, ".", "gray")
  .layer("entities")
  .setChar(40, 12, "@", "yellow")
  .layer("ui")
  .box(0, 0, 20, 5, { style: "single", fg: "white" })
  .render();
```

## API Reference

### `layer(name: string): this`

Switch to or create a named layer. All subsequent drawing operations affect this layer until you switch to another.

**Parameters:**

- `name`: Layer name (string)

**Returns:** The renderer instance for chaining

**Example:**

```typescript
renderer
  .layer("background")
  .fill(0, 0, 80, 24, " ", null, "black")
  .layer("foreground")
  .setChar(10, 10, "@");
```

### `layerOrder(order: string[]): this`

Set the rendering order of layers. Layers are rendered from first to last, so the last layer in the array appears on top.

**Parameters:**

- `order`: Array of layer names in render order

**Returns:** The renderer instance for chaining

**Example:**

```typescript
renderer.layerOrder(["background", "entities", "effects", "ui"]).render();
```

**Note:** Layers not in the order array won't be rendered. The default order is `['main']`.

### `hideLayer(name: string): this`

Hide a layer from rendering without clearing its contents.

**Parameters:**

- `name`: Layer name

**Returns:** The renderer instance for chaining

**Example:**

```typescript
renderer
  .hideLayer("ui") // Temporarily hide UI
  .render();
```

### `showLayer(name: string): this`

Show a previously hidden layer.

**Parameters:**

- `name`: Layer name

**Returns:** The renderer instance for chaining

**Example:**

```typescript
renderer
  .showLayer("ui") // Bring UI back
  .render();
```

### `clearLayer(name: string): this`

Clear all content from a specific layer without affecting other layers.

**Parameters:**

- `name`: Layer name

**Returns:** The renderer instance for chaining

**Example:**

```typescript
renderer
  .clearLayer("temporary") // Clear temp layer only
  .render();
```

## Patterns & Best Practices

### Game Loop with Layers

```typescript
const renderer = new Renderer(canvasTarget);

// Setup layer order once
renderer.layerOrder(["background", "entities", "ui"]);

function gameLoop() {
  // Clear only what changes
  renderer.clearLayer("entities").clearLayer("ui");

  // Redraw entities
  renderer.layer("entities").setChar(player.x, player.y, "@", "yellow");

  enemies.forEach((enemy) => {
    renderer.setChar(enemy.x, enemy.y, "E", "red");
  });

  // Draw UI
  renderer.layer("ui").drawText(2, 1, `HP: ${player.hp}`, { fg: "green" });

  // Render all layers
  renderer.render();

  requestAnimationFrame(gameLoop);
}
```

### Toggle UI Visibility

```typescript
let uiVisible = true;

function toggleUI() {
  if (uiVisible) {
    renderer.hideLayer("ui");
  } else {
    renderer.showLayer("ui");
  }
  uiVisible = !uiVisible;
  renderer.render();
}
```

### Dynamic Layer Management

```typescript
// Add a temporary effect layer
renderer.layer("effects").setChar(x, y, "*", "yellow");

// Existing layers array
const currentOrder = ["background", "entities", "ui"];

// Insert effects layer before UI
renderer.layerOrder(["background", "entities", "effects", "ui"]);

// Later, remove effect
renderer.clearLayer("effects");
renderer.layerOrder(["background", "entities", "ui"]);
```

## Performance Notes

- **Layer compositing is fast**: Layers are composited into a single buffer before rendering
- **Don't clear what doesn't change**: Static layers (like background) can be drawn once and left alone
- **Layer count doesn't matter much**: Having 10 layers with 100 cells each is roughly the same cost as 1 layer with 1000 cells
- **Rendering order matters**: Only visible layers in `layerOrder` are composited

## Common Patterns

### Background That Never Changes

```typescript
// Draw once
renderer.layer("background").fill(0, 0, 80, 24, ".", "gray");

// In game loop, don't clear or redraw background
function update() {
  renderer
    .clearLayer("entities") // Only clear what moves
    .layer("entities")
    .setChar(player.x, player.y, "@");

  renderer.render(); // Background persists
}
```

### Modal Dialog Over Game

```typescript
// Game running normally
renderer.layerOrder(["background", "entities", "ui"]);

// Show modal
renderer
  .layer("modal")
  .box(20, 8, 40, 10, { style: "double", fill: true, bg: "black" })
  .centerText(10, "Are you sure?", { fg: "yellow" })
  .layerOrder(["background", "entities", "ui", "modal"])
  .render();

// Hide modal later
renderer
  .clearLayer("modal")
  .layerOrder(["background", "entities", "ui"])
  .render();
```

### Z-Fighting (when two layers overlap)

If two layers have content at the same position, the **last layer in the render order wins**:

```typescript
renderer
  .layer("layer1")
  .setChar(10, 10, "A", "red")
  .layer("layer2")
  .setChar(10, 10, "B", "blue")
  .layerOrder(["layer1", "layer2"])
  .render();

// Result: 'B' (blue) is visible, because layer2 is last
```

## Architecture

The layer system uses a `LayerManager` internally to handle:

- Layer creation and management
- Visibility tracking
- Render order enforcement
- Buffer compositing

Each layer maintains its own `Map<string, Cell>` buffer, and during render, all visible layers are composited into a single output buffer in the specified order.

---

**Related:** [Renderer API](./renderer-api.md) | [Camera System](./camera-system.md)
