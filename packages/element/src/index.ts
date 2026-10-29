/**
 * vitrine-shaders: <vitrine-shader>, a custom element that runs Paper Shaders on top of a plain <img>
 * in Liquid themes, static HTML and React 19. Powered by Paper Shaders (Apache-2.0), see NOTICE.
 */
export { VitrineShader, VITRINE_TAG, define } from './element.js';
export { EFFECTS, isEffect } from './effects/registry.js';
export { parseParamsAttribute, resolveParams, hashParams, stableStringify } from './params.js';
export type {
  VitrineEffect,
  VitrineReveal,
  VitrineMode,
  VitrineFallbackReason,
  VitrineParams,
  VitrineReadyDetail,
  VitrineFallbackDetail,
  VitrineConfig,
  VitrineStats,
  PresetDef,
  PresetFile,
} from './types.js';

/** Exact pinned version of @paper-design/shaders this build was made against (ADR-0001 §6). */
export const PAPER_SHADERS_VERSION = '0.0.82' as const;

import { define } from './element.js';
// Importing the package registers the element (no-op without `customElements`, e.g. during SSR).
define();
