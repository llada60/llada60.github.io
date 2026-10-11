/* An original, buildless interpretation of React Bits' Gooey Nav interaction.
   https://reactbits.dev/components/gooey-nav */
(() => {
  const nav = document.querySelector('.gooey-nav');
  const links = [...nav.querySelectorAll('a')];
  const effects = nav.querySelector('.gooey-effects');
  const pill = nav.querySelector('.nav-pill');
  const sections = links.map(link => document.querySelector(link.hash));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = Math.max(0, links.findIndex(link => link.hash === location.hash));
  let scrollFrame = 0;
  let scrollLockUntil = 0;

  const bounds = index => {
    const box = links[index].getBoundingClientRect();
    const parent = effects.getBoundingClientRect();
    return { x: box.left - parent.left, y: box.top - parent.top, w: box.width, h: box.height };
  };

  function particles(from, to) {
    effects.querySelectorAll('.nav-particle').forEach(particle => particle.remove());
    if (motion.matches || !Element.prototype.animate) return;
    const direction = Math.sign(to.x - from.x) || 1;
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('span');
      particle.className = 'nav-particle';
      const size = 7 + Math.random() * 10;
      const startX = from.x + from.w / 2 - size / 2;
      const startY = from.y + from.h / 2 - size / 2;
      const dx = to.x + to.w / 2 - size / 2 - startX;
      const spread = (i % 2 ? -1 : 1) * (10 + Math.random() * 19);
      Object.assign(particle.style, { left: `${startX}px`, top: `${startY}px`, width: `${size}px`, height: `${size}px` });
      effects.append(particle);
      const animation = particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * .4 + direction * 10}px, ${spread}px) scale(1.1)`, opacity: 1, offset: .4 },
        { transform: `translate(${dx}px, 0) scale(.4)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 220, easing: 'cubic-bezier(.22,1,.36,1)', delay: Math.random() * 70 });
      animation.onfinish = () => particle.remove();
    }
  }

  function select(index, animate = true) {
    const previous = bounds(active);
    const next = bounds(index);
    if (index !== active && animate) particles(previous, next);
    active = index;
    links.forEach((link, i) => {
      link.classList.toggle('is-active', i === index);
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    Object.assign(pill.style, { left: `${next.x}px`, top: `${next.y}px`, width: `${next.w}px`, height: `${next.h}px` });
  }

  links.forEach((link, index) => link.addEventListener('click', () => {
    scrollLockUntil = performance.now() + (motion.matches ? 0 : 1100);
    select(index);
  }));

  function syncScroll() {
    scrollFrame = 0;
    if (performance.now() < scrollLockUntil) return;
    const threshold = document.querySelector('.site-header').getBoundingClientRect().height + 70;
    let index = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= threshold) index = i; });
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) index = sections.length - 1;
    if (index !== active) select(index);
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll); }, { passive: true });
  window.addEventListener('hashchange', () => {
    const index = links.findIndex(link => link.hash === location.hash);
    if (index >= 0) select(index);
  });
  new ResizeObserver(() => select(active, false)).observe(nav);
  document.fonts.ready.then(() => select(active, false));
  select(active, false);
  nav.classList.add('is-ready');
})();
