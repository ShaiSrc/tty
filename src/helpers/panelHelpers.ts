/**
 * Helper functions for panel rendering
 * Extracted to manage complexity and file size
 */

import type { TextAlign, Color } from "../types/types";

/**
 * Calculate content area dimensions
 */
export function calculateContentArea(
  width: number,
  height: number,
  padding: number,
): {
  contentWidth: number;
  contentHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const contentWidth = width - 2 - padding * 2; // minus borders and padding
  const contentHeight = height - 2 - padding * 2;
  const offsetX = 1 + padding; // border + padding
  const offsetY = 1 + padding;

  return { contentWidth, contentHeight, offsetX, offsetY };
}

/**
 * Calculate position for aligned text within a width
 */
export function calculateTextPosition(
  text: string,
  width: number,
  align: TextAlign,
  baseX: number,
): number {
  switch (align) {
    case "center":
      return baseX + Math.floor((width - text.length) / 2);
    case "right":
      return baseX + width - text.length;
    case "left":
    default:
      return baseX;
  }
}

/**
 * Draw panel content with alignment and scrolling
 */
export function drawPanelContent(
  drawText: (x: number, y: number, text: string, options?: any) => void,
  x: number,
  y: number,
  width: number,
  height: number,
  content: string[],
  contentAlign: TextAlign,
  scrollOffset: number,
  padding: number,
  fg?: Color,
  bg?: Color,
): void {
  const area = calculateContentArea(width, height, padding);
  const startLine = Math.max(0, scrollOffset);
  const endLine = Math.min(content.length, startLine + area.contentHeight);

  for (let i = startLine; i < endLine; i++) {
    const line = content[i];
    const lineY = y + area.offsetY + (i - startLine);
    const lineX = calculateTextPosition(
      line,
      area.contentWidth,
      contentAlign,
      x + area.offsetX,
    );

    drawText(lineX, lineY, line, { fg, bg });
  }
}

/**
 * Draw title or footer in border
 */
export function drawBorderText(
  setChar: (x: number, y: number, char: string, fg?: Color, bg?: Color) => void,
  text: string,
  x: number,
  y: number,
  width: number,
  align: TextAlign,
  fg?: Color,
  bg?: Color,
): void {
  const availableWidth = width - 4; // minus corners and spacing
  const trimmedText =
    text.length > availableWidth ? text.slice(0, availableWidth) : text;

  const textX = calculateTextPosition(
    trimmedText,
    availableWidth,
    align,
    x + 2,
  );

  for (let i = 0; i < trimmedText.length; i++) {
    setChar(textX + i, y, trimmedText[i], fg, bg);
  }
}
