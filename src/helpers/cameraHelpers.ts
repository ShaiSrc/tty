/**
 * Camera/viewport helper functions for coordinate transformations
 */

/**
 * Camera state
 */
export interface CameraState {
  x: number;
  y: number;
  bounds?: CameraBounds;
}

/**
 * Camera bounds for limiting scroll area
 */
export interface CameraBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Clamp camera position to bounds
 */
function clampCameraToBounds(camera: CameraState): void {
  if (!camera.bounds) return;

  const { minX, minY, maxX, maxY } = camera.bounds;
  camera.x = Math.max(minX, Math.min(maxX, camera.x));
  camera.y = Math.max(minY, Math.min(maxY, camera.y));
}

/**
 * Set camera bounds
 */
export function setCameraBounds(
  camera: CameraState,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): void {
  camera.bounds = { minX, minY, maxX, maxY };
  clampCameraToBounds(camera);
}

/**
 * Clear camera bounds
 */
export function clearCameraBounds(camera: CameraState): void {
  camera.bounds = undefined;
}

/**
 * Set camera position
 */
export function setCamera(camera: CameraState, x: number, y: number): void {
  camera.x = x;
  camera.y = y;
  clampCameraToBounds(camera);
}

/**
 * Reset camera to origin
 */
export function resetCamera(camera: CameraState): void {
  camera.x = 0;
  camera.y = 0;
  clampCameraToBounds(camera);
}

/**
 * Move camera by delta
 */
export function moveCamera(camera: CameraState, dx: number, dy: number): void {
  camera.x += dx;
  camera.y += dy;
  clampCameraToBounds(camera);
}

/**
 * Center camera on target position
 */
export function followTarget(
  camera: CameraState,
  targetX: number,
  targetY: number,
  viewportWidth: number,
  viewportHeight: number,
): void {
  camera.x = targetX - Math.floor(viewportWidth / 2);
  camera.y = targetY - Math.floor(viewportHeight / 2);
  clampCameraToBounds(camera);
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  camera: CameraState,
  worldX: number,
  worldY: number,
): { x: number; y: number } {
  return {
    x: worldX - camera.x,
    y: worldY - camera.y,
  };
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  camera: CameraState,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  return {
    x: screenX + camera.x,
    y: screenY + camera.y,
  };
}
