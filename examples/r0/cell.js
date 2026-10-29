// One R0 cell: a photo with (or without) one effect, in the composition its shop role needs.
import { mount } from './r0.bundle.js';
import { PHOTO, focalCrop, loadImage, loupeProps, textMask } from './lib.js';
import { PAPER } from './effects.js';

function box(style) {
  const d = document.createElement('div');
  Object.assign(d.style, style);
  return d;
}
function photoImg(src, style = {}) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  Object.assign(img.style, { display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style });
  return img;
}

/** Point an object-fit: cover <img> at the photo's focal point. */
async function aimImg(img, src, photo, w, h) {
  const im = await loadImage(src);
  img.style.objectPosition = focalCrop(photo, w, h, im.naturalWidth / im.naturalHeight).objectPosition;
}

/** Average colour of the outer 6 % band of the photo: the backdrop colour of a studio shot. */
async function edgeColour(src) {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, 64, 64);
  const d = g.getImageData(0, 0, 64, 64).data;
  let r = 0,
    gr = 0,
    b = 0,
    n = 0;
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      if (x > 3 && x < 60 && y > 3 && y < 60) continue;
      const i = (y * 64 + x) * 4;
      r += d[i];
      gr += d[i + 1];
      b += d[i + 2];
      n++;
    }
  const hex = (v) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0');
  const at = (k) => `#${hex((r / n) * k)}${hex((gr / n) * k)}${hex((b / n) * k)}`;
  return { back: at(1), dark: at(0.94), light: at(1.05) };
}

/**
 * Build a cell of w×h CSS px. `preset` null = the photo without an effect.
 * Returns { node, ready, update(extra) } where update re-renders the shader with extra props (transitions).
 */
export function buildCell(effect, preset, photo, { w, h, photoW = 1000 }) {
  const src = PHOTO(photo, photoW);
  const node = box({
    position: 'relative',
    width: `${w}px`,
    height: `${h}px`,
    overflow: 'hidden',
    background: PAPER,
  });
  const props = preset ? { ...effect.base, ...preset.props } : null;
  let handle = null;
  let update = () => {};

  if (effect.mode === 'backdrop') {
    const cardW = Math.round(w * 0.58);
    const card = box({
      position: 'absolute',
      left: `${(w - cardW) / 2}px`,
      top: `${(h - cardW * 1.25) / 2}px`,
      width: `${cardW}px`,
      height: `${cardW * 1.25}px`,
      zIndex: 1,
    });
    const cardImg = photoImg(src);
    card.append(cardImg);
    const aimed = aimImg(cardImg, src, photo, cardW, cardW * 1.25);
    if (!preset) {
      node.append(card);
      return { node, ready: aimed, update };
    }
    const layer = box({ position: 'absolute', inset: '0' });
    node.append(layer, card);
    const ready = (async () => {
      let p = props;
      if (preset.fromPhoto) {
        const c = await edgeColour(src);
        p = { ...p, colorBack: c.back, colors: [c.dark, c.light] };
        preset.resolved = {
          ...(preset.resolved || {}),
          [photo]: { colorBack: c.back, colors: [c.dark, c.light] },
        };
      }
      await loadImage(src);
      handle = await mount(layer, effect.shader ?? effect.id, p);
      update = (extra) => handle.render({ ...p, ...extra });
    })();
    return { node, ready, update: (x) => update(x) };
  }

  if (effect.mode === 'image') {
    if (!preset) {
      const img = photoImg(src);
      node.append(img);
      return { node, ready: aimImg(img, src, photo, w, h), update };
    }
    const layer = box({ position: 'absolute', inset: '0' });
    node.append(layer);
    const ready = (async () => {
      const im = await loadImage(src);
      const { cx } = focalCrop(photo, w, h, im.naturalWidth / im.naturalHeight);
      // vertex shader: imageUV.x = (uv.x·box − offsetX) / scale + .5, so the centre lands on cx when offsetX = (.5 − cx)·scale
      const p = { ...props, image: src, offsetX: (0.5 - cx) * (props.scale ?? 1) };
      handle = await mount(layer, effect.shader ?? effect.id, p);
      update = (extra) => handle.render({ ...p, ...extra });
    })();
    return { node, ready, update: (x) => update(x) };
  }

  // modes with the plain photo underneath
  const under = photoImg(src);
  node.append(under);
  const aimed = aimImg(under, src, photo, w, h);
  if (!preset) return { node, ready: aimed, update };

  if (effect.mode === 'overlay') {
    const layer = box({ position: 'absolute', inset: '0' });
    node.append(layer);
    const ready = (async () => {
      handle = await mount(layer, effect.shader ?? effect.id, props);
      update = (extra) => handle.render({ ...props, ...extra });
    })();
    return { node, ready, update: (x) => update(x) };
  }

  if (effect.mode === 'badge') {
    const bw = Math.round(w * effect.badge.w);
    const bh = Math.round(bw * 0.5);
    const layer = box({
      position: 'absolute',
      left: `${Math.round(w * 0.06)}px`,
      top: `${Math.round(w * 0.05)}px`,
      width: `${bw}px`,
      height: `${bh}px`,
    });
    node.append(layer);
    const ready = (async () => {
      const mask = await textMask(effect.badge.text, { w: 600, h: 300 });
      handle = await mount(layer, effect.shader ?? effect.id, { ...props, image: mask });
      update = (extra) => handle.render({ ...props, image: mask, ...extra });
    })();
    return { node, ready, update: (x) => update(x) };
  }

  if (effect.mode === 'loupe') {
    const [fx, fy] = effect.focus[photo] ?? [0.5, 0.5];
    const L = Math.round(w * effect.loupe.size);
    const layer = box({
      position: 'absolute',
      width: `${L}px`,
      height: `${L}px`,
      borderRadius: '50%',
      overflow: 'hidden',
      boxShadow: `0 0 0 1px rgba(20,19,18,.28)`,
    });
    node.append(layer);
    const ready = (async () => {
      const img = await loadImage(src);
      const aspect = img.naturalWidth / img.naturalHeight;
      const place = (cx, cy, grow = 1) => {
        const size = Math.max(2, L * grow);
        Object.assign(layer.style, {
          left: `${cx - size / 2}px`,
          top: `${cy - size / 2}px`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: grow < 0.02 ? '0' : '1',
        });
        const zoom = 1 + (effect.loupe.zoom - 1) * grow;
        const lp = loupeProps({ cellW: w, cellH: h, aspect, L: size, cx, cy, zoom });
        return { ...props, ...lp, lensBulge: props.lensBulge * grow, image: src };
      };
      let cx = fx * w,
        cy = fy * h;
      handle = await mount(layer, effect.shader ?? effect.id, place(cx, cy));
      update = ({ grow = 1, x, y } = {}) => {
        if (x != null) cx = x;
        if (y != null) cy = y;
        handle.render(place(cx, cy, grow));
      };
    })();
    return { node, ready, update: (x) => update(x) };
  }
  throw new Error(`unknown mode ${effect.mode}`);
}
