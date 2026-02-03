# Panel Helper

The panel helper provides an easy way to create bordered containers with titles, footers, and scrollable content areas - perfect for dialogs, inventory screens, and information displays.

## Overview

Panels are useful for:

- Dialog boxes and modal windows
- Inventory and equipment screens
- Message boxes and notifications
- Status displays and HUDs
- Scrollable content areas
- Help screens and tutorials

The library provides comprehensive panel support with:

- Optional titles and footers in borders
- Text alignment for titles/content
- Scrollable content with offset control
- Customizable borders and fill
- Inner padding support
- Full color customization

## Basic Usage

```typescript
import { Renderer } from "@shaisrc/tty";
import { CanvasTarget } from "@shaisrc/tty/targets/CanvasTarget";

const canvas = document.querySelector("canvas")!;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);

// Simple panel
renderer
  .panel(10, 5, 40, 15, {
    title: "Inventory",
    content: ["Sword", "Shield", "Potion"],
  })
  .render();
```

## API Reference

### `panel(x, y, width, height, options?): this`

Draws a panel (bordered box with content area) at the specified position.

#### Parameters

- `x` - Starting X coordinate (0-indexed)
- `y` - Starting Y coordinate (0-indexed)
- `width` - Width of the panel in characters
- `height` - Height of the panel in characters
- `options?` - Optional styling and content configuration

#### Options

```typescript
interface PanelOptions {
  // Title & Footer
  title?: string; // Title displayed in top border
  titleAlign?: TextAlign; // Title alignment (default: 'left')
  footer?: string; // Footer displayed in bottom border

  // Border
  style?: BoxStyle; // Border style (default: 'single')
  fg?: Color; // Foreground color
  bg?: Color; // Background color

  // Content
  content?: string[]; // Lines of content to display
  contentAlign?: TextAlign; // Content alignment (default: 'left')
  scrollOffset?: number; // Starting line for scrollable content (default: 0)

  // Fill
  fill?: boolean; // Fill panel background (default: false)
  fillChar?: string; // Fill character when fill is true

  // Layout
  padding?: number; // Inner padding (default: 0)
}
```

## Examples

### Simple Panel with Title

```typescript
renderer.panel(10, 5, 40, 12, {
  title: "Character Stats",
});
```

Output:

```
          ┌─ Character Stats ────────────┐
          │                              │
          │                              │
          │                              │
          │                              │
          │                              │
          │                              │
          │                              │
          │                              │
          │                              │
          └──────────────────────────────┘
```

### Panel with Content

```typescript
renderer.panel(10, 5, 30, 10, {
  title: "Items",
  content: ["Iron Sword", "Wooden Shield", "Health Potion x3", "Magic Scroll"],
});
```

### Scrollable Content

```typescript
const allItems = [
  "Sword",
  "Shield",
  "Helmet",
  "Armor",
  "Boots",
  "Potion",
  "Scroll",
  "Ring",
  "Amulet",
  "Gem",
];

// Show items 3-8
renderer.panel(10, 5, 25, 8, {
  title: "Inventory",
  content: allItems,
  scrollOffset: 3, // Start from 4th item
});
```

### Panel with Padding

```typescript
renderer.panel(10, 5, 35, 12, {
  title: "Message",
  content: ["You found a treasure chest!", "", "It contains 100 gold."],
  padding: 2, // 2-character padding on all sides
});
```

### Centered Title and Content

```typescript
renderer.panel(10, 5, 40, 15, {
  title: "Game Over",
  titleAlign: "center",
  content: ["Final Score: 12,500", "High Score: 15,000", "", "Play Again?"],
  contentAlign: "center",
});
```

### Panel with Footer

```typescript
renderer.panel(10, 5, 50, 18, {
  title: "Help",
  footer: "Press ESC to close",
  content: [
    "Movement: Arrow Keys or WASD",
    "Attack: Space",
    "Inventory: I",
    "Map: M",
  ],
});
```

### Custom Border Style

```typescript
renderer.panel(10, 5, 35, 10, {
  title: "Warning!",
  style: "double",
  fg: "red",
  content: ["Low health detected!", "Find cover immediately."],
});
```

### Filled Panel

```typescript
renderer.panel(10, 5, 30, 12, {
  title: "Status",
  fill: true,
  fillChar: "░",
  bg: "blue",
  content: ["HP: 75/100", "MP: 50/50"],
});
```

### Game UI Examples

#### Dialog Box

```typescript
renderer.panel(15, 8, 50, 10, {
  title: "NPC",
  titleAlign: "center",
  content: [
    "Greetings, traveler!",
    "",
    "I have a quest for you...",
    "",
    "Will you help me?",
  ],
  contentAlign: "center",
  footer: "[Y] Yes  [N] No",
  style: "rounded",
});
```

#### Inventory Screen

```typescript
const items = [
  "1. Iron Sword (ATK +10)",
  "2. Leather Armor (DEF +5)",
  "3. Health Potion x5",
  "4. Mana Potion x3",
  "5. Teleport Scroll",
  "6. Lockpick x10",
  "7. Rope (50ft)",
  "8. Torch x3",
];

renderer.panel(5, 3, 40, 20, {
  title: "Inventory (8/20)",
  content: items,
  padding: 1,
  style: "heavy",
  footer: "[E] Use  [D] Drop",
});
```

#### Character Sheet

```typescript
renderer.panel(20, 5, 40, 16, {
  title: "Character: Aragorn",
  titleAlign: "center",
  content: [
    "Class: Ranger",
    "Level: 15",
    "",
    "STR: 18  (+4)",
    "DEX: 16  (+3)",
    "CON: 14  (+2)",
    "INT: 12  (+1)",
    "WIS: 14  (+2)",
    "CHA: 13  (+1)",
    "",
    "HP: 95/120",
    "XP: 45,000 / 55,000",
  ],
  padding: 2,
  style: "double",
});
```

#### Message Log

```typescript
const messages = [
  "You hit the goblin for 8 damage.",
  "The goblin hits you for 3 damage.",
  "You defeated the goblin!",
  "You gained 25 XP.",
  "You found 10 gold.",
];

renderer.panel(2, 18, 50, 8, {
  title: "Combat Log",
  content: messages,
  scrollOffset: Math.max(0, messages.length - 4), // Show last 4
  style: "single",
  fg: "gray",
});
```

## Dynamic Scrolling

```typescript
class ScrollablePanel {
  private offset = 0;
  private content: string[];

  constructor(content: string[]) {
    this.content = content;
  }

  scrollDown() {
    const maxOffset = Math.max(0, this.content.length - 10);
    this.offset = Math.min(this.offset + 1, maxOffset);
  }

  scrollUp() {
    this.offset = Math.max(0, this.offset - 1);
  }

  render(renderer: Renderer) {
    renderer.panel(10, 5, 40, 12, {
      title: `Items (${this.offset + 1}-${Math.min(this.offset + 10, this.content.length)})`,
      content: this.content,
      scrollOffset: this.offset,
    });
  }
}
```

## Combining with Other Helpers

Panels integrate seamlessly with other renderer features:

```typescript
// Panel with progress bars
renderer.panel(10, 5, 45, 12, {
  title: "Status",
  padding: 1,
});

renderer.drawText(12, 7, "Health:");
renderer.progressBar(21, 7, 20, 0.75, { fillFg: "green", border: true });

renderer.drawText(12, 9, "Mana:");
renderer.progressBar(21, 9, 20, 0.5, { fillFg: "blue", border: true });
```

## Performance Considerations

Panels are lightweight and efficient:

- Uses the same double-buffering as other primitives
- Content is clipped to visible area automatically
- Scrolling only renders visible lines
- Safe to update every frame

## Layering

Panels work with the layer system:

```typescript
// Background layer
renderer.layer("background");
// ... game world

// UI layer
renderer.layer("ui");
renderer.panel(10, 5, 40, 15, {
  title: "Menu",
  content: ["New Game", "Load Game", "Quit"],
});

renderer.layerOrder(["background", "ui"]);
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type { PanelOptions } from "@shaisrc/tty";

const options: PanelOptions = {
  title: "Test",
  content: ["Line 1", "Line 2"],
  style: "double",
  padding: 1,
};

renderer.panel(10, 5, 30, 10, options);
```

## Tips

1. **Content length**: Panel automatically handles content longer than height with scrollOffset
2. **Padding**: Use padding for better readability, especially with dense content
3. **Title alignment**: Center titles for modal dialogs, left-align for information panels
4. **Footer use**: Great for showing available controls or page numbers
5. **Scroll indicators**: Add "▲" and "▼" to footer to show scrollability
6. **Empty content**: Perfectly valid - creates an empty bordered area
7. **Dynamic sizing**: Calculate width/height based on content for auto-sizing
