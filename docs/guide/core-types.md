# Core Types and Interfaces

This document describes the foundational types and interfaces used throughout the KISS ASCII Renderer.

## Color Types

### `NamedColor`

Predefined color names based on ANSI colors:

```typescript
type NamedColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey"
  | "brightRed"
  | "brightGreen"
  | "brightYellow"
  | "brightBlue"
  | "brightMagenta"
  | "brightCyan"
  | "brightWhite";
```

### `HexColor`

Hexadecimal color format:

```typescript
type HexColor = `#${string}`; // e.g., "#ff0000"
```

### `RGBColor`

RGB color object:

```typescript
interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}
```

### `Color`

Union of all color formats, including null for transparent:

```typescript
type Color = NamedColor | HexColor | RGBColor | null;
```

## Cell Type

A `Cell` represents a single character position in the render buffer:

```typescript
interface Cell {
  char: string; // The character to display
  fg: Color; // Foreground color
  bg: Color; // Background color
}
```

## Box and Border Types

### `BoxStyle`

Predefined box border styles:

```typescript
type BoxStyle = "single" | "double" | "rounded" | "heavy" | "ascii";
```

**Examples:**

- `'single'`: ┌─┐│└┘
- `'double'`: ╔═╗║╚╝
- `'rounded'`: ╭─╮│╰╯
- `'heavy'`: ┏━┓┃┗┛
- `'ascii'`: +-+|+-+

### `BorderChars`

Custom border character set:

```typescript
interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}
```

### `BoxOptions`

Options for drawing boxes:

```typescript
interface BoxOptions {
  style?: BoxStyle | BorderChars; // Border style
  fg?: Color; // Foreground color
  bg?: Color; // Background color
  fill?: boolean; // Fill the interior
  fillChar?: string; // Character to fill with
  shadow?: boolean; // Add drop shadow
  padding?: number; // Inner padding
}
```

## Text Types

### `TextAlign`

Text alignment options:

```typescript
type TextAlign = "left" | "center" | "right";
```

### `TextOptions`

Options for drawing text:

```typescript
interface TextOptions {
  fg?: Color; // Foreground color
  bg?: Color; // Background color
  wrap?: boolean; // Enable word wrapping
  align?: TextAlign; // Text alignment
}
```

## Renderer Configuration

### `RendererOptions`

Options for initializing a renderer:

```typescript
interface RendererOptions {
  width: number; // Width in characters
  height: number; // Height in characters
  defaultFg?: Color; // Default foreground color
  defaultBg?: Color; // Default background color
}
```

## RenderTarget Interface

The `RenderTarget` interface abstracts output mechanisms, allowing rendering to different targets (Canvas, DOM):

```typescript
interface RenderTarget {
  /**
   * Set a character at the specified position
   */
  setCell(x: number, y: number, char: string, fg: Color, bg: Color): void;

  /**
   * Clear the entire render target
   */
  clear(): void;

  /**
   * Flush all pending changes to the actual output
   */
  flush(): void;

  /**
   * Get the size of the render target
   */
  getSize(): { width: number; height: number };
}
```

## Usage Examples

### Creating Cells

```typescript
const cell: Cell = {
  char: "@",
  fg: "yellow",
  bg: "black",
};
```

### Using Different Color Formats

```typescript
// Named color
const red: Color = "red";

// Hex color
const purple: Color = "#9933ff";

// RGB color
const orange: Color = { r: 255, g: 165, b: 0 };

// Transparent
const transparent: Color = null;
```

### Custom Border Characters

```typescript
const customBorder: BorderChars = {
  topLeft: "╔",
  topRight: "╗",
  bottomLeft: "╚",
  bottomRight: "╝",
  horizontal: "═",
  vertical: "║",
};

const options: BoxOptions = {
  style: customBorder,
  fg: "cyan",
  fill: true,
  fillChar: " ",
};
```

## Type Safety

All types are designed with TypeScript's strict mode in mind. The library provides:

- **Full type inference**: TypeScript can infer most types from context
- **Compile-time safety**: Invalid combinations are caught at compile time
- **Autocomplete support**: IDEs can provide intelligent suggestions
- **Null safety**: Explicit handling of null colors for transparency

## Next Steps

- See [Color Utilities](./color-utilities.md) for color manipulation functions
- See [CanvasTarget](./canvas-target.md) for browser rendering
- See [Renderer API](./renderer-api.md) for the main rendering interface
