# E2E Testing Guide

This guide covers end-to-end (E2E) testing for @shaisrc/tty using Playwright.

## Overview

E2E tests validate that the library works correctly in real browser environments by:

- Testing all 6 example applications
- Simulating user interactions (keyboard, mouse)
- Verifying visual output through snapshots
- Testing animations and timing-dependent features

## Test Stack

- **Playwright** - Browser automation and testing
- **Pixelmatch** - Visual regression comparison
- **Vitest** - Unit testing (separate from E2E)

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Update visual snapshots
npm run test:e2e:update-snapshots
```

## Test Structure

```
tests/
├── e2e/
│   ├── examples/
│   │   ├── animation-demo.spec.ts      # Animation system tests
│   │   ├── basic-game.spec.ts          # Basic movement tests
│   │   ├── menu-demo.spec.ts           # Menu navigation tests
│   │   ├── rpg-ui.spec.ts              # Complex UI tests
│   │   ├── snake-game.spec.ts          # Game state tests
│   │   └── space-invaders.spec.ts      # Multi-input tests
│   └── helpers/
│       ├── canvas-snapshot.ts          # Visual regression helpers
│       └── test-utils.ts               # Test utilities
└── unit/                                # Unit tests (separate)
```

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { canvasSnapshot } from "../helpers/canvas-snapshot";

test.describe("Example Name", () => {
  test("should load and render", async ({ page }) => {
    // Navigate to examples page
    await page.goto("/");

    // Load specific example
    await page.click('button:has-text("Run Demo")');
    await page.click('button[onclick*="example-name"]');

    // Wait for canvas
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeVisible();

    // Wait for game initialization
    await page.waitForFunction(() => {
      return (window as any).currentGame !== null;
    });

    // Wait for rendering
    await canvasSnapshot.waitForCanvasRendered(page, "#game-canvas");

    // Visual snapshot
    await canvasSnapshot.expectCanvasToMatchSnapshot(
      page,
      "#game-canvas",
      "example-initial",
    );
  });
});
```

### Testing Keyboard Input

```typescript
test("should respond to keyboard input", async ({ page }) => {
  // ... setup ...

  // Get initial state
  const initialPos = await page.evaluate(() => {
    const game = (window as any).currentGame;
    return { x: game.player.x, y: game.player.y };
  });

  // Simulate keyboard input
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100); // Wait for next frame

  // Verify state changed
  const newPos = await page.evaluate(() => {
    const game = (window as any).currentGame;
    return { x: game.player.x, y: game.player.y };
  });

  expect(newPos.x).toBe(initialPos.x + 1);
});
```

### Testing Animations

```typescript
test("should animate over time", async ({ page }) => {
  // ... setup ...

  const initialValue = await page.evaluate(() => {
    return (window as any).currentGame.animatedValue;
  });

  // Wait for animation to progress
  await page.waitForTimeout(1000);

  const newValue = await page.evaluate(() => {
    return (window as any).currentGame.animatedValue;
  });

  expect(newValue).not.toBe(initialValue);
});
```

### Testing Game State Transitions

```typescript
test("should transition between states", async ({ page }) => {
  // ... setup ...

  // Verify initial state
  let state = await page.evaluate(() => {
    return (window as any).currentGame.gameState;
  });
  expect(state).toBe("start");

  // Trigger state change
  await page.keyboard.press("Enter");
  await page.waitForTimeout(100);

  // Verify new state
  state = await page.evaluate(() => {
    return (window as any).currentGame.gameState;
  });
  expect(state).toBe("playing");
});
```

## Accessing Game State

All examples expose their game instance via `window.currentGame`. Public properties you can access:

**basic-game:**

```typescript
game.player: { x: number, y: number, char: string }
```

**animation-demo:**

```typescript
game.playerX: number
game.playerY: number
game.coinX: number
game.coinY: number
game.portalX: number
game.portalY: number
```

**menu-demo:**

```typescript
game.selectedIndex: number
game.currentScreen: "main" | "options" | "credits"
game.optionsIndex: number
```

**rpg-ui:**

```typescript
game.player: PlayerStats
game.playerX: number
game.playerY: number
```

**snake-game:**

```typescript
game.snake: Position[]
game.direction: Direction
game.food: Position
game.score: number
game.gameOver: boolean
game.paused: boolean
game.started: boolean
```

**space-invaders:**

```typescript
game.player: Position
game.invaders: Invader[]
game.bullets: Bullet[]
game.score: number
game.lives: number
game.gameOver: boolean
game.paused: boolean
game.started: boolean
game.level: number
```

## Visual Regression Testing

### Snapshot Management

- Snapshots are stored in `tests/e2e/__snapshots__/` (gitignored)
- Baseline snapshots should be stored separately (not in git)
- 0.1% pixel difference threshold is configured

### Updating Snapshots

```bash
# Update all snapshots
npm run test:e2e:update-snapshots

# Update specific test
npx playwright test animation-demo --update-snapshots
```

### Best Practices

1. **Deterministic rendering** - Ensure animations/timers are in known state
2. **Wait for render** - Use `waitForCanvasRendered()` helper
3. **Unique names** - Use descriptive snapshot names
4. **Review diffs** - Always review snapshot changes before committing

## Common Patterns

### Wait for Specific Condition

```typescript
await page.waitForFunction(
  () => {
    const game = (window as any).currentGame;
    return game && game.score > 0;
  },
  { timeout: 5000 },
);
```

### Multiple Key Presses

```typescript
import { pressKeys } from "../helpers/test-utils";

await pressKeys(page, ["ArrowDown", "ArrowDown", "Enter"], 100);
```

### Grid to Pixel Conversion

```typescript
import { gridToPixel } from "../helpers/test-utils";

const { x, y } = gridToPixel(10, 5, 12, 20);
await page.mouse.click(x, y);
```

## Debugging Tests

### Interactive Mode

```bash
npm run test:e2e:ui
```

This opens Playwright's UI mode where you can:

- Step through tests
- See browser interactions
- Inspect snapshots
- View trace timelines

### Debug Mode

```bash
npm run test:e2e:debug
```

This runs tests in headed mode with Playwright Inspector:

- Set breakpoints
- Step through actions
- Inspect locators
- Record actions

### Screenshots and Videos

On failure, Playwright automatically captures:

- Screenshots (`test-results/`)
- Videos (if configured)
- Traces (on retry)

## CI/CD Integration

E2E tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests

Artifacts (reports, screenshots) are uploaded on failure.

### Local CI Simulation

```bash
# Run tests exactly as CI does
CI=true npm run test:e2e
```

## Performance Considerations

- Tests run in parallel by default
- Use `test.describe.serial()` for tests that must run sequentially
- Keep test timeouts reasonable (30s default)
- Clean up game instances between tests

## Limitations

### Gamepad Testing

Playwright cannot simulate gamepad input. For gamepad functionality:

- Write unit tests with mocked `navigator.getGamepads()`
- Manual testing required for full validation

### Visual Precision

- 0.1% threshold allows for font rendering variations
- Cross-platform differences may require platform-specific baselines
- Animations may have timing variations

## Troubleshooting

### Tests Failing Locally

1. **Rebuild examples:** `npm run build:examples`
2. **Update snapshots:** `npm run test:e2e:update-snapshots`
3. **Check browser version:** `npx playwright install`

### Flaky Tests

- Add explicit waits for animations
- Use `waitForFunction()` instead of fixed timeouts
- Ensure deterministic initial state

### Canvas Not Rendering

- Check that example builds successfully
- Verify canvas element exists
- Use `waitForCanvasRendered()` helper

## Best Practices

1. **Test user flows, not implementation** - Focus on what users experience
2. **Keep tests isolated** - Each test should be independent
3. **Use descriptive names** - Test names should explain what they verify
4. **DRY helpers** - Extract common patterns to test utilities
5. **Fast tests** - Minimize unnecessary waits and animations
6. **Meaningful assertions** - Assert specific values, not just "truthy"
7. **Clean up** - Stop games/cleanup resources between tests

## Example Test Checklist

For each example application, verify:

- [ ] Initial render (visual snapshot)
- [ ] Game state initialization
- [ ] Keyboard input response
- [ ] State transitions (start, pause, game over)
- [ ] Score/stats updates
- [ ] Visual feedback on interactions
- [ ] Proper cleanup on close

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Regression Testing Guide](https://playwright.dev/docs/test-snapshots)
- [Project README](https://github.com/shaisrc/tty/blob/main/README.md)
- [Contributing Guide](https://github.com/shaisrc/tty/blob/main/CONTRIBUTING.md)
