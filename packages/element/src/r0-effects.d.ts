// Types for the R0 harness module that q1.test.ts reads as the source of truth (examples/r0/effects.js, plain ESM).
declare module '*/examples/r0/effects.js' {
  export const EFFECTS: unknown[];
  export function byId(id: string): unknown;
}
