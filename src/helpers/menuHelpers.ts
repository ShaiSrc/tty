/**
 * Menu rendering helper functions
 */

import type { MenuOptions, Color } from "../types/types";

/** Drawing functions interface */
interface DrawFunctions {
  box: (x: number, y: number, w: number, h: number, opts: any) => void;
  setChar: (x: number, y: number, char: string, fg: Color, bg: Color) => void;
  drawText: (x: number, y: number, text: string, opts: any) => void;
  fill: (
    x: number,
    y: number,
    w: number,
    h: number,
    char: string,
    fg: Color,
    bg: Color,
  ) => void;
}

/** Calculate menu dimensions */
function calculateMenuDimensions(items: string[], options: MenuOptions) {
  const { indicator = "", padding = 1, border = false } = options;

  const maxItemLength = items.reduce(
    (max, item) => Math.max(max, item.length),
    0,
  );
  const indicatorWidth = indicator ? indicator.length + 1 : 0;
  const contentWidth = indicatorWidth + maxItemLength;
  const innerWidth = contentWidth + padding * 2;
  const menuWidth = options.width ?? (border ? innerWidth + 2 : innerWidth);
  const menuHeight = items.length + (border ? 2 : 0);

  return { menuWidth, menuHeight, indicatorWidth };
}

/** Draw menu border and title */
function drawBorderAndTitle(
  options: MenuOptions,
  dimensions: { menuWidth: number; menuHeight: number },
  drawFn: DrawFunctions,
  x: number,
  y: number,
) {
  const { border, style = "single", title, fg = null, bg = null } = options;

  if (border) {
    drawFn.box(x, y, dimensions.menuWidth, dimensions.menuHeight, {
      style,
      fg,
      bg,
    });

    if (title) {
      drawFn.drawText(x + 1, y, ` ${title} `, { fg, bg });
    }
  }
}

/** Draw a single menu item */
function drawMenuItem(
  item: string,
  index: number,
  options: MenuOptions,
  dimensions: { menuWidth: number; indicatorWidth: number },
  positions: { itemStartX: number; itemStartY: number },
  drawFn: DrawFunctions,
  x: number,
) {
  const {
    selected,
    fg = null,
    bg = null,
    selectedFg = "black",
    selectedBg = "white",
    indicator = "",
    border = false,
  } = options;

  const itemY = positions.itemStartY + index;
  const isSelected = selected === index;
  const itemFg = isSelected ? selectedFg : fg;
  const itemBg = isSelected ? selectedBg : bg;

  let textX = positions.itemStartX;

  // Draw indicator
  if (indicator) {
    const indicatorChar = isSelected ? indicator : " ".repeat(indicator.length);
    const indicatorX = positions.itemStartX - indicator.length;
    drawFn.drawText(indicatorX, itemY, indicatorChar, {
      fg: itemFg,
      bg: itemBg,
    });
  }

  // Fill background
  if (bg !== null || isSelected) {
    drawFn.fill(textX, itemY, item.length, 1, " ", itemFg, itemBg);
  }

  // Handle centering for custom width
  if (options.width) {
    const fillStart = border ? x + 1 : x;
    const fillWidth = border ? dimensions.menuWidth - 2 : dimensions.menuWidth;
    drawFn.fill(fillStart, itemY, fillWidth, 1, " ", itemFg, itemBg);

    const availableWidth = border
      ? dimensions.menuWidth - 2
      : dimensions.menuWidth;
    const textWidth = dimensions.indicatorWidth + item.length;
    const centerOffset = Math.floor((availableWidth - textWidth) / 2);
    textX = (border ? x + 1 : x) + centerOffset + dimensions.indicatorWidth;
  }

  drawFn.drawText(textX, itemY, item, { fg: itemFg, bg: itemBg });
}

/** Internal helper to draw a menu */
export function drawMenu(
  items: string[],
  options: MenuOptions,
  drawFn: DrawFunctions,
  x: number,
  y: number,
): void {
  const { border = false, style = "single", fg = null, bg = null } = options;

  // Handle empty items
  if (items.length === 0) {
    if (border) {
      drawFn.box(x, y, options.width ?? 10, 2, { style, fg, bg });
    } else {
      drawFn.setChar(x, y, " ", fg, bg);
    }
    return;
  }

  // Calculate dimensions
  const dimensions = calculateMenuDimensions(items, options);

  // Draw border and title
  drawBorderAndTitle(options, dimensions, drawFn, x, y);

  // Calculate starting positions
  const padding = options.padding ?? 1;
  const positions = {
    itemStartY: border ? y + 1 : y + 1,
    itemStartX: border ? x + 1 + padding : x + padding + 1,
  };

  // Draw all items
  for (let i = 0; i < items.length; i++) {
    drawMenuItem(items[i], i, options, dimensions, positions, drawFn, x);
  }
}
