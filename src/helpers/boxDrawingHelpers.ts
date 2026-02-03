/**
 * Box drawing helper functions
 */

import type { Color, TextAlign } from "../types/types";
import type { DrawingContext } from "../drawing/drawingMethods";
import type { getBorderChars } from "./boxHelpers";

/**
 * Helper function to draw box shadow
 */
export function drawBoxShadow(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const shadowChar = "░";
  const shadowFg = "gray";

  // Shadow on right edge (offset by 1)
  for (let j = 1; j <= height; j++) {
    ctx.setChar(x + width, y + j, shadowChar, shadowFg);
  }

  // Shadow on bottom edge (offset by 1)
  for (let i = 1; i <= width; i++) {
    ctx.setChar(x + i, y + height, shadowChar, shadowFg);
  }
}

/**
 * Helper function to draw box borders
 */
export function drawBoxBorders(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  borders: ReturnType<typeof getBorderChars>,
  fg: Color,
  bg: Color,
): void {
  // Draw corners
  ctx.setChar(x, y, borders.topLeft, fg, bg);
  ctx.setChar(x + width - 1, y, borders.topRight, fg, bg);
  ctx.setChar(x, y + height - 1, borders.bottomLeft, fg, bg);
  ctx.setChar(x + width - 1, y + height - 1, borders.bottomRight, fg, bg);

  // Draw horizontal borders
  for (let i = 1; i < width - 1; i++) {
    ctx.setChar(x + i, y, borders.horizontal, fg, bg);
    ctx.setChar(x + i, y + height - 1, borders.horizontal, fg, bg);
  }

  // Draw vertical borders
  for (let i = 1; i < height - 1; i++) {
    ctx.setChar(x, y + i, borders.vertical, fg, bg);
    ctx.setChar(x + width - 1, y + i, borders.vertical, fg, bg);
  }
}

/**
 * Helper function to draw a title in the top border of a box
 */
export function drawBoxTitle(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  title: string,
  titleFg: Color,
  titleAlign: TextAlign,
  bg: Color,
): void {
  const maxTitleLength = width - 4; // Leave space for borders and padding

  // Truncate title if too long
  const displayTitle =
    title.length > maxTitleLength ? title.substring(0, maxTitleLength) : title;

  // Add spacing around title
  const titleWithSpaces = ` ${displayTitle} `;
  const titleLength = titleWithSpaces.length;

  // Calculate title position based on alignment
  let titleX: number;
  if (titleAlign === "left") {
    titleX = x + 2;
  } else if (titleAlign === "right") {
    titleX = x + width - titleLength - 2;
  } else {
    // center
    titleX = x + Math.floor((width - titleLength) / 2);
  }

  // Draw the title
  for (let i = 0; i < titleLength; i++) {
    ctx.setChar(titleX + i, y, titleWithSpaces[i], titleFg, bg);
  }
}
