# Gamepad/Controller Input System

The gamepad manager provides comprehensive controller support using the native Gamepad API, including buttons, analog sticks, D-pad, and vibration.

## Overview

The `GamepadManager` class offers:

- **Button tracking** - Press/release states with just-pressed detection
- **Analog sticks** - Left and right stick with configurable deadzone
- **D-pad support** - Directional input from standard D-pad buttons
- **Vibration/Rumble** - Dual-motor haptic feedback
- **Multi-controller** - Support for up to 4 gamepads simultaneously
- **Connection events** - Callbacks for gamepad connect/disconnect
- **Frame-based updates** - Works seamlessly with game loop pattern

## Quick Start

```typescript
import { GamepadManager } from "@shaisrc/tty";

const gamepad = new GamepadManager();

// Game loop
function gameLoop() {
  // Update gamepad state (call once per frame)
  gamepad.update();

  // Check buttons
  if (gamepad.isPressed(0)) {
    // Button A pressed (standard mapping)
    player.jump();
  }

  // Check analog stick
  const stick = gamepad.getLeftStick();
  player.x += stick.x * 5;
  player.y += stick.y * 5;

  requestAnimationFrame(gameLoop);
}
```

## API Reference

### Constructor

```typescript
new GamepadManager(options?: { deadzone?: number })
```

Creates a new gamepad manager. The deadzone prevents stick drift (default: 0.15).

```typescript
// Default deadzone (0.15)
const gamepad = new GamepadManager();

// Custom deadzone
const gamepad = new GamepadManager({ deadzone: 0.25 });
```

### Connection Methods

#### `isConnected(index?: number): boolean`

Check if a gamepad is connected at the specified index (default: 0).

```typescript
if (gamepad.isConnected(0)) {
  console.log("Player 1 controller connected!");
}
```

#### `getConnectedCount(): number`

Returns the number of connected gamepads.

#### `getGamepad(index?: number): Gamepad | null`

Get the raw Gamepad object at the specified index.

#### `getGamepads(): Gamepad[]`

Get all connected gamepads.

### Button Methods

#### `isPressed(buttonIndex: number, gamepadIndex?: number): boolean`

Check if a button is currently pressed.

```typescript
if (gamepad.isPressed(0)) {
  // Button A pressed
}
```

#### `justPressed(buttonIndex: number, gamepadIndex?: number): boolean`

Check if a button was just pressed this frame. Perfect for single-action inputs.

```typescript
if (gamepad.justPressed(1)) {
  // Button B just pressed
  cancelAction();
}
```

#### `justReleased(buttonIndex: number, gamepadIndex?: number): boolean`

Check if a button was just released this frame.

#### `getButton(buttonIndex: number, gamepadIndex?: number): GamepadButtonState`

Get complete button state with all flags and analog value.

```typescript
const button = gamepad.getButton(6); // Right trigger
console.log(button.pressed); // boolean
console.log(button.value); // 0-1 (analog triggers)
console.log(button.justPressed); // boolean
console.log(button.justReleased); // boolean
```

### Analog Stick Methods

#### `getAxis(axisIndex: number, gamepadIndex?: number): number`

Get a single axis value with deadzone applied (-1 to 1).

```typescript
const horizontal = gamepad.getAxis(0); // Left stick X
```

#### `getLeftStick(gamepadIndex?: number): { x: number, y: number }`

Get left analog stick position.

```typescript
const stick = gamepad.getLeftStick();
player.x += stick.x * speed;
player.y += stick.y * speed;
```

#### `getRightStick(gamepadIndex?: number): { x: number, y: number }`

Get right analog stick position. Great for camera control.

```typescript
const look = gamepad.getRightStick();
camera.rotate(look.x * sensitivity);
```

### D-Pad Methods

#### `getDPad(gamepadIndex?: number): { x: number, y: number }`

Get D-pad direction as discrete values (-1, 0, 1).

```typescript
const dpad = gamepad.getDPad();
if (dpad.y === -1) moveUp();
if (dpad.y === 1) moveDown();
if (dpad.x === -1) moveLeft();
if (dpad.x === 1) moveRight();
```

### Deadzone Methods

#### `setDeadzone(deadzone: number): void`

Set the analog stick deadzone (0-1). Automatically clamped.

```typescript
gamepad.setDeadzone(0.2); // 20% deadzone
```

#### `getDeadzone(): number`

Get the current deadzone value.

### Vibration Methods

#### `vibrate(duration?, weakMagnitude?, strongMagnitude?, gamepadIndex?): Promise<boolean>`

Vibrate/rumble the controller. Returns `true` if successful.

```typescript
// Quick rumble (200ms, medium strength)
await gamepad.vibrate();

// Custom rumble
await gamepad.vibrate(
  500, // 500ms duration
  0.8, // weak motor (high frequency)
  0.3, // strong motor (low frequency)
  0, // gamepad index
);

// Damage feedback
if (player.hit) {
  gamepad.vibrate(100, 0.9, 0.9); // Short, strong
}

// Continuous engine rumble
async function engineRumble() {
  while (engineRunning) {
    await gamepad.vibrate(100, 0.3, 0.1);
    await sleep(100);
  }
}
```

### Connection Callbacks

#### `onConnected(callback: (gamepad: Gamepad) => void): void`

Register a callback when a gamepad connects.

```typescript
gamepad.onConnected((gp) => {
  console.log(`${gp.id} connected!`);
  showNotification("Controller connected");
});
```

#### `onDisconnected(callback: (gamepad: Gamepad) => void): void`

Register a callback when a gamepad disconnects.

```typescript
gamepad.onDisconnected((gp) => {
  console.log(`Controller ${gp.index} disconnected`);
  pauseGame();
});
```

#### `removeCallback(callback: Function, type: "connected" | "disconnected"): void`

Remove a connection callback.

### Cleanup

#### `update(): void`

Poll gamepad state and update just-pressed/released flags. **Call once per frame before checking inputs.**

#### `destroy(): void`

Remove event listeners and cleanup. Call when disposing of the manager.

## Standard Button Mapping

For gamepads with "standard" mapping (Xbox, PlayStation, etc.):

| Index | Button          |
| ----- | --------------- |
| 0     | A / Cross       |
| 1     | B / Circle      |
| 2     | X / Square      |
| 3     | Y / Triangle    |
| 4     | Left Bumper     |
| 5     | Right Bumper    |
| 6     | Left Trigger    |
| 7     | Right Trigger   |
| 8     | Select / Share  |
| 9     | Start / Options |
| 10    | Left Stick      |
| 11    | Right Stick     |
| 12    | D-Pad Up        |
| 13    | D-Pad Down      |
| 14    | D-Pad Left      |
| 15    | D-Pad Right     |
| 16    | Home / PS       |

## Common Patterns

### Basic Movement

```typescript
function updatePlayer(gamepad: GamepadManager, player: Player) {
  gamepad.update();

  const stick = gamepad.getLeftStick();
  player.x += stick.x * 5;
  player.y += stick.y * 5;

  if (gamepad.justPressed(0)) {
    player.jump();
  }
}
```

### Menu Navigation with D-Pad

```typescript
class Menu {
  selectedIndex = 0;

  update(gamepad: GamepadManager) {
    gamepad.update();

    const dpad = gamepad.getDPad();

    if (dpad.y === -1 && gamepad.justPressed(12)) {
      // D-pad up just pressed
      this.selectedIndex--;
    }
    if (dpad.y === 1 && gamepad.justPressed(13)) {
      // D-pad down just pressed
      this.selectedIndex++;
    }

    if (gamepad.justPressed(0)) {
      // A button
      this.select();
    }
  }
}
```

### Twin-Stick Shooter

```typescript
function updateGame(gamepad: GamepadManager) {
  gamepad.update();

  // Move with left stick
  const move = gamepad.getLeftStick();
  player.x += move.x * 3;
  player.y += move.y * 3;

  // Aim with right stick
  const aim = gamepad.getRightStick();
  if (aim.x !== 0 || aim.y !== 0) {
    player.aimAngle = Math.atan2(aim.y, aim.x);
  }

  // Shoot with right trigger
  const trigger = gamepad.getButton(7);
  if (trigger.value > 0.1) {
    player.shoot(trigger.value); // Analog shooting
  }
}
```

### Haptic Feedback

```typescript
class Game {
  async onPlayerHit(damage: number) {
    // Stronger vibration for more damage
    const intensity = Math.min(damage / 100, 1);
    await this.gamepad.vibrate(200, intensity, intensity);
  }

  async onEngineStart() {
    // Pulsing engine rumble
    for (let i = 0; i < 5; i++) {
      await this.gamepad.vibrate(100, 0.3, 0.1);
      await this.sleep(150);
    }
  }

  async onExplosion() {
    // Big impact
    await this.gamepad.vibrate(300, 1.0, 1.0);
  }
}
```

### Multi-Player Support

```typescript
class MultiplayerGame {
  players = [
    { gamepadIndex: 0, x: 10, y: 10 },
    { gamepadIndex: 1, x: 70, y: 10 },
  ];

  update(gamepad: GamepadManager) {
    gamepad.update();

    for (const player of this.players) {
      if (!gamepad.isConnected(player.gamepadIndex)) continue;

      const stick = gamepad.getLeftStick(player.gamepadIndex);
      player.x += stick.x * 3;
      player.y += stick.y * 3;

      if (gamepad.justPressed(0, player.gamepadIndex)) {
        player.jump();
      }
    }
  }
}
```

### Analog Trigger Racing

```typescript
function updateCar(gamepad: GamepadManager, car: Car) {
  gamepad.update();

  // Analog gas/brake
  const gas = gamepad.getButton(7).value; // Right trigger
  const brake = gamepad.getButton(6).value; // Left trigger

  car.speed += gas * 0.5;
  car.speed -= brake * 0.8;

  // Steering
  const stick = gamepad.getLeftStick();
  car.steering = stick.x;
}
```

### Deadzone Adjustment

```typescript
class ControllerSettings {
  adjustDeadzone(gamepad: GamepadManager) {
    // Test current deadzone
    gamepad.update();
    const stick = gamepad.getLeftStick();

    if (stick.x === 0 && stick.y === 0) {
      console.log("Stick centered (within deadzone)");
    }

    // Increase if stick drifts
    if (this.hasStickDrift()) {
      gamepad.setDeadzone(0.25);
    }
  }
}
```

### Fallback to Keyboard

```typescript
class InputManager {
  constructor(
    private keyboard: KeyboardManager,
    private gamepad: GamepadManager,
  ) {}

  getMovement(): { x: number; y: number } {
    this.gamepad.update();

    // Prefer gamepad if connected
    if (this.gamepad.isConnected()) {
      return this.gamepad.getLeftStick();
    }

    // Fallback to keyboard
    return this.keyboard.getDirection();
  }

  isJumpPressed(): boolean {
    return (
      this.keyboard.justPressed(" ") || this.gamepad.justPressed(0) // A button
    );
  }
}
```

## Integration Examples

### With Game Loop

```typescript
import { GamepadManager, GameLoop } from "@shaisrc/tty";

const gamepad = new GamepadManager();
const player = { x: 40, y: 12, vx: 0, vy: 0 };

const gameLoop = new GameLoop(
  (dt) => {
    gamepad.update();

    const stick = gamepad.getLeftStick();
    player.vx = stick.x * 10;
    player.vy = stick.y * 10;

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    if (gamepad.justPressed(0)) {
      player.jump();
    }
  },
  () => {
    renderer.clear();
    renderer.drawText(player.x, player.y, "@");
    renderer.render();
  },
);

gameLoop.start();
```

### With Renderer and Multiple Controllers

```typescript
import { Renderer, CanvasTarget, GamepadManager } from "@shaisrc/tty";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);
const gamepad = new GamepadManager();

const players = [
  { index: 0, x: 20, y: 12, color: "cyan" },
  { index: 1, x: 60, y: 12, color: "magenta" },
];

function gameLoop() {
  gamepad.update();

  renderer.clear();

  for (const player of players) {
    if (!gamepad.isConnected(player.index)) {
      renderer.drawText(player.x, player.y - 2, "Disconnected", { fg: "red" });
      continue;
    }

    const stick = gamepad.getLeftStick(player.index);
    player.x += stick.x * 2;
    player.y += stick.y * 2;

    renderer.drawText(player.x, player.y, "@", { fg: player.color });

    // Vibrate when shooting
    if (gamepad.justPressed(0, player.index)) {
      gamepad.vibrate(50, 0.5, 0.5, player.index);
    }
  }

  renderer.render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

## Best Practices

1. **Call `update()` once per frame** - Before checking any inputs
2. **Check connection status** - Controllers can disconnect mid-game
3. **Use just-pressed for discrete actions** - Buttons, menu navigation
4. **Adjust deadzone for stick drift** - Different controllers may need different values
5. **Test vibration support** - Not all controllers support rumble
6. **Provide keyboard fallback** - Not everyone has a gamepad
7. **Handle multiple players** - Use gamepad index parameter
8. **Clean up on dispose** - Call `destroy()` to prevent memory leaks

## Browser Compatibility

The Gamepad API is supported in:

- ✅ Chrome/Edge 21+
- ✅ Firefox 29+
- ✅ Safari 10.1+
- ✅ Opera 15+

Vibration support requires:

- ✅ Chrome/Edge 68+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

Always check `vibrate()` return value to handle unsupported browsers gracefully.

## Tips

- **Standard mapping**: Most modern controllers use "standard" mapping
- **Polling required**: Call `update()` to poll gamepad state from the browser
- **Analog precision**: Trigger buttons (6, 7) provide 0-1 analog values
- **Deadzone prevents drift**: Stick values below deadzone return 0
- **Multiple gamepads**: Up to 4 controllers supported simultaneously
- **Connection events**: Use callbacks for plug-and-play UX
- **Vibration is async**: `await` vibration calls if you need sequential effects

## See Also

- [Keyboard Input](./keyboard-input.md) - For keyboard fallback
- [Game Loop](./game-loop.md) - For fixed timestep integration
- [Pointer Input](./pointer-input.md) - For mouse/touch controls
