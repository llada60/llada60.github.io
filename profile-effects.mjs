import { mountGalaxy } from './static/effects/galaxy.mjs';
import { mountOrb } from './static/effects/orb.mjs';

const about = document.querySelector('#about');
const galaxy = about.querySelector('.galaxy-background');
const sphere = about.querySelector('.portrait-sphere');
const orb = sphere.querySelector('.orb-ring');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let cleanups = [];

function dispose() {
  cleanups.forEach(cleanup => cleanup?.());
  cleanups = [];
  galaxy.replaceChildren();
  orb.replaceChildren();
  orb.classList.remove('has-orb');
  about.classList.remove('has-galaxy');

}
function mount() {
  dispose();
  for (const [host, create, target, className] of [
    [galaxy, mountGalaxy, about, 'has-galaxy'],
    [orb, mountOrb, sphere, 'has-orb']
  ]) {
    // Keep the starfield fallback and original photograph without WebGL.
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) continue;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    try {
      const cleanup = create(host, target);
      if (cleanup) {
        cleanups.push(cleanup);
        (host === galaxy ? about : host).classList.add(className);
      }
    } catch {
      host.querySelectorAll('canvas').forEach(canvas => canvas.remove());
    }
  }
}
window.addEventListener('themechange', mount);
reduced.addEventListener('change', mount);
window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
mount();
