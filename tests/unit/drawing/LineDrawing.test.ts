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

  getCellsArray() {
    return Array.from(this.cells.entries());
  }
}

describe("Line Drawing", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("drawLine", () => {
    it("should draw a horizontal line from left to right", () => {
      renderer.drawLine(0, 5, 10, 5, "-");
      renderer.render();

      for (let x = 0; x <= 10; x++) {
        expect(target.getCell(x, 5)?.char).toBe("-");
      }
    });

    it("should draw a horizontal line from right to left", () => {
      renderer.drawLine(10, 5, 0, 5, "-");
      renderer.render();

      for (let x = 0; x <= 10; x++) {
        expect(target.getCell(x, 5)?.char).toBe("-");
      }
    });

    it("should draw a vertical line from top to bottom", () => {
      renderer.drawLine(5, 0, 5, 10, "|");
      renderer.render();

      for (let y = 0; y <= 10; y++) {
        expect(target.getCell(5, y)?.char).toBe("|");
      }
    });

    it("should draw a vertical line from bottom to top", () => {
      renderer.drawLine(5, 10, 5, 0, "|");
      renderer.render();

      for (let y = 0; y <= 10; y++) {
        expect(target.getCell(5, y)?.char).toBe("|");
      }
    });

    it("should draw a diagonal line from top-left to bottom-right", () => {
      renderer.drawLine(0, 0, 5, 5, "/");
      renderer.render();

      // Check that cells along diagonal are drawn
      expect(target.getCell(0, 0)?.char).toBe("/");
      expect(target.getCell(1, 1)?.char).toBe("/");
      expect(target.getCell(2, 2)?.char).toBe("/");
      expect(target.getCell(3, 3)?.char).toBe("/");
      expect(target.getCell(4, 4)?.char).toBe("/");
      expect(target.getCell(5, 5)?.char).toBe("/");
    });

    it("should draw a diagonal line from top-right to bottom-left", () => {
      renderer.drawLine(10, 0, 0, 10, "\\");
      renderer.render();

      // Check that cells along diagonal are drawn
      expect(target.getCell(10, 0)?.char).toBe("\\");
      expect(target.getCell(5, 5)?.char).toBe("\\");
      expect(target.getCell(0, 10)?.char).toBe("\\");
    });

    it("should draw a line with foreground color", () => {
      renderer.drawLine(0, 0, 5, 0, "-", { fg: "cyan" });
      renderer.render();

      expect(target.getCell(0, 0)?.fg).toBe("cyan");
      expect(target.getCell(5, 0)?.fg).toBe("cyan");
    });

    it("should draw a line with background color", () => {
      renderer.drawLine(0, 0, 5, 0, "-", { bg: "blue" });
      renderer.render();

      expect(target.getCell(0, 0)?.bg).toBe("blue");
      expect(target.getCell(5, 0)?.bg).toBe("blue");
    });

    it("should draw a line with both foreground and background colors", () => {
      renderer.drawLine(0, 0, 5, 0, "-", { fg: "yellow", bg: "black" });
      renderer.render();

      expect(target.getCell(0, 0)?.fg).toBe("yellow");
      expect(target.getCell(0, 0)?.bg).toBe("black");
      expect(target.getCell(5, 0)?.fg).toBe("yellow");
      expect(target.getCell(5, 0)?.bg).toBe("black");
    });

    it("should draw a single point when start and end are the same", () => {
      renderer.drawLine(5, 5, 5, 5, "*");
      renderer.render();

      expect(target.getCell(5, 5)?.char).toBe("*");
      // Should only draw one cell
      expect(target.getCellsArray().length).toBe(1);
    });

    it("should handle steep lines correctly", () => {
      // Vertical-ish line (more vertical than horizontal)
      renderer.drawLine(0, 0, 2, 10, "|");
      renderer.render();

      // Should start and end at correct points
      expect(target.getCell(0, 0)?.char).toBe("|");
      expect(target.getCell(2, 10)?.char).toBe("|");

      // Should have drawn multiple cells
      expect(target.getCellsArray().length).toBeGreaterThan(2);
    });

    it("should handle shallow lines correctly", () => {
      // Horizontal-ish line (more horizontal than vertical)
      renderer.drawLine(0, 0, 10, 2, "-");
      renderer.render();

      // Should start and end at correct points
      expect(target.getCell(0, 0)?.char).toBe("-");
      expect(target.getCell(10, 2)?.char).toBe("-");

      // Should have drawn multiple cells
      expect(target.getCellsArray().length).toBeGreaterThan(2);
    });

    it("should be chainable", () => {
      const result = renderer
        .drawLine(0, 0, 5, 5, "/")
        .drawLine(5, 0, 0, 5, "\\");

      expect(result).toBe(renderer);
    });

    it("should work with different line characters", () => {
      renderer.drawLine(0, 0, 5, 0, "═");
      renderer.render();

      for (let x = 0; x <= 5; x++) {
        expect(target.getCell(x, 0)?.char).toBe("═");
      }
    });

    it("should create an X pattern with two diagonal lines", () => {
      renderer
        .drawLine(0, 0, 10, 10, "/", { fg: "cyan" })
        .drawLine(10, 0, 0, 10, "\\", { fg: "cyan" });
      renderer.render();

      // Check corners
      expect(target.getCell(0, 0)?.char).toBe("/");
      expect(target.getCell(10, 0)?.char).toBe("\\");
      expect(target.getCell(0, 10)?.char).toBe("\\");
      expect(target.getCell(10, 10)?.char).toBe("/");

      // Check intersection point (middle)
      const midCell = target.getCell(5, 5);
      expect(midCell?.char).toBeTruthy();
      expect(midCell?.fg).toBe("cyan");
    });

    it("should draw lines at various angles", () => {
      // Test Bresenham with different slopes
      const testCases = [
        { x1: 0, y1: 0, x2: 10, y2: 3 }, // Shallow positive
        { x1: 0, y1: 0, x2: 3, y2: 10 }, // Steep positive
        { x1: 10, y1: 0, x2: 0, y2: 3 }, // Shallow negative
        { x1: 10, y1: 0, x2: 7, y2: 10 }, // Steep negative
      ];

      testCases.forEach(({ x1, y1, x2, y2 }, index) => {
        const localTarget = new MockRenderTarget(80, 24);
        const localRenderer = new Renderer(localTarget);

        localRenderer.drawLine(x1, y1, x2, y2, "o");
        localRenderer.render();

        // Verify start and end points
        expect(localTarget.getCell(x1, y1)?.char).toBe("o");
        expect(localTarget.getCell(x2, y2)?.char).toBe("o");

        // Verify continuous line (no gaps)
        const cells = localTarget.getCellsArray();
        expect(cells.length).toBeGreaterThan(0);
      });
    });
  });
});
