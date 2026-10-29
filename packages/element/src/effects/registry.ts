import type { VitrineEffect } from '../types.js';
import type { EffectModule } from './types.js';

/** Each effect is its own chunk: a page with only dithered cards never downloads the other three fragment shaders. */
const loaders: Record<VitrineEffect, () => Promise<{ default: EffectModule }>> = {
  dither: () => import('./dither.js'),
  halftone: () => import('./halftone.js'),
  mesh: () => import('./mesh.js'),
  paper: () => import('./paper.js'),
};

const loaded = new Map<VitrineEffect, Promise<EffectModule>>();

export const EFFECTS: readonly VitrineEffect[] = ['dither', 'halftone', 'mesh', 'paper'];

export function isEffect(name: string | null): name is VitrineEffect {
  return name !== null && (EFFECTS as readonly string[]).includes(name);
}

export function loadEffect(name: VitrineEffect): Promise<EffectModule> {
  let p = loaded.get(name);
  if (!p) {
    p = loaders[name]().then((m) => m.default);
    loaded.set(name, p);
  }
  return p;
}
