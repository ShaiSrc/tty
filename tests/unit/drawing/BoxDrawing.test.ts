import { describe, it, expect, beforeEach } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";

// Mock render target
class MockRenderTarget implements RenderTarget {
  width: number;
  height: number;
  cells: Map<string, { char: string; fg: any; bg: any }> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setCell(x: number, y: number, char: string, fg: any, bg: any): void {
    this.cells.set(`${x},${y}`, { char, fg, bg });
  }

  clear(): void {
    this.cells.clear();
  }

  flush(): void {}

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }
}

describe("Box Drawing", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("box", () => {
    it("should draw a box with single-line style", () => {
      renderer.box(5, 5, 10, 5, { style: "single" });
      renderer.render();

      // Corners
      expect(target.getCell(5, 5)?.char).toBe("┌");
      expect(target.getCell(14, 5)?.char).toBe("┐");
      expect(target.getCell(5, 9)?.char).toBe("└");
      expect(target.getCell(14, 9)?.char).toBe("┘");

      // Horizontal edges
      expect(target.getCell(6, 5)?.char).toBe("─");
      expect(target.getCell(6, 9)?.char).toBe("─");

      // Vertical edges
      expect(target.getCell(5, 6)?.char).toBe("│");
      expect(target.getCell(14, 6)?.char).toBe("│");
    });

    it("should draw a box with double-line style", () => {
      renderer.box(0, 0, 5, 3, { style: "double" });
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("╔");
      expect(target.getCell(4, 0)?.char).toBe("╗");
      expect(target.getCell(0, 2)?.char).toBe("╚");
      expect(target.getCell(4, 2)?.char).toBe("╝");
      expect(target.getCell(1, 0)?.char).toBe("═");
      expect(target.getCell(0, 1)?.char).toBe("║");
    });

    it("should draw a box with rounded style", () => {
      renderer.box(0, 0, 5, 3, { style: "rounded" });
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("╭");
      expect(target.getCell(4, 0)?.char).toBe("╮");
      expect(target.getCell(0, 2)?.char).toBe("╰");
      expect(target.getCell(4, 2)?.char).toBe("╯");
    });

    it("should draw a box with heavy style", () => {
      renderer.box(0, 0, 5, 3, { style: "heavy" });
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("┏");
      expect(target.getCell(4, 0)?.char).toBe("┓");
      expect(target.getCell(0, 2)?.char).toBe("┗");
      expect(target.getCell(4, 2)?.char).toBe("┛");
      expect(target.getCell(1, 0)?.char).toBe("━");
      expect(target.getCell(0, 1)?.char).toBe("┃");
    });

    it("should draw a box with ASCII style", () => {
      renderer.box(0, 0, 5, 3, { style: "ascii" });
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("+");
      expect(target.getCell(4, 0)?.char).toBe("+");
      expect(target.getCell(0, 2)?.char).toBe("+");
      expect(target.getCell(4, 2)?.char).toBe("+");
      expect(target.getCell(1, 0)?.char).toBe("-");
      expect(target.getCell(0, 1)?.char).toBe("|");
    });

    it("should draw a box with custom border characters", () => {
      renderer.box(0, 0, 5, 3, {
        style: {
          topLeft: "A",
          topRight: "B",
          bottomLeft: "C",
          bottomRight: "D",
          horizontal: "X",
          vertical: "Y",
        },
      });
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("A");
      expect(target.getCell(4, 0)?.char).toBe("B");
      expect(target.getCell(0, 2)?.char).toBe("C");
      expect(target.getCell(4, 2)?.char).toBe("D");
      expect(target.getCell(1, 0)?.char).toBe("X");
      expect(target.getCell(0, 1)?.char).toBe("Y");
    });

    it("should draw a box with custom colors", () => {
      renderer.box(0, 0, 5, 3, { style: "single", fg: "cyan", bg: "blue" });
      renderer.render();

      const corner = target.getCell(0, 0);
      expect(corner?.fg).toBe("cyan");
      expect(corner?.bg).toBe("blue");
    });

    it("should fill the box interior when fill is true", () => {
      renderer.box(0, 0, 5, 5, { style: "single", fill: true });
      renderer.render();

      // Interior cells should be filled with spaces
      expect(target.getCell(1, 1)?.char).toBe(" ");
      expect(target.getCell(2, 2)?.char).toBe(" ");
      expect(target.getCell(3, 3)?.char).toBe(" ");
    });

    it("should fill with custom character", () => {
      renderer.box(0, 0, 5, 5, { style: "single", fill: true, fillChar: "█" });
      renderer.render();

      expect(target.getCell(1, 1)?.char).toBe("█");
      expect(target.getCell(2, 2)?.char).toBe("█");
    });

    it("should not fill when fill is false", () => {
      renderer.box(0, 0, 5, 5, { style: "single", fill: false });
      renderer.render();

      expect(target.getCell(1, 1)).toBeUndefined();
      expect(target.getCell(2, 2)).toBeUndefined();
    });

    it("should default to single style when no style provided", () => {
      renderer.box(0, 0, 5, 3);
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("┌");
    });

    it("should return this for chaining", () => {
      const result = renderer.box(0, 0, 5, 5);
      expect(result).toBe(renderer);
    });

    it("should handle 1x1 box (just corners)", () => {
      renderer.box(5, 5, 1, 1, { style: "single" });
      renderer.render();

      // For a 1x1 box, we show just a single corner or special char
      expect(target.getCell(5, 5)?.char).toBeDefined();
    });

    it("should handle 2x2 box (minimal box)", () => {
      renderer.box(5, 5, 2, 2, { style: "single" });
      renderer.render();

      expect(target.getCell(5, 5)?.char).toBe("┌");
      expect(target.getCell(6, 5)?.char).toBe("┐");
      expect(target.getCell(5, 6)?.char).toBe("└");
      expect(target.getCell(6, 6)?.char).toBe("┘");
    });
  });

  describe("border", () => {
    it("should draw only border without fill", () => {
      renderer.border(0, 0, 5, 5, { style: "single" });
      renderer.render();

      // Border should exist
      expect(target.getCell(0, 0)?.char).toBe("┌");

      // Interior should be empty
      expect(target.getCell(1, 1)).toBeUndefined();
    });

    it("should be equivalent to box with fill: false", () => {
      const target1 = new MockRenderTarget(10, 10);
      const target2 = new MockRenderTarget(10, 10);
      const r1 = new Renderer(target1);
      const r2 = new Renderer(target2);

      r1.border(0, 0, 5, 5, { style: "single" }).render();
      r2.box(0, 0, 5, 5, { style: "single", fill: false }).render();

      // Compare cells
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const cell1 = target1.getCell(x, y);
          const cell2 = target2.getCell(x, y);
          expect(cell1?.char).toBe(cell2?.char);
        }
      }
    });
  });

  describe("rect", () => {
    it("should draw a filled rectangle", () => {
      renderer.rect(0, 0, 5, 3, "█");
      renderer.render();

      // All cells should be filled
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 5; x++) {
          expect(target.getCell(x, y)?.char).toBe("█");
        }
      }
    });

    it("should draw filled rectangle with colors", () => {
      renderer.rect(0, 0, 3, 3, " ", "white", "red");
      renderer.render();

      const cell = target.getCell(1, 1);
      expect(cell?.char).toBe(" ");
      expect(cell?.fg).toBe("white");
      expect(cell?.bg).toBe("red");
    });

    it("should default to space character", () => {
      renderer.rect(0, 0, 3, 3);
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe(" ");
    });

    it("should return this for chaining", () => {
      const result = renderer.rect(0, 0, 5, 5);
      expect(result).toBe(renderer);
    });
  });

  describe("chaining", () => {
    it("should allow chaining box methods", () => {
      renderer
        .clear()
        .box(0, 0, 10, 5, { style: "double" })
        .border(15, 0, 10, 5, { style: "single" })
        .rect(30, 0, 5, 5, "█")
        .render();

      expect(target.getCell(0, 0)?.char).toBe("╔");
      expect(target.getCell(15, 0)?.char).toBe("┌");
      expect(target.getCell(30, 0)?.char).toBe("█");
    });
  });

  describe("box titles", () => {
    it("should draw a box with a centered title", () => {
      renderer.box(5, 5, 20, 5, {
        style: "single",
        title: "Test",
      });
      renderer.render();

      // Title " Test " is 6 chars
      // Width is 20, so center position for a 6-char title is (20-6)/2 = 7
      // titleX = 5 + 7 = 12
      expect(target.getCell(12, 5)?.char).toBe(" ");
      expect(target.getCell(13, 5)?.char).toBe("T");
      expect(target.getCell(14, 5)?.char).toBe("e");
      expect(target.getCell(15, 5)?.char).toBe("s");
      expect(target.getCell(16, 5)?.char).toBe("t");
      expect(target.getCell(17, 5)?.char).toBe(" ");
    });

    it("should draw a box with a left-aligned title", () => {
      renderer.box(5, 5, 20, 5, {
        style: "single",
        title: "Left",
        titleAlign: "left",
      });
      renderer.render();

      // Title should start at x+2 (leave space for corner and padding)
      expect(target.getCell(7, 5)?.char).toBe(" ");
      expect(target.getCell(8, 5)?.char).toBe("L");
      expect(target.getCell(9, 5)?.char).toBe("e");
      expect(target.getCell(10, 5)?.char).toBe("f");
      expect(target.getCell(11, 5)?.char).toBe("t");
      expect(target.getCell(12, 5)?.char).toBe(" ");
    });

    it("should draw a box with a right-aligned title", () => {
      renderer.box(5, 5, 20, 5, {
        style: "single",
        title: "Right",
        titleAlign: "right",
      });
      renderer.render();

      // " Right " is 7 chars
      // titleX = x + width - titleLength - 2 = 5 + 20 - 7 - 2 = 16
      const titleStart = 5 + 20 - 7 - 2;
      expect(target.getCell(titleStart, 5)?.char).toBe(" ");
      expect(target.getCell(titleStart + 1, 5)?.char).toBe("R");
      expect(target.getCell(titleStart + 2, 5)?.char).toBe("i");
      expect(target.getCell(titleStart + 3, 5)?.char).toBe("g");
      expect(target.getCell(titleStart + 4, 5)?.char).toBe("h");
      expect(target.getCell(titleStart + 5, 5)?.char).toBe("t");
      expect(target.getCell(titleStart + 6, 5)?.char).toBe(" ");
    });

    it("should support custom title color", () => {
      renderer.box(5, 5, 20, 5, {
        style: "single",
        fg: "cyan",
        title: "Title",
        titleFg: "yellow",
      });
      renderer.render();

      // Border should be cyan
      expect(target.getCell(5, 5)?.fg).toBe("cyan");

      // Title should be yellow (centered)
      const titleStart = 5 + Math.floor((20 - 7) / 2);
      expect(target.getCell(titleStart + 1, 5)?.fg).toBe("yellow");
    });

    it("should truncate long titles", () => {
      renderer.box(5, 5, 10, 5, {
        style: "single",
        title: "This is a very long title that should be truncated",
      });
      renderer.render();

      // Maximum title length is width - 4 = 6
      // displayTitle = "This i" (6 chars)
      // With spaces " This i " = 8 chars
      // titleX = 5 + (10-8)/2 = 6
      expect(target.getCell(6, 5)?.char).toBe(" ");
      expect(target.getCell(7, 5)?.char).toBe("T");
      expect(target.getCell(8, 5)?.char).toBe("h");
      expect(target.getCell(9, 5)?.char).toBe("i");
      expect(target.getCell(10, 5)?.char).toBe("s");
      expect(target.getCell(11, 5)?.char).toBe(" ");
      expect(target.getCell(12, 5)?.char).toBe("i");
      expect(target.getCell(13, 5)?.char).toBe(" ");
    });

    it("should work with different box styles", () => {
      renderer.box(5, 5, 20, 5, {
        style: "double",
        title: "Double",
      });
      renderer.render();

      // Should have double borders
      expect(target.getCell(5, 5)?.char).toBe("╔");

      // Should have title (centered)
      // " Double " is 8 chars
      // titleX = 5 + (20-8)/2 = 11
      expect(target.getCell(11, 5)?.char).toBe(" ");
      expect(target.getCell(12, 5)?.char).toBe("D");
    });
  });
});
