/**
 * Mouse input manager for handling mouse events and state
 *
 * @deprecated Use {@link PointerManager} instead for unified mouse/touch/pen support
 * @see {@link PointerManager}
 */

export interface MousePosition {
  x: number;
  y: number;
}

export interface MouseEvent {
  pixel: MousePosition;
  grid: MousePosition;
  event: globalThis.MouseEvent;
}

export type MouseCallback = (event: MouseEvent) => void;

export class MouseManager {
  private element: HTMLElement;
  private gridWidth: number;
  private gridHeight: number;
  private cellWidth: number;
  private cellHeight: number;

  private position: MousePosition = { x: 0, y: 0 };
  private pressedButtons: Set<number> = new Set();
  private justPressedButtons: Set<number> = new Set();
  private justReleasedButtons: Set<number> = new Set();
  private hovering = false;
  private dragging = false;
  private dragStartPos: MousePosition = { x: 0, y: 0 };

  private clickCallbacks: MouseCallback[] = [];
  private hoverCallbacks: MouseCallback[] = [];
  private dragStartCallbacks: MouseCallback[] = [];
  private dragEndCallbacks: MouseCallback[] = [];

  // Event handlers
  private handleMouseMove: (e: globalThis.MouseEvent) => void;
  private handleMouseDown: (e: globalThis.MouseEvent) => void;
  private handleMouseUp: (e: globalThis.MouseEvent) => void;
  private handleClick: (e: globalThis.MouseEvent) => void;
  private handleMouseEnter: () => void;
  private handleMouseLeave: () => void;

  /**
   * Create a new mouse manager
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
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMouseUp = this.onMouseUp.bind(this);
    this.handleClick = this.onClickEvent.bind(this);
    this.handleMouseEnter = this.onMouseEnter.bind(this);
    this.handleMouseLeave = this.onMouseLeave.bind(this);

    // Attach listeners
    this.element.addEventListener("mousemove", this.handleMouseMove);
    this.element.addEventListener("mousedown", this.handleMouseDown);
    this.element.addEventListener("mouseup", this.handleMouseUp);
    this.element.addEventListener("click", this.handleClick);
    this.element.addEventListener("mouseenter", this.handleMouseEnter);
    this.element.addEventListener("mouseleave", this.handleMouseLeave);
  }

  /**
   * Get mouse position relative to element
   */
  private getRelativePosition(e: globalThis.MouseEvent): MousePosition {
    const rect = this.element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  /**
   * Convert pixel position to grid coordinates
   */
  private pixelToGrid(pixel: MousePosition): MousePosition {
    return {
      x: Math.floor(pixel.x / this.cellWidth),
      y: Math.floor(pixel.y / this.cellHeight),
    };
  }

  /**
   * Create mouse event object
   */
  private createMouseEvent(e: globalThis.MouseEvent): MouseEvent {
    const pixel = this.getRelativePosition(e);
    const grid = this.pixelToGrid(pixel);
    return { pixel, grid, event: e };
  }

  /**
   * Internal mousemove handler
   */
  private onMouseMove(e: globalThis.MouseEvent): void {
    this.position = this.getRelativePosition(e);

    // Call hover callbacks
    const mouseEvent = this.createMouseEvent(e);
    this.hoverCallbacks.forEach((cb) => cb(mouseEvent));
  }

  /**
   * Internal mousedown handler
   */
  private onMouseDown(e: globalThis.MouseEvent): void {
    const button = e.button;

    if (!this.pressedButtons.has(button)) {
      this.justPressedButtons.add(button);
    }

    this.pressedButtons.add(button);

    // Start drag on left button
    if (button === 0 && !this.dragging) {
      this.dragging = true;
      this.dragStartPos = this.getRelativePosition(e);
      const mouseEvent = this.createMouseEvent(e);
      this.dragStartCallbacks.forEach((cb) => cb(mouseEvent));
    }
  }

  /**
   * Internal mouseup handler
   */
  private onMouseUp(e: globalThis.MouseEvent): void {
    const button = e.button;

    this.pressedButtons.delete(button);
    this.justReleasedButtons.add(button);

    // End drag on left button
    if (button === 0 && this.dragging) {
      this.dragging = false;
      const mouseEvent = this.createMouseEvent(e);
      this.dragEndCallbacks.forEach((cb) => cb(mouseEvent));
    }
  }

  /**
   * Internal click handler
   */
  private onClickEvent(e: globalThis.MouseEvent): void {
    const mouseEvent = this.createMouseEvent(e);
    this.clickCallbacks.forEach((cb) => cb(mouseEvent));
  }

  /**
   * Internal mouseenter handler
   */
  private onMouseEnter(): void {
    this.hovering = true;
  }

  /**
   * Internal mouseleave handler
   */
  private onMouseLeave(): void {
    this.hovering = false;
  }

  /**
   * Check if mouse button is currently pressed
   */
  isPressed(button: number): boolean {
    return this.pressedButtons.has(button);
  }

  /**
   * Check if left mouse button is pressed
   */
  isLeftPressed(): boolean {
    return this.isPressed(0);
  }

  /**
   * Check if right mouse button is pressed
   */
  isRightPressed(): boolean {
    return this.isPressed(2);
  }

  /**
   * Check if middle mouse button is pressed
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
   * Get current mouse position in pixels
   */
  getPosition(): MousePosition {
    return { ...this.position };
  }

  /**
   * Get current mouse position in grid coordinates
   */
  getGridPosition(): MousePosition {
    return this.pixelToGrid(this.position);
  }

  /**
   * Get mouse position in world coordinates
   */
  getWorldPosition(cameraX: number, cameraY: number): MousePosition {
    const grid = this.getGridPosition();
    return {
      x: grid.x + cameraX,
      y: grid.y + cameraY,
    };
  }

  /**
   * Check if mouse is hovering over element
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
  getDragDelta(): MousePosition {
    return {
      x: this.position.x - this.dragStartPos.x,
      y: this.position.y - this.dragStartPos.y,
    };
  }

  /**
   * Register click callback
   */
  onClick(callback: MouseCallback): void {
    this.clickCallbacks.push(callback);
  }

  /**
   * Register hover callback
   */
  onHover(callback: MouseCallback): void {
    this.hoverCallbacks.push(callback);
  }

  /**
   * Register drag start callback
   */
  onDragStart(callback: MouseCallback): void {
    this.dragStartCallbacks.push(callback);
  }

  /**
   * Register drag end callback
   */
  onDragEnd(callback: MouseCallback): void {
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
    this.element.removeEventListener("mousemove", this.handleMouseMove);
    this.element.removeEventListener("mousedown", this.handleMouseDown);
    this.element.removeEventListener("mouseup", this.handleMouseUp);
    this.element.removeEventListener("click", this.handleClick);
    this.element.removeEventListener("mouseenter", this.handleMouseEnter);
    this.element.removeEventListener("mouseleave", this.handleMouseLeave);

    this.clear();
    this.clickCallbacks = [];
    this.hoverCallbacks = [];
    this.dragStartCallbacks = [];
    this.dragEndCallbacks = [];
  }
}
