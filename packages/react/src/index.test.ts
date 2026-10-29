import { describe, expect, it } from 'vitest';
import { VITRINE_TAG } from './index.js';

describe('@vitrine/react skeleton', () => {
  it('should resolve the workspace dependency on vitrine-shaders', () => {
    expect(VITRINE_TAG).toBe('vitrine-shader');
  });
});
