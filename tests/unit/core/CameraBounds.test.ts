/**
 * Tests for camera bounds functionality
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

describe("Camera Bounds", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(40, 20);
    renderer = new Renderer(target, { width: 40, height: 20 });
  });

  describe("setCameraBounds", () => {
    it("should set camera bounds and clamp current position", () => {
      renderer.setCamera(100, 100);
      renderer.setCameraBounds(0, 0, 50, 50);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(50); // Clamped to maxX
      expect(pos.y).toBe(50); // Clamped to maxY
    });

    it("should clamp camera to minX and minY", () => {
      renderer.setCamera(-10, -10);
      renderer.setCameraBounds(0, 0, 100, 100);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(0); // Clamped to minX
      expect(pos.y).toBe(0); // Clamped to minY
    });

    it("should allow camera within bounds", () => {
      renderer.setCameraBounds(0, 0, 100, 100);
      renderer.setCamera(50, 50);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(50);
      expect(pos.y).toBe(50);
    });

    it("should return renderer instance for chaining", () => {
      const result = renderer.setCameraBounds(0, 0, 100, 100);
      expect(result).toBe(renderer);
    });
  });

  describe("clearCameraBounds", () => {
    it("should remove bounds restrictions", () => {
      renderer.setCameraBounds(0, 0, 50, 50);
      renderer.clearCameraBounds();
      renderer.setCamera(100, 100);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(100); // No longer clamped
      expect(pos.y).toBe(100);
    });

    it("should return renderer instance for chaining", () => {
      const result = renderer.clearCameraBounds();
      expect(result).toBe(renderer);
    });
  });

  describe("bounds with camera movement", () => {
    beforeEach(() => {
      renderer.setCameraBounds(0, 0, 100, 50);
    });

    it("should clamp setCamera calls", () => {
      renderer.setCamera(150, 75);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(50);
    });

    it("should clamp moveCamera calls", () => {
      renderer.setCamera(95, 45);
      renderer.moveCamera(10, 10);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(100); // 95 + 10 = 105, clamped to 100
      expect(pos.y).toBe(50); // 45 + 10 = 55, clamped to 50
    });

    it("should clamp negative movement", () => {
      renderer.setCamera(5, 5);
      renderer.moveCamera(-10, -10);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(0); // 5 - 10 = -5, clamped to 0
      expect(pos.y).toBe(0); // 5 - 10 = -5, clamped to 0
    });

    it("should clamp resetCamera", () => {
      renderer.setCameraBounds(10, 10, 100, 100);
      renderer.resetCamera();

      const pos = renderer.getCamera();
      expect(pos.x).toBe(10); // 0 clamped to minX=10
      expect(pos.y).toBe(10); // 0 clamped to minY=10
    });

    it("should clamp follow calls", () => {
      // Follow target at (150, 75) with viewport 40x20
      // Camera would center at (150 - 20, 75 - 10) = (130, 65)
      renderer.follow(150, 75);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(100); // Clamped to maxX
      expect(pos.y).toBe(50); // Clamped to maxY
    });
  });

  describe("bounds edge cases", () => {
    it("should handle zero bounds", () => {
      renderer.setCameraBounds(0, 0, 0, 0);
      renderer.setCamera(10, 10);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it("should handle negative bounds", () => {
      renderer.setCameraBounds(-50, -50, -10, -10);
      renderer.setCamera(-100, -100);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(-50); // Clamped to minX
      expect(pos.y).toBe(-50); // Clamped to minY
    });

    it("should handle mixed positive/negative bounds", () => {
      renderer.setCameraBounds(-20, -20, 20, 20);
      renderer.setCamera(0, 0);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it("should handle large bounds", () => {
      renderer.setCameraBounds(0, 0, 10000, 10000);
      renderer.setCamera(5000, 5000);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(5000);
      expect(pos.y).toBe(5000);
    });
  });

  describe("integration with rendering", () => {
    it("should work with world-to-screen coordinates", () => {
      renderer.setCameraBounds(0, 0, 100, 100);
      renderer.setCamera(10, 10);

      // Draw at world coordinates
      renderer.drawText(15, 15, "Test");

      // Should appear at screen coordinates (5, 5)
      const cell = renderer.getCell(5, 5);
      expect(cell?.char).toBe("T");
    });

    it("should prevent camera from leaving map during follow", () => {
      // Simulate a 100x50 map with 40x20 viewport
      renderer.setCameraBounds(0, 0, 60, 30); // maxX = mapWidth - viewportWidth

      // Follow player near edge
      renderer.follow(95, 45);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(60); // Can't go beyond 60
      expect(pos.y).toBe(30); // Can't go beyond 30
    });

    it("should chain with other renderer methods", () => {
      renderer
        .setCameraBounds(0, 0, 100, 100)
        .setCamera(50, 50)
        .drawText(0, 0, "Hello")
        .clearCameraBounds()
        .resetCamera();

      expect(renderer.getCamera()).toEqual({ x: 0, y: 0 });
    });
  });

  describe("bounds update scenarios", () => {
    it("should re-clamp when bounds are updated", () => {
      renderer.setCamera(75, 75);
      renderer.setCameraBounds(0, 0, 100, 100);

      const pos1 = renderer.getCamera();
      expect(pos1.x).toBe(75);
      expect(pos1.y).toBe(75);

      // Tighten bounds
      renderer.setCameraBounds(0, 0, 50, 50);

      const pos2 = renderer.getCamera();
      expect(pos2.x).toBe(50); // Re-clamped
      expect(pos2.y).toBe(50);
    });

    it("should maintain position when loosening bounds", () => {
      renderer.setCameraBounds(0, 0, 50, 50);
      renderer.setCamera(50, 50);

      // Loosen bounds
      renderer.setCameraBounds(0, 0, 100, 100);

      const pos = renderer.getCamera();
      expect(pos.x).toBe(50);
      expect(pos.y).toBe(50);
    });
  });
});
