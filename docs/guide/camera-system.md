# Camera/Viewport System

The camera system enables viewport scrolling and coordinate transformation for large game worlds. It allows you to work with world coordinates while rendering only the visible portion to the screen.

## Overview

The camera system provides:

- **World-to-screen coordinate mapping** - Draw using world coordinates, camera handles viewport
- **Smooth scrolling** - Pan around large game worlds
- **Entity following** - Auto-center camera on player or objects
- **Coordinate conversion** - Utilities for mouse clicks, raycasting, etc.

All drawing methods automatically use world coordinates when a camera is set.

## API Reference

### `setCamera(x: number, y: number): this`

Set the camera position (top-left of viewport in world coordinates).

**Parameters:**

- `x` - World X coordinate for viewport's left edge
- `y` - World Y coordinate for viewport's top edge

**Returns:** The renderer instance for chaining

### `resetCamera(): this`

Reset camera to origin (0, 0).

**Returns:** The renderer instance for chaining

### `getCamera(): { x: number, y: number }`

Get current camera position in world coordinates.

**Returns:** Object with `x` and `y` properties

### `moveCamera(dx: number, dy: number): this`

Move camera by relative amount.

**Parameters:**

- `dx` - Delta X (positive = move right)
- `dy` - Delta Y (positive = move down)

**Returns:** The renderer instance for chaining

### `follow(targetX: number, targetY: number): this`

Center camera on target position. Useful for following player or entities.

**Parameters:**

- `targetX` - World X coordinate to center on
- `targetY` - World Y coordinate to center on

**Returns:** The renderer instance for chaining

### `setCameraBounds(minX: number, minY: number, maxX: number, maxY: number): this`

Set camera bounds to limit scrolling area. Prevents camera from moving outside the specified boundaries. All camera movements (`setCamera`, `moveCamera`, `follow`) will be automatically clamped to stay within these bounds.

**Parameters:**

- `minX` - Minimum X coordinate
- `minY` - Minimum Y coordinate
- `maxX` - Maximum X coordinate
- `maxY` - Maximum Y coordinate

**Returns:** The renderer instance for chaining

### `clearCameraBounds(): this`

Remove camera movement restrictions, allowing unlimited scrolling.

**Returns:** The renderer instance for chaining

### `worldToScreen(worldX: number, worldY: number): { x, y }`

Convert world coordinates to screen coordinates.

**Parameters:**

- `worldX` - World X coordinate
- `worldY` - World Y coordinate

**Returns:** Object with screen `x` and `y` coordinates

### `screenToWorld(screenX: number, screenY: number): { x, y }`

Convert screen coordinates to world coordinates (e.g., for mouse clicks).

**Parameters:**

- `screenX` - Screen X coordinate
- `screenY` - Screen Y coordinate

**Returns:** Object with world `x` and `y` coordinates

## Examples

### Basic Camera Usage

```typescript
import { Renderer } from "@shaisrc/tty";

const renderer = new Renderer(target, { width: 80, height: 24 });

// Set camera to look at position (100, 50) in the world
renderer.setCamera(100, 50);

// Draw at world coordinates (100, 50) -> appears at screen (0, 0)
renderer.drawText(100, 50, "Player");

// Draw at world coordinates (110, 55) -> appears at screen (10, 5)
renderer.box(110, 55, 20, 10);

renderer.render();
```

### Scrolling Map

```typescript
// Large world (1000x1000), small viewport (80x24)
const worldWidth = 1000;
const worldHeight = 1000;

// Draw a large dungeon
for (let y = 0; y < worldHeight; y++) {
  for (let x = 0; x < worldWidth; x++) {
    const tile = getDungeonTile(x, y);
    renderer.drawText(x, y, tile);
  }
}

// Camera at (0, 0) - shows top-left corner
renderer.setCamera(0, 0).render();

// Pan right by 10 tiles
renderer.moveCamera(10, 0).render();

// Jump to specific area
renderer.setCamera(500, 250).render();
```

### Following the Player

```typescript
class Game {
  player = { x: 50, y: 30 };

  update() {
    // Handle input
    if (keyPressed === "ArrowRight") this.player.x++;
    if (keyPressed === "ArrowLeft") this.player.x--;
    // ...

    // Camera follows player
    renderer.follow(this.player.x, this.player.y);
  }

  render() {
    renderer.clear();

    // Draw world
    this.drawMap();

    // Draw player (always centered due to follow())
    renderer.drawText(this.player.x, this.player.y, "@", { fg: "yellow" });

    renderer.render();
  }
}
```

### Smooth Camera Movement

```typescript
class SmoothCamera {
  targetX = 0;
  targetY = 0;
  speed = 0.1;

  setTarget(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  update(renderer: Renderer) {
    const current = renderer.getCamera();

    // Lerp towards target
    const dx = (this.targetX - current.x) * this.speed;
    const dy = (this.targetY - current.y) * this.speed;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      renderer.moveCamera(dx, dy);
    }
  }
}

// Usage
const camera = new SmoothCamera();
camera.setTarget(playerX - 40, playerY - 12);

function gameLoop() {
  camera.update(renderer);
  renderer.clear();
  drawGame();
  renderer.render();
  requestAnimationFrame(gameLoop);
}
```

### Mouse Click to World Coordinates

```typescript
canvas.addEventListener("click", (e) => {
  // Get click position in screen coordinates
  const rect = canvas.getBoundingClientRect();
  const screenX = Math.floor((e.clientX - rect.left) / cellWidth);
  const screenY = Math.floor((e.clientY - rect.top) / cellHeight);

  // Convert to world coordinates
  const world = renderer.screenToWorld(screenX, screenY);
  console.log(`Clicked world position: (${world.x}, ${world.y})`);

  // Check if clicked on an entity
  const entity = entities.find((e) => e.x === world.x && e.y === world.y);
  if (entity) {
    console.log("Clicked on:", entity.name);
  }
});
```

### Camera Bounds (Prevent Scrolling Beyond Map)

```typescript
// For a 200x100 world map with 80x24 viewport
// Max camera position is (200-80, 100-24) = (120, 76)
renderer.setCameraBounds(0, 0, 120, 76);

// Now all camera movements stay within bounds
renderer.follow(player.x, player.y); // Auto-clamped
renderer.moveCamera(100, 100); // Can't exceed bounds

// Camera follows player but stops at map edges
class Game {
  mapWidth = 200;
  mapHeight = 100;

  constructor() {
    const maxX = this.mapWidth - renderer.width;
    const maxY = this.mapHeight - renderer.height;
    renderer.setCameraBounds(0, 0, maxX, maxY);
  }

  update() {
    // Camera automatically clamped to map bounds
    renderer.follow(this.player.x, this.player.y);
  }
}

// Remove bounds for infinite scrolling
renderer.clearCameraBounds();
```

### Split-Screen (Multiple Viewports)

```typescript
// Two separate renderers for split-screen
const leftRenderer = new Renderer(leftCanvas, { width: 40, height: 24 });
const rightRenderer = new Renderer(rightCanvas, { width: 40, height: 24 });

// Player 1 camera
leftRenderer.follow(player1.x, player1.y);
leftRenderer.clear();
drawWorld(leftRenderer);
leftRenderer.drawText(player1.x, player1.y, "@", { fg: "cyan" });
leftRenderer.render();

// Player 2 camera
rightRenderer.follow(player2.x, player2.y);
rightRenderer.clear();
drawWorld(rightRenderer);
rightRenderer.drawText(player2.x, player2.y, "@", { fg: "magenta" });
rightRenderer.render();
```

### Minimap

```typescript
function drawMinimap(
  miniRenderer: Renderer,
  worldRenderer: Renderer,
  mapWidth: number,
  mapHeight: number,
) {
  const scale = 10; // 10:1 world-to-minimap ratio
  const camera = worldRenderer.getCamera();

  miniRenderer.clear();

  // Draw simplified map
  for (let y = 0; y < mapHeight; y += scale) {
    for (let x = 0; x < mapWidth; x += scale) {
      const tile = getMapTile(x, y);
      miniRenderer.drawText(x / scale, y / scale, tile.minimapChar);
    }
  }

  // Draw viewport rectangle
  const vpX = Math.floor(camera.x / scale);
  const vpY = Math.floor(camera.y / scale);
  const vpW = Math.floor(worldRenderer.width / scale);
  const vpH = Math.floor(worldRenderer.height / scale);

  miniRenderer.box(vpX, vpY, vpW, vpH, { fg: "yellow" });
  miniRenderer.render();
}
```

### Camera Shake Effect

```typescript
class CameraShake {
  intensity = 0;
  duration = 0;
  originalX = 0;
  originalY = 0;

  start(intensity: number, duration: number, renderer: Renderer) {
    this.intensity = intensity;
    this.duration = duration;
    const camera = renderer.getCamera();
    this.originalX = camera.x;
    this.originalY = camera.y;
  }

  update(dt: number, renderer: Renderer) {
    if (this.duration <= 0) return;

    this.duration -= dt;

    if (this.duration > 0) {
      // Random offset
      const offsetX = (Math.random() - 0.5) * this.intensity;
      const offsetY = (Math.random() - 0.5) * this.intensity;
      renderer.setCamera(this.originalX + offsetX, this.originalY + offsetY);
    } else {
      // Reset to original
      renderer.setCamera(this.originalX, this.originalY);
    }
  }
}

// Usage
const shake = new CameraShake();
shake.start(5, 0.5, renderer); // Shake with intensity 5 for 0.5 seconds
```

## Tips

### Performance

- **Culling**: Only draw entities within viewport bounds

  ```typescript
  const camera = renderer.getCamera();
  const visible = entities.filter(
    (e) =>
      e.x >= camera.x &&
      e.x < camera.x + renderer.width &&
      e.y >= camera.y &&
      e.y < camera.y + renderer.height,
  );
  visible.forEach((e) => e.draw(renderer));
  ```

- **Chunk-based rendering**: Divide world into chunks, only render visible chunks

### Camera Modes

- **Fixed**: Camera stays still, player moves across screen

  ```typescript
  renderer.setCamera(0, 0);
  ```

- **Following**: Camera always centered on player

  ```typescript
  renderer.follow(player.x, player.y);
  ```

- **Deadzone**: Camera only moves when player reaches edge

  ```typescript
  function updateDeadzoneCamera(player, renderer) {
    const camera = renderer.getCamera();
    const deadzone = 10;

    if (player.x < camera.x + deadzone) camera.x = player.x - deadzone;
    if (player.x > camera.x + renderer.width - deadzone)
      camera.x = player.x - renderer.width + deadzone;
    // Same for Y
    renderer.setCamera(camera.x, camera.y);
  }
  ```

### Common Patterns

1. **Always use world coordinates** for game logic
2. **Use `screenToWorld()`** for mouse/touch input
3. **Use `follow()`** for simple following behavior
4. **Implement custom camera controllers** for complex movement
5. **Combine with layers** for parallax effects

## Integration with Other Features

### With Layers

```typescript
// Background scrolls slower (parallax)
renderer.layer("bg").setCamera(cameraX * 0.5, cameraY * 0.5);
renderer.layer("bg").drawText(bgX, bgY, "🌲");

// Foreground scrolls normal speed
renderer.layer("main").setCamera(cameraX, cameraY);
renderer.layer("main").drawText(playerX, playerY, "@");

// UI layer doesn't scroll (camera at 0,0)
renderer.layer("ui").resetCamera();
renderer.layer("ui").panel(0, 0, 20, 5, { title: "HP: 100" });

renderer.layerOrder(["bg", "main", "ui"]).render();
```

### With Menu System

```typescript
// Game world uses camera
renderer.setCamera(gameCamera.x, gameCamera.y);
drawWorld(renderer);

// Menu overlay uses screen coordinates
renderer.resetCamera();
renderer.menu(20, 8, ["Continue", "Save", "Quit"], { selected: 0 });
```

## See Also

- [Layer System](./layer-system.md) - For parallax and UI overlays
- [Panel Helper](./panel-helper.md) - For UI elements in screen space
- [Menu Helper](./menu-helper.md) - For menus in screen space
