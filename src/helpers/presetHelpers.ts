/**
 * Preset system for reusable style configurations
 * Allows defining and applying named style presets for common UI elements
 */

import type {
  TextOptions,
  BoxOptions,
  MenuOptions,
  ProgressBarOptions,
} from "../types/types";

/**
 * Preset type discriminators
 */
export type PresetType = "text" | "box" | "menu" | "progressBar";

/**
 * Base preset definition
 */
interface BasePreset {
  type: PresetType;
  options: any;
}

/**
 * Text preset definition
 */
export interface TextPreset extends BasePreset {
  type: "text";
  options: TextOptions;
}

/**
 * Box preset definition
 */
export interface BoxPreset extends BasePreset {
  type: "box";
  options: BoxOptions;
}

/**
 * Menu preset definition
 */
export interface MenuPreset extends BasePreset {
  type: "menu";
  options: MenuOptions;
}

/**
 * Progress bar preset definition
 */
export interface ProgressBarPreset extends BasePreset {
  type: "progressBar";
  options: ProgressBarOptions;
}

/**
 * Union type of all preset types
 */
export type Preset = TextPreset | BoxPreset | MenuPreset | ProgressBarPreset;

/**
 * Preset definition for definePreset function
 */
export type PresetDefinition =
  | ({ type: "text" } & TextOptions)
  | ({ type: "box" } & BoxOptions)
  | ({ type: "menu" } & MenuOptions)
  | ({ type: "progressBar" } & ProgressBarOptions);

/**
 * Global preset registry
 */
const presetRegistry = new Map<string, Preset>();

/**
 * Define a reusable style preset
 *
 * Presets allow you to define commonly used styles once and reuse them
 * throughout your application. Supports text, box, menu, and progress bar styles.
 *
 * @param name - Unique name for the preset
 * @param definition - Preset definition with type and options
 *
 * @example
 * ```ts
 * // Define text presets
 * definePreset('title', {
 *   type: 'text',
 *   fg: 'yellow',
 *   bg: 'blue',
 *   align: 'center'
 * })
 *
 * // Define box preset
 * definePreset('panel', {
 *   type: 'box',
 *   style: 'double',
 *   fg: 'cyan',
 *   fill: true
 * })
 *
 * // Define menu preset
 * definePreset('mainMenu', {
 *   type: 'menu',
 *   selectedFg: 'black',
 *   selectedBg: 'white',
 *   border: true,
 *   style: 'rounded'
 * })
 *
 * // Use presets
 * renderer.applyTextPreset(10, 5, 'Game Title', 'title')
 * renderer.applyBoxPreset(0, 0, 80, 24, 'panel')
 * ```
 */
export function definePreset(name: string, definition: PresetDefinition): void {
  const { type, ...options } = definition;

  const preset: Preset = {
    type,
    options,
  } as Preset;

  presetRegistry.set(name, preset);
}

/**
 * Get a preset by name
 *
 * @param name - Preset name
 * @returns Preset definition, or undefined if not found
 *
 * @example
 * ```ts
 * const preset = getPreset('title')
 * if (preset && preset.type === 'text') {
 *   console.log(preset.options.fg) // 'yellow'
 * }
 * ```
 */
export function getPreset(name: string): Preset | undefined {
  return presetRegistry.get(name);
}

/**
 * List all defined preset names
 *
 * @returns Array of preset names
 *
 * @example
 * ```ts
 * const presets = listPresets()
 * console.log(presets) // ['title', 'panel', 'mainMenu']
 * ```
 */
export function listPresets(): string[] {
  return Array.from(presetRegistry.keys());
}

/**
 * Clear all defined presets
 *
 * Removes all presets from the registry. Useful for testing or
 * resetting the preset system.
 *
 * @example
 * ```ts
 * clearAllPresets()
 * console.log(listPresets()) // []
 * ```
 */
export function clearAllPresets(): void {
  presetRegistry.clear();
}

/**
 * Apply a text preset with optional overrides
 *
 * @param presetName - Name of the text preset to apply
 * @param overrides - Optional options to override preset values
 * @returns Merged text options
 * @throws Error if preset not found or wrong type
 *
 * @internal
 */
export function applyTextPreset(
  presetName: string,
  overrides?: TextOptions,
): TextOptions {
  const preset = getPreset(presetName);

  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`);
  }

  if (preset.type !== "text") {
    throw new Error(
      `Preset "${presetName}" is type "${preset.type}", expected "text"`,
    );
  }

  return {
    ...preset.options,
    ...overrides,
  };
}

/**
 * Apply a box preset with optional overrides
 *
 * @param presetName - Name of the box preset to apply
 * @param overrides - Optional options to override preset values
 * @returns Merged box options
 * @throws Error if preset not found or wrong type
 *
 * @internal
 */
export function applyBoxPreset(
  presetName: string,
  overrides?: BoxOptions,
): BoxOptions {
  const preset = getPreset(presetName);

  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`);
  }

  if (preset.type !== "box") {
    throw new Error(
      `Preset "${presetName}" is type "${preset.type}", expected "box"`,
    );
  }

  return {
    ...preset.options,
    ...overrides,
  };
}

/**
 * Apply a menu preset with optional overrides
 *
 * @param presetName - Name of the menu preset to apply
 * @param overrides - Optional options to override preset values
 * @returns Merged menu options
 * @throws Error if preset not found or wrong type
 *
 * @internal
 */
export function applyMenuPreset(
  presetName: string,
  overrides?: MenuOptions,
): MenuOptions {
  const preset = getPreset(presetName);

  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`);
  }

  if (preset.type !== "menu") {
    throw new Error(
      `Preset "${presetName}" is type "${preset.type}", expected "menu"`,
    );
  }

  return {
    ...preset.options,
    ...overrides,
  };
}

/**
 * Apply a progress bar preset with optional overrides
 *
 * @param presetName - Name of the progress bar preset to apply
 * @param overrides - Optional options to override preset values
 * @returns Merged progress bar options
 * @throws Error if preset not found or wrong type
 *
 * @internal
 */
export function applyProgressBarPreset(
  presetName: string,
  overrides?: ProgressBarOptions,
): ProgressBarOptions {
  const preset = getPreset(presetName);

  if (!preset) {
    throw new Error(`Preset "${presetName}" not found`);
  }

  if (preset.type !== "progressBar") {
    throw new Error(
      `Preset "${presetName}" is type "${preset.type}", expected "progressBar"`,
    );
  }

  return {
    ...preset.options,
    ...overrides,
  };
}
