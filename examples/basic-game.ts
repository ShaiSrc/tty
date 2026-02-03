/**
 * Basic Game Example
 * A simple player movement demo with keyboard controls
 *
 * Run this example:
 * 1. Build the library: npm run build
 * 2. Create an HTML file with a canvas element
 * 3. Import and run this code
 */

import { Renderer, GameLoop, KeyboardManager, Point } from "@shaisrc/tty";

// Configuration
const GRID_WIDTH = 80;
const GRID_HEIGHT = 24;

// Game state
interface Player extends Point {
  char: string;
}

class BasicGame {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private gameLoop: GameLoop;
  public player: Player;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize renderer (factory)
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 12, height: 20 },
      font: { family: "monospace", size: 16 },
      colors: { fg: "white", bg: "black" },
    });

    // Initialize keyboard
    this.keyboard = new KeyboardManager();
    this.setupInput();

    // Initialize player at center
    this.player = {
      x: Math.floor(GRID_WIDTH / 2),
      y: Math.floor(GRID_HEIGHT / 2),
      char: "@",
    };

    // Initialize game loop
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this),
      { fps: 60 },
    );
  }

  private setupInput() {
    const tryMove = (dx: number, dy: number) => {
      const newX = this.player.x + dx;
      const newY = this.player.y + dy;
      if (this.renderer.validate.cell(newX, newY)) {
        this.player.x = newX;
        this.player.y = newY;
      }
    };

    // Arrow keys + WASD for movement
    this.keyboard.onKeyDown(["ArrowUp", "w", "W"], () => tryMove(0, -1));
    this.keyboard.onKeyDown(["ArrowDown", "s", "S"], () => tryMove(0, 1));
    this.keyboard.onKeyDown(["ArrowLeft", "a", "A"], () => tryMove(-1, 0));
    this.keyboard.onKeyDown(["ArrowRight", "d", "D"], () => tryMove(1, 0));

    // ESC to pause
    this.keyboard.onKeyDown("Escape", () => {
      this.gameLoop.togglePause();
    });
  }

  private update(deltaTime: number) {
    // Game logic would go here
    // For this simple example, all logic is in input handlers
  }

  private render() {
    this.renderer
      .clear()
      // Draw border
      .box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
        style: "single",
        fg: "cyan",
        title: "Basic Game Demo",
        titleFg: "brightCyan",
        titleAlign: "center",
      })
      // Add decorative lines at corners
      .drawLine(2, 2, 10, 2, "─", { fg: "brightCyan" })
      .drawLine(GRID_WIDTH - 11, 2, GRID_WIDTH - 3, 2, "─", {
        fg: "brightCyan",
      })
      // Draw instructions
      .drawText(
        2,
        GRID_HEIGHT - 1,
        "Controls: Arrow Keys or WASD | ESC: Pause",
        {
          fg: "gray",
        },
      )
      // Draw player
      .setChar(this.player.x, this.player.y, this.player.char, "yellow")
      // Draw position info
      .drawText(2, 1, `Position: (${this.player.x}, ${this.player.y})`, {
        fg: "white",
      })
      // Render everything
      .render();
  }

  public start() {
    this.gameLoop.start();
  }

  public stop() {
    this.gameLoop.stop();
  }
}

// Example usage
function startBasicGame(canvas: HTMLCanvasElement) {
  const game = new BasicGame(canvas);
  game.start();
  return game;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startBasicGame = startBasicGame;
}

export { startBasicGame };
