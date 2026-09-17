/**
 * confetti.js
 * A small self-contained confetti burst on a full-screen canvas.
 * Deliberately not a library dependency — this way colors match the
 * board's palette exactly and there's nothing to fetch from a CDN.
 */
window.Board = window.Board || {};

(function () {
  let canvas, ctx, particles = [], animId = null, resizeBound = false;

  function ensureCanvas() {
    canvas = document.getElementById('confetti-canvas');
    ctx = canvas.getContext('2d');
    resize();
    if (!resizeBound) {
      window.addEventListener('resize', resize);
      resizeBound = true;
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnParticle() {
    const colors = Board.CONFIG.CONFETTI_COLORS;
    return {
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.3,
      vx: (Math.random() - 0.5) * 140,
      vy: 220 + Math.random() * 260,
      size: 6 + Math.random() * 7,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 8,
      color: colors[(Math.random() * colors.length) | 0],
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
      born: performance.now(),
    };
  }

  Board.launchConfetti = function launchConfetti() {
    ensureCanvas();
    const count = Board.CONFIG.CONFETTI_COUNT;
    for (let i = 0; i < count; i++) {
      particles.push(spawnParticle());
    }
    if (!animId) {
      let last = performance.now();
      const startedAt = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.10, (now - last) / 1000);
        last = now;
        step(dt);
        if (particles.length > 0 && now - startedAt < Board.CONFIG.CONFETTI_DURATION + 2000) {
          animId = requestAnimationFrame(loop);
        } else {
          particles = [];
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animId = null;
        }
      };
      animId = requestAnimationFrame(loop);
    }
  };

  function step(dt) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const gravity = 480;
    const now = performance.now();
    particles = particles.filter(p => (now - p.born) < Board.CONFIG.CONFETTI_DURATION);

    for (const p of particles) {
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;

      const age = (now - p.born) / Board.CONFIG.CONFETTI_DURATION;
      const alpha = age > 0.7 ? Math.max(0, 1 - (age - 0.7) / 0.3) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
})();
