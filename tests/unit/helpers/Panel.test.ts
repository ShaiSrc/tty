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

describe("Panel Helper", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("panel", () => {
    it("should draw a basic panel with title", () => {
      renderer.panel(10, 5, 30, 10, { title: "Test Panel" });
      renderer.render();

      // Check box is drawn
      expect(target.getCell(10, 5)?.char).toBe("┌");
      expect(target.getCell(39, 5)?.char).toBe("┐");

      // Check title is present (should be in the top border)
      expect(target.getCell(12, 5)?.char).toBe("T");
    });

    it("should draw panel without title", () => {
      renderer.panel(10, 5, 20, 8);
      renderer.render();

      // Check box corners
      expect(target.getCell(10, 5)?.char).toBe("┌");
      expect(target.getCell(29, 5)?.char).toBe("┐");
      expect(target.getCell(10, 12)?.char).toBe("└");
      expect(target.getCell(29, 12)?.char).toBe("┘");
    });

    it("should draw content inside panel", () => {
      renderer.panel(10, 5, 30, 10, {
        content: ["Line 1", "Line 2", "Line 3"],
      });
      renderer.render();

      // Check content (should be offset by 1 from border)
      expect(target.getCell(11, 6)?.char).toBe("L");
      expect(target.getCell(11, 7)?.char).toBe("L");
      expect(target.getCell(11, 8)?.char).toBe("L");
    });

    it("should apply padding to content", () => {
      renderer.panel(10, 5, 30, 10, {
        content: ["Test"],
        padding: 2,
      });
      renderer.render();

      // Content should start at x+3, y+3 (border + 2 padding)
      expect(target.getCell(13, 8)?.char).toBe("T");
    });

    it("should use custom box style", () => {
      renderer.panel(10, 5, 20, 8, { style: "double" });
      renderer.render();

      // Check double-line corners
      expect(target.getCell(10, 5)?.char).toBe("╔");
      expect(target.getCell(29, 5)?.char).toBe("╗");
    });

    it("should apply custom colors", () => {
      renderer.panel(10, 5, 20, 8, {
        fg: "cyan",
        bg: "black",
      });
      renderer.render();

      const corner = target.getCell(10, 5);
      expect(corner?.fg).toBe("cyan");
      expect(corner?.bg).toBe("black");
    });

    it("should support title alignment", () => {
      renderer.panel(10, 5, 30, 10, {
        title: "Center",
        titleAlign: "center",
      });
      renderer.render();

      // Title should be centered in the border
      // Width is 30, "Center" is 6 chars, should start around x=22
      const centerPos = 10 + Math.floor((30 - 6) / 2);
      expect(target.getCell(centerPos, 5)?.char).toBe("C");
    });

    it("should handle scrollable content", () => {
      const longContent = Array(20)
        .fill(null)
        .map((_, i) => `Line ${i + 1}`);

      renderer.panel(10, 5, 30, 10, {
        content: longContent,
        scrollOffset: 5,
      });
      renderer.render();

      // Should show content starting from line 5
      // Panel height is 10, minus 2 for borders = 8 lines visible
      expect(target.getCell(11, 6)?.char).toBe("L");
    });

    it("should fill panel background", () => {
      renderer.panel(10, 5, 20, 8, {
        fill: true,
        fillChar: ".",
        bg: "gray",
      });
      renderer.render();

      // Check interior is filled
      expect(target.getCell(11, 6)?.char).toBe(".");
      expect(target.getCell(11, 6)?.bg).toBe("gray");
    });

    it("should return this for chaining", () => {
      const result = renderer.panel(10, 5, 20, 8);
      expect(result).toBe(renderer);
    });

    it("should handle content with alignment", () => {
      renderer.panel(10, 5, 30, 10, {
        content: ["Left", "Center", "Right"],
        contentAlign: "center",
      });
      renderer.render();

      // Content should be centered within panel
      const panelWidth = 30 - 2; // minus borders
      const centerX = 11 + Math.floor((panelWidth - 6) / 2);
      expect(target.getCell(centerX, 7)?.char).toBe("C");
    });

    it("should support footer text", () => {
      renderer.panel(10, 5, 30, 10, {
        footer: "Press ESC to close",
      });
      renderer.render();

      // Footer should be in the bottom border
      expect(target.getCell(12, 14)?.char).toBe("P");
    });

    it("should handle empty content gracefully", () => {
      renderer.panel(10, 5, 20, 8, { content: [] });
      renderer.render();

      // Should just render the box
      expect(target.getCell(10, 5)?.char).toBe("┌");
      expect(target.getCell(29, 5)?.char).toBe("┐");
    });
  });
});
