/**
 * Menu Demo Example
 * Demonstrates interactive menu system with keyboard navigation
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
  PointerManager,
  type MenuOptions,
} from "@shaisrc/tty";

const GRID_WIDTH = 80;
const GRID_HEIGHT = 24;
const CELL_WIDTH = 12;
const CELL_HEIGHT = 20;

class MenuDemo {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private pointer: PointerManager;
  private gameLoop: GameLoop;
  private escapeCaptureHandler: ((event: KeyboardEvent) => void) | null = null;
  public selectedIndex = 0;
  private menuItems = ["New Game", "Continue", "Options", "Credits", "Quit"];
  public currentScreen: "main" | "options" | "credits" = "main";
  public optionsIndex = 0;
  private optionItems = [
    "Sound: ON",
    "Music: ON",
    "Difficulty: Normal",
    "Back",
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: GRID_WIDTH, height: GRID_HEIGHT },
      cell: { width: CELL_WIDTH, height: CELL_HEIGHT },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.pointer = new PointerManager(
      canvas,
      GRID_WIDTH,
      GRID_HEIGHT,
      CELL_WIDTH,
      CELL_HEIGHT,
    );
    this.setupInput();

    this.gameLoop = new GameLoop(() => {}, this.render.bind(this), { fps: 30 });
  }

  private setupInput() {
    // Menu navigation
    this.keyboard.onKeyDown("ArrowUp", () => {
      if (this.currentScreen === "main") {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      } else if (this.currentScreen === "options") {
        this.optionsIndex = Math.max(0, this.optionsIndex - 1);
      }
    });

    this.keyboard.onKeyDown("ArrowDown", () => {
      if (this.currentScreen === "main") {
        this.selectedIndex = Math.min(
          this.menuItems.length - 1,
          this.selectedIndex + 1,
        );
      } else if (this.currentScreen === "options") {
        this.optionsIndex = Math.min(
          this.optionItems.length - 1,
          this.optionsIndex + 1,
        );
      }
    });

    // Selection
    this.keyboard.onKeyDown(["Enter", " "], () => this.handleSelection());

    // Back (capture to avoid closing the example container)
    if (typeof document !== "undefined") {
      this.escapeCaptureHandler = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        if (this.currentScreen === "main") return;

        event.preventDefault();
        event.stopImmediatePropagation();
        this.currentScreen = "main";
      };

      document.addEventListener("keydown", this.escapeCaptureHandler, {
        capture: true,
      });
    }

    this.pointer.onHover((event) => {
      const hit = this.getMenuHit(event.grid.x, event.grid.y);
      if (!hit) return;

      if (hit.screen === "main") {
        this.selectedIndex = hit.index;
      } else if (hit.screen === "options") {
        this.optionsIndex = hit.index;
      }
    });

    this.pointer.onClick((event) => {
      const hit = this.getMenuHit(event.grid.x, event.grid.y);
      if (!hit) return;

      if (hit.screen === "main") {
        this.selectedIndex = hit.index;
      } else if (hit.screen === "options") {
        this.optionsIndex = hit.index;
      }

      this.handleSelection();
    });
  }

  private getMenuDimensions(items: string[], options: MenuOptions) {
    const { indicator = "", padding = 1, border = false } = options;

    const maxItemLength = items.reduce(
      (max, item) => Math.max(max, item.length),
      0,
    );
    const indicatorWidth = indicator ? indicator.length + 1 : 0;
    const contentWidth = indicatorWidth + maxItemLength;
    const innerWidth = contentWidth + padding * 2;
    const menuWidth = options.width ?? (border ? innerWidth + 2 : innerWidth);
    const menuHeight = items.length + (border ? 2 : 0);

    return { menuWidth, menuHeight };
  }

  private getMenuHit(
    gridX: number,
    gridY: number,
  ): { screen: "main" | "options"; index: number } | null {
    if (this.currentScreen === "credits") return null;

    const isMain = this.currentScreen === "main";
    const items = isMain ? this.menuItems : this.optionItems;
    const menuX = Math.floor(GRID_WIDTH / 2) - 15;
    const mainMenuY = 2 + 5 + 2;
    const optionsMenuY = Math.floor(GRID_HEIGHT / 2) - 4;
    const menuY = isMain ? mainMenuY : optionsMenuY;

    const menuOptions: MenuOptions = {
      selected: 0,
      indicator: "►",
      border: true,
      style: "rounded",
      padding: 1,
    };

    const { menuWidth } = this.getMenuDimensions(items, menuOptions);
    const itemStartY = menuY + 1;
    const itemEndY = itemStartY + items.length - 1;
    const itemStartX = menuX + 1;
    const itemEndX = menuX + menuWidth - 2;

    if (gridY < itemStartY || gridY > itemEndY) return null;
    if (gridX < itemStartX || gridX > itemEndX) return null;

    const index = gridY - itemStartY;
    return { screen: isMain ? "main" : "options", index };
  }

  private handleSelection() {
    if (this.currentScreen === "main") {
      const selected = this.menuItems[this.selectedIndex];
      switch (selected) {
        case "New Game":
          console.log("Starting new game...");
          break;
        case "Continue":
          console.log("Continuing game...");
          break;
        case "Options":
          this.currentScreen = "options";
          this.optionsIndex = 0;
          break;
        case "Credits":
          this.currentScreen = "credits";
          break;
        case "Quit":
          console.log("Quitting...");
          this.stop();
          break;
      }
    } else if (this.currentScreen === "options") {
      const selected = this.optionItems[this.optionsIndex];
      if (selected === "Back") {
        this.currentScreen = "main";
      } else {
        // Toggle options
        this.toggleOption(this.optionsIndex);
      }
    }
  }

  private toggleOption(index: number) {
    if (index === 0) {
      // Toggle sound
      this.optionItems[0] = this.optionItems[0].includes("ON")
        ? "Sound: OFF"
        : "Sound: ON";
    } else if (index === 1) {
      // Toggle music
      this.optionItems[1] = this.optionItems[1].includes("ON")
        ? "Music: OFF"
        : "Music: ON";
    } else if (index === 2) {
      // Cycle difficulty
      const current = this.optionItems[2];
      if (current.includes("Normal")) {
        this.optionItems[2] = "Difficulty: Hard";
      } else if (current.includes("Hard")) {
        this.optionItems[2] = "Difficulty: Easy";
      } else {
        this.optionItems[2] = "Difficulty: Normal";
      }
    }
  }

  private renderMainMenu() {
    const menuX = Math.floor(GRID_WIDTH / 2) - 15;
    const titleBoxY = 2;
    const titleBoxHeight = 5;
    const menuY = titleBoxY + titleBoxHeight + 2;

    // Title
    this.renderer.box(menuX - 5, titleBoxY, 40, titleBoxHeight, {
      style: "double",
      fill: true,
      title: "KISS ASCII RENDERER",
      titleFg: "brightCyan",
      titleAlign: "center",
    });

    // Main menu
    const menuOptions: MenuOptions = {
      selected: this.selectedIndex,
      indicator: "►",
      border: true,
      title: "Main Menu",
      style: "rounded",
      selectedFg: "black",
      selectedBg: "cyan",
      fg: "white",
      padding: 1,
    };

    this.renderer.menu(menuX, menuY, this.menuItems, menuOptions);

    // Instructions
    this.renderer
      .centerText(GRID_HEIGHT - 3, "↑↓ Navigate | Enter/Space Select", {
        fg: "gray",
      })
      .centerText(GRID_HEIGHT - 2, "ESC Back", { fg: "gray" });
  }

  private renderOptionsMenu() {
    const menuX = Math.floor(GRID_WIDTH / 2) - 15;
    const menuY = Math.floor(GRID_HEIGHT / 2) - 4;

    const menuOptions: MenuOptions = {
      selected: this.optionsIndex,
      indicator: "►",
      border: true,
      title: "Options",
      style: "rounded",
      selectedFg: "black",
      selectedBg: "yellow",
      fg: "white",
      padding: 1,
    };

    this.renderer.menu(menuX, menuY, this.optionItems, menuOptions);

    this.renderer
      .centerText(GRID_HEIGHT - 3, "↑↓ Navigate | Enter Toggle", {
        fg: "gray",
      })
      .centerText(GRID_HEIGHT - 2, "ESC Back to Main Menu", { fg: "gray" });
  }

  private renderCredits() {
    const boxX = Math.floor(GRID_WIDTH / 2) - 20;
    const boxY = Math.floor(GRID_HEIGHT / 2) - 6;

    this.renderer
      .box(boxX, boxY, 40, 12, { style: "double", fill: true })
      .centerText(boxY + 2, "CREDITS", { fg: "brightCyan" })
      .centerText(boxY + 4, "Developed by Shai", { fg: "white" })
      .centerText(boxY + 6, "@shaisrc/tty", { fg: "yellow" })
      .centerText(boxY + 8, "KISS ASCII Renderer", { fg: "cyan" })
      .centerText(GRID_HEIGHT - 2, "Press ESC to return", { fg: "gray" });
  }

  private render() {
    this.renderer.clear();
    this.renderer.fill(0, 0, GRID_WIDTH, GRID_HEIGHT, " ", null, "black");

    // Draw border
    this.renderer.box(0, 0, GRID_WIDTH, GRID_HEIGHT, {
      style: "single",
      fg: "brightBlue",
    });

    // Render appropriate screen
    switch (this.currentScreen) {
      case "main":
        this.renderMainMenu();
        break;
      case "options":
        this.renderOptionsMenu();
        break;
      case "credits":
        this.renderCredits();
        break;
    }

    this.renderer.render();
  }

  public start() {
    this.gameLoop.start();
  }

  public stop() {
    this.gameLoop.stop();
    if (this.escapeCaptureHandler && typeof document !== "undefined") {
      document.removeEventListener("keydown", this.escapeCaptureHandler, true);
      this.escapeCaptureHandler = null;
    }
  }
}

// Example usage
function startMenuDemo(canvas: HTMLCanvasElement) {
  const demo = new MenuDemo(canvas);
  demo.start();
  return demo;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startMenuDemo = startMenuDemo;
}

export { startMenuDemo };

// If running in browser directly
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    if (canvas) {
      startMenuDemo(canvas);
    }
  });
}
