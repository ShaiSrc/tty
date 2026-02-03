/**
 * Pointer input manager for handling mouse, touch, and pen events
 * Uses the Pointer Events API for unified input handling across devices
 */

export interface PointerPosition {
  x: number;
  y: number;
}

export interface PointerEvent {
  pixel: PointerPosition;
  grid: PointerPosition;
  event: globalThis.PointerEvent;
}

export type PointerCallback = (event: PointerEvent) => void;

export class PointerManager {
  private element: HTMLElement;
  private gridWidth: number;
  private gridHeight: number;
  private cellWidth: number;
  private cellHeight: number;

  private position: PointerPosition = { x: 0, y: 0 };
  private pressedButtons: Set<number> = new Set();
  private justPressedButtons: Set<number> = new Set();
  private justReleasedButtons: Set<number> = new Set();
  private hovering = false;
  private dragging = false;
  private dragStartPos: PointerPosition = { x: 0, y: 0 };
  private pointerType: string = "";
  private pressure = 0.5;

  private clickCallbacks: PointerCallback[] = [];
  private hoverCallbacks: PointerCallback[] = [];
  private dragStartCallbacks: PointerCallback[] = [];
  private dragEndCallbacks: PointerCallback[] = [];

  // Event handlers
  private handlePointerMove: (e: globalThis.PointerEvent) => void;
  private handlePointerDown: (e: globalThis.PointerEvent) => void;
  private handlePointerUp: (e: globalThis.PointerEvent) => void;
  private handleClick: (e: globalThis.PointerEvent) => void;
  private handlePointerEnter: () => void;
  private handlePointerLeave: () => void;

  /**
   * Create a new pointer manager
   * @param element - Element to attach listeners to
   * @param gridWidth - Grid width in cells
   * @param gridHeight - Grid height in cells
   * @param cellWidth - Cell width in pixels
   * @param cellHeight - Cell height in pixels
   */
  constructor(
    element: HTMLElement,
    gridWidth: number,
    gridHeight: number,
    cellWidth: number,
    cellHeight: number,
  ) {
    this.element = element;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    // Bind event handlers
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handleClick = this.onClickEvent.bind(this);
    this.handlePointerEnter = this.onPointerEnter.bind(this);
    this.handlePointerLeave = this.onPointerLeave.bind(this);

    // Attach listeners
    this.element.addEventListener("pointermove", this.handlePointerMove);
    this.element.addEventListener("pointerdown", this.handlePointerDown);
    this.element.addEventListener("pointerup", this.handlePointerUp);
    this.element.addEventListener("click", this.handleClick as EventListener);
    this.element.addEventListener("pointerenter", this.handlePointerEnter);
    this.element.addEventListener("pointerleave", this.handlePointerLeave);
  }

  /**
   * Get pointer position relative to element
   */
  private getRelativePosition(e: globalThis.PointerEvent): PointerPosition {
    const rect = this.element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  /**
   * Convert pixel position to grid coordinates
   */
  private pixelToGrid(pixel: PointerPosition): PointerPosition {
    return {
      x: Math.floor(pixel.x / this.cellWidth),
      y: Math.floor(pixel.y / this.cellHeight),
    };
  }

  /**
   * Create pointer event object
   */
  private createPointerEvent(e: globalThis.PointerEvent): PointerEvent {
    const pixel = this.getRelativePosition(e);
    const grid = this.pixelToGrid(pixel);
    return { pixel, grid, event: e };
  }

  /**
   * Internal pointermove handler
   */
  private onPointerMove(e: globalThis.PointerEvent): void {
    this.position = this.getRelativePosition(e);
    this.pointerType = e.pointerType;
    this.pressure = e.pressure;

    // Call hover callbacks
    const pointerEvent = this.createPointerEvent(e);
    this.hoverCallbacks.forEach((cb) => cb(pointerEvent));
  }

  /**
   * Internal pointerdown handler
   */
  private onPointerDown(e: globalThis.PointerEvent): void {
    const button = e.button;

    if (!this.pressedButtons.has(button)) {
      this.justPressedButtons.add(button);
    }

    this.pressedButtons.add(button);
    this.pointerType = e.pointerType;
    this.pressure = e.pressure;

    // Start drag on left button (primary pointer)
    if (button === 0 && !this.dragging) {
      this.dragging = true;
      this.dragStartPos = this.getRelativePosition(e);
      const pointerEvent = this.createPointerEvent(e);
      this.dragStartCallbacks.forEach((cb) => cb(pointerEvent));
    }
  }

  /**
   * Internal pointerup handler
   */
  private onPointerUp(e: globalThis.PointerEvent): void {
    const button = e.button;

    this.pressedButtons.delete(button);
    this.justReleasedButtons.add(button);
    this.pointerType = e.pointerType;
    this.pressure = e.pressure;

    // End drag on left button
    if (button === 0 && this.dragging) {
      this.dragging = false;
      const pointerEvent = this.createPointerEvent(e);
      this.dragEndCallbacks.forEach((cb) => cb(pointerEvent));
    }
  }

  /**
   * Internal click handler
   */
  private onClickEvent(e: globalThis.PointerEvent): void {
    const pointerEvent = this.createPointerEvent(e);
    this.clickCallbacks.forEach((cb) => cb(pointerEvent));
  }

  /**
   * Internal pointerenter handler
   */
  private onPointerEnter(): void {
    this.hovering = true;
  }

  /**
   * Internal pointerleave handler
   */
  private onPointerLeave(): void {
    this.hovering = false;
  }

  /**
   * Check if pointer button is currently pressed
   */
  isPressed(button: number): boolean {
    return this.pressedButtons.has(button);
  }

  /**
   * Check if left pointer button is pressed
   */
  isLeftPressed(): boolean {
    return this.isPressed(0);
  }

  /**
   * Check if right pointer button is pressed
   */
  isRightPressed(): boolean {
    return this.isPressed(2);
  }

  /**
   * Check if middle pointer button is pressed
   */
  isMiddlePressed(): boolean {
    return this.isPressed(1);
  }

  /**
   * Check if button was just pressed this frame
   */
  justPressed(button: number): boolean {
    return this.justPressedButtons.has(button);
  }

  /**
   * Check if button was just released this frame
   */
  justReleased(button: number): boolean {
    return this.justReleasedButtons.has(button);
  }

  /**
   * Get current pointer position in pixels
   */
  getPosition(): PointerPosition {
    return { ...this.position };
  }

  /**
   * Get current pointer position in grid coordinates
   */
  getGridPosition(): PointerPosition {
    return this.pixelToGrid(this.position);
  }

  /**
   * Get pointer position in world coordinates
   */
  getWorldPosition(cameraX: number, cameraY: number): PointerPosition {
    const grid = this.getGridPosition();
    return {
      x: grid.x + cameraX,
      y: grid.y + cameraY,
    };
  }

  /**
   * Get the type of pointer device (mouse, touch, pen, or empty string)
   */
  getPointerType(): string {
    return this.pointerType;
  }

  /**
   * Get the pressure of the pointer (0.0 to 1.0)
   * Useful for pen input with pressure sensitivity
   */
  getPressure(): number {
    return this.pressure;
  }

  /**
   * Check if pointer is hovering over element
   */
  isHovering(): boolean {
    return this.hovering;
  }

  /**
   * Check if hovering over specific grid cell
   */
  isHoveringCell(x: number, y: number): boolean {
    const grid = this.getGridPosition();
    return grid.x === x && grid.y === y;
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragging;
  }

  /**
   * Get drag delta from start position
   */
  getDragDelta(): PointerPosition {
    return {
      x: this.position.x - this.dragStartPos.x,
      y: this.position.y - this.dragStartPos.y,
    };
  }

  /**
   * Register click callback
   */
  onClick(callback: PointerCallback): void {
    this.clickCallbacks.push(callback);
  }

  /**
   * Register hover callback
   */
  onHover(callback: PointerCallback): void {
    this.hoverCallbacks.push(callback);
  }

  /**
   * Register drag start callback
   */
  onDragStart(callback: PointerCallback): void {
    this.dragStartCallbacks.push(callback);
  }

  /**
   * Register drag end callback
   */
  onDragEnd(callback: PointerCallback): void {
    this.dragEndCallbacks.push(callback);
  }

  /**
   * Clear just pressed/released states (call once per frame)
   */
  update(): void {
    this.justPressedButtons.clear();
    this.justReleasedButtons.clear();
  }

  /**
   * Clear all button states
   */
  clear(): void {
    this.pressedButtons.clear();
    this.justPressedButtons.clear();
    this.justReleasedButtons.clear();
    this.dragging = false;
  }

  /**
   * Remove event listeners and cleanup
   */
  destroy(): void {
    this.element.removeEventListener("pointermove", this.handlePointerMove);
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.element.removeEventListener("pointerup", this.handlePointerUp);
    this.element.removeEventListener(
      "click",
      this.handleClick as EventListener,
    );
    this.element.removeEventListener("pointerenter", this.handlePointerEnter);
    this.element.removeEventListener("pointerleave", this.handlePointerLeave);

    this.clear();
    this.clickCallbacks = [];
    this.hoverCallbacks = [];
    this.dragStartCallbacks = [];
    this.dragEndCallbacks = [];
  }
}
