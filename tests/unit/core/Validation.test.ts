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
}

describe("Validation API", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("validate.cell", () => {
    it("should return true for valid cell positions", () => {
      expect(renderer.validate.cell(0, 0)).toBe(true);
      expect(renderer.validate.cell(79, 23)).toBe(true);
      expect(renderer.validate.cell(40, 12)).toBe(true);
    });

    it("should return false for negative coordinates", () => {
      expect(renderer.validate.cell(-1, 0)).toBe(false);
      expect(renderer.validate.cell(0, -1)).toBe(false);
      expect(renderer.validate.cell(-10, -10)).toBe(false);
    });

    it("should return false for coordinates beyond bounds", () => {
      expect(renderer.validate.cell(80, 0)).toBe(false);
      expect(renderer.validate.cell(0, 24)).toBe(false);
      expect(renderer.validate.cell(100, 50)).toBe(false);
    });

    it("should return false for coordinates at exactly width/height", () => {
      expect(renderer.validate.cell(80, 24)).toBe(false);
    });
  });

  describe("validate.box", () => {
    it("should return true for boxes that fit within bounds", () => {
      expect(renderer.validate.box(0, 0, 10, 5)).toBe(true);
      expect(renderer.validate.box(10, 10, 20, 10)).toBe(true);
      expect(renderer.validate.box(0, 0, 80, 24)).toBe(true);
    });

    it("should return false for boxes starting outside bounds", () => {
      expect(renderer.validate.box(-1, 0, 10, 5)).toBe(false);
      expect(renderer.validate.box(0, -1, 10, 5)).toBe(false);
      expect(renderer.validate.box(80, 0, 10, 5)).toBe(false);
      expect(renderer.validate.box(0, 24, 10, 5)).toBe(false);
    });

    it("should return false for boxes extending beyond bounds", () => {
      expect(renderer.validate.box(75, 0, 10, 5)).toBe(false); // Extends past right edge
      expect(renderer.validate.box(0, 20, 10, 10)).toBe(false); // Extends past bottom edge
      expect(renderer.validate.box(70, 20, 20, 10)).toBe(false); // Extends past both edges
    });

    it("should return true for a box exactly fitting the screen", () => {
      expect(renderer.validate.box(0, 0, 80, 24)).toBe(true);
    });

    it("should return false for a box one pixel too large", () => {
      expect(renderer.validate.box(0, 0, 81, 24)).toBe(false);
      expect(renderer.validate.box(0, 0, 80, 25)).toBe(false);
    });

    it("should handle 1x1 boxes", () => {
      expect(renderer.validate.box(0, 0, 1, 1)).toBe(true);
      expect(renderer.validate.box(79, 23, 1, 1)).toBe(true);
      expect(renderer.validate.box(80, 23, 1, 1)).toBe(false);
    });
  });

  describe("validate.text", () => {
    it("should return true for text that fits within bounds", () => {
      expect(renderer.validate.text(0, 0, "Hello")).toBe(true);
      expect(renderer.validate.text(10, 10, "Test")).toBe(true);
      expect(renderer.validate.text(75, 0, "12345")).toBe(true); // Exactly fits
    });

    it("should return false for text starting outside bounds", () => {
      expect(renderer.validate.text(-1, 0, "Hello")).toBe(false);
      expect(renderer.validate.text(0, -1, "Hello")).toBe(false);
      expect(renderer.validate.text(80, 0, "Hello")).toBe(false);
      expect(renderer.validate.text(0, 24, "Hello")).toBe(false);
    });

    it("should return false for text extending beyond right edge", () => {
      expect(renderer.validate.text(76, 0, "Hello!")).toBe(false); // 76 + 6 = 82 > 80
      expect(renderer.validate.text(79, 0, "Hi")).toBe(false); // 79 + 2 = 81 > 80
    });

    it("should handle empty strings", () => {
      // Empty string means x + (-1) which is still in bounds at origin
      // This is technically valid as no characters would be drawn
      expect(renderer.validate.text(0, 0, "")).toBe(true);
      expect(renderer.validate.text(79, 23, "")).toBe(true);
    });

    it("should handle single character strings", () => {
      expect(renderer.validate.text(0, 0, "A")).toBe(true);
      expect(renderer.validate.text(79, 23, "Z")).toBe(true);
      expect(renderer.validate.text(80, 23, "X")).toBe(false);
    });

    it("should validate long strings", () => {
      const longString = "A".repeat(80);
      expect(renderer.validate.text(0, 0, longString)).toBe(true);

      const tooLongString = "A".repeat(81);
      expect(renderer.validate.text(0, 0, tooLongString)).toBe(false);
    });
  });

  describe("validate.line", () => {
    it("should return true for lines with both endpoints in bounds", () => {
      expect(renderer.validate.line(0, 0, 10, 10)).toBe(true);
      expect(renderer.validate.line(0, 0, 79, 23)).toBe(true);
      expect(renderer.validate.line(40, 12, 50, 15)).toBe(true);
    });

    it("should return false if start point is out of bounds", () => {
      expect(renderer.validate.line(-1, 0, 10, 10)).toBe(false);
      expect(renderer.validate.line(0, -1, 10, 10)).toBe(false);
      expect(renderer.validate.line(80, 0, 10, 10)).toBe(false);
      expect(renderer.validate.line(0, 24, 10, 10)).toBe(false);
    });

    it("should return false if end point is out of bounds", () => {
      expect(renderer.validate.line(0, 0, -1, 0)).toBe(false);
      expect(renderer.validate.line(0, 0, 0, -1)).toBe(false);
      expect(renderer.validate.line(0, 0, 80, 0)).toBe(false);
      expect(renderer.validate.line(0, 0, 0, 24)).toBe(false);
    });

    it("should return false if both endpoints are out of bounds", () => {
      expect(renderer.validate.line(-1, -1, 80, 24)).toBe(false);
      expect(renderer.validate.line(100, 100, 200, 200)).toBe(false);
    });

    it("should handle horizontal lines", () => {
      expect(renderer.validate.line(0, 0, 79, 0)).toBe(true);
      expect(renderer.validate.line(0, 0, 80, 0)).toBe(false);
    });

    it("should handle vertical lines", () => {
      expect(renderer.validate.line(0, 0, 0, 23)).toBe(true);
      expect(renderer.validate.line(0, 0, 0, 24)).toBe(false);
    });

    it("should handle diagonal lines", () => {
      expect(renderer.validate.line(0, 0, 79, 23)).toBe(true);
      expect(renderer.validate.line(0, 0, 80, 24)).toBe(false);
    });
  });

  describe("integration with rendering", () => {
    it("should allow conditional rendering based on validation", () => {
      const x = 75;
      const y = 10;
      const text = "This is a long text";

      if (renderer.validate.text(x, y, text)) {
        renderer.drawText(x, y, text);
      } else {
        renderer.drawText(x, y, text.substring(0, 5)); // Truncate
      }

      renderer.render();
      // Should have rendered the truncated version
      expect(target.cells.size).toBeGreaterThan(0);
    });

    it("should work with safe mode enabled", () => {
      renderer.setSafeMode(true);

      const x = 100;
      const y = 100;

      if (renderer.validate.cell(x, y)) {
        renderer.setChar(x, y, "@");
      } else {
        // Safe to skip drawing
      }

      // Should not throw because we validated first
      renderer.render();
    });

    it("should allow pre-flight checks for complex operations", () => {
      const boxes = [
        { x: 0, y: 0, w: 10, h: 5 },
        { x: 70, y: 19, w: 15, h: 10 }, // Won't fit
        { x: 20, y: 10, w: 20, h: 8 },
      ];

      let drawnCount = 0;

      for (const box of boxes) {
        if (renderer.validate.box(box.x, box.y, box.w, box.h)) {
          renderer.box(box.x, box.y, box.w, box.h);
          drawnCount++;
        }
      }

      renderer.render();
      expect(drawnCount).toBe(2); // Only 2 boxes fit
    });
  });

  describe("edge cases", () => {
    it("should handle zero-width boxes", () => {
      expect(renderer.validate.box(0, 0, 0, 10)).toBe(false);
    });

    it("should handle zero-height boxes", () => {
      expect(renderer.validate.box(0, 0, 10, 0)).toBe(false);
    });

    it("should handle maximum valid positions", () => {
      expect(renderer.validate.cell(79, 23)).toBe(true);
      expect(renderer.validate.box(79, 23, 1, 1)).toBe(true);
      expect(renderer.validate.text(79, 23, "A")).toBe(true);
      expect(renderer.validate.line(79, 23, 79, 23)).toBe(true);
    });

    it("should handle one-off maximum positions", () => {
      expect(renderer.validate.cell(80, 24)).toBe(false);
      expect(renderer.validate.box(80, 24, 1, 1)).toBe(false);
      expect(renderer.validate.text(80, 24, "A")).toBe(false);
      expect(renderer.validate.line(80, 24, 80, 24)).toBe(false);
    });
  });
});
