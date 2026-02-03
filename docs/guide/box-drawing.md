# Box Drawing

The box drawing functionality provides methods for creating bordered boxes, frames, and filled rectangles with various styles.

## Methods

### `box(x, y, width, height, options?): this`

Draw a box with borders and optional fill.

```typescript
renderer.box(10, 5, 30, 10, { style: "double", fg: "cyan" });
```

**Parameters:**

- `x`: Starting X coordinate
- `y`: Starting Y coordinate
- `width`: Width of the box
- `height`: Height of the box
- `options`: Box styling options

**BoxOptions:**

```typescript
interface BoxOptions {
  style?: BoxStyle | BorderChars; // Border style
  fg?: Color; // Foreground color
  bg?: Color; // Background color
  fill?: boolean; // Fill the interior
  fillChar?: string; // Character to fill with (default: ' ')
  shadow?: boolean; // Add shadow effect
  padding?: number; // Inner padding (not yet implemented)
  title?: string; // Optional title in top border
  titleFg?: Color; // Title foreground color
  titleAlign?: "left" | "center" | "right"; // Title alignment (default: 'center')
}
```

**Returns:** The renderer instance for chaining

### `border(x, y, width, height, options?): this`

Draw only the border of a box (no fill). Equivalent to `box()` with `fill: false`.

```typescript
renderer.border(10, 5, 30, 10, { style: "single", fg: "white" });
```

**Returns:** The renderer instance for chaining

### `rect(x, y, width, height, char?, fg?, bg?): this`

Draw a filled rectangle.

```typescript
renderer.rect(10, 5, 20, 10, "█", null, "blue");
```

**Parameters:**

- `x`: Starting X coordinate
- `y`: Starting Y coordinate
- `width`: Width of the rectangle
- `height`: Height of the rectangle
- `char`: Character to fill with (default: ' ')
- `fg`: Foreground color (optional)
- `bg`: Background color (optional)

**Returns:** The renderer instance for chaining

## Box Styles

### Predefined Styles

#### `'single'` (default)

```
┌─────┐
│     │
└─────┘
```

#### `'double'`

```
╔═════╗
║     ║
╚═════╝
```

#### `'rounded'`

```
╭─────╮
│     │
╰─────╯
```

#### `'heavy'`

```
┏━━━━━┓
┃     ┃
┗━━━━━┛
```

#### `'ascii'`

```
+-----+
|     |
+-----+
```

### Custom Border Characters

You can define custom border characters:

```typescript
renderer.box(10, 5, 20, 10, {
  style: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
  fg: "cyan",
});
```

## Usage Examples

### Simple Box

```typescript
renderer.clear().box(10, 5, 30, 10, { style: "single" }).render();
```

### Box with Fill

```typescript
renderer.box(10, 5, 30, 10, {
  style: "double",
  fill: true,
  fillChar: " ",
  fg: "yellow",
  bg: "blue",
});
```

### Multiple Boxes

```typescript
renderer
  .clear()
  .box(5, 2, 20, 8, { style: "double", fg: "cyan" })
  .box(30, 2, 20, 8, { style: "single", fg: "green" })
  .box(55, 2, 20, 8, { style: "rounded", fg: "magenta" })
  .render();
```

### Panel with Title

```typescript
// New way: Use built-in title support
renderer.box(10, 5, 40, 15, {
  style: "double",
  fg: "cyan",
  title: "Game Stats",
  titleFg: "yellow",
});

// Draw content
renderer.drawText(12, 7, "Health: 100", { fg: "green" });
renderer.drawText(12, 8, "Mana:   50", { fg: "blue" });
renderer.drawText(12, 9, "Gold:   1000", { fg: "yellow" });

renderer.render();
```

### Titled Panels with Different Alignments

```typescript
// Left-aligned title
renderer.box(5, 2, 25, 8, {
  style: "single",
  fg: "white",
  title: "Inventory",
  titleAlign: "left",
});

// Center-aligned title (default)
renderer.box(35, 2, 25, 8, {
  style: "double",
  fg: "cyan",
  title: "Stats",
  // titleAlign: 'center' is default
});

// Right-aligned title
renderer.box(65, 2, 25, 8, {
  style: "rounded",
  fg: "green",
  title: "Quest Log",
  titleAlign: "right",
  titleFg: "yellow",
});

renderer.render();
```

### Dialog Box

```typescript
function drawDialog(message: string) {
  const lines = message.split("\n");
  const maxWidth = Math.max(...lines.map((l) => l.length));
  const width = maxWidth + 4; // Add padding
  const height = lines.length + 4;

  const x = Math.floor((renderer.width - width) / 2);
  const y = Math.floor((renderer.height - height) / 2);

  renderer.box(x, y, width, height, {
    style: "double",
    fill: true,
    fg: "white",
    bg: "blue",
  });

  // Draw message
  lines.forEach((line, i) => {
    renderer.drawText(x + 2, y + 2 + i, line, { fg: "white" });
  });

  renderer.render();
}

drawDialog("Are you sure?\n\nPress Y to confirm\nPress N to cancel");
```

### UI Frame

```typescript
// Main game area
renderer.box(0, 0, 60, 24, { style: "double", fg: "white" });

// Stats panel
renderer.box(61, 0, 19, 10, { style: "single", fg: "cyan" });

// Inventory panel
renderer.box(61, 11, 19, 13, { style: "single", fg: "green" });

renderer.render();
```

### Progress Bar Container

```typescript
// Draw container box
renderer.box(10, 10, 42, 3, { style: "single", fg: "white" });

// Fill with progress
const progress = 0.7; // 70%
const barWidth = 40;
const filled = Math.floor(barWidth * progress);

renderer.rect(11, 11, filled, 1, "█", "green", null);
renderer.rect(11 + filled, 11, barWidth - filled, 1, "░", "gray", null);

renderer.render();
```

### Nested Boxes

```typescript
// Outer box
renderer.box(5, 5, 50, 20, { style: "double", fg: "white" });

// Inner boxes
renderer.box(10, 8, 20, 6, { style: "single", fg: "cyan" });
renderer.box(35, 8, 15, 6, { style: "single", fg: "green" });
renderer.box(10, 16, 40, 6, { style: "single", fg: "yellow" });

renderer.render();
```

### Filled Rectangles

```typescript
// Background
renderer.rect(0, 0, 80, 24, " ", null, "black");

// Colored regions
renderer.rect(10, 5, 20, 10, " ", null, "blue");
renderer.rect(35, 5, 20, 10, "█", "red", null);
renderer.rect(60, 5, 15, 10, "▒", "green", null);

renderer.render();
```

### Menu Box

```typescript
function drawMenu(x: number, y: number, items: string[], selected: number) {
  const maxLen = Math.max(...items.map((i) => i.length));
  const width = maxLen + 4;
  const height = items.length + 2;

  // Draw box
  renderer.box(x, y, width, height, {
    style: "double",
    fg: "cyan",
  });

  // Draw items
  items.forEach((item, i) => {
    const fg = i === selected ? "yellow" : "white";
    const prefix = i === selected ? "> " : "  ";
    renderer.drawText(x + 2, y + 1 + i, prefix + item, { fg });
  });
}

drawMenu(20, 10, ["New Game", "Load Game", "Settings", "Quit"], 0);
renderer.render();
```

### Box with Shadow

Add a subtle shadow effect to give boxes a 3D appearance:

```typescript
// Simple shadow box
renderer.box(10, 5, 30, 10, {
  style: "double",
  fg: "cyan",
  shadow: true,
});

// Filled box with shadow
renderer.box(45, 5, 25, 8, {
  style: "single",
  fg: "white",
  bg: "blue",
  fill: true,
  shadow: true,
});

renderer.render();
```

**Shadow Details:**

- Uses "░" (light shade) character
- Drawn in gray color
- Appears on right and bottom edges (1 character offset)
- Works with all box styles and fill options
- Shadow may clip if box is near canvas edge

**Example with multiple shadowed boxes:**

```typescript
// Layered UI elements with shadows
renderer
  .box(5, 3, 30, 12, {
    style: "double",
    fg: "white",
    fill: true,
    shadow: true,
  })
  .box(40, 8, 25, 10, {
    style: "single",
    fg: "cyan",
    fill: true,
    shadow: true,
  })
  .box(20, 12, 35, 8, {
    style: "rounded",
    fg: "yellow",
    shadow: true,
  })
  .render();
```

## Edge Cases

### Minimum Size (1x1)

```typescript
renderer.box(10, 10, 1, 1, { style: "single" });
// Draws: ┌
```

### Minimum Width/Height (2x2)

```typescript
renderer.box(10, 10, 2, 2, { style: "single" });
// Draws:
// ┌┐
// └┘
```

### Vertical Line (width=1, height>1)

```typescript
renderer.box(10, 10, 1, 5, { style: "single" });
// Draws:
// ┌
// │
// │
// │
// └
```

### Horizontal Line (width>1, height=1)

```typescript
renderer.box(10, 10, 5, 1, { style: "single" });
// Draws: ┌──┐
```

## Performance Tips

### Efficient Box Updates

```typescript
// Instead of redrawing everything
renderer.clear();
renderer.box(10, 10, 30, 10);
renderer.render();

// Only update what changed
if (boxMoved) {
  // Clear old position
  renderer.rect(oldX, oldY, 30, 10, " ");
  // Draw new position
  renderer.box(newX, newY, 30, 10);
  renderer.render();
}
```

### Batch Multiple Boxes

```typescript
// Good: Chain operations
renderer
  .clear()
  .box(5, 5, 20, 10, { style: "single" })
  .box(30, 5, 20, 10, { style: "double" })
  .box(55, 5, 20, 10, { style: "rounded" })
  .render();

// Works but less elegant
renderer.clear();
renderer.box(5, 5, 20, 10, { style: "single" });
renderer.box(30, 5, 20, 10, { style: "double" });
renderer.box(55, 5, 20, 10, { style: "rounded" });
renderer.render();
```

## Unicode Support

The box drawing characters use Unicode box-drawing characters. Ensure your:

- Font supports these characters (most monospace fonts do)
- Your renderer outputs Unicode correctly
- Text encoding is UTF-8

If Unicode is unavailable, use the `'ascii'` style:

```typescript
renderer.box(10, 10, 30, 10, { style: "ascii" });
```

## Integration with Other Methods

### Box + Text

```typescript
renderer
  .box(10, 5, 40, 10, { style: "double", fg: "cyan" })
  .drawText(12, 6, "Title", { fg: "yellow" })
  .drawText(12, 8, "Content line 1", { fg: "white" })
  .drawText(12, 9, "Content line 2", { fg: "white" })
  .render();
```

### Box + Fill + Text

```typescript
renderer
  .box(10, 5, 40, 10, {
    style: "double",
    fill: true,
    fillChar: " ",
    fg: "white",
    bg: "blue",
  })
  .drawText(15, 8, "Centered Text", { fg: "yellow", bg: "blue" })
  .render();
```

## Common Patterns

### Window/Panel

```typescript
class Panel {
  constructor(
    private renderer: Renderer,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {}

  draw(title: string, content: string[]) {
    this.renderer.box(this.x, this.y, this.width, this.height, {
      style: "double",
      fg: "cyan",
    });

    if (title) {
      this.renderer.drawText(this.x + 2, this.y, title, { fg: "yellow" });
    }

    content.forEach((line, i) => {
      this.renderer.drawText(this.x + 2, this.y + 2 + i, line);
    });
  }
}

const panel = new Panel(renderer, 10, 5, 40, 15);
panel.draw("Stats", ["HP: 100", "MP: 50", "Level: 5"]);
renderer.render();
```

## Next Steps

- See [Renderer API](./renderer-api.md) for core drawing methods
- See [Alignment Helpers](./alignment.md) for text positioning
- See [Layer System](./layer-system.md) for multi-layer rendering
