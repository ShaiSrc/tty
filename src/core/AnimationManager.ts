/**
 * AnimationManager
 * Manages animations for the KISS ASCII Renderer
 */

import type {
  AnimateOptions,
  FlashOptions,
  PulseOptions,
  EasingFunction,
  Color,
} from "../types/types";
import type { Renderer } from "./Renderer";
import { parseColor } from "../drawing/colors";

/**
 * Internal animation state
 */
interface Animation {
  id: number;
  type: "custom" | "flash" | "pulse";
  startTime: number;
  duration: number;
  delay: number;
  loop: boolean;
  easing: EasingFunction;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  active: boolean;
  completed: boolean;
}

/**
 * Flash animation state
 */
interface FlashAnimation extends Animation {
  type: "flash";
  x: number;
  y: number;
  char: string;
  originalChar: string;
  fg?: Color;
  bg?: Color;
  count: number;
  currentCount: number;
  flashDuration: number;
}

/**
 * Pulse animation state
 */
interface PulseAnimation extends Animation {
  type: "pulse";
  x: number;
  y: number;
  originalFg?: Color;
  fg?: Color;
  bg?: Color;
  minIntensity: number;
  maxIntensity: number;
}

/**
 * Custom animation state
 */
interface CustomAnimation extends Animation {
  type: "custom";
}

type AnyAnimation = CustomAnimation | FlashAnimation | PulseAnimation;

/**
 * AnimationManager
 * Provides simple animation capabilities for ASCII rendering
 */
export class AnimationManager {
  private animations: Map<number, AnyAnimation> = new Map();
  private nextId = 1;
  private renderer?: Renderer;

  /**
   * Set the renderer instance for animations that need to modify cells
   * @param renderer - The renderer instance
   */
  setRenderer(renderer: Renderer): void {
    this.renderer = renderer;
  }

  /**
   * Create a custom animation
   *
   * @param options - Animation options
   * @returns Animation ID that can be used to stop the animation
   *
   * @example
   * ```ts
   * const animId = animations.animate({
   *   duration: 1000,
   *   easing: 'easeInOut',
   *   onUpdate: (progress) => {
   *     const x = Math.floor(10 + progress * 50);
   *     renderer.setChar(x, 10, '@', 'cyan');
   *   },
   *   onComplete: () => console.log('Animation done!')
   * });
   * ```
   */
  animate(options: AnimateOptions = {}): number {
    const {
      duration = 1000,
      easing = "linear",
      onUpdate,
      onComplete,
      loop = false,
      delay = 0,
    } = options;

    const id = this.nextId++;
    const animation: CustomAnimation = {
      id,
      type: "custom",
      startTime: Date.now() + delay,
      duration,
      delay,
      loop,
      easing,
      onUpdate,
      onComplete,
      active: delay === 0,
      completed: false,
    };

    this.animations.set(id, animation);
    return id;
  }

  /**
   * Flash a character at a position
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param options - Flash options
   * @returns Animation ID that can be used to stop the animation
   *
   * @example
   * ```ts
   * // Flash '@' at position (10, 5) in red, 3 times
   * animations.flash(10, 5, {
   *   char: '@',
   *   fg: 'red',
   *   count: 3,
   *   duration: 500
   * });
   * ```
   */
  flash(x: number, y: number, options: FlashOptions = {}): number {
    if (!this.renderer) {
      throw new Error("Renderer not set. Call setRenderer() first.");
    }

    const {
      duration = 500,
      count = 3,
      char = "*",
      fg,
      bg,
      onComplete,
    } = options;

    // Get original character
    const cell = this.renderer.getCell(x, y);
    const originalChar = cell ? cell.char : " ";

    const id = this.nextId++;
    const animation: FlashAnimation = {
      id,
      type: "flash",
      x,
      y,
      char,
      originalChar,
      fg,
      bg,
      count,
      currentCount: 0,
      flashDuration: duration / (count * 2), // Divide by 2 for on/off cycles
      startTime: Date.now(),
      duration,
      delay: 0,
      loop: false,
      easing: "linear",
      onComplete,
      active: true,
      completed: false,
    };

    this.animations.set(id, animation);
    return id;
  }

  /**
   * Create a pulsing animation at a position
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param options - Pulse options
   * @returns Animation ID that can be used to stop the animation
   *
   * @example
   * ```ts
   * // Pulse a character between dim and bright
   * animations.pulse(20, 10, {
   *   duration: 1000,
   *   minIntensity: 0.3,
   *   maxIntensity: 1.0,
   *   fg: 'yellow',
   *   loop: true
   * });
   * ```
   */
  pulse(x: number, y: number, options: PulseOptions = {}): number {
    if (!this.renderer) {
      throw new Error("Renderer not set. Call setRenderer() first.");
    }

    const {
      duration = 1000,
      minIntensity = 0.3,
      maxIntensity = 1.0,
      easing = "easeInOut",
      loop = true,
      fg,
      bg,
      onComplete,
    } = options;

    // Store original color if needed
    const cell = this.renderer.getCell(x, y);
    const originalFg = cell?.fg ?? null;

    const id = this.nextId++;
    const animation: PulseAnimation = {
      id,
      type: "pulse",
      x,
      y,
      originalFg,
      fg,
      bg,
      minIntensity,
      maxIntensity,
      startTime: Date.now(),
      duration,
      delay: 0,
      loop,
      easing,
      onComplete,
      active: true,
      completed: false,
    };

    this.animations.set(id, animation);
    return id;
  }

  /**
   * Stop an animation
   * @param id - Animation ID returned from animate/flash/pulse
   */
  stop(id: number): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.active = false;
      this.animations.delete(id);
    }
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    this.animations.clear();
  }

  /**
   * Update all active animations
   * Should be called each frame, typically from the game loop
   *
   * @param currentTime - Current time in milliseconds (defaults to Date.now())
   *
   * @example
   * ```ts
   * gameLoop.update((dt) => {
   *   animations.update();
   * });
   * ```
   */
  update(currentTime: number = Date.now()): void {
    for (const [id, animation] of this.animations.entries()) {
      // Check if animation should start (handle delay)
      if (!animation.active && currentTime >= animation.startTime) {
        animation.active = true;
      }

      if (!animation.active) continue;

      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);

      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.easing);

      // Update based on animation type
      if (animation.type === "custom") {
        this.updateCustomAnimation(animation, easedProgress);
      } else if (animation.type === "flash") {
        this.updateFlashAnimation(animation, currentTime);
      } else if (animation.type === "pulse") {
        this.updatePulseAnimation(animation, easedProgress);
      }

      // Handle completion
      if (progress >= 1.0) {
        if (animation.loop) {
          animation.startTime = currentTime;
        } else {
          animation.completed = true;
          animation.onComplete?.();
          this.animations.delete(id);
        }
      }
    }
  }

  /**
   * Get the number of active animations
   */
  getActiveCount(): number {
    return this.animations.size;
  }

  /**
   * Check if an animation is active
   * @param id - Animation ID
   */
  isActive(id: number): boolean {
    return this.animations.has(id);
  }

  /**
   * Update a custom animation
   */
  private updateCustomAnimation(
    animation: CustomAnimation,
    progress: number,
  ): void {
    animation.onUpdate?.(progress);
  }

  /**
   * Update a flash animation
   */
  private updateFlashAnimation(
    animation: FlashAnimation,
    currentTime: number,
  ): void {
    if (!this.renderer) return;

    const elapsed = currentTime - animation.startTime;
    const cycleTime = elapsed % (animation.flashDuration * 2);
    const isVisible = cycleTime < animation.flashDuration;

    // Determine current flash count
    const totalCycles = Math.floor(elapsed / (animation.flashDuration * 2));
    animation.currentCount = totalCycles;

    // Show flash char or original char
    const char = isVisible ? animation.char : animation.originalChar;
    const fg = isVisible ? animation.fg : undefined;
    const bg = isVisible ? animation.bg : undefined;

    this.renderer.setChar(animation.x, animation.y, char, fg, bg);

    // Check if we've completed all flashes
    if (totalCycles >= animation.count) {
      // Restore original character
      this.renderer.setChar(animation.x, animation.y, animation.originalChar);
    }
  }

  /**
   * Update a pulse animation
   */
  private updatePulseAnimation(
    animation: PulseAnimation,
    progress: number,
  ): void {
    if (!this.renderer) return;

    // Create a ping-pong effect (0 -> 1 -> 0)
    const pingPong = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

    // Calculate intensity
    const intensity =
      animation.minIntensity +
      pingPong * (animation.maxIntensity - animation.minIntensity);

    // Apply intensity to color
    const fg = animation.fg ?? animation.originalFg ?? null;
    const pulsedColor = this.applyIntensity(fg, intensity);

    // Get current character
    const cell = this.renderer.getCell(animation.x, animation.y);
    const char = cell?.char ?? " ";

    this.renderer.setChar(animation.x, animation.y, char, pulsedColor);
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(t: number, easing: EasingFunction): number {
    switch (easing) {
      case "linear":
        return t;
      case "easeIn":
        return t * t;
      case "easeOut":
        return t * (2 - t);
      case "easeInOut":
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case "bounce":
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          const t2 = t - 1.5 / 2.75;
          return 7.5625 * t2 * t2 + 0.75;
        } else if (t < 2.5 / 2.75) {
          const t2 = t - 2.25 / 2.75;
          return 7.5625 * t2 * t2 + 0.9375;
        } else {
          const t2 = t - 2.625 / 2.75;
          return 7.5625 * t2 * t2 + 0.984375;
        }
      case "elastic":
        return t === 0 || t === 1
          ? t
          : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
      default:
        return t;
    }
  }

  /**
   * Apply intensity to a color
   */
  private applyIntensity(color: Color, intensity: number): Color {
    if (!color) return null;

    // Convert any color type to RGB first
    const rgb = parseColor(color);
    if (!rgb) return color;

    // Apply intensity
    return {
      r: Math.floor(rgb.r * intensity),
      g: Math.floor(rgb.g * intensity),
      b: Math.floor(rgb.b * intensity),
    };
  }
}
