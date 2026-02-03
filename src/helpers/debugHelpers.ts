/**
 * Debug helper functions for development and troubleshooting
 * These helpers provide visualization and inspection tools
 */

import type { Color } from "../types/types";
import type { DrawingContext } from "../drawing/drawingMethods";
import type { Renderer } from "../core/Renderer";

/**
 * Options for showing a grid overlay
 */
export interface ShowGridOptions {
  /** Grid line spacing (default: 10) */
  spacing?: number;
  /** Grid line color */
  fg?: Color;
  /** Character to use for grid lines (default: '·' for dots, '┼' for intersections) */
  char?: string;
}

/**
 * Options for showing bounds
 */
export interface ShowBoundsOptions {
  /** Foreground color */
  fg?: Color;
  /** Label to display (positioned at top-left corner) */
  label?: string;
  /** Fill the bounds with a transparent pattern */
  fill?: boolean;
}

/**
 * Options for showing FPS counter
 */
export interface ShowFPSOptions {
  /** X position (default: 0) */
  x?: number;
  /** Y position (default: 0) */
  y?: number;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
}

/**
 * Options for showing pointer coordinates
 */
export interface ShowPointerCoordsOptions {
  /** X position for the display (default: 0) */
  x?: number;
  /** Y position for the display (default: 0) */
  y?: number;
  /** Foreground color */
  fg?: Color;
  /** Background color */
  bg?: Color;
}

/**
 * Cell information returned by logCell
 */
export interface CellInfo {
  x: number;
  y: number;
  char: string;
  fg: Color;
  bg: Color;
}

/**
 * Draw a grid overlay for alignment and positioning
 *
 * Useful during development to visualize grid coordinates and spacing.
 * Grid lines are drawn at regular intervals with optional custom spacing.
 *
 * @param ctx - Drawing context
 * @param options - Grid display options
 *
 * @example
 * ```ts
 * // Show grid every 10 cells
 * renderer.debug.showGrid()
 *
 * // Custom spacing and color
 * renderer.debug.showGrid({ spacing: 5, fg: 'gray' })
 * ```
 */
export function showGrid(
  ctx: DrawingContext,
  options: ShowGridOptions = {},
): void {
  const { spacing = 10, fg = "gray", char } = options;

  // Draw vertical lines
  for (let x = 0; x < ctx.width; x += spacing) {
    for (let y = 0; y < ctx.height; y++) {
      const isIntersection = y % spacing === 0;
      const gridChar = char ?? (isIntersection ? "┼" : "│");
      ctx.setChar(x, y, gridChar, fg, null);
    }
  }

  // Draw horizontal lines
  for (let y = 0; y < ctx.height; y += spacing) {
    for (let x = 0; x < ctx.width; x++) {
      const isIntersection = x % spacing === 0;
      const gridChar = char ?? (isIntersection ? "┼" : "─");
      ctx.setChar(x, y, gridChar, fg, null);
    }
  }
}

/**
 * Visualize the bounds of a rectangular area
 *
 * Draws a bounding box around an area, useful for debugging collision boxes,
 * entity positions, or UI element boundaries.
 *
 * @param ctx - Drawing context
 * @param x - X coordinate of top-left corner
 * @param y - Y coordinate of top-left corner
 * @param width - Width of the bounds
 * @param height - Height of the bounds
 * @param options - Bounds display options
 *
 * @example
 * ```ts
 * // Show entity bounds
 * renderer.debug.showBounds(entity.x, entity.y, entity.width, entity.height, {
 *   fg: 'red',
 *   label: 'Player'
 * })
 * ```
 */
export function showBounds(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options: ShowBoundsOptions = {},
): void {
  const { fg = "yellow", label, fill = false } = options;

  // Draw bounding box
  ctx.box(x, y, width, height, {
    style: "single",
    fg,
    fill,
    fillChar: fill ? "░" : " ",
  });

  // Draw label if provided
  if (label) {
    ctx.drawText(x + 1, y, label, { fg, bg: "black" });
  }
}

/**
 * Display FPS (frames per second) counter
 *
 * Shows the current frame rate, useful for performance monitoring during development.
 * Typically called in the render function with the FPS value from GameLoop.
 *
 * @param ctx - Drawing context
 * @param fps - Current FPS value
 * @param options - FPS display options
 *
 * @example
 * ```ts
 * // In your render function
 * renderer.debug.showFPS(gameLoop.getFPS(), { x: 70, y: 0, fg: 'green' })
 * ```
 */
export function showFPS(
  ctx: DrawingContext,
  fps: number,
  options: ShowFPSOptions = {},
): void {
  const { x = 0, y = 0, fg = "green", bg } = options;

  const fpsText = `FPS: ${Math.round(fps)}`;
  ctx.drawText(x, y, fpsText, { fg, bg });
}

/**
 * Display pointer/mouse coordinates
 *
 * Shows the current grid position of the pointer, useful for debugging
 * click handlers and hover effects.
 *
 * @param ctx - Drawing context
 * @param pointerX - Pointer X grid coordinate
 * @param pointerY - Pointer Y grid coordinate
 * @param options - Display options
 *
 * @example
 * ```ts
 * // Show pointer position (call in render with pointer manager)
 * const pos = pointerManager.getPosition()
 * renderer.debug.showPointerCoords(pos.x, pos.y, { fg: 'cyan' })
 * ```
 */
export function showPointerCoords(
  ctx: DrawingContext,
  pointerX: number,
  pointerY: number,
  options: ShowPointerCoordsOptions = {},
): void {
  const { x = 0, y = 0, fg = "cyan", bg } = options;

  const coordsText = `X:${pointerX} Y:${pointerY}`;
  ctx.drawText(x, y, coordsText, { fg, bg });
}

/**
 * Get detailed information about a cell
 *
 * Returns the character, colors, and position of a specific cell.
 * Useful for debugging rendering issues or inspecting cell states.
 *
 * @param ctx - Drawing context (unused but kept for consistency)
 * @param renderer - Renderer instance to inspect
 * @param x - X coordinate of the cell
 * @param y - Y coordinate of the cell
 * @returns Cell information object, or null if out of bounds
 *
 * @example
 * ```ts
 * // Log cell info to console
 * const info = renderer.debug.logCell(10, 5)
 * console.log(info) // { x: 10, y: 5, char: 'A', fg: 'red', bg: 'blue' }
 * ```
 */
export function logCell(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: DrawingContext,
  renderer: Renderer,
  x: number,
  y: number,
): CellInfo | null {
  // Check bounds
  if (x < 0 || y < 0 || x >= renderer.width || y >= renderer.height) {
    return null;
  }

  // Get cell from renderer
  const cell = renderer.getCell(x, y);

  if (!cell) {
    // Return empty cell info
    return {
      x,
      y,
      char: " ",
      fg: null,
      bg: null,
    };
  }

  return {
    x,
    y,
    char: cell.char,
    fg: cell.fg,
    bg: cell.bg,
  };
}
