import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvasSnapshot";

test.describe("Scaled Characters Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5174/examples/");
  });

  test("should render the scaled characters demo", async ({ page }) => {
    // Click the button to start the demo
    await page.click('[data-testid="run-scaled-characters"]');

    // Wait for the canvas to be rendered
    await page.waitForFunction(() => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return imageData.data.some((pixel) => pixel !== 0);
    });

    // Take a snapshot
    await canvasSnapshot.expectCanvasToMatchSnapshot(page, {
      name: "scaled-characters-initial",
    });
  });

  test("should display various scaled characters", async ({ page }) => {
    await page.click('[data-testid="run-scaled-characters"]');

    await page.waitForFunction(() => {
      const canvas = document.querySelector("canvas");
      return canvas && canvas.getContext("2d");
    });

    // Verify the canvas exists and has content
    const canvas = await page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Check that the canvas has non-zero dimensions
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test("should animate the title", async ({ page }) => {
    await page.click('[data-testid="run-scaled-characters"]');

    // Wait for animation to start
    await page.waitForTimeout(100);

    // Take first snapshot
    const snapshot1 = await page.evaluate(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      return canvas?.toDataURL();
    });

    // Wait for animation to progress
    await page.waitForTimeout(500);

    // Take second snapshot
    const snapshot2 = await page.evaluate(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      return canvas?.toDataURL();
    });

    // Snapshots should be different due to animation
    expect(snapshot1).not.toBe(snapshot2);
  });

  test("should clean up when closed", async ({ page }) => {
    await page.click('[data-testid="run-scaled-characters"]');

    // Wait for the demo to start
    await page.waitForFunction(() => {
      const canvas = document.querySelector("canvas");
      return canvas && canvas.getContext("2d");
    });

    // Close the demo by pressing Escape
    await page.keyboard.press("Escape");

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify the canvas is no longer visible
    const canvas = page.locator("canvas");
    await expect(canvas).not.toBeVisible();
  });
});
