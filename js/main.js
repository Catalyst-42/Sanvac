/**
 * main.js
 * Entry point. Keep this file thin — it only orchestrates the other
 * modules, in order.
 */
window.Board = window.Board || {};

(async function boot() {
  const data = await Board.loadData();
  Board.state.objects = data.objects || [];

  const maxZ = Board.state.objects.reduce((max, o) => Math.max(max, o.z || 0), 0);
  Board.state.zCounter = maxZ + 1;

  Board.renderAll();
  Board.initCamera();

  if (Board.CONFIG.START_CAMERA) {
    const s = Board.CONFIG.START_CAMERA;
    Board.state.camera.x = s.x;
    Board.state.camera.y = s.y;
    Board.state.camera.zoom = s.zoom || 1;
    Board.updateCameraTransform();
  } else {
    centerCameraOnContent();
  }

  Board.initInteractions();
  Board.initKeyboard();

  requestAnimationFrame(() => {
    document.getElementById('intro-veil').classList.add('hidden');
  });

  /**
   * Frames the initial view around whatever content exists, so the
   * gift opens on something rather than an empty stretch of paper.
   */
  function centerCameraOnContent() {
    const objs = Board.state.objects;
    if (objs.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    objs.forEach(o => {
      minX = Math.min(minX, o.x - o.width / 2);
      maxX = Math.max(maxX, o.x + o.width / 2);
      minY = Math.min(minY, o.y - o.height / 2);
      maxY = Math.max(maxY, o.y + o.height / 2);
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const centerX = minX + contentW / 2;
    const centerY = minY + contentH / 2;

    const pad = 1.35; // breathing room around the content on first load
    const zoomX = window.innerWidth / (contentW * pad || 1);
    const zoomY = window.innerHeight / (contentH * pad || 1);
    const zoom = Math.min(
      Board.CONFIG.ZOOM_MAX,
      Math.max(Board.CONFIG.ZOOM_MIN, Math.min(zoomX, zoomY, 1.1))
    );

    Board.state.camera.zoom = zoom;
    Board.state.camera.x = centerX - (window.innerWidth / 2) / zoom;
    Board.state.camera.y = centerY - (window.innerHeight / 2) / zoom;
    Board.updateCameraTransform();
  }
})();
