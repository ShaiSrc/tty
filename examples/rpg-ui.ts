/**
 * RPG UI Example
 * Demonstrates a complete RPG-style interface with stats, inventory, and map
 *
 * Run this example:
 * 1. Build the library: npm run build
 * 2. Create an HTML file with a canvas element
 * 3. Import and run this code
 */

import {
  Renderer,
  GameLoop,
  KeyboardManager,
  type PanelOptions,
} from "@shaisrc/tty";

const GRID_WIDTH = 100;
const GRID_HEIGHT = 40;

interface PlayerStats {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  expToNext: number;
  gold: number;
}

interface Item {
  name: string;
  quantity: number;
}

class RPGInterface {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private gameLoop: GameLoop;

  private rngSeed = 1337;

  public player: PlayerStats = {
    name: "Hero",
    level: 12,
    hp: 245,
    maxHp: 320,
    mp: 89,
    maxMp: 150,
    exp: 3450,
    expToNext: 5000,
    gold: 1234,
  };

  private inventory: Item[] = [
    { name: "Potion", quantity: 5 },
    { name: "Ether", quantity: 3 },
    { name: "Phoenix Down", quantity: 2 },
    { name: "Elixir", quantity: 1 },
    { name: "Antidote", quantity: 7 },
    { name: "Eye Drops", quantity: 4 },
  ];

  private log: string[] = [
    "You enter a dark forest...",
    "A wild goblin appears!",
    "You attack for 45 damage!",
    "Goblin attacks for 12 damage!",
    "You defeated the goblin!",
    "Gained 120 EXP and 45 Gold!",
  ];

  private mapData: string[][] = [];
  public playerX = 15;
  public playerY = 10;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 10, height: 18 },
      font: { family: "monospace" },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.setupInput();
    this.generateMap();

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this),
      { fps: 30 },
    );
  }

  private generateMap(): void {
    // Generate a simple 30x30 map
    for (let y = 0; y < 30; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < 30; x++) {
        const roll = this.nextRandom();
        if (roll < 0.1) {
          this.mapData[y][x] = "T"; // Tree
        } else if (roll < 0.15) {
          this.mapData[y][x] = "~"; // Water
        } else if (roll < 0.2) {
          this.mapData[y][x] = "^"; // Mountain
        } else {
          this.mapData[y][x] = "."; // Grass
        }
      }
    }
  }

  private nextRandom(): number {
    // Deterministic PRNG for stable demos/tests (LCG)
    this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0;
    return this.rngSeed / 0x100000000;
  }

  private setupInput(): void {
    this.keyboard.onKeyDown("ArrowUp", () => {
      if (this.playerY > 0) this.playerY--;
    });
    this.keyboard.onKeyDown("ArrowDown", () => {
      if (this.playerY < 29) this.playerY++;
    });
    this.keyboard.onKeyDown("ArrowLeft", () => {
      if (this.playerX > 0) this.playerX--;
    });
    this.keyboard.onKeyDown("ArrowRight", () => {
      if (this.playerX < 29) this.playerX++;
    });

    // Simulate damage for demo
    this.keyboard.onKeyDown(" ", (event) => {
      event.preventDefault();
      this.player.hp = Math.max(0, this.player.hp - 10);
      this.log.push(`You took 10 damage!`);
      if (this.log.length > 6) this.log.shift();
    });

    // Heal for demo
    this.keyboard.onKeyDown("h", () => {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
      this.log.push(`Used Potion! Restored 50 HP!`);
      if (this.log.length > 6) this.log.shift();
    });
  }

  private update(dt: number): void {
    // Game logic would go here
  }

  private render(): void {
    this.renderer.clear();

    // Draw on layers for proper z-ordering
    this.renderer.layer("background");
    this.drawMainBorder();
    this.drawMap();

    this.renderer.layer("ui");
    this.drawStatsPanel();
    this.drawInventoryPanel();
    this.drawMessageLog();
    this.drawControls();

    this.renderer.render();
  }

  private drawMainBorder(): void {
    this.renderer.box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
      style: "double",
      fg: "brightCyan",
      title: `${this.player.name}'s Adventure`,
      titleFg: "brightYellow",
      titleAlign: "center",
    });
  }

  private drawMap(): void {
    const mapX = 2;
    const mapY = 2;
    const mapWidth = 60;
    const mapHeight = 30;

    this.renderer.box(mapX, mapY, mapWidth, mapHeight, {
      style: "single",
      fg: "gray",
    });

    // Draw visible portion of map
    const startX = Math.max(0, this.playerX - 28);
    const startY = Math.max(0, this.playerY - 13);

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 58; x++) {
        const worldX = startX + x;
        const worldY = startY + y;

        if (worldY < this.mapData.length && worldX < this.mapData[0].length) {
          const tile = this.mapData[worldY][worldX];
          let char = tile;
          let color = "green";

          if (tile === "T") {
            char = "♠";
            color = "brightGreen";
          } else if (tile === "~") {
            char = "≈";
            color = "brightBlue";
          } else if (tile === "^") {
            char = "▲";
            color = "gray";
          }

          this.renderer.setChar(mapX + 1 + x, mapY + 1 + y, char, color);
        }
      }
    }

    // Draw player
    const screenX = mapX + 1 + (this.playerX - startX);
    const screenY = mapY + 1 + (this.playerY - startY);
    this.renderer.setChar(screenX, screenY, "@", "brightYellow");
  }

  private drawStatsPanel(): void {
    const panelX = 63;
    const panelY = 2;
    const panelWidth = 35;

    this.renderer.panel(panelX, panelY, panelWidth, 12, {
      title: "Character",
      style: "single",
      fg: "white",
    });

    let lineY = panelY + 2;

    // Name and Level
    this.renderer.drawText(
      panelX + 2,
      lineY++,
      `${this.player.name} - Level ${this.player.level}`,
      { fg: "brightYellow" },
    );
    lineY++;

    // HP Bar
    this.renderer.drawText(panelX + 2, lineY, "HP:", { fg: "red" });
    this.renderer.progressBar(
      panelX + 6,
      lineY,
      25,
      this.player.hp / this.player.maxHp,
      {
        fillChar: "█",
        emptyChar: "░",
        fillFg: "red",
        emptyFg: "gray",
        label: `${this.player.hp}/${this.player.maxHp}`,
        labelPosition: "right",
      },
    );
    lineY += 2;

    // MP Bar
    this.renderer.drawText(panelX + 2, lineY, "MP:", { fg: "blue" });
    this.renderer.progressBar(
      panelX + 6,
      lineY,
      25,
      this.player.mp / this.player.maxMp,
      {
        fillChar: "█",
        emptyChar: "░",
        fillFg: "blue",
        emptyFg: "gray",
        label: `${this.player.mp}/${this.player.maxMp}`,
        labelPosition: "right",
      },
    );
    lineY += 2;

    // EXP Bar
    this.renderer.drawText(panelX + 2, lineY, "EXP:", { fg: "green" });
    this.renderer.progressBar(
      panelX + 7,
      lineY,
      24,
      this.player.exp / this.player.expToNext,
      {
        fillChar: "▓",
        emptyChar: "░",
        fillFg: "green",
        emptyFg: "gray",
        showPercent: true,
      },
    );

    // Add decorative separator line
    this.renderer.drawLine(
      panelX + 2,
      lineY + 1,
      panelX + panelWidth - 3,
      lineY + 1,
      "─",
      { fg: "gray" },
    );
    lineY += 2;

    // Gold
    this.renderer.drawText(panelX + 2, lineY, `Gold: ${this.player.gold}G`, {
      fg: "yellow",
    });
  }

  private drawInventoryPanel(): void {
    const panelX = 63;
    const panelY = 15;
    const panelWidth = 35;

    this.renderer.panel(panelX, panelY, panelWidth, 12, {
      title: "Inventory",
      style: "single",
      fg: "white",
    });

    let lineY = panelY + 2;

    for (const item of this.inventory) {
      this.renderer.drawText(panelX + 2, lineY++, `${item.name}`, {
        fg: "cyan",
      });
      this.renderer.drawText(
        panelX + panelWidth - 5,
        lineY - 1,
        `x${item.quantity}`,
        { fg: "gray" },
      );
    }
  }

  private drawMessageLog(): void {
    const panelX = 2;
    const panelY = 33;
    const panelWidth = 60;

    this.renderer.panel(panelX, panelY, panelWidth, 5, {
      title: "Message Log",
      style: "single",
      fg: "white",
    });

    this.renderer.fill(
      panelX + 1,
      panelY + 1,
      panelWidth - 2,
      3,
      " ",
      null,
      "black",
    );

    let lineY = panelY + 1;
    const startIdx = Math.max(0, this.log.length - 3);

    for (let i = startIdx; i < this.log.length; i++) {
      this.renderer.drawText(panelX + 1, lineY++, this.log[i], {
        fg: "white",
      });
    }
  }

  private drawControls(): void {
    const panelX = 63;
    const panelY = 28;
    const panelWidth = 35;

    this.renderer.panel(panelX, panelY, panelWidth, 10, {
      title: "Controls",
      style: "single",
      fg: "gray",
    });

    const controls = [
      "Arrow Keys - Move",
      "Space - Take Damage",
      "H - Use Potion",
      "ESC - Quit",
    ];

    let lineY = panelY + 2;
    for (const control of controls) {
      this.renderer.drawText(panelX + 2, lineY++, control, { fg: "gray" });
    }
  }

  start(): void {
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }
}

// Export for use in HTML
// Start function for rpg-ui
function startRpgUi(canvas: HTMLCanvasElement) {
  const game = new RPGInterface(canvas);
  game.start();
  return game;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startRpgUi = startRpgUi;
}

export { RPGInterface, startRpgUi };

// Example usage in HTML:
/*
<!DOCTYPE html>
<html>
<head>
  <title>RPG UI Demo</title>
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
      border: 2px solid #333;
      image-rendering: pixelated;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script type="module">
    import { RPGInterface } from './rpg-ui.js';
    const canvas = document.getElementById('game');
    const game = new RPGInterface(canvas);
    game.start();
  </script>
</body>
</html>
*/
