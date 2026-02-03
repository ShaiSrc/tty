# Tutorial 4: Adding Animations

Learn to create smooth, professional animations using sequential drawing, state machines, and the built-in Animation System.

**What You'll Build**: An animated intro screen that draws a border tile-by-tile, reveals ASCII art text character-by-character, and finishes with a pulsing effect.

**What You'll Learn**:

- Sequential tile drawing for reveal effects
- Animation state machines
- Built-in pulse animations with easing
- Frame-based timing and speed control
- Creating polished intro sequences

**Prerequisites**: Complete [Tutorial 1: Building Your First Game](./01-building-your-first-game.md)

---

## Step 1: Setup Animation Structure

Let's start with a state machine to manage different animation phases.

### Create the Animation Class

```typescript
import { Renderer, GameLoop } from "@shaisrc/tty";

const VIEWPORT_WIDTH = 115;
const VIEWPORT_HEIGHT = 30;

const BOX_WIDTH = 110;
const BOX_HEIGHT = 20;
const BOX_X = Math.floor((VIEWPORT_WIDTH - BOX_WIDTH) / 2);
const BOX_Y = Math.floor((VIEWPORT_HEIGHT - BOX_HEIGHT) / 2);

const TILES_PER_FRAME = 4; // Draw 4 tiles per frame

type AnimationState = "drawing-border" | "drawing-text" | "pulsing";

class IntroAnimation {
  private renderer: Renderer;
  private gameLoop: GameLoop;
  private state: AnimationState = "drawing-border";

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "#000033" },
    });

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 60 },
    );
  }

  private update(dt: number): void {
    switch (this.state) {
      case "drawing-border":
        this.updateBorderDrawing();
        break;
      case "drawing-text":
        this.updateTextDrawing();
        break;
      case "pulsing":
        this.updatePulsing();
        break;
    }
  }

  private updateBorderDrawing(): void {
    // Will implement
  }

  private updateTextDrawing(): void {
    // Will implement
  }

  private updatePulsing(): void {
    // Will implement
  }

  private render(): void {
    // Update animations (for pulsing effect)
    this.renderer.updateAnimations();
    this.renderer.render();
  }

  start(): void {
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }
}
```

**What's Happening:**

- **State Machine**: `AnimationState` type defines three phases
- **State-based Updates**: `update()` calls different methods based on current state
- **60 FPS**: Smooth animation at 60 frames per second
- **Constants**: Define animation speed with `TILES_PER_FRAME`

**Key tty APIs Used:**

- `GameLoop(update, render, options)` - Manage animation loop
- `renderer.updateAnimations()` - Process built-in animations every frame

---

## Step 2: Sequential Border Drawing

Let's create a tile-by-tile border reveal effect by pre-computing drawing order.

### Generate Border Tiles in Drawing Order

```typescript
class IntroAnimation {
  // ... previous code ...

  // Border drawing state
  private borderTiles: Array<{ x: number; y: number; char: string }> = [];
  private borderIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    // ... previous setup ...

    this.initializeBorderTiles(); // Pre-compute border

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 60 },
    );
  }

  private initializeBorderTiles(): void {
    // Generate border tiles in drawing order: top → right → bottom → left
    const chars = {
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      vertical: "║",
    };

    // Top edge (left to right, including top-left corner)
    for (let i = 0; i < BOX_WIDTH; i++) {
      const x = BOX_X + i;
      const y = BOX_Y;
      const char =
        i === 0
          ? chars.topLeft
          : i === BOX_WIDTH - 1
            ? chars.topRight
            : chars.horizontal;
      this.borderTiles.push({ x, y, char });
    }

    // Right edge (top to bottom, excluding corners)
    for (let i = 1; i < BOX_HEIGHT - 1; i++) {
      const x = BOX_X + BOX_WIDTH - 1;
      const y = BOX_Y + i;
      this.borderTiles.push({ x, y, char: chars.vertical });
    }

    // Bottom edge (right to left, including bottom-right corner)
    for (let i = BOX_WIDTH - 1; i >= 0; i--) {
      const x = BOX_X + i;
      const y = BOX_Y + BOX_HEIGHT - 1;
      const char =
        i === BOX_WIDTH - 1
          ? chars.bottomRight
          : i === 0
            ? chars.bottomLeft
            : chars.horizontal;
      this.borderTiles.push({ x, y, char });
    }

    // Left edge (bottom to top, excluding corners)
    for (let i = BOX_HEIGHT - 2; i > 0; i--) {
      const x = BOX_X;
      const y = BOX_Y + i;
      this.borderTiles.push({ x, y, char: chars.vertical });
    }
  }

  private updateBorderDrawing(): void {
    // Draw 4 tiles per frame
    for (
      let i = 0;
      i < TILES_PER_FRAME && this.borderIndex < this.borderTiles.length;
      i++
    ) {
      const tile = this.borderTiles[this.borderIndex];
      this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91"); // Dark purple
      this.borderIndex++;
    }

    // Check if border is complete
    if (this.borderIndex >= this.borderTiles.length) {
      this.state = "drawing-text"; // Transition to next state
    }
  }
}
```

**What's Happening:**

- **Pre-computation**: Build array of tiles in drawing order during setup
- **Drawing Order**: Top → Right → Bottom → Left creates a clockwise animation
- **Batching**: Draw 4 tiles per frame (adjust `TILES_PER_FRAME` for speed)
- **State Transition**: Automatically move to next state when complete
- **Box Characters**: Double-line box using `╔╗╚╝═║`

**Key tty APIs Used:**

- `renderer.setChar(x, y, char, fg)` - Draw individual characters

**Performance Tip**: Pre-computing the tile order is more efficient than calculating it every frame. This is a common pattern for complex animations.

---

## Step 3: ASCII Art Text Animation

Now let's create ASCII art where each letter is made from itself, and reveal it character-by-character.

### Define and Animate ASCII Art

```typescript
// ASCII art patterns where each char is made from itself
const ASCII_ART: Record<string, string[]> = {
  "@": [
    " @@@@@ ",
    "@     @",
    "@ @@@ @",
    "@ @ @ @",
    "@ @@@@@",
    "@     @",
    " @@@@@ ",
  ],
  s: [
    " ssssss ",
    "ss      ",
    "ss      ",
    " ssssss ",
    "      ss",
    "      ss",
    " ssssss ",
  ],
  h: [
    "hh    hh",
    "hh    hh",
    "hhhhhhhh",
    "hh    hh",
    "hh    hh",
    "hh    hh",
    "hh    hh",
  ],
  a: [
    "  aaaa  ",
    " aa  aa ",
    "aa    aa",
    "aaaaaaaa",
    "aa    aa",
    "aa    aa",
    "aa    aa",
  ],
  i: [
    "iiiiiii",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "iiiiiii",
  ],
  r: [
    "rrrrrr  ",
    "rr   rr ",
    "rr   rr ",
    "rrrrrr  ",
    "rr  rr  ",
    "rr   rr ",
    "rr    rr",
  ],
  c: [
    " ccccc ",
    "c     c",
    "c      ",
    "c      ",
    "c      ",
    "c     c",
    " ccccc ",
  ],
  "/": [
    "      //",
    "     // ",
    "    //  ",
    "   //   ",
    "  //    ",
    " //     ",
    "//      ",
  ],
  t: [
    "ttttttt",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
  ],
  y: [
    "yy    yy",
    "yy    yy",
    " yy  yy ",
    "  yyyy  ",
    "   yy   ",
    "   yy   ",
    "   yy   ",
  ],
  " ": [
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
  ],
};

class IntroAnimation {
  // ... previous code ...

  // Text drawing state
  private textChars: Array<{ x: number; y: number; char: string }> = [];
  private textIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    // ... previous setup ...

    this.initializeBorderTiles();
    this.initializeTextArt(); // Pre-compute text positions

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 60 },
    );
  }

  private initializeTextArt(): void {
    const text = "@shaisrc/tty";
    const charWidth = 8;
    const charHeight = 7;
    const spacing = 1;

    // Calculate total width and center it
    const totalWidth = text.length * (charWidth + spacing) - spacing;
    const startX = BOX_X + Math.floor((BOX_WIDTH - totalWidth) / 2);
    const startY = BOX_Y + Math.floor((BOX_HEIGHT - charHeight) / 2);

    // Build character positions
    let currentX = startX;
    for (const letter of text) {
      const pattern = ASCII_ART[letter] || ASCII_ART[" "];

      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          const char = pattern[row][col];

          // Only add non-space characters
          if (char !== " ") {
            this.textChars.push({
              x: currentX + col,
              y: startY + row,
              char: char,
            });
          }
        }
      }

      currentX += charWidth + spacing;
    }
  }

  private updateTextDrawing(): void {
    // Draw 4 characters per frame
    for (
      let i = 0;
      i < TILES_PER_FRAME && this.textIndex < this.textChars.length;
      i++
    ) {
      const charData = this.textChars[this.textIndex];
      this.renderer.setChar(charData.x, charData.y, charData.char, "#888888");
      this.textIndex++;
    }

    // Check if text is complete
    if (this.textIndex >= this.textChars.length) {
      this.state = "pulsing"; // Transition to pulse effect
      this.startPulseEffect();
    }
  }

  private startPulseEffect(): void {
    // Will implement in next step
  }
}
```

**What's Happening:**

- **ASCII Art Patterns**: Each letter defined as a 7-line pattern
- **Position Calculation**: Center text in the box, calculate all character positions
- **Sequential Reveal**: Draw characters one-by-one (skipping spaces)
- **Same Speed**: Uses `TILES_PER_FRAME` constant for consistent reveal speed

**Design Pattern**: Pre-computing all character positions is cleaner than calculating them during animation. This separates layout logic from rendering logic.

---

## Step 4: Pulse Animation Effect

Now let's add the final touch - a pulsing color effect using tty's built-in Animation System.

### Apply Pulse Animation

```typescript
class IntroAnimation {
  // ... previous code ...

  private startPulseEffect(): void {
    // Apply pulse animation to each character of the ASCII art
    for (const charData of this.textChars) {
      this.renderer.pulse(charData.x, charData.y, {
        fg: "gold", // Named, hex, or RGB colors are supported
        duration: 1000, // 1 second pulse cycle
        minIntensity: 0.5, // Fade to 50%
        maxIntensity: 1.0, // Full brightness
        loop: true, // Loop forever
        easing: "easeInOut", // Smooth easing
      });
    }
  }

  private updatePulsing(): void {
    // Nothing to do in update - animations run automatically
  }

  private render(): void {
    // During pulsing, redraw everything each frame
    if (this.state === "pulsing") {
      this.renderer.clear();

      // Redraw complete border
      for (const tile of this.borderTiles) {
        this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91");
      }

      // Redraw complete text (will be animated by pulse)
      for (const charData of this.textChars) {
        this.renderer.setChar(charData.x, charData.y, charData.char, "#888888");
      }
    }

    // Update animations (applies pulse effect)
    this.renderer.updateAnimations();
    this.renderer.render();
  }
}
```

**What's Happening:**

- **Pulse API**: `renderer.pulse()` creates color pulsing animations
- **Per-Character**: Each character gets its own pulse animation
- **Auto-Running**: Animations update automatically in `updateAnimations()`
- **Full Redraw**: During pulsing phase, redraw everything each frame so animations can be applied

**Key tty APIs Used:**

- `renderer.pulse(x, y, options)` - Create pulsing color animation
  - `fg` - Target color (named, hex, or RGB)
  - `duration` - Pulse cycle time in milliseconds
  - `minIntensity` - Minimum brightness (0.0 to 1.0)
  - `maxIntensity` - Maximum brightness (0.0 to 1.0)
  - `loop` - Whether to repeat forever
  - `easing` - Easing function ("linear", "easeIn", "easeOut", "easeInOut")
- `renderer.updateAnimations()` - Apply active animations to cells

**Why Clear During Pulsing?** The animation system modifies the foreground colors. We need to redraw the base content each frame so the animation can be applied on top.

---

## Step 5: Easing and Timing Control

Let's understand how to control animation speed and add custom easing.

### Animation Timing Explained

```typescript
// Adjust drawing speed
const TILES_PER_FRAME = 4; // Faster: 8, Slower: 2

// Pulse timing options
this.renderer.pulse(x, y, {
  fg: "gold",
  duration: 1000, // Faster: 500, Slower: 2000
  minIntensity: 0.5, // Dimmer: 0.3, Brighter: 0.7
  maxIntensity: 1.0,
  loop: true,
  easing: "easeInOut", // Options: linear, easeIn, easeOut, easeInOut
});

// Custom easing function (for advanced users)
private easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
```

**Easing Types:**

- `"linear"` - Constant speed (mechanical feel)
- `"easeIn"` - Slow start, fast end (acceleration)
- `"easeOut"` - Fast start, slow end (deceleration)
- `"easeInOut"` - Slow start and end, fast middle (smooth, natural)

**Timing Tips:**

- **Drawing Speed**: Lower `TILES_PER_FRAME` for dramatic reveals, higher for snappy animations
- **Pulse Duration**: 1000ms (1 sec) is good for attention, 2000ms (2 sec) for subtle ambiance
- **Intensity Range**: Large range (0.3 to 1.0) for dramatic pulse, narrow (0.7 to 1.0) for subtle glow

---

## Complete Example

Here's the full working intro animation:

```typescript
import { Renderer, GameLoop } from "@shaisrc/tty";

const VIEWPORT_WIDTH = 115;
const VIEWPORT_HEIGHT = 30;

const BOX_WIDTH = 110;
const BOX_HEIGHT = 20;
const BOX_X = Math.floor((VIEWPORT_WIDTH - BOX_WIDTH) / 2);
const BOX_Y = Math.floor((VIEWPORT_HEIGHT - BOX_HEIGHT) / 2);

const TILES_PER_FRAME = 4;

const ASCII_ART: Record<string, string[]> = {
  "@": [
    " @@@@@ ",
    "@     @",
    "@ @@@ @",
    "@ @ @ @",
    "@ @@@@@",
    "@     @",
    " @@@@@ ",
  ],
  s: [
    " ssssss ",
    "ss      ",
    "ss      ",
    " ssssss ",
    "      ss",
    "      ss",
    " ssssss ",
  ],
  h: [
    "hh    hh",
    "hh    hh",
    "hhhhhhhh",
    "hh    hh",
    "hh    hh",
    "hh    hh",
    "hh    hh",
  ],
  a: [
    "  aaaa  ",
    " aa  aa ",
    "aa    aa",
    "aaaaaaaa",
    "aa    aa",
    "aa    aa",
    "aa    aa",
  ],
  i: [
    "iiiiiii",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "  iii  ",
    "iiiiiii",
  ],
  r: [
    "rrrrrr  ",
    "rr   rr ",
    "rr   rr ",
    "rrrrrr  ",
    "rr  rr  ",
    "rr   rr ",
    "rr    rr",
  ],
  c: [
    " ccccc ",
    "c     c",
    "c      ",
    "c      ",
    "c      ",
    "c     c",
    " ccccc ",
  ],
  "/": [
    "      //",
    "     // ",
    "    //  ",
    "   //   ",
    "  //    ",
    " //     ",
    "//      ",
  ],
  t: [
    "ttttttt",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
    "  ttt  ",
  ],
  y: [
    "yy    yy",
    "yy    yy",
    " yy  yy ",
    "  yyyy  ",
    "   yy   ",
    "   yy   ",
    "   yy   ",
  ],
  " ": [
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
    "       ",
  ],
};

type AnimationState = "drawing-border" | "drawing-text" | "pulsing";

class IntroAnimation {
  private renderer: Renderer;
  private gameLoop: GameLoop;
  private state: AnimationState = "drawing-border";

  private borderTiles: Array<{ x: number; y: number; char: string }> = [];
  private borderIndex = 0;

  private textChars: Array<{ x: number; y: number; char: string }> = [];
  private textIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "#000033" },
    });

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
      { fps: 60 },
    );

    this.initializeBorderTiles();
    this.initializeTextArt();
  }

  private initializeBorderTiles(): void {
    const chars = {
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      vertical: "║",
    };

    // Top edge
    for (let i = 0; i < BOX_WIDTH; i++) {
      const x = BOX_X + i;
      const y = BOX_Y;
      const char =
        i === 0
          ? chars.topLeft
          : i === BOX_WIDTH - 1
            ? chars.topRight
            : chars.horizontal;
      this.borderTiles.push({ x, y, char });
    }

    // Right edge
    for (let i = 1; i < BOX_HEIGHT - 1; i++) {
      const x = BOX_X + BOX_WIDTH - 1;
      const y = BOX_Y + i;
      this.borderTiles.push({ x, y, char: chars.vertical });
    }

    // Bottom edge
    for (let i = BOX_WIDTH - 1; i >= 0; i--) {
      const x = BOX_X + i;
      const y = BOX_Y + BOX_HEIGHT - 1;
      const char =
        i === BOX_WIDTH - 1
          ? chars.bottomRight
          : i === 0
            ? chars.bottomLeft
            : chars.horizontal;
      this.borderTiles.push({ x, y, char });
    }

    // Left edge
    for (let i = BOX_HEIGHT - 2; i > 0; i--) {
      const x = BOX_X;
      const y = BOX_Y + i;
      this.borderTiles.push({ x, y, char: chars.vertical });
    }
  }

  private initializeTextArt(): void {
    const text = "@shaisrc/tty";
    const charWidth = 8;
    const charHeight = 7;
    const spacing = 1;

    const totalWidth = text.length * (charWidth + spacing) - spacing;
    const startX = BOX_X + Math.floor((BOX_WIDTH - totalWidth) / 2);
    const startY = BOX_Y + Math.floor((BOX_HEIGHT - charHeight) / 2);

    let currentX = startX;
    for (const letter of text) {
      const pattern = ASCII_ART[letter] || ASCII_ART[" "];
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          const char = pattern[row][col];
          if (char !== " ") {
            this.textChars.push({
              x: currentX + col,
              y: startY + row,
              char: char,
            });
          }
        }
      }
      currentX += charWidth + spacing;
    }
  }

  private update(dt: number): void {
    switch (this.state) {
      case "drawing-border":
        this.updateBorderDrawing();
        break;
      case "drawing-text":
        this.updateTextDrawing();
        break;
      case "pulsing":
        this.updatePulsing();
        break;
    }
  }

  private updateBorderDrawing(): void {
    for (
      let i = 0;
      i < TILES_PER_FRAME && this.borderIndex < this.borderTiles.length;
      i++
    ) {
      const tile = this.borderTiles[this.borderIndex];
      this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91");
      this.borderIndex++;
    }

    if (this.borderIndex >= this.borderTiles.length) {
      this.state = "drawing-text";
    }
  }

  private updateTextDrawing(): void {
    for (
      let i = 0;
      i < TILES_PER_FRAME && this.textIndex < this.textChars.length;
      i++
    ) {
      const charData = this.textChars[this.textIndex];
      this.renderer.setChar(charData.x, charData.y, charData.char, "#888888");
      this.textIndex++;
    }

    if (this.textIndex >= this.textChars.length) {
      this.state = "pulsing";
      this.startPulseEffect();
    }
  }

  private startPulseEffect(): void {
    for (const charData of this.textChars) {
      this.renderer.pulse(charData.x, charData.y, {
        fg: "gold",
        duration: 1000,
        minIntensity: 0.5,
        maxIntensity: 1.0,
        loop: true,
        easing: "easeInOut",
      });
    }
  }

  private updatePulsing(): void {
    // Animations run automatically
  }

  private render(): void {
    if (this.state === "pulsing") {
      this.renderer.clear();

      for (const tile of this.borderTiles) {
        this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91");
      }

      for (const charData of this.textChars) {
        this.renderer.setChar(charData.x, charData.y, charData.char, "#888888");
      }
    }

    this.renderer.updateAnimations();
    this.renderer.render();
  }

  start(): void {
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }
}

// Start the animation
const canvas = document.getElementById("game") as HTMLCanvasElement;
const animation = new IntroAnimation(canvas);
animation.start();
```

---

## Summary

You've mastered animation techniques! Here's what you learned:

### Key Concepts

- **State Machines** - Manage multi-phase animations cleanly
- **Pre-computation** - Calculate animation data upfront for performance
- **Sequential Drawing** - Reveal effects with batched drawing
- **Built-in Animations** - Use tty's Animation System for effects
- **Frame-based Timing** - Control speed with tiles-per-frame

### tty APIs Mastered

- `GameLoop(update, render, options)` - Animation loop
- `renderer.pulse(x, y, options)` - Pulsing color animations
- `renderer.updateAnimations()` - Process active animations
- `renderer.setChar(x, y, char, fg)` - Individual character drawing

### Design Patterns

- **State Machine** - Clean separation of animation phases
- **Pre-computed Paths** - Generate animation sequences upfront
- **Constant-based Speed** - Easy to tune with `TILES_PER_FRAME`
- **Conditional Rendering** - Different render logic per state

### Animation Techniques

- **Tile-by-Tile Reveals** - Sequential drawing with index tracking
- **Color Pulsing** - Smooth color transitions with easing
- **ASCII Art** - Character-based graphics with reveal effects
- **Timing Control** - Duration, intensity, and easing options

---

## Next Steps

- **[Game Loop Guide](../guide/game-loop.md)** - Deep dive into update/render cycle
- **[Animation Methods (API Reference)](../api/README.md)** - Flash, pulse, and custom animations
- **[Tutorial 1: Building Your First Game](./01-building-your-first-game.md)** - Start from the beginning
- **[Tutorial 3: Building Complex UIs](./03-building-complex-uis.md)** - Multi-panel layouts

---

## Try It Yourself

**Challenge 1**: Add a "flash" effect before the pulse (use `renderer.flash()`)

**Challenge 2**: Create a typewriter effect where text appears letter-by-letter with a pause

**Challenge 3**: Add a fade-in effect by gradually increasing the alpha of all characters

**Challenge 4**: Create a "wave" effect where each letter pulses slightly out of phase

**Challenge 5**: Create a rainbow effect where each letter pulses with a different color
