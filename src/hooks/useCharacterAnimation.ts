import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Reaction } from '../audio/ForestAudio';
import type { AutomaticAction, CharacterAction, CharacterRequest } from '../character/types';

type Source = 'user' | 'environment';
type Action = Exclude<CharacterAction, 'idle'>;
export function useCharacterAnimation(active: boolean, request: CharacterRequest | null, onReact?: (kind: Reaction) => void) {
  const body = useRef<HTMLDivElement>(null), shadow = useRef<HTMLDivElement>(null);
  const enabled = useRef(active), locked = useRef(false);
  const source = useRef<Source | null>(null);
  const pending = useRef<AutomaticAction | null>(null);
  const drain = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const perform = useRef<(action: Action, origin: Source) => boolean>(() => false);
  const seenRequest = useRef(0);
  const [state, setState] = useState<CharacterAction>('idle');
  const [blink, setBlink] = useState(false);

  const reset = useCallback(() => {
    animation.current?.kill(); clearTimeout(drain.current);
    pending.current = null; locked.current = false; source.current = null;
    setState('idle'); setBlink(false);
    if (body.current) gsap.set(body.current, { clearProps: 'transform' });
    if (shadow.current) gsap.set(shadow.current, { clearProps: 'transform,opacity' });
  }, []);
  useEffect(() => {
    enabled.current = active;
    if (!active) reset();
    return () => { enabled.current = false; animation.current?.kill(); clearTimeout(drain.current); pending.current = null; };
  }, [active, reset]);
  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>, close: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!document.hidden && !locked.current) {
          setBlink(true); close = setTimeout(() => setBlink(false), 155);
        }
        schedule();
      }, 2400 + Math.random() * 3200);
    };
    schedule();
    const visibility = () => { if (document.hidden) reset(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(timer); clearTimeout(close); setBlink(false);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [active, reset]);

  const play = useCallback((action: Action, origin: Source) => {
    if (!enabled.current || !body.current || document.hidden) return false;
    if (locked.current) {
      if (origin === 'environment') { pending.current = action as AutomaticAction; return false; }
      if (source.current === 'user') return false;
      reset();
    }
    if (origin === 'user') { pending.current = null; clearTimeout(drain.current); }
    locked.current = true; source.current = origin;
    setState(action); setBlink(false);
    if (action === 'wave' || action === 'jump') onReact?.(action);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({
      onComplete: () => {
        locked.current = false; source.current = null; setState('idle');
        if (pending.current) drain.current = setTimeout(() => {
          const next = pending.current; pending.current = null;
          if (next) perform.current(next, 'environment');
        }, 100);
      },
    });
    animation.current = tl;
    if (reduced) {
      tl.to(body.current, { scale: 1.01, duration: .25 }).to(body.current, { scale: 1, duration: .25 });
    } else if (action === 'jump') {
      tl.to(body.current, { scaleY: .92, scaleX: 1.045, duration: .17 })
        .to(body.current, { y: -48, scaleY: 1.035, scaleX: .985, duration: .32, ease: 'power2.out' })
        .to(shadow.current, { scaleX: .68, scaleY: .8, opacity: .28, duration: .32 }, '<')
        .to(body.current, { y: 0, scaleY: .94, scaleX: 1.03, duration: .32, ease: 'power2.in', onComplete: () => onReact?.('land') })
        .to(shadow.current, { scaleX: 1.08, scaleY: 1, opacity: 1, duration: .32 }, '<')
        .to(body.current, { scaleY: 1, scaleX: 1, duration: .27 })
        .to(shadow.current, { scaleX: 1, duration: .27 }, '<');
    } else if (action === 'wave') {
      tl.to(body.current, { rotation: -2, duration: .2 })
        .to(body.current, { rotation: 2, duration: .22, repeat: 3, yoyo: true })
        .to(body.current, { rotation: 0, duration: .2 });
    } else if (action === 'lookUp') {
      tl.to(body.current, { scaleY: 1.015, rotation: -1, duration: .3 })
        .to(body.current, { duration: .75 })
        .to(body.current, { scaleY: 1, rotation: 0, duration: .3 });
    } else {
      tl.to(body.current, { rotation: -3, duration: .4, ease: 'sine.inOut' })
        .to(body.current, { duration: .65 })
        .to(body.current, { rotation: 0, duration: .35, ease: 'sine.inOut' });
    }
    return true;
  }, [onReact, reset]);
  useEffect(() => { perform.current = play; }, [play]);
  useEffect(() => {
    if (!active || !request || seenRequest.current === request.id) return;
    seenRequest.current = request.id; play(request.action, 'environment');
  }, [active, request, play]);
  const interact = useCallback(() => play(Math.random() < .5 ? 'wave' : 'jump', 'user'), [play]);
  return { body, shadow, state, blink, interact };
}
