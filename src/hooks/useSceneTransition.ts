import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { forest } from '../scenes/forest';
import { loadScene } from '../scenes/registry';
import type { SceneId } from '../scenes/types';
import { getExperience, setExperience } from '../store/experienceStore';
import { prepareScene, warmOptionalAssets } from '../lib/resources';

export function useSceneTransition(entered: boolean) {
  const [scene, setScene] = useState(forest), [error, setError] = useState('');
  const [arrival, setArrival] = useState(0);
  const camera = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); tween.current?.kill(); };
  }, []);
  useLayoutEffect(() => {
    if (!entered) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    tween.current = gsap.fromTo(camera.current,
      { opacity: 0, scale: reduced ? 1 : 1.065, filter: reduced ? 'none' : 'blur(5px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: reduced ? .18 : 1.1, ease: 'power2.out',
        onComplete: () => { setExperience({ transitioning: false }); setArrival(value => value + 1); } });
    return () => { tween.current?.kill(); };
  }, [scene, entered]);

  const go = useCallback(async (id: SceneId) => {
    if (!getExperience().entered || getExperience().transitioning || id === scene.id) return;
    setExperience({ transitioning: true }); setError('');
    controller.current?.abort();
    const operation = new AbortController();
    controller.current = operation;
    try {
      const next = await loadScene(id);
      await prepareScene(next, operation.signal);
      if (!mounted.current || operation.signal.aborted) return;
      warmOptionalAssets(next, operation.signal);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      tween.current = gsap.to(camera.current, {
        opacity: 0, scale: reduced ? 1 : 1.045, filter: reduced ? 'none' : 'blur(6px)',
        duration: reduced ? .15 : .6,
        onComplete: () => { setScene(next); setExperience({ scene: next.id }); },
      });
    } catch {
      if (!mounted.current || operation.signal.aborted) return;
      operation.abort(); setError('场景暂时没有加载成功，请再试一次。');
      setExperience({ transitioning: false });
    }
  }, [scene.id]);
  return { scene, camera, arrival, error, go };
}
