/**
 * interactions.js
 * Mouse + touch input, unified through the Pointer Events API.
 *   - drag empty canvas   -> pan
 *   - drag a card         -> move that card, bring it to front
 *   - wheel               -> zoom toward cursor
 *   - two-finger touch    -> pinch to zoom (optional, per spec "желательно")
 */
window.Board = window.Board || {};

Board.initInteractions = function initInteractions() {
  const viewport = document.getElementById('viewport');
  const state = Board.state;

  // Active pointers, for pinch-zoom bookkeeping.
  const activePointers = new Map();
  let pinchStartDist = null;
  let pinchStartZoom = null;

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  viewport.addEventListener('pointerleave', onPointerLeaveMaybeEnd);
  viewport.addEventListener('wheel', onWheel, { passive: false });
  viewport.addEventListener('contextmenu', e => e.preventDefault());

  function onPointerDown(e) {
    const cardElEarly = e.target.closest('.card');
    // Video cards only start a drag from their small top handle. Bail out
    // before capturing the pointer so native play/pause/scrub controls
    // keep receiving their own events untouched.
    if (cardElEarly && cardElEarly.classList.contains('card-video') &&
        !e.target.closest('.drag-handle')) {
      return;
    }

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.setPointerCapture(e.pointerId);

    if (activePointers.size === 2) {
      // Entering pinch mode — cleanly abandon any single-pointer drag/pan in progress.
      endDragOrPan();
      const pts = [...activePointers.values()];
      pinchStartDist = distance(pts[0], pts[1]);
      pinchStartZoom = state.camera.zoom;
      return;
    }

    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;

    const cardEl = cardElEarly;
    state.pointer.isDown = true;
    state.pointer.startClientX = state.pointer.lastClientX = e.clientX;
    state.pointer.startClientY = state.pointer.lastClientY = e.clientY;

    if (cardEl) {
      const obj = Board.getObjectById(cardEl.dataset.id);
      if (obj) {
        state.pointer.mode = 'drag-card';
        state.pointer.draggedId = obj.id;
        const world = Board.screenToWorld(e.clientX, e.clientY);
        state.pointer.dragOffsetX = obj.x - world.x;
        state.pointer.dragOffsetY = obj.y - world.y;
        Board.bringToFront(obj);
        cardEl.classList.add('dragging');
      }
    } else {
      state.pointer.mode = 'pan';
      viewport.classList.add('panning');
    }
  }

  function onPointerMove(e) {
    // Keep world-mouse position current for the HUD even when nothing is pressed.
    const world = Board.screenToWorld(e.clientX, e.clientY);
    state.worldMouse.e = e
    state.worldMouse.x = Math.round(world.x);
    state.worldMouse.y = Math.round(world.y);
    Board.updateHud();

    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointers.size === 2 && pinchStartDist) {
      const pts = [...activePointers.values()];
      const dist = distance(pts[0], pts[1]);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const targetZoom = Math.min(
        Board.CONFIG.ZOOM_MAX,
        Math.max(Board.CONFIG.ZOOM_MIN, pinchStartZoom * (dist / pinchStartDist))
      );
      Board.zoomAt(mid.x, mid.y, targetZoom / state.camera.zoom);
      return;
    }

    if (!state.pointer.isDown) return;

    const dx = e.clientX - state.pointer.lastClientX;
    const dy = e.clientY - state.pointer.lastClientY;
    state.pointer.lastClientX = e.clientX;
    state.pointer.lastClientY = e.clientY;

    if (state.pointer.mode === 'pan') {
      Board.panBy(dx, dy);
    } else if (state.pointer.mode === 'drag-card') {
      const obj = Board.getObjectById(state.pointer.draggedId);
      if (!obj) return;
      obj.x = world.x + state.pointer.dragOffsetX;
      obj.y = world.y + state.pointer.dragOffsetY;
      Board.applyTransform(obj);
    }
  }

  function onPointerUp(e) {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) {
      pinchStartDist = null;
      pinchStartZoom = null;
    }
    if (viewport.hasPointerCapture && viewport.hasPointerCapture(e.pointerId)) {
      viewport.releasePointerCapture(e.pointerId);
    }
    endDragOrPan();
  }

  function onPointerLeaveMaybeEnd(e) {
    // Only end if it's not just moving over a child element.
    if (e.pointerType === 'mouse' && activePointers.size <= 1) endDragOrPan();
  }

  function endDragOrPan() {
    if (state.pointer.mode === 'drag-card' && state.pointer.draggedId) {
      const el = state.elementsById[state.pointer.draggedId];
      if (el) el.classList.remove('dragging');
    }
    state.pointer.isDown = false;
    state.pointer.mode = null;
    state.pointer.draggedId = null;
    viewport.classList.remove('panning');
  }

  function onWheel(e) {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * Board.CONFIG.ZOOM_STEP);
    Board.zoomAt(e.clientX, e.clientY, factor);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
};

Board.updateHud = function updateHud() {
  if (Board.state.worldMouse.e) {
    const world = Board.screenToWorld(
      Board.state.worldMouse.e.clientX,
      Board.state.worldMouse.e.clientY
    );
    Board.state.worldMouse.x = Math.round(world.x);
    Board.state.worldMouse.y = Math.round(world.y);
  }

  const hud = document.getElementById('hud');
  const xEl = document.getElementById('hud-x');
  const yEl = document.getElementById('hud-y');
  xEl.textContent = Board.state.worldMouse.x;
  yEl.textContent = Board.state.worldMouse.y;
  const visible = Board.state.hudPinned || Board.state.hudHeld;
  hud.classList.toggle('visible', visible);
};
