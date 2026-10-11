/* Buildless click interaction inspired by React Bits' Click Spark.
   https://reactbits.dev/animations/click-spark */
(() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.className = 'click-spark-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const color = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b509ac';
  const duration = 450;
  const count = 8;
  let sparks = [];
  let frame = null;
  let width = 0;
  let height = 0;

  function clear() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    sparks = [];
    ctx.clearRect(0, 0, width, height);
  }

  function resize() {
    clear();
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.strokeStyle = color();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, width, height);
    sparks = sparks.filter(spark => timestamp - spark.start < duration);
    for (const spark of sparks) {
      const progress = Math.max(0, (timestamp - spark.start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const distance = eased * 27;
      const length = 11 * (1 - eased);
      const dx = Math.cos(spark.angle);
      const dy = Math.sin(spark.angle);
      ctx.globalAlpha = 1 - progress;
      ctx.beginPath();
      ctx.moveTo(spark.x + distance * dx, spark.y + distance * dy);
      ctx.lineTo(spark.x + (distance + length) * dx, spark.y + (distance + length) * dy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Schedule frames only while visible sparks remain.
    frame = sparks.length ? requestAnimationFrame(draw) : null;
  }

  document.addEventListener('click', event => {
    // Keyboard activation and secondary buttons do not have a click position.
    if (motion.matches || document.hidden || event.button !== 0 || event.detail === 0) return;
    const start = performance.now();
    const rotation = Math.random() * Math.PI / 4;
    for (let i = 0; i < count; i++) {
      sparks.push({ x: event.clientX, y: event.clientY, angle: rotation + i * Math.PI * 2 / count, start });
    }
    // Bound work during rapid clicking while allowing overlapping bursts.
    sparks = sparks.slice(-128);
    if (frame === null) frame = requestAnimationFrame(draw);
  }, { capture: true, passive: true });

  window.addEventListener('themechange', () => { clear(); ctx.strokeStyle = color(); });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', clear, { passive: true });
  window.addEventListener('pagehide', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  motion.addEventListener('change', clear);
  resize();
})();
