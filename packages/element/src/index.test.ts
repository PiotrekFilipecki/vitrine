import { describe, expect, it } from 'vitest';
import { EFFECTS, PAPER_SHADERS_VERSION, VITRINE_TAG, isEffect } from './index.js';

describe('vitrine-shaders package surface', () => {
  it('should pin the exact Paper Shaders version decided in ADR-0001', () => {
    expect(PAPER_SHADERS_VERSION).toBe('0.0.82');
  });

  it('should expose the four v1 effects (PLAN D2) under a hyphenated tag', () => {
    expect(VITRINE_TAG).toBe('vitrine-shader');
    expect([...EFFECTS]).toEqual(['dither', 'halftone', 'mesh', 'paper']);
    expect(isEffect('dither')).toBe(true);
    expect(isEffect('liquid-metal')).toBe(false);
  });
});
