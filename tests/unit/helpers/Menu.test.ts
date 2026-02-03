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

describe("Menu Helper", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("menu", () => {
    it("should draw a simple menu", () => {
      const items = ["New Game", "Load Game", "Options", "Quit"];

      renderer.menu(10, 5, items);
      renderer.render();

      // Check menu items are drawn
      expect(target.getCell(12, 6)?.char).toBe("N"); // "New Game"
      expect(target.getCell(12, 7)?.char).toBe("L"); // "Load Game"
      expect(target.getCell(12, 8)?.char).toBe("O"); // "Options"
      expect(target.getCell(12, 9)?.char).toBe("Q"); // "Quit"
    });

    it("should highlight selected item", () => {
      const items = ["Item 1", "Item 2", "Item 3"];

      renderer.menu(10, 5, items, { selected: 1 });
      renderer.render();

      // First item should not be highlighted
      const item0Cell = target.getCell(12, 6);
      expect(item0Cell?.bg).not.toBe("white");

      // Second item should be highlighted
      const item1Cell = target.getCell(12, 7);
      expect(item1Cell?.bg).toBe("white");
      expect(item1Cell?.fg).toBe("black");
    });

    it("should use custom colors", () => {
      const items = ["A", "B"];

      renderer.menu(10, 5, items, {
        fg: "cyan",
        bg: "blue",
        selectedFg: "yellow",
        selectedBg: "red",
        selected: 1,
      });
      renderer.render();

      // Unselected item
      const item0Cell = target.getCell(12, 6);
      expect(item0Cell?.fg).toBe("cyan");
      expect(item0Cell?.bg).toBe("blue");

      // Selected item
      const item1Cell = target.getCell(12, 7);
      expect(item1Cell?.fg).toBe("yellow");
      expect(item1Cell?.bg).toBe("red");
    });

    it("should draw with selection indicator", () => {
      const items = ["Apple", "Banana"];

      renderer.menu(10, 5, items, {
        selected: 0,
        indicator: ">",
      });
      renderer.render();

      // Check indicator before selected item
      expect(target.getCell(11, 6)?.char).toBe(">");
      expect(target.getCell(11, 7)?.char).toBe(" ");
    });

    it("should draw with box border", () => {
      const items = ["A", "B", "C"];

      renderer.menu(10, 5, items, { border: true });
      renderer.render();

      // Check box corners
      expect(target.getCell(10, 5)?.char).toBe("┌");
      expect(target.getCell(10, 9)?.char).toBe("└");
    });

    it("should draw with title", () => {
      const items = ["A", "B"];

      renderer.menu(10, 5, items, {
        border: true,
        title: "Main Menu",
      });
      renderer.render();

      // Check title is drawn
      expect(target.getCell(11, 5)?.char).toBe(" ");
      expect(target.getCell(12, 5)?.char).toBe("M");
    });

    it("should auto-size width based on longest item", () => {
      const items = ["A", "Very Long Item Name", "B"];

      renderer.menu(10, 5, items, { border: true });
      renderer.render();

      // Width should accommodate longest item + padding
      const expectedWidth = "Very Long Item Name".length + 4; // 2 padding + 2 borders
      expect(target.getCell(10 + expectedWidth - 1, 5)?.char).toBe("┐");
    });

    it("should support custom width", () => {
      const items = ["Short", "Item"];

      renderer.menu(10, 5, items, {
        border: true,
        width: 30,
      });
      renderer.render();

      // Check box width
      expect(target.getCell(39, 5)?.char).toBe("┐"); // 10 + 30 - 1
    });

    it("should center items when width is specified", () => {
      const items = ["Hi"];

      renderer.menu(10, 5, items, {
        width: 20,
        selected: 0,
      });
      renderer.render();

      // Item should be centered in the 20-char width
      const expectedX = 10 + Math.floor((20 - 2) / 2); // Centering "Hi"
      expect(target.getCell(expectedX, 6)?.char).toBe("H");
    });

    it("should return this for chaining", () => {
      const result = renderer.menu(10, 5, ["A", "B"]);
      expect(result).toBe(renderer);
    });

    it("should handle empty items array", () => {
      renderer.menu(10, 5, []);
      renderer.render();

      // Should not throw, just render empty or minimal box
      expect(target.getCell(10, 5)).toBeDefined();
    });

    it("should use custom box style", () => {
      const items = ["A"];

      renderer.menu(10, 5, items, {
        border: true,
        style: "double",
      });
      renderer.render();

      // Check double border style
      expect(target.getCell(10, 5)?.char).toBe("╔");
    });

    it("should support padding option", () => {
      const items = ["Item"];

      renderer.menu(10, 5, items, {
        border: true,
        padding: 2,
      });
      renderer.render();

      // Items should start at x + border + padding = 10 + 1 + 2 = 13
      expect(target.getCell(13, 6)?.char).toBe("I");
    });
  });
});
