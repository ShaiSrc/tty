import { describe, it, expect } from "vitest";
import {
  parseColor,
  rgbToHex,
  toCSSColor,
  CanvasTarget,
} from "../../../src/index";

describe("Package Exports", () => {
  it("should export color utilities", () => {
    expect(typeof parseColor).toBe("function");
    expect(typeof rgbToHex).toBe("function");
    expect(typeof toCSSColor).toBe("function");
  });

  it("should export CanvasTarget", () => {
    expect(CanvasTarget).toBeDefined();
  });

  it("should have working color utilities", () => {
    expect(parseColor("red")).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
    expect(toCSSColor("blue")).toBe("rgb(0, 0, 255)");
  });
});
