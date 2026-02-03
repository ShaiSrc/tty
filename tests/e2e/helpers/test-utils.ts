import type { Page } from "@playwright/test";

/**
 * Test utilities for E2E testing
 */

/**
 * Convert grid coordinates to pixel coordinates
 * @param gridX - X coordinate in grid cells
 * @param gridY - Y coordinate in grid cells
 * @param charWidth - Width of each character in pixels
 * @param charHeight - Height of each character in pixels
 * @returns Pixel coordinates (centered on cell)
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  charWidth: number,
  charHeight: number,
): { x: number; y: number } {
  return {
    x: gridX * charWidth + charWidth / 2,
    y: gridY * charHeight + charHeight / 2,
  };
}

/**
 * Wait for game to be initialized
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object (default: 'game')
 * @param timeout - Maximum wait time in ms
 */
export async function waitForGameInit(
  page: Page,
  gameProperty: string = "game",
  timeout: number = 5000,
): Promise<void> {
  await page.waitForFunction(
    (prop) => {
      return (window as any)[prop] !== undefined;
    },
    gameProperty,
    { timeout },
  );
}

/**
 * Get game instance from window
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 * @returns Game instance
 */
export async function getGame(
  page: Page,
  gameProperty: string = "game",
): Promise<any> {
  return page.evaluate((prop) => {
    return (window as any)[prop];
  }, gameProperty);
}

/**
 * Step the game loop forward by N frames
 * @param page - Playwright page instance
 * @param frames - Number of frames to advance
 * @param gameProperty - Property name on window object
 */
export async function stepGameLoop(
  page: Page,
  frames: number,
  gameProperty: string = "game",
): Promise<void> {
  await page.evaluate(
    ({ prop, n }) => {
      const game = (window as any)[prop];
      if (game && game.step) {
        for (let i = 0; i < n; i++) {
          game.step();
        }
      }
    },
    { prop: gameProperty, n: frames },
  );
}

/**
 * Pause the game
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 */
export async function pauseGame(
  page: Page,
  gameProperty: string = "game",
): Promise<void> {
  await page.evaluate((prop) => {
    const game = (window as any)[prop];
    if (game && game.pause) {
      game.pause();
    }
  }, gameProperty);
}

/**
 * Resume the game
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 */
export async function resumeGame(
  page: Page,
  gameProperty: string = "game",
): Promise<void> {
  await page.evaluate((prop) => {
    const game = (window as any)[prop];
    if (game && game.resume) {
      game.resume();
    }
  }, gameProperty);
}

/**
 * Stop the game and cleanup
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 */
export async function stopGame(
  page: Page,
  gameProperty: string = "game",
): Promise<void> {
  await page.evaluate((prop) => {
    const game = (window as any)[prop];
    if (game && game.stop) {
      game.stop();
    }
  }, gameProperty);
}

/**
 * Get player position from game
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 * @returns Player coordinates {x, y}
 */
export async function getPlayerPosition(
  page: Page,
  gameProperty: string = "game",
): Promise<{ x: number; y: number }> {
  return page.evaluate((prop) => {
    const game = (window as any)[prop];
    if (game && game.player) {
      return { x: game.player.x, y: game.player.y };
    }
    throw new Error("Player not found in game instance");
  }, gameProperty);
}

/**
 * Get game state
 * @param page - Playwright page instance
 * @param gameProperty - Property name on window object
 * @returns Game state string
 */
export async function getGameState(
  page: Page,
  gameProperty: string = "game",
): Promise<string> {
  return page.evaluate((prop) => {
    const game = (window as any)[prop];
    if (game && game.state !== undefined) {
      return game.state;
    }
    return "unknown";
  }, gameProperty);
}

/**
 * Wait for a specific game state
 * @param page - Playwright page instance
 * @param expectedState - State to wait for
 * @param gameProperty - Property name on window object
 * @param timeout - Maximum wait time in ms
 */
export async function waitForGameState(
  page: Page,
  expectedState: string,
  gameProperty: string = "game",
  timeout: number = 5000,
): Promise<void> {
  await page.waitForFunction(
    ({ prop, state }) => {
      const game = (window as any)[prop];
      return game && game.state === state;
    },
    { prop: gameProperty, state: expectedState },
    { timeout },
  );
}

/**
 * Simulate keyboard input with proper timing
 * @param page - Playwright page instance
 * @param key - Key to press
 * @param delay - Delay after press in ms
 */
export async function pressKeyWithDelay(
  page: Page,
  key: string,
  delay: number = 50,
): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(delay);
}

/**
 * Simulate multiple key presses in sequence
 * @param page - Playwright page instance
 * @param keys - Array of keys to press
 * @param delay - Delay between presses in ms
 */
export async function pressKeys(
  page: Page,
  keys: string[],
  delay: number = 50,
): Promise<void> {
  for (const key of keys) {
    await pressKeyWithDelay(page, key, delay);
  }
}
