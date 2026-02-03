/* eslint-disable max-lines */
/**
 * Renderer drawing methods - extracted to reduce file size
 */

import type {
  Color,
  TextOptions,
  BoxOptions,
  MenuOptions,
  ProgressBarOptions,
  PanelOptions,
} from "../types/types";
import { calculateCenterX, calculateRightX } from "../helpers/alignment";
import { getBorderChars } from "../helpers/boxHelpers";
import {
  drawBoxBorders,
  drawBoxShadow,
  drawBoxTitle,
} from "../helpers/boxDrawingHelpers";
import { drawMenu } from "../helpers/menuHelpers";
import {
  drawHorizontalProgress,
  drawVerticalProgress,
} from "./progressBarHelpers";
import { drawPanelContent, drawBorderText } from "../helpers/panelHelpers";

/**
 * Drawing methods interface
 */
export interface DrawingContext {
  setChar: (x: number, y: number, char: string, fg?: Color, bg?: Color) => void;
  drawText: (x: number, y: number, text: string, options?: TextOptions) => void;
  drawLine: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    char: string,
    options?: TextOptions,
  ) => void;
  fill: (
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
    fg?: Color,
    bg?: Color,
  ) => void;
  box: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: BoxOptions,
  ) => void;
  width: number;
  height: number;
  defaultFg: Color;
  defaultBg: Color;
}

/**
 * Draw a box with borders
 */
export function drawBox(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options: BoxOptions = {},
): void {
  const style = options.style ?? "single";
  const borders = getBorderChars(style);
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  // Draw borders
  drawBoxBorders(ctx, x, y, width, height, borders, fg, bg);

  // Draw title if provided
  if (options.title) {
    const titleFg = options.titleFg ?? fg;
    const titleAlign = options.titleAlign ?? "center";
    drawBoxTitle(ctx, x, y, width, options.title, titleFg, titleAlign, bg);
  }

  // Fill interior if requested
  if (options.fill) {
    const fillChar = options.fillChar ?? " ";
    for (let j = 1; j < height - 1; j++) {
      for (let i = 1; i < width - 1; i++) {
        ctx.setChar(x + i, y + j, fillChar, fg, bg);
      }
    }
  }

  // Draw shadow if requested
  if (options.shadow) {
    drawBoxShadow(ctx, x, y, width, height);
  }
}

/**
 * Draw a border-only box (no interior)
 */
export function drawBorder(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options: BoxOptions = {},
): void {
  drawBox(ctx, x, y, width, height, { ...options, fill: false });
}

/**
 * Draw a filled rectangle
 */
export function drawRect(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  fillChar = " ",
  options: BoxOptions = {},
): void {
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  ctx.fill(x, y, width, height, fillChar, fg, bg);
}

/**
 * Draw centered text
 */
export function drawCenterText(
  ctx: DrawingContext,
  y: number,
  text: string,
  options: TextOptions = {},
  startX = 0,
  width?: number,
): void {
  const targetWidth = width ?? ctx.width;
  const x = calculateCenterX(text, startX, targetWidth);
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  for (let i = 0; i < text.length; i++) {
    ctx.setChar(x + i, y, text[i], fg, bg);
  }
}

/**
 * Draw right-aligned text
 */
export function drawRightAlign(
  ctx: DrawingContext,
  y: number,
  text: string,
  options: TextOptions = {},
  startX = 0,
  width?: number,
): void {
  const targetWidth = width ?? ctx.width;
  const x = calculateRightX(text, startX, targetWidth);
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  for (let i = 0; i < text.length; i++) {
    ctx.setChar(x + i, y, text[i], fg, bg);
  }
}

/**
 * Draw left-aligned text
 */
export function drawLeftAlign(
  ctx: DrawingContext,
  y: number,
  text: string,
  options: TextOptions = {},
  offsetX = 0,
): void {
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  for (let i = 0; i < text.length; i++) {
    ctx.setChar(offsetX + i, y, text[i], fg, bg);
  }
}

/**
 * Draw aligned text (dynamic alignment)
 */
export function drawAlignText(
  ctx: DrawingContext,
  y: number,
  text: string,
  align: "left" | "center" | "right",
  options: TextOptions = {},
  startX = 0,
  width?: number,
): void {
  switch (align) {
    case "center":
      drawCenterText(ctx, y, text, options, startX, width);
      break;
    case "right":
      drawRightAlign(ctx, y, text, options, startX, width);
      break;
    case "left":
    default:
      drawLeftAlign(ctx, y, text, options, startX);
      break;
  }
}

/**
 * Draw a progress bar
 */
export function drawProgressBar(
  ctx: DrawingContext,
  x: number,
  y: number,
  length: number,
  progress: number,
  options: ProgressBarOptions = {},
): void {
  if (options.vertical) {
    drawVerticalProgress(ctx.setChar, x, y, length, progress, options);
  } else {
    drawHorizontalProgress(ctx.setChar, x, y, length, progress, options);
  }
}

/**
 * Draw a panel
 */
export function drawPanel(
  ctx: DrawingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PanelOptions = {},
): void {
  const style = options.style ?? "single";
  const padding = options.padding ?? 0;
  const titleAlign = options.titleAlign ?? "left";
  const contentAlign = options.contentAlign ?? "left";
  const scrollOffset = options.scrollOffset ?? 0;

  // Draw the box
  ctx.box(x, y, width, height, {
    style,
    fg: options.fg,
    bg: options.bg,
    fill: options.fill,
    fillChar: options.fillChar,
  });

  // Draw title if provided
  if (options.title) {
    drawBorderText(
      ctx.setChar,
      options.title,
      x,
      y,
      width,
      titleAlign,
      options.fg,
      options.bg,
    );
  }

  // Draw footer if provided
  if (options.footer) {
    drawBorderText(
      ctx.setChar,
      options.footer,
      x,
      y + height - 1,
      width,
      titleAlign,
      options.fg,
      options.bg,
    );
  }

  // Draw content if provided
  if (options.content && options.content.length > 0) {
    drawPanelContent(
      ctx.drawText,
      x,
      y,
      width,
      height,
      options.content,
      contentAlign,
      scrollOffset,
      padding,
      options.fg,
      options.bg,
    );
  }
}

/**
 * Draw a line between two points using Bresenham's algorithm
 */
export function drawLine(
  ctx: DrawingContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  char: string,
  options: TextOptions = {},
): void {
  const fg = options.fg ?? ctx.defaultFg;
  const bg = options.bg ?? ctx.defaultBg;

  // Bresenham's line algorithm
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let currentX = x1;
  let currentY = y1;

  while (true) {
    ctx.setChar(currentX, currentY, char, fg, bg);

    if (currentX === x2 && currentY === y2) {
      break;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currentX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currentY += sy;
    }
  }
}

/**
 * Draw a menu
 */
export function drawMenuHelper(
  ctx: DrawingContext,
  x: number,
  y: number,
  items: string[],
  options: MenuOptions = {},
): void {
  drawMenu(
    items,
    options,
    {
      box: ctx.box,
      setChar: ctx.setChar,
      drawText: ctx.drawText,
      fill: ctx.fill,
    },
    x,
    y,
  );
}
