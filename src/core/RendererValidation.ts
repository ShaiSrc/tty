/**
 * Validation helpers for bounds checking
 */

export interface ValidationContext {
  width: number;
  height: number;
}

export interface ValidationHelpers {
  cell: (x: number, y: number) => boolean;
  box: (x: number, y: number, width: number, height: number) => boolean;
  text: (x: number, y: number, text: string) => boolean;
  line: (x1: number, y1: number, x2: number, y2: number) => boolean;
}

/**
 * Check if position is within bounds
 */
function isInBounds(ctx: ValidationContext, x: number, y: number): boolean {
  return x >= 0 && x < ctx.width && y >= 0 && y < ctx.height;
}

/**
 * Create validation helpers object
 */
export function createValidationHelpers(
  ctx: ValidationContext,
): ValidationHelpers {
  return {
    /**
     * Check if a cell position is within bounds
     */
    cell: (x: number, y: number): boolean => {
      return isInBounds(ctx, x, y);
    },

    /**
     * Check if a box would fit within bounds
     */
    box: (x: number, y: number, width: number, height: number): boolean => {
      return (
        isInBounds(ctx, x, y) && isInBounds(ctx, x + width - 1, y + height - 1)
      );
    },

    /**
     * Check if text would fit within bounds
     */
    text: (x: number, y: number, text: string): boolean => {
      if (text.length === 0) return isInBounds(ctx, x, y);
      return isInBounds(ctx, x, y) && isInBounds(ctx, x + text.length - 1, y);
    },

    /**
     * Check if a line would fit within bounds
     */
    line: (x1: number, y1: number, x2: number, y2: number): boolean => {
      return isInBounds(ctx, x1, y1) && isInBounds(ctx, x2, y2);
    },
  };
}
