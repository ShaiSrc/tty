/**
 * Tests for box alignment functionality
 */

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

describe("Box Alignment", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target, { width: 80, height: 24 });
  });

  describe("alignBox", () => {
    it("should center box in viewport", () => {
      const pos = renderer.alignBox("center", 20, 10);

      expect(pos.x).toBe(30); // (80 - 20) / 2 = 30
      expect(pos.y).toBe(7); // (24 - 10) / 2 = 7
    });

    it("should align box to top", () => {
      const pos = renderer.alignBox("top", 20, 10);

      expect(pos.x).toBe(30); // Centered horizontally
      expect(pos.y).toBe(0); // Top edge
    });

    it("should align box to bottom", () => {
      const pos = renderer.alignBox("bottom", 20, 10);

      expect(pos.x).toBe(30); // Centered horizontally
      expect(pos.y).toBe(14); // 24 - 10 = 14
    });

    it("should align box to left", () => {
      const pos = renderer.alignBox("left", 20, 10);

      expect(pos.x).toBe(0); // Left edge
      expect(pos.y).toBe(7); // Centered vertically
    });

    it("should align box to right", () => {
      const pos = renderer.alignBox("right", 20, 10);

      expect(pos.x).toBe(60); // 80 - 20 = 60
      expect(pos.y).toBe(7); // Centered vertically
    });

    it("should align box to top-left", () => {
      const pos = renderer.alignBox("top-left", 20, 10);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it("should align box to top-right", () => {
      const pos = renderer.alignBox("top-right", 20, 10);

      expect(pos.x).toBe(60); // 80 - 20
      expect(pos.y).toBe(0);
    });

    it("should align box to bottom-left", () => {
      const pos = renderer.alignBox("bottom-left", 20, 10);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(14); // 24 - 10
    });

    it("should align box to bottom-right", () => {
      const pos = renderer.alignBox("bottom-right", 20, 10);

      expect(pos.x).toBe(60); // 80 - 20
      expect(pos.y).toBe(14); // 24 - 10
    });
  });

  describe("alignBox with offsets", () => {
    it("should apply positive X offset", () => {
      const pos = renderer.alignBox("center", 20, 10, 5, 0);

      expect(pos.x).toBe(35); // 30 + 5
      expect(pos.y).toBe(7);
    });

    it("should apply negative X offset", () => {
      const pos = renderer.alignBox("center", 20, 10, -5, 0);

      expect(pos.x).toBe(25); // 30 - 5
      expect(pos.y).toBe(7);
    });

    it("should apply positive Y offset", () => {
      const pos = renderer.alignBox("center", 20, 10, 0, 3);

      expect(pos.x).toBe(30);
      expect(pos.y).toBe(10); // 7 + 3
    });

    it("should apply negative Y offset", () => {
      const pos = renderer.alignBox("center", 20, 10, 0, -3);

      expect(pos.x).toBe(30);
      expect(pos.y).toBe(4); // 7 - 3
    });

    it("should apply both offsets", () => {
      const pos = renderer.alignBox("top-right", 20, 10, -2, 1);

      expect(pos.x).toBe(58); // 60 - 2
      expect(pos.y).toBe(1); // 0 + 1
    });
  });

  describe("centerBox", () => {
    it("should draw centered box", () => {
      renderer.centerBox(20, 10, { style: "single" });

      // Check box is at centered position
      const topLeft = renderer.getCell(30, 7);
      expect(topLeft?.char).toBe("┌");

      const topRight = renderer.getCell(49, 7);
      expect(topRight?.char).toBe("┐");

      const bottomLeft = renderer.getCell(30, 16);
      expect(bottomLeft?.char).toBe("└");

      const bottomRight = renderer.getCell(49, 16);
      expect(bottomRight?.char).toBe("┘");
    });

    it("should return renderer instance for chaining", () => {
      const result = renderer.centerBox(20, 10);
      expect(result).toBe(renderer);
    });

    it("should apply box options", () => {
      renderer.centerBox(20, 10, { style: "double", fg: "cyan" });

      const topLeft = renderer.getCell(30, 7);
      expect(topLeft?.char).toBe("╔"); // Double border
      expect(topLeft?.fg).toBe("cyan");
    });

    it("should support offsets", () => {
      renderer.centerBox(20, 10, {}, 5, -2);

      // Check box is at offset position (35, 5)
      const topLeft = renderer.getCell(35, 5);
      expect(topLeft?.char).toBe("┌");
    });

    it("should work with fill option", () => {
      renderer.centerBox(10, 5, { fill: true });

      // Check interior is filled
      const interior = renderer.getCell(36, 10); // Center of 35-44, 10-14
      expect(interior?.char).toBe(" ");
    });
  });

  describe("integration scenarios", () => {
    it("should chain multiple aligned boxes", () => {
      renderer
        .centerBox(30, 10, { style: "double" })
        .alignBox("top-right", 15, 5, -2, 1);

      const centerBox = renderer.getCell(25, 7);
      expect(centerBox?.char).toBe("╔");

      // alignBox only returns position, need to manually draw
      const pos = renderer.alignBox("top-right", 15, 5, -2, 1);
      renderer.box(pos.x, pos.y, 15, 5);

      const topRightBox = renderer.getCell(63, 1);
      expect(topRightBox?.char).toBe("┌");
    });

    it("should work with different viewport sizes", () => {
      const smallTarget = new MockRenderTarget(40, 12);
      const smallRenderer = new Renderer(smallTarget, {
        width: 40,
        height: 12,
      });

      const pos = smallRenderer.alignBox("center", 10, 4);
      expect(pos.x).toBe(15); // (40 - 10) / 2
      expect(pos.y).toBe(4); // (12 - 4) / 2
    });

    it("should handle edge case with box size equal to viewport", () => {
      const pos = renderer.alignBox("center", 80, 24);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it("should handle edge case with box larger than viewport", () => {
      const pos = renderer.alignBox("center", 100, 30);

      expect(pos.x).toBe(-10); // (80 - 100) / 2
      expect(pos.y).toBe(-3); // (24 - 30) / 2
    });

    it("should position dialog at center with padding", () => {
      const dialogWidth = 40;
      const dialogHeight = 12;

      renderer.centerBox(dialogWidth, dialogHeight, {
        style: "double",
        fill: true,
      });

      // Dialog should be at (20, 6)
      const topLeft = renderer.getCell(20, 6);
      expect(topLeft?.char).toBe("╔");
    });

    it("should position notification at top-right with margin", () => {
      const pos = renderer.alignBox("top-right", 20, 5, -2, 1);
      renderer.box(pos.x, pos.y, 20, 5);

      // Box at (58, 1) with 2-char margin from right, 1-char from top
      const topLeft = renderer.getCell(58, 1);
      expect(topLeft?.char).toBe("┌");
    });
  });

  describe("edge cases", () => {
    it("should handle minimal box size (1x1)", () => {
      const pos = renderer.alignBox("center", 1, 1);

      expect(pos.x).toBe(39); // (80 - 1) / 2
      expect(pos.y).toBe(11); // (24 - 1) / 2
    });

    it("should handle odd and even viewport/box combinations", () => {
      // Even viewport (80x24), odd box (21x11)
      const pos1 = renderer.alignBox("center", 21, 11);
      expect(pos1.x).toBe(29); // (80 - 21) / 2 = 29.5 -> 29
      expect(pos1.y).toBe(6); // (24 - 11) / 2 = 6.5 -> 6

      // Create odd viewport
      const oddTarget = new MockRenderTarget(81, 25);
      const oddRenderer = new Renderer(oddTarget, { width: 81, height: 25 });

      // Odd viewport (81x25), even box (20x10)
      const pos2 = oddRenderer.alignBox("center", 20, 10);
      expect(pos2.x).toBe(30); // (81 - 20) / 2 = 30.5 -> 30
      expect(pos2.y).toBe(7); // (25 - 10) / 2 = 7.5 -> 7
    });

    it("should handle large offsets", () => {
      const pos = renderer.alignBox("center", 10, 10, 100, 50);

      expect(pos.x).toBe(135); // 35 + 100
      expect(pos.y).toBe(57); // 7 + 50
    });
  });
});
