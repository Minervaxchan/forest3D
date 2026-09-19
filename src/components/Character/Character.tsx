import { useState, type CSSProperties } from 'react';
import type { SceneConfig } from '../../scenes/types';
import type { Reaction } from '../../audio/ForestAudio';
import { characterSprites, type CharacterRequest } from '../../character/types';
import { useCharacterAnimation } from '../../hooks/useCharacterAnimation';
import { useTap } from '../../hooks/useTap';

export function Character({ scene, active, onReact, request, hint, onInteract }: {
  scene: SceneConfig; active: boolean; onReact: (kind: Reaction) => void;
  request: CharacterRequest | null; hint: boolean; onInteract: () => void;
}) {
  const { body, shadow, state, blink, interact } = useCharacterAnimation(active, request, onReact);
  const [loaded, setLoaded] = useState({ idle: false, blink: false, wave: false, lookUp: false });
  const desired = state === 'wave' ? 'wave' : state === 'lookUp' ? 'lookUp' : blink || state === 'listen' ? 'blink' : 'idle';
  const pose = loaded[desired] ? desired : 'idle';
  const tap = useTap(() => { if (interact()) onInteract(); });
  const message = state === 'idle' ? (hint ? '轻触我，打个招呼' : '') :
    state === 'jump' ? '好开心！' : state === 'lookUp' ? '灯光真暖。' : state === 'listen' ? '听，森林在说话。' : '你好呀！';
  return <div className="character-position parallax" style={{
    left: `${scene.characterPosition.x}%`, top: `${scene.characterPosition.y}%`,
    '--depth': 20, '--character-scale': scene.characterScale,
    '--character-light': scene.characterLighting.filter,
    '--contact-opacity': scene.characterLighting.contactOpacity,
    '--rim-color': scene.characterLighting.rim,
  } as CSSProperties}>
    <div ref={shadow} className="character-shadow"><span className="ground-shadow" /><span className="contact-shadow" /></div>
    <button className={`character ${state}`} aria-label="和小黄人互动：挥手或跳跃"
      disabled={!active} data-state={state} data-pose={pose} {...tap}>
      <div ref={body} className="character-action"><div className="character-idle"><div className="character-render">
        {(Object.keys(characterSprites) as (keyof typeof characterSprites)[]).map(name =>
          <img key={name} className={`character-sprite pose-${name}`} src={characterSprites[name]}
            width="640" height="640" alt={name === 'idle' ? '蓝眼睛、白鞋子的黄色绒毛森林伙伴' : ''}
            aria-hidden={name !== 'idle'} draggable="false" data-visible={pose === name}
            onLoad={() => setLoaded(previous => ({ ...previous, [name]: true }))}
            onError={() => setLoaded(previous => ({ ...previous, [name]: false }))} />)}
        <span className="character-bounce-light" style={{ maskImage: `url(${characterSprites[pose]})` }} />
      </div></div></div>
    </button>
    <span className={`character-hint ${hint ? 'discovery-hint' : ''}`} data-visible={!!message}>{message}</span>
  </div>;
}
