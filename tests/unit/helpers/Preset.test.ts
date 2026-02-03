/**
 * Preset System test suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";
import * as Presets from "../../../src/helpers/presetHelpers";

// Mock render target for testing
class MockRenderTarget implements RenderTarget {
  width: number;
  height: number;
  cells: Map<string, { char: string; fg: any; bg: any }> = new Map();
  clearCalled = false;
  flushCalled = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setCell(x: number, y: number, char: string, fg: any, bg: any): void {
    this.cells.set(`${x},${y}`, { char, fg, bg });
  }

  clear(): void {
    this.cells.clear();
    this.clearCalled = true;
  }

  flush(): void {
    this.flushCalled = true;
  }

  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }
}

describe("Preset System", () => {
  let target: MockRenderTarget;
  let renderer: Renderer;

  beforeEach(() => {
    target = new MockRenderTarget(80, 24);
    renderer = new Renderer(target);
    // Clear presets before each test
    Presets.clearAllPresets();
  });

  describe("definePreset", () => {
    it("should define a text preset", () => {
      // Act
      Presets.definePreset("title", {
        type: "text",
        fg: "yellow",
        bg: "blue",
      });

      // Assert
      const preset = Presets.getPreset("title");
      expect(preset).toBeDefined();
      expect(preset?.type).toBe("text");
      expect(preset?.options.fg).toBe("yellow");
      expect(preset?.options.bg).toBe("blue");
    });

    it("should define a box preset", () => {
      // Act
      Presets.definePreset("panel", {
        type: "box",
        style: "double",
        fg: "cyan",
        fill: true,
      });

      // Assert
      const preset = Presets.getPreset("panel");
      expect(preset).toBeDefined();
      expect(preset?.type).toBe("box");
      expect(preset?.options.style).toBe("double");
    });

    it("should define a menu preset", () => {
      // Act
      Presets.definePreset("mainMenu", {
        type: "menu",
        selectedFg: "black",
        selectedBg: "white",
        border: true,
      });

      // Assert
      const preset = Presets.getPreset("mainMenu");
      expect(preset).toBeDefined();
      expect(preset?.type).toBe("menu");
    });

    it("should define a progress bar preset", () => {
      // Act
      Presets.definePreset("health", {
        type: "progressBar",
        fillFg: "red",
        emptyFg: "gray",
        border: true,
      });

      // Assert
      const preset = Presets.getPreset("health");
      expect(preset).toBeDefined();
      expect(preset?.type).toBe("progressBar");
    });

    it("should overwrite existing preset with same name", () => {
      // Arrange
      Presets.definePreset("test", {
        type: "text",
        fg: "red",
      });

      // Act
      Presets.definePreset("test", {
        type: "text",
        fg: "blue",
      });

      // Assert
      const preset = Presets.getPreset("test");
      expect(preset?.options.fg).toBe("blue");
    });
  });

  describe("getPreset", () => {
    it("should return undefined for non-existent preset", () => {
      // Act
      const preset = Presets.getPreset("nonexistent");

      // Assert
      expect(preset).toBeUndefined();
    });

    it("should return defined preset", () => {
      // Arrange
      Presets.definePreset("myPreset", {
        type: "text",
        fg: "green",
      });

      // Act
      const preset = Presets.getPreset("myPreset");

      // Assert
      expect(preset).toBeDefined();
      expect(preset?.options.fg).toBe("green");
    });
  });

  describe("applyTextPreset", () => {
    it("should apply text preset to drawText", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("warning", {
        type: "text",
        fg: "yellow",
        bg: "red",
      });

      // Act
      renderer.applyTextPreset(5, 5, "Warning!", "warning");
      renderer.render();

      // Assert
      const cell = target.getCell(5, 5);
      expect(cell?.char).toBe("W");
      expect(cell?.fg).toBe("yellow");
      expect(cell?.bg).toBe("red");
    });

    it("should allow overriding preset options", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("title", {
        type: "text",
        fg: "cyan",
      });

      // Act
      renderer.applyTextPreset(0, 0, "Custom", "title", { fg: "magenta" });
      renderer.render();

      // Assert
      const cell = target.getCell(0, 0);
      expect(cell?.fg).toBe("magenta");
    });

    it("should throw error for non-existent preset", () => {
      // Act & Assert
      expect(() =>
        renderer.applyTextPreset(0, 0, "Test", "nonexistent"),
      ).toThrow();
    });

    it("should throw error for wrong preset type", () => {
      // Arrange
      Presets.definePreset("boxPreset", {
        type: "box",
        style: "single",
      });

      // Act & Assert
      expect(() =>
        renderer.applyTextPreset(0, 0, "Test", "boxPreset"),
      ).toThrow();
    });
  });

  describe("applyBoxPreset", () => {
    it("should apply box preset", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("dialog", {
        type: "box",
        style: "double",
        fg: "white",
        fill: true,
      });

      // Act
      renderer.applyBoxPreset(10, 5, 20, 10, "dialog");
      renderer.render();

      // Assert
      expect(target.getCell(10, 5)?.char).toBe("╔");
      expect(target.getCell(10, 5)?.fg).toBe("white");
    });

    it("should allow overriding box preset options", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("panel", {
        type: "box",
        style: "single",
        fg: "cyan",
      });

      // Act
      renderer.applyBoxPreset(0, 0, 10, 5, "panel", { fg: "yellow" });
      renderer.render();

      // Assert
      expect(target.getCell(0, 0)?.fg).toBe("yellow");
    });
  });

  describe("applyMenuPreset", () => {
    it("should apply menu preset", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("gameMenu", {
        type: "menu",
        selectedFg: "black",
        selectedBg: "cyan",
        border: true,
        style: "rounded",
      });

      // Act
      renderer.applyMenuPreset(10, 5, ["Start", "Quit"], "gameMenu", {
        selected: 0,
      });
      renderer.render();

      // Assert - Should have border
      expect(target.getCell(10, 5)?.char).toBe("╭");
    });

    it("should merge menu options with preset", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("simpleMenu", {
        type: "menu",
        fg: "white",
      });

      // Act & Assert - Should not throw
      expect(() => {
        renderer.applyMenuPreset(0, 0, ["Option 1"], "simpleMenu", {
          selected: 0,
          indicator: "►",
        });
        renderer.render();
      }).not.toThrow();
    });
  });

  describe("applyProgressBarPreset", () => {
    it("should apply progress bar preset", () => {
      // Arrange
      renderer.clear();
      Presets.definePreset("mana", {
        type: "progressBar",
        fillFg: "blue",
        emptyFg: "gray",
        style: "blocks",
      });

      // Act
      renderer.applyProgressBarPreset(5, 5, 20, 0.5, "mana");
      renderer.render();

      // Assert - Should have filled and empty portions
      expect(target.getCell(5, 5)?.fg).toBeDefined();
    });
  });

  describe("listPresets", () => {
    it("should return empty array when no presets defined", () => {
      // Act
      const presets = Presets.listPresets();

      // Assert
      expect(presets).toEqual([]);
    });

    it("should return all preset names", () => {
      // Arrange
      Presets.definePreset("preset1", { type: "text", fg: "red" });
      Presets.definePreset("preset2", { type: "box", style: "single" });
      Presets.definePreset("preset3", { type: "menu", border: true });

      // Act
      const presets = Presets.listPresets();

      // Assert
      expect(presets).toContain("preset1");
      expect(presets).toContain("preset2");
      expect(presets).toContain("preset3");
      expect(presets).toHaveLength(3);
    });
  });

  describe("clearAllPresets", () => {
    it("should remove all presets", () => {
      // Arrange
      Presets.definePreset("test1", { type: "text", fg: "red" });
      Presets.definePreset("test2", { type: "box", style: "single" });

      // Act
      Presets.clearAllPresets();

      // Assert
      expect(Presets.listPresets()).toHaveLength(0);
      expect(Presets.getPreset("test1")).toBeUndefined();
    });
  });
});
