import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import type { SceneConfig } from '../../scenes/types';
import { useTap } from '../../hooks/useTap';

export function Mushrooms({ config, active, onInteract }: {
  config: SceneConfig['interactions']['mushroom']; active: boolean; onInteract: () => void;
}) {
  const glow = useRef<HTMLSpanElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const cooldown = useRef(0);
  const [ready, setReady] = useState(false);
  const tap = useTap(() => {
    if (!active || !ready || performance.now() < cooldown.current) return;
    cooldown.current = performance.now() + 650;
    onInteract();
    animation.current?.kill();
    animation.current = gsap.timeline()
      .to(glow.current, { opacity: 1, duration: .24 })
      .to(glow.current, { opacity: 0, duration: 1.9, ease: 'power1.out' });
  });
  useEffect(() => {
    if (!active) { animation.current?.kill(); gsap.set(glow.current, { opacity: 0 }); }
    return () => { animation.current?.kill(); };
  }, [active]);
  return <div className="mushroom-position parallax" style={{
    '--depth': config.depth, '--object-x': config.x + '%', '--object-y': config.y + '%',
    '--mobile-object-x': config.mobileX + '%', '--mobile-object-y': config.mobileY + '%',
    '--object-size': config.size + 'px', '--mobile-object-size': config.mobileSize + 'px',
  } as CSSProperties}>
    <button className="mushroom" aria-label="轻触蘑菇，让它发光" disabled={!active || !ready}
      style={{ opacity: ready ? 1 : 0 }} {...tap}>
      <span className="mushroom-ground" />
      <img src={config.src} width="480" height="480" alt="林间的两朵小蘑菇" draggable="false"
        onLoad={() => setReady(true)} onError={() => setReady(false)} />
      <span ref={glow} className="mushroom-glow" aria-hidden="true">
        <img src={config.src} width="480" height="480" alt="" />
      </span>
    </button>
  </div>;
}
