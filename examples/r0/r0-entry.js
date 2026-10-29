// R0 proof sheets: the official React wrappers (same 0.0.82 pin as the element), bundled by scripts/r0-sheets.mjs into
// r0.bundle.js (gitignored). Only for the R0 sheets and the hero mockup; not a runtime dependency of VITRINE.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FlutedGlass,
  GrainGradient,
  HalftoneCmyk,
  ImageDithering,
  LensDistortion,
  LiquidMetal,
  PaperTexture,
  PulsingBorder,
  Water,
} from '@paper-design/shaders-react';

export const COMPONENTS = {
  'fluted-glass': FlutedGlass,
  'lens-distortion': LensDistortion,
  water: Water,
  'liquid-metal': LiquidMetal,
  'pulsing-border': PulsingBorder,
  'grain-gradient': GrainGradient,
  'paper-texture': PaperTexture,
  'image-dithering': ImageDithering,
  'halftone-cmyk': HalftoneCmyk,
};

/** Mount one shader into `container`. Resolves once the canvas has a size and two frames have been drawn. */
export function mount(container, effect, props) {
  const Component = COMPONENTS[effect];
  if (!Component) throw new Error(`unknown effect ${effect}`);
  const root = createRoot(container);
  const render = (p) =>
    root.render(createElement(Component, { ...p, style: { width: '100%', height: '100%' } }));
  render(props);
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    const tick = () => {
      const mountRef = container.firstElementChild?.paperShaderMount;
      if (mountRef && mountRef.canvasElement.width > 0) {
        // two more frames so the texture upload and the first draw have happened
        requestAnimationFrame(() => requestAnimationFrame(() => resolve({ root, render, mount: mountRef })));
        return;
      }
      if (performance.now() - t0 > 20000) return reject(new Error(`${effect}: mount did not appear`));
      requestAnimationFrame(tick);
    };
    tick();
  });
}
