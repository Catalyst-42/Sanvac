/**
 * dataLoader.js
 * Tries to fetch files/data.json (works when the site is served over
 * http/https — see README). If that fails, most commonly because the
 * page was opened directly as a file:// document and the browser blocks
 * fetch() of local files, we fall back to a small built-in dataset so
 * the board still opens and looks alive on first double-click.
 *
 * Edit files/data.json to build the real board — the fallback below is
 * only a safety net, not the source of truth.
 */
window.Board = window.Board || {};

Board.FALLBACK_DATA = {
  objects: [
    {
      id: 'photo-1', type: 'photo', x: -420, y: -160, width: 280, height: 210,
      rotation: -4, src: 'files/images/photo1.jpg', caption: 'The summer we won\'t forget'
    },
    {
      id: 'photo-2', type: 'photo', x: -40, y: -260, width: 210, height: 280,
      rotation: 3, src: 'files/images/photo2.jpg', caption: ''
    },
    {
      id: 'photo-3', type: 'photo', x: 260, y: -80, width: 280, height: 210,
      rotation: -2, src: 'files/images/photo3.jpg', caption: 'Sunday morning'
    },
    {
      id: 'photo-4', type: 'photo', x: 40, y: 220, width: 240, height: 240,
      rotation: 5, src: 'files/images/photo4.jpg', caption: ''
    },
    {
      id: 'sticker-1', type: 'sticker', x: -260, y: 120, width: 150, height: 110,
      rotation: -6, text: 'We did it!', color: '#4F6F64'
    },
    {
      id: 'sticker-2', type: 'sticker', x: 420, y: 180, width: 150, height: 110,
      rotation: 4, text: 'September 2026', color: '#8B5D73'
    },
    {
      id: 'sticker-3', type: 'sticker', x: -480, y: -60, width: 150, height: 110,
      rotation: 8, text: 'One more time?', color: '#C98A2E'
    },
    {
      id: 'note-1', type: 'note', x: 300, y: -340, width: 260, height: 190,
      rotation: -3,
      text: 'Reminder to self:\nalways stop and\nlook around a little longer.'
    },
    {
      id: 'text-1', type: 'text', x: -30, y: 0, width: 320, height: 40,
      rotation: 0, text: 'You\'ll find\n this if you go looking', fontSize: 22
    },
    {
      id: 'video-1', type: 'video', x: -60, y: -560, width: 320, height: 198,
      rotation: -2, src: 'files/videos/clip1.mp4', caption: 'Replace me with your own video'
    },
  ]
};

/**
 * @returns {Promise<{objects: Array}>}
 */
Board.loadData = async function loadData() {
  try {
    const res = await fetch(Board.CONFIG.DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (!json || !Array.isArray(json.objects)) throw new Error('malformed data.json');
    return json;
  } catch (err) {
    console.warn(
      '[canvas] can not load files/data.json (' + err.message + '). '
    );
    return Board.FALLBACK_DATA;
  }
};
