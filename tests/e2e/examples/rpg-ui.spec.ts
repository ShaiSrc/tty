import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("RPG UI Example", () => {
  test("should load and render complete UI", async ({ page }) => {
    await page.goto("/");

    // Load the rpg-ui example
    await page.click('[data-testid="run-rpg-ui"]');

    // Wait for canvas to be visible
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Wait for game to initialize
    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for canvas to render
    await canvasSnapshot.waitForCanvasRendered(page, "#game-canvas");

    // Take snapshot of RPG UI
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "rpg-ui-initial",
    );
  });

  test("should have player stats and position initialized", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click('[data-testid="run-rpg-ui"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const gameState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return {
        playerName: game.player.name,
        playerLevel: game.player.level,
        playerHp: game.player.hp,
        playerMaxHp: game.player.maxHp,
        playerX: game.playerX,
        playerY: game.playerY,
      };
    });

    expect(gameState.playerName).toBe("Hero");
    expect(gameState.playerLevel).toBe(12);
    expect(gameState.playerHp).toBeGreaterThan(0);
    expect(gameState.playerHp).toBeLessThanOrEqual(gameState.playerMaxHp);
    expect(gameState.playerX).toBe(15);
    expect(gameState.playerY).toBe(10);
  });

  test("should move player on map with arrow keys", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-rpg-ui"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const initialPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.playerX, y: game.playerY };
    });

    // Move right
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const afterRightPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.playerX, y: game.playerY };
    });

    expect(afterRightPos.x).toBe(initialPos.x + 1);

    // Move down
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    const afterDownPos = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return { x: game.playerX, y: game.playerY };
    });

    expect(afterDownPos.y).toBe(afterRightPos.y + 1);
  });

  test("should update HP on damage (Space key)", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-rpg-ui"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const initialHp = await page.evaluate(() => {
      return (window as any).currentGame.player.hp;
    });

    // Press Space to take damage
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    const newHp = await page.evaluate(() => {
      return (window as any).currentGame.player.hp;
    });

    expect(newHp).toBeLessThan(initialHp);
  });
});
