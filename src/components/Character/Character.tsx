import { useRef, useState, type CSSProperties } from 'react';
import type { SceneConfig } from '../../scenes/types';
import type { Reaction } from '../../audio/ForestAudio';
import { useCharacterAnimation } from '../../hooks/useCharacterAnimation';

const sprites = {
  idle: '/assets/character/friend-reference.webp',
  blink: '/assets/character/friend-blink.webp',
  wave: '/assets/character/friend-wave.webp',
};

// The scene controls placement; this renderer owns only the sprite and semantic reactions.
export function Character({ scene, active, onReact }: {
  scene: SceneConfig;
  active: boolean;
  onReact?: (kind: Reaction) => void;
}) {
  const { body, shadow, state, blink, interact } = useCharacterAnimation(active, onReact);
  const [loaded, setLoaded] = useState({ idle: false, blink: false, wave: false });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const desired = state === 'wave' ? 'wave' : blink ? 'blink' : 'idle';
  const pose = loaded[desired] ? desired : 'idle';

  return <div className="character-position parallax" style={{
    left: `${scene.characterPosition.x}%`, top: `${scene.characterPosition.y}%`,
    '--depth': 20, '--character-scale': scene.characterScale,
    '--character-light': scene.characterLighting.filter,
    '--contact-opacity': scene.characterLighting.contactOpacity,
    '--rim-color': scene.characterLighting.rim,
  } as CSSProperties}>
    <div ref={shadow} className="character-shadow">
      <span className="ground-shadow" /><span className="contact-shadow" />
    </div>
    <button className={`character ${state}`} aria-label="和小黄人互动：挥手或跳跃"
      disabled={!active} data-state={state} data-pose={pose}
      onPointerDown={event => { dragStart.current = { x: event.clientX, y: event.clientY }; dragged.current = false; }}
      onPointerMove={event => {
        if (dragStart.current && Math.hypot(event.clientX - dragStart.current.x, event.clientY - dragStart.current.y) > 10)
          dragged.current = true;
      }}
      onPointerUp={() => { dragStart.current = null; }}
      onPointerCancel={() => { dragStart.current = null; dragged.current = true; }}
      onClick={event => { if (event.detail === 0 || !dragged.current) interact(); dragged.current = false; }}>
      <div ref={body} className="character-action">
        <div className="character-idle">
          <div className="character-render">
            {(Object.keys(sprites) as (keyof typeof sprites)[]).map(name =>
              <img key={name} className={`character-sprite pose-${name}`} src={sprites[name]}
                width="640" height="640" alt={name === 'idle' ? '蓝眼睛、白鞋子的黄色绒毛森林伙伴' : ''}
                aria-hidden={name !== 'idle'} draggable="false" data-visible={pose === name}
                onLoad={() => setLoaded(previous => ({ ...previous, [name]: true }))}
                onError={() => setLoaded(previous => ({ ...previous, [name]: false }))} />)}
            <span className="character-bounce-light" style={{ maskImage: `url(${sprites[pose]})` }} />
          </div>
        </div>
      </div>
    </button>
    <span className="character-hint">{state === 'idle' ? '来，打个招呼' : state === 'jump' ? '好开心！' : '你好呀！'}</span>
  </div>;
}
