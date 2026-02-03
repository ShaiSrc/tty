# TODO - General Improvements

Sorted by implementation complexity (simplest first).

### 1. Clamp/Boundary Utilities

**Problem**: Manual boundary checking is repetitive and error-prone.

```typescript
if (this.player.x > 1) this.player.x--;
if (this.player.x < GRID_WIDTH - 2) this.player.x++;
```

---

### 2. Direction/Vector Helpers

**Problem**: Direction handling is string-based and requires switch statements.

```typescript
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
```

---

### 3. Better Progress Bar Style Presets

**Problem**: Progress bars require many explicit options for common use cases.

```typescript
renderer.progressBar(x, y, width, hp / maxHp, {
  fillChar: "█",
  emptyChar: "░",
  fillFg: "red",
  emptyFg: "gray",
  label: `${hp}/${maxHp}`,
  labelPosition: "right",
});
```

---

### 4. Simplified Fill/ClearRect API

**Problem**: Clearing rectangular areas requires verbose 7-parameter call.

```typescript
this.renderer.fill(
  panelX + 1,
  panelY + 1,
  panelWidth - 2,
  3,
  " ",
  null,
  "black",
);
```

---

### 5. Batch Drawing API

**Problem**: Drawing multiple cells requires manual loops.

```typescript
for (const segment of this.snake) {
  renderer.setChar(segment.x, segment.y, "O", "green");
}
```

---

### 6. Debug Overlay Helper

**Problem**: No built-in way to show FPS or other debug info.

---

### 7. Named/Tagged Animations

**Problem**: Managing animation IDs is manual and error-prone.

```typescript
private moveAnimId: number | null = null;
if (!this.moveAnimId || !this.renderer.isAnimationActive(this.moveAnimId)) {
  this.moveAnimId = this.renderer.animate({ ... });
}
```

---

### 8. GameLoop Auto-Update Input Managers

**Problem**: Must manually call `gamepad.update()` each frame.

```typescript
private handleGamepadInput(): void {
  this.gamepad.update();  // Manual update required
  if (this.gamepad.isConnected()) { ... }
}
```

---

### 9. Table Helper

**Complexity:** Medium

**Missing from concept.yaml:**

```yaml
helpers:
  table: Tabelle mit Spalten
```

**Problem**: Common UI pattern for stats, inventories, leaderboards. Currently requires manual box/text drawing.

**Desired API:**

```typescript
renderer.table(x, y, {
  headers: ["Name", "HP", "MP"],
  rows: [
    ["Hero", "100", "50"],
    ["Enemy", "75", "25"],
  ],
  columnWidths: [15, 10, 10],
  style: "single",
  headerFg: "yellow",
});
```

---

### 10. Color Theme System

**Complexity:** Medium

**Missing from concept.yaml:**

```yaml
data_structures:
  ColorTheme: vordefinierte Farbschemata
```

**Problem**: No switchable color schemes for accessibility/preferences. Color utilities exist (lerp, brighten, darken) but no theme system.

**Desired API:**

```typescript
defineTheme("dark", {
  primary: "cyan",
  secondary: "blue",
  danger: "red",
  success: "green",
  warning: "yellow",
  text: "white",
  background: "black",
});

renderer.applyTheme("dark");
renderer.box(10, 10, 30, 10, { fg: "theme:primary" });
```

---

### 11. Flow-based Layout for Panels

**Complexity:** Medium

**Missing from concept.yaml:**

```yaml
layout:
  panel().nextLine(): Flow-basiertes Layout
  panel().skip(n): Zeilen überspringen
```

**Problem**: No builder pattern for dynamic panel content. Requires manual Y coordinate tracking.

**Desired API:**

```typescript
const panel = renderer.panel(10, 5, 30, 20);
panel.nextLine("=== Inventory ===");
panel.skip(1);
items.forEach((item) => {
  panel.nextLine(`- ${item.name}`);
});
```

---

### 12. Scrollable List Helper

**Complexity:** Medium

**Missing from concept.yaml:**

```yaml
helpers:
  list: Scrollbare Liste
```

**Problem**: Menu exists but doesn't handle scrolling for long lists. Different from menu (list is for data display with scrolling).

**Desired API:**

```typescript
renderer.list(x, y, items, {
  selected: 15,
  scrollOffset: 10,
  pageSize: 10,
  showScrollbar: true,
  border: true,
});
```

---

### 13. Grid Layout Helper

**Complexity:** Medium-High

**Missing from concept.yaml:**

```yaml
layout:
  grid(cols, rows): Grid-Layout helper
```

**Problem**: Auto-positioning for grid-based UIs. Currently requires manual calculations.

**Desired API:**

```typescript
const grid = renderer.grid(3, 2, {
  cellWidth: 20,
  cellHeight: 10,
  spacing: 2,
  startX: 5,
  startY: 5
})

grid.cell(0, 0).box(...)
grid.cell(1, 0).text(...)
```

---

### 14. DOMTarget (Browser DOM)

**Complexity:** Medium-High

**Missing from concept.yaml:**

```yaml
render_target:
  implementierungen:
    - DOMTarget (Browser mit pre/div elements)
```

**Problem**: Only CanvasTarget implemented. DOMTarget needed for accessibility (screen readers).

**Blocker**: Required for stable `0.1.0` (output-agnostic promise).

**Implementation**: Requires full RenderTarget implementation using pre/div elements with styled characters.

---

## Out of Scope

- Terminal render target (Node.js CLI). If needed, please open a feature request.
