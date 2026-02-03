/**
 * Game loop utility with fixed timestep and delta time support
 */

export interface GameLoopOptions {
  /** Target frames per second (default: 60) */
  fps?: number;
  /** Maximum number of update calls per frame (prevents spiral of death) */
  maxFrameSkip?: number;
}

export type UpdateCallback = (delta: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private targetFPS: number;
  private timestep: number;
  private maxFrameSkip: number;
  private running = false;
  private paused = false;

  private updateCallback: UpdateCallback;
  private renderCallback?: RenderCallback;

  private lastTime = 0;
  private accumulator = 0;
  private elapsedTime = 0;

  private frameCount = 0;
  private lastFPSUpdate = 0;
  private actualFPS = 0;

  private rafId = 0;

  /**
   * Create a new game loop
   * @param update - Update callback (called with delta time in ms)
   * @param render - Optional render callback
   * @param options - Game loop options
   */
  constructor(
    update: UpdateCallback,
    render?: RenderCallback,
    options: GameLoopOptions = {},
  ) {
    this.updateCallback = update;
    this.renderCallback = render;

    this.targetFPS = options.fps ?? 60;
    this.timestep = 1000 / this.targetFPS;
    this.maxFrameSkip = options.maxFrameSkip ?? 10;
  }

  /**
   * Internal game loop function
   */
  private loop = (currentTime: number): void => {
    if (!this.running) return;

    // Calculate delta time
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.paused) {
      // Accumulate time
      this.accumulator += delta;
      this.elapsedTime += delta;

      // Fixed timestep update
      let updateCount = 0;
      while (
        this.accumulator >= this.timestep &&
        updateCount < this.maxFrameSkip
      ) {
        this.updateCallback(this.timestep);
        this.accumulator -= this.timestep;
        updateCount++;
      }

      // Render
      if (this.renderCallback) {
        this.renderCallback();
      }

      // Calculate FPS
      this.frameCount++;
      if (currentTime - this.lastFPSUpdate >= 1000) {
        this.actualFPS = this.frameCount;
        this.frameCount = 0;
        this.lastFPSUpdate = currentTime;
      }
    }

    // Continue loop
    this.rafId = requestAnimationFrame(this.loop);
  };

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.lastFPSUpdate = this.lastTime;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (!this.running) return;

    this.running = false;
    this.paused = false;
    cancelAnimationFrame(this.rafId);

    // Reset state
    this.accumulator = 0;
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.actualFPS = 0;
  }

  /**
   * Pause the game loop (stops update/render but keeps running)
   */
  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
  }

  /**
   * Resume the game loop
   */
  resume(): void {
    if (!this.paused) return;

    this.paused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
  }

  /**
   * Check if game loop is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Check if game loop is paused
   */
  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Get target FPS
   */
  getFPS(): number {
    return this.targetFPS;
  }

  /**
   * Get actual FPS (calculated over last second)
   */
  getActualFPS(): number {
    return this.actualFPS;
  }

  /**
   * Set target FPS
   */
  setFPS(fps: number): void {
    this.targetFPS = fps;
    this.timestep = 1000 / fps;
  }

  /**
   * Get fixed timestep in milliseconds
   */
  getTimestep(): number {
    return this.timestep;
  }

  /**
   * Get total elapsed time in milliseconds (excluding paused time)
   */
  getElapsedTime(): number {
    return this.elapsedTime;
  }
}
