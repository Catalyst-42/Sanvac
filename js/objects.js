/**
 * objects.js
 * Turns plain data objects into DOM cards, and keeps their on-screen
 * transform in sync with their world x/y/rotation/z.
 *
 * Card position model: x/y is the CENTER of the card in world space.
 * That makes rotation trivial (rotate around center, no offset math).
 */
window.Board = window.Board || {};

/**
 * @param {object} obj  card data, see files/data.json for the schema
 * @returns {HTMLElement}
 */
Board.createCardElement = function createCardElement(obj) {
  const defaults = Board.CONFIG.DEFAULT_CARD_SIZE[obj.type] || { w: 200, h: 150 };
  obj.width = obj.width || defaults.w;
  obj.height = obj.height || defaults.h;
  obj.rotation = obj.rotation || 0;
  obj.z = obj.z || Board.state.zCounter++;

  const el = document.createElement('div');
  el.className = 'card card-' + obj.type;
  el.dataset.id = obj.id;
  el.style.width = obj.width + 'px';
  el.style.height = obj.height + 'px';

  switch (obj.type) {
    case 'photo': {
      const img = document.createElement('img');
      img.src = obj.src;
      img.alt = obj.caption || '';
      img.draggable = false;
      img.loading = 'lazy';
      img.decoding = 'async';
      el.appendChild(img);
      if (obj.caption) {
        const cap = document.createElement('div');
        cap.className = 'caption';
        cap.textContent = obj.caption;
        el.appendChild(cap);
      }
      break;
    }
    case 'video': {
      const video = document.createElement('video');
      video.src = obj.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      el.appendChild(video);

      if (obj.caption) {
        const cap = document.createElement('div');
        cap.className = 'caption';
        cap.textContent = obj.caption;
        el.appendChild(cap);
      }
      break;
    }
    case 'sticker': {
      el.style.background = obj.color || Board.CONFIG.CONFETTI_COLORS[0];
      el.textContent = obj.text || '';
      break;
    }
    case 'note': {
      if (obj.color) el.style.background = obj.color;
      el.style.whiteSpace = 'pre-wrap';
      el.innerHTML = obj.text || '';
      break;
    }
    case 'text': {
      el.style.fontSize = (obj.fontSize || 22) + 'px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = obj.text || '';
      if (obj.src) {
        const img = document.createElement('img');
        img.src = obj.src;
        img.style.width = obj.width + 'px';
        img.style.height = obj.height + 'px';
        img.draggable = false;
        el.appendChild(img);
      }
      break;
    }
    default:
      el.textContent = '[неизвестный тип: ' + obj.type + ']';
  }

  Board.state.elementsById[obj.id] = el;
  Board.applyTransform(obj, el);
  return el;
};

/**
 * Writes obj.x/y/rotation/z onto the element's CSS transform + z-index.
 * Called on every drag move, so keep it cheap.
 */
Board.applyTransform = function applyTransform(obj, el) {
  el = el || Board.state.elementsById[obj.id];
  if (!el) return;
  const halfW = obj.width / 2;
  const halfH = obj.height / 2;
  el.style.transform =
    'translate3d(' + (obj.x - halfW) + 'px, ' + (obj.y - halfH) + 'px, 0) ' +
    'rotate(' + obj.rotation + 'deg)';
  el.style.zIndex = obj.z;
};

/**
 * Renders the full object list into #world. Called once at startup.
 */
Board.renderAll = function renderAll() {
  const world = document.getElementById('world');
  const frag = document.createDocumentFragment();
  Board.state.objects.forEach(obj => {
    frag.appendChild(Board.createCardElement(obj));
  });
  world.appendChild(frag);
};

/**
 * Brings a card to front by handing it the next z value.
 */
Board.bringToFront = function bringToFront(obj) {
  obj.z = Board.state.zCounter++;
  Board.applyTransform(obj);
};

Board.getObjectById = function getObjectById(id) {
  return Board.state.objects.find(o => o.id === id);
};
