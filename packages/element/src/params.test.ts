import { describe, expect, it } from 'vitest';
import { hashParams, num, parseParamsAttribute, resolveParams, stableStringify } from './params.js';
import type { PresetDef } from './types.js';

const presets: Record<string, PresetDef> = {
  default: { name: 'Default', params: { colorBack: '#000c38', size: 2, speed: 0, fit: 'cover' } },
  newsprint: { name: 'Newsprint', params: { colorBack: '#151311', size: 2, speed: 0, fit: 'cover' } },
};

describe('parseParamsAttribute', () => {
  it('should return an empty object for a missing or blank attribute', () => {
    expect(parseParamsAttribute(null)).toEqual({});
    expect(parseParamsAttribute('  ')).toEqual({});
  });

  it('should keep strings, finite numbers, booleans and string arrays only', () => {
    // Arrange
    const raw = JSON.stringify({
      a: 's',
      b: 1.5,
      c: true,
      d: ['#fff', '#000'],
      e: null,
      f: { x: 1 },
      g: [1, 2],
    });
    // Act
    const out = parseParamsAttribute(raw);
    // Assert
    expect(out).toEqual({ a: 's', b: 1.5, c: true, d: ['#fff', '#000'] });
  });

  it('should return null for invalid JSON or non-objects', () => {
    expect(parseParamsAttribute('{bad')).toBeNull();
    expect(parseParamsAttribute('[1,2]')).toBeNull();
    expect(parseParamsAttribute('"str"')).toBeNull();
  });
});

describe('resolveParams', () => {
  it('should layer default ← preset ← params ← speed attribute', () => {
    const r = resolveParams(presets, 'newsprint', { size: 3 }, '0.5');
    expect(r.params).toEqual({ colorBack: '#151311', size: 3, speed: 0.5, fit: 'cover' });
    expect(r.presetId).toBe('newsprint');
    expect(r.presetKnown).toBe(true);
  });

  it('should fall back to default for an unknown preset and report it', () => {
    const r = resolveParams(presets, 'nope', {}, null);
    expect(r.params['colorBack']).toBe('#000c38');
    expect(r.presetId).toBe('default');
    expect(r.presetKnown).toBe(false);
  });

  it('should ignore a non-numeric speed attribute', () => {
    expect(resolveParams(presets, 'default', {}, 'fast').params['speed']).toBe(0);
  });
});

describe('hashParams / stableStringify', () => {
  it('should hash equal params equally regardless of key order', () => {
    expect(hashParams({ a: 1, b: 'x' })).toBe(hashParams({ b: 'x', a: 1 }));
    expect(stableStringify({ b: [1, { d: 1, c: 2 }], a: 1 })).toBe('{"a":1,"b":[1,{"c":2,"d":1}]}');
  });

  it('should produce different hashes for different values', () => {
    expect(hashParams({ size: 2 })).not.toBe(hashParams({ size: 3 }));
    expect(hashParams({ size: 2 })).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('num', () => {
  it('should coerce numeric strings and keep the fallback otherwise', () => {
    expect(num('2.5', 0)).toBe(2.5);
    expect(num('abc', 7)).toBe(7);
    expect(num(true, 7)).toBe(7);
    expect(num(undefined, 7)).toBe(7);
  });
});
