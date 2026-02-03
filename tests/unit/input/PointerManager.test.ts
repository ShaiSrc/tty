/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PointerManager } from "../../../src/input/PointerManager";

describe("Pointer Input Manager", () => {
  let manager: PointerManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    Object.defineProperty(mockElement, "offsetWidth", { value: 400 });
    Object.defineProperty(mockElement, "offsetHeight", { value: 300 });
    manager = new PointerManager(mockElement, 40, 30, 10, 10);
  });

  describe("position tracking", () => {
    it("should track pointer position in pixels (mouse)", () => {
      const event = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 100,
        pointerType: "mouse",
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(100);
    });

    it("should track pointer position in pixels (touch)", () => {
      const event = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 100,
        pointerType: "touch",
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(100);
    });

    it("should track pointer position in pixels (pen)", () => {
      const event = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 100,
        pointerType: "pen",
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(150);
      expect(pos.y).toBe(100);
    });

    it("should convert pixel to grid coordinates", () => {
      const event = new PointerEvent("pointermove", {
        clientX: 105,
        clientY: 55,
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

      const event = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 120,
      });
      mockElement.dispatchEvent(event);

      const pos = manager.getPosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });
  });

  describe("button state", () => {
    it("should detect left button press", () => {
      const event = new PointerEvent("pointerdown", { button: 0 });
      mockElement.dispatchEvent(event);

      expect(manager.isPressed(0)).toBe(true);
      expect(manager.isPressed(1)).toBe(false);
    });

    it("should detect right button press", () => {
      const event = new PointerEvent("pointerdown", { button: 2 });
      mockElement.dispatchEvent(event);

      expect(manager.isPressed(2)).toBe(true);
    });

    it("should detect button release", () => {
      const downEvent = new PointerEvent("pointerdown", { button: 0 });
      const upEvent = new PointerEvent("pointerup", { button: 0 });

      mockElement.dispatchEvent(downEvent);
      expect(manager.isPressed(0)).toBe(true);

      mockElement.dispatchEvent(upEvent);
      expect(manager.isPressed(0)).toBe(false);
    });

    it("should track multiple buttons simultaneously", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 2 }));

      expect(manager.isPressed(0)).toBe(true);
      expect(manager.isPressed(2)).toBe(true);
    });
  });

  describe("pointer type detection", () => {
    it("should detect mouse pointer", () => {
      const event = new PointerEvent("pointerdown", {
        pointerType: "mouse",
        button: 0,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPointerType()).toBe("mouse");
    });

    it("should detect touch pointer", () => {
      const event = new PointerEvent("pointerdown", {
        pointerType: "touch",
        button: 0,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPointerType()).toBe("touch");
    });

    it("should detect pen pointer", () => {
      const event = new PointerEvent("pointerdown", {
        pointerType: "pen",
        button: 0,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPointerType()).toBe("pen");
    });

    it("should handle unknown pointer type", () => {
      const event = new PointerEvent("pointerdown", {
        pointerType: "",
        button: 0,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPointerType()).toBe("");
    });
  });

  describe("pressure support (pen/touch)", () => {
    it("should track pressure for pen input", () => {
      const event = new PointerEvent("pointermove", {
        pointerType: "pen",
        pressure: 0.75,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPressure()).toBe(0.75);
    });

    it("should track pressure for touch input", () => {
      const event = new PointerEvent("pointermove", {
        pointerType: "touch",
        pressure: 0.5,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPressure()).toBe(0.5);
    });

    it("should return default pressure for mouse", () => {
      const event = new PointerEvent("pointermove", {
        pointerType: "mouse",
        pressure: 0.5,
      });
      mockElement.dispatchEvent(event);

      expect(manager.getPressure()).toBe(0.5);
    });
  });

  describe("justPressed", () => {
    it("should return true only on first frame after press", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));

      expect(manager.justPressed(0)).toBe(true);

      manager.update();
      expect(manager.justPressed(0)).toBe(false);
      expect(manager.isPressed(0)).toBe(true);
    });
  });

  describe("justReleased", () => {
    it("should return true only on first frame after release", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
      manager.update();
      mockElement.dispatchEvent(new PointerEvent("pointerup", { button: 0 }));

      expect(manager.justReleased(0)).toBe(true);

      manager.update();
      expect(manager.justReleased(0)).toBe(false);
    });
  });

  describe("click callbacks", () => {
    it("should call onClick callback", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      const event = new PointerEvent("click", { clientX: 50, clientY: 50 });
      mockElement.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          pixel: expect.any(Object),
          grid: expect.any(Object),
          event: expect.any(PointerEvent),
        }),
      );
    });

    it("should provide correct coordinates in callback", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      const event = new PointerEvent("click", { clientX: 55, clientY: 35 });
      mockElement.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          pixel: { x: 55, y: 35 },
          grid: { x: 5, y: 3 },
        }),
      );
    });
  });

  describe("hover callbacks", () => {
    it("should call onHover callback on pointer move", () => {
      const callback = vi.fn();
      manager.onHover(callback);

      const event = new PointerEvent("pointermove", {
        clientX: 100,
        clientY: 50,
      });
      mockElement.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("drag support", () => {
    it("should detect drag start", () => {
      const callback = vi.fn();
      manager.onDragStart(callback);

      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          clientX: 50,
          clientY: 50,
        }),
      );

      expect(manager.isDragging()).toBe(true);
      expect(callback).toHaveBeenCalled();
    });

    it("should detect drag end", () => {
      const callback = vi.fn();
      manager.onDragEnd(callback);

      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          clientX: 50,
          clientY: 50,
        }),
      );
      mockElement.dispatchEvent(
        new PointerEvent("pointerup", {
          button: 0,
          clientX: 100,
          clientY: 100,
        }),
      );

      expect(manager.isDragging()).toBe(false);
      expect(callback).toHaveBeenCalled();
    });

    it("should calculate drag delta", () => {
      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          clientX: 50,
          clientY: 50,
        }),
      );

      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 100,
      });
      mockElement.dispatchEvent(moveEvent);

      const delta = manager.getDragDelta();
      expect(delta.x).toBe(100);
      expect(delta.y).toBe(50);
    });

    it("should only start drag on left button", () => {
      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 2,
          clientX: 50,
          clientY: 50,
        }),
      );

      expect(manager.isDragging()).toBe(false);
    });
  });

  describe("hover state", () => {
    it("should track hover state on pointerenter", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerenter"));

      expect(manager.isHovering()).toBe(true);
    });

    it("should track hover state on pointerleave", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerenter"));
      mockElement.dispatchEvent(new PointerEvent("pointerleave"));

      expect(manager.isHovering()).toBe(false);
    });

    it("should detect hover over specific cell", () => {
      mockElement.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 105, clientY: 55 }),
      );

      expect(manager.isHoveringCell(10, 5)).toBe(true);
      expect(manager.isHoveringCell(9, 5)).toBe(false);
    });
  });

  describe("world coordinates", () => {
    it("should convert to world coordinates with camera offset", () => {
      mockElement.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 105, clientY: 55 }),
      );

      const world = manager.getWorldPosition(5, 10);
      expect(world.x).toBe(15); // grid 10 + camera 5
      expect(world.y).toBe(15); // grid 5 + camera 10
    });
  });

  describe("update and clear", () => {
    it("should clear justPressed on update", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
      expect(manager.justPressed(0)).toBe(true);

      manager.update();
      expect(manager.justPressed(0)).toBe(false);
    });

    it("should clear all states on clear", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          clientX: 50,
          clientY: 50,
        }),
      );

      manager.clear();

      expect(manager.isPressed(0)).toBe(false);
      expect(manager.justPressed(0)).toBe(false);
      expect(manager.isDragging()).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should remove event listeners on destroy", () => {
      const removeEventListenerSpy = vi.spyOn(
        mockElement,
        "removeEventListener",
      );

      manager.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "pointermove",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "pointerdown",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "pointerup",
        expect.any(Function),
      );
    });

    it("should clear callbacks on destroy", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      manager.destroy();

      mockElement.dispatchEvent(new PointerEvent("click"));
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("convenience methods", () => {
    it("should detect left button with isLeftPressed", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 0 }));
      expect(manager.isLeftPressed()).toBe(true);
    });

    it("should detect right button with isRightPressed", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 2 }));
      expect(manager.isRightPressed()).toBe(true);
    });

    it("should detect middle button with isMiddlePressed", () => {
      mockElement.dispatchEvent(new PointerEvent("pointerdown", { button: 1 }));
      expect(manager.isMiddlePressed()).toBe(true);
    });
  });

  describe("touch-specific behavior", () => {
    it("should handle touch tap as click", () => {
      const callback = vi.fn();
      manager.onClick(callback);

      const downEvent = new PointerEvent("pointerdown", {
        pointerType: "touch",
        clientX: 50,
        clientY: 50,
        button: 0,
      });
      const upEvent = new PointerEvent("pointerup", {
        pointerType: "touch",
        clientX: 50,
        clientY: 50,
        button: 0,
      });
      const clickEvent = new PointerEvent("click", {
        pointerType: "touch",
        clientX: 50,
        clientY: 50,
      });

      mockElement.dispatchEvent(downEvent);
      mockElement.dispatchEvent(upEvent);
      mockElement.dispatchEvent(clickEvent);

      expect(callback).toHaveBeenCalled();
    });

    it("should track touch drag", () => {
      const dragStartCallback = vi.fn();
      const dragEndCallback = vi.fn();

      manager.onDragStart(dragStartCallback);
      manager.onDragEnd(dragEndCallback);

      mockElement.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerType: "touch",
          button: 0,
          clientX: 50,
          clientY: 50,
        }),
      );

      expect(dragStartCallback).toHaveBeenCalled();
      expect(manager.isDragging()).toBe(true);

      mockElement.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerType: "touch",
          button: 0,
          clientX: 100,
          clientY: 100,
        }),
      );

      expect(dragEndCallback).toHaveBeenCalled();
      expect(manager.isDragging()).toBe(false);
    });
  });
});
