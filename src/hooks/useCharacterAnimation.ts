import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Reaction } from '../audio/ForestAudio';

export function useCharacterAnimation(active: boolean, onReact?: (kind: Reaction) => void) {
  const body = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const [state, setState] = useState<'idle' | 'wave' | 'jump'>('idle');
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>, close: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!document.hidden && !locked.current) {
          setBlink(true);
          close = setTimeout(() => setBlink(false), 155);
        }
        schedule();
      }, 2400 + Math.random() * 3200);
    };
    schedule();
    return () => { clearTimeout(timer); clearTimeout(close); setBlink(false); };
  }, [active]);

  useEffect(() => {
    if (!active) {
      animation.current?.kill();
      locked.current = false;
      setState('idle'); setBlink(false);
      gsap.set(body.current, { clearProps: 'transform' });
      gsap.set(shadow.current, { clearProps: 'transform,opacity' });
    }
    return () => { animation.current?.kill(); };
  }, [active]);

  const interact = useCallback(() => {
    if (!active || locked.current || !body.current) return;
    locked.current = true; setBlink(false);
    const next = Math.random() < .5 ? 'wave' : 'jump';
    setState(next); onReact?.(next);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({ onComplete: () => { locked.current = false; setState('idle'); } });
    animation.current = tl;
    if (reduced) {
      tl.to(body.current, { scale: 1.015, duration: .25 })
        .to(body.current, { scale: 1, duration: .25 });
    } else if (next === 'jump') {
      tl.to(body.current, { scaleY: .92, scaleX: 1.045, duration: .17 })
        .to(body.current, { y: -48, scaleY: 1.035, scaleX: .985, duration: .32, ease: 'power2.out' })
        .to(shadow.current, { scaleX: .68, scaleY: .8, opacity: .28, duration: .32 }, '<')
        .to(body.current, { y: 0, scaleY: .94, scaleX: 1.03, duration: .32, ease: 'power2.in', onComplete: () => onReact?.('land') })
        .to(shadow.current, { scaleX: 1.08, scaleY: 1, opacity: 1, duration: .32 }, '<')
        .to(body.current, { scaleY: 1, scaleX: 1, duration: .27 })
        .to(shadow.current, { scaleX: 1, duration: .27 }, '<');
    } else {
      tl.to(body.current, { rotation: -2, duration: .2 })
        .to(body.current, { rotation: 2, duration: .22, repeat: 3, yoyo: true })
        .to(body.current, { rotation: 0, duration: .2 });
    }
  }, [active, onReact]);
  return { body, shadow, state, blink, interact };
}
