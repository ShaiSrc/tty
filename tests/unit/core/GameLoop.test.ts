/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GameLoop } from "../../../src/core/GameLoop";

describe("Game Loop Utility", () => {
  let gameLoop: GameLoop;

  afterEach(() => {
    if (gameLoop) {
      gameLoop.stop();
    }
  });

  describe("initialization", () => {
    it("should create game loop with default 60 FPS", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);

      expect(gameLoop.getFPS()).toBe(60);
      expect(gameLoop.isRunning()).toBe(false);
    });

    it("should create game loop with custom FPS", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render, { fps: 30 });

      expect(gameLoop.getFPS()).toBe(30);
    });

    it("should calculate correct timestep from FPS", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render, { fps: 60 });

      // 1000ms / 60fps = 16.666... ms per frame
      expect(gameLoop.getTimestep()).toBeCloseTo(1000 / 60, 2);
    });
  });

  describe("start and stop", () => {
    it("should start the game loop", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();

      expect(gameLoop.isRunning()).toBe(true);
    });

    it("should stop the game loop", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();
      gameLoop.stop();

      expect(gameLoop.isRunning()).toBe(false);
    });

    it("should not start if already running", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();
      const isRunning1 = gameLoop.isRunning();
      gameLoop.start(); // Try to start again
      const isRunning2 = gameLoop.isRunning();

      expect(isRunning1).toBe(true);
      expect(isRunning2).toBe(true);
    });
  });

  describe("pause and resume", () => {
    it("should pause the game loop", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();
      gameLoop.pause();

      expect(gameLoop.isPaused()).toBe(true);
      expect(gameLoop.isRunning()).toBe(true);
    });

    it("should resume the game loop", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();
      gameLoop.pause();
      gameLoop.resume();

      expect(gameLoop.isPaused()).toBe(false);
    });
  });

  describe("FPS management", () => {
    it("should update FPS setting", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render, { fps: 60 });
      gameLoop.setFPS(30);

      expect(gameLoop.getFPS()).toBe(30);
      expect(gameLoop.getTimestep()).toBeCloseTo(1000 / 30, 2);
    });

    it("should return actual FPS", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render, { fps: 60 });

      // Should start at 0
      expect(gameLoop.getActualFPS()).toBe(0);
    });
  });

  describe("time tracking", () => {
    it("should reset elapsed time on stop", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);
      gameLoop.start();
      gameLoop.stop();

      const elapsed = gameLoop.getElapsedTime();
      expect(elapsed).toBe(0);
    });

    it("should return elapsed time", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render);

      // Before start should be 0
      expect(gameLoop.getElapsedTime()).toBe(0);
    });
  });

  describe("optional render callback", () => {
    it("should work without render callback", () => {
      const update = vi.fn();

      gameLoop = new GameLoop(update);
      gameLoop.start();

      expect(gameLoop.isRunning()).toBe(true);
      // Should not throw
    });
  });

  describe("configuration", () => {
    it("should accept max frame skip option", () => {
      const update = vi.fn();
      const render = vi.fn();

      gameLoop = new GameLoop(update, render, { fps: 60, maxFrameSkip: 5 });

      expect(gameLoop.getFPS()).toBe(60);
    });
  });
});
