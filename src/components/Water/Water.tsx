import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { SceneConfig } from '../../scenes/types';
import { useTap } from '../../hooks/useTap';

type Ripple = { id: number; x: number; y: number };
export function Water({ config, active, onInteract }: {
  config: SceneConfig['interactions']['water']; active: boolean; onInteract: () => void;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const soundTime = useRef(0);
  const tap = useTap(event => {
    if (!active) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const keyboard = event.detail === 0;
    const ripple = {
      id: ++sequence.current,
      x: keyboard ? 50 : (event.clientX - bounds.left) / bounds.width * 100,
      y: keyboard ? 50 : (event.clientY - bounds.top) / bounds.height * 100,
    };
    setRipples(previous => [...previous.slice(-2), ripple]);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setRipples([]), 1600);
    if (performance.now() >= soundTime.current) { soundTime.current = performance.now() + 300; onInteract(); }
  });
  useEffect(() => {
    if (!active) { setRipples([]); clearTimeout(timer.current); }
    return () => clearTimeout(timer.current);
  }, [active]);
  return <button className="water-surface parallax" aria-label="轻触溪流，泛起涟漪" disabled={!active}
    style={{ '--depth': config.depth, '--water-top': config.top + '%', '--water-height': config.height + '%',
      '--mobile-water-top': config.mobileTop + '%', '--mobile-water-height': config.mobileHeight + '%' } as CSSProperties}
    {...tap}>
    {ripples.map(ripple => <span key={ripple.id} className="water-ripple" aria-hidden="true"
      style={{ left: ripple.x + '%', top: ripple.y + '%' }}
      onAnimationEnd={() => setRipples(previous => previous.filter(item => item.id !== ripple.id))}><i /><i /></span>)}
  </button>;
}
