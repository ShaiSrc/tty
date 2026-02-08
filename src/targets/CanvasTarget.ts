/**
 * Canvas-based render target for browser environments
 */

import type { Color, RenderTarget } from "../types/types";
import { toCSSColor } from "../drawing/colors";

/**
 * Options for CanvasTarget initialization
 */
export interface CanvasTargetOptions {
  /** Width in characters */
  width: number;
  /** Height in characters */
  height: number;
  /** Character width in pixels */
  charWidth?: number;
  /** Character height in pixels */
  charHeight?: number;
  /** Font family */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
}

/**
 * Renders to an HTML Canvas element
 */
export class CanvasTarget implements RenderTarget {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private charWidth: number;
  private charHeight: number;
  private fontFamily: string;
  private fontSize: number;

  /**
   * Create a new CanvasTarget
   * @param canvas - Canvas element to render to
   * @param options - Canvas configuration including width, height, and rendering options
   */
  constructor(canvas: HTMLCanvasElement, options: CanvasTargetOptions) {
    this.canvas = canvas;
    this.width = options.width;
    this.height = options.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }
    this.ctx = ctx;

    // Set defaults
    this.charWidth = options.charWidth ?? 8;
    this.charHeight = options.charHeight ?? 16;
    this.fontFamily = options.fontFamily ?? "monospace";
    this.fontSize = options.fontSize ?? 14;

    // Configure canvas size
    this.canvas.width = this.width * this.charWidth;
    this.canvas.height = this.height * this.charHeight;

    // Configure context
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    this.ctx.textBaseline = "top";
  }

  /**
   * Set a character at the specified position
   */
  setCell(x: number, y: number, char: string, fg: Color, bg: Color): void {
    const pixelX = x * this.charWidth;
    const pixelY = y * this.charHeight;

    // Draw background
    if (bg !== null) {
      this.ctx.fillStyle = toCSSColor(bg);
      this.ctx.fillRect(pixelX, pixelY, this.charWidth, this.charHeight);
    }

    // Draw character
    if (char && char !== " ") {
      this.ctx.fillStyle = toCSSColor(fg);
      this.ctx.fillText(char, pixelX, pixelY);
    }
  }

  /**
   * Set a scaled character occupying multiple cells
   */
  setCellScaled(
    x: number,
    y: number,
    scale: number,
    char: string,
    fg: Color,
    bg: Color,
  ): void {
    const pixelX = x * this.charWidth;
    const pixelY = y * this.charHeight;
    const pixelWidth = scale * this.charWidth;
    const pixelHeight = scale * this.charHeight;

    // Draw background across all cells
    if (bg !== null) {
      this.ctx.fillStyle = toCSSColor(bg);
      this.ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
    }

    // Draw scaled character
    if (char && char !== " ") {
      this.ctx.save();

      // Scale font for larger rendering
      const scaledFontSize = this.fontSize * scale;
      this.ctx.font = `${scaledFontSize}px ${this.fontFamily}`;

      // Measure text for centering
      const metrics = this.ctx.measureText(char);
      const textWidth = metrics.width;

      // Center character in the unified cell area
      // textBaseline is 'top', so we need to adjust Y positioning
      const offsetX = (pixelWidth - textWidth) / 2;
      const offsetY = (pixelHeight - scaledFontSize * 0.8) / 2;

      this.ctx.fillStyle = toCSSColor(fg);
      this.ctx.fillText(char, pixelX + offsetX, pixelY + offsetY);

      this.ctx.restore();
    }
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Flush changes (no-op for canvas as drawing is immediate)
   */
  flush(): void {
    // Canvas updates are immediate, no buffering needed
  }

  /**
   * Get the size of the render target
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Update canvas options
   */
  setOptions(options: Partial<CanvasTargetOptions>): void {
    if (options.charWidth !== undefined) {
      this.charWidth = options.charWidth;
      this.canvas.width = this.width * this.charWidth;
    }
    if (options.charHeight !== undefined) {
      this.charHeight = options.charHeight;
      this.canvas.height = this.height * this.charHeight;
    }
    if (options.fontFamily !== undefined) {
      this.fontFamily = options.fontFamily;
      this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    }
    if (options.fontSize !== undefined) {
      this.fontSize = options.fontSize;
      this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    }
  }
}
