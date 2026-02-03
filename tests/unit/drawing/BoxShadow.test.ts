/**
 * Tests for box shadow drawing functionality
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

  render(): void {
    // No-op for mock
  }
}

describe("Box Shadow Drawing", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(40, 20);
    renderer = new Renderer(target, { width: 40, height: 20 });
  });

  describe("shadow rendering", () => {
    it("should draw shadow on right and bottom edges", () => {
      renderer.box(5, 5, 10, 5, { shadow: true });

      // Check shadow on right edge (x + width)
      expect(renderer.getCell(15, 6).char).toBe("░");
      expect(renderer.getCell(15, 7).char).toBe("░");
      expect(renderer.getCell(15, 8).char).toBe("░");
      expect(renderer.getCell(15, 9).char).toBe("░");

      // Check shadow on bottom edge (y + height)
      expect(renderer.getCell(6, 10).char).toBe("░");
      expect(renderer.getCell(7, 10).char).toBe("░");
      expect(renderer.getCell(8, 10).char).toBe("░");
      expect(renderer.getCell(14, 10).char).toBe("░");
    });

    it("should use gray color for shadow", () => {
      renderer.box(5, 5, 10, 5, { shadow: true });

      // Check shadow foreground color
      expect(renderer.getCell(15, 6).fg).toBe("gray");
      expect(renderer.getCell(6, 10).fg).toBe("gray");
    });

    it("should not draw shadow when shadow option is false", () => {
      renderer.box(5, 5, 10, 5, { shadow: false });

      // Check that shadow positions don't have shadow chars
      const rightShadowCell = renderer.getCell(15, 6);
      const bottomShadowCell = renderer.getCell(6, 10);

      // Either undefined or not shadow character
      if (rightShadowCell) {
        expect(rightShadowCell.char).not.toBe("░");
      }
      if (bottomShadowCell) {
        expect(bottomShadowCell.char).not.toBe("░");
      }
    });

    it("should not draw shadow when shadow option is omitted", () => {
      renderer.box(5, 5, 10, 5);

      // Check that shadow positions don't have shadow chars
      const rightShadowCell = renderer.getCell(15, 6);
      const bottomShadowCell = renderer.getCell(6, 10);

      // Either undefined or not shadow character
      if (rightShadowCell) {
        expect(rightShadowCell.char).not.toBe("░");
      }
      if (bottomShadowCell) {
        expect(bottomShadowCell.char).not.toBe("░");
      }
    });
  });

  describe("shadow with other box options", () => {
    it("should draw shadow with filled box", () => {
      renderer.box(5, 5, 10, 5, { shadow: true, fill: true });

      // Check box is filled
      expect(renderer.getCell(6, 6).char).toBe(" ");

      // Check shadow exists
      expect(renderer.getCell(15, 6).char).toBe("░");
      expect(renderer.getCell(6, 10).char).toBe("░");
    });

    it("should draw shadow with custom border style", () => {
      renderer.box(5, 5, 10, 5, { shadow: true, style: "double" });

      // Check double border
      expect(renderer.getCell(5, 5).char).toBe("╔");

      // Check shadow exists
      expect(renderer.getCell(15, 6).char).toBe("░");
      expect(renderer.getCell(6, 10).char).toBe("░");
    });

    it("should draw shadow with custom colors", () => {
      renderer.box(5, 5, 10, 5, { shadow: true, fg: "red", bg: "blue" });

      // Check box colors
      expect(renderer.getCell(5, 5).fg).toBe("red");
      expect(renderer.getCell(5, 5).bg).toBe("blue");

      // Check shadow uses gray, not box colors
      expect(renderer.getCell(15, 6).fg).toBe("gray");
      expect(renderer.getCell(15, 6).char).toBe("░");
    });

    it("should draw shadow with filled box and custom fill character", () => {
      renderer.box(5, 5, 10, 5, {
        shadow: true,
        fill: true,
        fillChar: "█",
      });

      // Check box is filled with custom char
      expect(renderer.getCell(6, 6).char).toBe("█");

      // Check shadow exists
      expect(renderer.getCell(15, 6).char).toBe("░");
    });
  });

  describe("shadow edge cases", () => {
    it("should draw shadow for minimal box (3x3)", () => {
      renderer.box(5, 5, 3, 3, { shadow: true });

      // Check shadow on right edge
      expect(renderer.getCell(8, 6).char).toBe("░");
      expect(renderer.getCell(8, 7).char).toBe("░");

      // Check shadow on bottom edge
      expect(renderer.getCell(6, 8).char).toBe("░");
      expect(renderer.getCell(7, 8).char).toBe("░");
    });

    it("should draw shadow for tall narrow box", () => {
      renderer.box(10, 2, 3, 10, { shadow: true });

      // Check shadow height matches box
      for (let j = 1; j <= 10; j++) {
        expect(renderer.getCell(13, 2 + j).char).toBe("░");
      }

      // Check shadow width matches box
      for (let i = 1; i <= 3; i++) {
        expect(renderer.getCell(10 + i, 12).char).toBe("░");
      }
    });

    it("should draw shadow for wide short box", () => {
      renderer.box(2, 5, 20, 3, { shadow: true });

      // Check shadow height matches box
      for (let j = 1; j <= 3; j++) {
        expect(renderer.getCell(22, 5 + j).char).toBe("░");
      }

      // Check shadow width matches box
      for (let i = 1; i <= 20; i++) {
        expect(renderer.getCell(2 + i, 8).char).toBe("░");
      }
    });
  });

  describe("chainability", () => {
    it("should return renderer instance for chaining", () => {
      const result = renderer.box(5, 5, 10, 5, { shadow: true });
      expect(result).toBe(renderer);
    });

    it("should chain multiple shadow boxes", () => {
      renderer
        .box(2, 2, 8, 4, { shadow: true })
        .box(15, 10, 8, 4, { shadow: true });

      // Check first box shadow
      expect(renderer.getCell(10, 3).char).toBe("░");
      expect(renderer.getCell(3, 6).char).toBe("░");

      // Check second box shadow
      expect(renderer.getCell(23, 11).char).toBe("░");
      expect(renderer.getCell(16, 14).char).toBe("░");
    });
  });

  describe("shadow validation", () => {
    it("should clip shadow that goes out of bounds", () => {
      // Box at edge where shadow would go out
      renderer.box(35, 15, 5, 5, { shadow: true });

      // Shadow would be at x=40 (out of bounds) and y=20 (out of bounds)
      // In clip mode, these should be clipped silently
      // Just verify box itself renders
      expect(renderer.getCell(35, 15).char).toBe("┌");
    });

    it("should handle shadow with box at canvas edge", () => {
      // Box at very edge
      renderer.box(38, 18, 2, 2, { shadow: true });

      // Box should render
      expect(renderer.getCell(38, 18).char).toBe("┌");

      // Shadow at x=40, y=20 would be out of bounds and clipped
      // No error should be thrown in clip mode
    });
  });
});
