/**
 * state.js
 * A single, small, mutable state object shared across modules.
 * No framework, no reactivity — just one source of truth and
 * plain functions that read/write it.
 */
window.Board = window.Board || {};

Board.state = {
  camera: {
    x: 0,      // world-space coordinate at the top-left of the viewport
    y: 0,
    zoom: 1,
  },

  objects: [],       // array of card data objects, in z-order (index === paint order)
  elementsById: {},  // id -> DOM element, for fast lookup during drag

  zCounter: 1,       // monotonically increasing, handed out on drag-start

  pointer: {
    isDown: false,
    mode: null,       // 'pan' | 'drag-card' | null
    startClientX: 0,
    startClientY: 0,
    lastClientX: 0,
    lastClientY: 0,
    draggedId: null,
    dragOffsetX: 0,   // pointer position relative to card's world x/y at drag start
    dragOffsetY: 0,
  },

  keysDown: new Set(),
  hudPinned: false,   // toggled by "M"
  hudHeld: false,     // true while Alt is held

  worldMouse: { x: 0, y: 0, e: null }, // last known mouse position in world space
};
