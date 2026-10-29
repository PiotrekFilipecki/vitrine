/**
 * Element stylesheet, injected once per document (light DOM on purpose: theme CSS keeps styling the <img>).
 * Reveal timing lives in custom properties so a theme can retune it: --vitrine-reveal-duration, --vitrine-reveal-ease.
 * 320 ms, cubic-bezier(.2,0,0,1): "premium/corporate" range, under the 400 ms cap of PLAN D6; the photo
 * fades in underneath while the print layer fades out. Opacity only: any transform would resample the
 * dither grid and blur the print.
 */
export const VITRINE_CSS = `
vitrine-shader{display:block;position:relative;isolation:isolate;aspect-ratio:var(--vitrine-aspect,auto)}
:where(vitrine-shader>img){display:block;max-width:100%}
vitrine-shader>.vitrine-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:1;transition:opacity var(--vitrine-reveal-duration,320ms) var(--vitrine-reveal-ease,cubic-bezier(.2,0,0,1))}
vitrine-shader[data-vitrine-revealed]>.vitrine-layer{opacity:0}
vitrine-shader>.vitrine-layer>img,vitrine-shader>.vitrine-layer>canvas.vitrine-parked{display:block;position:absolute;inset:0;width:100%;height:100%}
vitrine-shader[data-vitrine-state="fallback"]>.vitrine-layer{display:none}
@media (prefers-reduced-motion:reduce){vitrine-shader>.vitrine-layer{transition:none}}
`;

export function ensureStyles(doc: Document): void {
  if (doc.querySelector('style[data-vitrine]')) return;
  const style = doc.createElement('style');
  style.setAttribute('data-vitrine', '');
  style.textContent = VITRINE_CSS;
  doc.head.prepend(style);
}
