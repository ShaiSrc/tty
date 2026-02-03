# Tutorial 3: Building Complex UIs

Learn to create a complete RPG-style interface with multiple panels, stats, inventory, and a game map using the Layer System and Panel helpers.

**What You'll Build**: A complete RPG interface with character stats, HP/MP/EXP bars, inventory list, message log, mini-map, and controls panel.

**What You'll Learn**:

- Using the Layer System for proper z-ordering
- Creating multi-panel layouts
- Drawing progress bars for stats
- Building scrollable game maps with camera following
- Managing complex UI state

**Prerequisites**: Complete [Tutorial 1: Building Your First Game](./01-building-your-first-game.md) and [Tutorial 2: Creating Interactive Menus](./02-creating-menus.md)

---

## Step 1: Setup the UI Structure

Let's start with the basic canvas setup and define our data structures.

### Create the Game Interface Class

```typescript
import { Renderer, GameLoop, KeyboardManager } from "@shaisrc/tty";

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
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: 10, height: 18 },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 30 },
    );
  }

  private update(dt: number): void {
    // Game logic will go here
  }

  private render(): void {
    this.renderer.clear().render();
  }

  start(): void {
    this.gameLoop.start();
  }
}
```

**What's Happening:**

- **Large Canvas**: `100x40` grid gives us room for multiple panels
- **TypeScript Interfaces**: Define structured data for stats and items
- **Game Loop**: Standard setup for continuous rendering

**Key tty APIs Used:**

- `Renderer.forCanvas()` - Create CanvasTarget + Renderer in one step
- `Renderer` - Main drawing surface
- `GameLoop` - Handle update/render cycle
- `KeyboardManager` - Will handle input later

---

## Step 2: Layout with Panels

Now let's use the **Layer System** to organize our UI into background and foreground elements, and create our panel layout.

### Draw the Main Border and Panels

```typescript
class RPGInterface {
  // ... previous code ...

  private render(): void {
    this.renderer.clear();

    // Draw on background layer
    this.renderer.layer("background");
    this.drawMainBorder();

    // Draw on UI layer (appears on top)
    this.renderer.layer("ui");
    this.drawStatsPanel();
    this.drawInventoryPanel();
    this.drawMessageLog();
    this.drawControlsPanel();

    this.renderer.render();
  }

  private drawMainBorder(): void {
    // Main window border
    this.renderer.box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
      style: "double",
      fg: "brightCyan",
      title: `${this.player.name}'s Adventure`,
      titleFg: "brightYellow",
      titleAlign: "center",
    });
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
  }

  private drawControlsPanel(): void {
    const panelX = 63;
    const panelY = 28;
    const panelWidth = 35;

    this.renderer.panel(panelX, panelY, panelWidth, 10, {
      title: "Controls",
      style: "single",
      fg: "gray",
    });
  }
}
```

**What's Happening:**

- **Layer System**: `renderer.layer("background")` and `renderer.layer("ui")` separate background from foreground
- **Panel Helper**: `renderer.panel()` creates titled boxes in one call
- **Consistent Layout**: Panels positioned with calculated coordinates

**Key tty APIs Used:**

- `renderer.layer(name)` - Switch between render layers for z-ordering
- `renderer.panel(x, y, width, height, options)` - Draw titled panels
- `renderer.box()` - Draw the main border
- `renderer.centerText()` - Center title text

**Why Layers?** The map will be drawn on the background layer, and UI panels on the ui layer. This ensures panels always appear on top of the map, even if map drawing overlaps their coordinates.

---

## Step 3: Character Stats with Progress Bars

Let's fill in the Character panel with stats and visual progress bars for HP, MP, and EXP.

### Add Stats Display

```typescript
class RPGInterface {
  // ... previous code ...

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
    lineY++; // Extra space

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
        showPercent: true, // Shows percentage instead of label
      },
    );

    // Decorative separator
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
}
```

**What's Happening:**

- **Progress Bars**: Visual representation of HP/MP/EXP using `renderer.progressBar()`
- **Label Options**: HP/MP show exact values, EXP shows percentage
- **Color Coding**: Red for HP, blue for MP, green for EXP
- **Spacing**: Manual `lineY` tracking for vertical positioning

**Key tty APIs Used:**

- `renderer.progressBar(x, y, width, progress, options)` - Create visual progress indicators
  - `progress` - Value between 0.0 and 1.0
  - `fillChar` / `emptyChar` - Characters for filled/empty portions
  - `fillFg` / `emptyFg` - Colors for each portion
  - `label` - Text to show on the bar
  - `labelPosition` - "right" or "center"
  - `showPercent` - Show percentage instead of custom label
- `renderer.drawLine()` - Draw decorative horizontal line

---

## Step 4: Inventory and Message Log

Let's populate the Inventory panel with items and create a scrolling message log.

### Add Inventory Display

```typescript
class RPGInterface {
  // ... previous code ...

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
      // Item name on the left
      this.renderer.drawText(panelX + 2, lineY, `${item.name}`, {
        fg: "cyan",
      });

      // Quantity on the right
      this.renderer.drawText(
        panelX + panelWidth - 5,
        lineY,
        `x${item.quantity}`,
        { fg: "gray" },
      );

      lineY++;
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

    // Clear the panel interior
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

    // Show only the last 3 messages
    const startIdx = Math.max(0, this.log.length - 3);

    for (let i = startIdx; i < this.log.length; i++) {
      this.renderer.drawText(panelX + 1, lineY++, this.log[i], {
        fg: "white",
      });
    }
  }

  private drawControlsPanel(): void {
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
}
```

**What's Happening:**

- **Inventory Loop**: Iterate through items, displaying name and quantity
- **Right Alignment**: Quantity positioned relative to panel width
- **Message Scrolling**: Only show the last 3 messages using array slicing
- **Fill Helper**: Clear panel interior before drawing text

**Key tty APIs Used:**

- `renderer.drawText(x, y, text, options)` - Draw text at exact position
- `renderer.fill(x, y, width, height, char, fg, bg)` - Fill area with character/color

**Design Pattern**: Notice we're calculating `panelX + panelWidth - 5` for right-aligned text. This is a common pattern for multi-column displays.

---

## Step 5: Add a Scrollable Game Map

Now for the exciting part - let's add a tile-based map that scrolls as the player moves.

### Generate and Render the Map

```typescript
class RPGInterface {
  // ... previous code ...

  private mapData: string[][] = [];
  public playerX = 15;
  public playerY = 10;
  private rngSeed = 1337;

  constructor(canvas: HTMLCanvasElement) {
    // ... previous setup ...

    this.setupInput();
    this.generateMap(); // Generate map after setup

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 30 },
    );
  }

  private generateMap(): void {
    // Generate a 30x30 tile map
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
    // Simple deterministic PRNG for consistent map generation
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

    // Demo: Take damage
    this.keyboard.onKeyDown(" ", (event) => {
      event.preventDefault();
      this.player.hp = Math.max(0, this.player.hp - 10);
      this.log.push(`You took 10 damage!`);
      if (this.log.length > 6) this.log.shift();
    });

    // Demo: Heal
    this.keyboard.onKeyDown("h", () => {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
      this.log.push(`Used Potion! Restored 50 HP!`);
      if (this.log.length > 6) this.log.shift();
    });
  }

  private render(): void {
    this.renderer.clear();

    // Background layer for map
    this.renderer.layer("background");
    this.drawMainBorder();
    this.drawMap(); // Draw the map

    // UI layer for panels
    this.renderer.layer("ui");
    this.drawStatsPanel();
    this.drawInventoryPanel();
    this.drawMessageLog();
    this.drawControlsPanel();

    this.renderer.render();
  }

  private drawMap(): void {
    const mapX = 2;
    const mapY = 2;
    const mapWidth = 60;
    const mapHeight = 30;

    // Draw map panel border
    this.renderer.box(mapX, mapY, mapWidth, mapHeight, {
      style: "single",
      fg: "gray",
    });

    // Calculate visible portion of map centered on player
    const startX = Math.max(0, this.playerX - 28);
    const startY = Math.max(0, this.playerY - 13);

    // Draw visible tiles
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 58; x++) {
        const worldX = startX + x;
        const worldY = startY + y;

        if (worldY < this.mapData.length && worldX < this.mapData[0].length) {
          const tile = this.mapData[worldY][worldX];
          let char = tile;
          let color = "green";

          // Convert tile codes to visual characters
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

    // Draw player on top
    const screenX = mapX + 1 + (this.playerX - startX);
    const screenY = mapY + 1 + (this.playerY - startY);
    this.renderer.setChar(screenX, screenY, "@", "brightYellow");
  }
}
```

**What's Happening:**

- **Map Generation**: Create a 30x30 grid of tile types using a deterministic PRNG
- **Camera Following**: Calculate which portion of the map to show based on player position
- **Tile Rendering**: Convert tile codes (T, ~, ^, .) to visual characters (♠, ≈, ▲, .)
- **Player Drawing**: Draw player `@` symbol on top of the map
- **Input Handling**: Arrow keys move player, Space/H for demo damage/healing

**Key tty APIs Used:**

- `renderer.setChar(x, y, char, fg)` - Draw individual characters for tiles
- `KeyboardManager.onKeyDown(key, callback)` - Handle keyboard input

**Camera Math**:

- `startX = playerX - 28` centers the viewport on the player horizontally
- `startY = playerY - 13` centers vertically
- Screen position: `screenX = mapX + 1 + (playerX - startX)` converts world to screen coords

---

## Complete Example

Here's the full working RPG interface:

```typescript
import { Renderer, GameLoop, KeyboardManager } from "@shaisrc/tty";

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
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.setupInput();
    this.generateMap();

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 30 },
    );
  }

  private generateMap(): void {
    for (let y = 0; y < 30; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < 30; x++) {
        const roll = this.nextRandom();
        if (roll < 0.1) {
          this.mapData[y][x] = "T";
        } else if (roll < 0.15) {
          this.mapData[y][x] = "~";
        } else if (roll < 0.2) {
          this.mapData[y][x] = "^";
        } else {
          this.mapData[y][x] = ".";
        }
      }
    }
  }

  private nextRandom(): number {
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

    this.keyboard.onKeyDown(" ", (event) => {
      event.preventDefault();
      this.player.hp = Math.max(0, this.player.hp - 10);
      this.log.push(`You took 10 damage!`);
      if (this.log.length > 6) this.log.shift();
    });

    this.keyboard.onKeyDown("h", () => {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
      this.log.push(`Used Potion! Restored 50 HP!`);
      if (this.log.length > 6) this.log.shift();
    });
  }

  private update(dt: number): void {
    // Game logic here
  }

  private render(): void {
    this.renderer.clear();

    this.renderer.layer("background");
    this.drawMainBorder();
    this.drawMap();

    this.renderer.layer("ui");
    this.drawStatsPanel();
    this.drawInventoryPanel();
    this.drawMessageLog();
    this.drawControlsPanel();

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

    this.renderer.drawText(
      panelX + 2,
      lineY++,
      `${this.player.name} - Level ${this.player.level}`,
      { fg: "brightYellow" },
    );
    lineY++;

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

    this.renderer.drawLine(
      panelX + 2,
      lineY + 1,
      panelX + panelWidth - 3,
      lineY + 1,
      "─",
      { fg: "gray" },
    );
    lineY += 2;

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
      this.renderer.drawText(panelX + 2, lineY, `${item.name}`, {
        fg: "cyan",
      });
      this.renderer.drawText(
        panelX + panelWidth - 5,
        lineY,
        `x${item.quantity}`,
        { fg: "gray" },
      );
      lineY++;
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

  private drawControlsPanel(): void {
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

// Start the game
const canvas = document.getElementById("game") as HTMLCanvasElement;
const game = new RPGInterface(canvas);
game.start();
```

---

## Summary

You've built a complex RPG interface! Here's what you learned:

### Key Concepts

- **Layer System** - Organize UI elements with z-ordering
- **Panel Layouts** - Multi-panel interfaces with the `panel()` helper
- **Progress Bars** - Visual stat indicators with `progressBar()`
- **Scrolling Maps** - Camera-following tile-based maps
- **Complex State** - Managing player stats, inventory, and logs

### tty APIs Mastered

- `renderer.layer(name)` - Layer management
- `renderer.panel(x, y, w, h, options)` - Titled boxes
- `renderer.progressBar(x, y, w, progress, options)` - Visual bars
- `renderer.fill(x, y, w, h, char, fg, bg)` - Fill regions
- `renderer.drawLine(x1, y1, x2, y2, char, options)` - Decorative lines
- `renderer.setChar(x, y, char, fg)` - Individual character placement

### Design Patterns

- **Separation of Concerns** - Each panel in its own method
- **Calculated Layout** - Position panels with math, not magic numbers
- **Layer Organization** - Background for map, UI for panels
- **Manual Positioning** - Use `lineY++` for vertical flow

---

## Next Steps

- **[Tutorial 4: Adding Animations](./04-adding-animations.md)** - Add pulse effects and sequential drawing
- **[Layer System Guide](../guide/layer-system.md)** - Deep dive into layer management
- **[Progress Bar Guide](../guide/progress-bar.md)** - Advanced progress bar techniques
- **[Camera System Guide](../guide/camera-system.md)** - Alternative to manual scrolling

---

## Try It Yourself

**Challenge 1**: Add a minimap in the corner that shows the entire 30x30 world

**Challenge 2**: Implement inventory selection with arrow keys

**Challenge 3**: Add different panel styles for different states (selected/unselected)

**Challenge 4**: Create health/mana regeneration over time in the `update()` method
