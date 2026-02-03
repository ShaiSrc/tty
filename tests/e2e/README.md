# E2E Tests

End-to-end tests for @shaisrc/tty using Playwright.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Build examples
npm run build:examples

# Run all E2E tests
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

## Test Structure

```
e2e/
├── examples/               # Tests for each example application
│   ├── animation-demo.spec.ts
│   ├── basic-game.spec.ts
│   ├── menu-demo.spec.ts
│   ├── rpg-ui.spec.ts
│   ├── snake-game.spec.ts
│   └── space-invaders.spec.ts
└── helpers/               # Test utilities
    ├── canvas-snapshot.ts # Visual regression helpers
    └── test-utils.ts      # Game state and interaction helpers
```

## Coverage

Each example is tested for:

- ✅ Initial load and render
- ✅ Game state initialization
- ✅ Keyboard input handling
- ✅ State transitions (pause, game over, menu navigation)
- ✅ Visual snapshots (stored separately, not in git)
- ✅ Animations and timing

## Snapshots

Visual regression snapshots are stored in `__snapshots__/` (gitignored).

To update snapshots:

```bash
npm run test:e2e:update-snapshots
```

**Important:** Review all snapshot changes before committing!

## Documentation

For comprehensive testing guide, see [docs/guide/testing.md](../../docs/guide/testing.md)

## CI/CD

E2E tests run automatically on:

- Push to `main` or `develop`
- Pull requests

Failed test artifacts (screenshots, videos) are uploaded for debugging.
