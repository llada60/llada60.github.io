/* Adapted for this homepage from React Bits / David Haz.
 * Source: https://github.com/DavidHDev/react-bits
 * License: ./react-bits-LICENSE.md
 */
import { Renderer, Program, Mesh, Triangle, Color } from './ogl.mjs';
const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0
const vec3 STAR_TINT = vec3(0.768627, 0.709804, 0.992157); // #C4B5FD

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.12;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = (uv - mousePosUV) / max(mouseDist, 0.001) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
    uv += mouseNorm * 0.15 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    gl_FragColor = vec4(STAR_TINT, coverage);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(STAR_TINT, alpha);
  } else {
    gl_FragColor = vec4(STAR_TINT, 1.0);
  }
}
`;

export function mountGalaxy(container, interactionTarget) {
  const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uniforms = {
    uTime: { value: 0 }, uResolution: { value: new Color(1, 1, 1) },
    uFocal: { value: new Float32Array([0.5, 0.5]) },
    uRotation: { value: new Float32Array([1, 0]) },
    uStarSpeed: { value: 0 }, uDensity: { value: 1 },
    uHueShift: { value: 270 }, uSpeed: { value: 0.35 },
    uMouse: { value: new Float32Array([0.5, 0.5]) },
    uGlowIntensity: { value: 0.35 }, uSaturation: { value: 1 },
    uMouseRepulsion: { value: true }, uTwinkleIntensity: { value: 0.3 },
    uRotationSpeed: { value: 0.025 }, uRepulsionStrength: { value: 2 },
    uMouseActiveFactor: { value: 0 }, uAutoCenterRepulsion: { value: 0 },
    uTransparent: { value: true },
    uLightMode: { value: document.documentElement.dataset.theme === 'dark' ? 0 : 1 }
  };
  const geometry = new Triangle(gl);
  const program = new Program(gl, { vertex: vertexShader, fragment: fragmentShader, uniforms });
  const mesh = new Mesh(gl, { geometry, program });
  const pointer = { x: 0.5, y: 0.5, active: 0 };
  let frame = null;
  let inViewport = true;
  let alive = true;
  let time = 0;
  let last = null;

  function render(now) {
    frame = null;
    if (!alive || document.hidden || !inViewport) return;
    if (!reduced) {
      if (last !== null) time += Math.min((now - last) / 1000, 0.05);
      last = now;
    }
    uniforms.uTime.value = time;
    uniforms.uStarSpeed.value = time * 0.03;
    uniforms.uMouse.value[0] += (pointer.x - uniforms.uMouse.value[0]) * 0.12;
    uniforms.uMouse.value[1] += (pointer.y - uniforms.uMouse.value[1]) * 0.12;
    uniforms.uMouseActiveFactor.value += (pointer.active - uniforms.uMouseActiveFactor.value) * 0.12;
    renderer.render({ scene: mesh });
    if (!reduced) frame = requestAnimationFrame(render);
  }
  function wake() {
    if (alive && inViewport && !document.hidden && frame === null) {
      last = null;
      frame = requestAnimationFrame(render);
    }
  }
  function sleep() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    last = null;
  }
  function resize() {
    renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));
    uniforms.uResolution.value = new Color(canvas.width, canvas.height, canvas.width / canvas.height);
    wake();
  }
  function move(event) {
    if (reduced) return;
    const rect = interactionTarget.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
    pointer.y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
    pointer.active = 1;
  }
  function leave() { pointer.active = 0; }
  function visibility() { if (document.hidden) sleep(); else wake(); }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    if (inViewport) wake(); else sleep();
  });
  intersectionObserver.observe(interactionTarget);
  interactionTarget.addEventListener('pointermove', move, { passive: true });
  interactionTarget.addEventListener('pointerleave', leave, { passive: true });
  interactionTarget.addEventListener('pointerup', leave, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  resize();
  return () => {
    alive = false;
    sleep();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    interactionTarget.removeEventListener('pointermove', move);
    interactionTarget.removeEventListener('pointerleave', leave);
    interactionTarget.removeEventListener('pointerup', leave);
    document.removeEventListener('visibilitychange', visibility);
    geometry.remove();
    program.remove();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
}
