import type {SceneConfig} from '../../scenes/types';
export function SceneSwitcher({scene,disabled,onSwitch}:{scene:SceneConfig;disabled:boolean;onSwitch:()=>void}){
  return <button className="glass-button scene-switcher" disabled={disabled} onClick={onSwitch} aria-label={`切换至${scene.id==='forest'?'萤火之森':'日光森林'}`}><span className="scene-icon" aria-hidden="true">{scene.id==='forest'?'☾':'☀'}</span><span>{scene.id==='forest'?'去看萤火':'走向日光'}</span><span aria-hidden="true">↗</span></button>;
}
