import { describe, expect, it } from 'vitest';
import { EFFECTS, PAPER_SHADERS_VERSION, VITRINE_TAG, isEffect } from './index.js';

describe('vitrine-shaders package surface', () => {
  it('should pin the exact Paper Shaders version decided in ADR-0001', () => {
    expect(PAPER_SHADERS_VERSION).toBe('0.0.82');
  });

  it('should keep the four v1 effects first (PLAN D2) and add glass and lens (ADR-0003)', () => {
    expect(VITRINE_TAG).toBe('vitrine-shader');
    // Backwards compatibility: v0.1 names unchanged and in the same order.
    expect([...EFFECTS].slice(0, 4)).toEqual(['dither', 'halftone', 'mesh', 'paper']);
    expect([...EFFECTS]).toEqual(['dither', 'halftone', 'mesh', 'paper', 'glass', 'lens']);
    expect(isEffect('glass')).toBe(true);
    expect(isEffect('dither')).toBe(true);
    expect(isEffect('liquid-metal')).toBe(false);
  });
});
