import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("Renderer", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("constructor", () => {
    it("should initialize with target dimensions", () => {
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });

    it("should accept custom default colors", () => {
      const customRenderer = new Renderer(target, {
        defaultFg: "yellow",
        defaultBg: "blue",
      });

      customRenderer.setChar(0, 0, "X");
      customRenderer.render();

      const cell = target.getCell(0, 0);
      expect(cell?.fg).toBe("yellow");
      expect(cell?.bg).toBe("blue");
    });
  });

  describe("setChar", () => {
    it("should set a character at the specified position", () => {
      renderer.setChar(10, 5, "X");
      renderer.render();

      const cell = target.getCell(10, 5);
      expect(cell?.char).toBe("X");
    });

    it("should set a character with custom colors", () => {
      renderer.setChar(10, 5, "X", "red", "blue");
      renderer.render();

      const cell = target.getCell(10, 5);
      expect(cell?.char).toBe("X");
      expect(cell?.fg).toBe("red");
      expect(cell?.bg).toBe("blue");
    });

    it("should return this for chaining", () => {
      const result = renderer.setChar(0, 0, "X");
      expect(result).toBe(renderer);
    });

    it("should clip out-of-bounds in clip mode", () => {
      renderer.setClipMode(true);
      renderer.setChar(-1, -1, "X");
      renderer.setChar(100, 100, "Y");
      renderer.render();

      expect(target.cells.size).toBe(0);
    });

    it("should throw out-of-bounds in safe mode", () => {
      renderer.setSafeMode(true);

      expect(() => renderer.setChar(-1, 0, "X")).toThrow();
      expect(() => renderer.setChar(0, -1, "X")).toThrow();
      expect(() => renderer.setChar(80, 0, "X")).toThrow();
      expect(() => renderer.setChar(0, 24, "X")).toThrow();
    });
  });

  describe("drawText", () => {
    it("should draw a string horizontally", () => {
      renderer.drawText(0, 0, "Hello");
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("H");
      expect(target.getCell(1, 0)?.char).toBe("e");
      expect(target.getCell(2, 0)?.char).toBe("l");
      expect(target.getCell(3, 0)?.char).toBe("l");
      expect(target.getCell(4, 0)?.char).toBe("o");
    });

    it("should draw text with colors", () => {
      renderer.drawText(0, 0, "Hi", { fg: "yellow", bg: "black" });
      renderer.render();

      const cell = target.getCell(0, 0);
      expect(cell?.fg).toBe("yellow");
      expect(cell?.bg).toBe("black");
    });

    it("should return this for chaining", () => {
      const result = renderer.drawText(0, 0, "Test");
      expect(result).toBe(renderer);
    });

    it("should clip text that goes out of bounds", () => {
      renderer.setClipMode(true);
      renderer.drawText(78, 0, "Hello");
      renderer.render();

      expect(target.getCell(78, 0)?.char).toBe("H");
      expect(target.getCell(79, 0)?.char).toBe("e");
      expect(target.getCell(80, 0)).toBeUndefined();
    });

    it("should handle empty strings", () => {
      renderer.drawText(0, 0, "");
      renderer.render();

      expect(target.cells.size).toBe(0);
    });
  });

  describe("fill", () => {
    it("should fill a rectangle with a character", () => {
      renderer.fill(5, 5, 3, 2, "#");
      renderer.render();

      expect(target.getCell(5, 5)?.char).toBe("#");
      expect(target.getCell(6, 5)?.char).toBe("#");
      expect(target.getCell(7, 5)?.char).toBe("#");
      expect(target.getCell(5, 6)?.char).toBe("#");
      expect(target.getCell(6, 6)?.char).toBe("#");
      expect(target.getCell(7, 6)?.char).toBe("#");
    });

    it("should fill with colors", () => {
      renderer.fill(0, 0, 2, 2, " ", "white", "blue");
      renderer.render();

      const cell = target.getCell(0, 0);
      expect(cell?.fg).toBe("white");
      expect(cell?.bg).toBe("blue");
    });

    it("should return this for chaining", () => {
      const result = renderer.fill(0, 0, 5, 5, " ");
      expect(result).toBe(renderer);
    });

    it("should clip fills that go out of bounds", () => {
      renderer.setClipMode(true);
      renderer.fill(78, 22, 5, 5, "#");
      renderer.render();

      expect(target.getCell(78, 22)?.char).toBe("#");
      expect(target.getCell(79, 23)?.char).toBe("#");
      expect(target.getCell(80, 22)).toBeUndefined();
      expect(target.getCell(78, 24)).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("should clear the buffer", () => {
      renderer.setChar(10, 10, "X");
      renderer.clear();
      renderer.render();

      expect(target.cells.size).toBe(0);
    });

    it("should return this for chaining", () => {
      const result = renderer.clear();
      expect(result).toBe(renderer);
    });
  });

  describe("render", () => {
    it("should flush to the target", () => {
      renderer.render();
      expect(target.flushCalled).toBe(true);
    });

    it("should return this for chaining", () => {
      const result = renderer.render();
      expect(result).toBe(renderer);
    });

    it("should only render cells that were set", () => {
      renderer.setChar(0, 0, "A");
      renderer.setChar(10, 10, "B");
      renderer.render();

      expect(target.cells.size).toBe(2);
    });
  });

  describe("chaining", () => {
    it("should allow method chaining", () => {
      renderer
        .clear()
        .setChar(0, 0, "A")
        .drawText(5, 5, "Hello")
        .fill(10, 10, 5, 5, "#")
        .render();

      expect(target.getCell(0, 0)?.char).toBe("A");
      expect(target.getCell(5, 5)?.char).toBe("H");
      expect(target.getCell(10, 10)?.char).toBe("#");
    });
  });

  describe("mode settings", () => {
    it("should enable safe mode", () => {
      renderer.setSafeMode(true);
      expect(() => renderer.setChar(-1, 0, "X")).toThrow();
    });

    it("should disable safe mode", () => {
      renderer.setSafeMode(false);
      expect(() => renderer.setChar(-1, 0, "X")).not.toThrow();
    });

    it("should enable clip mode", () => {
      renderer.setClipMode(true);
      renderer.setChar(-1, 0, "X");
      renderer.render();

      expect(target.cells.size).toBe(0);
    });

    it("should return this for chaining", () => {
      expect(renderer.setSafeMode(true)).toBe(renderer);
      expect(renderer.setClipMode(true)).toBe(renderer);
    });
  });
});
