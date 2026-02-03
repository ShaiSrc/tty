import { describe, it, expect, beforeEach } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";
import {
  calculateAlignedX,
  calculateCenterX,
  calculateRightX,
} from "../../../src/helpers/alignment";

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

  getText(y: number, startX: number, endX: number): string {
    let text = "";
    for (let x = startX; x <= endX; x++) {
      const cell = this.getCell(x, y);
      text += cell?.char ?? " ";
    }
    return text.trim();
  }
}

describe("Alignment Helpers", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
  });

  describe("centerText", () => {
    it("should center text horizontally", () => {
      renderer.centerText(10, "Hello");
      renderer.render();

      const text = "Hello";
      const expectedX = Math.floor((80 - text.length) / 2);

      expect(target.getCell(expectedX, 10)?.char).toBe("H");
      expect(target.getCell(expectedX + 1, 10)?.char).toBe("e");
      expect(target.getCell(expectedX + 4, 10)?.char).toBe("o");
    });

    it("should center text with custom colors", () => {
      renderer.centerText(10, "Test", { fg: "yellow", bg: "blue" });
      renderer.render();

      const expectedX = Math.floor((80 - 4) / 2);
      const cell = target.getCell(expectedX, 10);

      expect(cell?.fg).toBe("yellow");
      expect(cell?.bg).toBe("blue");
    });

    it("should center in custom width", () => {
      renderer.centerText(10, "Hi", { fg: "white" }, 0, 20);
      renderer.render();

      const expectedX = Math.floor((20 - 2) / 2);
      expect(target.getCell(expectedX, 10)?.char).toBe("H");
    });

    it("should handle odd-length text", () => {
      renderer.centerText(5, "ABC"); // 3 chars in 80 width
      renderer.render();

      const expectedX = Math.floor((80 - 3) / 2); // (80 - 3) / 2 = 38.5 -> 38
      expect(target.getCell(expectedX, 5)?.char).toBe("A");
    });

    it("should return this for chaining", () => {
      const result = renderer.centerText(10, "Test");
      expect(result).toBe(renderer);
    });
  });

  describe("rightAlign", () => {
    it("should align text to the right", () => {
      renderer.rightAlign(10, "Hello");
      renderer.render();

      const text = "Hello";
      const expectedX = 80 - text.length;

      expect(target.getCell(expectedX, 10)?.char).toBe("H");
      expect(target.getCell(79, 10)?.char).toBe("o");
    });

    it("should align with custom colors", () => {
      renderer.rightAlign(10, "Test", { fg: "cyan" });
      renderer.render();

      const expectedX = 80 - 4;
      expect(target.getCell(expectedX, 10)?.fg).toBe("cyan");
    });

    it("should align within custom width", () => {
      renderer.rightAlign(5, "Hi", { fg: "white" }, 0, 20);
      renderer.render();

      const expectedX = 20 - 2;
      expect(target.getCell(expectedX, 5)?.char).toBe("H");
      expect(target.getCell(expectedX + 1, 5)?.char).toBe("i");
    });

    it("should return this for chaining", () => {
      const result = renderer.rightAlign(10, "Test");
      expect(result).toBe(renderer);
    });
  });

  describe("leftAlign", () => {
    it("should align text to the left", () => {
      renderer.leftAlign(10, "Hello");
      renderer.render();

      expect(target.getCell(0, 10)?.char).toBe("H");
      expect(target.getCell(1, 10)?.char).toBe("e");
      expect(target.getCell(4, 10)?.char).toBe("o");
    });

    it("should align with custom offset", () => {
      renderer.leftAlign(10, "Test", { fg: "green" }, 5);
      renderer.render();

      expect(target.getCell(5, 10)?.char).toBe("T");
      expect(target.getCell(6, 10)?.char).toBe("e");
    });

    it("should align with colors", () => {
      renderer.leftAlign(5, "Hi", { fg: "red", bg: "black" });
      renderer.render();

      const cell = target.getCell(0, 5);
      expect(cell?.fg).toBe("red");
      expect(cell?.bg).toBe("black");
    });

    it("should return this for chaining", () => {
      const result = renderer.leftAlign(10, "Test");
      expect(result).toBe(renderer);
    });
  });

  describe("alignText", () => {
    it('should align left when align is "left"', () => {
      renderer.alignText(10, "Test", { align: "left" });
      renderer.render();

      expect(target.getCell(0, 10)?.char).toBe("T");
    });

    it('should align center when align is "center"', () => {
      renderer.alignText(10, "Test", { align: "center" });
      renderer.render();

      const expectedX = Math.floor((80 - 4) / 2);
      expect(target.getCell(expectedX, 10)?.char).toBe("T");
    });

    it('should align right when align is "right"', () => {
      renderer.alignText(10, "Test", { align: "right" });
      renderer.render();

      const expectedX = 80 - 4;
      expect(target.getCell(expectedX, 10)?.char).toBe("T");
    });

    it("should default to left align", () => {
      renderer.alignText(10, "Test");
      renderer.render();

      expect(target.getCell(0, 10)?.char).toBe("T");
    });

    it("should support custom width and offset", () => {
      renderer.alignText(10, "Hi", { align: "center" }, 10, 30);
      renderer.render();

      const expectedX = 10 + Math.floor((30 - 2) / 2);
      expect(target.getCell(expectedX, 10)?.char).toBe("H");
    });

    it("should return this for chaining", () => {
      const result = renderer.alignText(10, "Test", { align: "center" });
      expect(result).toBe(renderer);
    });
  });

  describe("chaining", () => {
    it("should allow chaining alignment methods", () => {
      renderer
        .clear()
        .centerText(5, "Centered", { fg: "yellow" })
        .leftAlign(10, "Left", { fg: "green" })
        .rightAlign(15, "Right", { fg: "cyan" })
        .render();

      // Verify all three are rendered
      const centerX = Math.floor((80 - 8) / 2);
      expect(target.getCell(centerX, 5)?.char).toBe("C");
      expect(target.getCell(0, 10)?.char).toBe("L");
      expect(target.getCell(80 - 5, 15)?.char).toBe("R");
    });
  });

  describe("alignment helper functions", () => {
    it("calculateCenterX should not go negative when text is wider than width", () => {
      const result = calculateCenterX("ABCDEFG", 5, 3);
      expect(result).toBe(5);
    });

    it("calculateRightX should not go negative when text is wider than width", () => {
      const result = calculateRightX("ABCDEFG", 2, 3);
      expect(result).toBe(2);
    });

    it("calculateAlignedX should align center", () => {
      const result = calculateAlignedX("Test", { align: "center" }, 10, 20);
      expect(result).toBe(10 + Math.floor((20 - 4) / 2));
    });

    it("calculateAlignedX should align right", () => {
      const result = calculateAlignedX("Hi", { align: "right" }, 7, 12);
      expect(result).toBe(7 + (12 - 2));
    });

    it("calculateAlignedX should default to left", () => {
      const result = calculateAlignedX("Hello", {}, 4, 10);
      expect(result).toBe(4);
    });
  });
});
