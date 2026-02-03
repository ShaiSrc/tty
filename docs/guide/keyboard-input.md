# Keyboard Input System

The keyboard input manager provides game-friendly key state tracking, just-pressed detection, and event callbacks for handling player input.

## Overview

The `KeyboardManager` class offers:

- **Real-time key state** - Check if keys are currently pressed
- **Frame-based detection** - `justPressed()` and `justReleased()` for single-frame events
- **Event callbacks** - Register handlers for specific keys
- **Multi-key support** - Track multiple simultaneous presses
- **Game loop integration** - Works seamlessly with `update()` pattern

## Quick Start

```typescript
import { KeyboardManager } from "@shaisrc/tty";

const keyboard = new KeyboardManager();

// Game loop
function gameLoop() {
  // Check continuous input
  if (keyboard.isPressed("ArrowRight")) {
    player.x++;
  }

  // Check one-time actions
  if (keyboard.justPressed(" ")) {
    player.jump();
  }

  // Clear just-pressed/released state for next frame
  keyboard.update();

  requestAnimationFrame(gameLoop);
}
```

## API Reference

### Constructor

```typescript
new KeyboardManager(element?: HTMLElement | Window)
```

Creates a new keyboard manager attached to the specified element (defaults to `window`).

### State Checking Methods

#### `isPressed(key: string): boolean`

Returns `true` if the key is currently pressed.

```typescript
if (keyboard.isPressed("w")) moveUp();
if (keyboard.isPressed("Control")) {
  /* holding ctrl */
}
```

#### `isDown(key: string): boolean`

Alias for `isPressed()`. Provides a more intuitive API for poll-based input checking.

```typescript
if (keyboard.isDown("Space")) player.jump();
```

#### `justPressed(key: string): boolean`

Returns `true` only on the first frame after a key press. Useful for actions that should trigger once per press (jumping, shooting, menu selection).

```typescript
if (keyboard.justPressed("Enter")) selectMenuItem();
```

#### `justReleased(key: string): boolean`

Returns `true` only on the first frame after a key release.

```typescript
if (keyboard.justReleased("Space")) releaseChargedShot();
```

### Callback Methods

#### `onKeyDown(key: string | string[], callback: (event: KeyboardEvent) => void): void`

Register a callback to be called when the key is pressed. Supports both single keys and arrays of keys for alternative bindings.

```typescript
// Single key
keyboard.onKeyDown("Escape", () => pauseGame());

// Multiple alternative bindings (WASD + Arrow keys)
keyboard.onKeyDown(["ArrowUp", "w", "W"], () => player.moveUp());
keyboard.onKeyDown(["ArrowDown", "s", "S"], () => player.moveDown());
keyboard.onKeyDown(["ArrowLeft", "a", "A"], () => player.moveLeft());
keyboard.onKeyDown(["ArrowRight", "d", "D"], () => player.moveRight());
```

#### `onKeyUp(key: string | string[], callback: (event: KeyboardEvent) => void): void`

Register a callback to be called when the key is released. Supports both single keys and arrays of keys.

```typescript
// Single key
keyboard.onKeyUp("Space", () => player.stopJumping());

// Multiple alternative bindings
keyboard.onKeyUp(["Shift", "Control"], () => player.stopSprinting());
```

#### `removeCallback(key: string, callback: Function, type?: "keydown" | "keyup"): void`

Remove a previously registered callback.

### Utility Methods

#### `getPressed(): string[]`

Returns an array of all currently pressed keys.

```typescript
const pressed = keyboard.getPressed();
console.log("Keys pressed:", pressed); // ["w", "Shift"]
```

#### `getDirection(options?: DirectionOptions): DirectionVector`

Get direction vector from WASD/Arrow keys. Returns `{x, y}` with values -1, 0, or 1 (or normalized).

WASD keys take priority over arrow keys. Perfect for player movement without writing repetitive if statements.

```typescript
// Basic usage
const dir = keyboard.getDirection();
player.x += dir.x * speed;
player.y += dir.y * speed;

// Normalized diagonal movement (length = 1)
const dir = keyboard.getDirection({ normalize: true });
player.x += dir.x * speed; // Diagonal speed matches cardinal
player.y += dir.y * speed;
```

**Options:**

- `normalize?: boolean` - Normalize diagonal vectors to length 1 (default: false)

**Key mapping:**

- X-axis: `a`/`d` or `ArrowLeft`/`ArrowRight` → -1 / 0 / 1
- Y-axis: `w`/`s` or `ArrowUp`/`ArrowDown` → -1 / 0 / 1
- Case-insensitive for WASD

#### `waitForKey(key?: string | string[], options?): Promise<string>`

Wait for a specific key press using Promises. Great for pause menus, prompts, and cutscenes.

```typescript
// Wait for Enter
const key = await keyboard.waitForKey("Enter");

// Wait for Y or N
const answer = await keyboard.waitForKey(["y", "n"]);
if (answer === "y") confirmAction();

// Wait for any key
await keyboard.waitForKey();
console.log("Key pressed, continuing...");

// With timeout (5 seconds)
try {
  const key = await keyboard.waitForKey("Enter", { timeout: 5000 });
} catch {
  console.log("Timeout!");
}

// With cancellation
const controller = new AbortController();
const promise = keyboard.waitForKey("Enter", {
  signal: controller.signal,
});

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000);
```

**Parameters:**

- `key` - Key name, array of keys, or omit for any key
- `options.timeout` - Timeout in milliseconds
- `options.signal` - AbortSignal for cancellation

#### `update(): void`

Clears `justPressed` and `justReleased` states. **Call this once per frame** in your game loop.

#### `clear(): void`

Clears all key states. Useful when switching game states.

#### `destroy(): void`

Removes event listeners and clears all state. Call when disposing of the manager.

## Common Patterns

### Direction-Based Movement

```typescript
function handleMovement(keyboard: KeyboardManager, player: Player) {
  const dir = keyboard.getDirection();
  player.x += dir.x * player.speed;
  player.y += dir.y * player.speed;
}

// With normalized diagonals
function handleMovementNormalized(keyboard: KeyboardManager, player: Player) {
  const dir = keyboard.getDirection({ normalize: true });
  player.x += dir.x * player.speed; // Same speed in all directions
  player.y += dir.y * player.speed;
}
```

### WASD Movement (Legacy)

```typescript
function handleMovement(keyboard: KeyboardManager, player: Player) {
  if (keyboard.isPressed("w")) player.y--;
  if (keyboard.isPressed("a")) player.x--;
  if (keyboard.isPressed("s")) player.y++;
  if (keyboard.isPressed("d")) player.x++;
}
```

### Async Prompts and Dialogs

```typescript
async function showDialog(keyboard: KeyboardManager, message: string) {
  renderer.clear();
  renderer.drawText(10, 10, message);
  renderer.drawText(10, 12, "Press SPACE to continue");
  renderer.render();

  await keyboard.waitForKey(" ");
}

async function confirmDialog(keyboard: KeyboardManager): Promise<boolean> {
  renderer.drawText(10, 10, "Are you sure? (Y/N)");
  renderer.render();

  const answer = await keyboard.waitForKey(["y", "n", "Y", "N"]);
  return answer.toLowerCase() === "y";
}

// In game
async function quitGame(keyboard: KeyboardManager) {
  if (await confirmDialog(keyboard)) {
    console.log("Quitting...");
  }
}
```

### Pause Menu with waitForKey

```typescript
async function pauseMenu(keyboard: KeyboardManager, game: Game) {
  game.paused = true;

  while (true) {
    renderer.clear();
    renderer.drawText(30, 10, "PAUSED");
    renderer.drawText(25, 12, "R - Resume");
    renderer.drawText(25, 13, "Q - Quit");
    renderer.render();

    const key = await keyboard.waitForKey(["r", "q", "Escape"]);

    if (key === "r" || key === "Escape") {
      game.paused = false;
      break;
    }
    if (key === "q") {
      game.quit();
      break;
    }
  }
}
```

### Menu Navigation

```typescript
class Menu {
  selectedIndex = 0;
  items = ["Start", "Options", "Quit"];

  update(keyboard: KeyboardManager) {
    if (keyboard.justPressed("ArrowDown")) {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    }
    if (keyboard.justPressed("ArrowUp")) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.items.length) % this.items.length;
    }
    if (keyboard.justPressed("Enter")) {
      this.selectItem(this.selectedIndex);
    }
  }
}
```

### Sprint/Walk with Shift

```typescript
function updatePlayer(keyboard: KeyboardManager, player: Player) {
  const speed = keyboard.isPressed("Shift") ? 2 : 1;

  if (keyboard.isPressed("ArrowRight")) player.x += speed;
  if (keyboard.isPressed("ArrowLeft")) player.x -= speed;
}
```

### Charged Attack

```typescript
class Player {
  chargeTime = 0;

  update(keyboard: KeyboardManager, dt: number) {
    if (keyboard.isPressed("Space")) {
      this.chargeTime += dt;
    }

    if (keyboard.justReleased("Space")) {
      this.fireCharged Shot(this.chargeTime);
      this.chargeTime = 0;
    }
  }
}
```

### Key Combinations

```typescript
// Save: Ctrl+S
if (keyboard.isPressed("Control") && keyboard.justPressed("s")) {
  saveGame();
}

// Fullscreen: Alt+Enter
if (keyboard.isPressed("Alt") && keyboard.justPressed("Enter")) {
  toggleFullscreen();
}
```

### Action Mapping

```typescript
class InputMapper {
  actions = {
    jump: [" ", "w", "ArrowUp"],
    shoot: ["Enter", "z"],
    pause: ["Escape", "p"],
  };

  isAction(keyboard: KeyboardManager, action: string): boolean {
    return this.actions[action].some((key) => keyboard.justPressed(key));
  }
}

// Usage
if (inputMapper.isAction(keyboard, "jump")) player.jump();
```

### Text Input

```typescript
class TextInput {
  text = "";

  constructor(keyboard: KeyboardManager) {
    keyboard.onKeyDown("Backspace", () => {
      this.text = this.text.slice(0, -1);
    });

    // Handle letter keys
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      keyboard.onKeyDown(char, (e) => {
        this.text += e.shiftKey ? char : char.toLowerCase();
      });
    }
  }
}
```

## Key Names

### Alphanumeric

- Letters: `"a"` - `"z"`, `"A"` - `"Z"` (case-sensitive)
- Numbers: `"0"` - `"9"`

### Arrow Keys

- `"ArrowUp"`, `"ArrowDown"`, `"ArrowLeft"`, `"ArrowRight"`

### Special Keys

- `" "` (space)
- `"Enter"`
- `"Escape"`
- `"Backspace"`
- `"Tab"`
- `"Shift"`, `"Control"`, `"Alt"`, `"Meta"`

### Function Keys

- `"F1"` - `"F12"`

## Integration Examples

### With Renderer and Game Loop

```typescript
import { Renderer, CanvasTarget, KeyboardManager } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);
const keyboard = new KeyboardManager();

const player = { x: 40, y: 12 };

function gameLoop() {
  // Input
  if (keyboard.isPressed("ArrowRight")) player.x++;
  if (keyboard.isPressed("ArrowLeft")) player.x--;
  if (keyboard.isPressed("ArrowUp")) player.y--;
  if (keyboard.isPressed("ArrowDown")) player.y++;

  // Render
  renderer.clear();
  renderer.drawText(player.x, player.y, "@", { fg: "yellow" });
  renderer.render();

  // Update keyboard state
  keyboard.update();

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### With Camera System

```typescript
const keyboard = new KeyboardManager();
const player = { x: 100, y: 50 };

function gameLoop() {
  // Player movement
  if (keyboard.isPressed("d")) player.x++;
  if (keyboard.isPressed("a")) player.x--;

  // Camera follows player
  renderer.follow(player.x, player.y);

  // Draw world
  renderer.clear();
  drawWorld(renderer);
  renderer.drawText(player.x, player.y, "@");
  renderer.render();

  keyboard.update();
  requestAnimationFrame(gameLoop);
}
```

### State Management

```typescript
enum GameState {
  MENU,
  PLAYING,
  PAUSED,
}

class Game {
  state = GameState.MENU;
  keyboard = new KeyboardManager();

  update() {
    switch (this.state) {
      case GameState.MENU:
        this.updateMenu();
        break;
      case GameState.PLAYING:
        this.updateGame();
        break;
      case GameState.PAUSED:
        this.updatePaused();
        break;
    }

    this.keyboard.update();
  }

  updateGame() {
    if (this.keyboard.justPressed("Escape")) {
      this.state = GameState.PAUSED;
      this.keyboard.clear(); // Clear states when changing context
    }
    // ... game logic
  }
}
```

## Best Practices

1. **Call `update()` once per frame** - Clears just-pressed/released states
2. **Use `isPressed()` for continuous actions** - Movement, aiming
3. **Use `justPressed()` for discrete actions** - Jumping, shooting, menu selection
4. **Clear state on context changes** - Call `clear()` when switching menus/states
5. **Destroy when done** - Call `destroy()` to prevent memory leaks
6. **Attach to specific elements** - For multi-player or focused input

## Tips

- **Multi-key support**: The manager automatically handles multiple simultaneous presses
- **Key names are case-sensitive**: `"a"` ≠ `"A"`
- **Modifier detection**: Check `Shift`, `Control`, `Alt` like any other key
- **Event.key standard**: Uses standard JavaScript `event.key` values
- **No polling overhead**: Event-driven architecture, efficient for game loops

## See Also

- [Game Loop Utility](./game-loop.md) - For fixed timestep integration
- [Camera System](./camera-system.md) - For viewport-based games
- [Menu Helper](./menu-helper.md) - For keyboard-navigable menus
