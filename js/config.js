/**
 * config.js
 * Global constants. Everything tunable lives here so the rest of the
 * modules stay free of magic numbers.
 */
window.Board = window.Board || {};

Board.CONFIG = {
  DATA_URL: 'files/data.json',
  START_CAMERA: {
    x: -250 -window.innerWidth / 2,
    y: -300 -window.innerHeight / 2,
    zoom: 0.7
  },

  ZOOM_MIN: 0.15,
  ZOOM_MAX: 3.5,
  ZOOM_STEP: 0.0016,           // Exponential coefficient applied per wheel-delta unit (~15% per notch)

  KEY_PAN_SPEED: 1500,         // World px / second, divided by current zoom
  KEY_PAN_SPEED_FAST: 3000,    // With Shift held

  CONFETTI_COUNT: 160,
  CONFETTI_DURATION: 7200,     // ms
  CONFETTI_COLORS: ['#4F6F64', '#8B5D73', '#C98A2E', '#B8654B', '#6C86A0', '#F3EEE2'],

  DEFAULT_CARD_SIZE: {
    photo:   { w: 280, h: 210 },
    video:   { w: 320, h: 210 },
    sticker: { w: 150, h: 110 },
    note:    { w: 240, h: 180 },
    text:    { w: 260, h: 40 },
  },
};
