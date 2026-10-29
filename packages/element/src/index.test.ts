import { describe, expect, it } from 'vitest';
import { PAPER_SHADERS_VERSION, VITRINE_TAG } from './index.js';

describe('vitrine-shaders skeleton', () => {
  it('should pin the exact Paper Shaders version decided in ADR-0001', () => {
    expect(PAPER_SHADERS_VERSION).toBe('0.0.82');
  });

  it('should use a hyphenated custom element tag name', () => {
    expect(VITRINE_TAG).toMatch(/^[a-z]+-[a-z-]+$/);
  });
});
