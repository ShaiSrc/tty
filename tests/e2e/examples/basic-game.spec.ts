import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Basic Game Example", () => {
  test("should load and render initial state", async ({ page }) => {
    await page.goto("/");

    // Load the basic-game example
    await page.click('[data-testid="run-basic-game"]');

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

    // Take snapshot of initial render
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "basic-game-initial",
    );
  });

  test("should have player at center position", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-basic-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const playerPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    // Player should start near center (exact position may vary)
    expect(playerPos.x).toBeGreaterThan(20);
    expect(playerPos.x).toBeLessThan(60);
    expect(playerPos.y).toBeGreaterThan(5);
    expect(playerPos.y).toBeLessThan(20);
  });

  test("should move player on arrow key press", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-basic-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Get initial position
    const initialPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    // Press arrow right
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100); // Wait for next frame

    // Get new position
    const newPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    // Player should have moved right
    expect(newPos.x).toBe(initialPos.x + 1);
    expect(newPos.y).toBe(initialPos.y);
  });

  test("should move player with WASD keys", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-basic-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const initialPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    // Press 'D' for right
    await page.keyboard.press("KeyD");
    await page.waitForTimeout(100);

    const afterDPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    expect(afterDPos.x).toBe(initialPos.x + 1);

    // Press 'W' for up
    await page.keyboard.press("KeyW");
    await page.waitForTimeout(100);

    const afterWPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.player.x, y: game.player.y };
    });

    expect(afterWPos.y).toBe(afterDPos.y - 1);
  });
});
