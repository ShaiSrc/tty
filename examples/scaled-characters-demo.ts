/**
 * Scaled Characters Demo
 *
 * Demonstrates the scaled character rendering feature.
 * Shows how to render characters at different scales (2×2, 3×3, 4×4, 5×5)
 * and create visual effects with larger text.
 *
 * Run this example:
 * 1. Build the library: npm run build
 * 2. Open examples/index.html in a browser
 * 3. Click "Run Demo" on the Scaled Characters card
 */

import { Renderer, GameLoop } from "@shaisrc/tty";

// Configuration
const GRID_WIDTH = 80;
const GRID_HEIGHT = 30;

class ScaledCharactersDemo {
  private renderer: Renderer;
  private gameLoop: GameLoop;
  private pulsePhase = 0;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize renderer
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 10, height: 16 },
      font: { family: "monospace", size: 14 },
      colors: { fg: "white", bg: "black" },
      autoClear: true,
    });

    // Initialize game loop for animation
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this),
      { fps: 30 },
    );
  }

  private update(deltaTime: number) {
    // Update pulse animation
    this.pulsePhase += deltaTime * 0.002;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }
  }

  private render() {
    // Calculate pulse effect (oscillate between colors)
    const pulseValue = Math.sin(this.pulsePhase);
    const titleColor =
      pulseValue > 0 ? "yellow" : pulseValue > -0.5 ? "brightYellow" : "white";

    this.renderer
      .clear()
      // Border
      .box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
        style: "double",
        fg: "cyan",
        title: "Scaled Characters Demo",
        titleFg: "brightCyan",
      })
      // Title with scaled text (animated)
      .scaledText(18, 2, 3, "SCALED", titleColor)
      // Subtitle
      .drawText(20, 7, "Character scaling from 1×1 to 5×5", {
        fg: "brightWhite",
      })
      // Horizontal divider
      .drawLine(2, 9, GRID_WIDTH - 3, 9, "─", { fg: "gray" })
      // Scale examples with labels
      .setCharScaled(8, 12, 2, "@", "red")
      .drawText(12, 13, "2×2", { fg: "gray" })
      .setCharScaled(20, 12, 3, "@", "blue")
      .drawText(25, 14, "3×3", { fg: "gray" })
      .setCharScaled(35, 11, 4, "@", "green")
      .drawText(41, 14, "4×4", { fg: "gray" })
      .setCharScaled(54, 10, 5, "@", "magenta")
      .drawText(61, 14, "5×5", { fg: "gray" })
      // Horizontal divider
      .drawLine(2, 17, GRID_WIDTH - 3, 17, "─", { fg: "gray" })
      // Game examples section
      .drawText(2, 19, "Game Examples:", { fg: "brightWhite" })
      // Player character (2×2)
      .setCharScaled(8, 21, 2, "@", "brightYellow", "black")
      .drawText(12, 22, "Player (2×2)", { fg: "gray" })
      // Enemy (2×2)
      .setCharScaled(26, 21, 2, "E", "brightRed")
      .drawText(30, 22, "Enemy (2×2)", { fg: "gray" })
      // Boss (3×3)
      .setCharScaled(45, 20, 3, "Ω", "brightRed")
      .drawText(50, 22, "Boss (3×3)", { fg: "gray" })
      // Instructions at bottom
      .drawText(2, GRID_HEIGHT - 2, "• Scaled characters use unified cells", {
        fg: "cyan",
      })
      .drawText(
        2,
        GRID_HEIGHT - 1,
        "• Supports scales from 1×1 to 5×5 | ESC to close",
        { fg: "cyan" },
      )
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
function startScaledCharacters(canvas: HTMLCanvasElement) {
  const demo = new ScaledCharactersDemo(canvas);
  demo.start();
  return demo;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startScaledCharacters = startScaledCharacters;
}

export { startScaledCharacters };
