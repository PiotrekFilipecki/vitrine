// Reference renderer for the pixel-compatibility tests: the official React wrappers (same 0.0.82 pin),
// bundled by scripts/e2e-setup.mjs into ref.bundle.js (gitignored). Never a runtime dependency (ADR-0001).
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { HalftoneCmyk, ImageDithering, MeshGradient, PaperTexture } from '@paper-design/shaders-react';

const COMPONENTS = {
  dither: ImageDithering,
  halftone: HalftoneCmyk,
  mesh: MeshGradient,
  paper: PaperTexture,
};

/** Mount the React reference with the same preset params, speed 0 and frame 0. Resolves with the vanilla mount. */
export function mountRef(container, effect, params, image) {
  const Component = COMPONENTS[effect];
  const root = createRoot(container);
  const props = { ...params, speed: 0, frame: 0, style: { width: '100%', height: '100%' } };
  if (image) props.image = image;
  root.render(createElement(Component, props));
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    const tick = () => {
      const div = container.firstElementChild;
      const mount = div && div.paperShaderMount;
      if (mount && mount.canvasElement.width > 0) return resolve({ root, mount, div });
      if (performance.now() - t0 > 15000) return reject(new Error('reference mount did not appear'));
      requestAnimationFrame(tick);
    };
    tick();
  });
}
