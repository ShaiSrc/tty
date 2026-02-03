# Tutorial 2: Creating Interactive Menus

Learn how to build responsive menu systems with keyboard and pointer navigation using the KISS ASCII Renderer.

## What You'll Build

An interactive menu system with:

- Visual menu rendering with borders and styling
- Keyboard navigation (arrow keys + Enter)
- Mouse/pointer hover and click support
- Multiple menu screens (main menu → options submenu)
- Selection indicators and visual feedback

## Prerequisites

- Completed [Tutorial 1: Building Your First Game](./01-building-your-first-game.md)
- Basic understanding of `Renderer`, `GameLoop`, and input managers

## Step 1: Initial Setup

First, let's set up the basic structure with a renderer and input managers.

```typescript
import {
  Renderer,
  GameLoop,
  KeyboardManager,
  PointerManager,
} from "@shaisrc/tty";

class MenuDemo {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private pointer: PointerManager;
  private gameLoop: GameLoop;

  private selectedIndex = 0;
  private menuItems = ["New Game", "Continue", "Options", "Quit"];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: 80, height: 24 },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.pointer = new PointerManager(canvas, 80, 24, 12, 20);

    this.gameLoop = new GameLoop(
      () => {}, // No update logic needed yet
      () => this.render(),
      { fps: 30 },
    );
  }

  private render(): void {
    this.renderer.clear().render();
  }

  start(): void {
    this.gameLoop.start();
  }
}
```

### Key Concepts

- **PointerManager**: Handles mouse/touch input and converts pixel coordinates to grid coordinates
  - Constructor takes: `canvas`, `gridWidth`, `gridHeight`, `cellWidth`, `cellHeight`
- **GameLoop with render-only**: Since menus are mostly static, we only need `render()` until user input changes state

## Step 2: Drawing the Menu

Now let's use the built-in `menu()` helper to draw our menu.

```typescript
private render(): void {
  this.renderer.clear();

  // Calculate center position
  const menuX = Math.floor(80 / 2) - 15;
  const menuY = Math.floor(24 / 2) - 5;

  // Draw menu using the helper
  this.renderer.menu(menuX, menuY, this.menuItems, {
    selected: this.selectedIndex,
    indicator: "►",
    border: true,
    style: "rounded",
    padding: 1,
    selectedFg: "brightYellow",
    unselectedFg: "white",
    borderFg: "brightCyan",
  });

  this.renderer.render();
}
```

### Key Concepts

- **menu() helper**: Simplifies menu rendering with built-in features:
  - `selected`: Index of the currently selected item
  - `indicator`: Character to show next to selected item (e.g., "►", ">", "\*")
  - `border`: Whether to draw a border around the menu
  - `style`: Border style (`"single"`, `"double"`, `"rounded"`, `"bold"`)
  - `padding`: Space between border and menu items
  - Color options: `selectedFg`, `unselectedFg`, `borderFg`

- **Centering calculation**:
  ```typescript
  const menuX = Math.floor(width / 2) - halfMenuWidth;
  const menuY = Math.floor(height / 2) - halfMenuHeight;
  ```

## Step 3: Adding Keyboard Navigation

Let's add arrow key navigation to move through menu items.

```typescript
private setupInput(): void {
  // Navigate up
  this.keyboard.onKeyDown("ArrowUp", () => {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
  });

  // Navigate down
  this.keyboard.onKeyDown("ArrowDown", () => {
    this.selectedIndex = Math.min(
      this.menuItems.length - 1,
      this.selectedIndex + 1
    );
  });

  // Select item
  // Select item (Enter or Space)
  this.keyboard.onKeyDown(["Enter", " "], () => {
    this.handleSelection();
  });
}

private handleSelection(): void {
  const selected = this.menuItems[this.selectedIndex];
  console.log(`Selected: ${selected}`);

  switch (selected) {
    case "New Game":
      console.log("Starting new game...");
      break;
    case "Continue":
      console.log("Continuing game...");
      break;
    case "Options":
      console.log("Opening options...");
      break;
    case "Quit":
      console.log("Quitting...");
      break;
  }
}

constructor(canvas: HTMLCanvasElement) {
  // ... previous constructor code ...

  this.setupInput(); // Add this line

  this.gameLoop = new GameLoop(
    () => {},
    () => this.render(),
    { fps: 30 }
  );
}
```

### Key Concepts

- **Bounds checking**: `Math.max(0, ...)` and `Math.min(length - 1, ...)` prevent index out of bounds
- **Multiple key bindings**: You can bind multiple keys to the same action (Enter + Space)
- **Event handlers**: `onKeyDown()` registers a callback that runs when a key is pressed
- **State-driven rendering**: Changing `selectedIndex` automatically updates the next frame

## Step 4: Adding Pointer Support

Add mouse hover and click functionality for a more polished UX.

```typescript
private setupInput(): void {
  // ... previous keyboard code ...

  // Handle hover
  this.pointer.onHover((event) => {
    const hoveredIndex = this.getMenuItemAtPosition(
      event.grid.x,
      event.grid.y
    );

    if (hoveredIndex !== null) {
      this.selectedIndex = hoveredIndex;
    }
  });

  // Handle click
  this.pointer.onClick((event) => {
    const clickedIndex = this.getMenuItemAtPosition(
      event.grid.x,
      event.grid.y
    );

    if (clickedIndex !== null) {
      this.selectedIndex = clickedIndex;
      this.handleSelection();
    }
  });
}

private getMenuItemAtPosition(gridX: number, gridY: number): number | null {
  const menuX = Math.floor(80 / 2) - 15;
  const menuY = Math.floor(24 / 2) - 5;

  // Menu items start 1 row below the top border
  const itemStartY = menuY + 1;
  const itemEndY = itemStartY + this.menuItems.length - 1;

  // Check if within vertical bounds
  if (gridY < itemStartY || gridY > itemEndY) {
    return null;
  }

  // Check if within horizontal bounds (with border and padding)
  const menuWidth = 30; // Approximate based on longest item
  const itemStartX = menuX + 1;
  const itemEndX = menuX + menuWidth - 2;

  if (gridX < itemStartX || gridX > itemEndX) {
    return null;
  }

  // Calculate which item was hit
  return gridY - itemStartY;
}
```

### Key Concepts

- **PointerManager events**:
  - `onHover()`: Fires continuously while mouse moves over grid cells
  - `onClick()`: Fires when mouse button is clicked
  - `event.grid`: Contains `{ x, y }` in grid coordinates

- **Hit detection**: Convert grid coordinates to menu item indices
  - Check vertical bounds (Y coordinate)
  - Check horizontal bounds (X coordinate)
  - Calculate index from offset

- **Instant feedback**: Hovering changes selection, clicking selects immediately

## Step 5: Multi-Screen Menus

Let's add a submenu for the "Options" screen.

```typescript
class MenuDemo {
  // ... previous properties ...

  private currentScreen: "main" | "options" = "main";
  private optionsIndex = 0;
  private optionItems = [
    "Sound: ON",
    "Music: ON",
    "Difficulty: Normal",
    "Back",
  ];

  // ... rest of the class ...
}
```

Update the render method to show different menus:

```typescript
private render(): void {
  this.renderer.clear();

  const menuX = Math.floor(80 / 2) - 15;
  const menuY = Math.floor(24 / 2) - 5;

  if (this.currentScreen === "main") {
    // Draw title
    this.renderer.centerText(5, "MAIN MENU", {
      fg: "brightCyan",
    });

    // Draw main menu
    this.renderer.menu(menuX, menuY, this.menuItems, {
      selected: this.selectedIndex,
      indicator: "►",
      border: true,
      style: "rounded",
      padding: 1,
      selectedFg: "brightYellow",
      unselectedFg: "white",
      borderFg: "brightCyan",
    });
  } else if (this.currentScreen === "options") {
    // Draw title
    this.renderer.centerText(5, "OPTIONS", {
      fg: "brightCyan",
    });

    // Draw options menu
    this.renderer.menu(menuX, menuY, this.optionItems, {
      selected: this.optionsIndex,
      indicator: "►",
      border: true,
      style: "rounded",
      padding: 1,
      selectedFg: "brightYellow",
      unselectedFg: "white",
      borderFg: "brightCyan",
    });
  }

  this.renderer.render();
}
```

Update input handling for multiple screens:

```typescript
private setupInput(): void {
  // Navigate up
  this.keyboard.onKeyDown("ArrowUp", () => {
    if (this.currentScreen === "main") {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else if (this.currentScreen === "options") {
      this.optionsIndex = Math.max(0, this.optionsIndex - 1);
    }
  });

  // Navigate down
  this.keyboard.onKeyDown("ArrowDown", () => {
    if (this.currentScreen === "main") {
      this.selectedIndex = Math.min(
        this.menuItems.length - 1,
        this.selectedIndex + 1
      );
    } else if (this.currentScreen === "options") {
      this.optionsIndex = Math.min(
        this.optionItems.length - 1,
        this.optionsIndex + 1
      );
    }
  });

  // Select
  this.keyboard.onKeyDown("Enter", () => this.handleSelection());

  // Back
  this.keyboard.onKeyDown("Escape", () => {
    if (this.currentScreen === "options") {
      this.currentScreen = "main";
    }
  });

  // ... pointer code (update similarly) ...
}

private handleSelection(): void {
  if (this.currentScreen === "main") {
    const selected = this.menuItems[this.selectedIndex];

    switch (selected) {
      case "Options":
        this.currentScreen = "options";
        this.optionsIndex = 0; // Reset selection
        break;
      // ... other cases ...
    }
  } else if (this.currentScreen === "options") {
    const selected = this.optionItems[this.optionsIndex];

    if (selected === "Back") {
      this.currentScreen = "main";
    } else {
      // Toggle option values
      console.log(`Toggled: ${selected}`);
    }
  }
}
```

### Key Concepts

- **Screen state management**: Use a state variable to track which menu is active
- **Separate indices**: Each screen has its own selection index
- **Screen transitions**: Change `currentScreen` to switch menus
- **Back navigation**: Escape key or "Back" option returns to previous screen
- **Reset selection**: When entering a submenu, reset its index to 0

## Complete Example

Here's the full working code:

```typescript
import {
  Renderer,
  GameLoop,
  KeyboardManager,
  PointerManager,
} from "@shaisrc/tty";

class MenuDemo {
  private renderer: Renderer;
  private keyboard: KeyboardManager;
  private pointer: PointerManager;
  private gameLoop: GameLoop;

  private selectedIndex = 0;
  private menuItems = ["New Game", "Continue", "Options", "Quit"];
  private currentScreen: "main" | "options" = "main";
  private optionsIndex = 0;
  private optionItems = [
    "Sound: ON",
    "Music: ON",
    "Difficulty: Normal",
    "Back",
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: 80, height: 24 },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "black" },
    });

    this.keyboard = new KeyboardManager();
    this.pointer = new PointerManager(canvas, 80, 24, 12, 20);
    this.setupInput();

    this.gameLoop = new GameLoop(
      () => {},
      () => this.render(),
      { fps: 30 },
    );
  }

  private setupInput(): void {
    this.keyboard.onKeyDown("ArrowUp", () => {
      if (this.currentScreen === "main") {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      } else {
        this.optionsIndex = Math.max(0, this.optionsIndex - 1);
      }
    });

    this.keyboard.onKeyDown("ArrowDown", () => {
      if (this.currentScreen === "main") {
        this.selectedIndex = Math.min(
          this.menuItems.length - 1,
          this.selectedIndex + 1,
        );
      } else {
        this.optionsIndex = Math.min(
          this.optionItems.length - 1,
          this.optionsIndex + 1,
        );
      }
    });

    this.keyboard.onKeyDown(["Enter", " "], () => this.handleSelection());
    this.keyboard.onKeyDown("Escape", () => {
      if (this.currentScreen === "options") {
        this.currentScreen = "main";
      }
    });

    this.pointer.onHover((event) => {
      const index = this.getMenuItemAtPosition(event.grid.x, event.grid.y);
      if (index !== null) {
        if (this.currentScreen === "main") {
          this.selectedIndex = index;
        } else {
          this.optionsIndex = index;
        }
      }
    });

    this.pointer.onClick((event) => {
      const index = this.getMenuItemAtPosition(event.grid.x, event.grid.y);
      if (index !== null) {
        if (this.currentScreen === "main") {
          this.selectedIndex = index;
        } else {
          this.optionsIndex = index;
        }
        this.handleSelection();
      }
    });
  }

  private getMenuItemAtPosition(gridX: number, gridY: number): number | null {
    const items =
      this.currentScreen === "main" ? this.menuItems : this.optionItems;
    const menuX = Math.floor(80 / 2) - 15;
    const menuY = Math.floor(24 / 2) - 5;

    const itemStartY = menuY + 1;
    const itemEndY = itemStartY + items.length - 1;
    const menuWidth = 30;
    const itemStartX = menuX + 1;
    const itemEndX = menuX + menuWidth - 2;

    if (gridY < itemStartY || gridY > itemEndY) return null;
    if (gridX < itemStartX || gridX > itemEndX) return null;

    return gridY - itemStartY;
  }

  private handleSelection(): void {
    if (this.currentScreen === "main") {
      const selected = this.menuItems[this.selectedIndex];
      if (selected === "Options") {
        this.currentScreen = "options";
        this.optionsIndex = 0;
      } else {
        console.log(`Selected: ${selected}`);
      }
    } else {
      const selected = this.optionItems[this.optionsIndex];
      if (selected === "Back") {
        this.currentScreen = "main";
      } else {
        console.log(`Toggled: ${selected}`);
      }
    }
  }

  private render(): void {
    this.renderer.clear();

    const menuX = Math.floor(80 / 2) - 15;
    const menuY = Math.floor(24 / 2) - 5;

    if (this.currentScreen === "main") {
      this.renderer.centerText(5, "MAIN MENU", { fg: "brightCyan" });
      this.renderer.menu(menuX, menuY, this.menuItems, {
        selected: this.selectedIndex,
        indicator: "►",
        border: true,
        style: "rounded",
        padding: 1,
        selectedFg: "brightYellow",
        unselectedFg: "white",
        borderFg: "brightCyan",
      });
    } else {
      this.renderer.centerText(5, "OPTIONS", { fg: "brightCyan" });
      this.renderer.menu(menuX, menuY, this.optionItems, {
        selected: this.optionsIndex,
        indicator: "►",
        border: true,
        style: "rounded",
        padding: 1,
        selectedFg: "brightYellow",
        unselectedFg: "white",
        borderFg: "brightCyan",
      });
    }

    this.renderer.render();
  }

  start(): void {
    this.gameLoop.start();
  }
}

// Usage
const canvas = document.getElementById("game") as HTMLCanvasElement;
const menu = new MenuDemo(canvas);
menu.start();
```

## Key Takeaways

1. **Use the `menu()` helper** - It handles most menu rendering for you with sensible defaults
2. **PointerManager simplifies mouse input** - Converts pixels to grid coordinates automatically
3. **State management is key** - Track screen state and selection indices separately
4. **Chainable API** - Use fluent method chaining for cleaner code
5. **Separation of concerns** - `setupInput()` for bindings, `handleSelection()` for logic, `render()` for drawing

## Next Steps

- [Tutorial 3: Building Complex UIs](./03-building-complex-uis.md) - Learn to create multi-panel RPG interfaces with stats, inventory, and maps
- [Tutorial 4: Adding Animations](./04-adding-animations.md) - Make your menus more dynamic with pulse effects and transitions

## Related Documentation

- [Menu Helper API](../guide/menu-helper.md)
- [Keyboard Input](../guide/keyboard-input.md)
- [Pointer Input](../guide/pointer-input.md)
- [Renderer API](../guide/renderer-api.md)
