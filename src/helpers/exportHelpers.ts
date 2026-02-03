/**
 * Export and screenshot helper functions
 * Provides various export formats for renderer output
 */

import type { Color } from "../types/types";
import type { Renderer } from "../core/Renderer";
import { toCSSColor } from "../drawing/colors";

/**
 * Export options for data URL/image export
 */
export interface ExportImageOptions {
  /** Character width in pixels (default: 10) */
  charWidth?: number;
  /** Character height in pixels (default: 16) */
  charHeight?: number;
  /** Font family (default: 'monospace') */
  fontFamily?: string;
  /** Font size in pixels (default: 14) */
  fontSize?: number;
  /** Background color for transparent areas */
  backgroundColor?: Color;
}

/**
 * Image format for export
 */
export type ImageFormat = "png" | "jpeg";

/**
 * ANSI color code mappings
 */
const ANSI_COLORS: Record<string, string> = {
  black: "30",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  white: "37",
  gray: "90",
  grey: "90",
  brightRed: "91",
  brightGreen: "92",
  brightYellow: "93",
  brightBlue: "94",
  brightMagenta: "95",
  brightCyan: "96",
  brightWhite: "97",
};

const ANSI_BG_COLORS: Record<string, string> = {
  black: "40",
  red: "41",
  green: "42",
  yellow: "43",
  blue: "44",
  magenta: "45",
  cyan: "46",
  white: "47",
  gray: "100",
  grey: "100",
  brightRed: "101",
  brightGreen: "102",
  brightYellow: "103",
  brightBlue: "104",
  brightMagenta: "105",
  brightCyan: "106",
  brightWhite: "107",
};

/**
 * Export renderer buffer as plain text string
 *
 * Exports the current buffer content as a plain text string,
 * with newlines separating rows. Colors are not included.
 *
 * @param renderer - Renderer instance to export
 * @returns Plain text representation of the buffer
 *
 * @example
 * ```ts
 * const text = renderer.exportAsString()
 * console.log(text)
 * // or save to file
 * fs.writeFileSync('output.txt', text)
 * ```
 */
export function exportAsString(renderer: Renderer): string {
  const lines: string[] = [];

  for (let y = 0; y < renderer.height; y++) {
    let line = "";
    for (let x = 0; x < renderer.width; x++) {
      const cell = renderer.getCell(x, y);
      line += cell?.char ?? " ";
    }
    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Get ANSI color code for a color
 */
function getANSIColor(color: Color, isBg = false): string | null {
  if (color === null) return null;

  if (typeof color === "string") {
    const colorMap = isBg ? ANSI_BG_COLORS : ANSI_COLORS;
    return colorMap[color] ?? null;
  }

  // For hex and RGB colors, convert to closest named color
  // This is a simplified approach - in a real implementation,
  // you might want to use 24-bit ANSI color codes
  return null;
}

/**
 * Export renderer buffer as ANSI-colored text
 *
 * Exports the buffer with ANSI escape codes for terminal colors.
 * Useful for saving terminal output or piping to terminal-compatible viewers.
 *
 * @param renderer - Renderer instance to export
 * @returns ANSI-colored text string
 *
 * @example
 * ```ts
 * const ansi = renderer.exportAsANSI()
 * console.log(ansi) // Will display with colors in terminal
 * fs.writeFileSync('output.ansi', ansi)
 * ```
 */
export function exportAsANSI(renderer: Renderer): string {
  const lines: string[] = [];

  for (let y = 0; y < renderer.height; y++) {
    let line = "";
    let currentFg: Color = null;
    let currentBg: Color = null;

    for (let x = 0; x < renderer.width; x++) {
      const cell = renderer.getCell(x, y);
      const char = cell?.char ?? " ";
      const fg = cell?.fg ?? null;
      const bg = cell?.bg ?? null;

      // Check if we need to change colors
      if (fg !== currentFg || bg !== currentBg) {
        // Reset if we had colors before
        if (currentFg !== null || currentBg !== null) {
          line += "\x1b[0m";
        }

        // Apply new colors
        const codes: string[] = [];
        const fgCode = getANSIColor(fg, false);
        const bgCode = getANSIColor(bg, true);

        if (fgCode) codes.push(fgCode);
        if (bgCode) codes.push(bgCode);

        if (codes.length > 0) {
          line += `\x1b[${codes.join(";")}m`;
        }

        currentFg = fg;
        currentBg = bg;
      }

      line += char;
    }

    // Reset colors at end of line
    if (currentFg !== null || currentBg !== null) {
      line += "\x1b[0m";
    }

    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Export renderer buffer as image data URL
 *
 * Renders the buffer to a canvas and exports as a data URL.
 * Can be used to save as image or display in img tag.
 *
 * @param renderer - Renderer instance to export
 * @param format - Image format ('png' or 'jpeg')
 * @param options - Image export options
 * @returns Promise resolving to data URL string
 *
 * @example
 * ```ts
 * // Export as PNG
 * const dataURL = await renderer.exportAsDataURL('png')
 * const img = document.createElement('img')
 * img.src = dataURL
 *
 * // Export as JPEG with custom dimensions
 * const jpeg = await renderer.exportAsDataURL('jpeg', {
 *   charWidth: 12,
 *   charHeight: 20
 * })
 * ```
 */
export async function exportAsDataURL(
  renderer: Renderer,
  format: ImageFormat = "png",
  options: ExportImageOptions = {},
): Promise<string> {
  const {
    charWidth = 10,
    charHeight = 16,
    fontFamily = "monospace",
    fontSize = 14,
    backgroundColor = "black",
  } = options;

  // Create an offscreen canvas
  const canvas =
    typeof document !== "undefined"
      ? document.createElement("canvas")
      : // For Node.js environments, would need a canvas polyfill
        // For now, throw an error
        (() => {
          throw new Error(
            "exportAsDataURL requires a browser environment or canvas polyfill",
          );
        })();

  const width = renderer.width * charWidth;
  const height = renderer.height * charHeight;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  // Set up font
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";

  // Fill background
  ctx.fillStyle = toCSSColor(backgroundColor);
  ctx.fillRect(0, 0, width, height);

  // Render each cell
  for (let y = 0; y < renderer.height; y++) {
    for (let x = 0; x < renderer.width; x++) {
      const cell = renderer.getCell(x, y);
      if (!cell) continue;

      const pixelX = x * charWidth;
      const pixelY = y * charHeight;

      // Draw background
      if (cell.bg !== null) {
        ctx.fillStyle = toCSSColor(cell.bg);
        ctx.fillRect(pixelX, pixelY, charWidth, charHeight);
      }

      // Draw character
      if (cell.char && cell.char !== " ") {
        ctx.fillStyle = toCSSColor(cell.fg ?? "white");
        ctx.fillText(cell.char, pixelX, pixelY);
      }
    }
  }

  // Convert to data URL
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  return canvas.toDataURL(mimeType);
}
