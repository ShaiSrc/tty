# Contributing

Thanks for your interest! This library focuses on providing a simple, high-performance ASCII rendering system for game developers. Contributions are generally:

- **Bug fixes** (especially performance regressions or rendering issues)
- **Performance improvements** (as long as they maintain API compatibility)
- **Documentation improvements** (examples, guides, API docs)
- **New rendering features** (if they fit the KISS philosophy)
- **DX improvements** (making the API more intuitive and pleasant to use)

For major features or API changes, please open an issue first to discuss.

## Quick Start

1. Fork the repository
2. Create a feature branch
3. Add tests for any changes (unit + E2E where appropriate)
4. Ensure all tests pass
5. Open a pull request with a clear description

## Development

### Setup

```sh
git clone https://github.com/shaisrc/tty.git
cd tty
npm install
```

**Recommended:** Node.js 20+ and npm 9+

### Commands

```sh
npm test                   # Run unit tests
npm run test:coverage      # Run with coverage report
npm run test:ui            # Interactive test UI
npm run test:e2e           # Run E2E tests in browser
npm run test:e2e:ui        # Interactive E2E mode
npm run lint               # Check code style
npm run type-check         # TypeScript validation
npm run build              # Build library
npm run build:examples     # Build example demos
npm run format             # Auto-fix formatting
```

See [docs/guide/testing.md](./docs/guide/testing.md) for comprehensive testing guide.

## Style

- **KISS Philosophy**: Keep it simple, favor composition over complexity
- **DX First**: Chainable APIs, smart defaults, excellent TypeScript support
- **Performance**: Avoid allocations in hot paths, use double-buffering
- **Test Coverage**: >90% coverage on public APIs, test edge cases
- **TDD Approach**: Write tests first (Red → Green → Refactor)

### Code Conventions

- **TypeScript strict mode** enabled - no implicit `any`, strict null checks
- **JSDoc comments** on all public APIs with examples
- **Chainable methods** return `this` for fluent API
- **Options objects** over long parameter lists
- **Immutability** - don't mutate parameters unless necessary
- **Early returns** to reduce nesting
- **Descriptive names** - `drawTextWithWordWrap` over `dtww`
- **No magic numbers** - use named constants

## Testing

We use a dual testing strategy:

### Unit Tests (`tests/unit/`)

- Test isolated functions and classes
- Mock external dependencies (RenderTarget, etc.)
- Fast execution (<1ms per test)
- Use Arrange-Act-Assert pattern

### E2E Tests (`tests/e2e/`)

- Test complete examples in real browser
- Validate user interactions and visual output
- Use Playwright for automation

Run tests with:

```sh
npm test                          # Unit tests
npm run test:coverage             # With coverage
npm run test:e2e                  # E2E tests
npm run test:e2e:update-snapshots # Update visuals
```

## Pull Requests

- Describe the problem and solution clearly
- Include tests for new behavior (unit + E2E where applicable)
- Keep changes focused and minimal
- Ensure all CI checks pass (lint, types, tests, build)
- Reference related issues if applicable

### Before Submitting

Run the pre-commit checklist:

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run test:e2e
npm run build
```

Or all at once:

```sh
npm run lint && npm run type-check && npm run test:coverage && npm run test:e2e && npm run build
```

Use `npm run format` to auto-fix style issues.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(renderer): add multi-key binding support
fix(animation): prevent memory leak in pulse effects
docs(guide): add camera system examples
test(e2e): add menu navigation tests
perf(render): optimize dirty rectangle calculation
```

## Review Process

- PRs are reviewed as time allows (usually within a week)
- Changes or alternatives may be suggested
- Once approved, changes are merged and included in the next release
- All contributors are credited in release notes

## Before You Start

- Check existing issues to avoid duplicates
- For bugs, include a minimal reproduction case
- For features, describe the use case and why it fits the library's scope
- Review [TODO.md](./TODO.md) for planned improvements

---

Thanks for helping make @shaisrc/tty better!
