/**
 * Keyboard input manager for handling key events and state
 */

export type KeyCallback = (event: KeyboardEvent) => void;

export interface DirectionVector {
  x: number;
  y: number;
}

export interface DirectionOptions {
  normalize?: boolean;
}

export interface WaitForKeyOptions {
  timeout?: number;
  signal?: AbortSignal;
}

export class KeyboardManager {
  private element: HTMLElement;
  private pressedKeys: Set<string> = new Set();
  private justPressedKeys: Set<string> = new Set();
  private justReleasedKeys: Set<string> = new Set();
  private keyDownCallbacks: Map<string, KeyCallback[]> = new Map();
  private keyUpCallbacks: Map<string, KeyCallback[]> = new Map();
  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e: KeyboardEvent) => void;
  private static readonly keyAliases: Record<string, string> = {
    Space: " ",
    Spacebar: " ",
    Esc: "Escape",
  };

  /**
   * Create a new keyboard manager
   * @param element - Element to attach listeners to (default: window)
   */
  constructor(
    element: HTMLElement | Window = window as unknown as HTMLElement,
  ) {
    this.element = element as HTMLElement;

    // Bind event handlers
    this.handleKeyDown = this.onKeyDownEvent.bind(this);
    this.handleKeyUp = this.onKeyUpEvent.bind(this);

    // Attach listeners
    this.element.addEventListener(
      "keydown",
      this.handleKeyDown as EventListener,
    );
    this.element.addEventListener("keyup", this.handleKeyUp as EventListener);
  }

  /**
   * Internal keydown handler
   */
  private onKeyDownEvent(event: KeyboardEvent): void {
    const key = this.normalizeKeyName(event.key);

    // Track just pressed (only if not already pressed)
    if (!this.pressedKeys.has(key)) {
      this.justPressedKeys.add(key);
    }

    this.pressedKeys.add(key);

    // Call registered callbacks
    const callbacks = this.keyDownCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }

  /**
   * Internal keyup handler
   */
  private onKeyUpEvent(event: KeyboardEvent): void {
    const key = this.normalizeKeyName(event.key);

    this.pressedKeys.delete(key);
    this.justReleasedKeys.add(key);

    // Call registered callbacks
    const callbacks = this.keyUpCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }

  /**
   * Check if a key is currently pressed
   */
  isPressed(key: string): boolean {
    return this.pressedKeys.has(this.normalizeKeyName(key));
  }

  /**
   * Alias for isPressed - check if a key is currently down
   * @param key - Key to check
   * @returns true if the key is currently pressed
   *
   * @example
   * ```ts
   * if (keyboard.isDown('Space')) {
   *   player.jump()
   * }
   * ```
   */
  isDown(key: string): boolean {
    return this.isPressed(key);
  }

  /**
   * Check if a key was just pressed this frame
   */
  justPressed(key: string): boolean {
    return this.justPressedKeys.has(this.normalizeKeyName(key));
  }

  /**
   * Check if a key was just released this frame
   */
  justReleased(key: string): boolean {
    return this.justReleasedKeys.has(this.normalizeKeyName(key));
  }

  /**
   * Register a callback for key down events
   * @param key - Single key or array of keys to bind
   * @param callback - Callback function to execute
   *
   * @example
   * ```ts
   * // Single key
   * keyboard.onKeyDown('Enter', () => console.log('Enter pressed'))
   *
   * // Multiple keys (alternative bindings)
   * keyboard.onKeyDown(['ArrowUp', 'w', 'W'], () => player.moveUp())
   * ```
   */
  onKeyDown(key: string | string[], callback: KeyCallback): void {
    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => {
      const normalizedKey = this.normalizeKeyName(k);
      if (!this.keyDownCallbacks.has(normalizedKey)) {
        this.keyDownCallbacks.set(normalizedKey, []);
      }
      this.keyDownCallbacks.get(normalizedKey)!.push(callback);
    });
  }

  /**
   * Register a callback for key up events
   * @param key - Single key or array of keys to bind
   * @param callback - Callback function to execute
   *
   * @example
   * ```ts
   * // Single key
   * keyboard.onKeyUp('Space', () => player.stopJumping())
   *
   * // Multiple keys (alternative bindings)
   * keyboard.onKeyUp(['ArrowLeft', 'a', 'A'], () => player.stopMovingLeft())
   * ```
   */
  onKeyUp(key: string | string[], callback: KeyCallback): void {
    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => {
      const normalizedKey = this.normalizeKeyName(k);
      if (!this.keyUpCallbacks.has(normalizedKey)) {
        this.keyUpCallbacks.set(normalizedKey, []);
      }
      this.keyUpCallbacks.get(normalizedKey)!.push(callback);
    });
  }

  /**
   * Remove a callback
   */
  removeCallback(
    key: string,
    callback: KeyCallback,
    type: "keydown" | "keyup" = "keydown",
  ): void {
    const normalizedKey = this.normalizeKeyName(key);
    const callbacks =
      type === "keydown"
        ? this.keyDownCallbacks.get(normalizedKey)
        : this.keyUpCallbacks.get(normalizedKey);

    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Get array of all currently pressed keys
   */
  getPressed(): string[] {
    return Array.from(this.pressedKeys);
  }

  /**
   * Clear just pressed/released states (call once per frame)
   */
  update(): void {
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
  }

  /**
   * Clear all key states
   */
  clear(): void {
    this.pressedKeys.clear();
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
  }

  /**
   * Get direction vector from WASD/Arrow keys
   * @param options - Options for direction calculation
   * @returns Direction vector {x, y} with values -1, 0, or 1 (or normalized)
   *
   * @example
   * ```ts
   * const dir = keyboard.getDirection()
   * if (dir.x !== 0 || dir.y !== 0) {
   *   player.move(dir.x, dir.y)
   * }
   * ```
   */
  getDirection(options: DirectionOptions = {}): DirectionVector {
    const { normalize = false } = options;

    // Helper to check if a key is pressed (case-insensitive for letters)
    const checkKey = (key: string, altKey?: string): boolean => {
      return (
        this.isPressed(key) ||
        this.isPressed(key.toUpperCase()) ||
        (altKey ? this.isPressed(altKey) : false)
      );
    };

    // Calculate direction (WASD takes priority over arrows)
    const x = checkKey("a")
      ? -1
      : checkKey("d")
        ? 1
        : checkKey("ArrowLeft")
          ? -1
          : checkKey("ArrowRight")
            ? 1
            : 0;

    const y = checkKey("w")
      ? -1
      : checkKey("s")
        ? 1
        : checkKey("ArrowUp")
          ? -1
          : checkKey("ArrowDown")
            ? 1
            : 0;

    // Normalize diagonal movement if requested
    if (normalize && x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      return { x: x / length, y: y / length };
    }

    return { x, y };
  }

  /**
   * Wait for a specific key press (promise-based)
   * @param key - Key or array of keys to wait for (omit for any key)
   * @param options - Timeout and abort signal options
   * @returns Promise that resolves with the pressed key
   *
   * @example
   * ```ts
   * // Wait for Enter
   * const key = await keyboard.waitForKey('Enter')
   *
   * // Wait for Y or N with timeout
   * try {
   *   const key = await keyboard.waitForKey(['y', 'n'], { timeout: 5000 })
   *   if (key === 'y') console.log('Yes!')
   * } catch {
   *   console.log('Timeout!')
   * }
   * ```
   */
  waitForKey(
    key?: string | string[],
    options: WaitForKeyOptions = {},
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const keys = key
        ? (Array.isArray(key) ? key : [key]).map((k) =>
            this.normalizeKeyName(k),
          )
        : null;

      let timeoutId: number | undefined;
      let listener: KeyCallback | undefined;

      const cleanup = () => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        if (listener && keys) {
          keys.forEach((k) => this.removeCallback(k, listener!, "keydown"));
        }
        if (options.signal) {
          options.signal.removeEventListener("abort", abortHandler);
        }
      };

      const abortHandler = () => {
        cleanup();
        reject(new Error("Key wait cancelled"));
      };

      listener = (event: KeyboardEvent) => {
        const pressedKey = this.normalizeKeyName(event.key);

        // Check if this is a key we're waiting for
        if (!keys || keys.includes(pressedKey)) {
          cleanup();
          resolve(pressedKey);
        }
      };

      // Register listener for each key (or use a polling approach for "any key")
      if (keys) {
        keys.forEach((k) => this.onKeyDown(k, listener!));
      } else {
        // For "any key", we need to check on each update
        const checkAnyKey = () => {
          const pressed = this.getPressed();
          if (pressed.length > 0) {
            cleanup();
            resolve(pressed[0]);
          } else {
            // Keep checking
            requestAnimationFrame(checkAnyKey);
          }
        };
        checkAnyKey();
      }

      // Setup timeout
      if (options.timeout) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error("Timeout waiting for key"));
        }, options.timeout);
      }

      // Setup abort signal
      if (options.signal) {
        if (options.signal.aborted) {
          cleanup();
          reject(new Error("Key wait cancelled"));
          return;
        }
        options.signal.addEventListener("abort", abortHandler);
      }
    });
  }

  /**
   * Remove event listeners and cleanup
   */
  destroy(): void {
    this.element.removeEventListener(
      "keydown",
      this.handleKeyDown as EventListener,
    );
    this.element.removeEventListener(
      "keyup",
      this.handleKeyUp as EventListener,
    );
    this.clear();
    this.keyDownCallbacks.clear();
    this.keyUpCallbacks.clear();
  }

  /**
   * Normalize key names for common aliases
   */
  private normalizeKeyName(key: string): string {
    return KeyboardManager.keyAliases[key] ?? key;
  }
}
