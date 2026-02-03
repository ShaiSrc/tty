import { describe, it, expect } from "vitest";
import type { Point, Rect, Size } from "../../../src/types/types";

describe("Common Geometry Types", () => {
  describe("Point", () => {
    it("should define a 2D point", () => {
      const point: Point = { x: 10, y: 20 };

      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });

    it("should be usable for positions", () => {
      const playerPos: Point = { x: 5, y: 5 };
      const enemyPos: Point = { x: 10, y: 10 };

      expect(playerPos.x).toBeLessThan(enemyPos.x);
      expect(playerPos.y).toBeLessThan(enemyPos.y);
    });

    it("should be extendable", () => {
      interface Entity extends Point {
        health: number;
      }

      const entity: Entity = { x: 5, y: 5, health: 100 };

      expect(entity.x).toBe(5);
      expect(entity.y).toBe(5);
      expect(entity.health).toBe(100);
    });
  });

  describe("Rect", () => {
    it("should define a rectangle", () => {
      const rect: Rect = { x: 10, y: 20, width: 30, height: 40 };

      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(30);
      expect(rect.height).toBe(40);
    });

    it("should be usable for bounds", () => {
      const bounds: Rect = { x: 5, y: 5, width: 20, height: 10 };

      // Calculate right and bottom edges
      const right = bounds.x + bounds.width;
      const bottom = bounds.y + bounds.height;

      expect(right).toBe(25);
      expect(bottom).toBe(15);
    });

    it("should be extendable for UI elements", () => {
      interface Panel extends Rect {
        title: string;
        visible: boolean;
      }

      const panel: Panel = {
        x: 10,
        y: 10,
        width: 30,
        height: 20,
        title: "Inventory",
        visible: true,
      };

      expect(panel.x).toBe(10);
      expect(panel.title).toBe("Inventory");
      expect(panel.visible).toBe(true);
    });
  });

  describe("Size", () => {
    it("should define dimensions", () => {
      const size: Size = { width: 80, height: 24 };

      expect(size.width).toBe(80);
      expect(size.height).toBe(24);
    });

    it("should be usable for grid sizes", () => {
      const gridSize: Size = { width: 100, height: 50 };
      const cellSize: Size = { width: 8, height: 16 };

      // Calculate total pixel size
      const pixelWidth = gridSize.width * cellSize.width;
      const pixelHeight = gridSize.height * cellSize.height;

      expect(pixelWidth).toBe(800);
      expect(pixelHeight).toBe(800);
    });
  });

  describe("Type composition", () => {
    it("should allow combining types for game entities", () => {
      interface GameObject extends Point {
        size: Size;
        velocity: Point;
      }

      const player: GameObject = {
        x: 10,
        y: 10,
        size: { width: 1, height: 1 },
        velocity: { x: 1, y: 0 },
      };

      expect(player.x).toBe(10);
      expect(player.size.width).toBe(1);
      expect(player.velocity.x).toBe(1);
    });

    it("should work with Rect for collision detection", () => {
      function intersects(a: Rect, b: Rect): boolean {
        return (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        );
      }

      const player: Rect = { x: 10, y: 10, width: 2, height: 2 };
      const enemy: Rect = { x: 11, y: 11, width: 2, height: 2 };
      const farAway: Rect = { x: 50, y: 50, width: 2, height: 2 };

      expect(intersects(player, enemy)).toBe(true);
      expect(intersects(player, farAway)).toBe(false);
    });
  });
});
