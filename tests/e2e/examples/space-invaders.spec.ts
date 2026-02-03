import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Space Invaders Example", () => {
  test("should load and show start screen", async ({ page }) => {
    await page.goto("/");

    // Load the space-invaders example
    await page.click('[data-testid="run-space-invaders"]');

    // Wait for canvas to be visible
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Wait for game to initialize
    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for canvas to render
    await canvasSnapshot.waitForCanvasRendered(page, "#game-canvas");

    // Take snapshot of start screen
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "space-invaders-start",
    );
  });

  test("should initialize with player, invaders, and barriers", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click('[data-testid="run-space-invaders"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const gameState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return {
        playerX: game.player.x,
        playerY: game.player.y,
        invaderCount: game.invaders.length,
        bulletCount: game.bullets.length,
        lives: game.lives,
        score: game.score,
        level: game.level,
        started: game.started,
        gameOver: game.gameOver,
      };
    });

    expect(gameState.playerX).toBeGreaterThanOrEqual(0);
    expect(gameState.playerY).toBeGreaterThan(0);
    expect(gameState.invaderCount).toBeGreaterThan(0); // Should have invaders
    expect(gameState.bulletCount).toBe(0); // No bullets at start
    expect(gameState.lives).toBe(3);
    expect(gameState.score).toBe(0);
    expect(gameState.level).toBe(1);
    expect(gameState.started).toBe(false);
    expect(gameState.gameOver).toBe(false);
  });

  test("should start game and allow player movement", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-space-invaders"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Start game with any key
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(200);

    const started = await page.evaluate(() => {
      return (window as any).currentGame.started;
    });

    expect(started).toBe(true);

    // Get initial player position
    const initialX = await page.evaluate(() => {
      return (window as any).currentGame.player.x;
    });

    // Move right
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const newX = await page.evaluate(() => {
      return (window as any).currentGame.player.x;
    });

    expect(newX).toBeGreaterThan(initialX);
  });

  test("should shoot bullets on Space key", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-space-invaders"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Start game
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    // Shoot
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    const bulletCount = await page.evaluate(() => {
      return (window as any).currentGame.bullets.length;
    });

    expect(bulletCount).toBeGreaterThan(0);
  });
});
