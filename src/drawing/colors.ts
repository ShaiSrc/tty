/**
 * Color utility functions for parsing, converting, and manipulating colors
 */

import type { Color, NamedColor, HexColor, RGBColor } from "../types/types";

/**
 * Named color to RGB mapping
 */
const NAMED_COLORS: Record<NamedColor, RGBColor> = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 255, b: 0 },
  yellow: { r: 255, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
  white: { r: 255, g: 255, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  brightRed: { r: 255, g: 85, b: 85 },
  brightGreen: { r: 85, g: 255, b: 85 },
  brightYellow: { r: 255, g: 255, b: 85 },
  brightBlue: { r: 85, g: 85, b: 255 },
  brightMagenta: { r: 255, g: 85, b: 255 },
  brightCyan: { r: 85, g: 255, b: 255 },
  brightWhite: { r: 255, g: 255, b: 255 },
};

/**
 * Check if a color is a named color
 */
function isNamedColor(color: Color): color is NamedColor {
  return typeof color === "string" && color in NAMED_COLORS;
}

/**
 * Check if a color is a hex color
 */
function isHexColor(color: Color): color is HexColor {
  return typeof color === "string" && color.startsWith("#");
}

/**
 * Check if a color is an RGB color
 */
function isRGBColor(color: Color): color is RGBColor {
  return (
    color !== null &&
    typeof color === "object" &&
    "r" in color &&
    "g" in color &&
    "b" in color
  );
}

/**
 * Parse any color format to RGB
 * @param color - Color in any supported format
 * @returns RGB color object or null
 */
export function parseColor(color: Color): RGBColor | null {
  if (color === null) {
    return null;
  }

  if (isRGBColor(color)) {
    return color;
  }

  if (isNamedColor(color)) {
    return NAMED_COLORS[color];
  }

  if (isHexColor(color)) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  return null;
}

/**
 * Convert RGB color to hex string
 * @param color - RGB color
 * @returns Hex color string
 */
export function rgbToHex(color: RGBColor): HexColor {
  const r = Math.max(0, Math.min(255, Math.round(color.r)));
  const g = Math.max(0, Math.min(255, Math.round(color.g)));
  const b = Math.max(0, Math.min(255, Math.round(color.b)));

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return hex as HexColor;
}

/**
 * Convert color to CSS-compatible string
 * @param color - Color in any format
 * @returns CSS color string
 */
export function toCSSColor(color: Color): string {
  const rgb = parseColor(color);
  if (rgb === null) {
    return "transparent";
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Interpolate between two colors
 * @param color1 - First color
 * @param color2 - Second color
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated RGB color
 */
export function lerp(color1: Color, color2: Color, t: number): RGBColor {
  const c1 = parseColor(color1) ?? { r: 0, g: 0, b: 0 };
  const c2 = parseColor(color2) ?? { r: 0, g: 0, b: 0 };
  const factor = Math.max(0, Math.min(1, t));

  return {
    r: c1.r + (c2.r - c1.r) * factor,
    g: c1.g + (c2.g - c1.g) * factor,
    b: c1.b + (c2.b - c1.b) * factor,
  };
}

/**
 * Brighten a color by a given amount
 * @param color - Color to brighten
 * @param amount - Amount to brighten (0-1)
 * @returns Brightened RGB color
 */
export function brighten(color: Color, amount: number): RGBColor {
  const rgb = parseColor(color) ?? { r: 0, g: 0, b: 0 };
  const factor = Math.max(0, Math.min(1, amount));

  return {
    r: rgb.r + (255 - rgb.r) * factor,
    g: rgb.g + (255 - rgb.g) * factor,
    b: rgb.b + (255 - rgb.b) * factor,
  };
}

/**
 * Darken a color by a given amount
 * @param color - Color to darken
 * @param amount - Amount to darken (0-1)
 * @returns Darkened RGB color
 */
export function darken(color: Color, amount: number): RGBColor {
  const rgb = parseColor(color) ?? { r: 0, g: 0, b: 0 };
  const factor = Math.max(0, Math.min(1, amount));

  return {
    r: rgb.r * (1 - factor),
    g: rgb.g * (1 - factor),
    b: rgb.b * (1 - factor),
  };
}
