import { afterEach, describe, expect, it } from 'vitest';
import { getConfig, resetConfig, setConfig } from './config.js';

describe('config', () => {
  afterEach(() => resetConfig());

  // TEST: defaults are the PLAN D3 values
  it('should start from the defaults', () => {
    expect(getConfig()).toEqual({
      maxLive: 6,
      debug: false,
      bakeIdleMs: 1500,
      minPixelRatio: 2,
      maxPixelCount: undefined,
    });
  });

  // TEST: invalid pool sizes are ignored, valid ones applied
  it('should accept only positive integers for maxLive', () => {
    expect(setConfig({ maxLive: 0 }).maxLive).toBe(6);
    expect(setConfig({ maxLive: 1.5 }).maxLive).toBe(6);
    expect(setConfig({ maxLive: -1 }).maxLive).toBe(6);
    expect(setConfig({ maxLive: 4 }).maxLive).toBe(4);
  });

  // TEST: idle timeout and pixel ratio need finite non-negative / positive numbers
  it('should validate bakeIdleMs and minPixelRatio', () => {
    expect(setConfig({ bakeIdleMs: -1 }).bakeIdleMs).toBe(1500);
    expect(setConfig({ bakeIdleMs: 0 }).bakeIdleMs).toBe(0);
    expect(setConfig({ minPixelRatio: 0 }).minPixelRatio).toBe(2);
    expect(setConfig({ minPixelRatio: 1 }).minPixelRatio).toBe(1);
  });

  // TEST: maxPixelCount can be set and cleared with undefined
  it('should set and clear maxPixelCount', () => {
    expect(setConfig({ maxPixelCount: 1_000_000 }).maxPixelCount).toBe(1_000_000);
    expect(setConfig({ maxPixelCount: undefined }).maxPixelCount).toBeUndefined();
    expect(setConfig({ maxPixelCount: -5 }).maxPixelCount).toBeUndefined();
  });

  // TEST: partial updates keep the other fields, debug is coerced to boolean
  it('should merge partial updates', () => {
    setConfig({ maxLive: 3 });
    const c = setConfig({ debug: 1 as unknown as boolean });
    expect(c.maxLive).toBe(3);
    expect(c.debug).toBe(true);
  });

  // TEST: resetConfig returns to the defaults
  it('should reset', () => {
    setConfig({ maxLive: 2, debug: true });
    resetConfig();
    expect(getConfig().maxLive).toBe(6);
    expect(getConfig().debug).toBe(false);
  });
});
