import { describe, it, expect, beforeEach, vi } from "vitest";
import { CanvasTarget } from "../../../src/targets/CanvasTarget";

// Mock canvas for Node environment
class MockCanvasRenderingContext2D {
  fillStyle = "";
  font = "";
  textBaseline = "";
  clearRect = vi.fn();
  fillRect = vi.fn();
  fillText = vi.fn();
}

class MockCanvas {
  width = 0;
  height = 0;
  private ctx = new MockCanvasRenderingContext2D();

  getContext(type: string) {
    return type === "2d" ? this.ctx : null;
  }
}

describe("CanvasTarget", () => {
  let canvas: HTMLCanvasElement;
  let target: CanvasTarget;

  beforeEach(() => {
    canvas = new MockCanvas() as unknown as HTMLCanvasElement;
    target = new CanvasTarget(canvas, { width: 80, height: 24 });
  });

  describe("constructor", () => {
    it("should initialize with correct dimensions", () => {
      const size = target.getSize();
      expect(size.width).toBe(80);
      expect(size.height).toBe(24);
    });

    it("should set canvas pixel dimensions based on char size", () => {
      expect(canvas.width).toBe(80 * 8); // default charWidth
      expect(canvas.height).toBe(24 * 16); // default charHeight
    });

    it("should accept custom character dimensions", () => {
      const customCanvas = new MockCanvas() as unknown as HTMLCanvasElement;
      const customTarget = new CanvasTarget(customCanvas, {
        width: 40,
        height: 20,
        charWidth: 10,
        charHeight: 20,
      });

      expect(customCanvas.width).toBe(400);
      expect(customCanvas.height).toBe(400);
    });

    it("should throw if canvas context is unavailable", () => {
      const badCanvas = {
        getContext: () => null,
      } as unknown as HTMLCanvasElement;

      expect(
        () => new CanvasTarget(badCanvas, { width: 80, height: 24 }),
      ).toThrow("Failed to get 2D context from canvas");
    });
  });

  describe("setCell", () => {
    it("should draw a character with foreground color", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;

      target.setCell(0, 0, "A", "red", null);

      expect(ctx.fillStyle).toBe("rgb(255, 0, 0)");
      expect(ctx.fillText).toHaveBeenCalledWith("A", 0, 0);
    });

    it("should draw background color when provided", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;

      target.setCell(1, 1, "B", "white", "blue");

      expect(ctx.fillRect).toHaveBeenCalledWith(8, 16, 8, 16);
      expect(ctx.fillText).toHaveBeenCalledWith("B", 8, 16);
    });

    it("should not draw empty characters", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;
      vi.clearAllMocks();

      target.setCell(0, 0, " ", "red", null);

      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it("should calculate correct pixel positions", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;

      target.setCell(5, 10, "X", "green", null);

      expect(ctx.fillText).toHaveBeenCalledWith("X", 40, 160);
    });
  });

  describe("clear", () => {
    it("should clear the entire canvas", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;

      target.clear();

      expect(ctx.clearRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height,
      );
    });
  });

  describe("getSize", () => {
    it("should return width and height in characters", () => {
      const size = target.getSize();
      expect(size).toEqual({ width: 80, height: 24 });
    });
  });

  describe("setOptions", () => {
    it("should update character dimensions", () => {
      target.setOptions({ charWidth: 12, charHeight: 24 });

      expect(canvas.width).toBe(80 * 12);
      expect(canvas.height).toBe(24 * 24);
    });

    it("should update font settings", () => {
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as MockCanvasRenderingContext2D;

      target.setOptions({ fontFamily: "Courier", fontSize: 16 });

      expect(ctx.font).toBe("16px Courier");
    });
  });
});
