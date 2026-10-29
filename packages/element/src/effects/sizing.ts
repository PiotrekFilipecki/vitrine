import { ShaderFitOptions, type ShaderFit } from '#paper/shader-sizing.js';
import { num, str } from '../params.js';
import type { VitrineParams } from '../types.js';

/** Sizing uniforms exactly as every shaders-react component builds them (0.0.82). */
export function sizingUniforms(p: VitrineParams, defaults: VitrineParams) {
  const fit = str(p['fit'], str(defaults['fit'], 'contain'));
  const fitKey: ShaderFit = fit === 'none' || fit === 'cover' || fit === 'contain' ? fit : 'contain';
  return {
    u_fit: ShaderFitOptions[fitKey],
    u_rotation: num(p['rotation'], num(defaults['rotation'], 0)),
    u_scale: num(p['scale'], num(defaults['scale'], 1)),
    u_offsetX: num(p['offsetX'], num(defaults['offsetX'], 0)),
    u_offsetY: num(p['offsetY'], num(defaults['offsetY'], 0)),
    u_originX: num(p['originX'], num(defaults['originX'], 0.5)),
    u_originY: num(p['originY'], num(defaults['originY'], 0.5)),
    u_worldWidth: num(p['worldWidth'], num(defaults['worldWidth'], 0)),
    u_worldHeight: num(p['worldHeight'], num(defaults['worldHeight'], 0)),
  };
}
