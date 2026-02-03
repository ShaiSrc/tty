/**
 * Text alignment helper functions
 */

import type { TextOptions } from "../types/types";

/**
 * Calculate X position for centered text
 */
export function calculateCenterX(
  text: string,
  startX: number,
  width: number,
): number {
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((width - textLength) / 2));
  return startX + padding;
}

/**
 * Calculate X position for right-aligned text
 */
export function calculateRightX(
  text: string,
  startX: number,
  width: number,
): number {
  const textLength = text.length;
  return startX + Math.max(0, width - textLength);
}

/**
 * Calculate X position for aligned text
 */
export function calculateAlignedX(
  text: string,
  options: TextOptions,
  startX: number,
  width: number,
): number {
  const align = options.align ?? "left";

  switch (align) {
    case "center":
      return calculateCenterX(text, startX, width);
    case "right":
      return calculateRightX(text, startX, width);
    case "left":
    default:
      return startX;
  }
}

/**
 * Box alignment anchor positions
 */
export type BoxAnchor =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Calculate position for aligned box
 */
export function calculateAlignedBox(
  anchor: BoxAnchor,
  boxWidth: number,
  boxHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  offsetX = 0,
  offsetY = 0,
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  // Calculate base position based on anchor
  switch (anchor) {
    case "center":
      x = Math.floor((viewportWidth - boxWidth) / 2);
      y = Math.floor((viewportHeight - boxHeight) / 2);
      break;
    case "top":
      x = Math.floor((viewportWidth - boxWidth) / 2);
      y = 0;
      break;
    case "bottom":
      x = Math.floor((viewportWidth - boxWidth) / 2);
      y = viewportHeight - boxHeight;
      break;
    case "left":
      x = 0;
      y = Math.floor((viewportHeight - boxHeight) / 2);
      break;
    case "right":
      x = viewportWidth - boxWidth;
      y = Math.floor((viewportHeight - boxHeight) / 2);
      break;
    case "top-left":
      x = 0;
      y = 0;
      break;
    case "top-right":
      x = viewportWidth - boxWidth;
      y = 0;
      break;
    case "bottom-left":
      x = 0;
      y = viewportHeight - boxHeight;
      break;
    case "bottom-right":
      x = viewportWidth - boxWidth;
      y = viewportHeight - boxHeight;
      break;
  }

  // Apply offsets
  return {
    x: x + offsetX,
    y: y + offsetY,
  };
}
