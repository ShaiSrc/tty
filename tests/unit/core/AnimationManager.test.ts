/**
 * AnimationManager Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AnimationManager } from "../../../src/core/AnimationManager";
import { Renderer } from "../../../src/core/Renderer";
import type { RenderTarget } from "../../../src/types/types";

// Mock render target
class MockTarget implements RenderTarget {
  private cells: Map<string, { char: string; fg: any; bg: any }> = new Map();

  setCell(x: number, y: number, char: string, fg: any, bg: any): void {
    this.cells.set(`${x},${y}`, { char, fg, bg });
  }

  getCell(x: number, y: number) {
    return this.cells.get(`${x},${y}`);
  }

  clear(): void {
    this.cells.clear();
  }

  flush(): void {}

  getSize(): { width: number; height: number } {
    return { width: 80, height: 24 };
  }
}

describe("AnimationManager", () => {
  let animations: AnimationManager;
  let renderer: Renderer;
  let target: MockTarget;

  beforeEach(() => {
    target = new MockTarget();
    renderer = new Renderer(target);
    animations = new AnimationManager();
    animations.setRenderer(renderer);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("animate()", () => {
    it("should create a custom animation", () => {
      const onUpdate = vi.fn();
      const id = animations.animate({ onUpdate, duration: 1000 });

      expect(id).toBeGreaterThan(0);
      expect(animations.isActive(id)).toBe(true);
    });

    it("should call onUpdate with progress from 0 to 1", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000 });

      // Update at different points
      animations.update(startTime);
      expect(onUpdate).toHaveBeenCalledWith(0);

      animations.update(startTime + 250);
      expect(onUpdate).toHaveBeenCalledWith(0.25);

      animations.update(startTime + 500);
      expect(onUpdate).toHaveBeenCalledWith(0.5);

      animations.update(startTime + 1000);
      expect(onUpdate).toHaveBeenCalledWith(1);
    });

    it("should call onComplete when animation finishes", () => {
      const onComplete = vi.fn();
      const startTime = Date.now();

      animations.animate({ onComplete, duration: 1000 });

      animations.update(startTime + 1000);

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(animations.getActiveCount()).toBe(0);
    });

    it("should loop animation when loop is true", () => {
      const onUpdate = vi.fn();
      const onComplete = vi.fn();
      const startTime = Date.now();

      animations.animate({
        onUpdate,
        onComplete,
        duration: 1000,
        loop: true,
      });

      // Complete first cycle
      animations.update(startTime + 1000);
      expect(onComplete).not.toHaveBeenCalled();
      expect(animations.getActiveCount()).toBe(1);

      // Should restart
      animations.update(startTime + 1001);
      expect(onUpdate).toHaveBeenCalled();
    });

    it("should respect delay before starting", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000, delay: 500 });

      // Should not be active yet
      animations.update(startTime + 100);
      expect(onUpdate).not.toHaveBeenCalled();

      // Should start after delay
      animations.update(startTime + 500);
      expect(onUpdate).toHaveBeenCalledWith(0);
    });

    it("should apply easing functions correctly", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      // Linear (default)
      animations.animate({ onUpdate, duration: 1000, easing: "linear" });
      animations.update(startTime + 500);
      expect(onUpdate).toHaveBeenCalledWith(0.5);

      animations.stopAll();
      onUpdate.mockClear();

      // EaseIn - should be slower at start
      animations.animate({ onUpdate, duration: 1000, easing: "easeIn" });
      animations.update(startTime + 500);
      const easeInValue = onUpdate.mock.calls[0][0];
      expect(easeInValue).toBeLessThan(0.5); // 0.5^2 = 0.25
    });

    it("should stop animation when stop() is called", () => {
      const onUpdate = vi.fn();
      const id = animations.animate({ onUpdate, duration: 1000 });

      animations.stop(id);

      expect(animations.isActive(id)).toBe(false);
      expect(animations.getActiveCount()).toBe(0);
    });

    it("should stop all animations when stopAll() is called", () => {
      animations.animate({ duration: 1000 });
      animations.animate({ duration: 1000 });
      animations.animate({ duration: 1000 });

      expect(animations.getActiveCount()).toBe(3);

      animations.stopAll();

      expect(animations.getActiveCount()).toBe(0);
    });
  });

  describe("flash()", () => {
    it("should throw error if renderer not set", () => {
      const noRenderer = new AnimationManager();
      expect(() => noRenderer.flash(10, 10)).toThrow("Renderer not set");
    });

    it("should flash a character at position", () => {
      renderer.setChar(10, 10, "A");
      const startTime = Date.now();

      animations.flash(10, 10, {
        char: "*",
        fg: "red",
        count: 1,
        duration: 200,
      });

      // Should show flash char
      animations.update(startTime + 50);
      const cell1 = renderer.getCell(10, 10);
      expect(cell1?.char).toBe("*");

      // Should show original char
      animations.update(startTime + 150);
      const cell2 = renderer.getCell(10, 10);
      expect(cell2?.char).toBe("A");
    });

    it("should flash multiple times based on count", () => {
      renderer.setChar(5, 5, "B");
      const startTime = Date.now();

      animations.flash(5, 5, {
        char: "!",
        count: 3,
        duration: 600, // 100ms per flash on/off
      });

      // Verify it flashes on and off
      animations.update(startTime + 50);
      expect(renderer.getCell(5, 5)?.char).toBe("!");

      animations.update(startTime + 150);
      expect(renderer.getCell(5, 5)?.char).toBe("B");

      animations.update(startTime + 250);
      expect(renderer.getCell(5, 5)?.char).toBe("!");
    });

    it("should call onComplete when flashing finishes", () => {
      const onComplete = vi.fn();
      const startTime = Date.now();

      renderer.setChar(10, 10, "X");
      animations.flash(10, 10, {
        duration: 200,
        count: 1,
        onComplete,
      });

      animations.update(startTime + 200);

      expect(onComplete).toHaveBeenCalled();
      expect(renderer.getCell(10, 10)?.char).toBe("X"); // Restored
    });
  });

  describe("pulse()", () => {
    it("should throw error if renderer not set", () => {
      const noRenderer = new AnimationManager();
      expect(() => noRenderer.pulse(10, 10)).toThrow("Renderer not set");
    });

    it("should create a pulsing animation", () => {
      const id = animations.pulse(15, 15, {
        fg: { r: 255, g: 255, b: 0 },
        duration: 1000,
      });

      expect(id).toBeGreaterThan(0);
      expect(animations.isActive(id)).toBe(true);
    });

    it("should accept named colors for pulse", () => {
      renderer.setChar(12, 12, "@");
      const startTime = Date.now();

      animations.pulse(12, 12, {
        fg: "yellow",
        minIntensity: 1.0,
        maxIntensity: 1.0,
        duration: 1000,
        loop: false,
      });

      animations.update(startTime);
      const cell = renderer.getCell(12, 12);
      expect(cell?.fg).toEqual({ r: 255, g: 255, b: 0 });
    });

    it("should accept hex colors for pulse", () => {
      renderer.setChar(13, 13, "@");
      const startTime = Date.now();

      animations.pulse(13, 13, {
        fg: "#00FF00",
        minIntensity: 1.0,
        maxIntensity: 1.0,
        duration: 1000,
        loop: false,
      });

      animations.update(startTime);
      const cell = renderer.getCell(13, 13);
      expect(cell?.fg).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("should modulate color intensity based on progress", () => {
      renderer.setChar(20, 20, "@");
      const startTime = Date.now();

      animations.pulse(20, 20, {
        fg: { r: 100, g: 100, b: 100 },
        minIntensity: 0.5,
        maxIntensity: 1.0,
        duration: 1000,
        loop: false,
      });

      // At start (progress 0), should be at min
      animations.update(startTime);
      let cell = renderer.getCell(20, 20);
      expect(cell?.fg).toBeDefined();

      // At middle (progress 0.5), should be at max
      animations.update(startTime + 250);
      cell = renderer.getCell(20, 20);
      expect(cell?.fg).toBeDefined();
    });

    it("should loop pulse when loop is true", () => {
      const onComplete = vi.fn();
      const startTime = Date.now();

      animations.pulse(10, 10, {
        duration: 1000,
        loop: true,
        onComplete,
      });

      animations.update(startTime + 1000);

      expect(onComplete).not.toHaveBeenCalled();
      expect(animations.getActiveCount()).toBe(1);
    });

    it("should call onComplete when pulse finishes without loop", () => {
      const onComplete = vi.fn();
      const startTime = Date.now();

      animations.pulse(10, 10, {
        duration: 1000,
        loop: false,
        onComplete,
      });

      animations.update(startTime + 1000);

      expect(onComplete).toHaveBeenCalled();
      expect(animations.getActiveCount()).toBe(0);
    });
  });

  describe("easing functions", () => {
    it("should apply easeOut correctly", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000, easing: "easeOut" });
      animations.update(startTime + 500);

      const value = onUpdate.mock.calls[0][0];
      expect(value).toBeGreaterThan(0.5); // Should progress faster at start
    });

    it("should apply easeInOut correctly", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000, easing: "easeInOut" });

      // At 25%, should be slower than linear (accelerating)
      animations.update(startTime + 250);
      const value25 = onUpdate.mock.calls[0][0];
      expect(value25).toBeLessThan(0.25);

      // At 75%, should be faster than linear (decelerating)
      onUpdate.mockClear();
      animations.update(startTime + 750);
      const value75 = onUpdate.mock.calls[0][0];
      expect(value75).toBeGreaterThan(0.75);
    });

    it("should apply bounce easing", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000, easing: "bounce" });
      animations.update(startTime + 1000);

      expect(onUpdate).toHaveBeenCalled();
      // Bounce should end at 1
      const finalValue = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(finalValue).toBeCloseTo(1, 1);
    });

    it("should apply elastic easing", () => {
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate, duration: 1000, easing: "elastic" });

      animations.update(startTime + 0);
      expect(onUpdate).toHaveBeenCalledWith(0);

      animations.update(startTime + 1000);
      const finalValue = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
      expect(finalValue).toBeCloseTo(1, 1);
    });
  });

  describe("multiple animations", () => {
    it("should handle multiple simultaneous animations", () => {
      const update1 = vi.fn();
      const update2 = vi.fn();
      const update3 = vi.fn();
      const startTime = Date.now();

      animations.animate({ onUpdate: update1, duration: 1000 });
      animations.animate({ onUpdate: update2, duration: 500 });
      animations.animate({ onUpdate: update3, duration: 2000 });

      expect(animations.getActiveCount()).toBe(3);

      animations.update(startTime + 500);

      expect(update1).toHaveBeenCalled();
      expect(update2).toHaveBeenCalled();
      expect(update3).toHaveBeenCalled();
    });

    it("should remove completed animations while keeping active ones", () => {
      const startTime = Date.now();

      animations.animate({ duration: 500 }); // Will complete first
      animations.animate({ duration: 1000 });
      animations.animate({ duration: 1500 });

      expect(animations.getActiveCount()).toBe(3);

      animations.update(startTime + 500);
      expect(animations.getActiveCount()).toBe(2);

      animations.update(startTime + 1000);
      expect(animations.getActiveCount()).toBe(1);

      animations.update(startTime + 1500);
      expect(animations.getActiveCount()).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle very small duration", () => {
      const onComplete = vi.fn();
      const onUpdate = vi.fn();
      const startTime = Date.now();

      animations.animate({ duration: 1, onComplete, onUpdate });

      // Very small duration should still work
      animations.update(startTime + 2);

      expect(onComplete).toHaveBeenCalled();
      expect(onUpdate).toHaveBeenCalled();
    });

    it("should handle stopping non-existent animation", () => {
      expect(() => animations.stop(9999)).not.toThrow();
    });

    it("should handle update with no animations", () => {
      expect(() => animations.update()).not.toThrow();
    });

    it("should handle flash at empty position", () => {
      vi.useFakeTimers();
      const startTime = 1000;
      vi.setSystemTime(startTime);

      // Flash at a position that hasn't been set yet
      // The original character should default to space
      const id = animations.flash(50, 50, {
        char: "!",
        duration: 100,
        count: 1,
      });

      expect(animations.isActive(id)).toBe(true);

      // Update to trigger the flash
      animations.update(startTime + 5);

      // The flash animation should be working
      expect(animations.isActive(id)).toBe(true);

      vi.useRealTimers();
    });

    it("should return unique IDs for each animation", () => {
      const id1 = animations.animate({ duration: 1000 });
      const id2 = animations.animate({ duration: 1000 });
      const id3 = animations.animate({ duration: 1000 });

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
});
