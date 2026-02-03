# Progress Bar Helper

The progress bar helper provides an easy way to display progress indicators in your ASCII UI with various styles and customization options.

## Overview

Progress bars are useful for:

- Loading screens
- Health/mana bars in games
- Experience/level progression
- Download/upload progress
- Any percentage-based indicator

The library provides both horizontal and vertical progress bars with support for:

- Custom fill/empty characters
- Multiple style presets (blocks, dots, arrows)
- Custom colors for filled and empty portions
- Optional borders and labels (horizontal only)
- Percentage display (horizontal only)

## Basic Usage

```typescript
import { Renderer } from "@shaisrc/tty";
import { CanvasTarget } from "@shaisrc/tty/targets/CanvasTarget";

const canvas = document.querySelector("canvas")!;
const target = new CanvasTarget(canvas, { width: 80, height: 24 });
const renderer = new Renderer(target);

// Simple progress bar at 75%
renderer.progressBar(10, 5, 20, 0.75).render();
```

## API Reference

### `progressBar(x, y, length, progress, options?): this`

Draws a progress bar at the specified position.

#### Parameters

- `x` - Starting X coordinate (0-indexed)
- `y` - Starting Y coordinate (0-indexed)
- `length` - Length of the progress bar in characters
- `progress` - Progress value from 0.0 (0%) to 1.0 (100%)
- `options?` - Optional styling configuration

#### Options

```typescript
interface ProgressBarOptions {
  // Characters
  fillChar?: string; // Character for filled portion (default: '█')
  emptyChar?: string; // Character for empty portion (default: ' ')

  // Colors
  fillFg?: Color; // Foreground color for filled portion
  fillBg?: Color; // Background color for filled portion
  emptyFg?: Color; // Foreground color for empty portion
  emptyBg?: Color; // Background color for empty portion

  // Border
  border?: boolean; // Draw border around bar (default: false)
  borderChars?: [string, string]; // Border characters (default: ['[', ']'])

  // Label
  showPercent?: boolean; // Show percentage label (default: false)
  label?: string; // Custom label text
  labelPosition?: "right" | "left"; // Label position (horizontal only)

  // Orientation
  vertical?: boolean; // Render vertically (default: false)

  // Style preset
  style?: "blocks" | "dots" | "arrows" | "custom"; // Style preset
}
```

## Examples

### Horizontal Progress Bar

```typescript
// Simple horizontal bar
renderer.progressBar(10, 5, 30, 0.65);
```

Output:

```
          ███████████████████
```

### With Colors

```typescript
// Green progress bar for health
renderer.progressBar(10, 5, 20, 0.8, {
  fillFg: "green",
  emptyFg: "red",
});
```

### With Border

```typescript
// Progress bar with border brackets
renderer.progressBar(10, 5, 20, 0.5, {
  border: true,
  fillFg: "cyan",
});
```

Output:

```
          [██████████          ]
```

### With Percentage Label

```typescript
// Show completion percentage
renderer.progressBar(10, 5, 20, 0.75, {
  showPercent: true,
  fillFg: "yellow",
});
```

Output:

```
          ███████████████       75%
```

### Custom Label

```typescript
// Custom label text
renderer.progressBar(10, 5, 25, 0.6, {
  label: "Loading",
  showPercent: true,
  border: true,
});
```

Output:

```
          [███████████████         ] Loading 60%
```

### Different Styles

```typescript
// Block style (default)
renderer.progressBar(10, 5, 20, 0.5, { style: "blocks" });
// ██████████

// Dot style
renderer.progressBar(10, 7, 20, 0.5, { style: "dots" });
// ●●●●●●●●●●○○○○○○○○○○

// Arrow style
renderer.progressBar(10, 9, 20, 0.5, { style: "arrows" });
// ▶▶▶▶▶▶▶▶▶▶▷▷▷▷▷▷▷▷▷▷
```

### Custom Characters

```typescript
// Custom fill characters
renderer.progressBar(10, 5, 20, 0.7, {
  fillChar: "#",
  emptyChar: "-",
});
```

Output:

```
          ##############------
```

### Vertical Progress Bar

```typescript
// Vertical orientation
renderer.progressBar(15, 5, 10, 0.6, {
  vertical: true,
  fillFg: "blue",
  style: "blocks",
});
```

Output (vertical, filled from bottom):

```




          █
          █
          █
          █
          █
          █
```

**Note:** Vertical progress bars currently render fill/empty characters only. Borders and labels are applied in horizontal mode.

### Game UI Examples

#### Health Bar

```typescript
const maxHealth = 100;
const currentHealth = 65;

renderer
  .drawText(5, 5, "HP:", { fg: "white" })
  .progressBar(9, 5, 20, currentHealth / maxHealth, {
    fillFg: "green",
    emptyFg: "red",
    border: true,
    showPercent: true,
  });
```

#### Mana Bar

```typescript
const maxMana = 100;
const currentMana = 80;

renderer
  .drawText(5, 7, "MP:", { fg: "white" })
  .progressBar(9, 7, 20, currentMana / maxMana, {
    fillFg: "blue",
    emptyFg: "gray",
    border: true,
  });
```

#### Experience Bar

```typescript
const expToNextLevel = 1000;
const currentExp = 750;

renderer
  .drawText(5, 10, "XP:", { fg: "white" })
  .progressBar(9, 10, 30, currentExp / expToNextLevel, {
    fillFg: "yellow",
    fillChar: "=",
    emptyChar: "-",
    border: true,
    showPercent: true,
  });
```

#### Loading Screen

```typescript
let loadProgress = 0;

function updateLoading() {
  renderer
    .clear()
    .centerText(12, "Loading...", { fg: "cyan" })
    .progressBar(25, 14, 30, loadProgress, {
      border: true,
      showPercent: true,
      fillFg: "green",
    })
    .render();

  loadProgress += 0.01;
  if (loadProgress < 1.0) {
    setTimeout(updateLoading, 50);
  }
}

updateLoading();
```

## Progress Value Handling

The `progress` parameter is automatically clamped to the 0.0-1.0 range:

```typescript
// Values > 1.0 are treated as 1.0 (100%)
renderer.progressBar(10, 5, 20, 1.5); // Same as 1.0

// Values < 0.0 are treated as 0.0 (0%)
renderer.progressBar(10, 5, 20, -0.5); // Same as 0.0
```

## Performance Considerations

Progress bars are lightweight and efficient:

- Uses the same double-buffering system as other primitives
- No dynamic allocations during rendering
- Minimal character updates when progress changes
- Safe to update every frame in game loops

## Layering

Progress bars work with the layer system:

```typescript
// HUD layer with health/mana bars
renderer.layer("hud");
renderer.progressBar(5, 1, 20, healthPercent, { fillFg: "green" });
renderer.progressBar(5, 2, 20, manaPercent, { fillFg: "blue" });

// Main game layer
renderer.layer("main");
// ... game content
```

## Combining with Other Helpers

Progress bars integrate seamlessly with other renderer features:

```typescript
// Progress bar in a panel
renderer.box(5, 5, 40, 8, { border: true, title: "Status" });
renderer.drawText(7, 6, "Health:");
renderer.progressBar(15, 6, 25, 0.8, { fillFg: "green" });
renderer.drawText(7, 7, "Mana:");
renderer.progressBar(15, 7, 25, 0.6, { fillFg: "blue" });
```

## Tips

1. **Use appropriate lengths**: Keep progress bars between 10-40 characters for readability
2. **Color coding**: Use green for health, blue for mana, yellow for experience
3. **Borders for clarity**: Borders make progress bars stand out in busy UIs
4. **Vertical for gauges**: Vertical bars work well for tower/building status displays
5. **Smooth animations**: Update progress gradually for smooth visual feedback

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type { ProgressBarOptions, ProgressBarStyle } from "@shaisrc/tty";

const options: ProgressBarOptions = {
  style: "blocks",
  fillFg: "green",
  showPercent: true,
};

renderer.progressBar(10, 5, 20, 0.75, options);
```

## Accessibility

When using progress bars:

- Always include a text label describing what the bar represents
- Show percentage values for precise feedback
- Use distinct colors for different bar types
- Ensure sufficient contrast between filled and empty portions
