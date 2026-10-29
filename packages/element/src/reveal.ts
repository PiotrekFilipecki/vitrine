/**
 * reveal="hover": the nearest link/card is the hover + focus surface (PLAN D6: hover = focus).
 * Mouse/pen: enter/leave. Touch: a tap reveals and stays revealed until a tap outside.
 * Keyboard: focusin/focusout on the surface (focus-within).
 */
export const REVEAL_ATTR = 'data-vitrine-revealed';

export function attachReveal(el: HTMLElement): () => void {
  const surface = (el.closest('a, [data-vitrine-card]') as HTMLElement | null) ?? el;
  const set = (on: boolean) => el.toggleAttribute(REVEAL_ATTR, on);

  let touchOutside: ((e: PointerEvent) => void) | null = null;
  const clearTouchOutside = () => {
    if (touchOutside) {
      document.removeEventListener('pointerdown', touchOutside, true);
      touchOutside = null;
    }
  };

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    set(true);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (!surface.matches(':focus-within')) set(false);
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    set(true);
    clearTouchOutside();
    touchOutside = (ev: PointerEvent) => {
      if (!surface.contains(ev.target as Node)) {
        set(false);
        clearTouchOutside();
      }
    };
    document.addEventListener('pointerdown', touchOutside, true);
  };
  const onFocusIn = () => set(true);
  const onFocusOut = (e: FocusEvent) => {
    if (e.relatedTarget instanceof Node && surface.contains(e.relatedTarget)) return;
    if (!surface.matches(':hover')) set(false);
  };

  surface.addEventListener('pointerenter', onEnter);
  surface.addEventListener('pointerleave', onLeave);
  surface.addEventListener('pointerdown', onDown);
  surface.addEventListener('focusin', onFocusIn);
  surface.addEventListener('focusout', onFocusOut);

  return () => {
    surface.removeEventListener('pointerenter', onEnter);
    surface.removeEventListener('pointerleave', onLeave);
    surface.removeEventListener('pointerdown', onDown);
    surface.removeEventListener('focusin', onFocusIn);
    surface.removeEventListener('focusout', onFocusOut);
    clearTouchOutside();
    set(false);
  };
}
