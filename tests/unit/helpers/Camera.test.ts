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

  flush(): void {
    // No-op for testing
  }

  getSize() {
    return { width: this.width, height: this.height };
  }

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }
}

describe("Camera/Viewport System", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(20, 10); // Small viewport
    renderer = new Renderer(target, { width: 20, height: 10 });
  });

  describe("setCamera", () => {
    it("should set camera position", () => {
      const result = renderer.setCamera(10, 5);
      expect(result).toBe(renderer); // Chainable
    });

    it("should allow drawing at world coordinates", () => {
      renderer.setCamera(10, 5);
      renderer.drawText(10, 5, "X"); // World coords (10,5) -> screen (0,0)
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("X");
    });

    it("should translate multiple drawings correctly", () => {
      renderer.setCamera(5, 5);
      renderer.drawText(5, 5, "A");
      renderer.drawText(10, 7, "B");
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("A");
      expect(target.getCell(5, 2)?.char).toBe("B");
    });

    it("should clip content outside viewport", () => {
      renderer.setCamera(0, 0);
      renderer.drawText(25, 5, "X"); // Outside viewport (20x10)
      renderer.render();

      // Should not render anything (outside bounds)
      expect(target.cells.size).toBe(0);
    });

    it("should handle negative camera positions", () => {
      renderer.setCamera(-5, -5);
      renderer.drawText(0, 0, "X"); // World (0,0) -> screen (5,5)
      renderer.render();

      expect(target.getCell(5, 5)?.char).toBe("X");
    });
  });

  describe("resetCamera", () => {
    it("should reset camera to origin", () => {
      renderer.setCamera(10, 5);
      renderer.resetCamera();
      renderer.drawText(0, 0, "X");
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("X");
    });

    it("should return this for chaining", () => {
      const result = renderer.resetCamera();
      expect(result).toBe(renderer);
    });
  });

  describe("getCamera", () => {
    it("should return current camera position", () => {
      renderer.setCamera(15, 8);
      const pos = renderer.getCamera();

      expect(pos.x).toBe(15);
      expect(pos.y).toBe(8);
    });

    it("should return (0,0) by default", () => {
      const pos = renderer.getCamera();

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe("worldToScreen", () => {
    it("should convert world coords to screen coords", () => {
      renderer.setCamera(10, 5);
      const screen = renderer.worldToScreen(15, 8);

      expect(screen.x).toBe(5);
      expect(screen.y).toBe(3);
    });

    it("should handle negative results", () => {
      renderer.setCamera(10, 10);
      const screen = renderer.worldToScreen(5, 5);

      expect(screen.x).toBe(-5);
      expect(screen.y).toBe(-5);
    });
  });

  describe("screenToWorld", () => {
    it("should convert screen coords to world coords", () => {
      renderer.setCamera(10, 5);
      const world = renderer.screenToWorld(5, 3);

      expect(world.x).toBe(15);
      expect(world.y).toBe(8);
    });

    it("should be inverse of worldToScreen", () => {
      renderer.setCamera(20, 15);
      const worldOriginal = { x: 25, y: 18 };
      const screen = renderer.worldToScreen(worldOriginal.x, worldOriginal.y);
      const worldBack = renderer.screenToWorld(screen.x, screen.y);

      expect(worldBack.x).toBe(worldOriginal.x);
      expect(worldBack.y).toBe(worldOriginal.y);
    });
  });

  describe("moveCamera", () => {
    it("should move camera by delta", () => {
      renderer.setCamera(10, 5);
      renderer.moveCamera(3, 2);
      const pos = renderer.getCamera();

      expect(pos.x).toBe(13);
      expect(pos.y).toBe(7);
    });

    it("should handle negative deltas", () => {
      renderer.setCamera(10, 10);
      renderer.moveCamera(-5, -3);
      const pos = renderer.getCamera();

      expect(pos.x).toBe(5);
      expect(pos.y).toBe(7);
    });

    it("should return this for chaining", () => {
      const result = renderer.moveCamera(1, 1);
      expect(result).toBe(renderer);
    });
  });

  describe("camera integration", () => {
    it("should work with box drawing", () => {
      renderer.setCamera(5, 5);
      renderer.box(5, 5, 10, 5); // World coords
      renderer.render();

      // Top-left corner at screen (0,0)
      expect(target.getCell(0, 0)?.char).toBe("┌");
    });

    it("should work with layers", () => {
      renderer.setCamera(10, 10);
      renderer.layer("bg").drawText(10, 10, "BG");
      renderer.layer("fg").drawText(10, 10, "FG");
      renderer.layerOrder(["bg", "fg"]);
      renderer.render();

      // Should render "FG" at screen (0,0) due to layer order
      expect(target.getCell(0, 0)?.char).toBe("F");
      expect(target.getCell(1, 0)?.char).toBe("G");
    });

    it("should allow camera changes between frames", () => {
      renderer.setCamera(0, 0);
      renderer.drawText(5, 5, "A");
      renderer.render();
      expect(target.getCell(5, 5)?.char).toBe("A");

      renderer.clear();
      renderer.setCamera(5, 5);
      renderer.drawText(5, 5, "B");
      renderer.render();
      expect(target.getCell(0, 0)?.char).toBe("B");
    });
  });

  describe("follow", () => {
    it("should center camera on target position", () => {
      renderer.follow(50, 30);
      const pos = renderer.getCamera();

      // Camera should be at (50 - 20/2, 30 - 10/2) = (40, 25)
      expect(pos.x).toBe(40);
      expect(pos.y).toBe(25);
    });

    it("should return this for chaining", () => {
      const result = renderer.follow(10, 10);
      expect(result).toBe(renderer);
    });

    it("should handle small worlds gracefully", () => {
      renderer.follow(5, 3);
      const pos = renderer.getCamera();

      // May result in negative camera position (centered on small area)
      expect(pos.x).toBe(-5); // 5 - 20/2
      expect(pos.y).toBe(-2); // 3 - 10/2
    });
  });
});
