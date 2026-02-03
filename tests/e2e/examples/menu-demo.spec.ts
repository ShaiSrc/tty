import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Menu Demo Example", () => {
  test("should load and render main menu", async ({ page }) => {
    await page.goto("/");

    // Load the menu-demo example
    await page.click('[data-testid="run-menu-demo"]');

    // Wait for canvas to be visible
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Wait for game to initialize
    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for canvas to render
    await canvasSnapshot.waitForCanvasRendered(page, "#game-canvas");

    // Take snapshot of main menu
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "menu-demo-main-menu",
    );
  });

  test("should start on main menu with first item selected", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click('[data-testid="run-menu-demo"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    const menuState = await page.evaluate(() => {
      const game = (window as any).currentGame;
      return {
        screen: game.currentScreen,
        selectedIndex: game.selectedIndex,
      };
    });

    expect(menuState.screen).toBe("main");
    expect(menuState.selectedIndex).toBe(0);
  });

  test("should navigate menu with arrow keys", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-menu-demo"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Press arrow down
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    let selectedIndex = await page.evaluate(() => {
      return (window as any).currentGame.selectedIndex;
    });

    expect(selectedIndex).toBe(1);

    // Press arrow down again
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    selectedIndex = await page.evaluate(() => {
      return (window as any).currentGame.selectedIndex;
    });

    expect(selectedIndex).toBe(2);

    // Press arrow up
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(100);

    selectedIndex = await page.evaluate(() => {
      return (window as any).currentGame.selectedIndex;
    });

    expect(selectedIndex).toBe(1);
  });

  test("should navigate to options screen on Enter", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-menu-demo"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Navigate to "Options" (index 2)
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    // Press Enter to select Options
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);

    const currentScreen = await page.evaluate(() => {
      return (window as any).currentGame.currentScreen;
    });

    expect(currentScreen).toBe("options");
  });

  test("should return to main menu on Escape", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="run-menu-demo"]');

    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Navigate to Options
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);

    // Press Escape to go back
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    const currentScreen = await page.evaluate(() => {
      return (window as any).currentGame.currentScreen;
    });

    expect(currentScreen).toBe("main");
  });
});
