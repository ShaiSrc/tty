import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

/**
 * Canvas snapshot helper for visual regression testing
 * Compares canvas output with baseline images using pixelmatch
 */
export class CanvasSnapshot {
  private readonly maxDiffPixelRatio: number;

  constructor(maxDiffPixelRatio: number = 0.001) {
    this.maxDiffPixelRatio = maxDiffPixelRatio;
  }

  /**
   * Take a snapshot of a canvas element and compare with baseline
   * @param page - Playwright page instance
   * @param canvasSelector - CSS selector for canvas element
   * @param snapshotName - Name for the snapshot file
   */
  async expectCanvasToMatchSnapshot(
    page: Page,
    canvasSelector: string,
    snapshotName: string,
  ): Promise<void> {
    const canvas = page.locator(canvasSelector);
    await expect(canvas).toBeVisible();

    // Take screenshot of canvas only
    const screenshot = await canvas.screenshot();

    // Use Playwright's built-in snapshot comparison with tolerance for cross-platform rendering
    await expect(screenshot).toMatchSnapshot(`${snapshotName}.png`, {
      maxDiffPixelRatio: 0.05, // Allow 5% pixel difference
      threshold: 0.2, // Per-pixel color threshold
    });
  }

  /**
   * Get canvas as image data URL
   * @param page - Playwright page instance
   * @param canvasSelector - CSS selector for canvas element
   * @returns Data URL of canvas content
   */
  async getCanvasDataURL(page: Page, canvasSelector: string): Promise<string> {
    return page.evaluate((selector) => {
      const canvas = document.querySelector(selector) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error(`Canvas not found: ${selector}`);
      }
      return canvas.toDataURL("image/png");
    }, canvasSelector);
  }

  /**
   * Compare two canvas screenshots manually using pixelmatch
   * @param img1 - First image buffer
   * @param img2 - Second image buffer
   * @returns Difference information
   */
  compareImages(
    img1: Buffer,
    img2: Buffer,
  ): { match: boolean; diffPixels: number; totalPixels: number } {
    const png1 = PNG.sync.read(img1);
    const png2 = PNG.sync.read(img2);

    const { width, height } = png1;
    const diff = new PNG({ width, height });

    const diffPixels = pixelmatch(
      png1.data,
      png2.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
      },
    );

    const totalPixels = width * height;
    const diffRatio = diffPixels / totalPixels;

    return {
      match: diffRatio <= this.maxDiffPixelRatio,
      diffPixels,
      totalPixels,
    };
  }

  /**
   * Wait for canvas to be rendered (non-blank)
   * @param page - Playwright page instance
   * @param canvasSelector - CSS selector for canvas element
   * @param timeout - Maximum wait time in ms
   */
  async waitForCanvasRendered(
    page: Page,
    canvasSelector: string,
    timeout: number = 5000,
  ): Promise<void> {
    await page.waitForFunction(
      (selector) => {
        const canvas = document.querySelector(selector) as HTMLCanvasElement;
        if (!canvas) return false;

        const ctx = canvas.getContext("2d");
        if (!ctx) return false;

        // Check if canvas has any non-transparent pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data.some((value) => value !== 0);
      },
      canvasSelector,
      { timeout },
    );
  }
}

/**
 * Default canvas snapshot helper instance
 */
export const canvasSnapshot = new CanvasSnapshot();
