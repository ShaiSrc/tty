# Pointer Input System

The `PointerManager` class provides unified input handling for **mouse, touch, and pen** devices using the modern [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events). It offers game-friendly features like grid-based coordinate conversion, button state tracking, pressure sensitivity, and event callbacks.

## Features

- **Universal Input** - Works with mouse, touch, and stylus/pen
- **Position Tracking** - Track pointer position in pixels and grid coordinates
- **Button State** - Detect button press/release for all buttons (left, right, middle)
- **Pointer Type Detection** - Identify input device (mouse, touch, pen)
- **Pressure Sensitivity** - Access pressure data for pen/touch input
- **Frame-based Detection** - `justPressed` and `justReleased` for single-frame detection
- **Event Callbacks** - Register callbacks for clicks, hover, drag start/end
- **Grid Coordinates** - Automatic pixel-to-grid conversion
- **World Coordinates** - Convert to world coordinates with camera offset
- **Hover Detection** - Check if pointer is over element or specific grid cell
- **Drag Tracking** - Detect drag operations with delta tracking

## Quick Start

```typescript
import { PointerManager } from "@shaisrc/tty";

// Create pointer manager
const element = document.getElementById("game-canvas")!;
const pointer = new PointerManager(
  element,
  80, // grid width
  24, // grid height
  10, // cell width in pixels
  10, // cell height in pixels
);

// In game loop
function update() {
  // Works with mouse, touch, and pen!
  if (pointer.justPressed(0)) {
    const grid = pointer.getGridPosition();
    const type = pointer.getPointerType(); // "mouse", "touch", or "pen"
    console.log(`${type} clicked at grid: ${grid.x}, ${grid.y}`);
  }

  // Clear frame state (do this once per frame)
  pointer.update();

  requestAnimationFrame(update);
}

// Cleanup when done
pointer.destroy();
```

## Migration from MouseManager

`PointerManager` is a drop-in replacement for `MouseManager`:

```typescript
// Old (still works, but deprecated)
import { MouseManager } from "@shaisrc/tty";
const mouse = new MouseManager(element, 80, 24, 10, 10);

// New (recommended)
import { PointerManager } from "@shaisrc/tty";
const pointer = new PointerManager(element, 80, 24, 10, 10);
```

All methods are identical, plus you get:

- Touch support (taps, swipes, touch drag)
- Pen/stylus support with pressure sensitivity
- Better mobile device compatibility

## API Reference

### Constructor

```typescript
new PointerManager(
  element: HTMLElement,
  gridWidth: number,
  gridHeight: number,
  cellWidth: number,
  cellHeight: number
)
```

Creates a new pointer manager that tracks pointer input on the specified element.

**Parameters:**

- `element` - HTML element to attach event listeners to
- `gridWidth` - Width of the grid in cells
- `gridHeight` - Height of the grid in cells
- `cellWidth` - Width of each cell in pixels
- `cellHeight` - Height of each cell in pixels

### Button State

#### `isPressed(button: number): boolean`

Check if a pointer button is currently pressed.

**Parameters:**

- `button` - Button number (0 = left/primary, 1 = middle, 2 = right)

**Returns:** `true` if button is currently pressed

```typescript
if (pointer.isPressed(0)) {
  // Primary button (left mouse / touch / pen tip) is pressed
}
```

#### `isLeftPressed(): boolean`

Check if left/primary button is currently pressed (works for mouse, touch, and pen).

```typescript
if (pointer.isLeftPressed()) {
  handleClick();
}
```

#### `isRightPressed(): boolean`

Check if right button is currently pressed (mouse only).

```typescript
if (pointer.isRightPressed()) {
  showContextMenu();
}
```

#### `isMiddlePressed(): boolean`

Check if middle button is currently pressed (mouse only).

```typescript
if (pointer.isMiddlePressed()) {
  startCameraPan();
}
```

#### `justPressed(button: number): boolean`

Check if button was just pressed **this frame**. Returns `true` only once until `update()` is called.

**Parameters:**

- `button` - Button number (0 = left/primary, 1 = middle, 2 = right)

```typescript
// In game loop
if (pointer.justPressed(0)) {
  // Handle single click/tap (won't repeat until released and pressed again)
  fireWeapon();
}

pointer.update(); // Clear justPressed state
```

#### `justReleased(button: number): boolean`

Check if button was just released **this frame**. Returns `true` only once until `update()` is called.

```typescript
if (pointer.justReleased(0)) {
  // Handle button release
  stopDragging();
}
```

### Position Tracking

#### `getPosition(): PointerPosition`

Get current pointer position in pixels relative to the element.

**Returns:** `{ x: number, y: number }` - Pixel coordinates

```typescript
const pos = pointer.getPosition();
console.log(`Pointer at ${pos.x}px, ${pos.y}px`);
```

#### `getGridPosition(): PointerPosition`

Get current pointer position in grid coordinates.

**Returns:** `{ x: number, y: number }` - Grid cell coordinates

```typescript
const grid = pointer.getGridPosition();
console.log(`Hovering cell ${grid.x}, ${grid.y}`);
```

#### `getWorldPosition(cameraX: number, cameraY: number): PointerPosition`

Convert pointer position to world coordinates using camera offset.

**Parameters:**

- `cameraX` - Camera X offset
- `cameraY` - Camera Y offset

**Returns:** `{ x: number, y: number }` - World coordinates

```typescript
const camera = renderer.getCamera();
const world = pointer.getWorldPosition(camera.x, camera.y);
console.log(`World position: ${world.x}, ${world.y}`);
```

### Pointer Type & Pressure

#### `getPointerType(): string`

Get the type of pointer device being used.

**Returns:** `"mouse"`, `"touch"`, `"pen"`, or `""` (unknown)

```typescript
const type = pointer.getPointerType();

if (type === "touch") {
  // Show larger touch-friendly buttons
  showTouchControls();
} else if (type === "pen") {
  // Enable pressure-sensitive drawing
  enablePressureDrawing();
}
```

#### `getPressure(): number`

Get the pressure of the pointer (0.0 to 1.0).

**Returns:** Pressure value between 0.0 (no pressure) and 1.0 (maximum pressure)

**Note:** Most useful for pen/stylus input. Touch typically returns 0.5, mouse returns 0.5 (no pressure data).

```typescript
if (pointer.getPointerType() === "pen") {
  const pressure = pointer.getPressure();
  const brushSize = Math.floor(pressure * 10); // 0-10 pixels
  drawWithBrush(brushSize);
}
```

### Hover Detection

#### `isHovering(): boolean`

Check if pointer is currently hovering over the element.

```typescript
if (pointer.isHovering()) {
  renderer.drawText(0, 0, "Pointer over game!", { fg: "yellow" });
}
```

#### `isHoveringCell(x: number, y: number): boolean`

Check if pointer is hovering over a specific grid cell.

**Parameters:**

- `x` - Grid cell X coordinate
- `y` - Grid cell Y coordinate

```typescript
// Highlight hovered cell
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 80; x++) {
    if (pointer.isHoveringCell(x, y)) {
      renderer.rect(x, y, 1, 1, " ", null, "yellow");
    }
  }
}
```

### Drag Tracking

#### `isDragging(): boolean`

Check if currently dragging (left/primary button pressed and moved).

```typescript
if (pointer.isDragging()) {
  const delta = pointer.getDragDelta();
  camera.x -= Math.floor(delta.x / cellWidth);
  camera.y -= Math.floor(delta.y / cellHeight);
}
```

#### `getDragDelta(): PointerPosition`

Get drag distance from start position in pixels.

**Returns:** `{ x: number, y: number }` - Delta in pixels

```typescript
const delta = pointer.getDragDelta();
console.log(`Dragged ${delta.x}px, ${delta.y}px`);
```

### Event Callbacks

#### `onClick(callback: PointerCallback): void`

Register a callback for click/tap events.

**Callback receives:**

```typescript
{
  pixel: { x: number, y: number },  // Pixel coordinates
  grid: { x: number, y: number },   // Grid coordinates
  event: PointerEvent                // Original DOM event
}
```

```typescript
pointer.onClick(({ grid, event }) => {
  const type = event.pointerType; // "mouse", "touch", or "pen"
  console.log(`${type} clicked cell ${grid.x}, ${grid.y}`);
});
```

#### `onHover(callback: PointerCallback): void`

Register a callback for pointer move events.

```typescript
pointer.onHover(({ grid }) => {
  highlightedCell = grid;
});
```

#### `onDragStart(callback: PointerCallback): void`

Register a callback for drag start (left/primary button pressed).

```typescript
pointer.onDragStart(({ grid }) => {
  dragStartCell = grid;
});
```

#### `onDragEnd(callback: PointerCallback): void`

Register a callback for drag end (left/primary button released after drag).

```typescript
pointer.onDragEnd(({ grid }) => {
  selectRegion(dragStartCell, grid);
});
```

### Lifecycle Methods

#### `update(): void`

Clear frame-based state (`justPressed`, `justReleased`). **Call once per frame** in your game loop.

```typescript
function gameLoop() {
  // Handle input
  if (pointer.justPressed(0)) {
    handleClick();
  }

  // Render
  renderer.render();

  // Clear frame state
  pointer.update();

  requestAnimationFrame(gameLoop);
}
```

#### `clear(): void`

Clear all button states and drag state.

```typescript
// Reset on level change
pointer.clear();
```

#### `destroy(): void`

Remove all event listeners and cleanup. Call when done with the pointer manager.

```typescript
// Cleanup
pointer.destroy();
```

## Common Patterns

### Universal Click/Tap Handler

```typescript
const pointer = new PointerManager(canvas, 80, 24, 10, 10);

pointer.onClick(({ grid, event }) => {
  const camera = renderer.getCamera();
  const world = {
    x: grid.x + camera.x,
    y: grid.y + camera.y,
  };

  // Works with mouse, touch, and pen!
  player.moveTo(world.x, world.y);
});
```

### Touch-Friendly UI

```typescript
pointer.onClick(({ grid, event }) => {
  if (event.pointerType === "touch") {
    // Larger tap targets for touch
    const TOUCH_RADIUS = 2;
    const target = findNearestButton(grid.x, grid.y, TOUCH_RADIUS);
    if (target) target.click();
  } else {
    // Precise click for mouse
    const button = getButtonAt(grid.x, grid.y);
    if (button) button.click();
  }
});
```

### Pressure-Sensitive Drawing (Pen)

```typescript
pointer.onHover(({ grid, event }) => {
  if (event.pointerType === "pen" && pointer.isLeftPressed()) {
    const pressure = pointer.getPressure();
    const brushSize = Math.floor(1 + pressure * 5); // 1-6 cells
    const opacity = 0.3 + pressure * 0.7; // 0.3-1.0

    drawBrush(grid.x, grid.y, brushSize, opacity);
  }
});
```

### Context Menu (Right Click or Long Press)

```typescript
let touchStartTime = 0;
const LONG_PRESS_MS = 500;

pointer.onDragStart(({ event }) => {
  if (event.pointerType === "touch") {
    touchStartTime = Date.now();
  }
});

pointer.onClick(({ grid, event }) => {
  // Right click for mouse
  if (event.button === 2) {
    event.preventDefault();
    showContextMenu(grid.x, grid.y);
  }
});

pointer.onDragEnd(({ grid, event }) => {
  // Long press for touch
  if (event.pointerType === "touch") {
    const duration = Date.now() - touchStartTime;
    if (duration >= LONG_PRESS_MS) {
      showContextMenu(grid.x, grid.y);
    }
  }
});
```

### Drag to Pan (All Devices)

```typescript
let lastDragPos = { x: 0, y: 0 };

pointer.onDragStart(({ pixel }) => {
  lastDragPos = pixel;
});

function update() {
  if (pointer.isDragging()) {
    const delta = pointer.getDragDelta();
    const camera = renderer.getCamera();

    // Works with mouse drag, touch drag, or pen drag!
    renderer.setCamera(
      camera.x - Math.floor(delta.x / 10),
      camera.y - Math.floor(delta.y / 10),
    );
  }

  pointer.update();
  requestAnimationFrame(update);
}
```

### Hover Highlight

```typescript
function render() {
  renderer.clear();

  // Draw grid
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 80; x++) {
      // Highlight hovered cell
      if (pointer.isHoveringCell(x, y)) {
        renderer.rect(x, y, 1, 1, "·", "yellow");
      } else {
        renderer.rect(x, y, 1, 1, "·", "gray");
      }
    }
  }

  renderer.render();
}
```

### Select Region with Drag

```typescript
let selectionStart: { x: number; y: number } | null = null;

pointer.onDragStart(({ grid }) => {
  selectionStart = grid;
});

pointer.onDragEnd(({ grid }) => {
  if (selectionStart) {
    const minX = Math.min(selectionStart.x, grid.x);
    const maxX = Math.max(selectionStart.x, grid.x);
    const minY = Math.min(selectionStart.y, grid.y);
    const maxY = Math.max(selectionStart.y, grid.y);

    selectUnitsInRegion(minX, minY, maxX, maxY);
  }

  selectionStart = null;
});

function render() {
  // Draw selection preview
  if (pointer.isDragging() && selectionStart) {
    const current = pointer.getGridPosition();
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

### Adaptive UI Based on Input Type

```typescript
let uiMode: "desktop" | "touch" | "pen" = "desktop";

pointer.onClick(({ event }) => {
  const type = event.pointerType;

  if (type === "touch") {
    uiMode = "touch";
    // Larger buttons, simplified controls
    renderTouchUI();
  } else if (type === "pen") {
    uiMode = "pen";
    // Enable drawing tools, pressure controls
    renderPenUI();
  } else {
    uiMode = "desktop";
    // Standard mouse UI
    renderDesktopUI();
  }
});
```

### Place Objects (All Devices)

```typescript
const pointer = new PointerManager(canvas, 80, 24, 10, 10);
let selectedTile = "wall";

pointer.onClick(({ grid, event }) => {
  const camera = renderer.getCamera();
  const world = pointer.getWorldPosition(camera.x, camera.y);

  if (event.button === 0 || event.pointerType === "touch") {
    // Left click or touch tap
    placeTile(world.x, world.y, selectedTile);
  } else if (event.button === 2) {
    // Right click
    eraseTile(world.x, world.y);
  }
});

// Show preview
function render() {
  if (pointer.isHovering()) {
    const grid = pointer.getGridPosition();

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

pointer.onHover(({ grid }) => {
  const camera = renderer.getCamera();
  const world = pointer.getWorldPosition(camera.x, camera.y);
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
  if (tooltipText && pointer.isHovering()) {
    const pos = pointer.getGridPosition();
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

## Integration Examples

### With Renderer and Camera

```typescript
import { Renderer, CanvasTarget, PointerManager } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);
const pointer = new PointerManager(canvas, 80, 24, 10, 10);

// Click/tap to move camera
pointer.onClick(({ grid }) => {
  const camera = renderer.getCamera();
  const world = pointer.getWorldPosition(camera.x, camera.y);
  renderer.follow(world.x, world.y, 80, 24);
});

function gameLoop() {
  renderer.clear();

  // Highlight hovered cell
  if (pointer.isHovering()) {
    const grid = pointer.getGridPosition();
    renderer.rect(grid.x, grid.y, 1, 1, " ", null, "yellow");
  }

  renderer.render();
  pointer.update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Complete RTS-style Input (Desktop + Mobile)

```typescript
const pointer = new PointerManager(canvas, 80, 24, 10, 10);
const keyboard = new KeyboardManager();

let selectedUnits: Unit[] = [];
let selectionBox: { start: Point; end: Point } | null = null;

// Click/tap to select
pointer.onClick(({ grid, event }) => {
  const camera = renderer.getCamera();
  const world = pointer.getWorldPosition(camera.x, camera.y);

  // Shift key or multi-touch for multi-select
  if (!event.shiftKey) {
    selectedUnits = [];
  }

  const unit = getUnitAt(world.x, world.y);
  if (unit) {
    selectedUnits.push(unit);
  }
});

// Drag to select multiple
pointer.onDragStart(({ grid }) => {
  selectionBox = { start: grid, end: grid };
});

pointer.onDragEnd(({ grid }) => {
  if (selectionBox) {
    const units = getUnitsInBox(selectionBox.start, grid);
    selectedUnits = units;
    selectionBox = null;
  }
});

// Right click or long press to move
pointer.onClick(({ grid, event }) => {
  if (event.button === 2 && selectedUnits.length > 0) {
    const camera = renderer.getCamera();
    const world = pointer.getWorldPosition(camera.x, camera.y);
    selectedUnits.forEach((unit) => unit.moveTo(world.x, world.y));
  }
});

function update() {
  // Arrow keys pan (keyboard only)
  const camera = renderer.getCamera();
  if (keyboard.isPressed("ArrowLeft")) camera.x--;
  if (keyboard.isPressed("ArrowRight")) camera.x++;
  if (keyboard.isPressed("ArrowUp")) camera.y--;
  if (keyboard.isPressed("ArrowDown")) camera.y++;

  pointer.update();
  keyboard.update();
  requestAnimationFrame(update);
}
```

## Touch-Specific Tips

### Prevent Default Touch Behaviors

```typescript
// Prevent pinch-zoom, double-tap zoom, etc.
canvas.style.touchAction = "none";

// Or in CSS:
// #game-canvas {
//   touch-action: none;
// }
```

### Touch vs Mouse Detection

```typescript
let hasTouchSupport = false;

pointer.onClick(({ event }) => {
  if (event.pointerType === "touch") {
    hasTouchSupport = true;
    // Adjust UI for touch
    showMobileControls();
  }
});
```

### Swipe Detection

```typescript
let swipeStart = { x: 0, y: 0, time: 0 };
const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_MAX_TIME = 300; // ms

pointer.onDragStart(({ pixel, event }) => {
  if (event.pointerType === "touch") {
    swipeStart = { x: pixel.x, y: pixel.y, time: Date.now() };
  }
});

pointer.onDragEnd(({ pixel, event }) => {
  if (event.pointerType === "touch") {
    const duration = Date.now() - swipeStart.time;
    const dx = pixel.x - swipeStart.x;
    const dy = pixel.y - swipeStart.y;

    if (duration < SWIPE_MAX_TIME) {
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) onSwipeRight();
        else onSwipeLeft();
      } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
        if (dy > 0) onSwipeDown();
        else onSwipeUp();
      }
    }
  }
});
```

## Best Practices

### Always Call update()

Call `pointer.update()` **once per frame** to clear `justPressed` and `justReleased` states:

```typescript
function gameLoop() {
  handleInput();
  updateGame();
  render();

  pointer.update(); // ← Important!

  requestAnimationFrame(gameLoop);
}
```

### Use justPressed for Single Actions

Use `justPressed` instead of `isPressed` for actions that should only trigger once per click/tap:

```typescript
// ✅ Good - fires once per click/tap
if (pointer.justPressed(0)) {
  shoot();
}

// ❌ Bad - fires every frame while held
if (pointer.isPressed(0)) {
  shoot(); // Spam!
}
```

### Check Pointer Type for Adaptive UI

```typescript
pointer.onClick(({ event }) => {
  if (event.pointerType === "touch") {
    // Touch: larger buttons, simplified controls
    buttonSize = 3;
  } else {
    // Mouse/pen: precise controls
    buttonSize = 1;
  }
});
```

### World vs Grid vs Pixel Coordinates

Be clear about which coordinate system you're using:

```typescript
// Pixel: Raw pointer position
const pixel = pointer.getPosition(); // { x: 145, y: 230 }

// Grid: Screen cell coordinates
const grid = pointer.getGridPosition(); // { x: 14, y: 23 }

// World: Grid + camera offset
const camera = renderer.getCamera();
const world = pointer.getWorldPosition(camera.x, camera.y); // { x: 114, y: 123 }
```

### Cleanup on Destroy

Always call `destroy()` when done to prevent memory leaks:

```typescript
// When switching scenes
function exitGame() {
  pointer.destroy();
  keyboard.destroy();
  renderer.destroy();
}
```

### Combine with Keyboard for Desktop

```typescript
// Shift + click for multi-select (desktop)
pointer.onClick(({ grid }) => {
  if (keyboard.isPressed("Shift")) {
    addToSelection(grid);
  } else {
    selectSingle(grid);
  }
});

// Ctrl + drag for duplicate (desktop)
pointer.onDragEnd(({ grid }) => {
  if (keyboard.isPressed("Control")) {
    duplicateObject(grid);
  } else {
    moveObject(grid);
  }
});
```

### Set Touch Action CSS

For proper touch handling, set `touch-action: none` on your canvas:

```css
#game-canvas {
  touch-action: none; /* Prevents default touch behaviors */
}
```

Or in JavaScript:

```typescript
canvas.style.touchAction = "none";
```

## Performance Tips

- Pointer events are well-optimized and work across all modern browsers
- No performance penalty compared to separate mouse/touch handlers
- Use `touchAction: none` CSS to prevent browser from processing touch gestures
- Avoid heavy calculations in `onHover` callbacks (called on every move)

## Browser Support

Pointer Events API is supported in:

- ✅ Chrome/Edge 55+
- ✅ Firefox 59+
- ✅ Safari 13+
- ✅ All modern mobile browsers

This covers >95% of users as of 2026.
