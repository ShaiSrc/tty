# Line Drawing

The line drawing functionality provides a method for drawing lines between two points using Bresenham's line algorithm.

## Method

### `drawLine(x1, y1, x2, y2, char, options?): this`

Draw a line from one point to another using Bresenham's line algorithm.

```typescript
renderer.drawLine(0, 0, 10, 10, "/", { fg: "cyan" });
```

**Parameters:**

- `x1`: Starting X coordinate
- `y1`: Starting Y coordinate
- `x2`: Ending X coordinate
- `y2`: Ending Y coordinate
- `char`: Character to draw the line with
- `options`: Line styling options (TextOptions)

**TextOptions:**

```typescript
interface TextOptions {
  fg?: Color; // Foreground color
  bg?: Color; // Background color
}
```

**Returns:** The renderer instance for chaining

## Usage Examples

### Horizontal Line

```typescript
renderer.drawLine(0, 10, 79, 10, "─", { fg: "white" });
```

### Vertical Line

```typescript
renderer.drawLine(40, 0, 40, 23, "│", { fg: "white" });
```

### Diagonal Lines (X Pattern)

```typescript
renderer
  .drawLine(0, 0, 10, 10, "/", { fg: "cyan" })
  .drawLine(10, 0, 0, 10, "\\", { fg: "cyan" });
```

### Colored Lines

```typescript
renderer
  .drawLine(0, 5, 20, 5, "═", { fg: "yellow", bg: "blue" })
  .drawLine(0, 10, 20, 15, "│", { fg: "green" });
```

### Creating Connections

```typescript
// Connect two boxes
renderer
  .box(5, 5, 10, 5, { style: "single" })
  .box(30, 10, 10, 5, { style: "single" })
  .drawLine(14, 7, 30, 12, "─", { fg: "gray" });
```

### Drawing Borders

```typescript
// Draw a custom frame using lines
renderer
  .drawLine(0, 0, 79, 0, "═", { fg: "cyan" }) // Top
  .drawLine(0, 23, 79, 23, "═", { fg: "cyan" }) // Bottom
  .drawLine(0, 0, 0, 23, "║", { fg: "cyan" }) // Left
  .drawLine(79, 0, 79, 23, "║", { fg: "cyan" }); // Right
```

### Creating Diagrams

```typescript
// ASCII flowchart connector
renderer
  .box(10, 5, 15, 3, { style: "single" })
  .drawLine(17, 6, 25, 6, "─", { fg: "gray" }) // Horizontal connector
  .drawLine(25, 6, 25, 10, "│", { fg: "gray" }) // Vertical drop
  .box(20, 10, 15, 3, { style: "single" });
```

### Game Graphics

```typescript
// Draw a simple sword
renderer
  .drawLine(10, 5, 10, 15, "│", { fg: "gray" }) // Blade
  .drawLine(9, 15, 11, 15, "─", { fg: "yellow" }) // Guard
  .drawLine(10, 16, 10, 18, "│", { fg: "brown" }); // Handle
```

### Grid Creation

```typescript
// Create a grid pattern
for (let x = 0; x <= 80; x += 10) {
  renderer.drawLine(x, 0, x, 24, "│", { fg: "gray" });
}

for (let y = 0; y <= 24; y += 5) {
  renderer.drawLine(0, y, 80, y, "─", { fg: "gray" });
}
```

### Animated Lines

```typescript
let angle = 0;

function animate() {
  const centerX = 40;
  const centerY = 12;
  const radius = 10;

  const endX = Math.floor(centerX + Math.cos(angle) * radius);
  const endY = Math.floor(centerY + Math.sin(angle) * radius);

  renderer
    .clear()
    .drawLine(centerX, centerY, endX, endY, "*", { fg: "yellow" })
    .render();

  angle += 0.1;
  requestAnimationFrame(animate);
}

animate();
```

## Algorithm Details

The `drawLine` method uses **Bresenham's line algorithm**, which:

- Works for lines at any angle
- Uses only integer arithmetic (fast)
- Produces continuous lines with no gaps
- Handles all octants correctly (horizontal, vertical, diagonal, and any angle)

### Performance Characteristics

- **Time Complexity**: O(max(dx, dy)) where dx and dy are the differences in coordinates
- **Space Complexity**: O(1) - no additional memory allocations
- **Speed**: Very fast, suitable for real-time rendering

## Tips

1. **Line Characters**: Use appropriate Unicode characters for better visuals:
   - Horizontal: `─`, `═`, `-`
   - Vertical: `│`, `║`, `|`
   - Diagonal: `/`, `\`, `╱`, `╲`

2. **Combining with Other Primitives**: Lines work great with boxes, text, and fills to create complex UI elements

3. **Performance**: Drawing many lines is fast due to the efficient Bresenham algorithm

4. **Chainability**: Like all renderer methods, `drawLine` returns `this` for method chaining

## Common Patterns

### Border Drawing

```typescript
const drawBorder = (x: number, y: number, w: number, h: number) => {
  renderer
    .drawLine(x, y, x + w, y, "─") // Top
    .drawLine(x, y + h, x + w, y + h, "─") // Bottom
    .drawLine(x, y, x, y + h, "│") // Left
    .drawLine(x + w, y, x + w, y + h, "│"); // Right
};
```

### Star Pattern

```typescript
const drawStar = (cx: number, cy: number, size: number) => {
  renderer
    .drawLine(cx, cy - size, cx, cy + size, "|") // Vertical
    .drawLine(cx - size, cy, cx + size, cy, "-") // Horizontal
    .drawLine(cx - size, cy - size, cx + size, cy + size, "/") // Diagonal 1
    .drawLine(cx + size, cy - size, cx - size, cy + size, "\\"); // Diagonal 2
};
```

### Arrow

```typescript
const drawArrow = (x: number, y: number, length: number, dir: "right") => {
  renderer
    .drawLine(x, y, x + length, y, "─")
    .setChar(x + length, y - 1, "/")
    .setChar(x + length, y + 1, "\\");
};
```

## See Also

- [Box Drawing](./box-drawing.md) - For bordered boxes and frames
- [Renderer API](./renderer-api.md) - Complete renderer reference
- [Core Concepts](./core-concepts.md) - Understanding the rendering system
