import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Intro Animation Example", () => {
  test("should load and render initial state", async ({ page }) => {
    await page.goto("/");

    // Load the intro-animation example
    await page.click('[data-testid="run-intro-animation"]');

    // Wait for canvas to be visible
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Wait for game to initialize
    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for canvas to render
    await canvasSnapshot.waitForCanvasRendered(page, "#game-canvas");

    // Verify game instance exists
    const hasGame = await page.evaluate(() => {
      return (window as any).currentGame !== undefined;
    });
    expect(hasGame).toBe(true);

    // Take snapshot of initial render (should show start of border drawing)
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "intro-animation-initial",
    );
  });

  test("should progress through animation states", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Check initial state is drawing-border
    const initialState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return game.state;
    });
    expect(initialState).toBe("drawing-border");

    // Wait for border to complete and transition to drawing-text
    await page.waitForFunction(
      () => {
        const game = (window as any).currentGame;
        return game.state === "drawing-text";
      },
      { timeout: 5000 },
    );

    // Verify we're in drawing-text state
    const textState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return game.state;
    });
    expect(textState).toBe("drawing-text");

    // Wait for text to complete and transition to pulsing
    await page.waitForFunction(
      () => {
        const game = (window as any).currentGame;
        return game.state === "pulsing";
      },
      { timeout: 5000 },
    );

    // Verify we're in pulsing state
    const pulsingState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return game.state;
    });
    expect(pulsingState).toBe("pulsing");
  });

  test("should have border tiles drawn incrementally", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Get initial border index
    const initialIndex = await page.evaluate(() => {
      return (window as any).currentGame.borderIndex;
    });

    expect(initialIndex).toBeGreaterThanOrEqual(0);

    // Wait a bit for animation to progress
    await page.waitForTimeout(500);

    const laterIndex = await page.evaluate(() => {
      return (window as any).currentGame.borderIndex;
    });

    // Border index should have increased
    expect(laterIndex).toBeGreaterThan(initialIndex);
  });

  test("should render completed box with ASCII art text", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for animation to complete (state becomes pulsing)
    await page.waitForFunction(
      () => {
        const game = (window as any).currentGame;
        return game.state === "pulsing";
      },
      { timeout: 10000 },
    );

    // Verify we're in pulsing state
    const state = await page.evaluate(() => {
      return (window as any).currentGame.state;
    });
    expect(state).toBe("pulsing");

    // Take snapshot of completed animation
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "intro-animation-completed",
    );
  });

  test("should have pulse animations active after completion", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for animation to complete (state becomes pulsing)
    await page.waitForFunction(
      () => {
        const game = (window as any).currentGame;
        return game.state === "pulsing";
      },
      { timeout: 10000 },
    );

    // Check that pulse animations are running
    const animationCount = await page.evaluate(() => {
      const game = (window as any).currentGame;
      const renderer = game.renderer;
      return renderer.getActiveAnimationCount();
    });

    // Should have multiple pulse animations (one per text character)
    expect(animationCount).toBeGreaterThan(0);
  });

  test("should close when ESC is pressed", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Press ESC
    await page.keyboard.press("Escape");

    // Canvas container should be hidden
    const container = page.locator("#canvas-container");
    await expect(container).not.toHaveClass(/active/);
  });

  test("should close when Close button is clicked", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-intro-animation"]');

    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Click close button
    await page.click("#close-btn");

    // Canvas container should be hidden
    const container = page.locator("#canvas-container");
    await expect(container).not.toHaveClass(/active/);
  });
});
