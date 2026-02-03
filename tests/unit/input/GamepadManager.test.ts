/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GamepadManager } from "../../../src/input/GamepadManager";

// Mock Gamepad API
class MockGamepad implements Gamepad {
  id: string;
  index: number;
  connected: boolean;
  timestamp: number;
  mapping: GamepadMappingType;
  axes: readonly number[];
  buttons: readonly GamepadButton[];
  vibrationActuator?: GamepadHapticActuator;

  constructor(index: number, options: Partial<Gamepad> = {}) {
    this.id = options.id ?? "Mock Gamepad";
    this.index = index;
    this.connected = options.connected ?? true;
    this.timestamp = options.timestamp ?? Date.now();
    this.mapping = options.mapping ?? "standard";
    this.axes = options.axes ?? [0, 0, 0, 0];
    this.buttons = options.buttons ?? this.createButtons(17);
  }

  private createButtons(count: number): GamepadButton[] {
    return Array(count)
      .fill(null)
      .map(() => ({
        pressed: false,
        touched: false,
        value: 0,
      }));
  }

  setButton(index: number, pressed: boolean, value: number = pressed ? 1 : 0) {
    const buttons = [...this.buttons];
    buttons[index] = { pressed, touched: pressed, value };
    this.buttons = buttons;
  }

  setAxis(index: number, value: number) {
    const axes = [...this.axes];
    axes[index] = value;
    this.axes = axes;
  }
}

describe("GamepadManager", () => {
  let manager: GamepadManager;
  let mockGamepads: (MockGamepad | null)[];

  beforeEach(() => {
    // Reset mock gamepads
    mockGamepads = [null, null, null, null];

    // Mock navigator.getGamepads - need to add it to navigator if it doesn't exist
    if (!navigator.getGamepads) {
      Object.defineProperty(navigator, "getGamepads", {
        value: () => mockGamepads,
        writable: true,
        configurable: true,
      });
    } else {
      vi.spyOn(navigator, "getGamepads").mockImplementation(() => mockGamepads);
    }

    manager = new GamepadManager();
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should create manager with default deadzone", () => {
      expect(manager.getDeadzone()).toBe(0.15);
    });

    it("should create manager with custom deadzone", () => {
      const customManager = new GamepadManager({ deadzone: 0.25 });
      expect(customManager.getDeadzone()).toBe(0.25);
      customManager.destroy();
    });

    it("should have no connected gamepads initially", () => {
      expect(manager.getConnectedCount()).toBe(0);
      expect(manager.isConnected(0)).toBe(false);
    });
  });

  describe("gamepad connection", () => {
    it("should detect when gamepad connects", () => {
      const mockGamepad = new MockGamepad(0);

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });

      window.dispatchEvent(event);

      expect(manager.isConnected(0)).toBe(true);
      expect(manager.getConnectedCount()).toBe(1);
    });

    it("should detect when gamepad disconnects", () => {
      const mockGamepad = new MockGamepad(0);

      // Connect
      let event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(manager.isConnected(0)).toBe(true);

      // Disconnect
      event = new Event("gamepaddisconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(manager.isConnected(0)).toBe(false);
      expect(manager.getConnectedCount()).toBe(0);
    });

    it("should handle multiple gamepad connections", () => {
      const gamepad1 = new MockGamepad(0);
      const gamepad2 = new MockGamepad(1);

      let event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: gamepad1 });
      window.dispatchEvent(event);

      event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: gamepad2 });
      window.dispatchEvent(event);

      expect(manager.getConnectedCount()).toBe(2);
      expect(manager.isConnected(0)).toBe(true);
      expect(manager.isConnected(1)).toBe(true);
    });

    it("should call connected callback when gamepad connects", () => {
      const callback = vi.fn();
      manager.onConnected(callback);

      const mockGamepad = new MockGamepad(0);
      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });

      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(mockGamepad);
    });

    it("should call disconnected callback when gamepad disconnects", () => {
      const callback = vi.fn();
      manager.onDisconnected(callback);

      const mockGamepad = new MockGamepad(0);

      // Connect first
      let event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      // Now disconnect
      event = new Event("gamepaddisconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(mockGamepad);
    });
  });

  describe("button input", () => {
    beforeEach(() => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);
    });

    it("should detect button press", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(0, true);

      manager.update();

      expect(manager.isPressed(0, 0)).toBe(true);
      expect(manager.justPressed(0, 0)).toBe(true);
    });

    it("should detect button release", () => {
      const gamepad = mockGamepads[0] as MockGamepad;

      // Press button
      gamepad.setButton(0, true);
      manager.update();

      expect(manager.isPressed(0, 0)).toBe(true);

      // Release button
      gamepad.setButton(0, false);
      manager.update();

      expect(manager.isPressed(0, 0)).toBe(false);
      expect(manager.justReleased(0, 0)).toBe(true);
    });

    it("should clear justPressed after update", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(0, true);

      manager.update();
      expect(manager.justPressed(0, 0)).toBe(true);

      manager.update();
      expect(manager.justPressed(0, 0)).toBe(false);
      expect(manager.isPressed(0, 0)).toBe(true); // Still pressed
    });

    it("should clear justReleased after update", () => {
      const gamepad = mockGamepads[0] as MockGamepad;

      gamepad.setButton(0, true);
      manager.update();

      gamepad.setButton(0, false);
      manager.update();
      expect(manager.justReleased(0, 0)).toBe(true);

      manager.update();
      expect(manager.justReleased(0, 0)).toBe(false);
    });

    it("should return button state with all flags", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(0, true, 0.8);

      manager.update();

      const state = manager.getButton(0, 0);
      expect(state.pressed).toBe(true);
      expect(state.justPressed).toBe(true);
      expect(state.justReleased).toBe(false);
      expect(state.value).toBe(0.8);
    });

    it("should return false for non-existent gamepad", () => {
      expect(manager.isPressed(0, 99)).toBe(false);
      expect(manager.justPressed(0, 99)).toBe(false);
      expect(manager.justReleased(0, 99)).toBe(false);
    });

    it("should return false for invalid button index", () => {
      expect(manager.isPressed(999, 0)).toBe(false);
    });

    it("should track multiple buttons simultaneously", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(0, true);
      gamepad.setButton(1, true);

      manager.update();

      expect(manager.isPressed(0, 0)).toBe(true);
      expect(manager.isPressed(1, 0)).toBe(true);
      expect(manager.isPressed(2, 0)).toBe(false);
    });
  });

  describe("analog stick input", () => {
    beforeEach(() => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);
    });

    it("should read axis values", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(0, 0.5);

      manager.update();

      expect(manager.getAxis(0, 0)).toBe(0.5);
    });

    it("should apply deadzone to small values", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(0, 0.1); // Below default deadzone of 0.15

      manager.update();

      expect(manager.getAxis(0, 0)).toBe(0);
    });

    it("should not apply deadzone to large values", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(0, 0.5); // Above deadzone

      manager.update();

      expect(manager.getAxis(0, 0)).toBe(0.5);
    });

    it("should allow changing deadzone", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(0, 0.2);

      manager.setDeadzone(0.25);
      manager.update();

      expect(manager.getAxis(0, 0)).toBe(0); // Below new deadzone

      manager.setDeadzone(0.1);
      manager.update();

      expect(manager.getAxis(0, 0)).toBe(0.2); // Above new deadzone
    });

    it("should clamp deadzone to 0-1 range", () => {
      manager.setDeadzone(-0.5);
      expect(manager.getDeadzone()).toBe(0);

      manager.setDeadzone(1.5);
      expect(manager.getDeadzone()).toBe(1);
    });

    it("should get left stick as {x, y}", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(0, 0.5);
      gamepad.setAxis(1, -0.3);

      manager.update();

      const stick = manager.getLeftStick(0);
      expect(stick.x).toBe(0.5);
      expect(stick.y).toBe(-0.3);
    });

    it("should get right stick as {x, y}", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setAxis(2, -0.7);
      gamepad.setAxis(3, 0.4);

      manager.update();

      const stick = manager.getRightStick(0);
      expect(stick.x).toBe(-0.7);
      expect(stick.y).toBe(0.4);
    });

    it("should return 0 for non-existent axis", () => {
      expect(manager.getAxis(999, 0)).toBe(0);
    });
  });

  describe("D-pad input", () => {
    beforeEach(() => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);
    });

    it("should detect up direction", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(12, true); // Up

      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(0);
      expect(dpad.y).toBe(-1);
    });

    it("should detect down direction", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(13, true); // Down

      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(0);
      expect(dpad.y).toBe(1);
    });

    it("should detect left direction", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(14, true); // Left

      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(-1);
      expect(dpad.y).toBe(0);
    });

    it("should detect right direction", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(15, true); // Right

      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(1);
      expect(dpad.y).toBe(0);
    });

    it("should handle diagonal input", () => {
      const gamepad = mockGamepads[0] as MockGamepad;
      gamepad.setButton(12, true); // Up
      gamepad.setButton(15, true); // Right

      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(1);
      expect(dpad.y).toBe(-1);
    });

    it("should return {0, 0} when no direction pressed", () => {
      manager.update();

      const dpad = manager.getDPad(0);
      expect(dpad.x).toBe(0);
      expect(dpad.y).toBe(0);
    });
  });

  describe("vibration", () => {
    it("should return false when gamepad has no vibration support", async () => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      const result = await manager.vibrate(100, 0.5, 0.5, 0);
      expect(result).toBe(false);
    });

    it("should vibrate when gamepad supports it", async () => {
      const mockActuator: GamepadHapticActuator = {
        type: "dual-rumble",
        playEffect: vi.fn().mockResolvedValue("complete"),
      };

      const mockGamepad = new MockGamepad(0, {
        vibrationActuator: mockActuator,
      });
      // Set vibrationActuator property
      Object.defineProperty(mockGamepad, "vibrationActuator", {
        value: mockActuator,
        writable: true,
        configurable: true,
      });
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      manager.update(); // Update to register the gamepad with vibration actuator

      const result = await manager.vibrate(200, 0.7, 0.3, 0);
      expect(result).toBe(true);
      expect(mockActuator.playEffect).toHaveBeenCalledWith("dual-rumble", {
        duration: 200,
        weakMagnitude: 0.7,
        strongMagnitude: 0.3,
      });
    });

    it("should clamp vibration magnitudes to 0-1", async () => {
      const mockActuator: GamepadHapticActuator = {
        type: "dual-rumble",
        playEffect: vi.fn().mockResolvedValue("complete"),
      };

      const mockGamepad = new MockGamepad(0, {
        vibrationActuator: mockActuator,
      });
      Object.defineProperty(mockGamepad, "vibrationActuator", {
        value: mockActuator,
        writable: true,
        configurable: true,
      });
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      manager.update();

      await manager.vibrate(100, 1.5, -0.5, 0);
      expect(mockActuator.playEffect).toHaveBeenCalledWith("dual-rumble", {
        duration: 100,
        weakMagnitude: 1,
        strongMagnitude: 0,
      });
    });

    it("should use default vibration parameters", async () => {
      const mockActuator: GamepadHapticActuator = {
        type: "dual-rumble",
        playEffect: vi.fn().mockResolvedValue("complete"),
      };

      const mockGamepad = new MockGamepad(0, {
        vibrationActuator: mockActuator,
      });
      Object.defineProperty(mockGamepad, "vibrationActuator", {
        value: mockActuator,
        writable: true,
        configurable: true,
      });
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      manager.update();

      await manager.vibrate();
      expect(mockActuator.playEffect).toHaveBeenCalledWith("dual-rumble", {
        duration: 200,
        weakMagnitude: 0.5,
        strongMagnitude: 0.5,
      });
    });
  });

  describe("gamepad retrieval", () => {
    it("should get gamepad by index", () => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      const retrieved = manager.getGamepad(0);
      expect(retrieved).toBeDefined();
      expect(retrieved?.index).toBe(0);
    });

    it("should return null for non-existent gamepad", () => {
      expect(manager.getGamepad(0)).toBeNull();
    });

    it("should get all connected gamepads", () => {
      const gamepad1 = new MockGamepad(0);
      const gamepad2 = new MockGamepad(1);
      mockGamepads[0] = gamepad1;
      mockGamepads[1] = gamepad2;

      let event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: gamepad1 });
      window.dispatchEvent(event);

      event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: gamepad2 });
      window.dispatchEvent(event);

      const gamepads = manager.getGamepads();
      expect(gamepads).toHaveLength(2);
    });
  });

  describe("callback management", () => {
    it("should remove connected callback", () => {
      const callback = vi.fn();
      manager.onConnected(callback);
      manager.removeCallback(callback, "connected");

      const mockGamepad = new MockGamepad(0);
      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should remove disconnected callback", () => {
      const callback = vi.fn();
      manager.onDisconnected(callback);
      manager.removeCallback(callback, "disconnected");

      const mockGamepad = new MockGamepad(0);

      // Connect first
      let event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      // Disconnect
      event = new Event("gamepaddisconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should cleanup on destroy", () => {
      const mockGamepad = new MockGamepad(0);
      mockGamepads[0] = mockGamepad;

      const event = new Event("gamepadconnected") as GamepadEvent;
      Object.defineProperty(event, "gamepad", { value: mockGamepad });
      window.dispatchEvent(event);

      expect(manager.getConnectedCount()).toBe(1);

      manager.destroy();

      expect(manager.getConnectedCount()).toBe(0);
      expect(manager.getGamepads()).toHaveLength(0);
    });
  });
});
