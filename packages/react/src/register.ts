let registering: Promise<void> | null = null;

/**
 * Loads `vitrine-shaders` (which registers `<vitrine-shader>`) once, only in the browser, as a separate chunk.
 * Server render never touches it: the HTML it sends is a plain `<img>` inside an unknown element, which is a
 * working image. The effect arrives after hydration (PLAN D4, D8).
 */
export function registerVitrine(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  registering ??= import('vitrine-shaders').then(() => undefined);
  return registering;
}
