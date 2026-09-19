import { useRef, type MouseEvent, type PointerEvent } from 'react';

// Capture touch drags so leaving a small target cannot turn a drag into a click.
export function useTap(activate: (event: MouseEvent<HTMLButtonElement>) => void) {
  const origin = useRef<{ x: number; y: number; pointer: number } | null>(null);
  const moved = useRef(false);
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      origin.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
      moved.current = false;
      if (event.isTrusted) {
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic/unsupported pointer. */ }
      }
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const start = origin.current;
      if (start && start.pointer === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10)
        moved.current = true;
    },
    onPointerUp: () => { origin.current = null; },
    onPointerCancel: () => { origin.current = null; moved.current = true; },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0 || !moved.current) activate(event);
      moved.current = false;
    },
  };
}
