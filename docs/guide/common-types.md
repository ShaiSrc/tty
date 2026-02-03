# Common Types

KISS ASCII Renderer exports common geometry types that game developers frequently need. Instead of defining your own `Position`, `Rect`, or `Size` interfaces in every project, you can import and use these standardized types.

## Overview

The library exports three fundamental geometry types:

- **Point** - A 2D position (x, y)
- **Rect** - A rectangle with position and dimensions
- **Size** - Width and height dimensions

## Point

A 2D point or position in grid coordinates.

```typescript
interface Point {
  x: number;
  y: number;
}
```

### Usage

```typescript
import { Point, Renderer } from "@shaisrc/tty";

// Use directly
const playerPos: Point = { x: 10, y: 5 };
renderer.setChar(playerPos.x, playerPos.y, "@");

// Extend for game entities
interface Entity extends Point {
  health: number;
  char: string;
}

const enemy: Entity = {
  x: 20,
  y: 10,
  health: 100,
  char: "E",
};
```

### Common Patterns

```typescript
// Velocity/direction vectors
interface Velocity extends Point {}
const velocity: Velocity = { x: 1, y: 0 };

// Bullet with direction
interface Bullet extends Point {
  vx: number;
  vy: number;
  damage: number;
}

const bullet: Bullet = {
  x: player.x,
  y: player.y,
  vx: 0,
  vy: -1,
  damage: 10,
};
```

## Rect

A rectangle defined by top-left position and dimensions.

```typescript
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Usage

```typescript
import { Rect, Renderer } from "@shaisrc/tty";

// Use for UI bounds
const menuBounds: Rect = {
  x: 10,
  y: 5,
  width: 30,
  height: 20,
};

renderer.box(menuBounds.x, menuBounds.y, menuBounds.width, menuBounds.height, {
  style: "double",
});

// Extend for UI panels
interface Panel extends Rect {
  title: string;
  visible: boolean;
}

const inventory: Panel = {
  x: 5,
  y: 5,
  width: 25,
  height: 15,
  title: "Inventory",
  visible: true,
};
```

### Collision Detection

```typescript
function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

const player: Rect = { x: 10, y: 10, width: 2, height: 2 };
const enemy: Rect = { x: 11, y: 11, width: 2, height: 2 };

if (intersects(player, enemy)) {
  // Collision!
}
```

### Utility Functions

```typescript
function contains(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  );
}

function center(rect: Rect): Point {
  return {
    x: rect.x + Math.floor(rect.width / 2),
    y: rect.y + Math.floor(rect.height / 2),
  };
}
```

## Size

Dimensions (width and height) without position.

```typescript
interface Size {
  width: number;
  height: number;
}
```

### Usage

```typescript
import { Size } from "@shaisrc/tty";

// Grid dimensions
const gridSize: Size = { width: 80, height: 24 };

// Cell/tile size
const cellSize: Size = { width: 8, height: 16 };

// Calculate total pixel dimensions
const pixelWidth = gridSize.width * cellSize.width; // 640
const pixelHeight = gridSize.height * cellSize.height; // 384
```

### UI Elements

```typescript
interface Sprite {
  position: Point;
  size: Size;
  char: string;
}

const player: Sprite = {
  position: { x: 10, y: 10 },
  size: { width: 1, height: 1 },
  char: "@",
};

// Draw the sprite
renderer.setChar(player.position.x, player.position.y, player.char);
```

## Combining Types

You can compose these types to build more complex game objects:

```typescript
import { Point, Size, Rect } from "@shaisrc/tty";

// Game entity with position, size, and velocity
interface GameObject {
  position: Point;
  size: Size;
  velocity: Point;
  char: string;
}

const player: GameObject = {
  position: { x: 10, y: 10 },
  size: { width: 1, height: 1 },
  velocity: { x: 0, y: 0 },
  char: "@",
};

// Convert to Rect for collision detection
function toBounds(obj: GameObject): Rect {
  return {
    x: obj.position.x,
    y: obj.position.y,
    width: obj.size.width,
    height: obj.size.height,
  };
}
```

## Migration from Custom Types

If you already have `Position` or similar types in your code:

```typescript
// Before
interface Position {
  x: number;
  y: number;
}
interface Bullet extends Position {
  damage: number;
}

// After
import { Point } from "@shaisrc/tty";

interface Bullet extends Point {
  damage: number;
}
```

## Best Practices

1. **Use Point for coordinates** - Player position, enemy position, cursor position
2. **Use Rect for bounds** - UI panels, collision boxes, map regions
3. **Use Size for dimensions** - Grid size, sprite size, window size
4. **Extend types liberally** - Add game-specific properties via `extends`
5. **Keep types simple** - These are just data containers, logic goes elsewhere

## API Reference

All types are exported from the main package:

```typescript
import { Point, Rect, Size } from "@shaisrc/tty";
```

See the [Core Types](./core-types.md) guide for all exported types.
