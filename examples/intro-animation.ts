import { Renderer, GameLoop } from "@shaisrc/tty";

const VIEWPORT_WIDTH = 115;
const VIEWPORT_HEIGHT = 30;

const BOX_WIDTH = 110;
const BOX_HEIGHT = 20;
const BOX_X = Math.floor((VIEWPORT_WIDTH - BOX_WIDTH) / 2);
const BOX_Y = Math.floor((VIEWPORT_HEIGHT - BOX_HEIGHT) / 2);

const TILES_PER_FRAME = 4;

// ASCII art patterns for "@shaisrc/tty" where each char is made from itself
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

  // Border drawing state
  private borderTiles: Array<{ x: number; y: number; char: string }> = [];
  private borderIndex = 0;

  // Text drawing state
  private textChars: Array<{ x: number; y: number; char: string }> = [];
  private textIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = Renderer.forCanvas(canvas, {
      grid: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      cell: { width: 12, height: 20 },
      colors: { fg: "white", bg: "#000000" },
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

  private initializeTextArt(): void {
    const text = "@shaisrc/tty";
    const charWidth = 8;
    const charHeight = 7;
    const spacing = 1;

    // Calculate total width
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
    // Draw 4 tiles per frame
    for (
      let i = 0;
      i < TILES_PER_FRAME && this.borderIndex < this.borderTiles.length;
      i++
    ) {
      const tile = this.borderTiles[this.borderIndex];
      this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91"); // Dark purple border
      this.borderIndex++;
    }

    // Check if border is complete
    if (this.borderIndex >= this.borderTiles.length) {
      this.state = "drawing-text";
    }
  }

  private updateTextDrawing(): void {
    // Draw 4 characters per frame directly to buffer
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
      this.state = "pulsing";
      this.startPulseEffect();
    }
  }

  private startPulseEffect(): void {
    // Apply pulse animation to each character of the ASCII art
    for (const charData of this.textChars) {
      this.renderer.pulse(charData.x, charData.y, {
        fg: "#FFD700",
        duration: 1000,
        minIntensity: 0.5,
        maxIntensity: 1.0,
        loop: true,
        easing: "easeInOut",
      });
    }
  }

  private updatePulsing(): void {
    // Nothing to do in update, animations update in render
  }

  private render(): void {
    // Only clear during pulsing (for animation updates)
    // During drawing states, tiles accumulate
    if (this.state === "pulsing") {
      this.renderer.clear();

      // Redraw complete box
      for (let i = 0; i < this.borderTiles.length; i++) {
        const tile = this.borderTiles[i];
        this.renderer.setChar(tile.x, tile.y, tile.char, "#6B2C91");
      }

      // Redraw complete text
      for (const charData of this.textChars) {
        this.renderer.setChar(charData.x, charData.y, charData.char, "#888888");
      }
    }

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

// Example usage
function startIntroAnimation(canvas: HTMLCanvasElement) {
  const demo = new IntroAnimation(canvas);
  demo.start();
  return demo;
}

// Expose for dynamic imports
if (typeof window !== "undefined") {
  (window as any).startIntroAnimation = startIntroAnimation;
}

export { startIntroAnimation };

// If running in browser directly
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    if (canvas) {
      startIntroAnimation(canvas);
    }
  });
}
