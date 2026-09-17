/**
 * camera.js
 * The whole infinite-canvas illusion is one CSS transform on #world:
 *   translate(-camera.x * zoom, -camera.y * zoom) scale(zoom)
 * Panning/zooming never touches individual cards — only this one
 * transform — which is what keeps 100-200 objects smooth.
 */
window.Board = window.Board || {};

let worldEl;

Board.initCamera = function initCamera() {
  worldEl = document.getElementById('world');
  Board.updateCameraTransform();
};

Board.updateCameraTransform = function updateCameraTransform() {
  const cam = Board.state.camera;
  worldEl.style.transform =
    'translate3d(' + (-cam.x * cam.zoom) + 'px, ' + (-cam.y * cam.zoom) + 'px, 0) ' +
    'scale(' + cam.zoom + ')';
};

/**
 * Screen (client) coordinates -> world coordinates, accounting for
 * current pan + zoom. Used for dragging cards and for the HUD readout.
 */
Board.screenToWorld = function screenToWorld(clientX, clientY) {
  const cam = Board.state.camera;
  return {
    x: clientX / cam.zoom + cam.x,
    y: clientY / cam.zoom + cam.y,
  };
};

/**
 * Zooms so that the point currently under (clientX, clientY) stays
 * visually fixed — the natural feel for "zoom toward the cursor".
 */
Board.zoomAt = function zoomAt(clientX, clientY, factor) {
  const cam = Board.state.camera;
  const cfg = Board.CONFIG;
  const before = Board.screenToWorld(clientX, clientY);

  cam.zoom = Math.min(cfg.ZOOM_MAX, Math.max(cfg.ZOOM_MIN, cam.zoom * factor));

  const after = Board.screenToWorld(clientX, clientY);
  cam.x += before.x - after.x;
  cam.y += before.y - after.y;

  Board.updateCameraTransform();
};

Board.panBy = function panBy(dxScreen, dyScreen) {
  const cam = Board.state.camera;
  cam.x -= dxScreen / cam.zoom;
  cam.y -= dyScreen / cam.zoom;
  Board.updateCameraTransform();
};
