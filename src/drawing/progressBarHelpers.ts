/**
 * Helper functions for progress bar rendering
 * Extracted to manage complexity and file size
 */

import type {
  ProgressBarStyle,
  ProgressBarOptions,
  Color,
} from "../types/types";

/**
 * Get fill and empty characters based on style
 */
export function getProgressChars(style?: ProgressBarStyle): {
  fillChar: string;
  emptyChar: string;
} {
  switch (style) {
    case "blocks":
      return { fillChar: "█", emptyChar: " " };
    case "dots":
      return { fillChar: "●", emptyChar: "○" };
    case "arrows":
      return { fillChar: "▶", emptyChar: "▷" };
    default:
      return { fillChar: "█", emptyChar: " " };
  }
}

/**
 * Calculate dimensions and positions for progress bar
 */
export function calculateProgressDimensions(
  x: number,
  y: number,
  length: number,
  progress: number,
  options: ProgressBarOptions,
): {
  startX: number;
  startY: number;
  barLength: number;
  filledLength: number;
  labelOffset: number;
} {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const hasBorder = options.border ?? false;
  const barLength = hasBorder ? length : length;
  const filledLength = Math.floor(barLength * clampedProgress);

  const startX = hasBorder ? x + 1 : x;
  const startY = y;
  const labelOffset = hasBorder ? x + length + 2 : x + length + 1;

  return { startX, startY, barLength, filledLength, labelOffset };
}

/**
 * Format the label text for a progress bar
 */
export function formatProgressLabel(
  progress: number,
  options: ProgressBarOptions,
): string {
  const showPercent = options.showPercent ?? false;
  const customLabel = options.label;

  if (!showPercent && !customLabel) {
    return "";
  }

  const percentage = Math.round(progress * 100);

  if (customLabel && showPercent) {
    return `${customLabel} ${percentage}%`;
  } else if (customLabel) {
    return customLabel;
  } else {
    return `${percentage}%`;
  }
}

/**
 * Draw horizontal progress bar
 */
export function drawHorizontalProgress(
  setChar: (x: number, y: number, char: string, fg?: Color, bg?: Color) => void,
  x: number,
  y: number,
  length: number,
  progress: number,
  options: ProgressBarOptions,
): void {
  const styleChars = getProgressChars(options.style);
  const fillChar = options.fillChar ?? styleChars.fillChar;
  const emptyChar = options.emptyChar ?? styleChars.emptyChar;

  const dims = calculateProgressDimensions(x, y, length, progress, options);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Draw border if enabled
  if (options.border) {
    const borderChars = options.borderChars ?? ["[", "]"];
    setChar(x, y, borderChars[0], options.fillFg, options.fillBg);
    setChar(x + length + 1, y, borderChars[1], options.fillFg, options.fillBg);
  }

  // Draw filled portion
  for (let i = 0; i < dims.filledLength; i++) {
    setChar(
      dims.startX + i,
      dims.startY,
      fillChar,
      options.fillFg,
      options.fillBg,
    );
  }

  // Draw empty portion
  for (let i = dims.filledLength; i < dims.barLength; i++) {
    setChar(
      dims.startX + i,
      dims.startY,
      emptyChar,
      options.emptyFg,
      options.emptyBg,
    );
  }

  // Draw label if specified
  const label = formatProgressLabel(clampedProgress, options);
  if (label) {
    let labelX = dims.labelOffset;
    if (options.labelPosition === "left") {
      labelX = x - label.length - 1;
    }

    for (let i = 0; i < label.length; i++) {
      setChar(labelX + i, y, label[i], options.fillFg, options.fillBg);
    }
  }
}

/**
 * Draw vertical progress bar
 */
export function drawVerticalProgress(
  setChar: (x: number, y: number, char: string, fg?: Color, bg?: Color) => void,
  x: number,
  y: number,
  length: number,
  progress: number,
  options: ProgressBarOptions,
): void {
  const styleChars = getProgressChars(options.style);
  const fillChar = options.fillChar ?? styleChars.fillChar;
  const emptyChar = options.emptyChar ?? styleChars.emptyChar;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const filledLength = Math.floor(length * clampedProgress);

  // Draw from bottom to top (filled portion at bottom)
  for (let i = 0; i < filledLength; i++) {
    const currentY = y + length - 1 - i;
    setChar(x, currentY, fillChar, options.fillFg, options.fillBg);
  }

  // Draw empty portion (top)
  for (let i = filledLength; i < length; i++) {
    const currentY = y + length - 1 - i;
    setChar(x, currentY, emptyChar, options.emptyFg, options.emptyBg);
  }
}
