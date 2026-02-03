/**
 * Snake Game Example
 * A complete implementation of the classic Snake game
 *
 * Run this example:
 * 1. Build the library: npm run build
 * 2. Create an HTML file with a canvas element
 * 3. Import and run this code
 */

import { Renderer, GameLoop, KeyboardManager, Point } from "@shaisrc/tty";

const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;

type Direction = "up" | "down" | "left" | "right";

type Position = Point;

class SnakeGame {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private gameLoop: GameLoop;

  public snake: Position[] = [];
  public direction: Direction = "right";
  private nextDirection: Direction = "right";
  public food: Position = { x: 0, y: 0 };
  public score = 0;
  public gameOver = false;
  public paused = false;
  private moveTimer = 0;
  private moveInterval = 150; // ms
  public highScore = 0;
  public started = false;

  constructor(canvas: HTMLCanvasElement) {
    // Use the new forCanvas factory for cleaner initialization
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 16, height: 16 },
      font: { family: "monospace" },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.setupInput();
    this.initGame();

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this),
      { fps: 60 },
    );
  }

  private initGame(): void {
    // Initialize snake in the center
    const centerX = Math.floor(GRID_WIDTH / 2);
    const centerY = Math.floor(GRID_HEIGHT / 2);

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];

    this.direction = "right";
    this.nextDirection = "right";
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.started = false;
    this.moveTimer = 0;
    this.spawnFood();
  }

  private setupInput(): void {
    const startGame = () => {
      if (!this.started && !this.gameOver) this.started = true;
    };

    // Use multi-key bindings for movement (WASD + Arrow keys)
    this.keyboard.onKeyDown(["ArrowUp", "w", "W"], () => {
      if (this.direction !== "down") this.nextDirection = "up";
      startGame();
    });

    this.keyboard.onKeyDown(["ArrowDown", "s", "S"], () => {
      if (this.direction !== "up") this.nextDirection = "down";
      startGame();
    });

    this.keyboard.onKeyDown(["ArrowLeft", "a", "A"], () => {
      if (this.direction !== "right") this.nextDirection = "left";
      startGame();
    });

    this.keyboard.onKeyDown(["ArrowRight", "d", "D"], () => {
      if (this.direction !== "left") this.nextDirection = "right";
      startGame();
    });

    const togglePause = (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.gameOver) {
        this.initGame();
        return;
      }
      this.paused = !this.paused;
    };

    this.keyboard.onKeyDown("Space", togglePause);

    this.keyboard.onKeyDown("r", () => {
      this.initGame();
    });
  }

  private spawnFood(): void {
    let validPosition = false;
    while (!validPosition) {
      this.food = {
        x: Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1,
      };

      // Check if food spawns on snake
      validPosition = !this.snake.some(
        (segment) => segment.x === this.food.x && segment.y === this.food.y,
      );
    }
  }

  private update(dt: number): void {
    if (this.gameOver || this.paused || !this.started) return;

    this.moveTimer += dt; // Convert to ms

    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;
      this.moveSnake();
    }
  }

  private moveSnake(): void {
    this.direction = this.nextDirection;

    const head = { ...this.snake[0] };

    // Move head
    switch (this.direction) {
      case "up":
        head.y--;
        break;
      case "down":
        head.y++;
        break;
      case "left":
        head.x--;
        break;
      case "right":
        head.x++;
        break;
    }

    // Check wall collision
    if (
      head.x <= 0 ||
      head.x >= GRID_WIDTH - 1 ||
      head.y <= 0 ||
      head.y >= GRID_HEIGHT - 1
    ) {
      this.endGame();
      return;
    }

    // Check self collision
    if (
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.spawnFood();

      // Increase speed slightly
      this.moveInterval = Math.max(50, this.moveInterval - 2);
    } else {
      this.snake.pop(); // Remove tail if no food eaten
    }
  }

  private endGame(): void {
    this.gameOver = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.fill(0, 0, GRID_WIDTH, GRID_HEIGHT, " ", null, "black");

    // Draw border
    this.renderer.box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
      style: "double",
      fg: "brightCyan",
      title: "SNAKE",
      titleFg: "brightYellow",
      titleAlign: "center",
    });

    // Draw score
    this.renderer.drawText(2, 0, ` Score: ${this.score} `, {
      fg: "brightGreen",
    });
    this.renderer.drawText(GRID_WIDTH - 18, 0, ` High: ${this.highScore} `, {
      fg: "yellow",
    });

    if (!this.gameOver) {
      // Draw snake
      for (let i = 0; i < this.snake.length; i++) {
        const segment = this.snake[i];
        const char = i === 0 ? "@" : "O";
        const color = i === 0 ? "brightGreen" : "green";
        this.renderer.setChar(segment.x, segment.y, char, color);
      }

      // Draw food
      this.renderer.setChar(this.food.x, this.food.y, "♦", "brightRed");

      // Draw pause indicator
      if (this.paused) {
        this.renderer.box(
          Math.floor(GRID_WIDTH / 2) - 8,
          Math.floor(GRID_HEIGHT / 2) - 2,
          16,
          4,
          {
            style: "double",
            fill: true,
            fillChar: " ",
            fg: "yellow",
          },
        );
        this.renderer.centerText(Math.floor(GRID_HEIGHT / 2), "PAUSED", {
          fg: "brightYellow",
        });
      }
    } else {
      // Game Over screen
      const boxY = Math.floor(GRID_HEIGHT / 2) - 4;
      this.renderer.box(Math.floor(GRID_WIDTH / 2) - 15, boxY, 30, 8, {
        style: "double",
        fill: true,
        fillChar: " ",
        fg: "red",
      });

      this.renderer.centerText(boxY + 2, "GAME OVER", {
        fg: "brightRed",
      });
      this.renderer.centerText(boxY + 4, `Final Score: ${this.score}`, {
        fg: "white",
      });
      this.renderer.centerText(boxY + 5, `High Score: ${this.highScore}`, {
        fg: "yellow",
      });
      this.renderer.centerText(boxY + 7, "Press SPACE to restart", {
        fg: "gray",
      });
    }

    // Draw controls
    const controlsY = GRID_HEIGHT - 1;
    this.renderer.drawText(2, controlsY, " WASD/Arrows: Move ", { fg: "gray" });
    this.renderer.drawText(24, controlsY, " Space: Pause ", { fg: "gray" });

    this.renderer.render();
  }

  start(): void {
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }
}

// Export for use in HTML
// Start function for snake-game
function startSnakeGame(canvas: HTMLCanvasElement) {
  const game = new SnakeGame(canvas);
  game.start();
  return game;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startSnakeGame = startSnakeGame;
}

export { SnakeGame, startSnakeGame };

// Example usage in HTML:
/*
<!DOCTYPE html>
<html>
<head>
  <title>Snake Game</title>
  <style>
    body {
      margin: 0;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    canvas {
      border: 2px solid #0f0;
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script type="module">
    import { SnakeGame } from './snake-game.js';
    const canvas = document.getElementById('game');
    const game = new SnakeGame(canvas);
    game.start();
  </script>
</body>
</html>
*/
