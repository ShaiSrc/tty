# Quick Start: E2E Testing

## First Time Setup

```bash
# 1. Install all dependencies (including Playwright)
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Build the library
npm run build

# 4. Build the examples
npm run build:examples
```

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Interactive UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

This opens a visual interface where you can:

- Run tests individually
- Watch tests execute
- See browser interactions
- Debug failures

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Specific Test File

```bash
npx playwright test basic-game
```

### Specific Test

```bash
npx playwright test -g "should move player on arrow key"
```

## Updating Visual Snapshots

When you intentionally change visual output:

```bash
npm run test:e2e:update-snapshots
```

**⚠️ Important:** Always review snapshot changes before committing!

## Common Workflows

### After Making Code Changes

```bash
npm run build
npm run build:examples
npm run test:e2e
```

### After Changing Examples

```bash
npm run build:examples
npm run test:e2e
```

### Before Committing

```bash
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run build
```

## Viewing Test Reports

After running tests, open the HTML report:

```bash
npx playwright show-report
```

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
npm run build
npm run build:examples
```

### "Browser not found" errors

```bash
npx playwright install chromium
```

### Snapshot mismatches

```bash
# Review the diff images in test-results/
# If changes are intentional:
npm run test:e2e:update-snapshots
```

### Tests timing out

- Increase timeout in individual test
- Check if examples are building correctly
- Verify local server is running

## Need Help?

- See full guide: [docs/guide/testing.md](docs/guide/testing.md)
- See contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue on GitHub
