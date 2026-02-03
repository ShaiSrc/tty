/**
 * Gamepad/Controller input manager using the native Gamepad API
 */

export type GamepadCallback = (gamepad: Gamepad) => void;

export interface GamepadButtonState {
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
  value: number;
}

export interface GamepadAxisState {
  x: number;
  y: number;
}

export class GamepadManager {
  private gamepads: Map<number, Gamepad> = new Map();
  private previousButtonStates: Map<number, boolean[]> = new Map();
  private justPressedButtons: Map<number, Set<number>> = new Map();
  private justReleasedButtons: Map<number, Set<number>> = new Map();
  private connectedCallbacks: GamepadCallback[] = [];
  private disconnectedCallbacks: GamepadCallback[] = [];
  private deadzone: number = 0.15;
  private handleConnected: (e: Event) => void;
  private handleDisconnected: (e: Event) => void;

  /**
   * Create a new gamepad manager
   * @param options - Configuration options
   */
  constructor(options: { deadzone?: number } = {}) {
    this.deadzone = options.deadzone ?? 0.15;

    // Bind event handlers
    this.handleConnected = this.onGamepadConnected.bind(this);
    this.handleDisconnected = this.onGamepadDisconnected.bind(this);

    // Attach listeners
    window.addEventListener("gamepadconnected", this.handleConnected);
    window.addEventListener("gamepaddisconnected", this.handleDisconnected);
  }

  /**
   * Handle gamepad connection
   */
  private onGamepadConnected(event: Event): void {
    const gamepadEvent = event as GamepadEvent;
    const gamepad = gamepadEvent.gamepad;

    this.gamepads.set(gamepad.index, gamepad);
    this.previousButtonStates.set(
      gamepad.index,
      new Array(gamepad.buttons.length).fill(false),
    );
    this.justPressedButtons.set(gamepad.index, new Set());
    this.justReleasedButtons.set(gamepad.index, new Set());

    // Call registered callbacks
    this.connectedCallbacks.forEach((cb) => cb(gamepad));
  }

  /**
   * Handle gamepad disconnection
   */
  private onGamepadDisconnected(event: Event): void {
    const gamepadEvent = event as GamepadEvent;
    const gamepad = gamepadEvent.gamepad;

    this.gamepads.delete(gamepad.index);
    this.previousButtonStates.delete(gamepad.index);
    this.justPressedButtons.delete(gamepad.index);
    this.justReleasedButtons.delete(gamepad.index);

    // Call registered callbacks
    this.disconnectedCallbacks.forEach((cb) => cb(gamepad));
  }

  /**
   * Poll gamepads and update state (call once per frame before checking inputs)
   */
  update(): void {
    // Clear just pressed/released states
    this.justPressedButtons.forEach((set) => set.clear());
    this.justReleasedButtons.forEach((set) => set.clear());

    // Poll all connected gamepads
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      // Update our stored gamepad state
      this.gamepads.set(gamepad.index, gamepad);

      // Initialize previous state if needed
      if (!this.previousButtonStates.has(gamepad.index)) {
        this.previousButtonStates.set(
          gamepad.index,
          new Array(gamepad.buttons.length).fill(false),
        );
        this.justPressedButtons.set(gamepad.index, new Set());
        this.justReleasedButtons.set(gamepad.index, new Set());
      }

      const previousStates = this.previousButtonStates.get(gamepad.index)!;
      const justPressed = this.justPressedButtons.get(gamepad.index)!;
      const justReleased = this.justReleasedButtons.get(gamepad.index)!;

      // Check each button for state changes
      for (let btnIndex = 0; btnIndex < gamepad.buttons.length; btnIndex++) {
        const button = gamepad.buttons[btnIndex];
        const wasPressed = previousStates[btnIndex];
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          justPressed.add(btnIndex);
        } else if (!isPressed && wasPressed) {
          justReleased.add(btnIndex);
        }

        previousStates[btnIndex] = isPressed;
      }
    }
  }

  /**
   * Get a gamepad by index (0-3)
   */
  getGamepad(index: number = 0): Gamepad | null {
    return this.gamepads.get(index) ?? null;
  }

  /**
   * Get all connected gamepads
   */
  getGamepads(): Gamepad[] {
    return Array.from(this.gamepads.values());
  }

  /**
   * Check if a gamepad is connected
   */
  isConnected(index: number = 0): boolean {
    return this.gamepads.has(index);
  }

  /**
   * Get the number of connected gamepads
   */
  getConnectedCount(): number {
    return this.gamepads.size;
  }

  /**
   * Check if a button is currently pressed
   */
  isPressed(buttonIndex: number, gamepadIndex: number = 0): boolean {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad || buttonIndex >= gamepad.buttons.length) return false;
    return gamepad.buttons[buttonIndex].pressed;
  }

  /**
   * Check if a button was just pressed this frame
   */
  justPressed(buttonIndex: number, gamepadIndex: number = 0): boolean {
    const justPressed = this.justPressedButtons.get(gamepadIndex);
    return justPressed?.has(buttonIndex) ?? false;
  }

  /**
   * Check if a button was just released this frame
   */
  justReleased(buttonIndex: number, gamepadIndex: number = 0): boolean {
    const justReleased = this.justReleasedButtons.get(gamepadIndex);
    return justReleased?.has(buttonIndex) ?? false;
  }

  /**
   * Get button state with all flags
   */
  getButton(buttonIndex: number, gamepadIndex: number = 0): GamepadButtonState {
    const gamepad = this.gamepads.get(gamepadIndex);

    if (!gamepad || buttonIndex >= gamepad.buttons.length) {
      return {
        pressed: false,
        justPressed: false,
        justReleased: false,
        value: 0,
      };
    }

    return {
      pressed: this.isPressed(buttonIndex, gamepadIndex),
      justPressed: this.justPressed(buttonIndex, gamepadIndex),
      justReleased: this.justReleased(buttonIndex, gamepadIndex),
      value: gamepad.buttons[buttonIndex].value,
    };
  }

  /**
   * Get axis value with deadzone applied
   */
  getAxis(axisIndex: number, gamepadIndex: number = 0): number {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad || axisIndex >= gamepad.axes.length) return 0;

    const value = gamepad.axes[axisIndex];

    // Apply deadzone
    if (Math.abs(value) < this.deadzone) return 0;

    return value;
  }

  /**
   * Get left stick as {x, y}
   */
  getLeftStick(gamepadIndex: number = 0): GamepadAxisState {
    return {
      x: this.getAxis(0, gamepadIndex),
      y: this.getAxis(1, gamepadIndex),
    };
  }

  /**
   * Get right stick as {x, y}
   */
  getRightStick(gamepadIndex: number = 0): GamepadAxisState {
    return {
      x: this.getAxis(2, gamepadIndex),
      y: this.getAxis(3, gamepadIndex),
    };
  }

  /**
   * Get D-pad direction as {x, y} (-1, 0, 1)
   * Uses buttons 12-15 (standard mapping)
   */
  getDPad(gamepadIndex: number = 0): GamepadAxisState {
    let x = 0;
    let y = 0;

    if (this.isPressed(14, gamepadIndex)) x = -1; // Left
    if (this.isPressed(15, gamepadIndex)) x = 1; // Right
    if (this.isPressed(12, gamepadIndex)) y = -1; // Up
    if (this.isPressed(13, gamepadIndex)) y = 1; // Down

    return { x, y };
  }

  /**
   * Set the deadzone for analog sticks (0-1)
   */
  setDeadzone(deadzone: number): void {
    this.deadzone = Math.max(0, Math.min(1, deadzone));
  }

  /**
   * Get current deadzone value
   */
  getDeadzone(): number {
    return this.deadzone;
  }

  /**
   * Vibrate/rumble the gamepad
   * @param duration - Duration in milliseconds
   * @param weakMagnitude - Weak motor magnitude (0-1)
   * @param strongMagnitude - Strong motor magnitude (0-1)
   * @param gamepadIndex - Gamepad index
   */
  async vibrate(
    duration: number = 200,
    weakMagnitude: number = 0.5,
    strongMagnitude: number = 0.5,
    gamepadIndex: number = 0,
  ): Promise<boolean> {
    const gamepad = this.gamepads.get(gamepadIndex);

    if (!gamepad?.vibrationActuator) {
      return false;
    }

    try {
      await gamepad.vibrationActuator.playEffect("dual-rumble", {
        duration,
        weakMagnitude: Math.max(0, Math.min(1, weakMagnitude)),
        strongMagnitude: Math.max(0, Math.min(1, strongMagnitude)),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Register a callback for gamepad connection
   */
  onConnected(callback: GamepadCallback): void {
    this.connectedCallbacks.push(callback);
  }

  /**
   * Register a callback for gamepad disconnection
   */
  onDisconnected(callback: GamepadCallback): void {
    this.disconnectedCallbacks.push(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(
    callback: GamepadCallback,
    type: "connected" | "disconnected" = "connected",
  ): void {
    const callbacks =
      type === "connected"
        ? this.connectedCallbacks
        : this.disconnectedCallbacks;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Remove event listeners and cleanup
   */
  destroy(): void {
    window.removeEventListener("gamepadconnected", this.handleConnected);
    window.removeEventListener("gamepaddisconnected", this.handleDisconnected);

    this.gamepads.clear();
    this.previousButtonStates.clear();
    this.justPressedButtons.clear();
    this.justReleasedButtons.clear();
    this.connectedCallbacks = [];
    this.disconnectedCallbacks = [];
  }
}
