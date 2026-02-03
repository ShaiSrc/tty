import { describe, it, expect, beforeEach, vi } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import { CanvasTarget } from "../../../src/targets/CanvasTarget";

describe("Factory Methods", () => {
  describe("Renderer.fromCanvas", () => {
    it("should be a static method on Renderer class", () => {
      expect(typeof Renderer.fromCanvas).toBe("function");
    });

    it("should create a Renderer instance", () => {
      // Mock HTMLCanvasElement
      const mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
        })),
        width: 800,
        height: 480,
      } as unknown as HTMLCanvasElement;

      const renderer = Renderer.fromCanvas(mockCanvas, {
        width: 80,
        height: 24,
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });

    it("should accept renderer options", () => {
      const mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
        })),
        width: 800,
        height: 480,
      } as unknown as HTMLCanvasElement;

      const renderer = Renderer.fromCanvas(
        mockCanvas,
        {
          width: 80,
          height: 24,
        },
        {
          defaultFg: "white",
          defaultBg: "black",
          autoClear: true,
        },
      );

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });

    it("should accept canvas configuration options", () => {
      const mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
        })),
        width: 1200,
        height: 800,
      } as unknown as HTMLCanvasElement;

      const renderer = Renderer.fromCanvas(mockCanvas, {
        width: 100,
        height: 40,
        charWidth: 12,
        charHeight: 20,
        fontFamily: "monospace",
        fontSize: 16,
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(100);
      expect(renderer.height).toBe(40);
    });

    it("should create a renderer that can be used for basic operations", () => {
      const mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
        })),
        width: 800,
        height: 480,
      } as unknown as HTMLCanvasElement;

      const renderer = Renderer.fromCanvas(mockCanvas, {
        width: 80,
        height: 24,
      });

      // Should be able to use all renderer methods
      renderer.clear().setChar(0, 0, "@").drawText(1, 1, "Test");

      expect(renderer.getCell(0, 0)?.char).toBe("@");
      expect(renderer.getCell(1, 1)?.char).toBe("T");
    });
  });

  describe("integration test", () => {
    it("should simplify renderer creation compared to manual approach", () => {
      const mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
        })),
        width: 800,
        height: 480,
      } as unknown as HTMLCanvasElement;

      // New simplified approach
      const renderer1 = Renderer.fromCanvas(mockCanvas, {
        width: 80,
        height: 24,
      });

      // Manual approach (for comparison)
      const target = new CanvasTarget(mockCanvas, { width: 80, height: 24 });
      const renderer2 = new Renderer(target);

      // Both should work the same
      expect(renderer1.width).toBe(renderer2.width);
      expect(renderer1.height).toBe(renderer2.height);
    });
  });

  describe("Renderer.forCanvas", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
      mockCanvas = {
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
          textBaseline: "",
        })),
        width: 800,
        height: 480,
      } as unknown as HTMLCanvasElement;
    });

    it("should be a static method on Renderer class", () => {
      expect(typeof Renderer.forCanvas).toBe("function");
    });

    it("should create a Renderer instance with grouped options", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 },
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });

    it("should accept cell sizing options", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 },
        cell: { width: 12, height: 20 },
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });

    it("should accept font configuration", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 },
        font: { family: "monospace", size: 16 },
      });

      expect(renderer).toBeInstanceOf(Renderer);
    });

    it("should accept color defaults", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 },
        colors: { fg: "white", bg: "black" },
      });

      expect(renderer).toBeInstanceOf(Renderer);
      // Test that the colors are used by default
      renderer.setChar(0, 0, "X");
      expect(renderer.getCell(0, 0)?.fg).toBe("white");
      expect(renderer.getCell(0, 0)?.bg).toBe("black");
    });

    it("should accept all options together", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 100, height: 40 },
        cell: { width: 12, height: 20 },
        font: { family: "monospace", size: 16 },
        colors: { fg: "yellow", bg: "blue" },
        autoClear: true,
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(100);
      expect(renderer.height).toBe(40);
    });

    it("should provide semantic API that's easier to understand", () => {
      // The new API makes it clearer what each option does
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 }, // Clear: this is grid size
        cell: { width: 12, height: 20 }, // Clear: this is cell size
        colors: { fg: "white", bg: "black" }, // Clear: these are colors
      });

      // Should work like any other renderer
      renderer.clear().setChar(5, 5, "@");
      expect(renderer.getCell(5, 5)?.char).toBe("@");
    });

    it("should work with minimal options (only grid required)", () => {
      const renderer = Renderer.forCanvas(mockCanvas, {
        grid: { width: 80, height: 24 },
      });

      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer.width).toBe(80);
      expect(renderer.height).toBe(24);
    });
  });
});
