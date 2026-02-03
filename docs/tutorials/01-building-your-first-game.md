# Tutorial: Building Your First Game

In this tutorial, you'll build a complete game from scratch using the KISS ASCII Renderer. We'll create a simple player movement game with keyboard controls and boundary detection.

**What you'll learn:**

- Setting up a render target and renderer
- Creating a game loop
- Handling keyboard input
- Drawing shapes and text
- Boundary validation

**Final result:** A working game where you control a `@` character with arrow keys or WASD.

---

## Step 1: Initialize the Renderer

First, let's set up the basic structure - a canvas target and renderer.

```typescript
import { Renderer } from "@shaisrc/tty";

const GRID_WIDTH = 80;
const GRID_HEIGHT = 24;

const canvas = document.getElementById("game") as HTMLCanvasElement;

// Create the renderer (factory)
const renderer = Renderer.forCanvas(canvas, {
  grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
  cell: { width: 12, height: 20 },
  font: { family: "monospace", size: 16 },
  colors: { fg: "white", bg: "black" },
});
```

**Key concepts:**

- `Renderer.forCanvas()` creates a CanvasTarget + Renderer in one step
- `Renderer` handles all drawing operations
- Character dimensions (`charWidth`, `charHeight`) determine visual size

---

## Step 2: Add Player State

Define the player's position and appearance:

```typescript
import { type Point } from "@shaisrc/tty";

interface Player extends Point {
  char: string;
}

const player: Player = {
  x: Math.floor(GRID_WIDTH / 2), // Center horizontally
  y: Math.floor(GRID_HEIGHT / 2), // Center vertically
  char: "@",
};
```

**Why this structure?** Separating game state from rendering logic keeps code clean and testable.

---

## Step 3: Setup Keyboard Input

Use `KeyboardManager` to handle player movement:

```typescript
import { KeyboardManager } from "@shaisrc/tty";

const keyboard = new KeyboardManager();

// Arrow keys + WASD controls
keyboard.onKeyDown(["ArrowUp", "w", "W"], () => {
  const newY = player.y - 1;
  if (renderer.validate.cell(player.x, newY)) {
    player.y = newY;
  }
});

keyboard.onKeyDown(["ArrowDown", "s", "S"], () => {
  const newY = player.y + 1;
  if (renderer.validate.cell(player.x, newY)) {
    player.y = newY;
  }
});

keyboard.onKeyDown(["ArrowLeft", "a", "A"], () => {
  const newX = player.x - 1;
  if (renderer.validate.cell(newX, player.y)) {
    player.x = newX;
  }
});

keyboard.onKeyDown(["ArrowRight", "d", "D"], () => {
  const newX = player.x + 1;
  if (renderer.validate.cell(newX, player.y)) {
    player.x = newX;
  }
});
```

**Key concepts:**

- `onKeyDown(key, callback)` registers input handlers
- `renderer.validate.cell(x, y)` checks if coordinates are within bounds
- Movement is validated _before_ updating state - preventing out-of-bounds positions

**Why validate?** Without validation, the player could move outside the grid, causing rendering errors.

---

## Step 4: Create the Render Function

Draw the game state every frame:

```typescript
function render() {
  renderer
    .clear() // Clear previous frame

    // Draw border + title
    .box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
      style: "single",
      fg: "cyan",
      title: "Basic Game Demo",
      titleFg: "brightCyan",
      titleAlign: "center",
    })

    // Draw decorative lines
    .drawLine(2, 2, 10, 2, "─", { fg: "brightCyan" })
    .drawLine(GRID_WIDTH - 11, 2, GRID_WIDTH - 3, 2, "─", {
      fg: "brightCyan",
    })

    // Draw instructions
    .drawText(2, GRID_HEIGHT - 1, "Controls: Arrow Keys or WASD | ESC: Pause", {
      fg: "gray",
    })

    // Draw player
    .setChar(player.x, player.y, player.char, "yellow")

    // Display position
    .drawText(2, 1, `Position: (${player.x}, ${player.y})`, {
      fg: "white",
    })

    .render(); // Apply all changes to canvas
}
```

**Key concepts:**

- **Chainable API**: Each method returns `this`, allowing fluid method chaining
- `clear()` wipes the buffer before drawing
- `render()` applies buffered changes to the canvas
- Drawing order matters - player drawn after border appears on top

**API breakdown:**

- `box(x, y, width, height, options)` - Draws a box with various styles
- `centerText(y, text, options)` - Centers text horizontally
- `drawLine(x1, y1, x2, y2, char, options)` - Draws horizontal/vertical lines
- `drawText(x, y, text, options)` - Draws text at position
- `setChar(x, y, char, color)` - Sets a single character

---

## Step 5: Add the Game Loop

Use `GameLoop` to run the game at a consistent frame rate:

```typescript
import { GameLoop } from "@shaisrc/tty";

const gameLoop = new GameLoop(
  // Update function (game logic)
  (deltaTime) => {
    // For this simple game, all logic is in input handlers
    // More complex games would update AI, physics, etc. here
  },

  // Render function (drawing)
  () => render(),

  // Options
  { fps: 60 },
);

// Start the loop
gameLoop.start();
```

**Key concepts:**

- `GameLoop` handles timing and frame rate
- `update(deltaTime)` runs game logic
- `render()` draws the current state
- `deltaTime` is time elapsed since last frame (in milliseconds)

**Why separate update and render?** This allows skipping render calls if the game is running slowly, maintaining consistent game speed.

---

## Step 6: Add Pause Functionality (Optional)

Make the game pausable with ESC:

```typescript
keyboard.onKeyDown("Escape", () => {
  gameLoop.togglePause();
});
```

**The `GameLoop` API:**

- `start()` - Begin the loop
- `stop()` - Stop completely
- `pause()` - Pause updates
- `resume()` - Resume from pause
- `togglePause()` - Toggle pause state

---

## Complete Code

Here's the full game assembled:

```typescript
import { Renderer, GameLoop, KeyboardManager, type Point } from "@shaisrc/tty";

const GRID_WIDTH = 80;
const GRID_HEIGHT = 24;

interface Player extends Point {
  char: string;
}

class BasicGame {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private gameLoop: GameLoop;
  private player: Player;

  constructor(canvas: HTMLCanvasElement) {
    // Setup renderer
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "black" },
    });

    // Setup input
    this.keyboard = new KeyboardManager();
    this.setupInput();

    // Initialize player
    this.player = {
      x: Math.floor(GRID_WIDTH / 2),
      y: Math.floor(GRID_HEIGHT / 2),
      char: "@",
    };

    // Create game loop
    this.gameLoop = new GameLoop(
      () => this.update(),
      () => this.render(),
      { fps: 60 },
    );
  }

  private setupInput() {
    // Movement handlers
    this.keyboard.onKeyDown(["ArrowUp", "w", "W"], () => {
      const newY = this.player.y - 1;
      if (this.renderer.validate.cell(this.player.x, newY)) {
        this.player.y = newY;
      }
    });

    this.keyboard.onKeyDown(["ArrowDown", "s", "S"], () => {
      const newY = this.player.y + 1;
      if (this.renderer.validate.cell(this.player.x, newY)) {
        this.player.y = newY;
      }
    });

    this.keyboard.onKeyDown(["ArrowLeft", "a", "A"], () => {
      const newX = this.player.x - 1;
      if (this.renderer.validate.cell(newX, this.player.y)) {
        this.player.x = newX;
      }
    });

    this.keyboard.onKeyDown(["ArrowRight", "d", "D"], () => {
      const newX = this.player.x + 1;
      if (this.renderer.validate.cell(newX, this.player.y)) {
        this.player.x = newX;
      }
    });

    this.keyboard.onKeyDown("Escape", () => {
      this.gameLoop.togglePause();
    });
  }

  private update() {
    // Game logic goes here
  }

  private render() {
    this.renderer
      .clear()
      .box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
        style: "single",
        fg: "cyan",
        title: "Basic Game Demo",
        titleFg: "brightCyan",
        titleAlign: "center",
      })
      .drawText(
        2,
        GRID_HEIGHT - 1,
        "Controls: Arrow Keys or WASD | ESC: Pause",
        { fg: "gray" },
      )
      .setChar(this.player.x, this.player.y, this.player.char, "yellow")
      .drawText(2, 1, `Position: (${player.x}, ${player.y})`, {
        fg: "white",
      })
      .render();
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}

// Usage
const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new BasicGame(canvas);
game.start();
```

---

## What You've Learned

✅ **Renderer setup** - Creating targets and renderers  
✅ **Input handling** - KeyboardManager for responsive controls  
✅ **Boundary validation** - Using `renderer.validate.cell()`  
✅ **Game loop** - Separating update and render logic  
✅ **Drawing API** - Boxes, text, lines, and characters  
✅ **Chainable methods** - Fluent, readable rendering code

---

## Next Steps

- **[Creating Menus](./02-creating-menus.md)** - Build interactive menu systems
- **[Building Complex UIs](./03-building-complex-uis.md)** - Multi-panel interfaces
- **[Adding Animations](./04-adding-animations.md)** - Effects and transitions

---

## Challenge Yourself

Try extending this game:

1. **Add obstacles** - Use `setChar()` to place walls (`█`) on the map
2. **Collision detection** - Check if new position contains a wall before moving
3. **Collectibles** - Place items (`*`) that disappear when player reaches them
4. **Score tracking** - Count collected items and display with `drawText()`

All of these use the same core APIs you've just learned!
