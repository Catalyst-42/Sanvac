/**
 * save.js
 * Pressing "I" writes out the current positions/sizes/rotations of
 * every card as a fresh JSON file, in the same schema as
 * files/data.json, so it can be dropped back in to persist a layout.
 * Paths are kept as plain readable strings — never URL-encoded.
 */
window.Board = window.Board || {};

Board.saveBoardToFile = function saveBoardToFile() {
  const exportable = {
    objects: Board.state.objects.map(obj => {
      const out = {
        id: obj.id,
        type: obj.type,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        width: Math.round(obj.width),
        height: Math.round(obj.height),
        rotation: Math.round(obj.rotation * 100) / 100,
        z: obj.z,
      };
      if (obj.src) out.src = obj.src;
      if (obj.caption !== undefined) out.caption = obj.caption;
      if (obj.text !== undefined) out.text = obj.text;
      if (obj.color) out.color = obj.color;
      if (obj.fontSize) out.fontSize = obj.fontSize;
      return out;
    }),
  };

  const json = JSON.stringify(exportable, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = url;
  a.download = 'data-' + stamp + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};
