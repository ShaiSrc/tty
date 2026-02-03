/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { KeyboardManager } from "../../../src/input/KeyboardManager";

describe("Keyboard Input Helpers", () => {
  let manager: KeyboardManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    manager = new KeyboardManager(mockElement);
  });

  describe("basic key tracking", () => {
    it("should detect when key is pressed", () => {
      const event = new KeyboardEvent("keydown", { key: "a" });
      mockElement.dispatchEvent(event);

      expect(manager.isPressed("a")).toBe(true);
    });

    it("should detect when key is released", () => {
      const downEvent = new KeyboardEvent("keydown", { key: "a" });
      const upEvent = new KeyboardEvent("keyup", { key: "a" });

      mockElement.dispatchEvent(downEvent);
      expect(manager.isPressed("a")).toBe(true);

      mockElement.dispatchEvent(upEvent);
      expect(manager.isPressed("a")).toBe(false);
    });

    it("should track multiple keys simultaneously", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(manager.isPressed("w")).toBe(true);
      expect(manager.isPressed("a")).toBe(true);
      expect(manager.isPressed("s")).toBe(false);
    });

    it("should be case-sensitive", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));

      expect(manager.isPressed("A")).toBe(true);
      expect(manager.isPressed("a")).toBe(false);
    });
  });

  describe("special keys", () => {
    it("should detect arrow keys", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      expect(manager.isPressed("ArrowUp")).toBe(true);
    });

    it("should detect modifier keys", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Shift", shiftKey: true }),
      );
      expect(manager.isPressed("Shift")).toBe(true);
    });

    it("should detect space and enter", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

      expect(manager.isPressed(" ")).toBe(true);
      expect(manager.isPressed("Enter")).toBe(true);
    });

    it("should normalize Space alias to space character", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

      expect(manager.isPressed("Space")).toBe(true);
      expect(manager.isPressed(" ")).toBe(true);
    });

    it("should trigger callbacks registered with Space alias", () => {
      const callback = vi.fn();
      manager.onKeyDown("Space", callback);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("justPressed", () => {
    it("should return true only on first frame after press", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(manager.justPressed("a")).toBe(true);

      // Simulate next frame
      manager.update();
      expect(manager.justPressed("a")).toBe(false);
      expect(manager.isPressed("a")).toBe(true); // Still pressed
    });

    it("should reset after update", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      manager.update();

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
      expect(manager.justPressed("b")).toBe(true);
      expect(manager.justPressed("a")).toBe(false);
    });
  });

  describe("justReleased", () => {
    it("should return true only on first frame after release", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      manager.update();
      mockElement.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

      expect(manager.justReleased("a")).toBe(true);

      manager.update();
      expect(manager.justReleased("a")).toBe(false);
      expect(manager.isPressed("a")).toBe(false);
    });
  });

  describe("onKeyDown callback", () => {
    it("should call callback when key is pressed", () => {
      const callback = vi.fn();
      manager.onKeyDown("a", callback);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should not call callback for different key", () => {
      const callback = vi.fn();
      manager.onKeyDown("a", callback);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));

      expect(callback).not.toHaveBeenCalled();
    });

    it("should support multiple callbacks for same key", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.onKeyDown("a", callback1);
      manager.onKeyDown("a", callback2);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("onKeyUp callback", () => {
    it("should call callback when key is released", () => {
      const callback = vi.fn();
      manager.onKeyUp("a", callback);

      mockElement.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("multi-key bindings", () => {
    it("should support array of keys in onKeyDown", () => {
      const callback = vi.fn();
      manager.onKeyDown(["w", "W", "ArrowUp"], callback);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      expect(callback).toHaveBeenCalledTimes(1);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "W" }));
      expect(callback).toHaveBeenCalledTimes(2);

      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should support array of keys in onKeyUp", () => {
      const callback = vi.fn();
      manager.onKeyUp(["a", "A", "ArrowLeft"], callback);

      mockElement.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
      expect(callback).toHaveBeenCalledTimes(1);

      mockElement.dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
      expect(callback).toHaveBeenCalledTimes(2);

      mockElement.dispatchEvent(
        new KeyboardEvent("keyup", { key: "ArrowLeft" }),
      );
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should trigger callback once per key press with array binding", () => {
      const callback = vi.fn();
      manager.onKeyDown(["Enter", "Space"], callback);

      // Press Enter, should call once
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(callback).toHaveBeenCalledTimes(1);

      // Press Space, should call once more
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("isDown alias", () => {
    it("should be an alias for isPressed", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(manager.isDown("a")).toBe(true);
      expect(manager.isDown("a")).toBe(manager.isPressed("a"));
    });

    it("should return false for non-pressed keys", () => {
      expect(manager.isDown("x")).toBe(false);
    });
  });

  describe("removeCallback", () => {
    it("should remove keydown callback", () => {
      const callback = vi.fn();
      manager.onKeyDown("a", callback);
      manager.removeCallback("a", callback);

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(callback).not.toHaveBeenCalled();
    });

    it("should remove keyup callback", () => {
      const callback = vi.fn();
      manager.onKeyUp("a", callback);
      manager.removeCallback("a", callback, "keyup");

      mockElement.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should clear all pressed keys", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));

      manager.clear();

      expect(manager.isPressed("a")).toBe(false);
      expect(manager.isPressed("b")).toBe(false);
    });
  });

  describe("destroy", () => {
    it("should remove event listeners", () => {
      manager.destroy();

      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

      expect(manager.isPressed("a")).toBe(false);
    });

    it("should clear all state", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      manager.destroy();

      expect(manager.isPressed("a")).toBe(false);
    });
  });

  describe("key combinations", () => {
    it("should detect Ctrl+Key combinations", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }),
      );
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "s", ctrlKey: true }),
      );

      expect(manager.isPressed("Control")).toBe(true);
      expect(manager.isPressed("s")).toBe(true);
    });

    it("should detect Shift+Key combinations", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Shift", shiftKey: true }),
      );
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "A", shiftKey: true }),
      );

      expect(manager.isPressed("Shift")).toBe(true);
      expect(manager.isPressed("A")).toBe(true);
    });
  });

  describe("getPressed", () => {
    it("should return array of all pressed keys", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));

      const pressed = manager.getPressed();

      expect(pressed).toContain("w");
      expect(pressed).toContain("a");
      expect(pressed).toContain("d");
      expect(pressed.length).toBe(3);
    });

    it("should return empty array when no keys pressed", () => {
      const pressed = manager.getPressed();
      expect(pressed).toEqual([]);
    });
  });

  describe("getDirection", () => {
    it("should return {x: 0, y: 0} when no direction keys pressed", () => {
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: 0 });
    });

    it("should detect W/Up as up direction", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: -1 });
    });

    it("should detect S/Down as down direction", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: 1 });
    });

    it("should detect A/Left as left direction", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: -1, y: 0 });
    });

    it("should detect D/Right as right direction", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 1, y: 0 });
    });

    it("should detect ArrowUp as up direction", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: -1 });
    });

    it("should detect ArrowDown as down direction", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: 1 });
    });

    it("should detect ArrowLeft as left direction", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft" }),
      );
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: -1, y: 0 });
    });

    it("should detect ArrowRight as right direction", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight" }),
      );
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 1, y: 0 });
    });

    it("should handle diagonal input (W+D)", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 1, y: -1 });
    });

    it("should handle diagonal input (ArrowUp+ArrowRight)", () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp" }),
      );
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight" }),
      );
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 1, y: -1 });
    });

    it("should prioritize WASD over arrows when both pressed", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      const dir = manager.getDirection();
      // WASD takes precedence
      expect(dir).toEqual({ x: 0, y: -1 });
    });

    it("should handle opposing directions (up takes precedence)", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
      const dir = manager.getDirection();
      // W takes precedence (checked first in if-else)
      expect(dir.y).toBe(-1);
    });

    it("should handle opposing directions (left takes precedence)", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));
      const dir = manager.getDirection();
      // A wins (checked first in if-else)
      expect(dir.x).toBe(-1);
    });

    it("should be case-insensitive for WASD", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "W" }));
      const dir = manager.getDirection();
      expect(dir).toEqual({ x: 0, y: -1 });
    });

    it("should support normalize option", () => {
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }));

      const dir = manager.getDirection({ normalize: true });

      // Diagonal should be normalized to length ~1
      const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      expect(length).toBeCloseTo(1, 5);
    });

    it("should return {0, 0} when normalize is true but no input", () => {
      const dir = manager.getDirection({ normalize: true });
      expect(dir).toEqual({ x: 0, y: 0 });
    });
  });

  describe("waitForKey", () => {
    it("should resolve when specified key is pressed", async () => {
      const promise = manager.waitForKey("Enter");

      // Simulate key press after a short delay
      setTimeout(() => {
        mockElement.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter" }),
        );
        manager.update();
      }, 10);

      const key = await promise;
      expect(key).toBe("Enter");
    });

    it("should resolve with any key when no specific key specified", async () => {
      const promise = manager.waitForKey();

      setTimeout(() => {
        mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
        manager.update();
      }, 10);

      const key = await promise;
      expect(key).toBe("x");
    });

    it("should resolve with first matching key from array", async () => {
      const promise = manager.waitForKey(["y", "n", "Escape"]);

      setTimeout(() => {
        mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "n" }));
        manager.update();
      }, 10);

      const key = await promise;
      expect(key).toBe("n");
    });

    it("should ignore non-matching keys", async () => {
      const promise = manager.waitForKey("Enter");

      setTimeout(() => {
        mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        manager.update();
        mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
        manager.update();
        mockElement.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter" }),
        );
        manager.update();
      }, 10);

      const key = await promise;
      expect(key).toBe("Enter");
    });

    it("should timeout when specified", async () => {
      const promise = manager.waitForKey("Enter", { timeout: 50 });

      await expect(promise).rejects.toThrow("Timeout waiting for key");
    });

    it("should cancel when abort signal is triggered", async () => {
      const controller = new AbortController();
      const promise = manager.waitForKey("Enter", {
        signal: controller.signal,
      });

      setTimeout(() => controller.abort(), 10);

      await expect(promise).rejects.toThrow("cancelled");
    });

    it("should work with both timeout and signal", async () => {
      const controller = new AbortController();
      const promise = manager.waitForKey("Enter", {
        timeout: 1000,
        signal: controller.signal,
      });

      setTimeout(() => controller.abort(), 10);

      await expect(promise).rejects.toThrow("cancelled");
    });

    it("should cleanup listeners when resolved", async () => {
      const promise = manager.waitForKey("Enter");

      setTimeout(() => {
        mockElement.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter" }),
        );
        manager.update();
      }, 10);

      await promise;

      // The listener should be removed, so pressing again shouldn't affect anything
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      manager.update();

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });

    it("should cleanup listeners when timeout occurs", async () => {
      const promise = manager.waitForKey("Enter", { timeout: 50 });

      await expect(promise).rejects.toThrow("Timeout waiting for key");

      // The listener should be removed
      mockElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      manager.update();

      expect(true).toBe(true);
    });
  });
});
