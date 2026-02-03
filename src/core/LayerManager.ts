/**
 * Layer management system for multi-layer rendering
 */

import type { Cell } from "../types/types";

/**
 * Manages multiple rendering layers with z-order and visibility control
 */
export class LayerManager {
  private layers: Map<string, Map<string, Cell>> = new Map();
  private currentLayer = "main";
  private layerVisibility: Map<string, boolean> = new Map();
  private renderOrder: string[] = ["main"];

  constructor() {
    // Initialize main layer
    this.layers.set("main", new Map());
    this.layerVisibility.set("main", true);
  }

  /**
   * Get the current layer's buffer
   */
  getCurrentBuffer(): Map<string, Cell> {
    let layerBuffer = this.layers.get(this.currentLayer);
    if (!layerBuffer) {
      layerBuffer = new Map();
      this.layers.set(this.currentLayer, layerBuffer);
      this.layerVisibility.set(this.currentLayer, true);
      if (!this.renderOrder.includes(this.currentLayer)) {
        this.renderOrder.push(this.currentLayer);
      }
    }
    return layerBuffer;
  }

  /**
   * Switch to a named layer
   */
  setCurrentLayer(name: string): void {
    this.currentLayer = name;
    // Access buffer to auto-create layer if needed
    this.getCurrentBuffer();
  }

  /**
   * Set the rendering order of layers
   */
  setRenderOrder(order: string[]): void {
    this.renderOrder = [...order];
  }

  /**
   * Hide a layer from rendering
   */
  hideLayer(name: string): void {
    this.layerVisibility.set(name, false);
  }

  /**
   * Show a previously hidden layer
   */
  showLayer(name: string): void {
    this.layerVisibility.set(name, true);
  }

  /**
   * Clear a specific layer
   */
  clearLayer(name: string): void {
    const layerBuffer = this.layers.get(name);
    if (layerBuffer) {
      layerBuffer.clear();
    }
  }

  /**
   * Composite all visible layers into a single buffer
   */
  composite(): Map<string, Cell> {
    const compositeBuffer = new Map<string, Cell>();

    for (const layerName of this.renderOrder) {
      const visible = this.layerVisibility.get(layerName) ?? true;
      if (!visible) continue;

      const layerBuffer = this.layers.get(layerName);
      if (!layerBuffer) continue;

      // Copy cells from this layer (overwriting previous layers)
      for (const [key, cell] of layerBuffer.entries()) {
        compositeBuffer.set(key, cell);
      }
    }

    return compositeBuffer;
  }
}
