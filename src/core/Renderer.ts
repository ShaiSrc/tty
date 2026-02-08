/* eslint-disable max-lines */
/**
 * Core renderer class with double-buffering and chainable API
 */

import type {
  Cell,
  Color,
  RenderTarget,
  TextOptions,
  BoxOptions,
  MenuOptions,
  ProgressBarOptions,
  PanelOptions,
  AnimateOptions,
  FlashOptions,
  PulseOptions,
} from "../types/types";
import type { BoxAnchor } from "../helpers/alignment";
import { LayerManager } from "./LayerManager";
import { AnimationManager } from "./AnimationManager";
import {
  CanvasTarget,
  type CanvasTargetOptions,
} from "../targets/CanvasTarget";
import * as Drawing from "../drawing/drawingMethods";
import * as Camera from "../helpers/cameraHelpers";
import * as Alignment from "../helpers/alignment";
import * as Debug from "../helpers/debugHelpers";
import * as Export from "../helpers/exportHelpers";
import * as Presets from "../helpers/presetHelpers";

/**
 * Renderer initialization options
 */
export interface RendererCreateOptions {
  /** Default foreground color */
  defaultFg?: Color;
  /** Default background color */
  defaultBg?: Color;
  /** Auto-clear the render target each frame */
  autoClear?: boolean;
  /** Optional clear color when autoClear is enabled */
  clearColor?: Color;
}

/**
 * Options for forCanvas factory method with semantic grouping
 */
export interface CanvasRendererOptions {
  /** Grid dimensions */
  grid: {
    width: number;
    height: number;
  };
  /** Cell/character sizing */
  cell?: {
    width?: number;
    height?: number;
  };
  /** Font configuration */
  font?: {
    family?: string;
    size?: number;
  };
  /** Color defaults */
  colors?: {
    fg?: Color;
    bg?: Color;
  };
  /** Auto-clear behavior */
  autoClear?: boolean;
  /** Clear color when autoClear is enabled */
  clearColor?: Color;
}

/**
 * Main renderer class providing drawing primitives and higher-level helpers
 */
export class Renderer {
  private target: RenderTarget;
  private layerManager: LayerManager;
  private animationManager: AnimationManager;
  private defaultFg: Color;
  private defaultBg: Color;
  private autoClear: boolean;
  private clearColor: Color;
  private safeMode = false;
  private clipMode = false;
  private camera: Camera.CameraState = { x: 0, y: 0 };

  /** Width in characters */
  readonly width: number;

  /** Height in characters */
  readonly height: number;

  /**
   * Create a new Renderer
   * @param target - Render target to output to
   * @param options - Renderer options
   */
  constructor(target: RenderTarget, options: RendererCreateOptions = {}) {
    this.target = target;
    const size = target.getSize();
    this.width = size.width;
    this.height = size.height;
    this.defaultFg = options.defaultFg ?? null;
    this.defaultBg = options.defaultBg ?? null;
    this.autoClear = options.autoClear ?? false;
    this.clearColor = options.clearColor ?? null;
    this.layerManager = new LayerManager();
    this.animationManager = new AnimationManager();
    this.animationManager.setRenderer(this);
  }

  /**
   * Create a Renderer from an HTML Canvas element
   *
   * Convenience factory method that creates a CanvasTarget and Renderer in one step.
   * Simplifies the common pattern of creating a canvas-based renderer.
   *
   * @param canvas - HTML Canvas element to render to
   * @param canvasOptions - Canvas target configuration (width, height, charWidth, etc.)
   * @param rendererOptions - Optional renderer configuration (colors, autoClear)
   * @returns A new Renderer instance configured for the canvas
   *
   * @example
   * ```ts
   * // Instead of:
   * const target = new CanvasTarget(canvas, { width: 80, height: 24 })
   * const renderer = new Renderer(target)
   *
   * // Use:
   * const renderer = Renderer.fromCanvas(canvas, { width: 80, height: 24 })
   * ```
   */
  static fromCanvas(
    canvas: HTMLCanvasElement,
    canvasOptions: CanvasTargetOptions,
    rendererOptions?: RendererCreateOptions,
  ): Renderer {
    const target = new CanvasTarget(canvas, canvasOptions);
    return new Renderer(target, rendererOptions);
  }

  /**
   * Create a Renderer for Canvas with improved, semantic API
   *
   * Modern factory method with better parameter grouping for improved DX.
   * Recommended over fromCanvas() for new code.
   *
   * @param canvas - HTML Canvas element to render to
   * @param options - Grouped configuration options
   * @returns A new Renderer instance configured for the canvas
   *
   * @example
   * ```ts
   * const renderer = Renderer.forCanvas(canvas, {
   *   grid: { width: 80, height: 24 },
   *   cell: { width: 12, height: 20 },
   *   font: { family: 'monospace', size: 16 },
   *   colors: { fg: 'white', bg: 'black' }
   * })
   * ```
   */
  static forCanvas(
    canvas: HTMLCanvasElement,
    options: CanvasRendererOptions,
  ): Renderer {
    const canvasOptions: CanvasTargetOptions = {
      width: options.grid.width,
      height: options.grid.height,
      charWidth: options.cell?.width,
      charHeight: options.cell?.height,
      fontFamily: options.font?.family,
      fontSize: options.font?.size,
    };

    const rendererOptions: RendererCreateOptions = {
      defaultFg: options.colors?.fg,
      defaultBg: options.colors?.bg,
      autoClear: options.autoClear,
      clearColor: options.clearColor,
    };

    const target = new CanvasTarget(canvas, canvasOptions);
    return new Renderer(target, rendererOptions);
  }

  /**
   * Get the current layer's buffer
   */
  private get buffer(): Map<string, Cell> {
    return this.layerManager.getCurrentBuffer();
  }

  /**
   * Get drawing context for helper methods
   */
  private get drawingContext(): Drawing.DrawingContext {
    return {
      setChar: this.setChar.bind(this),
      drawText: this.drawText.bind(this),
      drawLine: this.drawLine.bind(this),
      fill: this.fill.bind(this),
      box: this.box.bind(this),
      width: this.width,
      height: this.height,
      defaultFg: this.defaultFg,
      defaultBg: this.defaultBg,
    };
  }

  /**
   * Enable or disable safe mode
   *
   * When enabled, throws errors for out-of-bounds operations.
   * When disabled, silently ignores out-of-bounds operations.
   *
   * @param enabled - True to enable safe mode, false to disable
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .setSafeMode(true)
   *   .setChar(100, 100, 'X') // Will throw if out of bounds
   * ```
   */
  setSafeMode(enabled: boolean): this {
    this.safeMode = enabled;
    return this;
  }

  /**
   * Enable or disable clip mode
   *
   * When enabled, clips drawing operations to stay within bounds.
   * Useful for preventing visual artifacts when drawing near edges.
   *
   * @param enabled - True to enable clip mode, false to disable
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .setClipMode(true)
   *   .drawText(75, 10, 'This text will be clipped at screen edge')
   * ```
   */
  setClipMode(enabled: boolean): this {
    this.clipMode = enabled;
    return this;
  }

  /**
   * Check if position is within bounds
   */
  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Validate position based on mode settings
   */
  private validatePosition(x: number, y: number): boolean {
    if (this.isInBounds(x, y)) return true;
    if (this.safeMode) {
      throw new Error(`Position (${x}, ${y}) out of bounds`);
    }
    return false;
  }

  /**
   * Set a character at position (world coordinates)
   *
   * The fundamental drawing primitive. Positions are in world coordinates,
   * which are transformed by the camera before rendering.
   *
   * @param x - X coordinate in world space
   * @param y - Y coordinate in world space
   * @param char - Character to display
   * @param fg - Foreground color (defaults to renderer's defaultFg)
   * @param bg - Background color (defaults to renderer's defaultBg)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .setChar(10, 5, '@', 'yellow', 'black')
   *   .setChar(11, 5, '#', 'green')
   *   .render()
   * ```
   */
  setChar(x: number, y: number, char: string, fg?: Color, bg?: Color): this {
    // Transform world to screen coordinates
    const screenX = x - this.camera.x;
    const screenY = y - this.camera.y;

    if (!this.validatePosition(screenX, screenY)) return this;
    this.buffer.set(`${screenX},${screenY}`, {
      char,
      fg: fg ?? this.defaultFg,
      bg: bg ?? this.defaultBg,
    });
    return this;
  }

  /**
   * Set a scaled character occupying multiple cells
   *
   * Creates a unified cell where one character is rendered across scale×scale cells.
   * For example, scale=2 creates a 2×2 character, scale=3 creates a 3×3 character.
   * Maximum scale is 5.
   *
   * @param x - Top-left X coordinate in world space
   * @param y - Top-left Y coordinate in world space
   * @param scale - Scale factor (2-5, renders scale×scale cells)
   * @param char - Character to display scaled
   * @param fg - Foreground color (defaults to renderer's defaultFg)
   * @param bg - Background color (defaults to renderer's defaultBg)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .setCharScaled(10, 10, 2, '♥', 'red')    // 2×2 red heart
   *   .setCharScaled(15, 10, 3, '@', 'yellow') // 3×3 yellow player
   *   .render()
   * ```
   */
  setCharScaled(
    x: number,
    y: number,
    scale: number,
    char: string,
    fg?: Color,
    bg?: Color,
  ): this {
    // Transform world to screen coordinates
    const screenX = x - this.camera.x;
    const screenY = y - this.camera.y;

    // Validate scale and bounds
    if (!this.validateScaledChar(screenX, screenY, scale, x, y)) {
      return this;
    }

    // Check for overwrites and warn
    this.checkScaledOverwrites(screenX, screenY, scale);

    // Clear and create unified cell
    this.createUnifiedCell(screenX, screenY, scale, char, fg, bg);

    return this;
  }

  /**
   * Validate scaled character scale and bounds
   */
  private validateScaledChar(
    screenX: number,
    screenY: number,
    scale: number,
    worldX: number,
    worldY: number,
  ): boolean {
    // Validate scale
    if (scale < 1 || scale > 5 || !Number.isInteger(scale)) {
      if (this.safeMode) {
        throw new Error(
          `Invalid scale: ${scale}. Scale must be an integer between 1 and 5`,
        );
      }
      return false;
    }

    // Validate bounds
    const endX = screenX + scale - 1;
    const endY = screenY + scale - 1;
    if (this.safeMode) {
      if (
        screenX < 0 ||
        screenY < 0 ||
        endX >= this.width ||
        endY >= this.height
      ) {
        throw new Error(
          `Scaled character ${scale}×${scale} at (${worldX},${worldY}) extends beyond grid bounds`,
        );
      }
    } else if (!this.isInBounds(screenX, screenY)) {
      return false;
    }

    return true;
  }

  /**
   * Check for existing unified cells and warn if overwriting
   */
  private checkScaledOverwrites(
    screenX: number,
    screenY: number,
    scale: number,
  ): void {
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const cellKey = `${screenX + dx},${screenY + dy}`;
        const existing = this.buffer.get(cellKey);
        if (existing?.unified) {
          // eslint-disable-next-line no-console
          console.warn(
            `Overwriting unified cell at (${screenX + dx},${screenY + dy})`,
          );
          return; // Only warn once
        }
      }
    }
  }

  /**
   * Create unified cell with markers
   */
  private createUnifiedCell(
    screenX: number,
    screenY: number,
    scale: number,
    char: string,
    fg?: Color,
    bg?: Color,
  ): void {
    // Clear all cells in the unified area
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        if (this.isInBounds(screenX + dx, screenY + dy)) {
          this.buffer.delete(`${screenX + dx},${screenY + dy}`);
        }
      }
    }

    // Set origin cell with unified metadata
    this.buffer.set(`${screenX},${screenY}`, {
      char,
      fg: fg ?? this.defaultFg,
      bg: bg ?? this.defaultBg,
      unified: { scale, isOrigin: true },
    });

    // Create merged marker cells for occupied positions
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip origin
        if (this.isInBounds(screenX + dx, screenY + dy)) {
          this.buffer.set(`${screenX + dx},${screenY + dy}`, {
            char: "",
            fg: null,
            bg: null,
            unified: { mergedInto: `${screenX},${screenY}` },
          });
        }
      }
    }
  }

  /**
   * Draw scaled text string
   *
   * Draws text where each character is scaled to occupy scale×scale cells.
   * Characters are placed horizontally with each scaled character occupying
   * its scaled width before the next character.
   *
   * @param x - Starting X coordinate in world space
   * @param y - Starting Y coordinate in world space
   * @param scale - Scale factor for each character (2-5)
   * @param text - Text string to draw scaled
   * @param fg - Foreground color (defaults to renderer's defaultFg)
   * @param bg - Background color (defaults to renderer's defaultBg)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .scaledText(10, 5, 2, 'BIG', 'yellow')      // Each char is 2×2
   *   .scaledText(10, 10, 3, 'HUGE', 'red')       // Each char is 3×3
   *   .render()
   * ```
   */
  scaledText(
    x: number,
    y: number,
    scale: number,
    text: string,
    fg?: Color,
    bg?: Color,
  ): this {
    let offsetX = 0;
    for (let i = 0; i < text.length; i++) {
      this.setCharScaled(x + offsetX, y, scale, text[i], fg, bg);
      offsetX += scale; // Move by scale cells for next character
    }
    return this;
  }

  /**
   * Draw a text string
   *
   * Draws text horizontally starting at the specified position.
   * Each character is drawn sequentially to the right.
   *
   * @param x - Starting X coordinate
   * @param y - Y coordinate
   * @param text - Text string to draw
   * @param options - Text styling options (fg, bg, wrap, align)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .drawText(5, 10, 'Hello, World!', { fg: 'cyan' })
   *   .drawText(5, 11, 'Press any key', { fg: 'gray' })
   *   .render()
   * ```
   */
  drawText(
    x: number,
    y: number,
    text: string,
    options: TextOptions = {},
  ): this {
    const fg = options.fg ?? this.defaultFg;
    const bg = options.bg ?? this.defaultBg;
    for (let i = 0; i < text.length; i++) {
      this.setChar(x + i, y, text[i], fg, bg);
    }
    return this;
  }

  /**
   * Fill a rectangular area
   *
   * Fills a rectangular region with the specified character and colors.
   * Useful for creating solid backgrounds or clearable areas.
   *
   * @param x - Starting X coordinate
   * @param y - Starting Y coordinate
   * @param w - Width in characters
   * @param h - Height in characters
   * @param char - Character to fill with
   * @param fg - Foreground color (optional)
   * @param bg - Background color (optional)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .fill(10, 5, 20, 10, ' ', null, 'blue') // Blue background box
   *   .fill(15, 7, 5, 3, '░', 'gray') // Textured area
   *   .render()
   * ```
   */
  fill(
    x: number,
    y: number,
    w: number,
    h: number,
    char: string,
    fg?: Color,
    bg?: Color,
  ): this {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        this.setChar(x + i, y + j, char, fg, bg);
      }
    }
    return this;
  }

  /**
   * Clear the current layer's buffer
   *
   * Removes all drawn content from the current layer.
   * Does not affect other layers or the render target.
   * Call render() to flush changes to the screen.
   *
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .clear() // Clear everything
   *   .drawText(0, 0, 'Fresh start')
   *   .render()
   * ```
   */
  clear(): this {
    this.buffer.clear();
    return this;
  }

  /**
   * Render all layers to the target
   *
   * Composites all visible layers in order and flushes the result
   * to the render target. This is when drawing actually becomes visible.
   *
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .clear()
   *   .box(10, 5, 20, 10)
   *   .drawText(12, 7, 'Game Over')
   *   .render() // Now visible on screen
   * ```
   */
  render(): this {
    if (this.autoClear) {
      if (this.clearColor !== null) {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            this.target.setCell(x, y, " ", null, this.clearColor);
          }
        }
      } else {
        this.target.clear();
      }
    }

    const composite = this.layerManager.composite();
    const rendered = new Set<string>();

    for (const [key, cell] of composite.entries()) {
      // Skip if already rendered as part of unified cell
      if (rendered.has(key)) continue;

      // Skip merged marker cells
      if (cell.unified && "mergedInto" in cell.unified) {
        continue;
      }

      const [x, y] = key.split(",").map(Number);

      // Handle unified origin cells
      if (cell.unified && cell.unified.isOrigin) {
        const { scale } = cell.unified;

        // Mark all cells in the unified area as rendered
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            rendered.add(`${x + dx},${y + dy}`);
          }
        }

        // Use scaled rendering if available
        if (this.target.setCellScaled) {
          this.target.setCellScaled(x, y, scale, cell.char, cell.fg, cell.bg);
        } else {
          // Fallback: render at origin only
          this.target.setCell(x, y, cell.char, cell.fg, cell.bg);
        }
      } else {
        // Normal cell rendering
        this.target.setCell(x, y, cell.char, cell.fg, cell.bg);
      }
    }

    this.target.flush();
    return this;
  }

  /**
   * Get cell at position from current layer
   *
   * Retrieves the cell data at the specified screen coordinates.
   * Returns undefined if nothing is drawn at that position.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns The cell data or undefined
   *
   * @example
   * ```ts
   * const cell = renderer.getCell(10, 5)
   * if (cell) {
   *   console.log(cell.char, cell.fg, cell.bg)
   * }
   * ```
   */
  getCell(x: number, y: number): Cell | undefined {
    return this.buffer.get(`${x},${y}`);
  }

  /**
   * Draw a box with borders and optional fill
   *
   * Creates a bordered box using various drawing styles.
   * Can optionally fill the interior with a character.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param w - Width in characters (including borders)
   * @param h - Height in characters (including borders)
   * @param options - Box styling options (style, fg, bg, fill, shadow, padding)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .box(10, 5, 30, 10, { style: 'double', fg: 'cyan' })
   *   .box(15, 8, 20, 5, { style: 'rounded', fill: true, bg: 'blue' })
   *   .render()
   * ```
   */
  box(
    x: number,
    y: number,
    w: number,
    h: number,
    options: BoxOptions = {},
  ): this {
    Drawing.drawBox(this.drawingContext, x, y, w, h, options);
    return this;
  }

  /**
   * Draw a border without filling the interior
   *
   * Similar to box() but only draws the border, leaving the interior transparent.
   * Useful for creating frames around existing content.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param w - Width in characters (including borders)
   * @param h - Height in characters (including borders)
   * @param options - Border styling options
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .drawText(12, 7, 'Important!')
   *   .border(10, 5, 20, 5, { style: 'double', fg: 'red' })
   *   .render()
   * ```
   */
  border(
    x: number,
    y: number,
    w: number,
    h: number,
    options: BoxOptions = {},
  ): this {
    Drawing.drawBorder(this.drawingContext, x, y, w, h, options);
    return this;
  }

  /**
   * Draw a filled rectangle without borders
   *
   * Creates a solid rectangular area filled with the specified character.
   * No borders are drawn.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param w - Width in characters
   * @param h - Height in characters
   * @param fillChar - Character to fill with (default: space)
   * @param fg - Foreground color (optional)
   * @param bg - Background color (optional)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .rect(10, 5, 20, 10, ' ', null, 'blue') // Solid blue rectangle
   *   .rect(15, 8, 10, 5, '█', 'red') // Solid block pattern
   *   .render()
   * ```
   */
  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fillChar = " ",
    fg?: Color,
    bg?: Color,
  ): this {
    Drawing.drawRect(this.drawingContext, x, y, w, h, fillChar, { fg, bg });
    return this;
  }

  /**
   * Draw a line between two points
   *
   * Draws a line from (x1, y1) to (x2, y2) using Bresenham's line algorithm.
   * Useful for creating borders, connections, diagrams, and ASCII art.
   *
   * @param x1 - Starting X coordinate
   * @param y1 - Starting Y coordinate
   * @param x2 - Ending X coordinate
   * @param y2 - Ending Y coordinate
   * @param char - Character to draw the line with
   * @param options - Line styling options (fg, bg)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .drawLine(0, 0, 10, 10, '/', { fg: 'cyan' })
   *   .drawLine(10, 0, 0, 10, '\\', { fg: 'cyan' })
   *   .drawLine(5, 0, 5, 10, '|', { fg: 'yellow' })
   *   .render()
   * ```
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    char: string,
    options: TextOptions = {},
  ): this {
    Drawing.drawLine(this.drawingContext, x1, y1, x2, y2, char, options);
    return this;
  }

  /**
   * Calculate aligned box position
   *
   * Returns the (x, y) position for a box aligned to a specific anchor point
   * within the viewport. Useful for positioning dialogs, menus, and UI elements.
   *
   * @param anchor - Alignment anchor (center, top, bottom, left, right, or combinations)
   * @param width - Box width
   * @param height - Box height
   * @param offsetX - X offset from anchor position (default: 0)
   * @param offsetY - Y offset from anchor position (default: 0)
   * @returns Object with x and y coordinates
   *
   * @example
   * ```ts
   * // Center a 30x10 dialog
   * const pos = renderer.alignBox('center', 30, 10)
   * renderer.box(pos.x, pos.y, 30, 10, { style: 'double' })
   *
   * // Top-right notification with offset
   * const notifPos = renderer.alignBox('top-right', 20, 5, -2, 1)
   * renderer.box(notifPos.x, notifPos.y, 20, 5)
   * ```
   */
  alignBox(
    anchor: BoxAnchor,
    width: number,
    height: number,
    offsetX = 0,
    offsetY = 0,
  ): { x: number; y: number } {
    return Alignment.calculateAlignedBox(
      anchor,
      width,
      height,
      this.width,
      this.height,
      offsetX,
      offsetY,
    );
  }

  /**
   * Draw a centered box
   *
   * Convenience method that combines alignBox('center') and box().
   * Centers a box in the viewport and draws it in one call.
   *
   * @param width - Box width
   * @param height - Box height
   * @param options - Box styling options
   * @param offsetX - X offset from center (default: 0)
   * @param offsetY - Y offset from center (default: 0)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .centerBox(40, 15, { style: 'double', fill: true, fg: 'cyan' })
   *   .centerText(10, 'GAME OVER', { fg: 'red' })
   *   .render()
   * ```
   */
  centerBox(
    width: number,
    height: number,
    options: BoxOptions = {},
    offsetX = 0,
    offsetY = 0,
  ): this {
    const pos = this.alignBox("center", width, height, offsetX, offsetY);
    return this.box(pos.x, pos.y, width, height, options);
  }

  /**
   * Draw centered text
   *
   * Centers text horizontally within a specified width or the entire screen.
   * Useful for titles, menus, and dialog boxes.
   *
   * @param y - Y coordinate for the text
   * @param text - Text to draw
   * @param options - Text styling options
   * @param startX - Starting X coordinate of centering area (default: 0)
   * @param width - Width of centering area (default: screen width)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .centerText(5, 'GAME TITLE', { fg: 'yellow' })
   *   .centerText(10, 'Centered in box', {}, 10, 30) // Center within x=10 to x=40
   *   .render()
   * ```
   */
  centerText(
    y: number,
    text: string,
    options: TextOptions = {},
    startX = 0,
    width?: number,
  ): this {
    Drawing.drawCenterText(
      this.drawingContext,
      y,
      text,
      options,
      startX,
      width,
    );
    return this;
  }

  /**
   * Draw right-aligned text
   *
   * Aligns text to the right edge of a specified area.
   *
   * @param y - Y coordinate for the text
   * @param text - Text to draw
   * @param options - Text styling options
   * @param startX - Starting X coordinate of alignment area (default: 0)
   * @param width - Width of alignment area (default: screen width)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .rightAlign(5, 'Score: 1000', { fg: 'green' })
   *   .rightAlign(10, 'HP: 75/100', {}, 50, 30) // Right-align within x=50 to x=80
   *   .render()
   * ```
   */
  rightAlign(
    y: number,
    text: string,
    options: TextOptions = {},
    startX = 0,
    width?: number,
  ): this {
    Drawing.drawRightAlign(
      this.drawingContext,
      y,
      text,
      options,
      startX,
      width,
    );
    return this;
  }

  /**
   * Draw left-aligned text
   *
   * Draws text starting at a specified X offset.
   * Primarily for consistency with centerText and rightAlign.
   *
   * @param y - Y coordinate for the text
   * @param text - Text to draw
   * @param options - Text styling options
   * @param offsetX - X offset from left edge (default: 0)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .leftAlign(5, 'Menu Item 1', { fg: 'white' })
   *   .leftAlign(6, 'Menu Item 2', { fg: 'white' }, 2) // Indent by 2
   *   .render()
   * ```
   */
  leftAlign(
    y: number,
    text: string,
    options: TextOptions = {},
    offsetX = 0,
  ): this {
    Drawing.drawLeftAlign(this.drawingContext, y, text, options, offsetX);
    return this;
  }

  /**
   * Draw aligned text using options.align property
   *
   * Generic text alignment that uses the align property from TextOptions.
   * Delegates to centerText, rightAlign, or leftAlign based on the setting.
   *
   * @param y - Y coordinate for the text
   * @param text - Text to draw
   * @param options - Text styling options (including align property)
   * @param startX - Starting X coordinate of alignment area (default: 0)
   * @param width - Width of alignment area (default: screen width)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .alignText(5, 'Title', { align: 'center', fg: 'yellow' })
   *   .alignText(10, 'Score', { align: 'right', fg: 'green' })
   *   .render()
   * ```
   */
  alignText(
    y: number,
    text: string,
    options: TextOptions = {},
    startX = 0,
    width?: number,
  ): this {
    const align = options.align ?? "left";
    Drawing.drawAlignText(
      this.drawingContext,
      y,
      text,
      align,
      options,
      startX,
      width,
    );
    return this;
  }

  /**
   * Select or create a layer
   *
   * Switches the current drawing context to the specified layer.
   * Layers are created automatically if they don't exist.
   * All subsequent drawing operations affect the current layer.
   *
   * @param name - Name of the layer to select/create
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .layer('background').fill(0, 0, 80, 24, ' ', null, 'blue')
   *   .layer('ui').box(10, 5, 20, 10, { style: 'double' })
   *   .layerOrder(['background', 'ui'])
   *   .render()
   * ```
   */
  layer(name: string): this {
    this.layerManager.setCurrentLayer(name);
    return this;
  }

  /**
   * Set layer rendering order
   *
   * Defines the order in which layers are composited.
   * Layers listed first are rendered at the bottom, last ones on top.
   *
   * @param order - Array of layer names in rendering order (bottom to top)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .layerOrder(['background', 'entities', 'ui', 'effects'])
   *   .render()
   * ```
   */
  layerOrder(order: string[]): this {
    this.layerManager.setRenderOrder(order);
    return this;
  }

  /**
   * Hide a layer
   *
   * Makes a layer invisible without deleting its contents.
   * Hidden layers are not included in rendering.
   *
   * @param name - Name of the layer to hide
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .hideLayer('debug')
   *   .render() // Debug layer won't be visible
   * ```
   */
  hideLayer(name: string): this {
    this.layerManager.hideLayer(name);
    return this;
  }

  /**
   * Show a layer
   *
   * Makes a previously hidden layer visible again.
   *
   * @param name - Name of the layer to show
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .showLayer('debug')
   *   .render() // Debug layer is now visible
   * ```
   */
  showLayer(name: string): this {
    this.layerManager.showLayer(name);
    return this;
  }

  /**
   * Clear a specific layer
   *
   * Removes all content from the specified layer.
   * The layer itself remains and stays visible.
   *
   * @param name - Name of the layer to clear
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .clearLayer('effects')
   *   .render()
   * ```
   */
  clearLayer(name: string): this {
    this.layerManager.clearLayer(name);
    return this;
  }

  /**
   * Draw a progress bar
   *
   * Renders a horizontal or vertical progress bar with customizable appearance.
   * Progress value should be between 0.0 and 1.0.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param length - Length in characters (width if horizontal, height if vertical)
   * @param progress - Progress value from 0.0 to 1.0
   * @param options - Progress bar styling options (fillChar, emptyChar, colors, border, label, etc.)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .progressBar(10, 5, 30, 0.75, {
   *     style: 'blocks',
   *     fillFg: 'green',
   *     emptyFg: 'gray',
   *     showPercent: true
   *   })
   *   .progressBar(50, 10, 10, 0.5, { vertical: true })
   *   .render()
   * ```
   */
  progressBar(
    x: number,
    y: number,
    length: number,
    progress: number,
    options: ProgressBarOptions = {},
  ): this {
    Drawing.drawProgressBar(
      this.drawingContext,
      x,
      y,
      length,
      progress,
      options,
    );
    return this;
  }

  /**
   * Draw a panel with border, title, and content
   *
   * Creates a bordered box with optional title, footer, and auto-formatted content.
   * Content can be scrolled using the scrollOffset option.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param width - Width in characters (including border)
   * @param height - Height in characters (including border)
   * @param options - Panel styling options (title, footer, content, style, colors, padding, etc.)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .panel(10, 5, 40, 15, {
   *     title: 'Inventory',
   *     content: ['Sword', 'Shield', 'Potion x3'],
   *     style: 'double',
   *     fg: 'cyan',
   *     padding: 1
   *   })
   *   .render()
   * ```
   */
  panel(
    x: number,
    y: number,
    width: number,
    height: number,
    options: PanelOptions = {},
  ): this {
    Drawing.drawPanel(this.drawingContext, x, y, width, height, options);
    return this;
  }

  /**
   * Draw a menu with selectable items
   *
   * Renders a list of menu items with visual indication of the selected item.
   * Supports borders, titles, and customizable selection indicators.
   *
   * @param x - Top-left X coordinate
   * @param y - Top-left Y coordinate
   * @param items - Array of menu item strings
   * @param options - Menu styling options (selected, colors, indicator, border, title, etc.)
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .menu(20, 10, ['New Game', 'Load Game', 'Options', 'Quit'], {
   *     selected: 0,
   *     indicator: '>',
   *     border: true,
   *     title: 'Main Menu',
   *     selectedFg: 'black',
   *     selectedBg: 'yellow'
   *   })
   *   .render()
   * ```
   */
  menu(x: number, y: number, items: string[], options: MenuOptions = {}): this {
    Drawing.drawMenuHelper(this.drawingContext, x, y, items, options);
    return this;
  }

  /**
   * Set camera position (top-left of viewport in world coordinates)
   *
   * Positions the camera at specific world coordinates.
   * All subsequent drawing uses world coordinates, which are transformed by the camera.
   *
   * @param x - Camera X position in world space
   * @param y - Camera Y position in world space
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .setCamera(100, 50) // View world at (100, 50)
   *   .setChar(105, 55, '@') // Draw at world position (105, 55)
   *   .render() // Character appears at screen position (5, 5)
   * ```
   */
  setCamera(x: number, y: number): this {
    Camera.setCamera(this.camera, x, y);
    return this;
  }

  /**
   * Reset camera to origin (0, 0)
   *
   * Moves the camera back to the world origin.
   *
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .resetCamera()
   *   .render()
   * ```
   */
  resetCamera(): this {
    Camera.resetCamera(this.camera);
    return this;
  }

  /**
   * Get current camera position
   *
   * Returns the camera's current position in world coordinates.
   *
   * @returns Object with x and y camera coordinates
   *
   * @example
   * ```ts
   * const { x, y } = renderer.getCamera()
   * console.log(`Camera at (${x}, ${y})`)
   * ```
   */
  getCamera(): { x: number; y: number } {
    return { x: this.camera.x, y: this.camera.y };
  }

  /**
   * Set camera bounds to limit scrolling area
   *
   * Prevents the camera from scrolling outside the specified boundaries.
   * All camera movements (setCamera, moveCamera, follow) will be clamped
   * to stay within these bounds.
   *
   * @param minX - Minimum X coordinate
   * @param minY - Minimum Y coordinate
   * @param maxX - Maximum X coordinate
   * @param maxY - Maximum Y coordinate
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * // Limit camera to a 100x50 world map
   * renderer
   *   .setCameraBounds(0, 0, 100, 50)
   *   .follow(player.x, player.y) // Auto-clamped to bounds
   *   .render()
   * ```
   */
  setCameraBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): this {
    Camera.setCameraBounds(this.camera, minX, minY, maxX, maxY);
    return this;
  }

  /**
   * Clear camera bounds
   *
   * Removes any camera movement restrictions, allowing unlimited scrolling.
   *
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .clearCameraBounds()
   *   .setCamera(1000, 1000) // No longer restricted
   *   .render()
   * ```
   */
  clearCameraBounds(): this {
    Camera.clearCameraBounds(this.camera);
    return this;
  }

  /**
   * Move camera by delta
   *
   * Moves the camera relative to its current position.
   * Positive values move the camera right/down in world space.
   *
   * @param dx - Change in X position
   * @param dy - Change in Y position
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * renderer
   *   .moveCamera(5, 0) // Pan camera 5 units right
   *   .moveCamera(0, -3) // Pan camera 3 units up
   *   .render()
   * ```
   */
  moveCamera(dx: number, dy: number): this {
    Camera.moveCamera(this.camera, dx, dy);
    return this;
  }

  /**
   * Center camera on target position
   *
   * Moves the camera to center on a specific world position.
   * Useful for following a player character or focusing on important events.
   *
   * @param targetX - World X coordinate to center on
   * @param targetY - World Y coordinate to center on
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * const player = { x: 150, y: 75 }
   * renderer
   *   .follow(player.x, player.y) // Camera centers on player
   *   .setChar(player.x, player.y, '@', 'yellow')
   *   .render()
   * ```
   */
  follow(targetX: number, targetY: number): this {
    Camera.followTarget(this.camera, targetX, targetY, this.width, this.height);
    return this;
  }

  /**
   * Convert world coordinates to screen coordinates
   *
   * Transforms a world position to its corresponding screen position
   * based on the current camera position.
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @returns Object with screen x and y coordinates
   *
   * @example
   * ```ts
   * const screen = renderer.worldToScreen(100, 50)
   * console.log(`World (100, 50) is at screen (${screen.x}, ${screen.y})`)
   * ```
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return Camera.worldToScreen(this.camera, worldX, worldY);
  }

  /**
   * Convert screen coordinates to world coordinates
   *
   * Transforms a screen position to its corresponding world position
   * based on the current camera position. Useful for mouse input handling.
   *
   * @param screenX - X coordinate in screen space
   * @param screenY - Y coordinate in screen space
   * @returns Object with world x and y coordinates
   *
   * @example
   * ```ts
   * mouseManager.onClick((pos) => {
   *   const world = renderer.screenToWorld(pos.x, pos.y)
   *   console.log(`Clicked world position (${world.x}, ${world.y})`)
   * })
   * ```
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return Camera.screenToWorld(this.camera, screenX, screenY);
  }

  // ===== Animation Methods =====

  animate(options?: AnimateOptions): number {
    return this.animationManager.animate(options);
  }

  flash(x: number, y: number, options?: FlashOptions): number {
    return this.animationManager.flash(x, y, options);
  }

  pulse(x: number, y: number, options?: PulseOptions): number {
    return this.animationManager.pulse(x, y, options);
  }

  stopAnimation(animationId: number): this {
    this.animationManager.stop(animationId);
    return this;
  }

  stopAllAnimations(): this {
    this.animationManager.stopAll();
    return this;
  }

  updateAnimations(currentTime?: number): this {
    this.animationManager.update(currentTime);
    return this;
  }

  getActiveAnimationCount(): number {
    return this.animationManager.getActiveCount();
  }

  isAnimationActive(animationId: number): boolean {
    return this.animationManager.isActive(animationId);
  }

  // ===== Debug Methods =====

  /**
   * Debug namespace providing visualization and inspection tools
   */
  readonly debug = {
    /**
     * Draw a grid overlay for alignment and positioning
     * @param options - Grid display options
     * @returns The renderer instance for chaining
     */
    showGrid: (options?: Debug.ShowGridOptions): this => {
      Debug.showGrid(this.drawingContext, options);
      return this;
    },

    /**
     * Visualize the bounds of a rectangular area
     * @param x - X coordinate of top-left corner
     * @param y - Y coordinate of top-left corner
     * @param width - Width of the bounds
     * @param height - Height of the bounds
     * @param options - Bounds display options
     * @returns The renderer instance for chaining
     */
    showBounds: (
      x: number,
      y: number,
      width: number,
      height: number,
      options?: Debug.ShowBoundsOptions,
    ): this => {
      Debug.showBounds(this.drawingContext, x, y, width, height, options);
      return this;
    },

    /**
     * Display FPS (frames per second) counter
     * @param fps - Current FPS value
     * @param options - FPS display options
     * @returns The renderer instance for chaining
     */
    showFPS: (fps: number, options?: Debug.ShowFPSOptions): this => {
      Debug.showFPS(this.drawingContext, fps, options);
      return this;
    },

    /**
     * Display pointer/mouse coordinates
     * @param pointerX - Pointer X grid coordinate
     * @param pointerY - Pointer Y grid coordinate
     * @param options - Display options
     * @returns The renderer instance for chaining
     */
    showPointerCoords: (
      pointerX: number,
      pointerY: number,
      options?: Debug.ShowPointerCoordsOptions,
    ): this => {
      Debug.showPointerCoords(this.drawingContext, pointerX, pointerY, options);
      return this;
    },

    /**
     * Get detailed information about a cell
     * @param x - X coordinate of the cell
     * @param y - Y coordinate of the cell
     * @returns Cell information object, or null if out of bounds
     */
    logCell: (x: number, y: number): Debug.CellInfo | null => {
      return Debug.logCell(this.drawingContext, this, x, y);
    },
  };

  // ===== Export Methods =====

  /**
   * Export buffer as plain text string
   *
   * @returns Plain text representation of the buffer
   *
   * @example
   * ```ts
   * const text = renderer.exportAsString()
   * console.log(text)
   * ```
   */
  exportAsString(): string {
    return Export.exportAsString(this);
  }

  /**
   * Export buffer as ANSI-colored text
   *
   * @returns ANSI-colored text string
   *
   * @example
   * ```ts
   * const ansi = renderer.exportAsANSI()
   * console.log(ansi) // Displays with colors in terminal
   * ```
   */
  exportAsANSI(): string {
    return Export.exportAsANSI(this);
  }

  /**
   * Export buffer as image data URL
   *
   * @param format - Image format ('png' or 'jpeg')
   * @param options - Image export options
   * @returns Promise resolving to data URL string
   *
   * @example
   * ```ts
   * const dataURL = await renderer.exportAsDataURL('png')
   * const img = document.createElement('img')
   * img.src = dataURL
   * ```
   */
  exportAsDataURL(
    format?: Export.ImageFormat,
    options?: Export.ExportImageOptions,
  ): Promise<string> {
    return Export.exportAsDataURL(this, format, options);
  }

  // ===== Preset Methods =====

  /**
   * Apply a text preset
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param text - Text to draw
   * @param presetName - Name of the text preset
   * @param overrides - Optional overrides for preset options
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * // Define preset first
   * definePreset('warning', { type: 'text', fg: 'yellow', bg: 'red' })
   *
   * // Use preset
   * renderer.applyTextPreset(10, 5, 'Warning!', 'warning')
   * ```
   */
  applyTextPreset(
    x: number,
    y: number,
    text: string,
    presetName: string,
    overrides?: TextOptions,
  ): this {
    const options = Presets.applyTextPreset(presetName, overrides);
    this.drawText(x, y, text, options);
    return this;
  }

  /**
   * Apply a box preset
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param width - Box width
   * @param height - Box height
   * @param presetName - Name of the box preset
   * @param overrides - Optional overrides for preset options
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * definePreset('panel', { type: 'box', style: 'double', fill: true })
   * renderer.applyBoxPreset(0, 0, 80, 24, 'panel')
   * ```
   */
  applyBoxPreset(
    x: number,
    y: number,
    width: number,
    height: number,
    presetName: string,
    overrides?: BoxOptions,
  ): this {
    const options = Presets.applyBoxPreset(presetName, overrides);
    this.box(x, y, width, height, options);
    return this;
  }

  /**
   * Apply a menu preset
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param items - Menu items
   * @param presetName - Name of the menu preset
   * @param overrides - Optional overrides for preset options
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * definePreset('mainMenu', {
   *   type: 'menu',
   *   selectedFg: 'black',
   *   selectedBg: 'cyan',
   *   border: true
   * })
   * renderer.applyMenuPreset(10, 5, ['Start', 'Quit'], 'mainMenu', {
   *   selected: 0
   * })
   * ```
   */
  applyMenuPreset(
    x: number,
    y: number,
    items: string[],
    presetName: string,
    overrides?: MenuOptions,
  ): this {
    const options = Presets.applyMenuPreset(presetName, overrides);
    this.menu(x, y, items, options);
    return this;
  }

  /**
   * Apply a progress bar preset
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param width - Bar width
   * @param progress - Progress value (0.0 to 1.0)
   * @param presetName - Name of the progress bar preset
   * @param overrides - Optional overrides for preset options
   * @returns The renderer instance for chaining
   *
   * @example
   * ```ts
   * definePreset('health', {
   *   type: 'progressBar',
   *   fillFg: 'red',
   *   emptyFg: 'gray'
   * })
   * renderer.applyProgressBarPreset(5, 5, 20, 0.75, 'health')
   * ```
   */
  applyProgressBarPreset(
    x: number,
    y: number,
    width: number,
    progress: number,
    presetName: string,
    overrides?: ProgressBarOptions,
  ): this {
    const options = Presets.applyProgressBarPreset(presetName, overrides);
    this.progressBar(x, y, width, progress, options);
    return this;
  }

  /**
   * Validation helpers for bounds checking
   *
   * Provides methods to check if drawing operations would be within bounds
   * before attempting to draw. Useful for conditional rendering logic.
   */
  get validate() {
    return {
      /**
       * Check if a cell position is within bounds
       *
       * @param x - X coordinate
       * @param y - Y coordinate
       * @returns True if position is valid, false otherwise
       *
       * @example
       * ```ts
       * if (renderer.validate.cell(x, y)) {
       *   renderer.setChar(x, y, '@')
       * }
       * ```
       */
      cell: (x: number, y: number): boolean => {
        return this.isInBounds(x, y);
      },

      /**
       * Check if a box would fit within bounds
       *
       * @param x - Starting X coordinate
       * @param y - Starting Y coordinate
       * @param width - Box width
       * @param height - Box height
       * @returns True if box fits entirely within bounds, false otherwise
       *
       * @example
       * ```ts
       * if (renderer.validate.box(x, y, 20, 10)) {
       *   renderer.box(x, y, 20, 10)
       * } else {
       *   console.warn('Box out of bounds')
       * }
       * ```
       */
      box: (x: number, y: number, width: number, height: number): boolean => {
        return (
          this.isInBounds(x, y) &&
          this.isInBounds(x + width - 1, y + height - 1)
        );
      },

      /**
       * Check if text would fit within bounds
       *
       * @param x - Starting X coordinate
       * @param y - Y coordinate
       * @param text - Text string to check
       * @returns True if text fits entirely within bounds, false otherwise
       *
       * @example
       * ```ts
       * if (renderer.validate.text(x, y, message)) {
       *   renderer.drawText(x, y, message)
       * } else {
       *   // Truncate or wrap text
       *   renderer.drawText(x, y, message.substring(0, 10))
       * }
       * ```
       */
      text: (x: number, y: number, text: string): boolean => {
        if (text.length === 0) return this.isInBounds(x, y);
        return this.isInBounds(x, y) && this.isInBounds(x + text.length - 1, y);
      },

      /**
       * Check if a line would fit within bounds
       *
       * @param x1 - Starting X coordinate
       * @param y1 - Starting Y coordinate
       * @param x2 - Ending X coordinate
       * @param y2 - Ending Y coordinate
       * @returns True if both endpoints are within bounds, false otherwise
       *
       * @example
       * ```ts
       * if (renderer.validate.line(x1, y1, x2, y2)) {
       *   renderer.drawLine(x1, y1, x2, y2, '-')
       * }
       * ```
       */
      line: (x1: number, y1: number, x2: number, y2: number): boolean => {
        return this.isInBounds(x1, y1) && this.isInBounds(x2, y2);
      },
    };
  }
}
