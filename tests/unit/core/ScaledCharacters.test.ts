import { describe, it, expect, beforeEach, vi } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { Cell, RenderTarget, Color } from "../../../src/types/types";

// Mock render target with setCellScaled support
class MockRenderTarget implements RenderTarget {
  width: number;
  height: number;
  cells: Map<string, { char: string; fg: Color; bg: Color }> = new Map();
  scaledCells: Map<
    string,
    { scale: number; char: string; fg: Color; bg: Color }
  > = new Map();
  clearCalled = false;
  flushCalled = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setCell(x: number, y: number, char: string, fg: Color, bg: Color): void {
    this.cells.set(`${x},${y}`, { char, fg, bg });
  }

  setCellScaled(
    x: number,
    y: number,
    scale: number,
    char: string,
    fg: Color,
    bg: Color,
  ): void {
    this.scaledCells.set(`${x},${y}`, { scale, char, fg, bg });
  }

  clear(): void {
    this.cells.clear();
    this.scaledCells.clear();
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

  getScaledCell(x: number, y: number) {
    return this.scaledCells.get(`${x},${y}`);
  }
}

describe("Scaled Characters", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("setCharScaled", () => {
    it("should create a 2×2 scaled character", () => {
      renderer.setCharScaled(10, 10, 2, "█", "red", "blue");
      renderer.render();

      // Check that scaled cell was rendered
      const scaled = target.getScaledCell(10, 10);
      expect(scaled).toBeDefined();
      expect(scaled?.scale).toBe(2);
      expect(scaled?.char).toBe("█");
      expect(scaled?.fg).toBe("red");
      expect(scaled?.bg).toBe("blue");
    });

    it("should create a 3×3 scaled character", () => {
      renderer.setCharScaled(5, 5, 3, "@", "yellow");
      renderer.render();

      const scaled = target.getScaledCell(5, 5);
      expect(scaled).toBeDefined();
      expect(scaled?.scale).toBe(3);
      expect(scaled?.char).toBe("@");
      expect(scaled?.fg).toBe("yellow");
    });

    it("should create marker cells for occupied positions", () => {
      renderer.setCharScaled(10, 10, 2, "X");

      // Check buffer directly (before render)
      const buffer = renderer.getCell(10, 10);
      expect(buffer?.unified).toBeDefined();
      expect(buffer?.unified).toEqual({ scale: 2, isOrigin: true });

      // Check merged markers
      const marker1 = renderer.getCell(11, 10);
      const marker2 = renderer.getCell(10, 11);
      const marker3 = renderer.getCell(11, 11);

      expect(marker1?.unified).toEqual({ mergedInto: "10,10" });
      expect(marker2?.unified).toEqual({ mergedInto: "10,10" });
      expect(marker3?.unified).toEqual({ mergedInto: "10,10" });
    });

    it("should create marker cells for 3×3", () => {
      renderer.setCharScaled(5, 5, 3, "O");

      // Check all 9 cells (1 origin + 8 markers)
      const origin = renderer.getCell(5, 5);
      expect(origin?.unified).toEqual({ scale: 3, isOrigin: true });

      // Check all markers
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          if (dx === 0 && dy === 0) continue; // Skip origin
          const marker = renderer.getCell(5 + dx, 5 + dy);
          expect(marker?.unified).toEqual({ mergedInto: "5,5" });
        }
      }
    });

    it("should return renderer for chaining", () => {
      const result = renderer.setCharScaled(0, 0, 2, "X");
      expect(result).toBe(renderer);
    });

    it("should apply default colors", () => {
      const customRenderer = new Renderer(target, {
        defaultFg: "cyan",
        defaultBg: "black",
      });

      customRenderer.setCharScaled(0, 0, 2, "A");
      customRenderer.render();

      const scaled = target.getScaledCell(0, 0);
      expect(scaled?.fg).toBe("cyan");
      expect(scaled?.bg).toBe("black");
    });

    it("should warn when overwriting existing unified cell", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      renderer.setCharScaled(10, 10, 2, "A");
      renderer.setCharScaled(10, 10, 2, "B"); // Overwrite

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Overwriting unified cell"),
      );

      warnSpy.mockRestore();
    });

    it("should warn when overwriting part of unified cell", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      renderer.setCharScaled(10, 10, 3, "A");
      renderer.setCharScaled(11, 11, 2, "B"); // Overlaps corner

      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it("should clear and replace when overwriting", () => {
      renderer.setCharScaled(10, 10, 2, "A", "red");
      renderer.setCharScaled(10, 10, 3, "B", "blue"); // Replace with larger

      const origin = renderer.getCell(10, 10);
      expect(origin?.char).toBe("B");
      expect(origin?.fg).toBe("blue");
      expect(origin?.unified).toEqual({ scale: 3, isOrigin: true });
    });
  });

  describe("scale validation", () => {
    it("should throw error for invalid scale in safe mode", () => {
      renderer.setSafeMode(true);

      expect(() => renderer.setCharScaled(0, 0, 0, "X")).toThrow(
        "Invalid scale",
      );
      expect(() => renderer.setCharScaled(0, 0, -1, "X")).toThrow(
        "Invalid scale",
      );
      expect(() => renderer.setCharScaled(0, 0, 6, "X")).toThrow(
        "Invalid scale",
      );
      expect(() => renderer.setCharScaled(0, 0, 1.5, "X")).toThrow(
        "Invalid scale",
      );
    });

    it("should silently ignore invalid scale without safe mode", () => {
      renderer.setCharScaled(0, 0, 0, "X");
      renderer.setCharScaled(0, 0, 10, "Y");
      renderer.render();

      expect(target.scaledCells.size).toBe(0);
    });

    it("should accept scale 1 to 5", () => {
      renderer.setSafeMode(true);

      expect(() => renderer.setCharScaled(0, 0, 1, "A")).not.toThrow();
      expect(() => renderer.setCharScaled(10, 0, 2, "B")).not.toThrow();
      expect(() => renderer.setCharScaled(20, 0, 3, "C")).not.toThrow();
      expect(() => renderer.setCharScaled(30, 0, 4, "D")).not.toThrow();
      expect(() => renderer.setCharScaled(40, 0, 5, "E")).not.toThrow();
    });
  });

  describe("bounds checking", () => {
    it("should throw error when scaled char extends beyond bounds in safe mode", () => {
      renderer.setSafeMode(true);

      // 2×2 at (79, 0) would extend to (80, 1) - out of bounds
      expect(() => renderer.setCharScaled(79, 0, 2, "X")).toThrow(
        "extends beyond grid bounds",
      );

      // 3×3 at (78, 22) would extend to (80, 24) - out of bounds
      expect(() => renderer.setCharScaled(78, 22, 3, "Y")).toThrow(
        "extends beyond grid bounds",
      );
    });

    it("should clip when origin is out of bounds without safe mode", () => {
      renderer.setCharScaled(-1, -1, 2, "X");
      renderer.setCharScaled(100, 100, 2, "Y");
      renderer.render();

      expect(target.scaledCells.size).toBe(0);
    });

    it("should allow scaled char that fits exactly at edge", () => {
      renderer.setSafeMode(true);

      // 2×2 at (78, 22) fits exactly in 80×24 grid
      expect(() => renderer.setCharScaled(78, 22, 2, "X")).not.toThrow();

      // 5×5 at (75, 19) fits exactly
      expect(() => renderer.setCharScaled(75, 19, 5, "Y")).not.toThrow();
    });
  });

  describe("rendering with layers", () => {
    it("should render scaled chars on different layers", () => {
      renderer.layer("bg").setCharScaled(10, 10, 3, "█", "blue");
      renderer.layer("fg").setCharScaled(15, 15, 2, "@", "yellow");
      renderer.render();

      const bg = target.getScaledCell(10, 10);
      const fg = target.getScaledCell(15, 15);

      expect(bg?.char).toBe("█");
      expect(bg?.fg).toBe("blue");
      expect(fg?.char).toBe("@");
      expect(fg?.fg).toBe("yellow");
    });

    it("should allow higher layer to partially overwrite scaled char", () => {
      renderer.layer("bg").setCharScaled(10, 10, 3, "█", "blue");
      renderer.layer("fg").setChar(11, 11, "@", "yellow");
      renderer.render();

      // Background scaled cell should be rendered
      const bg = target.getScaledCell(10, 10);
      expect(bg).toBeDefined();
      expect(bg?.char).toBe("█");

      // When layers composite, the foreground "@" at (11,11) overwrites
      // the merged marker from the background layer.
      // This is expected behavior - higher layers win per-cell
    });
  });

  describe("camera transforms", () => {
    it("should apply camera offset to scaled characters", () => {
      renderer.setCamera(5, 5);
      renderer.setCharScaled(10, 10, 2, "X");
      renderer.render();

      // World coords (10, 10) - camera (5, 5) = screen coords (5, 5)
      const scaled = target.getScaledCell(5, 5);
      expect(scaled).toBeDefined();
      expect(scaled?.char).toBe("X");
    });

    it("should handle scaled chars partially off-screen with camera", () => {
      renderer.setCamera(78, 22);
      renderer.setCharScaled(79, 23, 3, "O"); // Partially visible

      renderer.setSafeMode(true);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe("merged marker cells in render", () => {
    it("should skip rendering merged marker cells", () => {
      renderer.setCharScaled(10, 10, 2, "X");
      renderer.render();

      // Only the scaled cell should be rendered, not the markers
      expect(target.scaledCells.size).toBe(1);

      // Regular cells should not include the markers
      expect(target.getCell(11, 10)).toBeUndefined();
      expect(target.getCell(10, 11)).toBeUndefined();
      expect(target.getCell(11, 11)).toBeUndefined();
    });

    it("should render origin and skip all markers for 5×5", () => {
      renderer.setCharScaled(5, 5, 5, "O");
      renderer.render();

      // Only one scaled cell rendered
      expect(target.scaledCells.size).toBe(1);
      const scaled = target.getScaledCell(5, 5);
      expect(scaled?.scale).toBe(5);
    });
  });

  describe("fallback rendering", () => {
    it("should render at origin if setCellScaled not available", () => {
      // Create target without setCellScaled
      class BasicTarget implements RenderTarget {
        width = 80;
        height = 24;
        cells = new Map<string, any>();

        setCell(x: number, y: number, char: string, fg: Color, bg: Color) {
          this.cells.set(`${x},${y}`, { char, fg, bg });
        }
        clear() {
          this.cells.clear();
        }
        flush() {}
        getSize() {
          return { width: 80, height: 24 };
        }
      }

      const basicTarget = new BasicTarget();
      const basicRenderer = new Renderer(basicTarget);

      basicRenderer.setCharScaled(10, 10, 3, "X", "red");
      basicRenderer.render();

      // Should render at origin with normal setCell
      const cell = basicTarget.cells.get("10,10");
      expect(cell).toBeDefined();
      expect(cell?.char).toBe("X");
    });
  });

  describe("integration with other methods", () => {
    it("should work with drawText after scaled char", () => {
      renderer.setCharScaled(5, 5, 2, "►");
      renderer.drawText(8, 5, "Start Game", { fg: "white" });
      renderer.render();

      const scaled = target.getScaledCell(5, 5);
      expect(scaled).toBeDefined();

      const text = target.getCell(8, 5);
      expect(text?.char).toBe("S");
    });

    it("should work with fill after scaled char", () => {
      renderer.fill(0, 0, 20, 10, "·", "gray");
      renderer.setCharScaled(10, 5, 3, "@", "yellow");
      renderer.render();

      const scaled = target.getScaledCell(10, 5);
      expect(scaled).toBeDefined();
      expect(scaled?.char).toBe("@");
    });

    it("should clear scaled chars with clear", () => {
      renderer.setCharScaled(10, 10, 2, "X");
      renderer.clear();

      const origin = renderer.getCell(10, 10);
      expect(origin).toBeUndefined();
    });
  });
});
