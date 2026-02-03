# Mouse Input System (DEPRECATED)

> **⚠️ Deprecated:** `MouseManager` is deprecated. Use [`PointerManager`](./pointer-input.md) instead for unified mouse, touch, and pen support.
>
> This guide is kept for legacy reference. For new projects, see [Pointer Input System](./pointer-input.md).

The `MouseManager` class provides game-friendly mouse input handling with grid-based coordinate conversion, button state tracking, and event callbacks.

## Migration to PointerManager

`PointerManager` is a drop-in replacement:

```typescript
// Old (deprecated)
import { MouseManager } from "@shaisrc/tty";
const mouse = new MouseManager(element, 80, 24, 10, 10);

// New (recommended)
import { PointerManager } from "@shaisrc/tty";
const pointer = new PointerManager(element, 80, 24, 10, 10);
```

All methods and properties are identical. See [Pointer Input Guide](./pointer-input.md) for details.

---

## Legacy Documentation

## Features

- **Position Tracking** - Track mouse position in pixels and grid coordinates
- **Button State** - Detect button press/release for all mouse buttons (left, right, middle)
- **Frame-based Detection** - `justPressed` and `justReleased` for single-frame detection
- **Event Callbacks** - Register callbacks for clicks, hover, drag start/end
- **Grid Coordinates** - Automatic pixel-to-grid conversion
- **World Coordinates** - Convert to world coordinates with camera offset
- **Hover Detection** - Check if hovering over element or specific grid cell
- **Drag Tracking** - Detect drag operations with delta tracking

## Quick Start

```typescript
import { MouseManager } from "@shaisrc/tty";

// Create mouse manager
const element = document.getElementById("game-canvas")!;
const mouse = new MouseManager(
  element,
  80, // grid width
  24, // grid height
  10, // cell width in pixels
  10, // cell height in pixels
);

// In game loop
function update() {
  // Check button states
  if (mouse.justPressed(0)) {
    const grid = mouse.getGridPosition();
    console.log(`Clicked at grid: ${grid.x}, ${grid.y}`);
  }

  // Clear frame state (do this once per frame)
  mouse.update();

  requestAnimationFrame(update);
}

// Cleanup when done
mouse.destroy();
```

## API Reference

### Constructor

```typescript
new MouseManager(
  element: HTMLElement,
  gridWidth: number,
  gridHeight: number,
  cellWidth: number,
  cellHeight: number
)
```

Creates a new mouse manager that tracks mouse input on the specified element.

**Parameters:**

- `element` - HTML element to attach event listeners to
- `gridWidth` - Width of the grid in cells
- `gridHeight` - Height of the grid in cells
- `cellWidth` - Width of each cell in pixels
- `cellHeight` - Height of each cell in pixels

### Button State

#### `isPressed(button: number): boolean`

Check if a mouse button is currently pressed.

**Parameters:**

- `button` - Button number (0 = left, 1 = middle, 2 = right)

**Returns:** `true` if button is currently pressed

```typescript
if (mouse.isPressed(0)) {
  // Left button is pressed
}
```

#### `isLeftPressed(): boolean`

Check if left mouse button is currently pressed.

```typescript
if (mouse.isLeftPressed()) {
  handleLeftClick();
}
```

#### `isRightPressed(): boolean`

Check if right mouse button is currently pressed.

```typescript
if (mouse.isRightPressed()) {
  showContextMenu();
}
```

#### `isMiddlePressed(): boolean`

Check if middle mouse button is currently pressed.

```typescript
if (mouse.isMiddlePressed()) {
  startCameraPan();
}
```

#### `justPressed(button: number): boolean`

Check if button was just pressed **this frame**. Returns `true` only once until `update()` is called.

**Parameters:**

- `button` - Button number (0 = left, 1 = middle, 2 = right)

```typescript
// In game loop
if (mouse.justPressed(0)) {
  // Handle single click (won't repeat until released and pressed again)
  fireWeapon();
}

mouse.update(); // Clear justPressed state
```

#### `justReleased(button: number): boolean`

Check if button was just released **this frame**. Returns `true` only once until `update()` is called.

```typescript
if (mouse.justReleased(0)) {
  // Handle button release
  stopDragging();
}
```

### Position Tracking

#### `getPosition(): MousePosition`

Get current mouse position in pixels relative to the element.

**Returns:** `{ x: number, y: number }` - Pixel coordinates

```typescript
const pos = mouse.getPosition();
console.log(`Mouse at ${pos.x}px, ${pos.y}px`);
```

#### `getGridPosition(): MousePosition`

Get current mouse position in grid coordinates.

**Returns:** `{ x: number, y: number }` - Grid cell coordinates

```typescript
const grid = mouse.getGridPosition();
console.log(`Hovering cell ${grid.x}, ${grid.y}`);
```

#### `getWorldPosition(cameraX: number, cameraY: number): MousePosition`

Convert mouse position to world coordinates using camera offset.

**Parameters:**

- `cameraX` - Camera X offset
- `cameraY` - Camera Y offset

**Returns:** `{ x: number, y: number }` - World coordinates

```typescript
const camera = renderer.getCamera();
const world = mouse.getWorldPosition(camera.x, camera.y);
console.log(`World position: ${world.x}, ${world.y}`);
```

### Hover Detection

#### `isHovering(): boolean`

Check if mouse is currently hovering over the element.

```typescript
if (mouse.isHovering()) {
  renderer.drawText(0, 0, "Mouse over game!", { fg: "yellow" });
}
```

#### `isHoveringCell(x: number, y: number): boolean`

Check if mouse is hovering over a specific grid cell.

**Parameters:**

- `x` - Grid cell X coordinate
- `y` - Grid cell Y coordinate

```typescript
// Highlight hovered cell
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 80; x++) {
    if (mouse.isHoveringCell(x, y)) {
      renderer.rect(x, y, 1, 1, " ", null, "yellow");
    }
  }
}
```

### Drag Tracking

#### `isDragging(): boolean`

Check if currently dragging (left button pressed and moved).

```typescript
if (mouse.isDragging()) {
  const delta = mouse.getDragDelta();
  camera.x -= Math.floor(delta.x / cellWidth);
  camera.y -= Math.floor(delta.y / cellHeight);
}
```

#### `getDragDelta(): MousePosition`

Get drag distance from start position in pixels.

**Returns:** `{ x: number, y: number }` - Delta in pixels

```typescript
const delta = mouse.getDragDelta();
console.log(`Dragged ${delta.x}px, ${delta.y}px`);
```

### Event Callbacks

#### `onClick(callback: MouseCallback): void`

Register a callback for click events.

**Callback receives:**

```typescript
{
  pixel: { x: number, y: number },  // Pixel coordinates
  grid: { x: number, y: number },   // Grid coordinates
  event: MouseEvent                  // Original DOM event
}
```

```typescript
mouse.onClick(({ grid }) => {
  console.log(`Clicked cell ${grid.x}, ${grid.y}`);
});
```

#### `onHover(callback: MouseCallback): void`

Register a callback for mouse move events.

```typescript
mouse.onHover(({ grid }) => {
  highlightedCell = grid;
});
```

#### `onDragStart(callback: MouseCallback): void`

Register a callback for drag start (left button pressed).

```typescript
mouse.onDragStart(({ grid }) => {
  dragStartCell = grid;
});
```

#### `onDragEnd(callback: MouseCallback): void`

Register a callback for drag end (left button released after drag).

```typescript
mouse.onDragEnd(({ grid }) => {
  selectRegion(dragStartCell, grid);
});
```

### Lifecycle Methods

#### `update(): void`

Clear frame-based state (`justPressed`, `justReleased`). **Call once per frame** in your game loop.

```typescript
function gameLoop() {
  // Handle input
  if (mouse.justPressed(0)) {
    handleClick();
  }

  // Render
  renderer.render();

  // Clear frame state
  mouse.update();

  requestAnimationFrame(gameLoop);
}
```

#### `clear(): void`

Clear all button states and drag state.

```typescript
// Reset on level change
mouse.clear();
```

#### `destroy(): void`

Remove all event listeners and cleanup. Call when done with the mouse manager.

```typescript
// Cleanup
mouse.destroy();
```

## Common Patterns

### Click to Move

```typescript
const mouse = new MouseManager(canvas, 80, 24, 10, 10);

mouse.onClick(({ grid }) => {
  const camera = renderer.getCamera();
  const world = {
    x: grid.x + camera.x,
    y: grid.y + camera.y,
  };

  player.moveTo(world.x, world.y);
});
```

### Hover Highlight

```typescript
function render() {
  renderer.clear();

  // Draw grid
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 80; x++) {
      // Highlight hovered cell
      if (mouse.isHoveringCell(x, y)) {
        renderer.rect(x, y, 1, 1, "·", "yellow");
      } else {
        renderer.rect(x, y, 1, 1, "·", "gray");
      }
    }
  }

  renderer.render();
}
```

### Context Menu (Right Click)

```typescript
mouse.onClick(({ grid, event }) => {
  if (event.button === 2) {
    // Right click
    event.preventDefault();
    showContextMenu(grid.x, grid.y);
  }
});

// Prevent default context menu
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
```

### Drag to Pan Camera

```typescript
let lastDragPos = { x: 0, y: 0 };

mouse.onDragStart(({ pixel }) => {
  lastDragPos = pixel;
});

function update() {
  if (mouse.isDragging()) {
    const delta = mouse.getDragDelta();
    const camera = renderer.getCamera();

    // Pan camera based on drag
    renderer.setCamera(
      camera.x - Math.floor(delta.x / 10),
      camera.y - Math.floor(delta.y / 10),
    );
  }

  mouse.update();
  requestAnimationFrame(update);
}
```

### Select Region with Drag

```typescript
let selectionStart: { x: number; y: number } | null = null;
let selectionEnd: { x: number; y: number } | null = null;

mouse.onDragStart(({ grid }) => {
  selectionStart = grid;
});

mouse.onDragEnd(({ grid }) => {
  selectionEnd = grid;

  if (selectionStart) {
    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);

    selectUnitsInRegion(minX, minY, maxX, maxY);
  }

  selectionStart = null;
  selectionEnd = null;
});

function render() {
  // Draw selection preview
  if (mouse.isDragging() && selectionStart) {
    const current = mouse.getGridPosition();
    const minX = Math.min(selectionStart.x, current.x);
    const maxX = Math.max(selectionStart.x, current.x);
    const minY = Math.min(selectionStart.y, current.y);
    const maxY = Math.max(selectionStart.y, current.y);

    renderer.box(minX, minY, maxX - minX + 1, maxY - minY + 1, {
      style: "dashed",
      fg: "cyan",
    });
  }
}
```

### Place Objects

```typescript
const mouse = new MouseManager(canvas, 80, 24, 10, 10);
let selectedTile = "wall";

mouse.onClick(({ grid }) => {
  if (mouse.isLeftPressed()) {
    const camera = renderer.getCamera();
    const world = mouse.getWorldPosition(camera.x, camera.y);
    placeTile(world.x, world.y, selectedTile);
  } else if (mouse.isRightPressed()) {
    const camera = renderer.getCamera();
    const world = mouse.getWorldPosition(camera.x, camera.y);
    eraseTile(world.x, world.y);
  }
});

// Show preview
function render() {
  if (mouse.isHovering()) {
    const camera = renderer.getCamera();
    const grid = mouse.getGridPosition();

    // Draw preview at grid position
    renderer.drawText(grid.x, grid.y, getTileChar(selectedTile), {
      fg: "white",
      bg: "gray",
    });
  }
}
```

### Tooltip on Hover

```typescript
let tooltipText = "";

mouse.onHover(({ grid }) => {
  const camera = renderer.getCamera();
  const world = mouse.getWorldPosition(camera.x, camera.y);
  const entity = getEntityAt(world.x, world.y);

  if (entity) {
    tooltipText = `${entity.name} (HP: ${entity.hp}/${entity.maxHp})`;
  } else {
    tooltipText = "";
  }
});

function render() {
  renderer.clear();
  renderGame();

  // Draw tooltip
  if (tooltipText && mouse.isHovering()) {
    const pos = mouse.getGridPosition();
    const panel = renderer.panel(
      pos.x + 1,
      pos.y + 1,
      tooltipText.length + 2,
      3,
      {
        title: "Info",
        border: "single",
        fg: "yellow",
      },
    );
    panel.text(1, 1, tooltipText);
  }

  renderer.render();
}
```

### Double Click

```typescript
let lastClickTime = 0;
const DOUBLE_CLICK_MS = 300;

mouse.onClick(({ grid }) => {
  const now = Date.now();
  const isDoubleClick = now - lastClickTime < DOUBLE_CLICK_MS;

  if (isDoubleClick) {
    console.log("Double clicked!", grid);
    openInventory();
  }

  lastClickTime = now;
});
```

### Button Combination

```typescript
// Shift + Click for multi-select
mouse.onClick(({ grid, event }) => {
  if (event.shiftKey) {
    addToSelection(grid.x, grid.y);
  } else {
    clearSelection();
    selectUnit(grid.x, grid.y);
  }
});

// Ctrl + Click for area effect
mouse.onClick(({ grid, event }) => {
  if (event.ctrlKey) {
    castAreaSpell(grid.x, grid.y, 3); // radius 3
  }
});
```

### Drag with Threshold

```typescript
const DRAG_THRESHOLD = 5; // pixels

mouse.onDragStart(({ pixel }) => {
  // Store initial position
  dragStart = pixel;
});

function update() {
  if (mouse.isDragging()) {
    const delta = mouse.getDragDelta();
    const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);

    if (distance > DRAG_THRESHOLD) {
      // Only pan if dragged past threshold
      panCamera(delta);
    }
  }

  mouse.update();
}
```

### Click vs Drag Detection

```typescript
let clickStartPos = { x: 0, y: 0 };

mouse.onDragStart(({ pixel }) => {
  clickStartPos = pixel;
});

mouse.onDragEnd(({ pixel, grid }) => {
  const delta = {
    x: pixel.x - clickStartPos.x,
    y: pixel.y - clickStartPos.y,
  };
  const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);

  if (distance < 5) {
    // It was a click, not a drag
    handleClick(grid);
  } else {
    // It was a drag
    handleDrag(delta);
  }
});
```

## Integration Examples

### With Renderer and Camera

```typescript
import { Renderer, CanvasTarget, MouseManager } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);
const mouse = new MouseManager(canvas, 80, 24, 10, 10);

// Click to move camera
mouse.onClick(({ grid }) => {
  const camera = renderer.getCamera();
  const world = mouse.getWorldPosition(camera.x, camera.y);
  renderer.follow(world.x, world.y, 80, 24);
});

function gameLoop() {
  renderer.clear();

  // Highlight hovered cell
  if (mouse.isHovering()) {
    const grid = mouse.getGridPosition();
    renderer.rect(grid.x, grid.y, 1, 1, " ", null, "yellow");
  }

  renderer.render();
  mouse.update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Complete RTS-style Input

```typescript
const mouse = new MouseManager(canvas, 80, 24, 10, 10);
const keyboard = new KeyboardManager();

let selectedUnits: Unit[] = [];
let selectionBox: { start: Point; end: Point } | null = null;

// Click to select
mouse.onClick(({ grid, event }) => {
  const camera = renderer.getCamera();
  const world = mouse.getWorldPosition(camera.x, camera.y);

  if (!event.shiftKey) {
    selectedUnits = [];
  }

  const unit = getUnitAt(world.x, world.y);
  if (unit) {
    selectedUnits.push(unit);
  }
});

// Drag to select multiple
mouse.onDragStart(({ grid }) => {
  selectionBox = { start: grid, end: grid };
});

mouse.onDragEnd(({ grid }) => {
  if (selectionBox) {
    const units = getUnitsInBox(selectionBox.start, grid);
    selectedUnits = units;
    selectionBox = null;
  }
});

// Right click to move
mouse.onClick(({ grid, event }) => {
  if (event.button === 2 && selectedUnits.length > 0) {
    const camera = renderer.getCamera();
    const world = mouse.getWorldPosition(camera.x, camera.y);
    selectedUnits.forEach((unit) => unit.moveTo(world.x, world.y));
  }
});

// Middle click to pan
let panStart = { x: 0, y: 0 };
mouse.onDragStart(({ event }) => {
  if (event.button === 1) {
    const camera = renderer.getCamera();
    panStart = camera;
  }
});

function update() {
  if (mouse.isMiddlePressed() && mouse.isDragging()) {
    const delta = mouse.getDragDelta();
    renderer.setCamera(
      panStart.x - Math.floor(delta.x / 10),
      panStart.y - Math.floor(delta.y / 10),
    );
  }

  // Arrow keys also pan
  const camera = renderer.getCamera();
  if (keyboard.isPressed("ArrowLeft")) camera.x--;
  if (keyboard.isPressed("ArrowRight")) camera.x++;
  if (keyboard.isPressed("ArrowUp")) camera.y--;
  if (keyboard.isPressed("ArrowDown")) camera.y++;

  mouse.update();
  keyboard.update();
  requestAnimationFrame(update);
}
```

## Best Practices

### Always Call update()

Call `mouse.update()` **once per frame** to clear `justPressed` and `justReleased` states:

```typescript
function gameLoop() {
  handleInput();
  updateGame();
  render();

  mouse.update(); // ← Important!

  requestAnimationFrame(gameLoop);
}
```

### Use justPressed for Single Actions

Use `justPressed` instead of `isPressed` for actions that should only trigger once per click:

```typescript
// ✅ Good - fires once per click
if (mouse.justPressed(0)) {
  shoot();
}

// ❌ Bad - fires every frame while held
if (mouse.isPressed(0)) {
  shoot(); // Spam!
}
```

### World vs Grid vs Pixel Coordinates

Be clear about which coordinate system you're using:

```typescript
// Pixel: Raw mouse position
const pixel = mouse.getPosition(); // { x: 145, y: 230 }

// Grid: Screen cell coordinates
const grid = mouse.getGridPosition(); // { x: 14, y: 23 }

// World: Grid + camera offset
const camera = renderer.getCamera();
const world = mouse.getWorldPosition(camera.x, camera.y); // { x: 114, y: 123 }
```

### Cleanup on Destroy

Always call `destroy()` when done to prevent memory leaks:

```typescript
// When switching scenes
function exitGame() {
  mouse.destroy();
  keyboard.destroy();
  renderer.destroy();
}
```

### Combine with Keyboard for Best UX

```typescript
// Shift + click for multi-select
mouse.onClick(({ grid }) => {
  if (keyboard.isPressed("Shift")) {
    addToSelection(grid);
  } else {
    selectSingle(grid);
  }
});

// Ctrl + drag for duplicate
mouse.onDragEnd(({ grid }) => {
  if (keyboard.isPressed("Control")) {
    duplicateObject(grid);
  } else {
    moveObject(grid);
  }
});
```
