# Text Alignment

Text alignment helpers make it easy to position text horizontally within the render area.

## Methods

### `centerText(y, text, options?, startX?, width?): this`

Draw text centered horizontally.

```typescript
renderer.centerText(10, "Hello, World!", { fg: "yellow" });
```

**Parameters:**

- `y`: Y coordinate
- `text`: Text to draw
- `options`: Text styling options (optional)
- `startX`: Starting X for centering calculation (default: 0)
- `width`: Width to center within (default: renderer width)

**Returns:** The renderer instance for chaining

### `rightAlign(y, text, options?, startX?, width?): this`

Draw text aligned to the right.

```typescript
renderer.rightAlign(10, "Score: 1000", { fg: "cyan" });
```

**Parameters:**

- `y`: Y coordinate
- `text`: Text to draw
- `options`: Text styling options (optional)
- `startX`: Starting X for alignment calculation (default: 0)
- `width`: Width to align within (default: renderer width)

**Returns:** The renderer instance for chaining

### `leftAlign(y, text, options?, startX?): this`

Draw text aligned to the left.

```typescript
renderer.leftAlign(10, "Player Name", { fg: "green" });
```

**Parameters:**

- `y`: Y coordinate
- `text`: Text to draw
- `options`: Text styling options (optional)
- `startX`: Starting X position (default: 0)

**Returns:** The renderer instance for chaining

### `alignText(y, text, options?, startX?, width?): this`

Draw text with alignment specified in options.

```typescript
renderer.alignText(10, "Text", { align: "center", fg: "yellow" });
```

**Parameters:**

- `y`: Y coordinate
- `text`: Text to draw
- `options`: Text styling options including `align` property
- `startX`: Starting X for alignment calculation (default: 0)
- `width`: Width to align within (default: renderer width)

**Returns:** The renderer instance for chaining

## Usage Examples

### Title Screen

```typescript
renderer
  .clear()
  .centerText(5, "═══════════════════", { fg: "cyan" })
  .centerText(6, "GAME TITLE", { fg: "yellow" })
  .centerText(7, "═══════════════════", { fg: "cyan" })
  .centerText(10, "Press SPACE to start", { fg: "white" })
  .centerText(22, "v1.0.0", { fg: "gray" })
  .render();
```

### Stats Display

```typescript
const y = 2;

renderer
  .leftAlign(y, "HP:", { fg: "white" }, 5)
  .rightAlign(y, "100/100", { fg: "green" }, 5, 30)
  .leftAlign(y + 1, "MP:", { fg: "white" }, 5)
  .rightAlign(y + 1, "50/50", { fg: "blue" }, 5, 30)
  .leftAlign(y + 2, "Gold:", { fg: "white" }, 5)
  .rightAlign(y + 2, "1000", { fg: "yellow" }, 5, 30)
  .render();
```

### Scoreboard

```typescript
renderer
  .centerText(2, "HIGH SCORES", { fg: "yellow" })
  .centerText(3, "─".repeat(40), { fg: "white" });

const scores = [
  { name: "ALICE", score: 50000 },
  { name: "BOB", score: 45000 },
  { name: "CHARLIE", score: 40000 },
];

scores.forEach((entry, i) => {
  const y = 5 + i;
  const centerX = Math.floor(renderer.width / 2);

  renderer
    .leftAlign(y, `${i + 1}. ${entry.name}`, { fg: "white" }, centerX - 15)
    .rightAlign(y, entry.score.toString(), { fg: "cyan" }, centerX - 15, 30);
});

renderer.render();
```

### Menu System

```typescript
const menuItems = ["New Game", "Continue", "Settings", "Quit"];
const selected = 0;

renderer.clear().centerText(8, "MAIN MENU", { fg: "yellow" });

menuItems.forEach((item, i) => {
  const y = 10 + i;
  const isSelected = i === selected;
  const text = isSelected ? `> ${item} <` : item;
  const fg = isSelected ? "yellow" : "white";

  renderer.centerText(y, text, { fg });
});

renderer.render();
```

### Dialog Box

```typescript
function showDialog(title: string, message: string) {
  const lines = message.split("\n");
  const maxLen = Math.max(title.length, ...lines.map((l) => l.length));
  const boxWidth = maxLen + 6;
  const boxHeight = lines.length + 6;
  const boxX = Math.floor((renderer.width - boxWidth) / 2);
  const boxY = Math.floor((renderer.height - boxHeight) / 2);

  renderer
    .box(boxX, boxY, boxWidth, boxHeight, {
      style: "double",
      fill: true,
      fg: "cyan",
    })
    .centerText(boxY + 1, title, { fg: "yellow" }, boxX, boxWidth)
    .centerText(
      boxY + 2,
      "─".repeat(boxWidth - 4),
      { fg: "white" },
      boxX,
      boxWidth,
    );

  lines.forEach((line, i) => {
    renderer.centerText(boxY + 4 + i, line, { fg: "white" }, boxX, boxWidth);
  });

  renderer.render();
}

showDialog("Warning", "Are you sure you want to\nquit the game?");
```

### HUD Layout

```typescript
function drawHUD(player: Player) {
  // Top bar
  renderer.fill(0, 0, renderer.width, 1, " ", null, "blue");

  renderer
    .leftAlign(0, `HP: ${player.hp}`, { fg: "white", bg: "blue" }, 2)
    .centerText(0, `Level ${player.level}`, { fg: "yellow", bg: "blue" })
    .rightAlign(
      0,
      `Gold: ${player.gold}`,
      { fg: "yellow", bg: "blue" },
      0,
      renderer.width - 2,
    );

  // Bottom bar
  renderer.fill(0, renderer.height - 1, renderer.width, 1, " ", null, "black");

  renderer
    .leftAlign(
      renderer.height - 1,
      player.location,
      { fg: "gray", bg: "black" },
      2,
    )
    .rightAlign(
      renderer.height - 1,
      `[${player.x},${player.y}]`,
      { fg: "gray", bg: "black" },
      0,
      renderer.width - 2,
    );

  renderer.render();
}
```

### Column Layout

```typescript
// Three column layout
const col1X = 0;
const col2X = 27;
const col3X = 54;
const colWidth = 26;

renderer
  .clear()
  // Column 1 - Left aligned
  .border(col1X, 0, colWidth, renderer.height, { style: "single" })
  .leftAlign(1, "Column 1", { fg: "cyan" }, col1X + 2)
  .leftAlign(3, "Left aligned text", { fg: "white" }, col1X + 2)
  .leftAlign(4, "More text here", { fg: "white" }, col1X + 2)

  // Column 2 - Center aligned
  .border(col2X, 0, colWidth, renderer.height, { style: "single" })
  .centerText(1, "Column 2", { fg: "cyan" }, col2X, colWidth)
  .centerText(3, "Centered text", { fg: "white" }, col2X, colWidth)
  .centerText(4, "More text", { fg: "white" }, col2X, colWidth)

  // Column 3 - Right aligned
  .border(col3X, 0, colWidth, renderer.height, { style: "single" })
  .rightAlign(1, "Column 3", { fg: "cyan" }, col3X, colWidth)
  .rightAlign(3, "Right aligned", { fg: "white" }, col3X, colWidth)
  .rightAlign(4, "More text", { fg: "white" }, col3X, colWidth)
  .render();
```

### Progress Bar with Label

```typescript
function drawProgressBar(y: number, label: string, value: number, max: number) {
  const barWidth = 30;
  const barX = Math.floor((renderer.width - barWidth) / 2);
  const percent = value / max;
  const filled = Math.floor(barWidth * percent);

  // Label above bar (centered)
  renderer.centerText(y - 1, label, { fg: "white" });

  // Progress bar
  renderer
    .border(barX - 1, y, barWidth + 2, 3, { style: "single", fg: "white" })
    .rect(barX, y + 1, filled, 1, "█", "green", null)
    .rect(barX + filled, y + 1, barWidth - filled, 1, "░", "gray", null);

  // Percentage (centered)
  const percentText = `${Math.floor(percent * 100)}%`;
  renderer.centerText(y + 1, percentText, { fg: "yellow" }, barX, barWidth);

  renderer.render();
}

drawProgressBar(10, "Loading...", 7, 10);
```

### Table Layout

```typescript
const data = [
  { name: "Sword", damage: "10", weight: "5" },
  { name: "Shield", damage: "0", weight: "8" },
  { name: "Potion", damage: "0", weight: "1" },
];

const y = 5;
const col1X = 10;
const col2X = 30;
const col3X = 50;

// Headers
renderer
  .leftAlign(y, "Item", { fg: "yellow" }, col1X)
  .centerText(y, "Damage", { fg: "yellow" }, col2X, 15)
  .rightAlign(y, "Weight", { fg: "yellow" }, col3X, 15);

// Separator
renderer.centerText(y + 1, "─".repeat(60), { fg: "white" }, 10, 60);

// Data rows
data.forEach((row, i) => {
  const rowY = y + 2 + i;
  renderer
    .leftAlign(rowY, row.name, { fg: "white" }, col1X)
    .centerText(rowY, row.damage, { fg: "white" }, col2X, 15)
    .rightAlign(rowY, row.weight, { fg: "white" }, col3X, 15);
});

renderer.render();
```

### Using alignText

```typescript
const config = {
  title: { text: "Game Title", align: "center" as const },
  subtitle: { text: "By Developer", align: "center" as const },
  copyright: { text: "© 2026", align: "right" as const },
  version: { text: "v1.0.0", align: "left" as const },
};

renderer
  .alignText(5, config.title.text, { align: config.title.align, fg: "yellow" })
  .alignText(6, config.subtitle.text, {
    align: config.subtitle.align,
    fg: "white",
  })
  .alignText(23, config.version.text, {
    align: config.version.align,
    fg: "gray",
  })
  .alignText(23, config.copyright.text, {
    align: config.copyright.align,
    fg: "gray",
  })
  .render();
```

## Alignment Within Boxes

You can use the `startX` and `width` parameters to align text within a specific box:

```typescript
const boxX = 10;
const boxY = 5;
const boxW = 40;
const boxH = 10;

renderer
  .box(boxX, boxY, boxW, boxH, { style: "double", fg: "cyan" })
  // Center within the box
  .centerText(boxY + 1, "Title", { fg: "yellow" }, boxX, boxW)
  // Left align within the box (with padding)
  .leftAlign(boxY + 3, "Item 1", { fg: "white" }, boxX + 2)
  .leftAlign(boxY + 4, "Item 2", { fg: "white" }, boxX + 2)
  // Right align within the box (with padding)
  .rightAlign(boxY + 3, "100", { fg: "green" }, boxX, boxW - 2)
  .rightAlign(boxY + 4, "50", { fg: "green" }, boxX, boxW - 2)
  .render();
```

## Performance Tips

Alignment methods are lightweight and have minimal overhead:

```typescript
// All equivalent in performance
renderer.centerText(10, "Hello");

const x = Math.floor((renderer.width - 5) / 2);
renderer.drawText(x, 10, "Hello");
```

## Common Patterns

### Responsive Centering

```typescript
function drawCenteredPanel(content: string[]) {
  const maxLen = Math.max(...content.map((l) => l.length));
  const panelW = maxLen + 4;
  const panelH = content.length + 4;
  const panelX = Math.floor((renderer.width - panelW) / 2);
  const panelY = Math.floor((renderer.height - panelH) / 2);

  renderer.box(panelX, panelY, panelW, panelH, { style: "double" });

  content.forEach((line, i) => {
    renderer.centerText(panelY + 2 + i, line, {}, panelX, panelW);
  });

  renderer.render();
}
```

### Justified Text (Left + Right)

```typescript
function drawJustified(y: number, left: string, right: string) {
  renderer
    .leftAlign(y, left, { fg: "white" })
    .rightAlign(y, right, { fg: "cyan" });
}

drawJustified(5, "Player Name", "Level 10");
drawJustified(6, "Health", "100/100");
```

## Box Alignment

Box alignment helpers make it easy to position boxes at specific anchor points within the viewport.

### `alignBox(anchor, width, height, offsetX?, offsetY?): { x, y }`

Calculate the position for an aligned box.

```typescript
const pos = renderer.alignBox("center", 30, 10);
renderer.box(pos.x, pos.y, 30, 10, { style: "double" });
```

**Parameters:**

- `anchor`: Alignment anchor point
  - `'center'` - Center of viewport
  - `'top'`, `'bottom'`, `'left'`, `'right'` - Edge-centered
  - `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` - Corners
- `width`: Box width
- `height`: Box height
- `offsetX`: X offset from anchor position (default: 0)
- `offsetY`: Y offset from anchor position (default: 0)

**Returns:** Object with `x` and `y` coordinates

### `centerBox(width, height, options?, offsetX?, offsetY?): this`

Draw a centered box in one call.

```typescript
renderer.centerBox(40, 15, { style: "double", fill: true, fg: "cyan" });
```

**Parameters:**

- `width`: Box width
- `height`: Box height
- `options`: Box styling options (optional)
- `offsetX`: X offset from center (default: 0)
- `offsetY`: Y offset from center (default: 0)

**Returns:** The renderer instance for chaining

### Box Alignment Examples

#### Centered Dialog

```typescript
renderer
  .centerBox(40, 12, { style: "double", fill: true })
  .centerText(10, "GAME OVER", { fg: "red" })
  .centerText(12, "Press any key to continue", { fg: "white" })
  .render();
```

#### Top-Right Notification

```typescript
// Position with 2-char margin from right, 1-char from top
const pos = renderer.alignBox("top-right", 20, 5, -2, 1);
renderer
  .box(pos.x, pos.y, 20, 5, { style: "single", fg: "yellow" })
  .drawText(pos.x + 2, pos.y + 1, "New Quest!", { fg: "yellow" })
  .drawText(pos.x + 2, pos.y + 2, "Find the sword", { fg: "white" })
  .render();
```

#### Bottom Status Bar

```typescript
const pos = renderer.alignBox("bottom", 60, 3);
renderer
  .box(pos.x, pos.y, 60, 3, { style: "single" })
  .drawText(pos.x + 2, pos.y + 1, "HP: 75/100  MP: 50/50  Gold: 1234")
  .render();
```

#### Corner Indicators

```typescript
// Top-left: Level
const tlPos = renderer.alignBox("top-left", 12, 3, 1, 1);
renderer
  .box(tlPos.x, tlPos.y, 12, 3)
  .drawText(tlPos.x + 2, tlPos.y + 1, "Lv. 10");

// Top-right: Timer
const trPos = renderer.alignBox("top-right", 12, 3, -1, 1);
renderer
  .box(trPos.x, trPos.y, 12, 3)
  .drawText(trPos.x + 2, trPos.y + 1, "03:45");

// Bottom-right: Minimap placeholder
const brPos = renderer.alignBox("bottom-right", 15, 8, -1, -1);
renderer.box(brPos.x, brPos.y, 15, 8, { style: "double" });

renderer.render();
```

#### Dynamic Dialog Positioning

```typescript
function showDialog(title: string, message: string, anchor = "center") {
  const width = Math.max(title.length, message.length) + 4;
  const height = 6;

  const pos = renderer.alignBox(anchor, width, height);

  renderer
    .box(pos.x, pos.y, width, height, { style: "double", fill: true })
    .centerText(pos.y + 1, title, { fg: "yellow" }, pos.x, width)
    .centerText(pos.y + 3, message, { fg: "white" }, pos.x, width)
    .render();
}

// Show centered
showDialog("Warning", "Low health!");

// Show at bottom
showDialog("Saved", "Progress saved", "bottom");
```

## Next Steps

- See [Renderer API](./renderer-api.md) for core drawing methods
- See [Box Drawing](./box-drawing.md) for creating panels and frames
- See [Layer System](./layer-system.md) for multi-layer rendering
