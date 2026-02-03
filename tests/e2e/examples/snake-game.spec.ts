import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Snake Game Example", () => {
  test("should load and show start screen", async ({ page }) => {
    await page.goto("/");

    // Load the snake-game example
    await page.click('[data-testid="run-snake-game"]');

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
      "snake-game-start",
    );
  });

  test("should initialize with snake and food", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-snake-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const gameState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return {
        snakeLength: game.snake.length,
        direction: game.direction,
        score: game.score,
        gameOver: game.gameOver,
        started: game.started,
        hasFood: game.food.x >= 0 && game.food.y >= 0,
      };
    });

    expect(gameState.snakeLength).toBe(3); // Initial snake length
    expect(gameState.direction).toBe("right");
    expect(gameState.score).toBe(0);
    expect(gameState.gameOver).toBe(false);
    expect(gameState.started).toBe(false);
    expect(gameState.hasFood).toBe(true);
  });

  test("should start game on arrow key press", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-snake-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Press arrow key to start
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    const started = await page.evaluate(() => {
      return (window as any).currentGame.started;
    });

    expect(started).toBe(true);
  });

  test("should pause and unpause game", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-snake-game"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Start game
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    // Press Space to pause
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    let paused = await page.evaluate(() => {
      return (window as any).currentGame.paused;
    });

    expect(paused).toBe(true);

    // Press Space again to unpause
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    paused = await page.evaluate(() => {
      return (window as any).currentGame.paused;
    });

    expect(paused).toBe(false);
  });
});
