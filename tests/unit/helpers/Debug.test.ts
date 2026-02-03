/**
 * Debug helpers test suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";
import * as Debug from "../../../src/helpers/debugHelpers";

// Mock render target for testing
class MockRenderTarget implements RenderTarget {
  width: number;
  height: number;
  cells: Map<string, { char: string; fg: any; bg: any }> = new Map();
  clearCalled = false;
  flushCalled = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setCell(x: number, y: number, char: string, fg: any, bg: any): void {
    this.cells.set(`${x},${y}`, { char, fg, bg });
  }

  clear(): void {
    this.cells.clear();
    this.clearCalled = true;
  }

  flush(): void {
    this.flushCalled = true;
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }
}

describe("Debug Helpers", () => {
  let mockTarget: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    mockTarget = new MockRenderTarget(80, 24);
    renderer = new Renderer(mockTarget, {
      defaultFg: "white",
      defaultBg: "black",
    });
  });

  describe("showGrid", () => {
    it("should draw a grid overlay with default spacing", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showGrid({});
      renderer.render();

      // Assert - grid lines should be drawn every 10 cells
      expect(mockTarget.getCell(10, 0)?.char).toBe("┼");
      expect(mockTarget.getCell(20, 0)?.char).toBe("┼");
      expect(mockTarget.getCell(0, 10)?.char).toBe("┼");
    });

    it("should draw grid with custom spacing", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showGrid({ spacing: 5 });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(5, 0)?.char).toBe("┼");
      expect(mockTarget.getCell(10, 0)?.char).toBe("┼");
    });

    it("should use custom color for grid", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showGrid({ fg: "red" });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(10, 0)?.fg).toBe("red");
    });
  });

  describe("showBounds", () => {
    it("should draw a bounding box", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showBounds(10, 5, 20, 10, {});
      renderer.render();

      // Assert - corners should have box characters
      expect(mockTarget.getCell(10, 5)?.char).toBe("┌");
      expect(mockTarget.getCell(29, 5)?.char).toBe("┐");
      expect(mockTarget.getCell(10, 14)?.char).toBe("└");
      expect(mockTarget.getCell(29, 14)?.char).toBe("┘");
    });

    it("should draw bounds with custom label", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showBounds(10, 5, 20, 10, { label: "Entity" });
      renderer.render();

      // Assert - label should appear at the top
      expect(mockTarget.getCell(11, 5)?.char).toBe("E");
      expect(mockTarget.getCell(12, 5)?.char).toBe("n");
    });

    it("should use custom color", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showBounds(10, 5, 20, 10, { fg: "yellow" });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(10, 5)?.fg).toBe("yellow");
    });
  });

  describe("showFPS", () => {
    it("should display FPS counter", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showFPS(60, {});
      renderer.render();

      // Assert - should display "FPS: 60"
      expect(mockTarget.getCell(0, 0)?.char).toBe("F");
      expect(mockTarget.getCell(1, 0)?.char).toBe("P");
      expect(mockTarget.getCell(2, 0)?.char).toBe("S");
    });

    it("should display FPS at custom position", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showFPS(60, { x: 10, y: 5 });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(10, 5)?.char).toBe("F");
    });

    it("should use custom color", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showFPS(60, { fg: "green" });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(0, 0)?.fg).toBe("green");
    });
  });

  describe("showPointerCoords", () => {
    it("should display pointer coordinates", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showPointerCoords(10, 5, {});
      renderer.render();

      // Assert - should display "X:10 Y:5"
      expect(mockTarget.getCell(0, 0)?.char).toBe("X");
      expect(mockTarget.getCell(1, 0)?.char).toBe(":");
    });

    it("should display coords at custom position", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showPointerCoords(10, 5, { x: 20, y: 10 });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(20, 10)?.char).toBe("X");
    });

    it("should use custom color", () => {
      // Arrange
      renderer.clear();

      // Act
      renderer.debug.showPointerCoords(10, 5, { fg: "cyan" });
      renderer.render();

      // Assert
      expect(mockTarget.getCell(0, 0)?.fg).toBe("cyan");
    });
  });

  describe("logCell", () => {
    it("should return cell information", () => {
      // Arrange
      renderer.setChar(10, 5, "A", "red", "blue");

      // Act
      const cellInfo = renderer.debug.logCell(10, 5);

      // Assert
      expect(cellInfo).toEqual({
        x: 10,
        y: 5,
        char: "A",
        fg: "red",
        bg: "blue",
      });
    });

    it("should return null for out of bounds cell", () => {
      // Act
      const cellInfo = renderer.debug.logCell(999, 999);

      // Assert
      expect(cellInfo).toBeNull();
    });

    it("should return empty cell info for unset cell", () => {
      // Arrange
      renderer.clear();

      // Act
      const cellInfo = renderer.debug.logCell(10, 5);

      // Assert
      expect(cellInfo).toEqual({
        x: 10,
        y: 5,
        char: " ",
        fg: null,
        bg: null,
      });
    });
  });
});
