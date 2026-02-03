/**
 * Box drawing helper functions and character sets
 */

import type { BoxStyle, BorderChars } from "../types/types";

/**
 * Get border characters for a given style
 */
export function getBorderChars(
  style: BoxStyle | BorderChars = "single",
): BorderChars {
  if (typeof style === "object") {
    return style;
  }

  const styles: Record<BoxStyle, BorderChars> = {
    single: {
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      horizontal: "─",
      vertical: "│",
    },
    double: {
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      vertical: "║",
    },
    rounded: {
      topLeft: "╭",
      topRight: "╮",
      bottomLeft: "╰",
      bottomRight: "╯",
      horizontal: "─",
      vertical: "│",
    },
    heavy: {
      topLeft: "┏",
      topRight: "┓",
      bottomLeft: "┗",
      bottomRight: "┛",
      horizontal: "━",
      vertical: "┃",
    },
    ascii: {
      topLeft: "+",
      topRight: "+",
      bottomLeft: "+",
      bottomRight: "+",
      horizontal: "-",
      vertical: "|",
    },
  };

  return styles[style];
}
