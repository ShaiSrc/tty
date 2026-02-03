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

describe("Progress Bar Helper", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("progressBar", () => {
    it("should draw a basic progress bar", () => {
      renderer.progressBar(10, 5, 20, 0.5);
      renderer.render();

      // Check filled portion (50% of 20 = 10 chars)
      expect(target.getCell(10, 5)?.char).toBe("█");
      expect(target.getCell(19, 5)?.char).toBe("█");

      // Check empty portion
      expect(target.getCell(20, 5)?.char).toBe(" ");
      expect(target.getCell(29, 5)?.char).toBe(" ");
    });

    it("should handle 0% progress", () => {
      renderer.progressBar(10, 5, 20, 0);
      renderer.render();

      // All should be empty
      expect(target.getCell(10, 5)?.char).toBe(" ");
      expect(target.getCell(29, 5)?.char).toBe(" ");
    });

    it("should handle 100% progress", () => {
      renderer.progressBar(10, 5, 20, 1.0);
      renderer.render();

      // All should be filled
      expect(target.getCell(10, 5)?.char).toBe("█");
      expect(target.getCell(29, 5)?.char).toBe("█");
    });

    it("should use custom fill character", () => {
      renderer.progressBar(10, 5, 10, 0.5, { fillChar: "#" });
      renderer.render();

      expect(target.getCell(10, 5)?.char).toBe("#");
      expect(target.getCell(14, 5)?.char).toBe("#");
    });

    it("should use custom empty character", () => {
      renderer.progressBar(10, 5, 10, 0.5, { emptyChar: "-" });
      renderer.render();

      expect(target.getCell(15, 5)?.char).toBe("-");
      expect(target.getCell(19, 5)?.char).toBe("-");
    });

    it("should apply custom colors", () => {
      renderer.progressBar(10, 5, 10, 0.5, {
        fillFg: "green",
        fillBg: "black",
        emptyFg: "gray",
        emptyBg: "black",
      });
      renderer.render();

      const filledCell = target.getCell(10, 5);
      expect(filledCell?.fg).toBe("green");
      expect(filledCell?.bg).toBe("black");

      const emptyCell = target.getCell(15, 5);
      expect(emptyCell?.fg).toBe("gray");
      expect(emptyCell?.bg).toBe("black");
    });

    it("should draw with border", () => {
      renderer.progressBar(10, 5, 20, 0.5, { border: true });
      renderer.render();

      // Check borders
      expect(target.getCell(10, 5)?.char).toBe("[");
      expect(target.getCell(31, 5)?.char).toBe("]");

      // Check progress inside border
      expect(target.getCell(11, 5)?.char).toBe("█");
    });

    it("should show percentage label", () => {
      renderer.progressBar(10, 5, 20, 0.75, { showPercent: true });
      renderer.render();

      // Check for percentage text "75%"
      expect(target.getCell(31, 5)?.char).toBe("7");
      expect(target.getCell(32, 5)?.char).toBe("5");
      expect(target.getCell(33, 5)?.char).toBe("%");
    });

    it("should support vertical orientation", () => {
      renderer.progressBar(10, 5, 10, 0.5, { vertical: true });
      renderer.render();

      // Filled portion (bottom 50%)
      expect(target.getCell(10, 10)?.char).toBe("█");
      expect(target.getCell(10, 14)?.char).toBe("█");

      // Empty portion (top 50%)
      expect(target.getCell(10, 5)?.char).toBe(" ");
      expect(target.getCell(10, 9)?.char).toBe(" ");
    });

    it("should clamp progress to 0-1 range", () => {
      renderer.progressBar(10, 5, 10, 1.5, {});
      renderer.render();

      // Should treat as 100%
      expect(target.getCell(10, 5)?.char).toBe("█");
      expect(target.getCell(19, 5)?.char).toBe("█");

      target.clear();
      renderer.clear();

      renderer.progressBar(10, 5, 10, -0.5, {});
      renderer.render();

      // Should treat as 0%
      expect(target.getCell(10, 5)?.char).toBe(" ");
    });

    it("should support fractional progress values", () => {
      renderer.progressBar(10, 5, 10, 0.33);
      renderer.render();

      // 33% of 10 = 3.3, should fill 3 characters
      expect(target.getCell(10, 5)?.char).toBe("█");
      expect(target.getCell(11, 5)?.char).toBe("█");
      expect(target.getCell(12, 5)?.char).toBe("█");
      expect(target.getCell(13, 5)?.char).toBe(" ");
    });

    it("should return this for chaining", () => {
      const result = renderer.progressBar(10, 5, 20, 0.5);
      expect(result).toBe(renderer);
    });

    it("should support custom label", () => {
      renderer.progressBar(10, 5, 20, 0.6, {
        label: "Loading",
        showPercent: true,
      });
      renderer.render();

      // Check for label
      expect(target.getCell(31, 5)?.char).toBe("L");
    });

    it("should use different styles", () => {
      renderer.progressBar(10, 5, 10, 0.5, { style: "blocks" });
      renderer.render();

      expect(target.getCell(10, 5)?.char).toBe("█");

      target.clear();
      renderer.clear();

      renderer.progressBar(10, 5, 10, 0.5, { style: "dots" });
      renderer.render();

      expect(target.getCell(10, 5)?.char).toBe("●");
    });
  });
});
