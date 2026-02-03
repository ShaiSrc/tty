import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Cell, Color, RGBColor } from "../../../src/types/types";

describe("Types", () => {
  describe("Cell", () => {
    it("should allow valid cell structure", () => {
      const cell: Cell = {
        char: "A",
        fg: "red",
        bg: null,
      };

      expect(cell.char).toBe("A");
      expect(cell.fg).toBe("red");
      expect(cell.bg).toBeNull();
    });

    it("should support different color formats", () => {
      const namedColor: Cell = { char: "A", fg: "blue", bg: null };
      const hexColor: Cell = { char: "B", fg: "#ff0000", bg: null };
      const rgbColor: Cell = {
        char: "C",
        fg: { r: 255, g: 0, b: 0 },
        bg: null,
      };

      expect(namedColor.fg).toBe("blue");
      expect(hexColor.fg).toBe("#ff0000");
      expect((rgbColor.fg as RGBColor).r).toBe(255);
    });
  });

  describe("Color", () => {
    it("should accept named colors", () => {
      const color: Color = "red";
      expect(color).toBe("red");
    });

    it("should accept hex colors", () => {
      const color: Color = "#ff0000";
      expect(color).toBe("#ff0000");
    });

    it("should accept RGB colors", () => {
      const color: Color = { r: 255, g: 0, b: 0 };
      expect(color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should accept null", () => {
      const color: Color = null;
      expect(color).toBeNull();
    });
  });
});
