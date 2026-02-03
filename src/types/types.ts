/**
 * Core type definitions for the KISS ASCII Renderer
 */

/**
 * Named ANSI colors
 */
export type NamedColor =
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

/**
 * Hex color string (e.g., "#ff0000")
 */
export type HexColor = `#${string}`;

/**
 * RGB color object
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * All supported color formats
 */
export type Color = NamedColor | HexColor | RGBColor | null;

/**
 * A single cell in the render buffer
 */
export interface Cell {
  /** The character to display */
  char: string;
  /** Foreground color */
  fg: Color;
  /** Background color */
  bg: Color;
}

/**
 * Box border styles
 */
export type BoxStyle = "single" | "double" | "rounded" | "heavy" | "ascii";

/**
 * Custom border characters
 */
export interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}

/**
 * Options for drawing a box
 */
export interface BoxOptions {
  /** Border style to use */
  style?: BoxStyle | BorderChars;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
  /** Fill the box interior */
  fill?: boolean;
  /** Character to fill with when fill is true */
  fillChar?: string;
  /** Add shadow effect */
  shadow?: boolean;
  /** Inner padding */
  padding?: number;
  /** Optional title to display in the top border */
  title?: string;
  /** Foreground color for the title */
  titleFg?: Color;
  /** Alignment of the title in the top border */
  titleAlign?: TextAlign;
}

/**
 * Text alignment options
 */
export type TextAlign = "left" | "center" | "right";

/**
 * Options for drawing text
 */
export interface TextOptions {
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
  /** Enable word wrapping */
  wrap?: boolean;
  /** Text alignment */
  align?: TextAlign;
}

/**
 * Renderer configuration options
 */
export interface RendererOptions {
  /** Width in characters */
  width: number;
  /** Height in characters */
  height: number;
  /** Default foreground color */
  defaultFg?: Color;
  /** Default background color */
  defaultBg?: Color;
}

/**
 * Abstract interface for render targets
 * Allows rendering to different outputs (Canvas, DOM, Terminal, etc.)
 */
export interface RenderTarget {
  /**
   * Set a character at the specified position
   * @param x - X coordinate (0-indexed)
   * @param y - Y coordinate (0-indexed)
   * @param char - Character to display
   * @param fg - Foreground color
   * @param bg - Background color
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
   * @returns Width and height in characters
   */
  getSize(): { width: number; height: number };
}

/**
 * Options for menu rendering
 */
export interface MenuOptions {
  /** Index of selected item (0-based) */
  selected?: number;
  /** Foreground color for unselected items */
  fg?: Color;
  /** Background color for unselected items */
  bg?: Color;
  /** Foreground color for selected item */
  selectedFg?: Color;
  /** Background color for selected item */
  selectedBg?: Color;
  /** Selection indicator character (e.g., '>' or '•') */
  indicator?: string;
  /** Draw a border around the menu */
  border?: boolean;
  /** Box style for border */
  style?: BoxStyle;
  /** Menu title (displayed in top border if border is true) */
  title?: string;
  /** Fixed width (auto-calculated if not specified) */
  width?: number;
  /** Padding inside the menu */
  padding?: number;
}

/**
 * Progress bar style presets
 */
export type ProgressBarStyle = "blocks" | "dots" | "arrows" | "custom";

/**
 * Options for progress bar rendering
 */
export interface ProgressBarOptions {
  /** Character for filled portion */
  fillChar?: string;
  /** Character for empty portion */
  emptyChar?: string;
  /** Foreground color for filled portion */
  fillFg?: Color;
  /** Background color for filled portion */
  fillBg?: Color;
  /** Foreground color for empty portion */
  emptyFg?: Color;
  /** Background color for empty portion */
  emptyBg?: Color;
  /** Draw border around progress bar */
  border?: boolean;
  /** Border characters (defaults to [ and ]) */
  borderChars?: [string, string];
  /** Show percentage label */
  showPercent?: boolean;
  /** Custom label to display */
  label?: string;
  /** Label position */
  labelPosition?: "right" | "left" | "center";
  /** Render vertically instead of horizontally */
  vertical?: boolean;
  /** Style preset */
  style?: ProgressBarStyle;
}

/**
 * Options for panel rendering
 */
export interface PanelOptions {
  /** Panel title (displayed in top border) */
  title?: string;
  /** Title alignment */
  titleAlign?: TextAlign;
  /** Panel footer (displayed in bottom border) */
  footer?: string;
  /** Box style for border */
  style?: BoxStyle;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
  /** Content lines to display */
  content?: string[];
  /** Content alignment */
  contentAlign?: TextAlign;
  /** Scroll offset for content (0-based line index) */
  scrollOffset?: number;
  /** Fill panel background */
  fill?: boolean;
  /** Fill character when fill is true */
  fillChar?: string;
  /** Inner padding */
  padding?: number;
}

/**
 * Easing functions for animations
 */
export type EasingFunction =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "bounce"
  | "elastic";

/**
 * Animation callback function
 * @param progress - Animation progress (0.0 to 1.0)
 */
export type AnimationCallback = (progress: number) => void;

/**
 * Animation completion callback
 */
export type AnimationCompleteCallback = () => void;

/**
 * Options for animate()
 */
export interface AnimateOptions {
  /** Animation duration in milliseconds */
  duration?: number;
  /** Easing function */
  easing?: EasingFunction;
  /** Callback called on each frame with progress (0.0 to 1.0) */
  onUpdate?: AnimationCallback;
  /** Callback called when animation completes */
  onComplete?: AnimationCompleteCallback;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Delay before starting in milliseconds */
  delay?: number;
}

/**
 * Options for flash()
 */
export interface FlashOptions {
  /** Flash duration in milliseconds */
  duration?: number;
  /** Number of times to flash */
  count?: number;
  /** Character to flash */
  char?: string;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
  /** Callback when flash completes */
  onComplete?: AnimationCompleteCallback;
}

/**
 * Options for pulse()
 */
export interface PulseOptions {
  /** Pulse duration in milliseconds */
  duration?: number;
  /** Minimum opacity/intensity (0.0 to 1.0) */
  minIntensity?: number;
  /** Maximum opacity/intensity (0.0 to 1.0) */
  maxIntensity?: number;
  /** Easing function */
  easing?: EasingFunction;
  /** Whether to loop the pulse */
  loop?: boolean;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
  /** Callback when pulse completes (only called if not looping) */
  onComplete?: AnimationCompleteCallback;
}

// ============================================================================
// Common Geometry Types
// ============================================================================

/**
 * A 2D point or position
 *
 * @example
 * ```ts
 * const playerPos: Point = { x: 10, y: 5 };
 * renderer.setChar(playerPos.x, playerPos.y, '@');
 * ```
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * A rectangle defined by position and dimensions
 *
 * @example
 * ```ts
 * const bounds: Rect = { x: 5, y: 5, width: 20, height: 10 };
 * renderer.box(bounds.x, bounds.y, bounds.width, bounds.height);
 * ```
 */
export interface Rect {
  /** X coordinate of top-left corner */
  x: number;
  /** Y coordinate of top-left corner */
  y: number;
  /** Width in characters */
  width: number;
  /** Height in characters */
  height: number;
}

/**
 * Dimensions (width and height)
 *
 * @example
 * ```ts
 * const gridSize: Size = { width: 80, height: 24 };
 * ```
 */
export interface Size {
  /** Width in characters */
  width: number;
  /** Height in characters */
  height: number;
}
