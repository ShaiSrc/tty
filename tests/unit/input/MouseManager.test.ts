/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MouseManager } from "../../../src/input/MouseManager";

describe("Mouse Input Helpers", () => {
  let manager: MouseManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    // Set element size for coordinate calculations
    Object.defineProperty(mockElement, "offsetWidth", { value: 400 });
    Object.defineProperty(mockElement, "offsetHeight", { value: 300 });
    manager = new MouseManager(mockElement, 40, 30, 10, 10);
  });

  describe("position tracking", () => {
    it("should track mouse position in pixels", () => {
      const event = new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 100,
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(100);
    });

    it("should convert pixel to grid coordinates", () => {
      const event = new MouseEvent("mousemove", {
        clientX: 105, // 105 / 10 = 10.5 -> 10
        clientY: 55, // 55 / 10 = 5.5 -> 5
      });
      mockElement.dispatchEvent(event);

      const grid = manager.getGridPosition();
      expect(grid.x).toBe(10);
      expect(grid.y).toBe(5);
    });

    it("should handle element offset", () => {
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        left: 50,
        top: 20,
        right: 450,
        bottom: 320,
        width: 400,
        height: 300,
        x: 50,
        y: 20,
        toJSON: () => ({}),
      });

      const event = new MouseEvent("mousemove", {
        clientX: 150, // 150 - 50 = 100 actual
        clientY: 120, // 120 - 20 = 100 actual
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });
  });

  describe("button state", () => {
    it("should detect left button press", () => {
      const event = new MouseEvent("mousedown", { button: 0 });
      mockElement.dispatchEvent(event);

      expect(manager.isPressed(0)).toBe(true);
      expect(manager.isPressed(1)).toBe(false);
    });

    it("should detect right button press", () => {
      const event = new MouseEvent("mousedown", { button: 2 });
      mockElement.dispatchEvent(event);

      expect(manager.isPressed(2)).toBe(true);
    });

    it("should detect button release", () => {
      const downEvent = new MouseEvent("mousedown", { button: 0 });
      const upEvent = new MouseEvent("mouseup", { button: 0 });

      mockElement.dispatchEvent(downEvent);
      expect(manager.isPressed(0)).toBe(true);

      mockElement.dispatchEvent(upEvent);
      expect(manager.isPressed(0)).toBe(false);
    });

    it("should track multiple buttons simultaneously", () => {
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 2 }));

      expect(manager.isPressed(0)).toBe(true);
      expect(manager.isPressed(2)).toBe(true);
    });
  });

  describe("justPressed", () => {
    it("should return true only on first frame after press", () => {
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));

      expect(manager.justPressed(0)).toBe(true);

      manager.update();
      expect(manager.justPressed(0)).toBe(false);
      expect(manager.isPressed(0)).toBe(true);
    });
  });

  describe("justReleased", () => {
    it("should return true only on first frame after release", () => {
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
      manager.update();
      mockElement.dispatchEvent(new MouseEvent("mouseup", { button: 0 }));

      expect(manager.justReleased(0)).toBe(true);

      manager.update();
      expect(manager.justReleased(0)).toBe(false);
    });
  });

  describe("click callbacks", () => {
    it("should call onClick callback", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      const event = new MouseEvent("click", { clientX: 50, clientY: 50 });
      mockElement.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          pixel: expect.any(Object),
          grid: expect.any(Object),
          event: expect.any(MouseEvent),
        }),
      );
    });

    it("should provide correct coordinates in callback", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      mockElement.dispatchEvent(
        new MouseEvent("click", { clientX: 105, clientY: 55 }),
      );

      const call = callback.mock.calls[0][0];
      expect(call.grid.x).toBe(10);
      expect(call.grid.y).toBe(5);
    });

    it("should support multiple click callbacks", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.onClick(callback1);
      manager.onClick(callback2);

      mockElement.dispatchEvent(new MouseEvent("click"));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("hover tracking", () => {
    it("should detect hover state", () => {
      mockElement.dispatchEvent(new MouseEvent("mouseenter"));
      expect(manager.isHovering()).toBe(true);

      mockElement.dispatchEvent(new MouseEvent("mouseleave"));
      expect(manager.isHovering()).toBe(false);
    });

    it("should call onHover callback", () => {
      const callback = vi.fn();
      manager.onHover(callback);

      mockElement.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 50, clientY: 50 }),
      );

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("grid cell detection", () => {
    it("should detect if hovering over specific grid cell", () => {
      mockElement.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 105, clientY: 55 }),
      );

      expect(manager.isHoveringCell(10, 5)).toBe(true);
      expect(manager.isHoveringCell(0, 0)).toBe(false);
    });
  });

  describe("world coordinates", () => {
    it("should convert to world coordinates with camera offset", () => {
      mockElement.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 105, clientY: 55 }),
      );

      const world = manager.getWorldPosition(20, 15);
      expect(world.x).toBe(30); // 10 + 20
      expect(world.y).toBe(20); // 5 + 15
    });
  });

  describe("drag tracking", () => {
    it("should detect drag start and end", () => {
      expect(manager.isDragging()).toBe(false);

      mockElement.dispatchEvent(
        new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50 }),
      );
      expect(manager.isDragging()).toBe(true);

      mockElement.dispatchEvent(new MouseEvent("mouseup", { button: 0 }));
      expect(manager.isDragging()).toBe(false);
    });

    it("should track drag delta", () => {
      mockElement.dispatchEvent(
        new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50 }),
      );
      mockElement.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 150, clientY: 100 }),
      );

      const delta = manager.getDragDelta();
      expect(delta.x).toBe(100);
      expect(delta.y).toBe(50);
    });

    it("should call onDragStart callback", () => {
      const callback = vi.fn();
      manager.onDragStart(callback);

      mockElement.dispatchEvent(
        new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50 }),
      );

      expect(callback).toHaveBeenCalled();
    });

    it("should call onDragEnd callback", () => {
      const callback = vi.fn();
      manager.onDragEnd(callback);

      mockElement.dispatchEvent(
        new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50 }),
      );
      mockElement.dispatchEvent(new MouseEvent("mouseup", { button: 0 }));

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should clear state", () => {
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
      manager.clear();

      expect(manager.isPressed(0)).toBe(false);
    });

    it("should remove event listeners on destroy", () => {
      manager.destroy();

      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
      expect(manager.isPressed(0)).toBe(false);
    });
  });

  describe("button helpers", () => {
    it("should provide left/right/middle button helpers", () => {
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 0 }));
      expect(manager.isLeftPressed()).toBe(true);
      expect(manager.isRightPressed()).toBe(false);

      mockElement.dispatchEvent(new MouseEvent("mouseup", { button: 0 }));
      mockElement.dispatchEvent(new MouseEvent("mousedown", { button: 2 }));
      expect(manager.isLeftPressed()).toBe(false);
      expect(manager.isRightPressed()).toBe(true);
    });
  });
});
