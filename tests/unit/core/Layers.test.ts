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

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }
}

describe("Layer System", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("layer", () => {
    it("should create and switch to a named layer", () => {
      const result = renderer.layer("ui");
      expect(result).toBe(renderer);
    });

    it("should allow drawing on different layers", () => {
      renderer
        .layer("background")
        .setChar(10, 10, "B", "blue")
        .layer("foreground")
        .setChar(10, 10, "F", "red");

      renderer.render();

      // Foreground should be on top
      const cell = target.getCell(10, 10);
      expect(cell?.char).toBe("F");
      expect(cell?.fg).toBe("red");
    });

    it("should maintain separate buffers for each layer", () => {
      renderer
        .layer("layer1")
        .setChar(5, 5, "A")
        .layer("layer2")
        .setChar(10, 10, "B");

      const layer1Cell = renderer.getCell(5, 5);
      const layer2Cell = renderer.getCell(10, 10);

      expect(layer1Cell).toBeUndefined(); // Not on current layer

      renderer.layer("layer1");
      expect(renderer.getCell(5, 5)?.char).toBe("A");
    });

    it("should default to a main layer", () => {
      renderer.setChar(0, 0, "M");
      renderer.render();

      expect(target.getCell(0, 0)?.char).toBe("M");
    });
  });

  describe("layerOrder", () => {
    it("should set the rendering order of layers", () => {
      renderer
        .layer("bottom")
        .setChar(10, 10, "B", "blue")
        .layer("top")
        .setChar(10, 10, "T", "red")
        .layerOrder(["bottom", "top"])
        .render();

      const cell = target.getCell(10, 10);
      expect(cell?.char).toBe("T"); // Top layer wins
    });

    it("should respect layer order when rendering", () => {
      renderer
        .layer("layer1")
        .setChar(5, 5, "1")
        .layer("layer2")
        .setChar(5, 5, "2")
        .layer("layer3")
        .setChar(5, 5, "3")
        .layerOrder(["layer1", "layer3", "layer2"])
        .render();

      // layer2 is last, so it should win
      expect(target.getCell(5, 5)?.char).toBe("2");
    });

    it("should return this for chaining", () => {
      const result = renderer.layerOrder(["layer1", "layer2"]);
      expect(result).toBe(renderer);
    });
  });

  describe("hideLayer", () => {
    it("should hide a layer from rendering", () => {
      renderer
        .layer("hidden")
        .setChar(10, 10, "H", "red")
        .layer("visible")
        .setChar(15, 15, "V", "green")
        .hideLayer("hidden")
        .render();

      expect(target.getCell(10, 10)).toBeUndefined();
      expect(target.getCell(15, 15)?.char).toBe("V");
    });

    it("should allow re-showing hidden layers", () => {
      renderer
        .layer("toggle")
        .setChar(10, 10, "T")
        .hideLayer("toggle")
        .render();

      expect(target.getCell(10, 10)).toBeUndefined();

      target.clear();
      renderer.showLayer("toggle").render();

      expect(target.getCell(10, 10)?.char).toBe("T");
    });

    it("should return this for chaining", () => {
      const result = renderer.hideLayer("test");
      expect(result).toBe(renderer);
    });
  });

  describe("showLayer", () => {
    it("should show a previously hidden layer", () => {
      renderer
        .layer("test")
        .setChar(5, 5, "X")
        .hideLayer("test")
        .showLayer("test")
        .render();

      expect(target.getCell(5, 5)?.char).toBe("X");
    });

    it("should return this for chaining", () => {
      const result = renderer.showLayer("test");
      expect(result).toBe(renderer);
    });
  });

  describe("clearLayer", () => {
    it("should clear only the specified layer", () => {
      renderer
        .layer("layer1")
        .setChar(5, 5, "A")
        .layer("layer2")
        .setChar(10, 10, "B")
        .clearLayer("layer1");

      renderer.layer("layer1");
      expect(renderer.getCell(5, 5)).toBeUndefined();

      renderer.layer("layer2");
      expect(renderer.getCell(10, 10)?.char).toBe("B");
    });

    it("should return this for chaining", () => {
      const result = renderer.clearLayer("test");
      expect(result).toBe(renderer);
    });
  });

  describe("integration", () => {
    it("should support complex multi-layer scenarios", () => {
      renderer
        .layerOrder(["background", "entities", "ui"])
        .layer("background")
        .fill(0, 0, 80, 24, ".", "gray")
        .layer("entities")
        .setChar(40, 12, "@", "yellow")
        .setChar(35, 10, "E", "red")
        .layer("ui")
        .box(0, 0, 20, 5, { style: "single", fg: "white" })
        .drawText(2, 1, "HP: 100", { fg: "green" })
        .render();

      // UI box should overlap background
      expect(target.getCell(0, 0)?.char).toBe("┌");

      // Entity should be visible
      expect(target.getCell(40, 12)?.char).toBe("@");

      // Background visible where nothing overlaps
      expect(target.getCell(70, 20)?.char).toBe(".");
    });

    it("should allow hiding UI layer", () => {
      renderer
        .layer("game")
        .setChar(10, 10, "G")
        .layer("ui")
        .setChar(10, 10, "U")
        .hideLayer("ui")
        .render();

      expect(target.getCell(10, 10)?.char).toBe("G");
    });

    it("should support layer-specific clearing", () => {
      renderer
        .layer("persistent")
        .setChar(5, 5, "P")
        .layer("temporary")
        .setChar(10, 10, "T")
        .clearLayer("temporary")
        .render();

      expect(target.getCell(5, 5)?.char).toBe("P");

      renderer.layer("temporary");
      expect(renderer.getCell(10, 10)).toBeUndefined();
    });
  });
});
