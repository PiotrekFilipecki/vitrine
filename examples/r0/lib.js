// Shared helpers for the R0 sheet, transition and hero pages.
export const PHOTO = (name, w = 1000) =>
  w === 1600 ? `/examples/fixtures/products/${name}.webp` : `/examples/fixtures/products/w${w}/${name}.webp`;

// Horizontal focal point of each photo (0–1 of the image width) for cover crops narrower than the photo.
export const FOCAL_X = { '08-headphones': 0.61, '11-candle': 0.45 };

/** Clamp the focal point so the crop stays inside the image; returns image-UV centre and CSS object-position. */
export function focalCrop(photo, boxW, boxH, aspect) {
  const fx = FOCAL_X[photo] ?? 0.5;
  const b = coverBox(boxW, boxH, aspect);
  const hw = boxW / b.x / 2; // visible half width in image UV
  if (hw >= 0.5) return { cx: 0.5, objectPosition: '50% 50%' };
  const cx = Math.min(1 - hw, Math.max(hw, fx));
  return { cx, objectPosition: `${(((cx - hw) / (1 - 2 * hw)) * 100).toFixed(2)}% 50%` };
}

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${src}`));
    img.src = src;
  });

/** Size of an image box fitted with `cover` into w×h (CSS px), same formula as the Paper vertex shader. */
export function coverBox(w, h, aspect) {
  const bx = Math.max(w / aspect, h) * aspect;
  return { x: bx, y: bx / aspect };
}

/**
 * Props that make a square L×L lens canvas centred on (cx, cy) show the cell's cover-fitted photo magnified `zoom`×.
 * Derived from vertex-shader.js (imageUV = (uv·box + offset) / scale + .5, y flipped at the end).
 */
export function loupeProps({ cellW, cellH, aspect, L, cx, cy, zoom }) {
  const cell = coverBox(cellW, cellH, aspect);
  const lens = coverBox(L, L, aspect);
  const scale = (zoom * cell.x) / lens.x;
  return {
    fit: 'cover',
    scale,
    offsetX: (-scale * (cx - cellW / 2)) / cell.x,
    offsetY: (-scale * (cy - cellH / 2)) / cell.y,
  };
}

export const ease = {
  // emphasised decelerate for reveals, standard for settles (motion-design: Premium archetype, no overshoot)
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  pulse: (t) => Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 2,
};

/** Draw centred uppercase text into a transparent PNG data URL (shape mask for liquid-metal). */
export async function textMask(text, { w = 600, h = 240, weight = 700, stretch = '62%' } = {}) {
  await document.fonts.load(`${weight} 100px Archivo`);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let size = h * 0.9;
  const font = () => `${weight} ${size}px Archivo`;
  g.font = font();
  if ('fontStretch' in g) g.fontStretch = stretch === '62%' ? 'ultra-condensed' : 'normal';
  while (g.measureText(text).width > w * 0.92 && size > 10) {
    size -= 2;
    g.font = font();
  }
  g.fillText(text, w / 2, h / 2 + size * 0.04);
  return c.toDataURL('image/png');
}
