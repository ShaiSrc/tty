import { describe, it, expect } from "vitest";
import {
  parseColor,
  rgbToHex,
  toCSSColor,
  lerp,
  brighten,
  darken,
} from "../../../src/drawing/colors";
import type { RGBColor } from "../../../src/types/types";

describe("Color Utilities", () => {
  describe("parseColor", () => {
    it("should parse null to null", () => {
      expect(parseColor(null)).toBeNull();
    });

    it("should parse named colors", () => {
      expect(parseColor("red")).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor("green")).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor("blue")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("should parse hex colors", () => {
      expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("should return RGB colors as-is", () => {
      const rgb: RGBColor = { r: 128, g: 64, b: 32 };
      expect(parseColor(rgb)).toEqual(rgb);
    });
  });

  describe("rgbToHex", () => {
    it("should convert RGB to hex", () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00ff00");
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000ff");
    });

    it("should clamp values to 0-255", () => {
      expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe("#ff0080");
    });

    it("should round fractional values", () => {
      expect(rgbToHex({ r: 127.6, g: 63.4, b: 191.5 })).toBe("#803fc0");
    });
  });

  describe("toCSSColor", () => {
    it("should convert null to transparent", () => {
      expect(toCSSColor(null)).toBe("transparent");
    });

    it("should convert named colors to CSS rgb", () => {
      expect(toCSSColor("red")).toBe("rgb(255, 0, 0)");
    });

    it("should convert hex colors to CSS rgb", () => {
      expect(toCSSColor("#ff0000")).toBe("rgb(255, 0, 0)");
    });

    it("should convert RGB colors to CSS rgb", () => {
      expect(toCSSColor({ r: 128, g: 64, b: 32 })).toBe("rgb(128, 64, 32)");
    });
  });

  describe("lerp", () => {
    it("should interpolate between two colors", () => {
      const c1 = "red"; // { r: 255, g: 0, b: 0 }
      const c2 = "blue"; // { r: 0, g: 0, b: 255 }

      expect(lerp(c1, c2, 0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(lerp(c1, c2, 1)).toEqual({ r: 0, g: 0, b: 255 });
      expect(lerp(c1, c2, 0.5)).toEqual({ r: 127.5, g: 0, b: 127.5 });
    });

    it("should clamp t to 0-1 range", () => {
      const c1 = "red";
      const c2 = "blue";

      expect(lerp(c1, c2, -0.5)).toEqual({ r: 255, g: 0, b: 0 });
      expect(lerp(c1, c2, 1.5)).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("should treat null as black", () => {
      expect(lerp(null, "red", 0.5)).toEqual({ r: 127.5, g: 0, b: 0 });
    });
  });

  describe("brighten", () => {
    it("should brighten a color", () => {
      const result = brighten("red", 0.5);
      expect(result.r).toBe(255);
      expect(result.g).toBe(127.5);
      expect(result.b).toBe(127.5);
    });

    it("should return white when brightening by 1", () => {
      expect(brighten("red", 1)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should return original when brightening by 0", () => {
      expect(brighten("red", 0)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should clamp amount to 0-1", () => {
      expect(brighten("red", -0.5)).toEqual({ r: 255, g: 0, b: 0 });
      expect(brighten("red", 1.5)).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe("darken", () => {
    it("should darken a color", () => {
      const result = darken("red", 0.5);
      expect(result.r).toBe(127.5);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it("should return black when darkening by 1", () => {
      expect(darken("red", 1)).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("should return original when darkening by 0", () => {
      expect(darken("red", 0)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should clamp amount to 0-1", () => {
      expect(darken("red", -0.5)).toEqual({ r: 255, g: 0, b: 0 });
      expect(darken("red", 1.5)).toEqual({ r: 0, g: 0, b: 0 });
    });
  });
});
