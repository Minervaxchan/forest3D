import type {CSSProperties} from 'react';
import type {SceneConfig} from '../../scenes/types';
import {useCharacterAnimation} from '../../hooks/useCharacterAnimation';
// Renderer boundary: scene placement stays unchanged when a GLB renderer replaces this.
export function Character({scene,active}:{scene:SceneConfig;active:boolean}){
  const {body,state,blink,interact}=useCharacterAnimation();
  return <div className="character-position parallax" style={{left:`${scene.characterPosition.x}%`,top:`${scene.characterPosition.y}%`,'--depth':20,'--character-scale':scene.characterScale} as CSSProperties}>
    <div className="character-shadow"/>
    <button className={`character ${state}`} aria-label="和小黄人互动：挥手或跳跃" disabled={!active} onClick={interact} data-state={state}>
      <div ref={body} className="character-action"><div className="character-idle">
        <img src="/assets/character/friend-reference.webp" width="640" height="640" alt="蓝眼睛、白鞋子的黄色绒毛森林伙伴" draggable="false"/>
        <span className={`eyelids ${blink?'closed':''}`}><i/><i/></span>
      </div></div>
    </button>
    <span className="character-hint">{state==='idle'?'来，打个招呼':state==='jump'?'好开心！':'你好呀！'}</span>
  </div>;
}
