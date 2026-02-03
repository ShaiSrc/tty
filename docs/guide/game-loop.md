# Game Loop Utility

The `GameLoop` class provides a fixed timestep game loop with delta time support, essential for smooth animations and consistent physics in games.

## Features

- **Fixed Timestep** - Consistent update rate for predictable game logic
- **Delta Time Support** - Smooth frame-independent updates
- **FPS Management** - Target and actual FPS tracking
- **Pause/Resume** - Pause game loop while keeping it running
- **Time Tracking** - Track elapsed game time (excluding paused time)
- **Frame Skip Protection** - Prevent "spiral of death" with max frame skip
- **Optional Render** - Update-only mode for headless simulations

## Quick Start

```typescript
import { Renderer, CanvasTarget, GameLoop } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);

let playerX = 40;
let playerY = 12;

// Create game loop
const gameLoop = new GameLoop(
  (delta) => {
    // Update game logic (delta is in milliseconds)
    const speed = 0.05; // cells per millisecond
    if (keyboard.isPressed("ArrowRight")) {
      playerX += speed * delta;
    }
  },
  () => {
    // Render
    renderer.clear();
    renderer.drawText(Math.floor(playerX), Math.floor(playerY), "@");
    renderer.render();
  },
  { fps: 60 }, // Target 60 FPS
);

// Start the loop
gameLoop.start();

// Later, when done
gameLoop.stop();
```

## API Reference

### Constructor

```typescript
new GameLoop(
  update: (delta: number) => void,
  render?: () => void,
  options?: GameLoopOptions
)
```

Creates a new game loop.

**Parameters:**

- `update` - Update callback called with delta time in milliseconds
- `render` - Optional render callback (omit for headless mode)
- `options` - Configuration options
  - `fps` - Target frames per second (default: 60)
  - `maxFrameSkip` - Maximum update calls per frame (default: 10)

```typescript
const gameLoop = new GameLoop(
  (delta) => updateGame(delta),
  () => renderGame(),
  { fps: 60, maxFrameSkip: 5 },
);
```

### Lifecycle Methods

#### `start(): void`

Start the game loop. Does nothing if already running.

```typescript
gameLoop.start();
```

#### `stop(): void`

Stop the game loop and reset state (elapsed time, frame counters).

```typescript
gameLoop.stop();
```

#### `pause(): void`

Pause the game loop. The loop keeps running but update and render aren't called. Elapsed time stops accumulating.

```typescript
gameLoop.pause();
```

#### `resume(): void`

Resume a paused game loop.

```typescript
gameLoop.resume();
```

### State Queries

#### `isRunning(): boolean`

Check if the game loop is running.

```typescript
if (gameLoop.isRunning()) {
  console.log("Game is active");
}
```

#### `isPaused(): boolean`

Check if the game loop is paused.

```typescript
if (gameLoop.isPaused()) {
  renderer.drawText(0, 0, "PAUSED", { fg: "yellow" });
}
```

#### `getElapsedTime(): number`

Get total elapsed time in milliseconds (excluding paused time).

```typescript
const seconds = gameLoop.getElapsedTime() / 1000;
renderer.drawText(0, 0, `Time: ${seconds.toFixed(1)}s`);
```

### FPS Management

#### `getFPS(): number`

Get the target FPS.

```typescript
const target = gameLoop.getFPS(); // 60
```

#### `setFPS(fps: number): void`

Set the target FPS. Takes effect immediately.

```typescript
// Switch to 30 FPS for performance
gameLoop.setFPS(30);
```

#### `getActualFPS(): number`

Get the actual FPS (calculated over the last second).

```typescript
const actual = gameLoop.getActualFPS();
if (actual < 55) {
  console.warn("Performance issue detected");
}
```

#### `getTimestep(): number`

Get the fixed timestep in milliseconds (1000 / FPS).

```typescript
const timestep = gameLoop.getTimestep(); // 16.666... for 60 FPS
```

## Fixed Timestep Explained

The game loop uses a **fixed timestep** approach:

1. Update is called with a **constant delta** (16.666ms for 60 FPS)
2. If a frame takes longer, update is called **multiple times** to catch up
3. Render is called **once per frame** regardless of update count

This ensures:

- **Consistent physics** - Game logic always updates at the same rate
- **Deterministic behavior** - Same input always produces same output
- **No frame-rate dependency** - Game speed is consistent across different hardware

```typescript
// Example: Player moves 5 cells per second
const gameLoop = new GameLoop(
  (delta) => {
    const speed = 5 / 1000; // 5 cells per 1000ms
    playerX += speed * delta;

    // delta is always 16.666ms (at 60 FPS)
    // So playerX always increases by exactly 0.083 per update
  },
  render,
  { fps: 60 },
);
```

## Common Patterns

### Basic Game Loop

```typescript
import { GameLoop, Renderer, KeyboardManager } from "@shaisrc/tty";

const renderer = new Renderer(target);
const keyboard = new KeyboardManager();

const gameLoop = new GameLoop(
  (delta) => {
    // Update input
    keyboard.update();

    // Update game logic
    player.update(delta);
    enemies.forEach((e) => e.update(delta));

    // Check collisions
    checkCollisions();
  },
  () => {
    // Render
    renderer.clear();
    player.render(renderer);
    enemies.forEach((e) => e.render(renderer));
    renderer.render();
  },
);

gameLoop.start();
```

### Pause Menu

```typescript
const gameLoop = new GameLoop(update, render);
const keyboard = new KeyboardManager();

gameLoop.start();

keyboard.onKeyDown("Escape", () => {
  if (gameLoop.isPaused()) {
    gameLoop.resume();
  } else {
    gameLoop.pause();
  }
});

function render() {
  renderer.clear();
  renderGame();

  if (gameLoop.isPaused()) {
    // Draw pause overlay
    renderer.panel(30, 10, 20, 5, { title: "PAUSED" });
    renderer.centerText(12, "Press ESC to resume", {}, 30, 20);
  }

  renderer.render();
}
```

### FPS Counter

```typescript
const gameLoop = new GameLoop(update, render);

function render() {
  renderer.clear();
  renderGame();

  // Show FPS in corner
  const fps = gameLoop.getActualFPS();
  renderer.drawText(0, 0, `FPS: ${fps}`, {
    fg: fps < 55 ? "red" : "green",
  });

  renderer.render();
}
```

### Dynamic FPS Adjustment

```typescript
const gameLoop = new GameLoop(update, render, { fps: 60 });

// Lower FPS on mobile for better battery life
if (isMobile()) {
  gameLoop.setFPS(30);
}

// Adjust FPS based on performance
setInterval(() => {
  const fps = gameLoop.getActualFPS();
  if (fps < 55 && gameLoop.getFPS() > 30) {
    gameLoop.setFPS(gameLoop.getFPS() - 5);
  }
}, 1000);
```

### Timer/Countdown

```typescript
const GAME_DURATION = 60000; // 60 seconds
const gameLoop = new GameLoop(update, render);

gameLoop.start();

function render() {
  const elapsed = gameLoop.getElapsedTime();
  const remaining = Math.max(0, GAME_DURATION - elapsed);
  const seconds = Math.ceil(remaining / 1000);

  renderer.drawText(0, 0, `Time: ${seconds}s`);

  if (remaining === 0) {
    gameOver();
  }

  renderer.render();
}
```

### Frame-Independent Movement

```typescript
class Player {
  x = 0;
  y = 0;
  vx = 0; // velocity in cells per second
  vy = 0;

  update(delta: number) {
    // Convert velocity from cells/second to cells/millisecond
    this.x += (this.vx / 1000) * delta;
    this.y += (this.vy / 1000) * delta;
  }

  moveRight() {
    this.vx = 10; // 10 cells per second
  }

  stop() {
    this.vx = 0;
    this.vy = 0;
  }
}

const player = new Player();

const gameLoop = new GameLoop((delta) => {
  if (keyboard.isPressed("ArrowRight")) {
    player.moveRight();
  } else {
    player.stop();
  }

  player.update(delta);
});
```

### Physics Simulation

```typescript
class PhysicsObject {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  update(delta: number) {
    // Apply gravity (cells per second squared)
    const gravity = 20;
    this.vy += (gravity / 1000) * delta;

    // Update position
    this.x += (this.vx / 1000) * delta;
    this.y += (this.vy / 1000) * delta;

    // Floor collision
    if (this.y >= 20) {
      this.y = 20;
      this.vy = 0;
    }
  }
}

const gameLoop = new GameLoop(
  (delta) => {
    objects.forEach((obj) => obj.update(delta));
  },
  render,
  { fps: 60 },
);
```

### Smooth Camera Follow

```typescript
class Camera {
  x = 0;
  y = 0;
  targetX = 0;
  targetY = 0;

  follow(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  update(delta: number) {
    // Smooth lerp (0.1 = 10% per frame at 60 FPS)
    const speed = 0.1 * (delta / 16.666);

    this.x += (this.targetX - this.x) * speed;
    this.y += (this.targetY - this.y) * speed;
  }
}

const camera = new Camera();

const gameLoop = new GameLoop((delta) => {
  camera.follow(player.x, player.y);
  camera.update(delta);

  renderer.setCamera(Math.floor(camera.x), Math.floor(camera.y));
}, render);
```

### Update Without Render (Headless Mode)

```typescript
// Useful for simulations, AI training, etc.
const simulation = new GameLoop((delta) => {
  world.update(delta);
  checkWinCondition();
});

simulation.start();

// No render callback = headless mode
```

### Variable Update Rate

```typescript
// Run update at 60 FPS but render at 30 FPS
const gameLoop = new GameLoop(update, null, { fps: 60 });
gameLoop.start();

// Separate render loop
setInterval(() => {
  render();
}, 1000 / 30); // 30 FPS
```

## Integration Examples

### Complete Platformer Game Loop

```typescript
import {
  GameLoop,
  Renderer,
  KeyboardManager,
  PointerManager,
} from "@shaisrc/tty";

const renderer = new Renderer(target);
const keyboard = new KeyboardManager();
const pointer = new PointerManager(canvas, 80, 24, 10, 10);

class Game {
  player = new Player();
  enemies: Enemy[] = [];
  particles: Particle[] = [];

  update(delta: number) {
    // Input
    keyboard.update();
    pointer.update();

    // Player input
    if (keyboard.isPressed("ArrowRight")) {
      this.player.moveRight();
    } else if (keyboard.isPressed("ArrowLeft")) {
      this.player.moveLeft();
    }

    if (keyboard.justPressed("Space")) {
      this.player.jump();
    }

    // Update entities
    this.player.update(delta);
    this.enemies.forEach((e) => e.update(delta));
    this.particles.forEach((p) => p.update(delta));

    // Remove dead particles
    this.particles = this.particles.filter((p) => p.alive);

    // Collisions
    this.checkCollisions();
  }

  render() {
    renderer.clear();

    // Render world
    this.renderBackground();
    this.particles.forEach((p) => p.render(renderer));
    this.player.render(renderer);
    this.enemies.forEach((e) => e.render(renderer));

    // HUD
    renderer.drawText(0, 0, `HP: ${this.player.hp}`, { fg: "red" });
    renderer.drawText(0, 1, `Score: ${this.player.score}`, { fg: "yellow" });

    renderer.render();
  }

  checkCollisions() {
    // ... collision logic
  }

  renderBackground() {
    // ... render tiles
  }
}

const game = new Game();

const gameLoop = new GameLoop(
  (delta) => game.update(delta),
  () => game.render(),
  { fps: 60, maxFrameSkip: 5 },
);

gameLoop.start();

// Pause on Escape
keyboard.onKeyDown("Escape", () => {
  if (gameLoop.isPaused()) {
    gameLoop.resume();
  } else {
    gameLoop.pause();
  }
});

// Cleanup
window.addEventListener("beforeunload", () => {
  gameLoop.stop();
  keyboard.destroy();
  mouse.destroy();
});
```

### Turn-Based Game

```typescript
// Turn-based games don't need continuous updates
const gameLoop = new GameLoop(
  (delta) => {
    // Only update animations
    animations.forEach((a) => a.update(delta));
  },
  () => {
    render();
  },
  { fps: 30 }, // Lower FPS is fine
);

// Pause between turns
function endTurn() {
  gameLoop.pause();

  // AI takes turn
  setTimeout(() => {
    aiTakeTurn();
    gameLoop.resume();
  }, 500);
}
```

### Performance Monitoring

```typescript
const gameLoop = new GameLoop(update, render, { fps: 60 });

// Log performance stats
setInterval(() => {
  const fps = gameLoop.getActualFPS();
  const elapsed = gameLoop.getElapsedTime() / 1000;

  console.log(`FPS: ${fps.toFixed(1)}, Elapsed: ${elapsed.toFixed(1)}s`);

  if (fps < 55) {
    console.warn("Performance degradation detected!");
  }
}, 1000);
```

## Best Practices

### Use Delta Time for Movement

Always scale movement by delta time to ensure frame-rate independence:

```typescript
// ✅ Good - frame independent
playerX += (speed / 1000) * delta;

// ❌ Bad - depends on frame rate
playerX += speed;
```

### Keep Update Logic Deterministic

The update function should produce the same result for the same inputs:

```typescript
// ✅ Good - uses delta time
entity.x += (entity.vx / 1000) * delta;

// ❌ Bad - uses random time
entity.x += entity.vx * Math.random();
```

### Separate Update and Render

Keep game logic in update and drawing in render:

```typescript
// ✅ Good
update(delta) {
  player.x += dx;
}
render() {
  renderer.drawText(player.x, player.y, "@");
}

// ❌ Bad - mixing concerns
update(delta) {
  player.x += dx;
  renderer.drawText(player.x, player.y, "@"); // Don't render in update!
}
```

### Call update() on Input Managers

Remember to clear frame state:

```typescript
const gameLoop = new GameLoop((delta) => {
  keyboard.update(); // ← Important!
  pointer.update(); // ← Important!

  // Now justPressed works correctly
  if (keyboard.justPressed("Space")) {
    jump();
  }
});
```

### Handle Pause Properly

The game loop doesn't pause automatically - your code needs to handle pause state:

```typescript
function render() {
  renderer.clear();
  renderGame();

  if (gameLoop.isPaused()) {
    // Draw pause overlay
    renderer.panel(30, 10, 20, 5, { title: "PAUSED" });
  }

  renderer.render();
}
```

### Cleanup on Exit

Always stop the game loop and destroy resources:

```typescript
window.addEventListener("beforeunload", () => {
  gameLoop.stop();
  keyboard.destroy();
  mouse.destroy();
  renderer.destroy();
});
```

## Performance Tips

### Max Frame Skip Prevents Spiral of Death

If the game can't keep up, it will skip frames instead of locking up:

```typescript
// Limit to 5 updates per frame to prevent freeze
const gameLoop = new GameLoop(update, render, {
  fps: 60,
  maxFrameSkip: 5,
});
```

### Lower FPS for Better Performance

Not all games need 60 FPS:

```typescript
// Turn-based or slow-paced games
const gameLoop = new GameLoop(update, render, { fps: 30 });
```

### Profile Your Update Function

If FPS is low, check what's taking time in update:

```typescript
function update(delta) {
  console.time("update");

  // ... game logic

  console.timeEnd("update"); // Check console for timing
}
```

### Use Object Pooling

Avoid creating objects in the game loop:

```typescript
// ✅ Good - reuse particles
const particlePool = createPool(100);
function spawnParticle() {
  const p = particlePool.get();
  p.reset();
  return p;
}

// ❌ Bad - creates garbage
function spawnParticle() {
  return new Particle(); // Creates garbage every frame!
}
```

## Advanced Topics

### Multiple Game Loops

Run physics and rendering at different rates:

```typescript
const physicsLoop = new GameLoop(
  (delta) => {
    updatePhysics(delta);
  },
  null,
  { fps: 120 },
); // High precision physics

const renderLoop = new GameLoop(
  null,
  () => {
    render();
  },
  { fps: 60 },
); // Normal render rate

physicsLoop.start();
renderLoop.start();
```

### Time Scaling (Slow Motion)

```typescript
let timeScale = 1.0;

const gameLoop = new GameLoop((delta) => {
  const scaledDelta = delta * timeScale;
  update(scaledDelta);
});

// Slow motion
timeScale = 0.5; // 50% speed

// Speed up
timeScale = 2.0; // 200% speed
```

### Save/Load with Elapsed Time

```typescript
// Save
const saveData = {
  player: player.toJSON(),
  elapsedTime: gameLoop.getElapsedTime(),
};

// Load
player.fromJSON(saveData.player);
gameLoop.start();
// Note: You can't restore elapsed time directly,
// you'll need to track it separately if needed
```

## Troubleshooting

### Game Runs Too Fast/Slow

Check that you're using delta time correctly:

```typescript
// Movement should be: (units per second / 1000) * delta
const speed = 5; // cells per second
playerX += (speed / 1000) * delta;
```

### justPressed Not Working

Make sure you call `update()` on input managers:

```typescript
const gameLoop = new GameLoop((delta) => {
  keyboard.update(); // ← Don't forget!

  if (keyboard.justPressed("Space")) {
    // This won't work without update()
  }
});
```

### Low FPS

1. Check actual FPS: `gameLoop.getActualFPS()`
2. Profile update function with `console.time()`
3. Reduce update complexity
4. Lower target FPS if needed

### Stuttering

Make sure delta time is applied consistently:

```typescript
// All movements should use delta
player.update(delta);
enemies.forEach((e) => e.update(delta));
particles.forEach((p) => p.update(delta));
```

## License

MIT
