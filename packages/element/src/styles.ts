/**
 * Element stylesheet, injected once per document (light DOM on purpose: theme CSS keeps styling the <img>).
 * Reveal timing lives in custom properties so a theme can retune it: --vitrine-reveal-duration, --vitrine-reveal-ease.
 * 320 ms, cubic-bezier(.2,0,0,1): "premium/corporate" range, under the 400 ms cap of PLAN D6; the photo
 * fades in underneath while the print layer fades out. Opacity only: any transform would resample the
 * dither grid and blur the print.
 * v0.2 (ADR-0003): glass has no opacity reveal (its pane slides on a live context, motion.ts); its content <img> is
 * scaled by the preset's `scale` (`--vitrine-image-scale`) so the open state matches the shader's cover crop.
 * The loupe ring is the R0 one: 1 px of ink at 28 %.
 */
export const VITRINE_CSS = `
vitrine-shader{display:block;position:relative;isolation:isolate;aspect-ratio:var(--vitrine-aspect,auto)}
:where(vitrine-shader>img){display:block;max-width:100%}
vitrine-shader>.vitrine-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:1;transition:opacity var(--vitrine-reveal-duration,320ms) var(--vitrine-reveal-ease,cubic-bezier(.2,0,0,1))}
vitrine-shader:not([effect="glass"])[data-vitrine-revealed]>.vitrine-layer{opacity:0}
vitrine-shader>.vitrine-layer>img,vitrine-shader>.vitrine-layer>canvas.vitrine-parked,vitrine-shader>.vitrine-layer>.vitrine-live{display:block;position:absolute;inset:0;width:100%;height:100%}
vitrine-shader[effect="glass"]{overflow:hidden}
vitrine-shader[effect="glass"]>.vitrine-layer{transition:none}
vitrine-shader[effect="glass"]>img{transform:scale(var(--vitrine-image-scale,1))}
vitrine-shader[effect="lens"]{overflow:hidden;-webkit-touch-callout:none}
vitrine-shader[effect="lens"]>img{-webkit-touch-callout:none;-webkit-user-drag:none}
vitrine-shader>.vitrine-layer>.vitrine-loupe{position:absolute;left:0;top:0;border-radius:50%;overflow:hidden;transform-origin:50% 50%;box-shadow:0 0 0 1px rgba(20,19,18,.28)}
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
