// R0 · candidate effects from docs/vitrine/KIERUNEK-v2.md, three presets each, tuned against one bar:
// the product must read better (or be more interesting) than without the effect, never less legible.
// Colours follow the Lock: paper #EFEBE4, ink #141312, no UI accent; colour comes from the photographs.
import { ease } from './lib.js';

export const PAPER = '#EFEBE4';
export const INK = '#141312';
const CLEAR = '#00000000';
const still = { speed: 0, frame: 0 };

// Video timelines (seconds → transition t, or extra props). Premium archetype from motion-design: 350–600 ms,
// no overshoot; enter slower than exit; glass is rigid, so no bounce.
const seg = (sec, a, b) => Math.min(1, Math.max(0, (sec - a) / (b - a)));
function doorVideo(sec) {
  // rest 0.4 s · open 0.6 s · hold 0.7 s · close 0.45 s · rest
  return sec < 1.7 ? { t: seg(sec, 0.4, 1.0) } : { t: 1 - seg(sec, 1.7, 2.15) };
}
function loupeVideo(sec, cell) {
  // grow 0.35 s at the first detail, then glide to a second one over 0.9 s, then shrink 0.25 s
  const g = sec < 1.8 ? seg(sec, 0.3, 0.65) : 1 - seg(sec, 1.9, 2.15);
  const m = ease.inOut(seg(sec, 0.8, 1.7));
  // date window → bracelet links; the path stays off the maker's wordmark on the left of the dial
  return { t: g, x: cell.w * (0.6 + 0.17 * m), y: cell.h * (0.53 - 0.01 * m) };
}
function pulseVideo(sec) {
  // one ripple, 1.1 s, after a 0.3 s rest
  return { t: seg(sec, 0.3, 1.4) };
}

export const EFFECTS = [
  {
    id: 'fluted-glass',
    title: 'Fluted glass',
    role: 'Product card, default. The card stands behind reeded shop-window glass; the glass slides away on hover or tap.',
    mode: 'image',
    photos: ['04-chair', '01-vase', '08-headphones'],
    // patternSize = mix(200, 5, size) flutes across the image width: 0.95 ≈ 15 reeds, like a shop door, not a screen.
    // scale 1.06 overfills the card so the reeds never sample outside the photo (a paper strip at the right edge).
    base: {
      ...still,
      fit: 'cover',
      scale: 1.06,
      colorBack: CLEAR,
      colorShadow: INK,
      colorHighlight: '#ffffff',
      shape: 'lines',
      angle: 0,
      edges: 0,
    },
    presets: [
      {
        name: 'Window',
        props: { size: 0.95, distortionShape: 'contour', distortion: 0.3, highlights: 0.18, shadows: 0.2 },
      },
      {
        name: 'Door',
        props: { size: 0.965, distortionShape: 'lens', distortion: 0.22, highlights: 0.2, shadows: 0.22 },
      },
      {
        name: 'Frost',
        props: {
          size: 0.95,
          distortionShape: 'contour',
          distortion: 0.3,
          blur: 0.12,
          highlights: 0.15,
          shadows: 0.2,
          grainOverlay: 0.03,
        },
      },
    ],
    // the pane slides to the right like a shop door: marginLeft 0 → 1 (outside the margins the photo is untouched)
    transition: { preset: 0, photo: '05-lamp', at: (t) => ({ marginLeft: ease.inOut(t) }), video: doorVideo },
  },
  {
    id: 'fluted-glass-preorder',
    shader: 'fluted-glass',
    title: 'Fluted glass · pre-order',
    role: 'Coming soon. Heavier frosted glass bound to the release date: it clears as the day gets closer.',
    mode: 'image',
    photos: ['03-sneaker', '02-perfume', '07-bag'],
    // same reeds as the card, frosted: blur clears with the release date (bind it to days left, 30 → 1)
    base: {
      ...still,
      fit: 'cover',
      scale: 1.06,
      colorBack: CLEAR,
      colorShadow: INK,
      colorHighlight: '#ffffff',
      shape: 'lines',
      angle: 0,
      edges: 0,
      size: 0.95,
      distortionShape: 'contour',
    },
    presets: [
      {
        name: '30 days out',
        props: {
          distortion: 0.5,
          blur: 0.6,
          stretch: 0.1,
          highlights: 0.12,
          shadows: 0.2,
          grainOverlay: 0.05,
        },
      },
      {
        name: '7 days out',
        props: { distortion: 0.4, blur: 0.3, highlights: 0.15, shadows: 0.2, grainOverlay: 0.04 },
      },
      {
        name: '1 day out',
        props: { distortion: 0.3, blur: 0.1, highlights: 0.18, shadows: 0.2, grainOverlay: 0.02 },
      },
    ],
  },
  {
    id: 'lens-distortion',
    title: 'Lens distortion',
    role: 'Product page. A loupe under the cursor instead of a zoom pane.',
    mode: 'loupe',
    photoW: 1600, // the loupe magnifies 2.2×: the 1000 px file goes soft
    photos: ['06-watch', '07-bag', '03-sneaker'],
    // loupe centre per photo, as a fraction of the cell (the detail a shopper would look at)
    focus: { '06-watch': [0.6, 0.53], '07-bag': [0.5, 0.42], '03-sneaker': [0.52, 0.6] },
    loupe: { size: 0.5, zoom: 2.2 },
    base: { ...still, spread: 0, count: 12, lensBulge: 0, lensCircle: 0 },
    presets: [
      { name: 'Loupe', props: { lensBulge: 0.35, lensCircle: 0.6 } },
      {
        name: 'Glass',
        props: {
          lensBulge: 0.55,
          lensCircle: 1,
          spread: 0.15,
          dispersion: 0.3,
          perspective: 1,
          focusCenter: 0.85,
          focusEdges: 0,
        },
      },
      {
        name: 'Fisheye',
        props: {
          lensBulge: 0.8,
          lensCircle: 1,
          spread: 0.12,
          dispersion: 0.5,
          perspective: 1,
          focusCenter: 0.8,
          focusEdges: 0,
        },
      },
    ],
    transition: { preset: 0, photo: '06-watch', at: (t) => ({ grow: ease.out(t) }), video: loupeVideo },
  },
  {
    id: 'water',
    title: 'Water',
    role: 'Add to cart. One ripple across the photo after the click. Shown at the peak of the ripple.',
    mode: 'image',
    photos: ['09-mug', '11-candle', '12-plant'],
    // scale 1.1: the waves move the photo edges inwards; without it the paper shows round the frame
    base: {
      speed: 0,
      frame: 3200,
      fit: 'cover',
      scale: 1.1,
      colorBack: CLEAR,
      colorHighlight: '#ffffff',
      edges: 0,
    },
    presets: [
      {
        name: 'Pool light',
        props: { caustic: 0.02, waves: 0.03, layering: 0.4, highlights: 0.18, size: 1.4 },
      },
      {
        name: 'Light and ripple',
        props: { caustic: 0.05, waves: 0.06, layering: 0.5, highlights: 0.12, size: 1 },
      },
      { name: 'Surface', props: { caustic: 0.03, waves: 0.2, layering: 0, highlights: 0.04, size: 2.5 } },
    ],
    transition: {
      preset: 0,
      photo: '09-mug',
      // scale follows the amplitude so the rest frame is the untouched photo at scale 1 (no jump when it starts)
      at: (t, p) => {
        const a = ease.pulse(t);
        return {
          caustic: p.caustic * a,
          waves: p.waves * a,
          highlights: p.highlights * a,
          scale: 1 + 0.1 * a,
          frame: 3200 + t * 1600,
        };
      },
      video: pulseVideo,
    },
  },
  {
    id: 'liquid-metal',
    title: 'Liquid metal',
    role: 'Badge or CTA, one per page. A gilt sign like lettering painted on a shop window.',
    mode: 'badge',
    badge: { text: 'NEW', w: 0.36 },
    photos: ['05-lamp', '02-perfume', '10-sunglasses'],
    base: {
      ...still,
      frame: 2000,
      fit: 'contain',
      scale: 1,
      colorBack: CLEAR,
      distortion: 0.02,
      angle: 70,
      contour: 0.2,
      shiftRed: 0,
      shiftBlue: 0,
    },
    // second round, after chrome/graphite/gilt at softness 0.15–0.4 read as WordArt: softer, fewer bands
    presets: [
      { name: 'Chrome', props: { colorTint: '#ffffff', repetition: 1.2, softness: 0.5 } },
      { name: 'Gilt', props: { colorTint: '#C8A86E', repetition: 1.2, softness: 0.5 } },
      {
        name: 'Ink',
        props: { colorTint: '#57524c', repetition: 1, softness: 0.6, distortion: 0, contour: 0 },
      },
    ],
  },
  {
    id: 'pulsing-border',
    title: 'Pulsing border',
    role: 'Badge or CTA, one per page. A frame that breathes around a single card (last item, back in stock).',
    mode: 'overlay',
    photos: ['08-headphones', '12-plant', '01-vase'],
    // spots 5–6 at spotSize ≥ 0.9 close the frame; with spots 2 only fragments light up and it reads as a render bug
    base: {
      ...still,
      frame: 1500,
      fit: 'cover',
      scale: 1,
      colorBack: CLEAR,
      roundness: 0,
      aspectRatio: 'auto',
      smoke: 0,
      bloom: 0,
      softness: 0,
    },
    presets: [
      {
        name: 'Thread',
        props: {
          colors: [INK],
          thickness: 0.012,
          intensity: 0.4,
          spots: 5,
          spotSize: 0.9,
          pulse: 0.2,
          margin: 0.03,
        },
      },
      {
        name: 'Gilt',
        props: {
          colors: ['#B8955A'],
          thickness: 0.015,
          softness: 0.1,
          intensity: 0.5,
          spots: 5,
          spotSize: 0.9,
          pulse: 0.2,
          margin: 0.03,
        },
      },
      {
        name: 'Ink inset',
        props: {
          colors: [INK, '#57524c'],
          thickness: 0.006,
          intensity: 0.6,
          spots: 6,
          spotSize: 1,
          pulse: 0,
          margin: 0.05,
        },
      },
    ],
  },
  {
    id: 'grain-gradient',
    title: 'Grain gradient',
    role: 'Section background. Grain in the theme colours, almost invisible; the card sits on it.',
    mode: 'backdrop',
    photos: ['01-vase', '09-mug', '06-watch'],
    base: { ...still, frame: 1000, fit: 'cover', softness: 0.8, intensity: 0.35, shape: 'corners' },
    // first round (noise 0.3–0.4, intensity 0.15–0.2) was invisible: flat colour a CSS background gives for free
    presets: [
      { name: 'Paper', props: { colorBack: PAPER, colors: ['#DDD6CA', '#F7F4EF'], noise: 0.6 } },
      { name: 'From the photo', fromPhoto: true, props: { noise: 0.55 } },
      { name: 'Ink', props: { colorBack: INK, colors: ['#35312D', '#0E0D0C'], noise: 0.6 } },
    ],
  },
  {
    id: 'paper-texture',
    title: 'Paper texture',
    role: 'Lookbook or packaging. Fold and fibre of paper over an editorial photo.',
    mode: 'image',
    photos: ['11-candle', '12-plant', '07-bag'],
    // first round (colorPaper alpha 0.38–0.5) washed the photos out; the paper now only carries fold and fibre
    base: {
      ...still,
      fit: 'cover',
      scale: 1,
      colorBack: CLEAR,
      blending: 1,
      angle: 236,
      seed: 613,
      roughnessRows: 0,
      foldOffsetX: 0,
      foldOffsetY: 0,
      drops: 0,
    },
    presets: [
      {
        name: 'Fold',
        props: {
          colorPaper: '#ffffff30',
          colorShadow: '#bdb8b0',
          distortion: -0.1,
          roughness: 0.1,
          roughnessSize: 0.25,
          fiber: 0.2,
          fiberSize: 0.5,
          folds: 0.5,
          foldSizeX: 0.5,
          foldSizeY: 0.9,
          wrinkles: 0,
          crumples: 0,
        },
      },
      {
        name: 'Crumple',
        props: {
          colorPaper: '#ffffff30',
          colorShadow: '#b0aba4',
          distortion: 0.15,
          roughness: 0.1,
          roughnessSize: 0.4,
          fiber: 0.15,
          fiberSize: 0.5,
          folds: 0.1,
          foldSizeX: 1,
          foldSizeY: 1,
          wrinkles: 0.2,
          wrinkleSize: 0.5,
          crumples: 0.3,
          crumpleCount: 5,
        },
      },
      {
        name: 'Board',
        props: {
          colorPaper: '#ffffff20',
          colorShadow: '#c4bfb8',
          distortion: 0,
          roughness: 0.3,
          roughnessSize: 0.5,
          fiber: 0.4,
          fiberSize: 0.4,
          folds: 0,
          wrinkles: 0,
          crumples: 0,
        },
      },
    ],
  },
  {
    id: 'image-dithering',
    title: 'Image dithering',
    role: 'Optional print mode for graphic brands, never the default.',
    mode: 'image',
    photos: ['04-chair', '05-lamp', '06-watch'],
    // upstream colorFront is the light tone: ink on paper means colorFront paper, colorBack ink (round one came out negative)
    base: { ...still, fit: 'cover', colorFront: PAPER, colorBack: INK, colorHighlight: PAPER },
    presets: [
      { name: 'Ink on paper', props: { type: '8x8', size: 2, colorSteps: 1, originalColors: false } },
      { name: 'Ink, two steps', props: { type: '8x8', size: 2, colorSteps: 2, originalColors: false } },
      { name: 'Colour', props: { type: '8x8', size: 1, colorSteps: 4, originalColors: true } },
    ],
  },
  {
    id: 'halftone-cmyk',
    title: 'Halftone CMYK',
    role: 'Optional print mode for graphic brands, never the default.',
    mode: 'image',
    photos: ['03-sneaker', '05-lamp', '09-mug'],
    base: {
      ...still,
      fit: 'cover',
      colorBack: PAPER,
      colorC: '#00b4ff',
      colorM: '#fc519f',
      colorY: '#ffd800',
      colorK: '#231f20',
      type: 'ink',
      grainMixer: 0,
      grainOverlay: 0,
      floodC: 0,
      floodM: 0,
      floodY: 0,
      floodK: 0,
      gainC: 0,
      gainM: 0,
      gainY: 0,
      gainK: 0,
    },
    presets: [
      { name: 'Fine', props: { size: 0.12, contrast: 1, softness: 1, gridNoise: 0.1 } },
      {
        name: 'Press',
        props: { size: 0.25, contrast: 1.1, softness: 0.4, gridNoise: 0.3, grainOverlay: 0.1 },
      },
      {
        name: 'Coarse',
        props: { size: 0.4, contrast: 1.1, softness: 0.6, gridNoise: 0.3, grainOverlay: 0.08 },
      },
    ],
  },
];

export const byId = (id) => {
  const e = EFFECTS.find((x) => x.id === id);
  if (!e) throw new Error(`unknown effect ${id}`);
  return e;
};
