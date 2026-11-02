/**
 * Reveal surface (PLAN D6: hover = focus; Q1 adds `tap`).
 *
 * reveal="hover" (v0.1 behaviour, unchanged): the nearest card/link is the hover + focus surface. Mouse/pen:
 *   enter/leave. Touch: a tap reveals and stays revealed until a tap outside. Keyboard: focus-within.
 * reveal="tap" (Q1): click/tap toggles; nothing happens on hover or focus.
 * Both: Enter or Space on a focusable surface that is not a link toggles (a link keeps Enter for navigation).
 * `consumeFirstTap` (glass): on a link, the touch tap that opens the glass does not navigate; the next one does.
 */
export const REVEAL_ATTR = 'data-vitrine-revealed';

export type RevealMode = 'hover' | 'tap';

/** What opened or closed the surface: glass "doors" peek on a pointer and open fully on everything else. */
export type RevealVia = 'pointer' | 'touch' | 'click' | 'focus' | 'key' | 'outside';

export interface RevealOptions {
  mode?: RevealMode;
  /** Called on every state change (glass runs its transition from here). */
  onChange?: (on: boolean, via: RevealVia) => void;
  consumeFirstTap?: boolean;
}

function revealSurface(el: HTMLElement): HTMLElement {
  // An explicit card marker wins over the nearest link: in themes like Horizon the image sits inside a
  // `display: contents` link that cannot take focus, while the keyboard-reachable link is a sibling. Marking
  // the card root with data-vitrine-card makes hover, tap and focus-within work on the whole card.
  return (
    (el.closest('[data-vitrine-card]') as HTMLElement | null) ?? (el.closest('a') as HTMLElement | null) ?? el
  );
}

export function attachReveal(el: HTMLElement, opts: RevealOptions = {}): () => void {
  const mode = opts.mode ?? 'hover';
  const surface = revealSurface(el);
  const isLink = (node: EventTarget | null) => node instanceof Element && node.closest('a[href]') !== null;
  let on = el.hasAttribute(REVEAL_ATTR);
  const set = (next: boolean, via: RevealVia) => {
    el.toggleAttribute(REVEAL_ATTR, next);
    if (next === on) return;
    on = next;
    opts.onChange?.(next, via);
  };

  let touchOutside: ((e: PointerEvent) => void) | null = null;
  const clearTouchOutside = () => {
    if (touchOutside) {
      document.removeEventListener('pointerdown', touchOutside, true);
      touchOutside = null;
    }
  };
  const closeOnOutsideTouch = () => {
    clearTouchOutside();
    touchOutside = (ev: PointerEvent) => {
      if (!surface.contains(ev.target as Node)) {
        set(false, 'outside');
        clearTouchOutside();
      }
    };
    document.addEventListener('pointerdown', touchOutside, true);
  };

  // The click that follows the opening touch tap on a link is cancelled (glass only).
  let consumeClick = false;
  let consumeTimer: ReturnType<typeof setTimeout> | null = null;
  const armConsume = () => {
    consumeClick = true;
    if (consumeTimer) clearTimeout(consumeTimer);
    consumeTimer = setTimeout(() => (consumeClick = false), 800);
  };

  const onEnter = (e: PointerEvent) => {
    if (mode !== 'hover' || e.pointerType === 'touch') return;
    set(true, 'pointer');
  };
  const onLeave = (e: PointerEvent) => {
    if (mode !== 'hover' || e.pointerType === 'touch') return;
    if (!surface.matches(':focus-within')) set(false, 'pointer');
  };
  const onDown = (e: PointerEvent) => {
    if (mode !== 'hover' || e.pointerType !== 'touch') return;
    if (!on && opts.consumeFirstTap && isLink(e.target)) armConsume();
    set(true, 'touch');
    closeOnOutsideTouch();
  };
  const onClick = (e: MouseEvent) => {
    if (consumeClick) {
      consumeClick = false;
      e.preventDefault();
      return;
    }
    if (mode !== 'tap') return;
    if (!on) {
      // First tap or click opens; on a link it does not navigate yet.
      if (isLink(e.target)) e.preventDefault();
      set(true, 'click');
      closeOnOutsideTouch();
    } else if (!isLink(e.target)) {
      set(false, 'click');
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target !== surface || isLink(surface) || e.repeat) return;
    if (e.key === ' ') e.preventDefault();
    set(!on, 'key');
  };
  const onFocusIn = () => {
    if (mode === 'hover') set(true, 'focus');
  };
  const onFocusOut = (e: FocusEvent) => {
    if (e.relatedTarget instanceof Node && surface.contains(e.relatedTarget)) return;
    if (mode === 'tap' || !surface.matches(':hover')) set(false, 'focus');
  };

  surface.addEventListener('pointerenter', onEnter);
  surface.addEventListener('pointerleave', onLeave);
  surface.addEventListener('pointerdown', onDown);
  surface.addEventListener('click', onClick);
  surface.addEventListener('keydown', onKey);
  surface.addEventListener('focusin', onFocusIn);
  surface.addEventListener('focusout', onFocusOut);
  // Setup re-runs when the box resizes (late fonts, theme editor) and tears the previous reveal down;
  // a focus that already happened fires no new focusin, so read the current state instead of waiting.
  if (mode === 'hover' && surface.matches(':focus-within')) set(true, 'focus');
  else if (mode === 'hover' && surface.matches(':hover')) set(true, 'pointer');

  return () => {
    surface.removeEventListener('pointerenter', onEnter);
    surface.removeEventListener('pointerleave', onLeave);
    surface.removeEventListener('pointerdown', onDown);
    surface.removeEventListener('click', onClick);
    surface.removeEventListener('keydown', onKey);
    surface.removeEventListener('focusin', onFocusIn);
    surface.removeEventListener('focusout', onFocusOut);
    if (consumeTimer) clearTimeout(consumeTimer);
    clearTouchOutside();
    el.toggleAttribute(REVEAL_ATTR, false);
    on = false;
  };
}
