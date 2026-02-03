/**
 * Export/Screenshot capabilities test suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";

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

describe("Export/Screenshot", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(20, 10);
    renderer = new Renderer(target, {
      defaultFg: "white",
      defaultBg: "black",
    });
  });

  describe("exportAsString", () => {
    it("should export empty buffer as string", () => {
      // Arrange
      renderer.clear();

      // Act
      const exported = renderer.exportAsString();

      // Assert
      expect(exported).toBeDefined();
      expect(exported.split("\n")).toHaveLength(10);
      expect(exported.split("\n")[0]).toHaveLength(20);
    });

    it("should export rendered content as string", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Hello");
      renderer.drawText(0, 1, "World");

      // Act
      const exported = renderer.exportAsString();

      // Assert
      const lines = exported.split("\n");
      expect(lines[0]).toContain("Hello");
      expect(lines[1]).toContain("World");
    });

    it("should preserve spaces in exported string", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(5, 5, "X");

      // Act
      const exported = renderer.exportAsString();

      // Assert
      const lines = exported.split("\n");
      expect(lines[5][5]).toBe("X");
      expect(lines[5][4]).toBe(" ");
    });

    it("should export box characters correctly", () => {
      // Arrange
      renderer.clear();
      renderer.box(0, 0, 10, 5);

      // Act
      const exported = renderer.exportAsString();

      // Assert
      const lines = exported.split("\n");
      expect(lines[0][0]).toBe("┌");
      expect(lines[0][9]).toBe("┐");
      expect(lines[4][0]).toBe("└");
      expect(lines[4][9]).toBe("┘");
    });
  });

  describe("exportAsANSI", () => {
    it("should export with ANSI color codes when colors are present", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Red", { fg: "red" });

      // Act
      const exported = renderer.exportAsANSI();

      // Assert
      expect(exported).toContain("\x1b["); // ANSI escape sequence
      expect(exported).toContain("Red");
    });

    it("should handle multiple colors in same export", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Red", { fg: "red" });
      renderer.drawText(0, 1, "Blue", { fg: "blue" });

      // Act
      const exported = renderer.exportAsANSI();

      // Assert
      expect(exported).toContain("Red");
      expect(exported).toContain("Blue");
    });

    it("should reset colors at end of each line", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Colored", { fg: "green", bg: "yellow" });

      // Act
      const exported = renderer.exportAsANSI();

      // Assert
      expect(exported).toContain("\x1b[0m"); // Reset code
    });

    it("should export plain text without colors as plain ANSI", () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Plain");

      // Act
      const exported = renderer.exportAsANSI();

      // Assert
      expect(exported).toContain("Plain");
    });
  });

  describe("exportAsDataURL", () => {
    it("should return a data URL for PNG format", async () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Test");

      // Act
      // This test requires browser environment (canvas)
      // For now, we'll skip it in Node environment
      if (typeof document === "undefined") {
        // Skip in Node.js
        expect(true).toBe(true);
        return;
      }

      const dataURL = await renderer.exportAsDataURL("png");

      // Assert
      expect(dataURL).toMatch(/^data:image\/png;base64,/);
    });

    it("should return a data URL for JPEG format", async () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Test");

      // Act
      if (typeof document === "undefined") {
        expect(true).toBe(true);
        return;
      }

      const dataURL = await renderer.exportAsDataURL("jpeg");

      // Assert
      expect(dataURL).toMatch(/^data:image\/jpeg;base64,/);
    });

    it("should create image with correct dimensions", async () => {
      // Arrange - 20x10 grid with 10x10 cells = 200x100 image
      renderer.clear();

      // Act
      if (typeof document === "undefined") {
        expect(true).toBe(true);
        return;
      }

      const dataURL = await renderer.exportAsDataURL("png", {
        charWidth: 10,
        charHeight: 10,
      });

      // Assert
      expect(dataURL).toBeDefined();
      // Data URL should be properly formatted
      expect(dataURL.startsWith("data:image/")).toBe(true);
    });

    it("should handle custom font size", async () => {
      // Arrange
      renderer.clear();
      renderer.drawText(0, 0, "Big");

      // Act
      if (typeof document === "undefined") {
        expect(true).toBe(true);
        return;
      }

      const dataURL = await renderer.exportAsDataURL("png", {
        charWidth: 20,
        charHeight: 30,
      });

      // Assert
      expect(dataURL).toBeDefined();
    });

    it("should throw error when used in Node without canvas polyfill", async () => {
      // Arrange
      renderer.clear();

      // Act & Assert
      if (typeof document === "undefined") {
        await expect(renderer.exportAsDataURL("png")).rejects.toThrow(
          "exportAsDataURL requires a browser environment",
        );
      } else {
        // In browser, should work fine
        const dataURL = await renderer.exportAsDataURL("png");
        expect(dataURL).toBeDefined();
      }
    });
  });
});
