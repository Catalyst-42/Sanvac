/**
 * keyboard.js
 * WASD is handled as a continuous per-frame loop (so multiple keys
 * combine smoothly, e.g. W+D = diagonal). Everything else is a
 * discrete keydown action.
 */
window.Board = window.Board || {};

Board.initKeyboard = function initKeyboard() {
  const state = Board.state;

  const WASD_CODES = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd' };

  window.addEventListener('keydown', e => {
    if (e.key === 'Alt') {
      state.hudHeld = true;
      Board.updateHud();
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyM') {
      state.hudPinned = !state.hudPinned;
      Board.updateHud();
      return;
    }
    if (e.code === 'KeyB') {
      Board.launchConfetti();
      return;
    }
    if (e.code === 'KeyI') {
      Board.saveBoardToFile();
      e.preventDefault();
      return;
    }
    if (WASD_CODES[e.code]) {
      state.keysDown.add(WASD_CODES[e.code]);
    }
    if (e.key === 'Shift') {
      state.keysDown.add('shift');
    }
  });

  window.addEventListener('keyup', e => {
    if (e.key === 'Alt') {
      state.hudHeld = false;
      Board.updateHud();
      return;
    }
    if (WASD_CODES[e.code]) {
      state.keysDown.delete(WASD_CODES[e.code]);
    }
    if (e.key === 'Shift') {
      state.keysDown.delete('shift');
    }
  });

  // Losing window focus shouldn't leave a key "stuck" down.
  window.addEventListener('blur', () => {
    state.keysDown.clear();
    state.hudHeld = false;
    Board.updateHud();
  });

  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000); // clamp to avoid jumps on tab-switch
    lastTime = now;
    stepPan(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function stepPan(dt) {
    const keys = state.keysDown;
    if (keys.size === 0) return;
    const speed = (keys.has('shift') ? Board.CONFIG.KEY_PAN_SPEED_FAST : Board.CONFIG.KEY_PAN_SPEED);
    let dx = 0, dy = 0;
    if (keys.has('w')) dy -= 1;
    if (keys.has('s')) dy += 1;
    if (keys.has('a')) dx -= 1;
    if (keys.has('d')) dx += 1;
    if (dx === 0 && dy === 0) return;

    // Normalize diagonal movement so it isn't faster than cardinal movement.
    const len = Math.hypot(dx, dy) || 1;
    const worldDx = (dx / len) * speed * dt;
    const worldDy = (dy / len) * speed * dt;

    state.camera.x += worldDx;
    state.camera.y += worldDy;
    Board.updateCameraTransform();
    Board.updateHud();

    if (state.pointer.mode === 'drag-card' && state.pointer.draggedId) {
      const obj = Board.getObjectById(state.pointer.draggedId);
      if (obj) {
        const world = Board.screenToWorld(state.pointer.lastClientX, state.pointer.lastClientY);
        obj.x = world.x + state.pointer.dragOffsetX;
        obj.y = world.y + state.pointer.dragOffsetY;
        Board.applyTransform(obj);
      }
    }
  }
};
