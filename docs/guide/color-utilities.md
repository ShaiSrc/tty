# Color Utilities

The color utilities module provides functions for parsing, converting, and manipulating colors across different formats.

## Functions

### `parseColor(color: Color): RGBColor | null`

Converts any color format to RGB.

```typescript
import { parseColor } from "@shaisrc/tty";

parseColor("red"); // { r: 255, g: 0, b: 0 }
parseColor("#00ff00"); // { r: 0, g: 255, b: 0 }
parseColor({ r: 0, g: 0, b: 255 }); // { r: 0, g: 0, b: 255 }
parseColor(null); // null
```

### `rgbToHex(color: RGBColor): HexColor`

Converts RGB to hexadecimal format.

```typescript
import { rgbToHex } from "@shaisrc/tty";

rgbToHex({ r: 255, g: 0, b: 0 }); // "#ff0000"
rgbToHex({ r: 128, g: 128, b: 128 }); // "#808080"

// Automatically clamps values to 0-255
rgbToHex({ r: 300, g: -10, b: 128 }); // "#ff0080"

// Rounds fractional values
rgbToHex({ r: 127.6, g: 63.4, b: 191.5 }); // "#803fc0"
```

### `toCSSColor(color: Color): string`

Converts any color format to a CSS-compatible string.

```typescript
import { toCSSColor } from "@shaisrc/tty";

toCSSColor("red"); // "rgb(255, 0, 0)"
toCSSColor("#00ff00"); // "rgb(0, 255, 0)"
toCSSColor({ r: 0, g: 0, b: 255 }); // "rgb(0, 0, 255)"
toCSSColor(null); // "transparent"
```

### `lerp(color1: Color, color2: Color, t: number): RGBColor`

Interpolates between two colors.

```typescript
import { lerp } from "@shaisrc/tty";

// t = 0 returns color1
lerp("red", "blue", 0); // { r: 255, g: 0, b: 0 }

// t = 1 returns color2
lerp("red", "blue", 1); // { r: 0, g: 0, b: 255 }

// t = 0.5 returns the midpoint
lerp("red", "blue", 0.5); // { r: 127.5, g: 0, b: 127.5 }

// t is automatically clamped to [0, 1]
lerp("red", "blue", 1.5); // { r: 0, g: 0, b: 255 }
lerp("red", "blue", -0.5); // { r: 255, g: 0, b: 0 }
```

**Use cases:**

- Smooth color transitions
- Gradients
- Color animations
- Health/mana bars with color changing

### `brighten(color: Color, amount: number): RGBColor`

Brightens a color by mixing it with white.

```typescript
import { brighten } from "@shaisrc/tty";

// amount = 0 returns original color
brighten("red", 0); // { r: 255, g: 0, b: 0 }

// amount = 1 returns white
brighten("red", 1); // { r: 255, g: 255, b: 255 }

// amount = 0.5 is halfway to white
brighten("red", 0.5); // { r: 255, g: 127.5, b: 127.5 }

// amount is clamped to [0, 1]
brighten("red", 1.5); // { r: 255, g: 255, b: 255 }
```

**Use cases:**

- Hover effects
- Selection highlights
- Day/night cycles
- Emphasis

### `darken(color: Color, amount: number): RGBColor`

Darkens a color by mixing it with black.

```typescript
import { darken } from "@shaisrc/tty";

// amount = 0 returns original color
darken("red", 0); // { r: 255, g: 0, b: 0 }

// amount = 1 returns black
darken("red", 1); // { r: 0, g: 0, b: 0 }

// amount = 0.5 is halfway to black
darken("red", 0.5); // { r: 127.5, g: 0, b: 0 }

// amount is clamped to [0, 1]
darken("red", -0.5); // { r: 255, g: 0, b: 0 }
```

**Use cases:**

- Shadow effects
- Disabled states
- Depth perception
- Night mode

## Practical Examples

### Color Animation

```typescript
import { lerp, rgbToHex } from "@shaisrc/tty";

function animateColor(start: Color, end: Color, duration: number) {
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const current = lerp(start, end, progress);

    renderer.setCell(10, 10, "█", rgbToHex(current), null);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}

animateColor("red", "blue", 1000); // Animate over 1 second
```

### Health Bar with Color

```typescript
import { lerp } from "@shaisrc/tty";

function drawHealthBar(x: number, y: number, current: number, max: number) {
  const percent = current / max;

  // Green at full health, yellow at half, red when low
  let color;
  if (percent > 0.5) {
    color = lerp("yellow", "green", (percent - 0.5) * 2);
  } else {
    color = lerp("red", "yellow", percent * 2);
  }

  const barLength = Math.floor(20 * percent);
  renderer.drawText(x, y, "█".repeat(barLength), { fg: color });
}
```

### Hover Effect

```typescript
import { brighten } from "@shaisrc/tty";

function drawButton(x: number, y: number, text: string, isHovered: boolean) {
  const baseColor = "blue";
  const color = isHovered ? brighten(baseColor, 0.3) : baseColor;

  renderer.box(x, y, 20, 3, { fg: color });
  renderer.centerText(y + 1, text, color);
}
```

### Day/Night Cycle

```typescript
import { darken, brighten } from "@shaisrc/tty";

function applyTimeOfDay(baseColor: Color, timeOfDay: number) {
  // timeOfDay: 0 = midnight, 0.5 = noon, 1 = midnight
  const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;

  if (isNight) {
    const darkness =
      timeOfDay < 0.25 ? (0.25 - timeOfDay) * 4 : (timeOfDay - 0.75) * 4;
    return darken(baseColor, darkness * 0.7);
  } else {
    return baseColor;
  }
}
```

## Implementation Details

### Named Color Mapping

The library includes RGB values for all named colors:

```typescript
const NAMED_COLORS = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  // ... etc
  brightRed: { r: 255, g: 85, b: 85 },
  // ... etc
};
```

### Hex Parsing

Hex colors are parsed by:

1. Removing the `#` prefix
2. Splitting into R, G, B pairs
3. Converting each pair from hex to decimal

### Value Clamping

All color operations ensure values stay within valid ranges:

- RGB values are clamped to 0-255
- Interpolation factors (t, amount) are clamped to 0-1
- Fractional values are rounded using `Math.round()`

## Performance Considerations

- Color parsing is lightweight with no regex
- RGB colors are passed through without conversion
- No allocations in interpolation functions
- All functions are pure (no side effects)

## Type Safety

All color functions are fully typed:

- Input validation at compile time
- Autocomplete for named colors
- Type narrowing for color formats
- Null-safe by design

## Next Steps

- See [Core Types](./core-types.md) for color type definitions
- See [CanvasTarget](./canvas-target.md) for using colors in rendering
- See [Renderer API](./renderer-api.md) for applying colors to text and boxes
