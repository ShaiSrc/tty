/**
 * KISS ASCII Renderer
 * A minimalist, high-performance ASCII rendering library for game developers
 */

// Export types
export type {
  Color,
  NamedColor,
  HexColor,
  RGBColor,
  Cell,
  BoxStyle,
  BorderChars,
  BoxOptions,
  TextAlign,
  TextOptions,
  RendererOptions,
  RenderTarget,
  MenuOptions,
  ProgressBarOptions,
  ProgressBarStyle,
  PanelOptions,
  EasingFunction,
  AnimateOptions,
  AnimationCallback,
  AnimationCompleteCallback,
  FlashOptions,
  PulseOptions,
  Point,
  Rect,
  Size,
} from "./types/types";

// Export color utilities
export {
  parseColor,
  rgbToHex,
  toCSSColor,
  lerp,
  brighten,
  darken,
} from "./drawing/colors";

// Export render targets
export { CanvasTarget } from "./targets/CanvasTarget";
export type { CanvasTargetOptions } from "./targets/CanvasTarget";

// Export main renderer
export { Renderer } from "./core/Renderer";
export type {
  RendererCreateOptions,
  CanvasRendererOptions,
} from "./core/Renderer";

// Export input managers
export { KeyboardManager } from "./input/KeyboardManager";
export type {
  KeyCallback,
  DirectionVector,
  DirectionOptions,
  WaitForKeyOptions,
} from "./input/KeyboardManager";
export { PointerManager } from "./input/PointerManager";
export type {
  PointerCallback,
  PointerPosition,
  PointerEvent,
} from "./input/PointerManager";
export { GamepadManager } from "./input/GamepadManager";
export type {
  GamepadCallback,
  GamepadButtonState,
  GamepadAxisState,
} from "./input/GamepadManager";

// Backward compatibility: MouseManager is now an alias for PointerManager
/** @deprecated Use PointerManager instead. MouseManager is deprecated and will be removed in a future version. */
export { MouseManager } from "./input/MouseManager";
export type {
  MouseCallback,
  MousePosition,
  MouseEvent,
} from "./input/MouseManager";

// Export game loop
export { GameLoop } from "./core/GameLoop";
export type {
  GameLoopOptions,
  UpdateCallback,
  RenderCallback,
} from "./core/GameLoop";

// Export animation manager
export { AnimationManager } from "./core/AnimationManager";

// Export debug helpers
export type {
  ShowGridOptions,
  ShowBoundsOptions,
  ShowFPSOptions,
  ShowPointerCoordsOptions,
  CellInfo,
} from "./helpers/debugHelpers";

// Export export helpers
export type { ExportImageOptions, ImageFormat } from "./helpers/exportHelpers";

// Export preset system
export {
  definePreset,
  getPreset,
  listPresets,
  clearAllPresets,
} from "./helpers/presetHelpers";
export type {
  PresetType,
  TextPreset,
  BoxPreset,
  MenuPreset,
  ProgressBarPreset,
  Preset,
  PresetDefinition,
} from "./helpers/presetHelpers";
